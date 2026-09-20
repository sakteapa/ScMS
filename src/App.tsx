/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Menu,
  Bell,
  RefreshCw,
  Search,
  Database,
  ExternalLink,
  RotateCcw,
  Sparkles,
  QrCode,
  BookOpen,
  Briefcase,
  UserPlus,
  ShieldCheck,
  Download,
} from 'lucide-react';
import {
  NavTab,
  FirestoreStudent,
  SchoolClass,
  AttendanceRecord,
  FeeRecord,
  GradeRecord,
  TimetableRecord,
  LibraryBook,
  BookIssue,
  NotificationLog,
  StaffMember,
  PayrollRecord,
  StaffLeave,
  AdmissionApplication,
  NoticeItem,
  UserRole,
} from './types';
import {
  subscribeToCollection,
  resetCollectionData,
  isLiveFirebaseConfigured,
} from './lib/firebase';
import { Sidebar } from './components/Sidebar';
import { SummaryCards } from './components/SummaryCards';
import { AiChatBox } from './components/AiChatBox';
import { StudentsTable } from './components/StudentsTable';
import { AttendanceTable } from './components/AttendanceTable';
import { FeesTable } from './components/FeesTable';
import { ClassesTable } from './components/ClassesTable';
import { AddStudentModal } from './components/AddStudentModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { QrAttendanceScanner } from './components/QrAttendanceScanner';
import { GradebookManager } from './components/GradebookManager';
import { TimetableManager } from './components/TimetableManager';
import { LibraryManager } from './components/LibraryManager';
import { NotificationManager } from './components/notifications/NotificationManager';
import { StaffPayrollManager } from './components/staff/StaffPayrollManager';
import { AdmissionsManager } from './components/admissions/AdmissionsManager';
import { NoticeBoardManager } from './components/notices/NoticeBoardManager';
import { DashboardNoticeBoardWidget } from './components/notices/DashboardNoticeBoardWidget';
import { PublicAdmissionPortalModal } from './components/admissions/PublicAdmissionPortalModal';
import { DedicatedPortalContainer } from './components/portal/DedicatedPortalContainer';
import { syncAllStudentsFeeClearance } from './lib/feeService';
import { OfflineStatusBar } from './components/common/OfflineStatusBar';
import { PWAInstallButton } from './components/pwa/PWAInstallButton';
import { DataExportCenter } from './components/export/DataExportCenter';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Firestore Real-Time Collections
  const [students, setStudents] = useState<FirestoreStudent[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [timetables, setTimetables] = useState<TimetableRecord[]>([]);
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>([]);
  const [bookIssues, setBookIssues] = useState<BookIssue[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [staffLeaves, setStaffLeaves] = useState<StaffLeave[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [isPublicAdmissionOpen, setIsPublicAdmissionOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('Principal');
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  // Modals
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<FirestoreStudent | null>(null);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [feeToEdit, setFeeToEdit] = useState<FeeRecord | null>(null);

  // Expose loadDashboardData globally so custom user scripts or click listeners can call it
  const loadDashboardData = useCallback(() => {
    setLastRefreshed(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    (window as any).loadDashboardData = loadDashboardData;
    return () => {
      delete (window as any).loadDashboardData;
    };
  }, [loadDashboardData]);

  // Subscribe to real-time updates from Firestore collections
  useEffect(() => {
    const unsubStudents = subscribeToCollection<FirestoreStudent>('students', (data) => {
      setStudents(data);
      setLastRefreshed(new Date().toLocaleTimeString());
    });
    const unsubClasses = subscribeToCollection<SchoolClass>('classes', (data) => {
      setClasses(data);
    });
    const unsubAttendance = subscribeToCollection<AttendanceRecord>('attendance', (data) => {
      setAttendance(data);
    });
    const unsubFees = subscribeToCollection<FeeRecord>('fees', (data) => {
      setFees(data);
    });
    const unsubGrades = subscribeToCollection<GradeRecord>('grades', (data) => {
      setGrades(data);
    });
    const unsubTimetables = subscribeToCollection<TimetableRecord>('timetables', (data) => {
      setTimetables(data);
    });
    const unsubBooks = subscribeToCollection<LibraryBook>('library_books', (data) => {
      setLibraryBooks(data);
    });
    const unsubIssues = subscribeToCollection<BookIssue>('book_issues', (data) => {
      setBookIssues(data);
    });
    const unsubNotifications = subscribeToCollection<NotificationLog>('notifications', (data) => {
      setNotifications(data);
    });
    const unsubStaff = subscribeToCollection<StaffMember>('staff', (data) => {
      setStaff(data);
    });
    const unsubPayroll = subscribeToCollection<PayrollRecord>('payroll', (data) => {
      setPayroll(data);
    });
    const unsubLeaves = subscribeToCollection<StaffLeave>('staff_leaves', (data) => {
      setStaffLeaves(data);
    });
    const unsubAdmissions = subscribeToCollection<AdmissionApplication>('admissions', (data) => {
      setAdmissions(data);
    });
    const unsubNotices = subscribeToCollection<NoticeItem>('notices', (data) => {
      setNotices(data);
    });

    return () => {
      unsubStudents();
      unsubClasses();
      unsubAttendance();
      unsubFees();
      unsubGrades();
      unsubTimetables();
      unsubBooks();
      unsubIssues();
      unsubNotifications();
      unsubStaff();
      unsubPayroll();
      unsubLeaves();
      unsubAdmissions();
      unsubNotices();
    };
  }, []);

  // Automated sync of fee clearance status to student records if needed
  useEffect(() => {
    if (students.length > 0 && fees.length > 0) {
      const needsSync = students.some((s) => !s.feeStatus || s.totalFeesDue === undefined);
      if (needsSync) {
        syncAllStudentsFeeClearance(fees, students);
      }
    }
  }, [fees, students]);

  // Quick stats counts for sidebar badges
  const absentCountToday = attendance.filter((a) => a.status === 'Absent').length;
  const pendingFeesCount = fees.filter((f) => f.status === 'Pending' || f.status === 'Overdue').length;
  const pendingPayrollCount = payroll.filter((p) => p.paymentStatus === 'Pending' || p.paymentStatus === 'Processing').length;
  const pendingAdmissionsCount = admissions.filter((a) => a.status === 'Pending').length;
  const activeNoticesCount = notices.filter((n) => n.isActive).length;
  const overdueBooksCount = bookIssues.filter((i) => {
    if (i.status === 'Overdue') return true;
    if (i.status === 'Issued' && new Date(i.dueDate) < new Date()) return true;
    return false;
  }).length;
  const activeLoansCount = bookIssues.filter((i) => i.status === 'Issued' || i.status === 'Overdue').length;
  const failedNotificationsCount = notifications.filter((n) => n.status === 'Failed').length;

  const handleOpenEditStudent = (std: FirestoreStudent) => {
    setStudentToEdit(std);
    setIsAddStudentOpen(true);
  };

  const handleOpenRecordPayment = (fee?: FeeRecord) => {
    setFeeToEdit(fee || null);
    setIsRecordPaymentOpen(true);
  };

  const handleOpenFeeForStudent = (std?: FirestoreStudent) => {
    if (std) {
      const existing = fees.find((f) => f.studentId === std.id);
      if (existing) {
        setFeeToEdit(existing);
      } else {
        setFeeToEdit(null);
      }
    } else {
      setFeeToEdit(null);
    }
    setIsRecordPaymentOpen(true);
  };

  const allCollections = useMemo(() => ({
    students,
    classes,
    attendance,
    fees,
    grades,
    timetables,
    libraryBooks,
    bookIssues,
    notifications,
    staff,
    payroll,
    staffLeaves,
    admissions,
    notices,
  }), [
    students,
    classes,
    attendance,
    fees,
    grades,
    timetables,
    libraryBooks,
    bookIssues,
    notifications,
    staff,
    payroll,
    staffLeaves,
    admissions,
    notices,
  ]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex antialiased font-sans selection:bg-indigo-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        counts={{
          students: students.length,
          absentToday: absentCountToday,
          pendingFees: pendingFeesCount,
          overdueBooks: overdueBooksCount,
          activeLoans: activeLoansCount,
          pendingAlerts: failedNotificationsCount > 0 ? failedNotificationsCount : absentCountToday,
          staffCount: staff.length,
          pendingPayroll: pendingPayrollCount,
          pendingAdmissions: pendingAdmissionsCount,
          activeNotices: activeNoticesCount,
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Mizoram School System (zoxs-sms)</span>
                <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-mono border border-indigo-500/30">
                  Firebase SDK v10.8.0
                </span>
              </h1>
              <p className="text-[11px] text-gray-400 hidden sm:block">
                Aizawl District • Cloud Firestore Synchronized
              </p>
            </div>
          </div>

          {/* Quick Actions & Live Indicator */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Role Switcher supporting Principal, Teacher, Student, Parent */}
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-800/90 border border-gray-700 text-xs">
              <span className="text-[10px] text-gray-400 uppercase font-mono">Role:</span>
              <select
                value={userRole}
                onChange={(e) => {
                  const selectedRole = e.target.value as UserRole;
                  setUserRole(selectedRole);
                  if (selectedRole === 'Parent' || selectedRole === 'Student') {
                    setCurrentTab('portal');
                  }
                }}
                className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer"
              >
                <option value="Principal" className="bg-gray-900 text-white">Principal (Admin)</option>
                <option value="Teacher" className="bg-gray-900 text-white">Teacher</option>
                <option value="Parent" className="bg-gray-900 text-white">Parent (Nu leh Pa)</option>
                <option value="Student" className="bg-gray-900 text-white">Student (Zirlai)</option>
              </select>
            </div>

            {/* Offline Persistence Indicator & Sync Trigger */}
            <OfflineStatusBar />

            {/* PWA Install Button */}
            <PWAInstallButton variant="compact" />

            <div className="hidden md:flex items-center gap-2 text-xs px-2.5 py-1 rounded-md bg-gray-800/80 border border-gray-700/60 text-gray-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-[11px]">Synced {lastRefreshed}</span>
            </div>

            <button
              type="button"
              onClick={loadDashboardData}
              title="Refresh collections"
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Reset sample collections to default seeds?')) {
                  resetCollectionData();
                }
              }}
              title="Reset sample data"
              className="p-2 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-gray-800 mx-1"></div>

            {/* Public Online Admission Form Trigger */}
            <button
              type="button"
              onClick={() => setIsPublicAdmissionOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
              title="Open Public Student Registration Portal"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Public Admission Form</span>
              <span className="sm:hidden">Apply</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStudentToEdit(null);
                setIsAddStudentOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-sm"
            >
              + New Student
            </button>
          </div>
        </header>

        {/* View Switcher Tabs (For Mobile & Quick Navigation) */}
        <div className="border-b border-gray-800 bg-gray-900/50 px-4 sm:px-6 py-2 flex items-center justify-between overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
            <button
              type="button"
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-gray-800 text-white shadow-xs font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Dashboard Overview
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('admissions')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'admissions'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
              Admissions ({admissions.length})
              {pendingAdmissionsCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] bg-indigo-500 text-white rounded-full font-bold">
                  {pendingAdmissionsCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('notices')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'notices'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-indigo-400" />
              Notice Board ({activeNoticesCount})
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('students')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                currentTab === 'students'
                  ? 'bg-gray-800 text-white shadow-xs font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Students ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('attendance')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                currentTab === 'attendance'
                  ? 'bg-gray-800 text-white shadow-xs font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Attendance
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('qr-attendance')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'qr-attendance'
                  ? 'bg-gray-800 text-white shadow-xs font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-400" />
              QR Scanner
            </button>
            <button
              type="button"
              id="gradebookPillBtn"
              onClick={() => setCurrentTab('gradebook')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                currentTab === 'gradebook'
                  ? 'bg-gray-800 text-white shadow-xs font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Gradebook & Exams
            </button>
            <button
              type="button"
              id="timetablePillBtn"
              onClick={() => setCurrentTab('timetable')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                currentTab === 'timetable'
                  ? 'bg-gray-800 text-white shadow-xs font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Timetable & Routines
            </button>
            <button
              type="button"
              id="libraryPillBtn"
              onClick={() => setCurrentTab('library')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'library'
                  ? 'bg-purple-600 text-white shadow-xs font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              Library ({libraryBooks.length})
              {overdueBooksCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] bg-rose-500 text-white rounded-full font-bold">
                  {overdueBooksCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('fees')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                currentTab === 'fees'
                  ? 'bg-gray-800 text-white shadow-xs font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Fees & Payments
            </button>
            <button
              type="button"
              id="staffPillBtn"
              onClick={() => setCurrentTab('staff')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'staff'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              Staff & Payroll ({staff.length})
              {pendingPayrollCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] bg-amber-500 text-gray-950 rounded-full font-bold">
                  {pendingPayrollCount}
                </span>
              )}
            </button>
            <button
              type="button"
              id="portalPillBtn"
              onClick={() => setCurrentTab('portal')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'portal'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-indigo-400 hover:text-white hover:bg-indigo-900/40 border border-indigo-500/20'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Parent / Student Portal</span>
            </button>
            <button
              type="button"
              id="exportsPillBtn"
              onClick={() => setCurrentTab('exports')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'exports'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Data Export & Reports</span>
            </button>
          </div>

          <div className="text-[11px] text-gray-500 font-mono hidden md:block">
            Mizoram Board of School Education (MBSE)
          </div>
        </div>

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Summary Cards & AI Chat Box are shown on administrative views */}
          {currentTab !== 'portal' && (
            <>
              {/* 1. Summary Cards (Total Students, Today's Attendance, Fee Status) */}
              <SummaryCards
                students={students}
                attendance={attendance}
                fees={fees}
                onNavigateTab={setCurrentTab}
              />

              {/* 2. AI Chat Box / Quick Command Component (Linked to Firestore) */}
              <AiChatBox
                existingStudents={students}
                existingAttendance={attendance}
                existingFees={fees}
                existingGrades={grades}
                existingTimetables={timetables}
                existingBooks={libraryBooks}
                existingIssues={bookIssues}
                classes={classes}
                loadDashboardData={loadDashboardData}
              />
            </>
          )}

          {/* 3. Real-Time Data Tables linked to Firestore Collections */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Real-time Notice Board Bulletin for Parents, Students & Teachers */}
              <DashboardNoticeBoardWidget
                notices={notices}
                userRole={userRole}
                onNavigateToNotices={() => setCurrentTab('notices')}
                onOpenCompose={() => setCurrentTab('notices')}
              />

              {/* Primary Students Table on Dashboard */}
              <StudentsTable
                students={students}
                classes={classes}
                onOpenAddModal={() => {
                  setStudentToEdit(null);
                  setIsAddStudentOpen(true);
                }}
                onEditStudent={handleOpenEditStudent}
                onOpenFeePayment={handleOpenFeeForStudent}
              />

              {/* Secondary Classes Grid */}
              <ClassesTable classes={classes} students={students} />
            </div>
          )}

          {currentTab === 'admissions' && (
            <AdmissionsManager
              applications={admissions}
              classes={classes}
              students={students}
              userRole={userRole}
            />
          )}

          {currentTab === 'notices' && (
            <div className="space-y-6">
              <NoticeBoardManager
                notices={notices}
                userRole={userRole}
                userName="Dr. Lalthanzuala Colney"
              />
            </div>
          )}

          {currentTab === 'students' && (
            <div className="space-y-6">
              <StudentsTable
                students={students}
                classes={classes}
                onOpenAddModal={() => {
                  setStudentToEdit(null);
                  setIsAddStudentOpen(true);
                }}
                onEditStudent={handleOpenEditStudent}
                onOpenFeePayment={handleOpenFeeForStudent}
              />
              <ClassesTable classes={classes} students={students} />
            </div>
          )}

          {currentTab === 'attendance' && (
            <div className="space-y-6">
              {/* Quick Banner to Launch QR Scanner */}
              <div className="bg-gray-800/80 border border-gray-700/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white">
                      Teacher Fast Check-In Available
                    </span>
                    <p className="text-[11px] text-gray-400">
                      Scan student ID badges using the camera to log attendance in real-time.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentTab('qr-attendance')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-colors shrink-0"
                >
                  Open QR Attendance Scanner
                </button>
              </div>

              <AttendanceTable attendance={attendance} classes={classes} students={students} />
            </div>
          )}

          {currentTab === 'qr-attendance' && (
            <QrAttendanceScanner
              students={students}
              classes={classes}
              attendance={attendance}
              onAttendanceUpdated={loadDashboardData}
            />
          )}

          {currentTab === 'gradebook' && (
            <GradebookManager
              grades={grades}
              students={students}
              classes={classes}
            />
          )}

          {currentTab === 'timetable' && (
            <TimetableManager
              timetables={timetables}
              classes={classes}
              students={students}
            />
          )}

          {currentTab === 'library' && (
            <LibraryManager
              books={libraryBooks}
              issues={bookIssues}
              students={students}
              classes={classes}
            />
          )}

          {currentTab === 'fees' && (
            <div className="space-y-6">
              <FeesTable
                fees={fees}
                classes={classes}
                students={students}
                onOpenRecordPayment={handleOpenRecordPayment}
                payrollRecords={payroll}
              />
            </div>
          )}

          {currentTab === 'portal' && (
            <DedicatedPortalContainer
              students={students}
              classes={classes}
              attendance={attendance}
              fees={fees}
              grades={grades}
              notices={notices}
              userRole={userRole}
              onExitToAdmin={() => setCurrentTab('dashboard')}
              onOpenUpiModal={handleOpenRecordPayment}
            />
          )}

          {currentTab === 'staff' && (
            <div className="space-y-6">
              <StaffPayrollManager
                staffList={staff}
                payrollList={payroll}
                leavesList={staffLeaves}
                feeRecords={fees}
                onNavigateToFees={() => setCurrentTab('fees')}
              />
            </div>
          )}

          {currentTab === 'notifications' && (
            <NotificationManager
              students={students}
              classes={classes}
              fees={fees}
              attendance={attendance}
            />
          )}

          {currentTab === 'exports' && (
            <DataExportCenter
              students={students}
              classes={classes}
              fees={fees}
              grades={grades}
              attendance={attendance}
              allCollections={allCollections}
            />
          )}
        </main>

        {/* Modals */}
        <AddStudentModal
          isOpen={isAddStudentOpen}
          onClose={() => setIsAddStudentOpen(false)}
          classes={classes}
          initialStudent={studentToEdit}
          existingStudents={students}
        />

        <RecordPaymentModal
          isOpen={isRecordPaymentOpen}
          onClose={() => setIsRecordPaymentOpen(false)}
          students={students}
          fees={fees}
          initialFee={feeToEdit}
        />

        <PublicAdmissionPortalModal
          isOpen={isPublicAdmissionOpen}
          onClose={() => setIsPublicAdmissionOpen(false)}
          applications={admissions}
        />
      </div>
    </div>
  );
}
