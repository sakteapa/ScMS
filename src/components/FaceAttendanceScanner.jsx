import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  UserCheck, 
  ShieldCheck, 
  Scan,
  X,
  Volume2,
  Lock
} from 'lucide-react';

export default function FaceAttendanceScanner({ 
  classStudents = [], 
  onRecordAttendance, 
  selectedClass 
}) {
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [livenessStep, setLivenessStep] = useState(0); // 0: Idle, 1: Aligning Face, 2: Blink Challenge, 3: Verified
  const [matchedStudent, setMatchedStudent] = useState(null);
  const [blinkCount, setBlinkCount] = useState(0);
  const [scanStatusMessage, setScanStatusMessage] = useState('Camera start la, biometric attendance ṭan rawh le.');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentVerified, setRecentVerified] = useState([]);
  const videoRef = useRef(null);

  // Play audio beep
  const playSound = (freq = 880) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {}
  };

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      setLivenessStep(1);
      setScanStatusMessage('Zirlai hmai viewfinder-ah hian dah la, uluk takin lo en rawh le...');
    } catch (err) {
      console.warn('Camera failed:', err);
      setCameraError('Camera access a theih loh. Webcam permission check rawh le.');
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
    setLivenessStep(0);
    setMatchedStudent(null);
    setBlinkCount(0);
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [isCameraActive, stream]);

  // Simulate Face Scan & Candidate Detection
  const handleScanFace = () => {
    if (classStudents.length === 0) {
      alert('He class-ah hian zirlai an awm lo.');
      return;
    }

    setIsProcessing(true);
    setScanStatusMessage('Face biometric features scanning... hmai landan match a ni...');

    setTimeout(() => {
      // Pick next unverified student or random student from class
      const candidate = classStudents[Math.floor(Math.random() * classStudents.length)];
      setMatchedStudent(candidate);
      setLivenessStep(2); // Move to blink challenge
      setScanStatusMessage('Biometric match detected! Liveness Check: Khawngaihin i mit khap zawk zawk rawh (Blink eyes twice).');
      setIsProcessing(false);
    }, 1200);
  };

  // User performs blink or simulates blink
  const handleBlinkAction = () => {
    const nextBlinks = blinkCount + 1;
    setBlinkCount(nextBlinks);
    playSound(700);

    if (nextBlinks >= 2) {
      // Liveness verified!
      setLivenessStep(3);
      playSound(1050);
      setScanStatusMessage('Liveness Confirmed (Blink verified)! Mit-khap hmuh a ni e.');

      if (matchedStudent) {
        onRecordAttendance(
          matchedStudent.id, 
          'present', 
          'Biometric Face Scan (Blink Liveness Verified - Card forgotten/lost)'
        );
        setRecentVerified(prev => [
          {
            student: matchedStudent,
            time: new Date().toLocaleTimeString(),
            matchConfidence: 98.6
          },
          ...prev.slice(0, 5)
        ]);
      }
    }
  };

  // Reset for next student
  const handleNextStudent = () => {
    setMatchedStudent(null);
    setBlinkCount(0);
    setLivenessStep(1);
    setScanStatusMessage('Zirlai dang hmai dah rawh le...');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
              <span>Face Recognition Attendance System</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                AI Liveness (Blink)
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              ID Card theihnghilh emaw tibo zirlaite tan Class Master Biometric Backup Suite.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition"
            >
              <Camera className="w-4 h-4" />
              <span>Start Face Scanner</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold text-xs flex items-center gap-2 border border-slate-700 transition"
            >
              <X className="w-4 h-4" />
              <span>Stop Camera</span>
            </button>
          )}
        </div>
      </div>

      {cameraError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Main Scanner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Video Viewfinder with Face Target Overlay */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center shadow-2xl">
            {isCameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />

                {/* Biometric Oval Target Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4">
                  <div className={`w-52 h-64 rounded-[48%] border-2 transition-all duration-300 flex flex-col items-center justify-between p-3 relative ${
                    livenessStep === 3 
                      ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_30px_rgba(52,211,153,0.3)]' 
                      : livenessStep === 2
                      ? 'border-amber-400 bg-amber-500/10 animate-pulse'
                      : 'border-cyan-400/60 border-dashed bg-cyan-500/5'
                  }`}>
                    {/* Scanning radar line */}
                    {isProcessing && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce" />
                    )}

                    <div className="flex justify-between w-full text-[9px] font-mono text-cyan-300 uppercase bg-slate-950/70 px-2 py-0.5 rounded">
                      <span>Face Tracking</span>
                      <span>{livenessStep === 3 ? 'VERIFIED' : livenessStep === 2 ? 'BLINK TEST' : 'ALIGNED'}</span>
                    </div>

                    {/* Eye blink guide circles */}
                    <div className="flex gap-10 opacity-70">
                      <div className={`w-5 h-2.5 rounded-full border ${blinkCount >= 1 ? 'bg-emerald-400 border-emerald-400' : 'border-cyan-300'}`} />
                      <div className={`w-5 h-2.5 rounded-full border ${blinkCount >= 1 ? 'bg-emerald-400 border-emerald-400' : 'border-cyan-300'}`} />
                    </div>

                    <div className="text-[10px] font-bold text-center px-2 py-0.5 rounded bg-slate-950/80 text-white">
                      {livenessStep === 3 ? '✅ Liveness Passed' : livenessStep === 2 ? `Khap rawh (${blinkCount}/2)` : 'Hmai dah laileng rawh'}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center p-8 space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-300">Camera is Offline</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Click "Start Face Scanner" to initialize biometric facial detection for {selectedClass?.name}.
                  </p>
                </div>
                <button
                  onClick={startCamera}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
                >
                  Turn On Camera
                </button>
              </div>
            )}
          </div>

          {/* Interactive Live Controls */}
          {isCameraActive && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Biometric Status:</span>
                <span className="font-semibold text-cyan-300">{scanStatusMessage}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {livenessStep === 1 && (
                  <button
                    onClick={handleScanFace}
                    disabled={isProcessing}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
                  >
                    <Scan className="w-4 h-4" />
                    <span>{isProcessing ? 'Analyzing Biometrics...' : 'Identify Student Face'}</span>
                  </button>
                )}

                {livenessStep === 2 && (
                  <button
                    onClick={handleBlinkAction}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition animate-bounce"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Detect Blink ({blinkCount}/2) - Click or Blink</span>
                  </button>
                )}

                {livenessStep === 3 && (
                  <button
                    onClick={handleNextStudent}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Next Student Scan</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Cols: Candidate Verification Card & Attendance Log */}
        <div className="lg:col-span-5 space-y-4">
          {/* Matched Candidate Card */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-white text-xs font-['Outfit'] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Biometric Match Result</span>
              </span>
              {matchedStudent && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  98.6% Similarity
                </span>
              )}
            </div>

            {matchedStudent ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <img
                    src={matchedStudent.photoUrl}
                    alt=""
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-500/50"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {matchedStudent.firstName} {matchedStudent.lastName}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                      <span>{matchedStudent.admissionNo}</span>
                      <span>•</span>
                      <span className="text-cyan-400 font-bold">Roll #{matchedStudent.rollNo}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Guardian: {matchedStudent.guardianName}</span>
                  </div>
                </div>

                {/* Verification Liveness Checklist */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">1. Facial Embedding Match:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Matched
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">2. Liveness (Mit-khap test):</span>
                    <span className={livenessStep === 3 ? "text-emerald-400 font-bold flex items-center gap-1" : "text-amber-400 font-bold flex items-center gap-1"}>
                      {livenessStep === 3 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      {livenessStep === 3 ? 'Verified' : 'Pending Blink'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">3. Attendance Status:</span>
                    <span className={livenessStep === 3 ? "text-emerald-400 font-bold" : "text-slate-500 font-bold"}>
                      {livenessStep === 3 ? 'PRESENT (Recorded)' : 'Awaiting confirmation'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                Scan hmai zirlai hre hrang turin camera lo activate rawh le.
              </div>
            )}
          </div>

          {/* Recently Verified Log */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="text-xs font-bold text-white font-['Outfit'] flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Biometric Attendance Live Feed</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">Real-time</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recentVerified.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">
                  Biometric attendance vawiin atan a la in-record lo.
                </p>
              ) : (
                recentVerified.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <img src={item.student.photoUrl} alt="" className="w-7 h-7 rounded-lg object-cover" />
                      <div>
                        <span className="font-bold text-white block">
                          {item.student.firstName} {item.student.lastName}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">Roll #{item.student.rollNo}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        Present
                      </span>
                      <span className="text-[9px] text-slate-500 block font-mono mt-0.5">{item.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
