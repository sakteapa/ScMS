import React from 'react';
import { 
  Users, 
  UserCheck, 
  CreditCard, 
  GraduationCap, 
  QrCode, 
  FileText, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Bell,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';

export default function DashboardView({ setCurrentTab, openRoleSwitcher }) {
  const { currentUser, isPrincipal, isTeacher, isStudent, isParent } = useAuth();
  const { students, attendance, fees, grades, notices, admissions, classes, systemConfig } = useSchool();

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === today);
  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  const attendanceRate = todayAttendance.length > 0 
    ? Math.round((presentCount / todayAttendance.length) * 100)
    : 92; // default high attendance for school average

  // Financial summary
  const totalFeesCollected = fees.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const upiFees = fees.filter(f => f.paymentMode === 'upi').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const cashFees = fees.filter(f => f.paymentMode === 'cash').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const pendingAdmissions = admissions.filter(a => a.status === 'pending');
  const pinnedNotices = notices.filter(n => n.isPinned);

  // Student specific data if student or parent
  const activeStudent = isStudent 
    ? students.find(s => s.id === currentUser?.studentId) || students[0]
    : isParent 
    ? students.find(s => s.id === currentUser?.wardStudentId) || students[0]
    : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {systemConfig?.schoolName || 'OHA (Oxford Higher Academy)'}
              </span>
              <span className="text-xs text-slate-400">Nursery to Class 12</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
              Chibai, {currentUser?.displayName || 'Principal'}!
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Welcome to the integrated Mizoram School System (<span className="text-cyan-400 font-mono">zoxs-sms</span>).
              Real-time attendance, dual UPI/Cash fees, continuous tests &amp; MBSE exams, and offline-enabled Firestore v10.8.0.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentTab('attendance')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>QR Scanner</span>
            </button>
            <button
              onClick={() => setCurrentTab('report_cards')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Report Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Students */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Enrolled Students</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">{students.length}</span>
            <span className="text-xs text-emerald-400 font-medium">Nursery to 12</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Arts, Science, Commerce streams active
          </p>
        </div>

        {/* Today's Attendance */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Today's Attendance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <UserCheck className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">{attendanceRate}%</span>
            <span className="text-xs text-emerald-400 font-medium">Present Rate</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${attendanceRate}%` }}></div>
          </div>
        </div>

        {/* Total Fee Collections */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Fees Collected</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <CreditCard className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
              ₹{(totalFeesCollected / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-cyan-400 font-medium">{fees.length} Receipts</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <span>UPI: ₹{(upiFees / 1000).toFixed(0)}k</span>
            <span>•</span>
            <span>Cash: ₹{(cashFees / 1000).toFixed(0)}k</span>
          </p>
        </div>

        {/* Pending Admissions */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Online Admissions</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">{pendingAdmissions.length}</span>
            <span className="text-xs text-amber-400 font-medium">Pending Review</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">{admissions.length} total applications</span>
            <button
              onClick={() => setCurrentTab('admissions')}
              className="text-cyan-400 hover:underline font-medium"
            >
              Review →
            </button>
          </div>
        </div>
      </div>

      {/* Main Row: Academic Stream Overview & Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Academic Structure & Higher Secondary Streams */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-cyan-400" />
                  <span>Academic Levels &amp; Higher Secondary Streams</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Structure aligned with MBSE (Mizoram Board of School Education)
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('academics')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <span>View Marks</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              {/* Science Stream */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Science Stream</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                    Class 11 &amp; 12
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Physics, Chemistry, Mathematics, Biology, Computer Science, English, Mizo
                </p>
                <div className="text-[11px] text-cyan-400/90 font-medium">
                  Laboratory Practicals &amp; Viva
                </div>
              </div>

              {/* Arts Stream */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Arts Stream</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                    Class 11 &amp; 12
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Political Science, History, Education, Economics, Sociology, English, Mizo
                </p>
                <div className="text-[11px] text-purple-400/90 font-medium">
                  Continuous Term Projects
                </div>
              </div>

              {/* Commerce Stream */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Commerce Stream</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                    Class 11 &amp; 12
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Accountancy, Business Studies, Economics, Mathematics, English, Mizo
                </p>
                <div className="text-[11px] text-amber-400/90 font-medium">
                  Double Entry &amp; Case Studies
                </div>
              </div>
            </div>

            {/* Assessment Separation Notice */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span className="text-slate-300">
                  <strong>Strictly Separated Assessment Architecture:</strong> Class Tests (20-25 marks internal) are evaluated independently from Examinations (term-end 100 marks).
                </span>
              </div>
              <button
                onClick={() => setCurrentTab('academics')}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium shrink-0 ml-2"
              >
                Gradebook
              </button>
            </div>
          </div>

          {/* Quick Dual Payment & Attendance Trigger Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => setCurrentTab('attendance')}
              className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/30 border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <QrCode className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
              </div>
              <h4 className="mt-4 text-sm font-bold text-white group-hover:text-cyan-300 transition">
                Teacher QR Camera Scanner
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Instantly scan student ID card QR codes using the device camera to mark attendance in real-time.
              </p>
            </div>

            <div 
              onClick={() => setCurrentTab('financials')}
              className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <CreditCard className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition" />
              </div>
              <h4 className="mt-4 text-sm font-bold text-white group-hover:text-indigo-300 transition">
                Dual Fee Payment Gateway
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Record UPI/GPay payments with verified UTR numbers or Cash payments with auto-generated cashier receipts.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Pinned Notices & Quick Modules */}
        <div className="space-y-6">
          {/* Pinned Circulars */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Notice Board</span>
              </h3>
              <button
                onClick={() => setCurrentTab('notices')}
                className="text-xs text-cyan-400 hover:underline"
              >
                All Notices
              </button>
            </div>

            <div className="space-y-3">
              {pinnedNotices.slice(0, 3).map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {n.category}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(n.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-1">
                    {n.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {n.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Administration Modules
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setCurrentTab('library')}
                className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-left text-slate-300 hover:text-white transition flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Library</span>
              </button>
              <button
                onClick={() => setCurrentTab('staff_payroll')}
                className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-left text-slate-300 hover:text-white transition flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Payroll</span>
              </button>
              <button
                onClick={() => setCurrentTab('transport_hostel')}
                className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-left text-slate-300 hover:text-white transition flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>Transport</span>
              </button>
              <button
                onClick={() => setCurrentTab('admissions')}
                className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-left text-slate-300 hover:text-white transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Admissions</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
