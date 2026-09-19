/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Mizoram School System (zoxs-sms) - QR Code Generator & Attendance Management Suite
 * Features:
 * 1. Streamlined real-time camera scanner with audio chime and anti-duplicate throttle
 * 2. Automated attendance logging into Firestore 'attendance' collection (Firebase SDK v10.8.0)
 * 3. Configurable morning assembly cut-off time (Auto-detect Present vs Late)
 * 4. Batch Student ID Card Print Studio with customizable templates (Portrait Lanyard, Landscape, Stickers)
 * 5. Interactive live feed with quick roll-call correction and manual simulator
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import jsQR from 'jsqr';
import {
  QrCode,
  Camera,
  CameraOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  Sparkles,
  Upload,
  RefreshCw,
  Printer,
  X,
  Volume2,
  VolumeX,
  Zap,
  Filter,
  Search,
  Check,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Flame,
  FileDown,
  Layers,
  Users,
} from 'lucide-react';
import { FirestoreStudent, AttendanceRecord, SchoolClass } from '../types';
import { db, collection, addDoc, updateDocument, deleteDocument } from '../lib/firebase';
import {
  parseStudentQrText,
  buildStudentQrPayload,
  generateStudentQrDataUrl,
  downloadStudentQrPng,
  CURRENT_ACADEMIC_YEAR,
} from '../lib/qrCodeService';
import { BatchIdCardPrintStudio } from './qr/BatchIdCardPrintStudio';

interface QrAttendanceScannerProps {
  students: FirestoreStudent[];
  classes: SchoolClass[];
  attendance: AttendanceRecord[];
  onAttendanceUpdated?: () => void;
}

type ActiveViewMode = 'scanner' | 'batch-print';

interface ScanLogEntry {
  id: string;
  studentId: string;
  name: string;
  rollNo: number;
  className: string;
  time: string;
  status: 'Present' | 'Late';
  attendanceDocId?: string;
}

