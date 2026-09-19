/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Mizoram School System (zoxs-sms) - Parent / Student / Guardian Portal
 * Responsive, dark-themed, mobile-first dashboard powered by Firebase SDK v10.8.0.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  GraduationCap,
  CalendarCheck,
  CreditCard,
  Bell,
  Printer,
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  User,
  Phone,
  MapPin,
  School,
  FileText,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  AlertCircle,
  Send,
  Download,
  Filter,
  Eye,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';
import {
  FirestoreStudent,
  SchoolClass,
  AttendanceRecord,
  FeeRecord,
  GradeRecord,
  NoticeItem,
  UserRole,
} from '../../types';
import {
  DEFAULT_UPI_CONFIG,
  buildUpiPaymentUri,
  generateUpiQrDataUrl,
  validateUtrNumber,
} from '../../lib/upiPaymentService';
import { recordFeeTransaction } from '../../lib/feeService';
import { updateDocument } from '../../lib/firebase';
import { AuthSession } from '../../lib/authService';

interface ParentStudentPortalProps {
  students: FirestoreStudent[];
  classes: SchoolClass[];
  attendance: AttendanceRecord[];
  fees: FeeRecord[];
  grades: GradeRecord[];
  notices: NoticeItem[];
  userRole: UserRole;
  currentStudentId?: string;
  loggedSession?: AuthSession | null;
  onSignOut?: () => void;
  onExitToAdmin?: () => void;
  onOpenUpiModal?: (fee: FeeRecord) => void;
}

