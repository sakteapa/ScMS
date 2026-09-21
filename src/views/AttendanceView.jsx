import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Users, 
  Calendar, 
  Volume2, 
  RefreshCw, 
  Eye, 
  Sparkles, 
  Search, 
  UserCheck, 
  StopCircle, 
  Play,
  Clock,
  Bell,
  Send,
  ShieldAlert,
  Smartphone,
  Radio,
  Sliders,
  Check,
  X,
  Edit3,
  MessageSquare,
  FileText,
  Scan
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import FaceAttendanceScanner from '../components/FaceAttendanceScanner';

export default function AttendanceView({ setCurrentTab }) {
  const { 
    students = [], 
    classes = [], 
    attendance = [], 
    recordAttendance, 
    bulkMarkAttendance, 
    leaveApplications = [],
    autoAbsentNotificationEnabled = true,
    toggleAutoAbsentNotification,
    dispatchBulkAbsentNotifications
  } = useSchool();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'batch_id_cards' | 'manual_matrix'
  const [selectedClassId, setSelectedClassId] = useState('cls-12-sci');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedStudentForQr, setSelectedStudentForQr] = useState(null);

  // Live Camera Scanner State
  const [isScannerRunning, setIsScannerRunning] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const [lastScannedResult, setLastScannedResult] = useState(null);
  const html5QrCodeRef = useRef(null);

  // Notification status toast
  const [notiToast, setNotiToast] = useState(null);

  // Manual Override Modal State
  const [overrideModalStudent, setOverrideModalStudent] = useState(null);
  const [overrideFormData, setOverrideFormData] = useState({
    status: 'present',
    remarks: '',
    suppressNotification: false,
    sendCorrectionNotice: true
  });

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(s => s.classId === selectedClassId);
  const dateAttendance = attendance.filter(a => a.date === selectedDate);
  const classAttendance = dateAttendance.filter(a => classStudents.some(s => s.id === a.studentId));
  const absentStudentsInClass = classStudents.filter(s => {
    const a = dateAttendance.find(rec => rec.studentId === s.id);
    return a?.status === 'absent';
  });

  // Synthesize positive audio beep for scans
  const playScanBeep = (freq = 880) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn('AudioContext beep warning:', e);
    }
  };

  // Start / Stop HTML5 QR Camera Scanner
  const startCamera = async () => {
    setScannerError(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("qr-reader-viewfinder");
      }
      
      const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        handleQrDetected(decodedText);
      };

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        qrCodeSuccessCallback,
        (errorMessage) => {
          // Frame read errors are normal while seeking
        }
      );
      setIsScannerRunning(true);
    } catch (err) {
      console.warn("Camera start warning:", err);
      setScannerError("Camera permission not granted or device camera unavailable. Use Test Scan or upload student ID card.");
      setIsScannerRunning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && isScannerRunning) {
      try {
        await html5QrCodeRef.current.stop();
        setIsScannerRunning(false);
      } catch (err) {
        console.warn("Error stopping scanner", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && isScannerRunning) {
        try {
          html5QrCodeRef.current.stop();
        } catch (e) {}
      }
    };
  }, [isScannerRunning]);

  // Handle scanned student QR
  const handleQrDetected = (rawText) => {
    playScanBeep(880);
    let targetStudent = null;

    try {
      const parsed = JSON.parse(rawText);
      targetStudent = students.find(s => s.id === parsed.id || s.admissionNo === parsed.admissionNo);
    } catch (e) {
      targetStudent = students.find(s => s.id === rawText || s.admissionNo === rawText);
    }

    if (targetStudent) {
      const isSuspended = targetStudent.status === 'suspended' || Boolean(targetStudent.activeSuspension);

      recordAttendance({
        studentId: targetStudent.id,
        classId: targetStudent.classId,
        date: selectedDate,
        status: isSuspended ? 'absent' : 'present',
        scanMethod: 'qr_scan',
        scannedBy: currentUser?.displayName || 'Class Teacher',
        remarks: isSuspended ? 'Blocked: Student is under disciplinary suspension' : undefined
      });

      setLastScannedResult({
        student: targetStudent,
        timestamp: new Date().toLocaleTimeString(),
        status: isSuspended ? 'suspended' : 'present',
        isSuspended
      });
    } else {
      setLastScannedResult({
        error: `Unrecognized student QR code: ${rawText}`
      });
    }
  };

  // Quick simulated scan helper for instant testing
  const triggerSimulatedScan = (stu) => {
    const qrPayload = JSON.stringify({
      id: stu.id,
      admissionNo: stu.admissionNo,
      name: `${stu.firstName} ${stu.lastName}`,
      class: stu.classId
    });
    handleQrDetected(qrPayload);
  };

  // Manual fast status change
  const handleFastStatusChange = (stu, newStatus) => {
    playScanBeep(newStatus === 'present' ? 880 : newStatus === 'absent' ? 440 : 660);
    recordAttendance({
      studentId: stu.id,
      classId: stu.classId,
      date: selectedDate,
      status: newStatus,
      scanMethod: 'manual',
      scannedBy: currentUser?.displayName || 'Class Teacher',
      remarks: `Manual switch to ${newStatus.toUpperCase()}`
    });

    if (newStatus === 'absent' && autoAbsentNotificationEnabled) {
      showToast(`Absent alert auto-dispatched to ${stu.guardianName || 'Parent'} (${stu.guardianPhone || 'WhatsApp'})`);
    } else {
      showToast(`${stu.firstName} status changed to ${newStatus.toUpperCase()}`);
    }
  };

  // Open detailed override modal
  const openOverrideModal = (stu) => {
    const existing = attendance.find(a => a.studentId === stu.id && a.date === selectedDate);
    setOverrideModalStudent(stu);
    setOverrideFormData({
      status: existing?.status || 'present',
      remarks: existing?.remarks || '',
      suppressNotification: false,
      sendCorrectionNotice: existing?.status === 'absent'
    });
  };

  // Save detailed override
  const handleSaveOverride = (e) => {
    e.preventDefault();
    if (!overrideModalStudent) return;

    recordAttendance({
      studentId: overrideModalStudent.id,
      classId: overrideModalStudent.classId,
      date: selectedDate,
      status: overrideFormData.status,
      scanMethod: 'manual',
      scannedBy: currentUser?.displayName || 'Teacher Override',
      remarks: overrideFormData.remarks || `Manual override to ${overrideFormData.status}`,
      suppressNotification: overrideFormData.suppressNotification,
      sendCorrectionNotice: overrideFormData.sendCorrectionNotice
    });

    showToast(`Attendance updated for ${overrideModalStudent.firstName}: ${overrideFormData.status.toUpperCase()}`);
    setOverrideModalStudent(null);
  };

  // Dispatch bulk absent notifications for class
  const handleDispatchClassAbsentNotis = () => {
    if (absentStudentsInClass.length === 0) {
      alert(`Class ${selectedClass?.name}-ah hian absent an awm lo e.`);
      return;
    }

    const count = dispatchBulkAbsentNotifications(
      selectedClassId, 
      selectedDate, 
      currentUser?.displayName || 'Class Teacher'
    );
    playScanBeep(700);
    showToast(`Absent alerts dispatched to parents of ${count} students via WhatsApp & SMS!`);
  };

  const showToast = (msg) => {
    setNotiToast(msg);
    setTimeout(() => setNotiToast(null), 3500);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-[#0e1628] to-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
              <span>QR Attendance &amp; ID Cards</span>
            </h2>
            <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Live Cam + Manual
            </span>
            <span className={`text-[11px] sm:text-xs px-2 py-0.5 rounded-full flex items-center gap-1 border ${
              autoAbsentNotificationEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <Bell className="w-3 h-3" />
              Auto-Alert: {autoAbsentNotificationEnabled ? 'ON' : 'OFF'}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
            Real-time QR scanning, batch ID card printing, automated absent parent notifications, and manual status override.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="w-full sm:w-auto flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800 overflow-x-auto max-w-full gap-1">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'scanner'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Camera</span>
          </button>
          <button
            onClick={() => {
              stopCamera();
              setActiveTab('face_attendance');
            }}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'face_attendance'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scan className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Biometric</span>
          </button>
          <button
            onClick={() => {
              stopCamera();
              setActiveTab('manual_matrix');
            }}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'manual_matrix'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Manual Grid</span>
          </button>
          <button
            onClick={() => setActiveTab('batch_id_cards')}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'batch_id_cards'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>ID Cards</span>
          </button>
          <button
            onClick={() => {
              if (setCurrentTab) setCurrentTab('leave_management');
            }}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 text-slate-400 hover:text-white whitespace-nowrap shrink-0"
          >
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
            <span>Leaves ({leaveApplications.filter(l => l.status?.startsWith('pending')).length})</span>
          </button>
        </div>
      </div>

      {/* Auto-Absent Notification Engine Settings Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-rose-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Absentee Auto-Notification Engine (School &rarr; Parents)</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">
                Multi-Channel Gateway
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
              <span>When marked Absent, parents receive WhatsApp &amp; In-App alert instantly.</span>
              <span className="text-emerald-400 text-[10px]">&bull; WhatsApp Meta Cloud API Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Button */}
          <button
            onClick={() => {
              const res = toggleAutoAbsentNotification();
              showToast(`Auto-Absent Notifications switched ${res ? 'ON' : 'OFF'}`);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              autoAbsentNotificationEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${autoAbsentNotificationEnabled ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span>Auto-Alert: {autoAbsentNotificationEnabled ? 'Enabled' : 'Disabled'}</span>
          </button>

          {/* Bulk Dispatch Button */}
          <button
            onClick={handleDispatchClassAbsentNotis}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition active:scale-95"
            title="Dispatch Absent Alerts to Parents of all absent students in this class"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Notify {absentStudentsInClass.length} Absentees' Parents</span>
          </button>
        </div>
      </div>

      {/* Toast message banner */}
      {notiToast && (
        <div className="p-3.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{notiToast}</span>
        </div>
      )}

      {/* VIEW 1: LIVE CAMERA QR SCANNER */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Camera Viewfinder & Scanner Frame */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Student ID Card QR Scanner
                  </h3>
                  <p className="text-xs text-slate-400">
                    Hold student ID card QR code in front of device camera to verify attendance.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!isScannerRunning ? (
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Camera</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopCamera}
                      className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20"
                    >
                      <StopCircle className="w-3.5 h-3.5" />
                      <span>Stop Camera</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Viewfinder Container */}
              <div className="relative rounded-2xl overflow-hidden bg-black/80 border border-slate-800 aspect-video flex items-center justify-center">
                <div id="qr-reader-viewfinder" className="w-full h-full"></div>

                {!isScannerRunning && !scannerError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-950/70 backdrop-blur-sm pointer-events-none">
                    <Camera className="w-12 h-12 text-slate-600 animate-pulse" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-300">Camera is currently paused</p>
                      <p className="text-xs text-slate-500">Click "Start Camera" or use Test Scan below.</p>
                    </div>
                  </div>
                )}

                {scannerError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-2 bg-rose-950/80 backdrop-blur-sm">
                    <AlertCircle className="w-8 h-8 text-rose-400" />
                    <p className="text-xs text-rose-200 max-w-sm">{scannerError}</p>
                  </div>
                )}
              </div>

              {/* Quick Simulated Scan Pills */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Simulated Scan (Click to Scan Student ID):
                </span>
                <div className="flex flex-wrap gap-2">
                  {students.slice(0, 5).map((stu) => (
                    <button
                      key={stu.id}
                      onClick={() => triggerSimulatedScan(stu)}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-2 transition"
                    >
                      <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{stu.firstName} {stu.lastName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">#{stu.rollNo}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Last Scanned Result & Live Feed with Manual Controls */}
          <div className="space-y-6">
            {/* Last Scan Result Card */}
            {lastScannedResult && (
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Recent Scan Detection
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {lastScannedResult.timestamp}
                  </span>
                </div>

                {lastScannedResult.student ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={lastScannedResult.student.photoUrl}
                        alt=""
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-400/50 shadow"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {lastScannedResult.student.firstName} {lastScannedResult.student.lastName}
                        </h4>
                        <p className="text-xs text-slate-400">
                          Roll #{lastScannedResult.student.rollNo} &bull; {lastScannedResult.student.admissionNo}
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Verified: PRESENT for {selectedDate}</span>
                    </div>

                    {/* Manual override buttons right here */}
                    <div className="pt-2 border-t border-slate-800 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Manual Status Change:</span>
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          onClick={() => handleFastStatusChange(lastScannedResult.student, 'present')}
                          className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[11px] font-bold hover:bg-emerald-500 hover:text-slate-950"
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleFastStatusChange(lastScannedResult.student, 'absent')}
                          className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-[11px] font-bold hover:bg-rose-500 hover:text-slate-950"
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => handleFastStatusChange(lastScannedResult.student, 'late')}
                          className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[11px] font-bold hover:bg-amber-500 hover:text-slate-950"
                        >
                          Late
                        </button>
                        <button
                          onClick={() => handleFastStatusChange(lastScannedResult.student, 'excused')}
                          className="px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-[11px] font-bold hover:bg-cyan-500 hover:text-slate-950"
                        >
                          Excused
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-rose-400">{lastScannedResult.error}</p>
                )}
              </div>
            )}

            {/* Today's Live Attendance Stream with Interactive Override */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  <span>Today's Live Records ({dateAttendance.length})</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">{selectedDate}</span>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {dateAttendance.length > 0 ? (
                  dateAttendance.map((rec) => {
                    const st = students.find(s => s.id === rec.studentId);
                    if (!st) return null;

                    return (
                      <div key={rec.id} className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={st?.photoUrl}
                              alt=""
                              className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700"
                            />
                            <div>
                              <span className="font-bold text-slate-200 block">{st.firstName} {st.lastName}</span>
                              <span className="text-[10px] text-slate-500 font-mono">Roll #{st.rollNo} &bull; {rec.scanMethod}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase ${
                              rec.status === 'present' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              rec.status === 'absent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                              rec.status === 'late' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}>
                              {rec.status}
                            </span>
                            <button
                              onClick={() => openOverrideModal(st)}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                              title="Override with Custom Note / Suppress Alert"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Fast manual switch chips in stream */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                          <span className="text-slate-500">Manual Switch:</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleFastStatusChange(st, 'present')}
                              className={`px-1.5 py-0.5 rounded font-bold ${rec.status === 'present' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-emerald-300'}`}
                            >
                              P
                            </button>
                            <button
                              onClick={() => handleFastStatusChange(st, 'absent')}
                              className={`px-1.5 py-0.5 rounded font-bold ${rec.status === 'absent' ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-rose-300'}`}
                            >
                              A
                            </button>
                            <button
                              onClick={() => handleFastStatusChange(st, 'late')}
                              className={`px-1.5 py-0.5 rounded font-bold ${rec.status === 'late' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-amber-300'}`}
                            >
                              L
                            </button>
                            <button
                              onClick={() => handleFastStatusChange(st, 'excused')}
                              className={`px-1.5 py-0.5 rounded font-bold ${rec.status === 'excused' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-cyan-300'}`}
                            >
                              E
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">
                    No attendance records for today yet. Scan cards above.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: FACE RECOGNITION & BLINK LIVENESS ATTENDANCE */}
      {activeTab === 'face_attendance' && (
        <FaceAttendanceScanner
          classStudents={classStudents}
          selectedClass={selectedClass}
          onRecordAttendance={(studentId, status, remarks) => {
            recordAttendance({
              studentId,
              classId: selectedClassId,
              date: selectedDate,
              status,
              scanMethod: 'face_recognition_liveness',
              scannedBy: currentUser?.displayName || 'Class Master',
              remarks
            });
            showToast(`Biometric face attendance recorded successfully!`);
          }}
        />
      )}

      {/* VIEW 2: MANUAL ATTENDANCE MATRIX & MANUAL OVERRIDE */}
      {activeTab === 'manual_matrix' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Class Level</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => bulkMarkAttendance(selectedClassId, selectedDate, 'present', currentUser?.displayName)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark All Present</span>
              </button>
            </div>
          </div>

          {/* Table Matrix */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Roll</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Parent / Guardian Phone</th>
                  <th className="py-3 px-4">Status Today</th>
                  <th className="py-3 px-4 text-right">Manual Override ("Manual a thlakna")</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {classStudents.map((st) => {
                  const rec = attendance.find(a => a.studentId === st.id && a.date === selectedDate);
                  const currentStatus = rec?.status || 'unmarked';

                  return (
                    <tr key={st.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400">#{st.rollNo}</td>
                      <td className="py-3 px-4 font-bold text-white">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>{st.firstName} {st.lastName}</span>
                          {(st.status === 'suspended' || Boolean(st.activeSuspension)) && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                              ⛔ SUSPENDED
                            </span>
                          )}
                        </div>
                        {rec?.remarks && (
                          <span className="block text-[10px] text-slate-500 font-normal italic">
                            Note: {rec.remarks}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {st.guardianPhone || '+91 98623 45671'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase font-mono ${
                          currentStatus === 'present' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          currentStatus === 'absent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          currentStatus === 'late' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          currentStatus === 'excused' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {currentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Present (P) */}
                          <button
                            onClick={() => handleFastStatusChange(st, 'present')}
                            title="Mark Present"
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              currentStatus === 'present'
                                ? 'bg-emerald-500 text-slate-950 shadow'
                                : 'bg-slate-950 text-slate-400 hover:text-emerald-300 border border-slate-800'
                            }`}
                          >
                            P
                          </button>

                          {/* Absent (A) */}
                          <button
                            onClick={() => handleFastStatusChange(st, 'absent')}
                            title="Mark Absent (Auto Alert to Parent)"
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              currentStatus === 'absent'
                                ? 'bg-rose-500 text-white shadow'
                                : 'bg-slate-950 text-slate-400 hover:text-rose-300 border border-slate-800'
                            }`}
                          >
                            A
                          </button>

                          {/* Late (L) */}
                          <button
                            onClick={() => handleFastStatusChange(st, 'late')}
                            title="Mark Late"
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              currentStatus === 'late'
                                ? 'bg-amber-500 text-slate-950 shadow'
                                : 'bg-slate-950 text-slate-400 hover:text-amber-300 border border-slate-800'
                            }`}
                          >
                            L
                          </button>

                          {/* Excused Leave (E) */}
                          <button
                            onClick={() => handleFastStatusChange(st, 'excused')}
                            title="Mark Excused Leave"
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              currentStatus === 'excused'
                                ? 'bg-cyan-500 text-slate-950 shadow'
                                : 'bg-slate-950 text-slate-400 hover:text-cyan-300 border border-slate-800'
                            }`}
                          >
                            E
                          </button>

                          {/* Deep Override Modal */}
                          <button
                            onClick={() => openOverrideModal(st)}
                            title="Detailed Override & Notification Settings"
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition ml-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: BATCH ID CARDS PRINTING */}
      {activeTab === 'batch_id_cards' && (
        <div className="space-y-6">
          <div className="no-print p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <h3 className="text-sm font-bold text-white">Batch Student Identity Cards (Print Ready)</h3>
              <p className="text-xs text-slate-400">
                High-resolution laminated student ID cards with dynamic student QR code and barcodes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} {c.stream ? `(${c.stream.toUpperCase()})` : ''}</option>
                ))}
              </select>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print All Cards</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classStudents.map((st) => {
              const qrPayload = JSON.stringify({
                id: st.id,
                admissionNo: st.admissionNo,
                name: `${st.firstName} ${st.lastName}`,
                class: st.classId
              });

              return (
                <div
                  key={st.id}
                  className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={st.photoUrl}
                      alt=""
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-cyan-400/40"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{st.firstName} {st.lastName}</h4>
                      <p className="text-xs text-slate-400">Roll #{st.rollNo} &bull; {st.admissionNo}</p>
                      <p className="text-[10px] text-cyan-400 font-mono">{selectedClass?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="p-1 rounded bg-white">
                      <QRCodeSVG value={qrPayload} size={50} />
                    </div>
                    <div className="text-right text-[10px] text-slate-400">
                      <div>Blood: <strong className="text-white">{st.bloodGroup}</strong></div>
                      <div>Phone: {st.guardianPhone}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual Attendance Override & Notification Control Modal */}
      {overrideModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0e1628] border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Manual Attendance Override ("Thlakna")
                </h3>
                <p className="text-xs text-slate-400">
                  {overrideModalStudent.firstName} {overrideModalStudent.lastName} (Roll #{overrideModalStudent.rollNo})
                </p>
              </div>
              <button
                onClick={() => setOverrideModalStudent(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOverride} className="space-y-4 text-xs">
              {/* Select Status */}
              <div>
                <label className="block text-slate-300 font-bold mb-2">Select Attendance Status *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'present', label: 'Present', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
                    { key: 'absent', label: 'Absent', color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
                    { key: 'late', label: 'Late Arrival', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
                    { key: 'excused', label: 'Excused Leave', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' }
                  ].map((opt) => (
                    <label
                      key={opt.key}
                      className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                        overrideFormData.status === opt.key
                          ? `${opt.color} ring-1 ring-cyan-500`
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="overrideStatus"
                        value={opt.key}
                        checked={overrideFormData.status === opt.key}
                        onChange={() => setOverrideFormData({ ...overrideFormData, status: opt.key })}
                        className="text-cyan-500 focus:ring-0"
                      />
                      <span className="font-bold text-xs">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Remarks / Reason */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Remarks / Reason for Manual Change (Chhan)
                </label>
                <input
                  type="text"
                  value={overrideFormData.remarks}
                  onChange={(e) => setOverrideFormData({ ...overrideFormData, remarks: e.target.value })}
                  placeholder="e.g. Arrived late at 9:30 AM / Dental clinic appointment"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>

              {/* Notification controls */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">
                  Parent Notification Controls:
                </span>

                {overrideFormData.status === 'absent' && (
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={!overrideFormData.suppressNotification}
                      onChange={(e) => setOverrideFormData({
                        ...overrideFormData,
                        suppressNotification: !e.target.checked
                      })}
                      className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0"
                    />
                    <span>Send Absent alert to parent via WhatsApp &amp; In-App (+91 {overrideModalStudent.guardianPhone || '98623 45671'})</span>
                  </label>
                )}

                {overrideFormData.status !== 'absent' && (
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={overrideFormData.sendCorrectionNotice}
                      onChange={(e) => setOverrideFormData({
                        ...overrideFormData,
                        sendCorrectionNotice: e.target.checked
                      })}
                      className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                    />
                    <span>Send correction alert to parent (if previously marked absent)</span>
                  </label>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalStudent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                >
                  Save &amp; Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