export const QrAttendanceScanner: React.FC<QrAttendanceScannerProps> = ({
  students,
  classes,
  attendance,
  onAttendanceUpdated,
}) => {
  // Master View Navigation: Live Scanner vs Batch ID Print Studio
  const [activeView, setActiveView] = useState<ActiveViewMode>('scanner');

  // Camera & Scanner State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedFilterClass, setSelectedFilterClass] = useState<string>('all');
  const [statusMode, setStatusMode] = useState<'auto' | 'force-present' | 'force-late'>('auto');
  const [assemblyCutoffTime, setAssemblyCutoffTime] = useState<string>('09:15'); // 09:15 AM default cutoff

  // Scan Results & Live Feed
  const [lastScannedResult, setLastScannedResult] = useState<{
    student: FirestoreStudent;
    status: 'Present' | 'Late';
    time: string;
    alreadyLogged: boolean;
    remarks?: string;
  } | null>(null);
  const [recentScanFeed, setRecentScanFeed] = useState<ScanLogEntry[]>([]);

  // Simulation & Manual Search
  const [simulatorSearch, setSimulatorSearch] = useState('');

  // Refs for video & canvas loop
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastScannedIdRef = useRef<string | null>(null);
  const lastScannedTimeRef = useRef<number>(0);

  // Play synthetic audio chime for instant feedback
  const playBeep = (isSuccess: boolean = true) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (isSuccess) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(220, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch {
      // Audio context might be restricted before gesture
    }
  };

  // Determine attendance status based on cutoff time or manual override
  const calculateAttendanceStatus = (): 'Present' | 'Late' => {
    if (statusMode === 'force-present') return 'Present';
    if (statusMode === 'force-late') return 'Late';

    const now = new Date();
    const [cutoffHours, cutoffMinutes] = assemblyCutoffTime.split(':').map((n) => parseInt(n, 10));
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    const isAfterCutoff =
      currentHours > cutoffHours ||
      (currentHours === cutoffHours && currentMinutes > cutoffMinutes);

    return isAfterCutoff ? 'Late' : 'Present';
  };

  // Log attendance into Firestore collection 'attendance'
  const logAttendanceForStudent = async (student: FirestoreStudent) => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const timeFormatted = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const status = calculateAttendanceStatus();
    playBeep(true);

    try {
      // Check if student already recorded today
      const existing = attendance.find(
        (a) =>
          (a.studentId === student.id || a.rollNo === student.rollNo) &&
          (a.date === today || !a.date)
      );

      let docId: string;

      if (existing) {
        // Update existing record
        await updateDocument('attendance', existing.id, {
          status,
          markedAt: timeFormatted,
          remarks: `Updated via QR Scanner (${status})`,
        });
        docId = existing.id;
        setLastScannedResult({
          student,
          status,
          time: timeFormatted,
          alreadyLogged: true,
          remarks: 'Updated existing record for today',
        });
      } else {
        // Create new attendance record in Firestore
        const docRef = await addDoc(collection(db, 'attendance'), {
          date: today,
          studentId: student.id,
          studentName: student.name,
          rollNo: student.rollNo,
          classId: student.classId,
          className: student.className,
          status,
          markedAt: timeFormatted,
          remarks: 'Scanned via Teacher QR Badge Scanner',
        });
        docId = docRef.id;
        setLastScannedResult({
          student,
          status,
          time: timeFormatted,
          alreadyLogged: false,
          remarks: 'Recorded new check-in for today',
        });
      }

      // Prepend to recent feed
      setRecentScanFeed((prev) => [
        {
          id: `scan-${Date.now()}`,
          studentId: student.id,
          name: student.name,
          rollNo: student.rollNo,
          className: student.className,
          time: timeFormatted,
          status,
          attendanceDocId: docId,
        },
        ...prev.slice(0, 9),
      ]);

      if (onAttendanceUpdated) {
        onAttendanceUpdated();
      }
    } catch (err) {
      console.error('Error logging attendance to Firestore:', err);
      setCameraError('Failed to record attendance to Firestore. Please check connection.');
      playBeep(false);
    }
  };

  // Process raw scanned QR string from camera or file
  const processScannedCode = (text: string) => {
    const now = Date.now();
    // Throttle duplicate scans of the exact same code within 3 seconds
    if (lastScannedIdRef.current === text && now - lastScannedTimeRef.current < 3000) {
      return;
    }
    lastScannedIdRef.current = text;
    lastScannedTimeRef.current = now;

    const parsed = parseStudentQrText(text);

    let matchedStudent: FirestoreStudent | undefined;

    if (parsed.success) {
      if (parsed.studentId) {
        matchedStudent = students.find((s) => s.id === parsed.studentId);
      }
      if (!matchedStudent && parsed.rollNo !== undefined) {
        // If class is filtered, match in that class first
        if (selectedFilterClass !== 'all') {
          matchedStudent = students.find(
            (s) => s.rollNo === parsed.rollNo && s.classId === selectedFilterClass
          );
        }
        if (!matchedStudent) {
          matchedStudent = students.find((s) => s.rollNo === parsed.rollNo);
        }
      }
      if (!matchedStudent && parsed.name) {
        matchedStudent = students.find((s) =>
          s.name.toLowerCase().includes(parsed.name!.toLowerCase())
        );
      }
    }

    if (matchedStudent) {
      setCameraError(null);
      logAttendanceForStudent(matchedStudent);
    } else {
      playBeep(false);
      setCameraError(`Unrecognized QR code or student not enrolled: "${text.slice(0, 32)}"`);
    }
  };

  // Video scanning loop using jsQR
  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        processScannedCode(code.data);
      }
    }

    if (isCameraActive) {
      animationFrameId.current = requestAnimationFrame(scanFrame);
    }
  };

  // Launch Camera with current facing mode
  const startCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    setCameraError(null);
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        animationFrameId.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        'Camera access was denied or is unavailable. You can use the Quick Simulator below or upload a QR image.'
      );
      setIsCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Toggle Camera Facing Mode (Front vs Back)
  const toggleCameraFacing = async () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    if (isCameraActive) {
      await startCamera(nextFacing);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Upload image file scanner
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);
        if (code) {
          processScannedCode(code.data);
        } else {
          setCameraError('No valid QR Code was detected in the uploaded image.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Roll call statistics calculation for today
  const todayStr = new Date().toISOString().slice(0, 10);
  const filteredStudents = useMemo(() => {
    if (selectedFilterClass === 'all') return students;
    return students.filter((s) => s.classId === selectedFilterClass);
  }, [students, selectedFilterClass]);

  const stats = useMemo(() => {
    const classStudentIds = new Set(filteredStudents.map((s) => s.id));
    const todayLogs = attendance.filter(
      (a) => (a.date === todayStr || !a.date) && classStudentIds.has(a.studentId)
    );

    const present = todayLogs.filter((a) => a.status === 'Present').length;
    const late = todayLogs.filter((a) => a.status === 'Late').length;
    const totalMarked = todayLogs.length;
    const totalEnrolled = filteredStudents.length;
    const unmarked = Math.max(0, totalEnrolled - totalMarked);
    const rate = totalEnrolled > 0 ? Math.round((totalMarked / totalEnrolled) * 100) : 0;

    return { present, late, totalMarked, totalEnrolled, unmarked, rate };
  }, [filteredStudents, attendance, todayStr]);

  // Simulator filtered students
  const simulatorStudents = useMemo(() => {
    return filteredStudents
      .filter(
        (s) =>
          !simulatorSearch.trim() ||
          s.name.toLowerCase().includes(simulatorSearch.toLowerCase()) ||
          s.rollNo.toString().includes(simulatorSearch.trim())
      )
      .slice(0, 12);
  }, [filteredStudents, simulatorSearch]);

  // Update status of recent feed entry
  const handleToggleFeedStatus = async (item: ScanLogEntry) => {
    if (!item.attendanceDocId) return;
    const nextStatus: 'Present' | 'Late' = item.status === 'Present' ? 'Late' : 'Present';
    try {
      await updateDocument('attendance', item.attendanceDocId, {
        status: nextStatus,
        remarks: `Manually corrected to ${nextStatus}`,
      });
      setRecentScanFeed((prev) =>
        prev.map((log) => (log.id === item.id ? { ...log, status: nextStatus } : log))
      );
      if (onAttendanceUpdated) onAttendanceUpdated();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Banner with Mode Switcher */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  QR Code Generator & Attendance Management
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono border border-emerald-500/30">
                  v10.8.0 • col: attendance
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Real-time camera roll-call check-in with automatic cut-off timestamps & official batch ID badge printing.
              </p>
            </div>
          </div>

          {/* Master View Tabs: Scanner vs Batch ID Cards */}
          <div className="flex items-center bg-gray-900 p-1 rounded-xl border border-gray-700 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveView('scanner')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'scanner'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Live Scanner</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('batch-print')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'batch-print'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>ID Cards & Batch Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conditionally Render Active View */}
      {activeView === 'batch-print' ? (
        <BatchIdCardPrintStudio
          students={students}
          classes={classes}
          onScanSimulate={(student) => {
            logAttendanceForStudent(student);
            setActiveView('scanner');
          }}
          onClose={() => setActiveView('scanner')}
        />
      ) : (
        /* LIVE SCANNER INTERFACE */
        <div className="space-y-6">
          {/* Roll Call Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-gray-800 p-3.5 rounded-xl border border-gray-700">
              <div className="text-[10px] uppercase font-mono text-gray-400">Total Enrolled</div>
              <div className="text-xl font-bold text-white mt-1">{stats.totalEnrolled}</div>
              <div className="text-[10px] text-gray-500 font-mono mt-0.5">Students in scope</div>
            </div>

            <div className="bg-gray-800 p-3.5 rounded-xl border border-gray-700">
              <div className="text-[10px] uppercase font-mono text-indigo-400">Scanned Today</div>
              <div className="text-xl font-bold text-indigo-300 mt-1">{stats.totalMarked}</div>
              <div className="text-[10px] text-indigo-400/70 font-mono mt-0.5">{stats.rate}% Rate</div>
            </div>

            <div className="bg-gray-800 p-3.5 rounded-xl border border-gray-700">
              <div className="text-[10px] uppercase font-mono text-emerald-400">Present (On-Time)</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{stats.present}</div>
              <div className="text-[10px] text-emerald-500 font-mono mt-0.5">Before {assemblyCutoffTime}</div>
            </div>

            <div className="bg-gray-800 p-3.5 rounded-xl border border-gray-700">
              <div className="text-[10px] uppercase font-mono text-amber-400">Late Arrival</div>
              <div className="text-xl font-bold text-amber-400 mt-1">{stats.late}</div>
              <div className="text-[10px] text-amber-500 font-mono mt-0.5">After {assemblyCutoffTime}</div>
            </div>

            <div className="bg-gray-800 p-3.5 rounded-xl border border-gray-700">
              <div className="text-[10px] uppercase font-mono text-rose-400">Unmarked / Absent</div>
              <div className="text-xl font-bold text-rose-400 mt-1">{stats.unmarked}</div>
              <div className="text-[10px] text-rose-500 font-mono mt-0.5">Pending badge scan</div>
            </div>

            <div className="bg-gray-800 p-3.5 rounded-xl border border-gray-700">
              <div className="text-[10px] uppercase font-mono text-indigo-400">Cut-off Policy</div>
              <div className="text-lg font-bold text-white mt-1 flex items-center gap-1 font-mono">
                <Clock className="w-4 h-4 text-indigo-400" />
                {assemblyCutoffTime} AM
              </div>
              <div className="text-[10px] text-gray-400 font-mono mt-0.5">Morning Assembly</div>
            </div>
          </div>

          {/* Main Scanner Section Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Viewfinder & Live Camera Feed (7 cols) */}
            <div className="lg:col-span-7 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-md flex flex-col justify-between">
              {/* Camera Header Controls */}
              <div className="p-4 border-b border-gray-700/80 flex flex-wrap items-center justify-between gap-3 bg-gray-850">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Live Optical Scanner
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Audio Mute/Unmute */}
                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 cursor-pointer"
                    title={soundEnabled ? 'Mute Beep Chime' : 'Unmute Beep Chime'}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
                  </button>

                  {/* Camera Facing Switcher */}
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 cursor-pointer"
                    title="Switch Camera (Front / Back)"
                  >
                    <RefreshCw className="w-4 h-4 text-indigo-400" />
                  </button>

                  {/* Start / Stop Camera */}
                  {isCameraActive ? (
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30 transition-colors cursor-pointer"
                    >
                      <CameraOff className="w-3.5 h-3.5" />
                      Stop Camera
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startCamera()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-sm"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Launch Camera
                    </button>
                  )}
                </div>
              </div>

              {/* Camera Stage Container */}
              <div className="relative bg-gray-950 aspect-video flex items-center justify-center overflow-hidden">
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Viewfinder Target Reticle */}
                {isCameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                    <div className="relative w-64 h-64 border-2 border-indigo-400/60 rounded-2xl flex items-center justify-center">
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>

                      {/* Sweeping Laser Line */}
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse"></div>

                      <span className="text-[11px] font-mono text-white/90 bg-black/70 px-3 py-1 rounded-full border border-gray-700/60 shadow-md">
                        Align Student QR Badge Here
                      </span>
                    </div>
                  </div>
                )}

                {/* Standby Placeholder */}
                {!isCameraActive && (
                  <div className="p-8 text-center space-y-3 max-w-sm">
                    <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 mx-auto flex items-center justify-center text-gray-500">
                      <QrCode className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Camera Standby Mode</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Point camera at student ID card or badge. The system automatically reads details and marks attendance.
                      </p>
                    </div>
                    <div className="pt-2 flex flex-wrap justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => startCamera()}
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-sm"
                      >
                        Start Camera
                      </button>
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-750 text-gray-300 border border-gray-700 cursor-pointer">
                        <Upload className="w-3.5 h-3.5 text-indigo-400" />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message Toast if any */}
              {cameraError && (
                <div className="p-3 bg-rose-950/40 border-t border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <div className="flex-1">{cameraError}</div>
                  <button
                    type="button"
                    onClick={() => setCameraError(null)}
                    className="text-rose-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Scanner Control Bar */}
              <div className="p-4 bg-gray-850 border-t border-gray-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Class Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-[11px] uppercase font-mono">Class:</span>
                  <select
                    value={selectedFilterClass}
                    onChange={(e) => setSelectedFilterClass(e.target.value)}
                    className="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1 text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="all">All Classes & Streams</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} {cls.stream ? `(${cls.stream})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Policy & Override Mode */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400 text-[11px] uppercase font-mono">Cutoff:</span>
                    <input
                      type="time"
                      value={assemblyCutoffTime}
                      onChange={(e) => setAssemblyCutoffTime(e.target.value)}
                      className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-white font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-gray-900 p-0.5 rounded-lg border border-gray-700">
                    <button
                      type="button"
                      onClick={() => setStatusMode('auto')}
                      className={`px-2 py-1 rounded text-[10px] font-mono cursor-pointer ${
                        statusMode === 'auto' ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400'
                      }`}
                      title="Automatically mark Present or Late based on cutoff time"
                    >
                      Auto
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusMode('force-present')}
                      className={`px-2 py-1 rounded text-[10px] font-mono cursor-pointer ${
                        statusMode === 'force-present'
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'text-gray-400'
                      }`}
                      title="Force mark as Present regardless of time"
                    >
                      Force Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusMode('force-late')}
                      className={`px-2 py-1 rounded text-[10px] font-mono cursor-pointer ${
                        statusMode === 'force-late'
                          ? 'bg-amber-600 text-white font-bold'
                          : 'text-gray-400'
                      }`}
                      title="Force mark as Late"
                    >
                      Force Late
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Last Scan Confirmation & Live Check-in Feed (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Last Scanned Student Dossier Card */}
              {lastScannedResult ? (
                <div className="p-4 bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl border border-indigo-500/40 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold">
                          Attendance Logged to Firestore
                        </span>
                        <h3 className="text-sm font-bold text-white mt-0.5">
                          {lastScannedResult.student.name}
                        </h3>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                        lastScannedResult.status === 'Present'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {lastScannedResult.status}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono bg-gray-900/80 p-3 rounded-lg border border-gray-750">
                    <div>
                      <span className="text-gray-500 text-[10px] block">Roll Number</span>
                      <strong className="text-white">#{lastScannedResult.student.rollNo}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] block">Class / Stream</span>
                      <strong className="text-indigo-300 truncate block">
                        {lastScannedResult.student.className}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] block">Check-in Time</span>
                      <strong className="text-white">{lastScannedResult.time}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] block">Parent Phone</span>
                      <strong className="text-gray-300">
                        {lastScannedResult.student.parentPhone || 'N/A'}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-400">
                    <span className="font-mono text-[10px] text-gray-500">
                      {lastScannedResult.remarks}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLastScannedResult(null)}
                      className="text-gray-400 hover:text-white text-[11px] cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-800 rounded-xl border border-gray-700 text-center text-gray-400">
                  <UserCheck className="w-8 h-8 mx-auto text-gray-600 mb-1.5" />
                  <p className="text-xs font-semibold text-gray-300">Awaiting Next Badge Scan</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Scanned student identity, time, and roll call status will confirm here instantly.
                  </p>
                </div>
              )}

              {/* Live Chronological Check-In Feed */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Recent Check-In Stream
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">
                    Today's Session ({recentScanFeed.length})
                  </span>
                </div>

                {recentScanFeed.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 text-xs font-mono">
                    No badges scanned yet in this session.
                  </div>
                ) : (
                  <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
                    {recentScanFeed.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 bg-gray-900/80 rounded-lg border border-gray-750 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                            {item.rollNo}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white truncate">{item.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              {item.className} • {item.time}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleFeedStatus(item)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                              item.status === 'Present'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                            }`}
                            title="Click to toggle between Present and Late"
                          >
                            {item.status}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Simulator Roster Fallback (When Camera is not available) */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 shadow-md">
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-700">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Quick Simulator Roster
                    </h4>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Instant 1-Click Scan Test
                  </span>
                </div>

                <p className="text-[11px] text-gray-400 mt-2">
                  Test the attendance logging flow without camera permissions by clicking any student below:
                </p>

                <div className="mt-2.5">
                  <input
                    type="text"
                    value={simulatorSearch}
                    onChange={(e) => setSimulatorSearch(e.target.value)}
                    placeholder="Search student to simulate scan..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {simulatorStudents.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => logAttendanceForStudent(student)}
                      className="p-2 rounded-lg bg-gray-900 hover:bg-indigo-950/50 border border-gray-750 hover:border-indigo-500/50 text-left transition-all cursor-pointer flex items-center justify-between gap-1 group"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white group-hover:text-indigo-300 truncate">
                          {student.name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          Roll #{student.rollNo}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-indigo-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
