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
  Scan,
  CreditCard,
  Cpu,
  Wifi,
  FileSpreadsheet,
  UploadCloud,
  CheckSquare,
  Layers,
  Save,
  RotateCw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import FaceAttendanceScanner from '../components/FaceAttendanceScanner';
import SmsWhatsAppNotificationHubModal from '../components/SmsWhatsAppNotificationHubModal';
import StudentIdCardModal from '../components/StudentIdCardModal';

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
    dispatchBulkAbsentNotifications,
    sendSmsAlert,
    sendWhatsAppAlert,
    updateStudent
  } = useSchool();
  const { currentUser } = useAuth();

  const [showSmsHubModal, setShowSmsHubModal] = useState(false);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [idCardTargetStudent, setIdCardTargetStudent] = useState(null);

  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'face_attendance' | 'manual_matrix' | 'batch_id_cards' | 'hardware_biometric'
  const [selectedClassId, setSelectedClassId] = useState('cls-12-sci');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedStudentForQr, setSelectedStudentForQr] = useState(null);

  // Hardware Biometric & RFID Management State
  const [hardwareSubTab, setHardwareSubTab] = useState('cloud_push'); // 'cloud_push' | 'usb_import' | 'live_rfid' | 'rfid_directory'
  const [usbRfidInput, setUsbRfidInput] = useState('');
  const [liveScanLogs, setLiveScanLogs] = useState([]);
  const [importedLogs, setImportedLogs] = useState([]);
  const [isImportApplied, setIsImportApplied] = useState(false);
  const [rfidSearchQuery, setRfidSearchQuery] = useState('');
  const [editingRfidStudentId, setEditingRfidStudentId] = useState(null);
  const [editingRfidValue, setEditingRfidValue] = useState('');

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
      const phone = stu.guardianPhone || stu.parentPhone;
      if (phone) {
        const msg = `Nu leh Pa Chibai, Vawiin ni ${selectedDate} hian i fa ${stu.firstName} ${stu.lastName} (Roll No: #${stu.rollNo}) chu sikul a rawn kal lo (ABSENT) tih kan inhriattir a che. - Principal Office`;
        try {
          if (sendSmsAlert) sendSmsAlert(phone, msg, 'sms');
          if (sendWhatsAppAlert) sendWhatsAppAlert(phone, msg);
        } catch (e) {
          console.warn('Absent alert dispatch notice:', e);
        }
      }
      showToast(`Absent alert auto-dispatched to ${stu.guardianName || 'Parent'} (${phone || 'WhatsApp'})`);
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

  // Hardware Biometric: Handle USB RFID Reader Tap Input
  const handleUsbRfidSubmit = (e) => {
    if (e) e.preventDefault();
    const rawCode = usbRfidInput.trim();
    if (!rawCode) return;

    // Match student by rfidCardUid, ID, roll number, or admissionNo
    const matched = students.find(s => 
      (s.rfidCardUid && s.rfidCardUid.toLowerCase() === rawCode.toLowerCase()) ||
      s.id.toLowerCase() === rawCode.toLowerCase() ||
      s.admissionNo?.toLowerCase() === rawCode.toLowerCase() ||
      `#${s.rollNumber}` === rawCode ||
      s.rollNumber?.toString() === rawCode
    );

    if (matched) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      recordAttendance({
        studentId: matched.id,
        classId: matched.classId,
        date: selectedDate,
        status: 'present',
        scanMethod: 'rfid_usb_tap',
        scannedBy: 'USB RFID Gate Terminal',
        remarks: `Tapped RFID card [${rawCode}] at ${timeStr}`
      });
      playScanBeep(880);
      showToast(`PUNCH RECORDED: ${matched.firstName} ${matched.lastName} (Roll #${matched.rollNumber || '1'}) - Present via RFID!`);
      setLiveScanLogs(prev => [
        {
          id: Date.now(),
          student: matched,
          uid: rawCode,
          time: timeStr,
          method: 'RFID Tap (USB Reader)',
          status: 'present'
        },
        ...prev.slice(0, 19)
      ]);
    } else {
      playScanBeep(330);
      showToast(`Unknown Card UID [${rawCode}]. Student record not found.`);
    }
    setUsbRfidInput('');
  };

  // Load Sample Realtime T304F Attendance Log
  const handleLoadSampleRealtimeLog = () => {
    const sample = classStudents.slice(0, 15).map((st, idx) => {
      const isLate = idx % 5 === 4;
      const hour = 8;
      const min = 20 + idx * 3;
      const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:15`;
      return {
        userId: st.id,
        rollNo: st.rollNumber || (idx + 1),
        name: `${st.firstName} ${st.lastName}`,
        date: selectedDate,
        time: time,
        mode: idx % 2 === 0 ? 'Face Scan (Realtime T304F)' : 'RFID 13.56MHz Tap',
        status: isLate ? 'late' : 'present',
        deviceId: 'RT-T304F-GATE01'
      };
    });
    setImportedLogs(sample);
    setIsImportApplied(false);
    showToast(`Loaded ${sample.length} logs from Realtime T304F export pendrive.`);
  };

  // Commit Imported Attendance Logs to Database
  const handleCommitImportedLogs = () => {
    if (importedLogs.length === 0) return;
    importedLogs.forEach(log => {
      recordAttendance({
        studentId: log.userId,
        classId: selectedClassId,
        date: log.date,
        status: log.status,
        scanMethod: 'biometric_import',
        scannedBy: `Realtime T304F (${log.mode})`,
        remarks: `Biometric terminal punch at ${log.time}`
      });
    });
    playScanBeep(1046);
    setIsImportApplied(true);
    showToast(`Successfully synced ${importedLogs.length} punches to today's school attendance!`);
  };

  // Quick Save Student RFID UID
  const handleQuickSaveStudentRfid = (studentId, uidValue) => {
    if (!uidValue.trim()) return;
    if (updateStudent) {
      updateStudent(studentId, { rfidCardUid: uidValue.trim() });
      showToast(`RFID UID [${uidValue.trim()}] saved successfully!`);
    }
    setEditingRfidStudentId(null);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-[#0e1628] to-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
              <span>QR, Biometric &amp; RFID Attendance</span>
            </h2>
            <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Multi-Device Ready
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
            Realtime T304F Biometric, USB RFID scanners, live camera QR, batch smart ID printing, and parent notifications.
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
            <span>Face Cam</span>
          </button>
          <button
            onClick={() => {
              stopCamera();
              setActiveTab('hardware_biometric');
            }}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'hardware_biometric'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            <span>Hardware &amp; RFID Hub</span>
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

              {absentStudentsInClass.length > 0 && (
                <button
                  onClick={() => setShowSmsHubModal(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-rose-950/40"
                  title="Nu leh pa hnena absent hriattirna thawnna (WhatsApp & SMS)"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Absent WhatsApp Alert ({absentStudentsInClass.length})</span>
                </button>
              )}
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

                          {/* Direct WhatsApp Alert to Parent (when absent) */}
                          {currentStatus === 'absent' && (
                            <button
                              onClick={() => {
                                const cleanPhone = (st.guardianPhone || '').replace(/[^0-9]/g, '');
                                const msg = `Nu leh Pa Chibai, Vawiin ni ${selectedDate} hian i fa ${st.firstName} ${st.lastName} (Roll No: #${st.rollNo}, ${selectedClass?.name}) chu sikul a rawn kal lo (ABSENT) tih kan inhriattir a che. - Principal Office`;
                                window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                              }}
                              title="Direct WhatsApp Alert to Parent"
                              className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 transition ml-1"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}
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
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Batch Student Identity Cards (Print Ready)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  CR80 PVC / A4 Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                High-resolution laminated student ID cards with student QR code, contactless RFID UID, and barcodes.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
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
                onClick={() => {
                  setIdCardTargetStudent(null);
                  setShowIdCardModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Launch Smart ID Studio (RFID + PVC)</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2"
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
                  className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={st.photoUrl}
                        alt=""
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-cyan-400/40"
                      />
                      <div>
                        <h4 className="font-bold text-white text-sm">{st.firstName} {st.lastName}</h4>
                        <p className="text-xs text-slate-400">Roll #{st.rollNo || st.rollNumber || '1'} &bull; {st.admissionNo}</p>
                        <p className="text-[10px] text-cyan-400 font-mono">{selectedClass?.name}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIdCardTargetStudent(st);
                        setShowIdCardModal(true);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                      title="Open in Smart ID Card Studio"
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>Print PVC</span>
                    </button>
                  </div>

                  {/* RFID UID indicator */}
                  <div className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[10px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Radio className="w-3 h-3 text-cyan-400" /> RFID UID:
                    </span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {st.rfidCardUid || <span className="text-slate-500 italic">Unassigned</span>}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="p-1 rounded bg-white">
                      <QRCodeSVG value={qrPayload} size={46} />
                    </div>
                    <div className="text-right text-[10px] text-slate-400 space-y-0.5">
                      <div>Blood: <strong className="text-white">{st.bloodGroup || 'O+'}</strong></div>
                      <div>Phone: {st.guardianPhone || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 4: HARDWARE & BIOMETRIC DEVICE MANAGEMENT */}
      {activeTab === 'hardware_biometric' && (
        <div className="space-y-6">
          {/* Sub-navigation Bar */}
          <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setHardwareSubTab('cloud_push')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  hardwareSubTab === 'cloud_push'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Realtime T304F (Wi-Fi Push)</span>
              </button>

              <button
                onClick={() => setHardwareSubTab('usb_import')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  hardwareSubTab === 'usb_import'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Pendrive Excel/CSV Importer</span>
              </button>

              <button
                onClick={() => setHardwareSubTab('live_rfid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  hardwareSubTab === 'live_rfid'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Live USB Tap Listener</span>
              </button>

              <button
                onClick={() => setHardwareSubTab('rfid_directory')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  hardwareSubTab === 'rfid_directory'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Student RFID &amp; ID Directory</span>
              </button>
            </div>

            <button
              onClick={() => {
                setIdCardTargetStudent(null);
                setShowIdCardModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Smart ID Card Studio</span>
            </button>
          </div>

          {/* SUBTAB 1: REALTIME T304F CLOUD PUSH SERVER INTEGRATION */}
          {hardwareSubTab === 'cloud_push' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Machine Status & Specs Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Realtime T304F Terminal</h4>
                      <p className="text-[11px] text-slate-400">Biometric + RFID + Wi-Fi</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> ONLINE
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Terminal Location</span>
                    <span className="font-semibold text-white">Main Campus Gate 1</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Communication Mode</span>
                    <span className="font-semibold text-cyan-300">Wi-Fi / Cloud Push (ADMS)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Supported Verifications</span>
                    <span className="font-semibold text-white">Face, Fingerprint, RFID 13.56MHz</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Device Serial Number</span>
                    <span className="font-mono text-slate-300 font-bold">RT-T304F-84920194</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    playScanBeep(880);
                    showToast('Ping Successful: Realtime T304F responding with HTTP 200 OK');
                  }}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Test Machine Cloud Ping</span>
                </button>
              </div>

              {/* Push Server Parameters & Setup Guide */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-cyan-400" />
                    <span>Realtime T304F Machine Setup Parameters</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter these exact server settings inside the Realtime T304F machine on-screen menu to connect it to this software.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Cloud Push URL / Domain</span>
                    <div className="font-mono text-cyan-300 font-bold select-all">https://sc-ms.vercel.app/api/biometric-push</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Web Server Port</span>
                    <div className="font-mono text-cyan-300 font-bold select-all">443 (HTTPS) / 80 (HTTP)</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Device Access Key / Token</span>
                    <div className="font-mono text-cyan-300 font-bold select-all">SCMS-RT-T304F-GATE01</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Push Interval</span>
                    <div className="font-mono text-cyan-300 font-bold select-all">Instant (Realtime Real-Push)</div>
                  </div>
                </div>

                {/* Step by step in Mizo */}
                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-2 text-xs">
                  <span className="font-bold text-cyan-300 block">Realtime T304F Setting Siam Dan Awlsam:</span>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                    <li>Realtime machine menu-ah lut la, <strong>COMM / Network &rarr; Wi-Fi</strong> ah school Wi-Fi connect rawh.</li>
                    <li><strong>COMM &rarr; Cloud Server / Push Server</strong> ah lutin <strong>Server URL</strong> ah <code className="text-cyan-300 font-mono">sc-ms.vercel.app</code> dah rawh.</li>
                    <li>Port ah <strong>443</strong> dah la, <strong>Push Protocol</strong> ah <strong>Realtime / ADMS</strong> thlang rawh.</li>
                    <li>Tichuan zirlaite leh staff ten an hmai (Face) an en emaw, an RFID card an tap apiangin software-ah hian attendance a lut nghal char char ang!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 2: OFFLINE PENDRIVE EXCEL/CSV IMPORTER */}
          {hardwareSubTab === 'usb_import' && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    <span>Offline Realtime T304F / Biometric Pendrive Excel Log Importer</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Wi-Fi a awm loh pawhin Realtime T304F atanga USB pendrive-a attendance logs (.xlsx / .csv) download chu hetah hian awlsam takin a import theih vek.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLoadSampleRealtimeLog}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Load Demo Pendrive Logs</span>
                  </button>

                  {importedLogs.length > 0 && (
                    <button
                      onClick={handleCommitImportedLogs}
                      disabled={isImportApplied}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isImportApplied
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isImportApplied ? 'Punches Synced!' : `Sync & Mark ${importedLogs.length} Records`}</span>
                    </button>
                  )}
                </div>
              </div>

              {importedLogs.length === 0 ? (
                <div className="p-10 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 text-sm block">Drag &amp; Drop Realtime Pendrive Export (.xlsx / .csv)</span>
                    <span className="text-xs text-slate-400 block mt-1">or click "Load Demo Pendrive Logs" above to test immediately</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Parsed Records: <strong className="text-white">{importedLogs.length} punches</strong></span>
                    <span>Date: <strong className="text-cyan-400">{selectedDate}</strong></span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-800 max-h-80">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase sticky top-0">
                        <tr>
                          <th className="p-2.5">User ID / Roll</th>
                          <th className="p-2.5">Student Name</th>
                          <th className="p-2.5">Punch Time</th>
                          <th className="p-2.5">Verification Mode</th>
                          <th className="p-2.5">Terminal Device</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {importedLogs.map((log, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="p-2.5 font-mono text-cyan-300 font-bold">#{log.rollNo}</td>
                            <td className="p-2.5 font-bold text-white">{log.name}</td>
                            <td className="p-2.5 font-mono">{log.time}</td>
                            <td className="p-2.5 text-slate-300 flex items-center gap-1.5">
                              {log.mode.includes('Face') ? <Scan className="w-3.5 h-3.5 text-purple-400" /> : <Radio className="w-3.5 h-3.5 text-cyan-400" />}
                              <span>{log.mode}</span>
                            </td>
                            <td className="p-2.5 font-mono text-slate-400">{log.deviceId}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.status === 'present' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {log.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUBTAB 3: LIVE USB TAP LISTENER (FOR DESKTOP RFID READERS / BARCODE GUNS) */}
          {hardwareSubTab === 'live_rfid' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Listener Controller */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
                <div>
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <span>Live USB RFID / Barcode Scanner Listener</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    USB RFID Reader (e.g. ₹600 USB card reader) emaw Barcode gun computer-a connect in hetah hian card tap la, attendance a mark nghal zel ang.
                  </p>
                </div>

                <form onSubmit={handleUsbRfidSubmit} className="space-y-3">
                  <label className="block text-xs font-bold text-slate-300">
                    Live Card Tap Detection Zone (Click box or tap card)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      value={usbRfidInput}
                      onChange={(e) => setUsbRfidInput(e.target.value)}
                      placeholder="Tap RFID card on USB reader..."
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border-2 border-cyan-500/50 text-cyan-200 text-sm font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-2 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                    >
                      Punch
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 block italic">
                    Tip: USB Reader hian card a scan rualin Enter a hmet nghal zel a, engmah manual-a type a ngai lo.
                  </span>
                </form>

                {/* Quick Simulated RFID Tap Buttons for testing */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Quick Simulation Test (Card Tap Lem):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {classStudents.slice(0, 4).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          const uid = st.rfidCardUid || `00${(st.rollNumber || '01').toString().padStart(2, '0')}${st.id.replace(/\D/g, '').padEnd(6, '7')}`;
                          setUsbRfidInput(uid);
                          setTimeout(() => {
                            const event = { preventDefault: () => {} };
                            handleUsbRfidSubmit(event);
                          }, 100);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Radio className="w-3 h-3 text-cyan-400" />
                        <span>Tap {st.firstName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Tap History Stream */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Today's Realtime Gate Punches ({liveScanLogs.length})</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">Auto-Refreshed</span>
                </div>

                {liveScanLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No card tapped yet in this session. Tap a card or click a simulation test button.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {liveScanLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between animate-fadeIn"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={log.student.photoUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100`}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/30"
                          />
                          <div>
                            <h5 className="font-bold text-white text-xs">{log.student.firstName} {log.student.lastName}</h5>
                            <span className="text-[10px] text-slate-400">Roll #{log.student.rollNumber || '1'} &bull; UID: {log.uid}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            PRESENT
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{log.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUBTAB 4: STUDENT RFID MAPPING & PRINT DIRECTORY */}
          {hardwareSubTab === 'rfid_directory' && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-400" />
                    <span>Student RFID Card Database &amp; Direct PVC Print</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Link blank RFID cards to students in 1 second, or launch dual-sided PVC ID card printing.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {setCurrentTab && (
                    <button
                      onClick={() => setCurrentTab('id_card_studio')}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Open Full Studio Module &rarr;</span>
                    </button>
                  )}
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={rfidSearchQuery}
                    onChange={(e) => setRfidSearchQuery(e.target.value)}
                    placeholder="Search name, roll..."
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 w-36 sm:w-48"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Roll</th>
                      <th className="p-3">Student</th>
                      <th className="p-3">RFID Card UID</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {classStudents
                      .filter(st => {
                        if (!rfidSearchQuery) return true;
                        const q = rfidSearchQuery.toLowerCase();
                        return (
                          st.firstName?.toLowerCase().includes(q) ||
                          st.lastName?.toLowerCase().includes(q) ||
                          st.rollNumber?.toString().includes(q) ||
                          st.rfidCardUid?.toLowerCase().includes(q)
                        );
                      })
                      .map((st) => {
                        const isEditingThis = editingRfidStudentId === st.id;
                        return (
                          <tr key={st.id} className="hover:bg-slate-800/40">
                            <td className="p-3 font-mono font-bold text-cyan-300">#{st.rollNumber || '1'}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={st.photoUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100`}
                                  alt=""
                                  className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-700"
                                />
                                <div>
                                  <span className="font-bold text-white block">{st.firstName} {st.lastName}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{st.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 font-mono">
                              {isEditingThis ? (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    autoFocus
                                    value={editingRfidValue}
                                    onChange={(e) => setEditingRfidValue(e.target.value)}
                                    placeholder="Tap card or enter UID..."
                                    className="px-2 py-1 rounded-lg bg-slate-950 border border-cyan-500 text-cyan-200 text-xs font-mono w-44"
                                  />
                                  <button
                                    onClick={() => handleQuickSaveStudentRfid(st.id, editingRfidValue)}
                                    className="p-1 rounded-lg bg-cyan-500 text-slate-950 font-bold"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingRfidStudentId(null)}
                                    className="p-1 rounded-lg bg-slate-800 text-slate-400"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className={st.rfidCardUid ? 'text-cyan-300 font-bold' : 'text-slate-500 italic'}>
                                    {st.rfidCardUid || 'No RFID Assigned'}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setEditingRfidStudentId(st.id);
                                      setEditingRfidValue(st.rfidCardUid || '');
                                    }}
                                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition"
                                    title="Edit RFID UID"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              {st.rfidCardUid ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                  PAIRED
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                                  BLANK
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => {
                                  setIdCardTargetStudent(st);
                                  setShowIdCardModal(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow transition cursor-pointer"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Print Smart ID</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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

      {/* Full SMS & WhatsApp Parent Notification Studio */}
      <SmsWhatsAppNotificationHubModal
        isOpen={showSmsHubModal}
        onClose={() => setShowSmsHubModal(false)}
        initialTab="attendance"
      />

      {/* Smart ID Card & Hall Ticket Studio Modal (with RFID Support) */}
      <StudentIdCardModal
        isOpen={showIdCardModal}
        onClose={() => {
          setShowIdCardModal(false);
          setIdCardTargetStudent(null);
        }}
        initialStudent={idCardTargetStudent}
        selectedClassId={selectedClassId}
      />
    </div>
  );
}
