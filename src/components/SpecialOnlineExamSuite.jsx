import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Video, 
  Camera, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Upload, 
  Trash2, 
  Sparkles, 
  Eye, 
  X, 
  Send, 
  UserCheck, 
  FileCheck,
  Building,
  RefreshCw,
  Crown
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export default function SpecialOnlineExamSuite({ 
  isOpen, 
  onClose, 
  studentUser = null,
  isInvigilator = true 
}) {
  const { students, classes, sendPrivateNotification } = useSchool();
  const { currentUser, isPrincipal, isVicePrincipal } = useAuth();

  // Active View: 'exam_room' | 'request_flow'
  const [currentView, setCurrentView] = useState('exam_room');
  
  // Requisition Form State
  const [requisitionForm, setRequisitionForm] = useState({
    candidateId: students[0]?.id || '',
    subject: 'Chemistry - Unit Assessment',
    examDate: new Date().toISOString().split('T')[0],
    durationMinutes: 45,
    exceptionalReason: 'Medical isolation / National sports event representation',
    vpApproved: true,
    principalApproved: true
  });

  // Proctored Exam Room State
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(45 * 60);
  const [isExamStarted, setIsExamStarted] = useState(true);
  const [proctorStream, setProctorStream] = useState(null);
  
  // AI Proctoring Anomalies & Environment Detection
  const [anomalyLog, setAnomalyLog] = useState([
    { id: 1, time: '10:02 AM', alert: 'Room lighting & microphone baseline verified', severity: 'info' }
  ]);
  const [multiPersonDetected, setMultiPersonDetected] = useState(false);
  const [externalNoiseAlert, setExternalNoiseAlert] = useState(false);

  // Question Paper & Uploaded Answer Sheets
  const [questionPaper, setQuestionPaper] = useState({
    title: 'Chemistry Special Term Assessment 2026',
    maxMarks: 50,
    instructions: 'Answer all questions in legible handwriting on paper. Scan and upload sheets before the countdown timer expires.',
    questions: [
      '1. State Raoult\'s Law for solutions of volatile liquids (3 Marks)',
      '2. Differentiate between ideal and non-ideal solutions with examples (5 Marks)',
      '3. Calculate the osmotic pressure of 5% glucose solution at 27°C (4 Marks)',
      '4. Explain Faraday\'s laws of electrolysis with relevant mathematical expressions (6 Marks)',
      '5. Write the chemical reactions involved in Daniel cell (5 Marks)'
    ]
  });

  // Student Handwritten Answer Sheets
  const [scannedAnswerSheets, setScannedAnswerSheets] = useState([]);
  const [isScanningSheet, setIsScanningSheet] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [toast, setToast] = useState(null);

  const videoRef = useRef(null);

  const targetStudent = students.find(s => s.id === requisitionForm.candidateId) || studentUser || students[0];

  // Initialize Invigilator / Candidate Proctored Camera
  useEffect(() => {
    let s = null;
    const initCam = async () => {
      try {
        s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true
        });
        setProctorStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
      } catch (e) {
        console.warn('Proctoring webcam warning:', e);
      }
    };

    if (isOpen) {
      initCam();
    }

    return () => {
      if (s) s.getTracks().forEach(t => t.stop());
    };
  }, [isOpen]);

  // Exam Countdown Timer
  useEffect(() => {
    let timer = null;
    if (isExamStarted && timeLeftSeconds > 0 && !isSubmitted) {
      timer = setInterval(() => {
        setTimeLeftSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isExamStarted, timeLeftSeconds, isSubmitted]);

  // Simulate Environment & Multiple Person Detection Check
  const triggerSimulatedAnomaly = (type) => {
    if (type === 'person') {
      setMultiPersonDetected(true);
      setAnomalyLog(prev => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          alert: '⚠️ Multiple persons / parent presence detected in candidate video frame!',
          severity: 'critical'
        },
        ...prev
      ]);
      setTimeout(() => setMultiPersonDetected(false), 5000);
    } else if (type === 'noise') {
      setExternalNoiseAlert(true);
      setAnomalyLog(prev => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          alert: '🔊 External acoustic anomaly / background voice whispering flagged',
          severity: 'warning'
        },
        ...prev
      ]);
      setTimeout(() => setExternalNoiseAlert(false), 4000);
    }
  };

  // Capture Answer Sheet via Camera
  const captureAnswerSheet = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const photoUrl = canvas.toDataURL('image/jpeg', 0.85);

    const sheetNum = scannedAnswerSheets.length + 1;
    const newSheet = {
      id: `sheet-${sheetNum}-${Date.now()}`,
      pageNumber: sheetNum,
      timestamp: new Date().toLocaleTimeString(),
      url: photoUrl
    };

    setScannedAnswerSheets(prev => [...prev, newSheet]);
    setIsScanningSheet(false);
    setToast(`Answer Sheet Page #${sheetNum} captured and attached!`);
    setTimeout(() => setToast(null), 2500);
  };

  // Final Submission
  const handleFinalSubmit = () => {
    if (scannedAnswerSheets.length === 0) {
      alert('Khawngaihin i exam chhanna (Answer Sheet) page 1 tal camera hmangin scan la, attach rawh le.');
      return;
    }

    setIsSubmitted(true);
    sendPrivateNotification({
      title: `📝 Special Online Exam Submitted: ${targetStudent.firstName} ${targetStudent.lastName}`,
      content: `${targetStudent.firstName} has submitted ${scannedAnswerSheets.length} handwritten answer sheet(s) for ${questionPaper.title}. Proctored video conference completed.`,
      category: 'academic',
      priority: 'high',
      targetAudience: 'role',
      recipientRole: 'principal',
      senderId: 'online_exam_proctor',
      publishedBy: 'Special Exam Invigilation System',
      channels: { inApp: true, push: true }
    });
  };

  if (!isOpen) return null;

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-6xl h-[94vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm font-['Outfit']">
                  Special Online Proctored Examination Suite
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  VP &amp; Principal Sanctioned
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Candidate: <strong className="text-white">{targetStudent.firstName} {targetStudent.lastName}</strong> ({targetStudent.admissionNo}) • Invigilator: {currentUser?.displayName || 'Dr. C. Zoramthanga'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Exam Countdown Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-cyan-300">
              <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Time Left: {formatTimer(timeLeftSeconds)}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/30 text-xs font-bold py-2 text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{toast}</span>
          </div>
        )}

        {/* Main Grid: Left 6 Cols (Video & AI Proctoring), Right 6 Cols (Question Paper & Answer Sheet Scanner) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
          {/* LEFT 6 COLS: Live Video Conference & AI Proctoring Stream */}
          <div className="lg:col-span-6 flex flex-col min-h-0 space-y-3">
            <div className="relative flex-1 rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Anomaly Live Alerts Overlay */}
              {multiPersonDetected && (
                <div className="absolute top-4 left-4 right-4 p-3 rounded-2xl bg-rose-500/90 text-white text-xs font-bold flex items-center gap-2 shadow-2xl animate-bounce">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>⚠️ AI Flag: Multiple faces detected! Candidate must be alone in room.</span>
                </div>
              )}

              {externalNoiseAlert && (
                <div className="absolute top-16 left-4 right-4 p-2.5 rounded-2xl bg-amber-500/90 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-2xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>🔊 Acoustic Alert: External voice talking detected!</span>
                </div>
              )}

              {/* Proctoring Status Pill */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-[10px] font-bold text-emerald-400 border border-white/10 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Live Video Invigilation Active</span>
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-white/10">
                  Room ID: EXAM-SPEC-2026
                </span>
              </div>
            </div>

            {/* AI Environmental Anomaly Log & Test Triggers */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-['Outfit']">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI Proctoring Anomaly Audit</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => triggerSimulatedAnomaly('person')}
                    className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold transition"
                  >
                    Test Multi-Person
                  </button>
                  <button
                    onClick={() => triggerSimulatedAnomaly('noise')}
                    className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition"
                  >
                    Test Audio Noise
                  </button>
                </div>
              </div>

              <div className="space-y-1 max-h-20 overflow-y-auto text-[11px]">
                {anomalyLog.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-slate-400">
                    <span className={item.severity === 'critical' ? 'text-rose-400 font-bold' : item.severity === 'warning' ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                      {item.alert}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT 6 COLS: Question Paper & Answer Sheet Scanner */}
          <div className="lg:col-span-6 flex flex-col min-h-0 space-y-3">
            {isSubmitted ? (
              <div className="flex-1 p-8 rounded-3xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-white font-['Outfit']">Examination Submitted Successfully!</h4>
                <p className="text-xs text-slate-300 max-w-sm">
                  {scannedAnswerSheets.length} answer sheet(s) have been verified and sealed. 
                  The Chief Invigilator and Assessment Board have received your submission.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow transition"
                >
                  Exit Exam Room
                </button>
              </div>
            ) : (
              <>
                {/* Question Paper Card */}
                <div className="flex-1 rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-3 overflow-y-auto min-h-0">
                  <div className="border-b border-slate-800 pb-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-white text-sm font-['Outfit']">{questionPaper.title}</h4>
                      <span className="text-xs font-mono text-amber-400 font-bold">Max Marks: {questionPaper.maxMarks}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{questionPaper.instructions}</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    {questionPaper.questions.map((q, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-slate-200">
                        {q}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Answer Sheet Scanner & Attachment Panel */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-white text-xs font-['Outfit'] flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Handwritten Answer Sheets ({scannedAnswerSheets.length} Pages Attached)</span>
                      </h5>
                      <span className="text-[10px] text-slate-400">Scan each handwritten page before camera</span>
                    </div>

                    <button
                      onClick={captureAnswerSheet}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Capture Page #{scannedAnswerSheets.length + 1}</span>
                    </button>
                  </div>

                  {/* Scanned Pages Thumbnails */}
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {scannedAnswerSheets.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic py-2">
                        No pages scanned yet. Click "Capture Page" while holding your answer sheet to the webcam.
                      </p>
                    ) : (
                      scannedAnswerSheets.map(sheet => (
                        <div key={sheet.id} className="relative shrink-0 w-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
                          <img src={sheet.url} alt="" className="w-20 h-24 object-cover" />
                          <div className="p-1 text-[9px] font-mono text-center bg-black/70 text-slate-300">
                            Page #{sheet.pageNumber}
                          </div>
                          <button
                            onClick={() => setScannedAnswerSheets(prev => prev.filter(s => s.id !== sheet.id))}
                            className="absolute top-1 right-1 p-0.5 rounded bg-rose-500/80 text-white text-[9px]"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Final Submit Button */}
                  <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                    <button
                      onClick={handleFinalSubmit}
                      disabled={scannedAnswerSheets.length === 0}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Handwritten Exam Paper ({scannedAnswerSheets.length} Pages)</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
