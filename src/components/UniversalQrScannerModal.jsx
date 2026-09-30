import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  Volume2, 
  VolumeX, 
  User, 
  Phone, 
  Video, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Check, 
  FileText, 
  CreditCard, 
  Search, 
  Upload, 
  GraduationCap, 
  Droplet,
  ExternalLink,
  Sliders
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useSchool } from '../context/SchoolContext';
import { parseStudentQrText } from '../lib/qrCodeService';

export default function UniversalQrScannerModal({ 
  isOpen, 
  onClose,
  onStudentSelected = null,
  onOpenIdCard = null
}) {
  const { 
    students = [], 
    classes = [], 
    attendance = [], 
    markAttendance,
    startPrivateCall,
    activeSchoolInfo
  } = useSchool();

  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'upload' | 'manual'
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' | 'user'
  const [audioBeep, setAudioBeep] = useState(true);
  const [manualQuery, setManualQuery] = useState('');
  
  // Scanned payload & student result
  const [scannedResult, setScannedResult] = useState(null);
  const [scannedStudent, setScannedStudent] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const [sessionScanHistory, setSessionScanHistory] = useState([]);

  const html5QrCodeRef = useRef(null);
  const isStoppingRef = useRef(false);

  // Play pleasant positive chime
  const playChime = (type = 'success') => {
    if (!audioBeep) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      if (type === 'success') {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.12); // E6
      } else {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(330, audioCtx.currentTime + 0.1);
      }
      
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch (e) {
      console.warn('Audio chime note:', e);
    }
  };

  // Start Camera
  const startCamera = async (facing = cameraFacing) => {
    if (isStoppingRef.current) return;
    setScannerError(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('universal-qr-viewfinder');
      }

      // If already scanning, stop first
      if (html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }

      const qrSuccessCallback = (decodedText) => {
        handleQrDetected(decodedText);
      };

      const qrErrorCallback = (errorMessage) => {
        // frame decode failure, normal while pointing camera
      };

      await html5QrCodeRef.current.start(
        { facingMode: facing },
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        qrSuccessCallback,
        qrErrorCallback
      );
      setIsScanning(true);
    } catch (err) {
      console.warn('QR camera start warning:', err);
      setScannerError('Unable to access camera. Please grant camera permission or use photo upload / manual ID search.');
      setIsScanning(false);
    }
  };

  // Stop Camera
  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      isStoppingRef.current = true;
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.warn('Error stopping QR scanner:', err);
      } finally {
        isStoppingRef.current = false;
        setIsScanning(false);
      }
    }
  };

  // Manage camera lifecycle based on modal visibility and tab
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      const timer = setTimeout(() => {
        startCamera(cameraFacing);
      }, 300);
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [isOpen, activeTab, cameraFacing]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  if (!isOpen) return null;

  // Process detected QR text
  const handleQrDetected = (rawText) => {
    playChime('success');
    
    // Parse via standardized QR service
    const parsed = parseStudentQrText(rawText);
    setScannedResult({ raw: rawText, parsed });

    // Match student from loaded students list
    let matchedStudent = null;
    if (parsed.success && parsed.data) {
      const p = parsed.data;
      matchedStudent = students.find(s => 
        s.id === p.studentId || 
        (s.rollNo && String(s.rollNo) === String(p.rollNo) && s.classId === p.classId)
      );
    }

    if (!matchedStudent) {
      // Try raw text matching student ID or roll number
      const cleanText = rawText.trim();
      matchedStudent = students.find(s => 
        s.id.toLowerCase() === cleanText.toLowerCase() ||
        (s.admissionNo && s.admissionNo.toLowerCase() === cleanText.toLowerCase()) ||
        (s.rollNo && String(s.rollNo) === cleanText)
      );
    }

    if (matchedStudent) {
      setScannedStudent(matchedStudent);
      setActionNotice({
        type: 'found',
        message: `Recognized: ${matchedStudent.firstName} ${matchedStudent.lastName} (Roll #${matchedStudent.rollNo || matchedStudent.rollNumber})`
      });

      // Add to session scan history if not already top
      setSessionScanHistory(prev => {
        const filtered = prev.filter(item => item.student.id !== matchedStudent.id);
        return [{ student: matchedStudent, timestamp: new Date().toLocaleTimeString(), scanId: Date.now() }, ...filtered];
      });
    } else {
      // Check if it's an admit card pass or unknown
      try {
        const json = JSON.parse(rawText);
        if (json.type === 'admit_card_verification') {
          const admStudent = students.find(s => s.id === json.studentId);
          if (admStudent) {
            setScannedStudent(admStudent);
            setActionNotice({
              type: 'found',
              message: `Admit Card Verified: ${admStudent.firstName} ${admStudent.lastName} — Exam: ${json.examName || 'Board Exam'}`
            });
            return;
          }
        }
      } catch (e) {}

      setScannedStudent(null);
      setActionNotice({
        type: 'warning',
        message: `Scanned raw code: "${rawText.slice(0, 36)}...". No direct student record matched.`
      });
    }
  };

  // Switch Camera facing (Back / Front)
  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
  };

  // Mark student attendance directly from scanner
  const handleMarkAttendanceFromScan = (status = 'present') => {
    if (!scannedStudent) return;
    const today = new Date().toISOString().split('T')[0];

    markAttendance({
      studentId: scannedStudent.id,
      classId: scannedStudent.classId,
      date: today,
      status: status,
      method: 'in_app_qr_scanner',
      markedAt: new Date().toLocaleTimeString(),
      verified: true
    });

    playChime('success');
    setActionNotice({
      type: 'success',
      message: `Marked ${status.toUpperCase()} for ${scannedStudent.firstName} on ${today}!`
    });
  };

  // Handle image file scan
  const handleImageUploadScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('universal-qr-viewfinder-file');
      }
      const decodedText = await html5QrCodeRef.current.scanFile(file, true);
      handleQrDetected(decodedText);
    } catch (err) {
      console.warn('File QR scan error:', err);
      setActionNotice({
        type: 'warning',
        message: 'Could not detect a clear QR code in this photo. Please ensure good lighting and contrast.'
      });
    }
  };

  // Manual search submit
  const handleManualSearch = (e) => {
    e?.preventDefault();
    if (!manualQuery.trim()) return;
    handleQrDetected(manualQuery.trim());
  };

  const studentClass = scannedStudent ? classes.find(c => c.id === scannedStudent.classId) : null;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = scannedStudent ? attendance.find(a => a.studentId === scannedStudent.id && a.date === todayStr) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                  Universal Student QR Scanner
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold font-mono border border-cyan-500/30">
                  LIVE IN-APP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Scan Student ID cards, Admit cards &amp; Gate passes using your device camera
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAudioBeep(!audioBeep)}
              className={`p-2 rounded-xl border transition ${
                audioBeep 
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={audioBeep ? 'Chime sound enabled' : 'Chime muted'}
            >
              {audioBeep ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('camera')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'camera'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Live Camera Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo / File</span>
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'manual'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Manual ID / Quick Test</span>
            </button>
          </div>

          {activeTab === 'camera' && (
            <button
              onClick={toggleCameraFacing}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition"
              title="Switch camera between Back / Front"
            >
              <RefreshCw className="w-3 h-3 text-cyan-400" />
              <span>Flip ({cameraFacing === 'environment' ? 'Back' : 'Front'})</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column: Viewfinder or Input Panel (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            
            {activeTab === 'camera' && (
              <div className="relative rounded-2xl bg-black border border-slate-800 overflow-hidden min-h-[300px] flex items-center justify-center">
                {/* HTML5 QR Code Container */}
                <div id="universal-qr-viewfinder" className="w-full h-full min-h-[300px]" />

                {/* Laser animation overlay */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-56 h-56 border-2 border-cyan-400/80 rounded-2xl relative shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                      {/* Animated scanning line */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute top-0 animate-[pulse_1.5s_ease-in-out_infinite]" />
                      
                      {/* Corner Accents */}
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                    </div>
                    <span className="mt-3 text-[11px] font-mono text-cyan-300 font-bold bg-black/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                      POINT CAMERA AT STUDENT QR CODE
                    </span>
                  </div>
                )}

                {scannerError && (
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <AlertCircle className="w-10 h-10 text-amber-400" />
                    <p className="text-sm text-slate-300 max-w-sm">{scannerError}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startCamera(cameraFacing)}
                        className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                      >
                        Retry Camera
                      </button>
                      <button
                        onClick={() => setActiveTab('manual')}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs"
                      >
                        Use Manual Search
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="p-8 rounded-2xl bg-slate-950/60 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 transition flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Upload Student ID Photo</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select a photo or screenshot of the student ID card containing a QR code
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUploadScan}
                  className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500 file:text-slate-950 hover:file:bg-cyan-400 cursor-pointer"
                />
                <div id="universal-qr-viewfinder-file" className="hidden" />
              </div>
            )}

            {activeTab === 'manual' && (
              <div className="space-y-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <form onSubmit={handleManualSearch} className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    Enter Student ID, Admission No, or Roll Number:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualQuery}
                      onChange={(e) => setManualQuery(e.target.value)}
                      placeholder="e.g. std-001 or roll 1 or paste raw QR payload"
                      className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
                    >
                      Simulate Scan
                    </button>
                  </div>
                </form>

                {/* Quick Simulation Badges for instant testing */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Quick One-Click Test Students:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {students.slice(0, 6).map(s => (
                      <button
                        key={s.id}
                        onClick={() => handleQrDetected(s.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-xs font-medium transition flex items-center gap-1.5"
                      >
                        <User className="w-3 h-3 text-cyan-400" />
                        <span>{s.firstName} {s.lastName} (Roll #{s.rollNo || s.rollNumber})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notification Toast Banner */}
            {actionNotice && (
              <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 transition ${
                actionNotice.type === 'success' 
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200' 
                  : actionNotice.type === 'warning'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                  : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200'
              }`}>
                {actionNotice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                )}
                <span className="flex-1 font-medium">{actionNotice.message}</span>
              </div>
            )}

            {/* Recent Scans Strip */}
            {sessionScanHistory.length > 0 && (
              <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-bold uppercase tracking-wider font-mono">
                    Session Scan History ({sessionScanHistory.length})
                  </span>
                  <span>Latest scans</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {sessionScanHistory.map(item => (
                    <button
                      key={item.scanId}
                      onClick={() => setScannedStudent(item.student)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-slate-300 flex items-center gap-1.5 shrink-0 transition"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{item.student.firstName}</span>
                      <span className="text-[9px] font-mono text-slate-500">{item.timestamp}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Scanned Student Verification Card & Actions (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {scannedStudent ? (
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/40 shadow-xl space-y-4">
                
                {/* Header with Photo & Status */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={scannedStudent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                    alt={scannedStudent.firstName}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyan-400/40 shadow-md"
                  />
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                        {scannedStudent.id}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                        Roll #{scannedStudent.rollNo || scannedStudent.rollNumber}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-base truncate font-['Outfit']">
                      {scannedStudent.firstName} {scannedStudent.lastName}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {studentClass?.name || 'Class 12'} • {scannedStudent.gender || 'Student'}
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Guardian / Phone:</span>
                    <span className="font-mono text-white font-semibold">
                      {scannedStudent.guardianPhone || scannedStudent.parentPhone || 'N/A'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Blood Group:</span>
                    <span className="font-mono text-rose-400 font-bold flex items-center gap-1">
                      <Droplet className="w-3 h-3 text-rose-500" />
                      {scannedStudent.bloodGroup || 'O+'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 col-span-2 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Today's Attendance ({todayStr}):</span>
                      <span className={`font-bold uppercase text-xs ${
                        todayAttendance?.status === 'present' 
                          ? 'text-emerald-400' 
                          : todayAttendance?.status === 'late'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}>
                        {todayAttendance?.status ? `● ${todayAttendance.status}` : 'Not Marked Yet'}
                      </span>
                    </div>
                    {todayAttendance?.markedAt && (
                      <span className="text-[10px] font-mono text-slate-500">
                        {todayAttendance.markedAt}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Attendance Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Quick Actions / Tihtur:
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleMarkAttendanceFromScan('present')}
                      className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Mark Present</span>
                    </button>
                    <button
                      onClick={() => handleMarkAttendanceFromScan('late')}
                      className="px-3 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-600/20 transition cursor-pointer"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Mark Late</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {onOpenIdCard && (
                      <button
                        onClick={() => onOpenIdCard(scannedStudent)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Print ID Card</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        startPrivateCall({
                          id: scannedStudent.id,
                          name: `${scannedStudent.firstName} ${scannedStudent.lastName}`,
                          role: `Student • ${studentClass?.name || 'Class 12'}`,
                          phone: scannedStudent.guardianPhone || scannedStudent.parentPhone || '+91 94361 00000',
                          photoUrl: scannedStudent.avatar,
                          info: `Parent: ${scannedStudent.guardianName || 'Guardian'}`
                        }, 'video');
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition"
                    >
                      <Video className="w-3.5 h-3.5 text-rose-400" />
                      <span>Video Call</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[260px] p-6 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <User className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-300">No Student Scanned Yet</h4>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    Point your camera at a Student ID Card or Admit Card QR code to instantly verify credentials and log attendance.
                  </p>
                </div>
              </div>
            )}

            {/* In-app scanner guidelines */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <span className="font-bold text-slate-300 uppercase font-mono block">QR Standard Info:</span>
              <p>• Uses cryptographic JSON standard (zoxs-sms payload).</p>
              <p>• Scannable from both printed plastic cards and phone screens.</p>
              <p>• Supports offline gate verification &amp; exam invigilator check.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="font-mono text-[11px]">
            {activeSchoolInfo?.name || 'School System'} • QR Attendance Engine v2.4
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
          >
            Close Scanner
          </button>
        </div>

      </div>
    </div>
  );
}