export const ParentStudentPortal: React.FC<ParentStudentPortalProps> = ({
  students,
  classes,
  attendance,
  fees,
  grades,
  notices,
  userRole,
  currentStudentId,
  loggedSession,
  onSignOut,
  onExitToAdmin,
  onOpenUpiModal,
}) => {
  // Selected student (defaults to passed currentStudentId, loggedSession studentId, or first student)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (currentStudentId) return currentStudentId;
    if (loggedSession?.studentId) return loggedSession.studentId;
    return students.length > 0 ? students[0].id : '';
  });

  // Keep selected student in sync if loggedSession updates
  useEffect(() => {
    if (loggedSession?.studentId) {
      setSelectedStudentId(loggedSession.studentId);
    }
  }, [loggedSession]);

  const [activeTab, setActiveTab] = useState<
    'academics' | 'attendance' | 'fees' | 'notices' | 'id_card'
  >('academics');

  // Term filter for Gradebook
  const [selectedTerm, setSelectedTerm] = useState<string>('Term 1 (Half Yearly Exam 2026)');

  // Search & filter for Notices
  const [noticeSearch, setNoticeSearch] = useState('');
  const [selectedNoticeCategory, setSelectedNoticeCategory] = useState<string>('All');

  // Modals
  const [isReportCardModalOpen, setIsReportCardModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceiptForModal, setSelectedReceiptForModal] = useState<FeeRecord | null>(null);

  // Absence excuse modal state
  const [isExcuseModalOpen, setIsExcuseModalOpen] = useState(false);
  const [excuseRecord, setExcuseRecord] = useState<AttendanceRecord | null>(null);
  const [excuseReason, setExcuseReason] = useState('');
  const [excuseSubmitting, setExcuseSubmitting] = useState(false);
  const [excuseSuccessMessage, setExcuseSuccessMessage] = useState<string | null>(null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Record<string, boolean>>({});

  // UPI Quick Pay state inside portal
  const [showUpiPayBox, setShowUpiPayBox] = useState(false);
  const [upiUtrInput, setUpiUtrInput] = useState('');
  const [upiSubmitting, setUpiSubmitting] = useState(false);
  const [upiSuccessMessage, setUpiSuccessMessage] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [studentQrBadgeUrl, setStudentQrBadgeUrl] = useState<string>('');

  // Find active student
  const activeStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0] || null;
  }, [students, selectedStudentId]);

  // Find student's class
  const studentClass = useMemo(() => {
    if (!activeStudent) return null;
    return classes.find((c) => c.id === activeStudent.classId) || null;
  }, [activeStudent, classes]);

  // Find student's grades
  const studentGrade = useMemo(() => {
    if (!activeStudent) return null;
    return (
      grades.find(
        (g) => g.studentId === activeStudent.id && (g.examTerm === selectedTerm || !g.examTerm)
      ) ||
      grades.find((g) => g.studentId === activeStudent.id) ||
      null
    );
  }, [activeStudent, grades, selectedTerm]);

  // Find student's fee records (all records for history)
  const studentFeesList = useMemo(() => {
    if (!activeStudent) return [];
    return fees.filter((f) => f.studentId === activeStudent.id);
  }, [activeStudent, fees]);

  // Active primary fee record
  const studentFee = useMemo(() => {
    if (!activeStudent) return null;
    return (
      studentFeesList.find((f) => f.status === 'Pending' || f.status === 'Overdue') ||
      studentFeesList[0] ||
      null
    );
  }, [activeStudent, studentFeesList]);

  // Find student's attendance records
  const studentAttendance = useMemo(() => {
    if (!activeStudent) return [];
    return attendance
      .filter((a) => a.studentId === activeStudent.id)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [activeStudent, attendance]);

  // Check for recent absence (alerts)
  const recentAbsences = useMemo(() => {
    return studentAttendance.filter(
      (a) =>
        (a.status === 'Absent' || a.status === 'Late') &&
        !acknowledgedAlerts[a.id]
    );
  }, [studentAttendance, acknowledgedAlerts]);

  // Filtered notices specifically relevant to this student's class and school-wide
  const relevantNotices = useMemo(() => {
    return notices
      .filter((n) => {
        if (!n.isActive) return false;

        // Class-specific filtering: include if targetAudience is All, Parents & Students, or matches student's class
        const matchesAudience =
          n.targetAudience === 'All' ||
          n.targetAudience === 'Parents & Students' ||
          (activeStudent && n.targetAudience === (activeStudent.className as any)) ||
          (activeStudent && n.title.toLowerCase().includes(activeStudent.className.toLowerCase())) ||
          (activeStudent && n.content.toLowerCase().includes(activeStudent.className.toLowerCase()));

        if (!matchesAudience) return false;

        // Category filter
        if (selectedNoticeCategory !== 'All' && n.category !== selectedNoticeCategory) {
          return false;
        }

        // Search query
        if (noticeSearch.trim()) {
          const q = noticeSearch.toLowerCase();
          return (
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q) ||
            n.noticeNo.toLowerCase().includes(q)
          );
        }

        return true;
      })
      .sort((a, b) => (a.isPinned ? -1 : b.isPinned ? 1 : a.publishDate < b.publishDate ? 1 : -1));
  }, [notices, activeStudent, selectedNoticeCategory, noticeSearch]);

  // Attendance stats
  const attendanceStats = useMemo(() => {
    const total = studentAttendance.length;
    if (total === 0) return { total: 0, present: 0, absent: 0, late: 0, percentage: 100 };
    const present = studentAttendance.filter((a) => a.status === 'Present').length;
    const absent = studentAttendance.filter((a) => a.status === 'Absent').length;
    const late = studentAttendance.filter((a) => a.status === 'Late').length;
    const percentage = Math.round(((present + late * 0.5) / total) * 100);
    return { total, present, absent, late, percentage };
  }, [studentAttendance]);

  // Outstanding fee
  const outstandingFee = studentFee
    ? Math.max(0, studentFee.totalAmount - studentFee.paidAmount)
    : 0;
  const isFeeCleared = studentFee?.status === 'Paid' || outstandingFee === 0;

  // UPI Payment Uri calculation
  const upiUris = useMemo(() => {
    if (!studentFee || !activeStudent) return null;
    const due = Math.max(0, studentFee.totalAmount - studentFee.paidAmount);
    return buildUpiPaymentUri({
      vpa: DEFAULT_UPI_CONFIG.vpa,
      payeeName: DEFAULT_UPI_CONFIG.payeeName,
      amount: due > 0 ? due : studentFee.totalAmount,
      referenceId: `ZOXS-${activeStudent.rollNo}-${Date.now().toString().slice(-4)}`,
      transactionNote: `Fee for ${activeStudent.name} (${activeStudent.className})`,
    });
  }, [studentFee, activeStudent]);

  // Generate UPI QR
  useEffect(() => {
    if (upiUris) {
      generateUpiQrDataUrl(upiUris.standardUri).then(setQrDataUrl);
    }
  }, [upiUris]);

  // Generate Student Digital ID Gate Badge QR
  useEffect(() => {
    if (activeStudent) {
      const qrPayload = JSON.stringify({
        app: 'zoxs-sms',
        id: activeStudent.id,
        roll: activeStudent.rollNo,
        name: activeStudent.name,
        class: activeStudent.className,
        parentPhone: activeStudent.parentPhone,
      });
      generateUpiQrDataUrl(qrPayload).then(setStudentQrBadgeUrl);
    }
  }, [activeStudent]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(DEFAULT_UPI_CONFIG.vpa);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmitUpiUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFee || !activeStudent) return;
    const cleanUtr = upiUtrInput.trim();
    if (!validateUtrNumber(cleanUtr)) {
      alert('Khawngaihin 12-digit UPI UTR / Transaction ID dik tak chhu lut rawh le.');
      return;
    }

    setUpiSubmitting(true);
    try {
      const due = Math.max(0, studentFee.totalAmount - studentFee.paidAmount);
      const payAmount = due > 0 ? due : 500;
      await recordFeeTransaction({
        feeRecordId: studentFee.id,
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        paymentAmount: payAmount,
        paymentMethod: 'UPI (GPay / PhonePe)',
        paymentChannel: 'UPI',
        referenceNumber: cleanUtr,
        receivedBy: 'Parent / Student Online Portal',
        notes: `Online UPI verification submitted by ${activeStudent.name}'s parent. UTR: ${cleanUtr}`,
        currentFeeRecord: studentFee,
        allFeeRecords: fees,
        allStudents: students,
      });
      setUpiSuccessMessage(`Payment recorded successfully! UTR Ref: ${cleanUtr}. Receipt generated.`);
      setUpiUtrInput('');
      setShowUpiPayBox(false);
    } catch (err: any) {
      alert('Error updating payment: ' + (err.message || 'Unknown error'));
    } finally {
      setUpiSubmitting(false);
    }
  };

  const handleOpenExcuseModal = (rec: AttendanceRecord) => {
    setExcuseRecord(rec);
    setExcuseReason('');
    setExcuseSuccessMessage(null);
    setIsExcuseModalOpen(true);
  };

  const handleSubmitExcuse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excuseRecord || !excuseReason.trim()) return;

    setExcuseSubmitting(true);
    try {
      const updatedRemarks = `Parent Excuse Note: "${excuseReason.trim()}" (Submitted via Portal)`;
      await updateDocument<AttendanceRecord>('attendance', excuseRecord.id, {
        remarks: updatedRemarks,
      });

      // Mark acknowledged in local state
      setAcknowledgedAlerts((prev) => ({ ...prev, [excuseRecord.id]: true }));
      setExcuseSuccessMessage('Leave excuse note submitted successfully to the school administration.');
      setTimeout(() => {
        setIsExcuseModalOpen(false);
      }, 1800);
    } catch (err: any) {
      alert('Failed to submit excuse note: ' + (err.message || 'Unknown error'));
    } finally {
      setExcuseSubmitting(false);
    }
  };

  const handleAcknowledgeAlert = (recId: string) => {
    setAcknowledgedAlerts((prev) => ({ ...prev, [recId]: true }));
  };

  if (!activeStudent) {
    return (
      <div className="p-8 text-center bg-gray-900 border border-gray-800 rounded-3xl">
        <p className="text-gray-400 text-sm">No student records available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* Top Mobile & Desktop Portal Header Bar */}
      <div className="bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-base shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Mizoram School System</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
                Portal v10.8.0
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              {loggedSession
                ? `Logged in as ${loggedSession.name} (${loggedSession.role})`
                : `${userRole} Access Mode`}
            </p>
          </div>
        </div>

        {/* Right Actions: Student Switcher, Exit, Sign Out */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Multi-child / Student Profile Switcher */}
          <div className="flex items-center gap-1.5 bg-gray-950 px-2.5 py-1.5 rounded-xl border border-gray-800 text-xs">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer max-w-[180px] truncate"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id} className="bg-gray-900 text-white">
                  {s.name} ({s.className})
                </option>
              ))}
            </select>
          </div>

          {onExitToAdmin && (
            <button
              type="button"
              onClick={onExitToAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors cursor-pointer border border-gray-700"
              title="Return to Administrative Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin Dashboard</span>
              <span className="sm:hidden">Admin</span>
            </button>
          )}

          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
              title="Sign Out of Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          REAL-TIME ABSENCE ALERT BANNER (IF ANY RECENT ABSENCE UNACKNOWLEDGED)
          ========================================================================= */}
      {recentAbsences.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-4 sm:p-5 shadow-lg animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-200 uppercase tracking-wider">
                    School Attendance Alert
                  </span>
                  <span className="px-2 py-0.2 rounded-full bg-rose-500 text-gray-950 text-[10px] font-bold">
                    Action Required
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  {activeStudent.name} was marked {recentAbsences[0].status} on {recentAbsences[0].date}
                </h3>
                <p className="text-xs text-rose-300/80 mt-1">
                  Time logged: {recentAbsences[0].markedAt || '08:50 AM'} • Remark:{' '}
                  {recentAbsences[0].remarks || 'Uninformed absence recorded during morning roll call.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => handleOpenExcuseModal(recentAbsences[0])}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow-md shadow-rose-600/20 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Excuse Note</span>
              </button>
              <button
                type="button"
                onClick={() => handleAcknowledgeAlert(recentAbsences[0].id)}
                className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium cursor-pointer transition-colors border border-gray-700"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          HERO STUDENT PROFILE BANNER
          ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/90 via-gray-900 to-gray-950 border border-indigo-500/20 p-5 sm:p-7 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-600/40 to-purple-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-200 font-extrabold text-2xl sm:text-3xl shadow-inner shrink-0">
                {activeStudent.name.charAt(0)}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-gray-900 flex items-center justify-center text-[10px] text-white">
                ✓
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                  {userRole === 'Parent' ? 'Nu leh Pa Portal (Parent)' : 'Zirlai Portal (Student)'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-mono border border-emerald-500/30">
                  MBSE Affiliated
                </span>
                {activeStudent.stream && activeStudent.stream !== 'General' && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
                    Stream: {activeStudent.stream}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>{activeStudent.name}</span>
                <span className="text-sm sm:text-base font-normal text-gray-400">
                  (Roll #{activeStudent.rollNo})
                </span>
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
                <span className="text-gray-300 font-medium">{activeStudent.className}</span>
                <span>•</span>
                <span>{activeStudent.address || 'Aizawl, Mizoram'}</span>
                <span>•</span>
                <span className="text-gray-300">Contact: {activeStudent.parentPhone}</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">Status: {activeStudent.status || 'Active'}</span>
              </div>
            </div>
          </div>

          {/* Quick ID Badge Access Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('id_card')}
              className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-750 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <QrCode className="w-4 h-4 text-indigo-400" />
              <span>Digital Gate Pass & QR Badge</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-800/80">
          <div className="bg-gray-900/70 p-3.5 rounded-2xl border border-gray-800">
            <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mb-1">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Academic Score</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-white">
              {studentGrade ? `${studentGrade.percentage}%` : `${activeStudent.marks}%`}
              <span className="ml-1.5 text-xs font-semibold text-emerald-400">
                ({studentGrade?.overallGrade || 'A1'})
              </span>
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Rank #{studentGrade?.rank || 1} in class</div>
          </div>

          <div className="bg-gray-900/70 p-3.5 rounded-2xl border border-gray-800">
            <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mb-1">
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              <span>Attendance Rate</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-white flex items-center gap-1.5">
              <span>{attendanceStats.percentage}%</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  attendanceStats.percentage >= 75
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {attendanceStats.percentage >= 75 ? 'Eligible' : 'Low'}
              </span>
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">{attendanceStats.present} present days</div>
          </div>

          <div className="bg-gray-900/70 p-3.5 rounded-2xl border border-gray-800">
            <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mb-1">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Tuition Fee Status</span>
            </div>
            <div className="text-lg sm:text-xl font-bold">
              {isFeeCleared ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Cleared
                </span>
              ) : (
                <span className="text-amber-400">₹{outstandingFee} Due</span>
              )}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              {studentFee?.feeMonth || 'September 2026'}
            </div>
          </div>

          <div className="bg-gray-900/70 p-3.5 rounded-2xl border border-gray-800">
            <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mb-1">
              <Bell className="w-4 h-4 text-cyan-400" />
              <span>Class Notices</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-white">
              {relevantNotices.length} Circular{relevantNotices.length !== 1 ? 's' : ''}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Relevant to {activeStudent.className}</div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          DESKTOP & TABLET NAVIGATION TABS
          ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('academics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
            activeTab === 'academics'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-850'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Academics & Gradebook</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-800 text-indigo-200">
            Tests & Exams
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-850'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Attendance & Absence Alerts</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-300">
            {attendanceStats.percentage}%
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fees')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
            activeTab === 'fees'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-850'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Fees, Ledger & UPI Pay</span>
          {outstandingFee > 0 ? (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-gray-950 font-bold">
              ₹{outstandingFee}
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              Paid
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notices')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
            activeTab === 'notices'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-850'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>School Circulars</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-300">
            {relevantNotices.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('id_card')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
            activeTab === 'id_card'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-850'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Student ID & QR Badge</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: ACADEMICS & GRADEBOOK (Strict Separation: Class Tests vs Exams)
          ========================================================================= */}
      {activeTab === 'academics' && (
        <div className="space-y-6">
          {/* Header Action Bar with Term Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-900 p-4 sm:p-5 rounded-2xl border border-gray-800 shadow-md">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Continuous Assessment & Examination Record</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium">
                  MBSE Grading Pattern
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Strict separation of Class Tests / Continuous (20%) and Term Examinations (80%).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Term Selector */}
              <div className="flex items-center gap-1.5 bg-gray-950 px-3 py-1.5 rounded-xl border border-gray-800 text-xs">
                <span className="text-[10px] text-gray-400 font-mono">Term:</span>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="Term 1 (Half Yearly Exam 2026)" className="bg-gray-900 text-white">
                    Term 1 (Half Yearly 2026)
                  </option>
                  <option value="Terminal 2 (Quarterly Review)" className="bg-gray-900 text-white">
                    Terminal 2 (Quarterly Review)
                  </option>
                  <option value="Annual Board Examination 2027" className="bg-gray-900 text-white">
                    Annual Board Exam 2027
                  </option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsReportCardModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-all shadow-md shadow-emerald-600/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Report Card</span>
              </button>
            </div>
          </div>

          {/* Academic Assessment Breakdown Table */}
          {studentGrade && studentGrade.subjects && studentGrade.subjects.length > 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-lg">
              <div className="p-4 sm:p-5 bg-gray-850/70 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <span>Subject-Wise Marksheet ({studentGrade.examTerm || selectedTerm})</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Calculated composite score: Class Tests (20%) + Board Term Theory Exams (80%)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                    <span className="text-gray-400">Class Rank: </span>
                    <span className="font-bold text-emerald-400">#{studentGrade.rank || 1}</span>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    <span className="text-gray-400">Aggregate: </span>
                    <span className="font-bold text-emerald-400">{studentGrade.percentage}% ({studentGrade.overallGrade})</span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-900 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                    <tr>
                      <th className="py-3.5 px-4">Subject</th>
                      <th className="py-3.5 px-3 text-center bg-indigo-950/40 text-indigo-300 border-x border-gray-800/80">
                        Class Tests (20%)
                      </th>
                      <th className="py-3.5 px-3 text-center bg-purple-950/40 text-purple-300 border-r border-gray-800/80">
                        Term Exam (80%)
                      </th>
                      <th className="py-3.5 px-3 text-center">Composite Marks</th>
                      <th className="py-3.5 px-3 text-center">Max Marks</th>
                      <th className="py-3.5 px-3 text-center">Percentage</th>
                      <th className="py-3.5 px-4 text-center">MBSE Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {studentGrade.subjects.map((sub, idx) => {
                      const ctMarks = sub.classTestObtained ?? Math.round(sub.marksObtained * 0.2);
                      const ctMax = sub.classTestMax ?? 20;
                      const exMarks = sub.examObtained ?? Math.round(sub.marksObtained * 0.8);
                      const exMax = sub.examMax ?? 80;
                      const totalObtained = sub.marksObtained;
                      const totalMax = sub.maxMarks || 100;
                      const pct = Math.round((totalObtained / totalMax) * 100);

                      return (
                        <tr key={idx} className="hover:bg-gray-850/50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span>{sub.subjectName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-center bg-indigo-950/20 font-mono text-indigo-300 border-x border-gray-800/60">
                            <span className="font-bold">{ctMarks}</span>
                            <span className="text-gray-500 text-[11px]"> / {ctMax}</span>
                          </td>
                          <td className="py-3.5 px-3 text-center bg-purple-950/20 font-mono text-purple-300 border-r border-gray-800/60">
                            <span className="font-bold">{exMarks}</span>
                            <span className="text-gray-500 text-[11px]"> / {exMax}</span>
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono font-bold text-white">
                            {totalObtained}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-gray-400">
                            {totalMax}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-gray-800 overflow-hidden hidden sm:block">
                                <div
                                  className={`h-full rounded-full ${
                                    pct >= 85 ? 'bg-emerald-400' : pct >= 70 ? 'bg-indigo-400' : 'bg-amber-400'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="font-mono font-bold text-gray-200">{pct}%</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                                sub.grade.startsWith('A')
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : sub.grade.startsWith('B')
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {sub.grade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Totals Footer */}
                  <tfoot className="bg-gray-850 font-semibold text-white border-t-2 border-gray-700">
                    <tr>
                      <td className="py-3.5 px-4">Aggregate Total & Result</td>
                      <td className="py-3.5 px-3 text-center font-mono text-indigo-300 bg-indigo-950/40 border-x border-gray-800">
                        {studentGrade.totalClassTestObtained || 92} / {studentGrade.totalClassTestMax || 100}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-purple-300 bg-purple-950/40 border-r border-gray-800">
                        {studentGrade.totalExamObtained || 372} / {studentGrade.totalExamMax || 400}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-emerald-400 font-bold">
                        {studentGrade.totalMarksObtained}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-gray-400">
                        {studentGrade.totalMaxMarks}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-emerald-400 font-bold">
                        {studentGrade.percentage}%
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white text-xs font-bold shadow-xs">
                          {studentGrade.overallGrade} ({studentGrade.status})
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {studentGrade.teacherRemarks && (
                <div className="p-4 sm:p-5 bg-gray-900 border-t border-gray-800 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-indigo-300">Class Teacher's Remark:</span>
                    <p className="text-xs text-gray-300 italic mt-0.5 leading-relaxed">
                      "{studentGrade.teacherRemarks}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 text-center">
              <GraduationCap className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-base font-medium text-gray-300">No Grade Records Published For {selectedTerm}</p>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Assessments for {activeStudent.name} are currently being audited by the Mizoram examination committee.
              </p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: ATTENDANCE HISTORY & ABSENCE ALERT LOGS
          ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-md">
              <div className="text-xs text-gray-400 mb-1 flex items-center justify-between">
                <span>Present Sessions</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-emerald-400 font-mono">
                {attendanceStats.present}
                <span className="text-xs text-gray-500 font-normal"> / {attendanceStats.total} Sessions</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1.5">Punctual and logged via scanner</div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-md">
              <div className="text-xs text-gray-400 mb-1 flex items-center justify-between">
                <span>Absent Logs</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-3xl font-bold text-rose-400 font-mono">
                {attendanceStats.absent}
              </div>
              <div className="text-[11px] text-gray-400 mt-1.5">
                {attendanceStats.absent > 0
                  ? 'Parent notifications logged'
                  : 'Zero unexcused absences on record'}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-md">
              <div className="text-xs text-gray-400 mb-1 flex items-center justify-between">
                <span>MBSE Eligibility Check</span>
                <Award className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-bold font-mono">
                {attendanceStats.percentage >= 75 ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-6 h-6" /> Eligible
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-6 h-6" /> Shortage
                  </span>
                )}
              </div>
              <div className="text-[11px] text-gray-400 mt-1.5">
                Minimum 75% attendance required for MBSE Board Exams
              </div>
            </div>
          </div>

          {/* Daily Attendance Log Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-lg">
            <div className="p-4 sm:p-5 bg-gray-850/70 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-emerald-400" />
                  <span>Daily Check-in & Gate Scanner Logs</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Synchronized live from teacher attendance registers and QR gate scanners
                </p>
              </div>
              <span className="text-xs font-mono text-gray-400 px-3 py-1 rounded-lg bg-gray-950 border border-gray-800 self-start sm:self-auto">
                {studentAttendance.length} Total Sessions
              </span>
            </div>

            {studentAttendance.length > 0 ? (
              <div className="divide-y divide-gray-800">
                {studentAttendance.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-850/40 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`p-2.5 rounded-xl text-xs font-bold shrink-0 ${
                          log.status === 'Present'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : log.status === 'Absent'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {log.status === 'Present' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : log.status === 'Absent' ? (
                          <AlertTriangle className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{log.date}</span>
                          <span className="text-[11px] text-gray-400 font-normal">
                            ({new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' })})
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 flex flex-wrap items-center gap-2 mt-0.5">
                          <span>Gate Check-in: {log.markedAt || '08:45 AM'}</span>
                          {log.remarks && (
                            <span className="text-indigo-300 font-medium">• {log.remarks}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {log.status === 'Absent' && (
                        <button
                          type="button"
                          onClick={() => handleOpenExcuseModal(log)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-750 text-indigo-300 border border-indigo-500/30 transition-colors cursor-pointer"
                        >
                          Excuse Note
                        </button>
                      )}

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          log.status === 'Present'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : log.status === 'Absent'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-gray-400 text-xs">
                No attendance entries recorded for this student yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: FEES, PAYMENT HISTORY & INSTANT UPI SCANNER
          ========================================================================= */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          {upiSuccessMessage && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4 flex items-center gap-3 text-emerald-300 text-xs shadow-lg animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{upiSuccessMessage}</span>
            </div>
          )}

          {studentFee ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Fee Voucher & Itemized Breakdown */}
              <div className="lg:col-span-2 space-y-5">
                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 sm:p-7 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">INVOICE #{studentFee.receiptNo}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isFeeCleared
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {isFeeCleared ? 'Fully Cleared' : 'Payment Outstanding'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">
                        {studentFee.feeMonth} Academic & Composite Fees
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Statutory Due Date: <span className="text-gray-200 font-semibold">{studentFee.dueDate}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReceiptForModal(studentFee);
                        setIsReceiptModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 cursor-pointer transition-colors shadow-xs shrink-0"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Voucher Slip</span>
                    </button>
                  </div>

                  {/* Itemized Fee Breakdown Table */}
                  <div className="mt-5 space-y-2.5 text-xs">
                    <div className="flex justify-between py-2 border-b border-gray-800/60 text-gray-300">
                      <span>Monthly Academic Tuition Fee</span>
                      <span className="font-mono text-white">₹1,400</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800/60 text-gray-300">
                      <span>MBSE Term Examination & Assessment Fee</span>
                      <span className="font-mono text-white">₹300</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800/60 text-gray-300">
                      <span>Computer & Science Laboratory Maintenance</span>
                      <span className="font-mono text-white">₹250</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800/60 text-gray-300">
                      <span>School Campus Development & Infrastructure</span>
                      <span className="font-mono text-white">₹150</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800/60 text-gray-300">
                      <span>Library & Sports Co-Curricular Fund</span>
                      <span className="font-mono text-white">₹100</span>
                    </div>
                    <div className="flex justify-between pt-3 text-sm font-bold text-white">
                      <span>Total Billed Amount:</span>
                      <span className="font-mono">₹{studentFee.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-emerald-400">
                      <span>Amount Credited to Date:</span>
                      <span className="font-mono">₹{studentFee.paidAmount}</span>
                    </div>
                    {outstandingFee > 0 && (
                      <div className="flex justify-between text-base font-bold text-amber-400 pt-2 border-t border-gray-800">
                        <span>Net Balance Due:</span>
                        <span className="font-mono">₹{outstandingFee}</span>
                      </div>
                    )}
                  </div>

                  {/* Payment History Log */}
                  {studentFee.paymentHistory && studentFee.paymentHistory.length > 0 && (
                    <div className="mt-7 pt-6 border-t border-gray-800">
                      <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center justify-between">
                        <span>Payment History & Official Receipts</span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {studentFee.paymentHistory.length} Audited Receipts
                        </span>
                      </h4>
                      <div className="space-y-2.5">
                        {studentFee.paymentHistory.map((tx, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-850/80 p-3.5 rounded-2xl border border-gray-800 flex items-center justify-between text-xs hover:border-gray-700 transition-colors"
                          >
                            <div>
                              <div className="font-bold text-white flex items-center gap-2">
                                <span>Receipt #{tx.receiptNo}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                  {tx.paymentMethod}
                                </span>
                              </div>
                              <div className="text-[11px] text-gray-400 mt-0.5">
                                Date: {tx.paymentDate} • Ref: {tx.referenceNumber || 'Cash Desk'} • {tx.receivedBy}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-sm font-mono font-bold text-emerald-400">
                                  +₹{tx.amount}
                                </div>
                                <span className="text-[10px] text-emerald-400 font-semibold">Verified</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedReceiptForModal({
                                    ...studentFee,
                                    receiptNo: tx.receiptNo,
                                    paidAmount: tx.amount,
                                    paymentMethod: tx.paymentMethod,
                                    updatedAt: tx.paymentDate,
                                  });
                                  setIsReceiptModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
                                title="Print this receipt"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Col: Instant UPI Quick Pay Box with dynamic QR */}
              <div className="space-y-5">
                <div className="bg-gradient-to-b from-gray-900 to-indigo-950/60 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-xl text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
                    <Smartphone className="w-4 h-4" />
                    <span>Instant UPI Payment</span>
                  </div>

                  <h3 className="text-sm font-bold text-white">
                    Scan with GPay, PhonePe, or Paytm
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 mb-4">
                    Direct credit to Mizoram School Account • State Bank of India
                  </p>

                  {/* QR Code display */}
                  <div className="bg-white p-3.5 rounded-2xl inline-block shadow-xl mx-auto mb-3">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="UPI Payment QR Code"
                        className="w-48 h-48 rounded-lg"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-gray-400 text-xs">
                        Generating Secure QR...
                      </div>
                    )}
                  </div>

                  <div className="text-center space-y-2.5">
                    <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 py-1.5 px-3 rounded-xl inline-block">
                      Amount Due: ₹{outstandingFee > 0 ? outstandingFee : studentFee.totalAmount}
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs bg-gray-800/90 py-2 px-3.5 rounded-xl border border-gray-700 text-gray-300">
                      <span className="font-mono text-[11px]">{DEFAULT_UPI_CONFIG.vpa}</span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="p-1 hover:text-white transition-colors cursor-pointer"
                        title="Copy School UPI ID"
                      >
                        {copiedUpi ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-gray-400">
                      Payee: {DEFAULT_UPI_CONFIG.payeeName} • SBI Aizawl
                    </p>
                  </div>

                  {/* Submit UTR verification button */}
                  <div className="mt-5 pt-4 border-t border-gray-800">
                    {!showUpiPayBox ? (
                      <button
                        type="button"
                        onClick={() => setShowUpiPayBox(true)}
                        className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>I have paid • Enter 12-Digit UTR</span>
                      </button>
                    ) : (
                      <form onSubmit={handleSubmitUpiUtr} className="space-y-3 text-left animate-fadeIn">
                        <label className="block text-[11px] font-semibold text-gray-300">
                          Enter 12-Digit UPI Transaction ID / UTR:
                        </label>
                        <input
                          type="text"
                          required
                          value={upiUtrInput}
                          onChange={(e) => setUpiUtrInput(e.target.value)}
                          placeholder="e.g. 626401928374"
                          maxLength={12}
                          className="w-full bg-gray-950 text-white text-xs font-mono rounded-xl px-3.5 py-2.5 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowUpiPayBox(false)}
                            className="flex-1 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={upiSubmitting}
                            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            {upiSubmitting ? 'Verifying...' : 'Submit UTR'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 text-center">
              <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-base font-medium text-gray-300">No Active Fee Invoices Found</p>
              <p className="text-xs text-gray-500 mt-1">
                All fees for {activeStudent.name} are cleared or have not been billed yet for this cycle.
              </p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: SCHOOL CIRCULARS & NOTICES FOR PARENTS & STUDENTS
          ========================================================================= */}
      {activeTab === 'notices' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="bg-gray-900 p-4 sm:p-5 rounded-2xl border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Official Circulars & School Announcements</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Targeted to {activeStudent.className}
                </span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Exam routines, MBSE schedules, holidays, sports meets, and parent-teacher conferences.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={noticeSearch}
                onChange={(e) => setNoticeSearch(e.target.value)}
                placeholder="Search circulars..."
                className="w-full pl-9 pr-3.5 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['All', 'Examination', 'Holiday', 'Administrative', 'Sports', 'Event'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedNoticeCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                  selectedNoticeCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Notices List */}
          <div className="space-y-3.5">
            {relevantNotices.length > 0 ? (
              relevantNotices.map((n) => (
                <div
                  key={n.id}
                  className={`bg-gray-900 border rounded-3xl p-5 sm:p-6 transition-all shadow-md ${
                    n.isPinned
                      ? 'border-indigo-500/40 bg-gradient-to-r from-gray-900 via-indigo-950/20 to-gray-900'
                      : 'border-gray-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      {n.isPinned && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
                          PINNED
                        </span>
                      )}
                      <span className="text-xs font-mono text-gray-400">{n.noticeNo}</span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-gray-850 text-gray-300 text-[11px] font-medium border border-gray-700">
                        {n.category}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <span>{n.publishDate}</span>
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-white mb-2">{n.title}</h4>
                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                    {n.content}
                  </p>

                  <div className="mt-4 pt-3.5 border-t border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-400">
                    <span>
                      Authorized by: <strong className="text-gray-200">{n.authorName}</strong> ({n.authorDesignation})
                    </span>
                    {n.attachmentName && (
                      <span className="text-indigo-400 flex items-center gap-1 font-medium bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 self-start sm:self-auto">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{n.attachmentName}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center bg-gray-900 border border-gray-800 rounded-3xl text-gray-400 text-xs">
                No announcements matching your search criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: STUDENT DIGITAL ID CARD & GATE SCANNER BADGE
          ========================================================================= */}
      {activeTab === 'id_card' && (
        <div className="space-y-6">
          <div className="bg-gray-900 p-4 sm:p-5 rounded-2xl border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-400" />
                <span>Official Student Digital Identity Card</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Present this QR badge at the school gate for instant attendance logging by teachers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-md shadow-indigo-600/20 self-start sm:self-auto"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Student Badge</span>
            </button>
          </div>

          <div className="flex justify-center">
            {/* The Badge Card */}
            <div className="w-full max-w-sm bg-gradient-to-b from-gray-900 via-gray-950 to-indigo-950 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

              {/* School Header */}
              <div className="border-b border-gray-800 pb-3 mb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <School className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Mizoram School System
                  </span>
                </div>
                <div className="text-[10px] text-gray-400">
                  Government Recognized • MBSE Affiliation #MBSE-2026-AZL
                </div>
              </div>

              {/* Student Photo & Info */}
              <div className="space-y-3">
                <div className="w-20 h-20 rounded-2xl bg-indigo-600/30 border-2 border-indigo-400/50 mx-auto flex items-center justify-center text-indigo-200 text-3xl font-extrabold shadow-inner">
                  {activeStudent.name.charAt(0)}
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white">{activeStudent.name}</h4>
                  <div className="text-xs font-semibold text-indigo-400">{activeStudent.className}</div>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">Roll No. #{activeStudent.rollNo}</div>
                </div>

                {/* QR Code */}
                <div className="bg-white p-3 rounded-2xl inline-block shadow-lg my-2">
                  {studentQrBadgeUrl ? (
                    <img
                      src={studentQrBadgeUrl}
                      alt="Student Gate Attendance QR"
                      className="w-36 h-36 rounded-lg"
                    />
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center text-gray-400 text-xs">
                      Generating QR...
                    </div>
                  )}
                </div>

                <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-800 text-[11px] text-left space-y-1">
                  <div className="flex justify-between text-gray-300">
                    <span className="text-gray-500">Student ID:</span>
                    <span className="font-mono text-white">{activeStudent.id}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span className="text-gray-500">Emergency Phone:</span>
                    <span className="font-mono text-white">{activeStudent.parentPhone}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span className="text-gray-500">Blood Group:</span>
                    <span className="font-bold text-rose-400">O+ Positive</span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-500 pt-2 font-mono">
                  Card Valid Academic Session: 2026-2027
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MOBILE STICKY BOTTOM NAVIGATION BAR (FOR SEAMLESS TOUCH INTERACTION)
          ========================================================================= */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('academics')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium cursor-pointer ${
            activeTab === 'academics' ? 'text-indigo-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span>Grades</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium cursor-pointer ${
            activeTab === 'attendance' ? 'text-indigo-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <CalendarCheck className="w-5 h-5" />
          <span>Attendance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fees')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium cursor-pointer ${
            activeTab === 'fees' ? 'text-indigo-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span>Fees</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notices')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium cursor-pointer ${
            activeTab === 'notices' ? 'text-indigo-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span>Notices</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('id_card')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium cursor-pointer ${
            activeTab === 'id_card' ? 'text-indigo-400 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <QrCode className="w-5 h-5" />
          <span>QR Badge</span>
        </button>
      </div>

      {/* =========================================================================
          MODAL: SUBMIT ABSENCE EXCUSE NOTE (PARENT/GUARDIAN)
          ========================================================================= */}
      {isExcuseModalOpen && excuseRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-gray-900 border border-gray-800 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative my-8">
            <div className="flex justify-between items-center pb-3 border-b border-gray-800 mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Submit Leave / Absence Excuse Note</span>
              </div>
              <button
                type="button"
                onClick={() => setIsExcuseModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {excuseSuccessMessage ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{excuseSuccessMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitExcuse} className="space-y-4">
                <div className="bg-gray-950 p-3.5 rounded-2xl border border-gray-800 text-xs space-y-1">
                  <div className="text-gray-400">
                    Student: <strong className="text-white">{activeStudent.name}</strong> ({activeStudent.className})
                  </div>
                  <div className="text-gray-400">
                    Date of Absence: <strong className="text-rose-400">{excuseRecord.date}</strong>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Reason for Absence (Khawngaihin a chhan chiang takin ziak rawh le):
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={excuseReason}
                    onChange={(e) => setExcuseReason(e.target.value)}
                    placeholder="e.g. Taksa nawm loh vanga Civil Hospital-a inentir a nih avangin vawiin hian a kal thei ta lo a ni..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsExcuseModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={excuseSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30"
                  >
                    {excuseSubmitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send to School</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: OFFICIAL PRINTABLE MBSE PROGRESS REPORT CARD
          ========================================================================= */}
      {isReportCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white text-gray-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">
                Print Preview • MBSE Form No. 14-B
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReportCardModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Official Report Card Layout */}
            <div className="border-4 border-double border-indigo-900 p-6 sm:p-7 rounded-2xl space-y-6">
              {/* Header */}
              <div className="text-center space-y-1">
                <div className="text-xs font-bold tracking-widest text-indigo-900 uppercase">
                  Government of Mizoram • Education Department
                </div>
                <h1 className="text-xl font-extrabold tracking-tight text-gray-950 uppercase">
                  Mizoram School System (zoxs-sms)
                </h1>
                <p className="text-xs text-gray-600">
                  Affiliated to Mizoram Board of School Education (MBSE), Aizawl
                </p>
                <div className="inline-block mt-1 px-4 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  Official Student Progress & Composite Evaluation Report ({selectedTerm})
                </div>
              </div>

              {/* Student Metadata Table */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">Student Name:</span>
                  <span className="font-bold text-gray-900 text-sm">{activeStudent.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">Class & Section:</span>
                  <span className="font-bold text-gray-900">{activeStudent.className}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">Roll Number:</span>
                  <span className="font-bold text-gray-900">{activeStudent.rollNo}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">Academic Stage & Stream:</span>
                  <span className="font-bold text-gray-900">
                    {activeStudent.stage || 'Secondary'} {activeStudent.stream ? `(${activeStudent.stream})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">Parent Contact:</span>
                  <span className="font-bold text-gray-900">{activeStudent.parentPhone}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">Attendance Rate:</span>
                  <span className="font-bold text-gray-900">{attendanceStats.percentage}%</span>
                </div>
              </div>

              {/* Subject Scores Table */}
              <div className="border border-gray-300 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-2 text-center bg-indigo-50/50">Class Tests (20)</th>
                      <th className="py-2.5 px-2 text-center bg-purple-50/50">Exam (80)</th>
                      <th className="py-2.5 px-2 text-center">Composite (100)</th>
                      <th className="py-2.5 px-3 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {studentGrade?.subjects.map((s, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-semibold text-gray-900">{s.subjectName}</td>
                        <td className="py-2 px-2 text-center font-mono font-semibold text-indigo-900 bg-indigo-50/20">
                          {s.classTestObtained ?? Math.round(s.marksObtained * 0.2)}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-semibold text-purple-900 bg-purple-50/20">
                          {s.examObtained ?? Math.round(s.marksObtained * 0.8)}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-gray-950">
                          {s.marksObtained}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-indigo-900">
                          {s.grade}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-300">
                    <tr>
                      <td className="py-2.5 px-3">Composite Total</td>
                      <td className="py-2.5 px-2 text-center font-mono text-indigo-900">
                        {studentGrade?.totalClassTestObtained || 92}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-purple-900">
                        {studentGrade?.totalExamObtained || 372}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-gray-950">
                        {studentGrade?.totalMarksObtained} / {studentGrade?.totalMaxMarks}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-800">
                        {studentGrade?.overallGrade} ({studentGrade?.percentage}%)
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatures and Institutional Seal */}
              <div className="pt-6 grid grid-cols-3 text-center text-xs text-gray-700">
                <div className="space-y-1">
                  <div className="border-b border-gray-400 w-28 mx-auto mb-1"></div>
                  <span className="font-semibold text-gray-900">Class Teacher</span>
                  <div className="text-[10px] text-gray-500">Mizoram School System</div>
                </div>
                <div className="space-y-1">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-indigo-900/40 mx-auto flex items-center justify-center text-[10px] text-indigo-900 font-bold uppercase tracking-wider">
                    SEAL
                  </div>
                  <div className="text-[10px] text-gray-500">Official Stamp</div>
                </div>
                <div className="space-y-1">
                  <div className="border-b border-gray-400 w-28 mx-auto mb-1"></div>
                  <span className="font-semibold text-gray-900">Principal / Headmaster</span>
                  <div className="text-[10px] text-gray-500">Dr. Lalthanzuala Colney</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: OFFICIAL PRINTABLE FEE RECEIPT VOUCHER
          ========================================================================= */}
      {isReceiptModalOpen && (selectedReceiptForModal || studentFee) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white text-gray-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">
                Official Payment Voucher
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Voucher</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {(() => {
              const rFee = selectedReceiptForModal || studentFee!;
              return (
                <div className="border-2 border-gray-300 p-6 rounded-2xl space-y-5">
                  <div className="text-center border-b border-gray-200 pb-3">
                    <h2 className="text-base font-extrabold text-gray-950 uppercase">
                      Mizoram School System (zoxs-sms)
                    </h2>
                    <p className="text-xs text-gray-500">Accounts & Bursar Department • Aizawl, Mizoram</p>
                    <div className="text-xs font-bold text-indigo-900 mt-1 font-mono">
                      OFFICIAL RECEIPT: #{rFee.receiptNo}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500 block text-[10px]">Student Name:</span>
                      <span className="font-bold text-gray-900">{activeStudent.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Class & Roll:</span>
                      <span className="font-bold text-gray-900">
                        {activeStudent.className} (Roll #{activeStudent.rollNo})
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Billing Period:</span>
                      <span className="font-bold text-gray-900">{rFee.feeMonth}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Payment Date:</span>
                      <span className="font-bold text-gray-900">
                        {rFee.updatedAt?.split('T')[0] || '2026-09-15'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs space-y-1.5">
                    <div className="flex justify-between font-medium">
                      <span>Tuition & Laboratory Fee</span>
                      <span>₹1,650</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Examination Assessment</span>
                      <span>₹300</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>School Development & Activities</span>
                      <span>₹250</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm pt-2 border-t border-gray-300 text-gray-950">
                      <span>Total Amount Paid:</span>
                      <span className="font-mono">₹{rFee.paidAmount}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 pt-1">
                      <span>Payment Method:</span>
                      <span>{rFee.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between items-end text-xs text-gray-600">
                    <div>
                      <span className="font-semibold block text-gray-800">Cashier / Bursar Signature</span>
                      <span className="text-[10px]">Accounts Division, Aizawl</span>
                    </div>
                    <div className="w-14 h-14 rounded-full border border-dashed border-gray-400 flex items-center justify-center text-[9px] text-gray-400 font-bold uppercase">
                      STAMP
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
