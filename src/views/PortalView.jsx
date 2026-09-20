import React, { useState } from 'react';
import { 
  UserCheck, 
  Calendar, 
  CreditCard, 
  GraduationCap, 
  FileText, 
  Bell, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Download, 
  AlertCircle, 
  QrCode, 
  Sparkles, 
  Lock,
  Plus,
  ShieldCheck,
  Paperclip,
  Radio,
  Video,
  Phone,
  Sun,
  UtensilsCrossed,
  Coffee,
  CalendarCheck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import OnlineCheckoutModal from '../components/OnlineCheckoutModal';
import LiveClassroomSuite from '../components/LiveClassroomSuite';
import SpecialOnlineExamSuite from '../components/SpecialOnlineExamSuite';

export default function PortalView({ setCurrentTab, setSelectedStudentForReport }) {
  const { currentUser, isParent } = useAuth();
  const { 
    students, 
    classes, 
    attendance, 
    fees, 
    grades, 
    notices, 
    hostelRooms = [], 
    transportRoutes = [], 
    paymentConfig, 
    checkReportCardAccess,
    leaveApplications = [],
    applyForLeave,
    vacations = [],
    startPrivateCall,
    staff = [],
    ptmEvents = [],
    ptmConfig = {},
    bookPtmSlot,
    cancelPtmSlot,
    canteenWallets = {},
    topupCanteenWallet
  } = useSchool();
  const [isOnlineCheckoutOpen, setIsOnlineCheckoutOpen] = useState(false);
  const [isLiveClassOpen, setIsLiveClassOpen] = useState(false);
  const [isSpecialExamOpen, setIsSpecialExamOpen] = useState(false);
  const [isCanteenTopupOpen, setIsCanteenTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState('200');
  const [ptmBookingSuccess, setPtmBookingSuccess] = useState('');

  // Leave Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    leaveType: 'medical',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    documentName: ''
  });

  // Active student being inspected in portal
  const [activeStudentId, setActiveStudentId] = useState(
    isParent ? (currentUser?.wardStudentId || students[0]?.id) : (currentUser?.studentId || students[0]?.id)
  );

  const student = students.find(s => s.id === activeStudentId) || students[0];
  const studentClass = classes.find(c => c.id === student?.classId);
  const studentLeaves = leaveApplications.filter(l => l.studentId === student?.id);

  const studentHostel = hostelRooms.find(r => r.id === student?.hostelRoomId || r.enrolledStudents?.includes(student?.id));
  const studentRoute = transportRoutes.find(r => r.id === student?.transportRouteId || r.enrolledStudentIds?.includes(student?.id));

  // Student specific records
  const studentAttendance = attendance.filter(a => a.studentId === student?.id);
  const studentFees = fees.filter(f => f.studentId === student?.id);
  const studentGrades = grades.filter(g => g.studentId === student?.id);

  const totalFees = student?.totalFees || 36000;
  const paidFees = student?.paidFees || 0;
  const pendingFees = Math.max(0, totalFees - paidFees);
  const access = checkReportCardAccess ? checkReportCardAccess(student?.id) : { canAccess: true, isWithheld: false };

  const classTests = studentGrades.filter(g => g.type === 'class_test');
  const examinations = studentGrades.filter(g => g.type === 'examination');

  return (
    <div className="space-y-6 pb-16">
      {/* Portal Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={student?.photoUrl}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyan-400/50 shadow-md"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold uppercase tracking-wider border border-cyan-500/30">
                {isParent ? "Parent & Guardian Access" : "Student Personal Hub"}
              </span>
              <span className="text-xs text-slate-400">AY 2026-2027</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
              {student?.firstName} {student?.lastName}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span>Adm: {student?.admissionNo}</span>
              <span>•</span>
              <span className="text-cyan-400 font-bold">Roll #{student?.rollNo}</span>
              <span>•</span>
              <span>Class: {studentClass?.name} {student?.stream ? `(${student.stream.toUpperCase()})` : ''}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isParent && (
            <select
              value={activeStudentId}
              onChange={(e) => setActiveStudentId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  Ward: {s.firstName} {s.lastName} ({s.admissionNo})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => {
              if (setSelectedStudentForReport) setSelectedStudentForReport(student);
              setCurrentTab('report_cards');
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-lg flex items-center gap-2 ${
              access.isWithheld
                ? 'bg-rose-600/30 hover:bg-rose-600/40 text-rose-300 border border-rose-500/50 shadow-rose-500/10'
                : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/20'
            }`}
          >
            {access.isWithheld ? <Lock className="w-4 h-4 text-rose-400" /> : <FileText className="w-4 h-4" />}
            <span>{access.isWithheld ? 'Report Card (Withheld - Click to Unlock)' : 'Download Official Report Card'}</span>
          </button>

          <button
            onClick={() => {
              const teacherName = studentClass?.teacherName || 'Pu Lalthlamuana Sailo';
              startPrivateCall({
                id: 'teacher-call',
                name: `${teacherName} (Class Master)`,
                role: 'Subject Master & Class Head',
                phone: '+91 94361 55021',
                photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
                info: `In charge of ${studentClass?.name || 'Class 12'}`
              }, 'video');
            }}
            className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition flex items-center gap-1.5 shadow"
            title="Start 1-on-1 Consultation Call with Class Master"
          >
            <Video className="w-4 h-4 text-cyan-400" />
            <span>Consult Teacher</span>
          </button>
        </div>
      </div>

      {/* Live Classroom & Special Exam Active Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Live Streaming Classroom Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 border border-rose-500/30 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center animate-pulse shrink-0">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-xs font-['Outfit']">Live Classroom Streaming</h4>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                  ON AIR
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Join live audio/video class from home if you are on medical or approved leave.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLiveClassOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition shrink-0 flex items-center gap-1.5"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Join Live Class</span>
          </button>
        </div>

        {/* Special Online Exam Room Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-xs font-['Outfit']">Special Online Proctored Exam</h4>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  Sanctioned
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Proctored room with live examiner video invigilation &amp; answer paper scanner.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSpecialExamOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition shrink-0 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Enter Exam Room</span>
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Attendance Widget */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Real-Time Attendance Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-['Outfit'] font-mono">
              {student?.attendanceRate || 94.5}%
            </span>
            <span className="text-xs text-emerald-400 font-semibold">Eligible for Exams</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-emerald-400"
              style={{ width: `${student?.attendanceRate || 94.5}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-500">
            {studentAttendance.length} registered classroom logs this term
          </p>
        </div>

        {/* Fee Dues Widget with Itemized Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Fee Clearance Balance</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-['Outfit'] font-mono">
              {pendingFees === 0 ? 'CLEARED' : `₹${pendingFees.toLocaleString('en-IN')}`}
            </span>
            <span className={`text-xs font-semibold ${pendingFees === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {pendingFees === 0 ? 'Paid in Full' : 'Due Balance'}
            </span>
          </div>

          {/* Itemized Service Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              Tuition: ₹36,000/yr
            </span>
            {studentHostel && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Hostel (Rm {studentHostel.roomNumber}): ₹5,500/mo
              </span>
            )}
            {studentRoute && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Bus ({studentRoute.routeNumber}): ₹1,500/mo
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span>Total Paid: ₹{paidFees.toLocaleString('en-IN')}</span>
            <button
              onClick={() => setIsOnlineCheckoutOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition shadow-sm"
            >
              <span>Pay Online ({paymentConfig?.activeGateway === 'razorpay' ? 'Razorpay' : paymentConfig?.activeGateway === 'cashfree' ? 'Cashfree' : 'UPI'})</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Student QR Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium block">Digital Student Pass</span>
            <h4 className="text-sm font-bold text-white">Dynamic Entry QR</h4>
            <p className="text-[11px] text-slate-400">
              Present to gate scanner for instant verification
            </p>
          </div>
          <div className="p-2 bg-white rounded-xl shadow">
            <QRCodeSVG
              value={JSON.stringify({
                id: student?.id,
                admissionNo: student?.admissionNo,
                rollNo: student?.rollNo,
                name: `${student?.firstName} ${student?.lastName}`,
                classId: student?.classId
              })}
              size={68}
              level="M"
            />
          </div>
        </div>
      </div>

      {/* Routine / Timetable Quick Link for Student / Parent */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-['Outfit']">
              Class Routine &amp; Period Schedule • {studentClass?.name}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Room {studentClass?.roomNumber} • Daily academic periods (09:00 AM - 02:45 PM)
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentTab('routine')}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs transition border border-slate-700 flex items-center gap-2 w-fit"
        >
          <span>View Weekly Time Table</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Upcoming Vacation & Holiday Notice for Student & Parent */}
      {vacations.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 flex-shrink-0 mt-1 sm:mt-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                  Upcoming Vacation
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {vacations[1]?.startDate || vacations[0]?.startDate} to {vacations[1]?.endDate || vacations[0]?.endDate}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white font-['Outfit'] mt-0.5">
                {vacations[1]?.title || vacations[0]?.title} • {vacations[1]?.totalDays || vacations[0]?.totalDays} Days Break
              </h4>
              <p className="text-xs text-slate-400">
                School reopens: <strong className="text-cyan-300">{vacations[1]?.reopenDate || vacations[0]?.reopenDate}</strong>
                {studentHostel ? ` • Boarders return: ${vacations[1]?.hostelReportDate || vacations[0]?.hostelReportDate} (${vacations[1]?.hostelReportTime || '4pm'})` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentTab('calendar')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold text-xs transition border border-emerald-500/30 flex items-center gap-2 w-fit whitespace-nowrap"
          >
            <span>Open Vacation Hub</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Smart Canteen Lunch Card Balance & Quick Recharge */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0 shadow-lg shadow-amber-500/10">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wide">
                Smart Lunch Card
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {student?.id?.toUpperCase() || 'STU-101'}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white font-['Outfit'] mt-0.5 flex items-center gap-2">
              <span>Available Canteen Balance:</span>
              <span className="text-amber-400 font-mono text-base font-extrabold">
                ₹{canteenWallets[student?.id]?.balance || 0}
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Daily spent today: <strong className="text-slate-200">₹{canteenWallets[student?.id]?.dailySpentToday || 0}</strong> &bull; Daily limit: ₹150 &bull; Cashless RFID contactless dining
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsCanteenTopupOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Top-Up Meal Balance</span>
          </button>
          <button
            onClick={() => setCurrentTab('canteen')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-semibold text-xs transition flex items-center gap-1.5"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>View Canteen Menu</span>
          </button>
        </div>
      </div>

      {/* 2. Parent-Teacher Meeting (PTM) Appointment & Consultation Desk */}
      {ptmEvents && ptmEvents.length > 0 && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase">
                    Parent-Teacher Meeting
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {ptmEvents[0]?.date} ({ptmEvents[0]?.startTime} - {ptmEvents[0]?.endTime})
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white font-['Outfit'] mt-0.5">
                  {ptmEvents[0]?.title}
                </h4>
              </div>
            </div>

            <span className="text-xs text-indigo-300 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 self-start sm:self-auto font-medium">
              Venue: {ptmEvents[0]?.venue}
            </span>
          </div>

          {ptmBookingSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{ptmBookingSuccess}</span>
            </div>
          )}

          {/* Teacher Consultation Slots */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Select Subject Master / Class Teacher to Reserve 15-Minute Consultation Slot
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ptmEvents[0]?.teachersAvailable?.map((teacher) => {
                const bookedByMe = teacher.slots?.find(
                  s => s.studentName?.toLowerCase().includes(student?.firstName?.toLowerCase()) || s.rollNo === student?.rollNo
                );

                return (
                  <div key={teacher.teacherId} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h6 className="text-sm font-bold text-white">{teacher.teacherName}</h6>
                        <p className="text-xs text-cyan-400">{teacher.subject} &bull; {teacher.room}</p>
                      </div>
                      {bookedByMe ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Slot Confirmed ({bookedByMe.time})
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          {teacher.slots?.filter(s => s.status === 'available').length} slots open
                        </span>
                      )}
                    </div>

                    {bookedByMe ? (
                      <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium">Your Booked Time: <strong>{bookedByMe.time}</strong></span>
                          <button
                            onClick={() => {
                              cancelPtmSlot(ptmEvents[0].id, teacher.teacherId, bookedByMe.id);
                              setPtmBookingSuccess('PTM consultation slot has been cancelled successfully.');
                              setTimeout(() => setPtmBookingSuccess(''), 4000);
                            }}
                            className="text-rose-400 hover:text-rose-300 text-[11px] underline font-semibold"
                          >
                            Cancel Slot
                          </button>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => {
                              startPrivateCall({
                                id: teacher.teacherId,
                                name: teacher.teacherName,
                                role: teacher.subject,
                                phone: '+91 94361 55021',
                                photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
                                info: `PTM Consultation: ${bookedByMe.time}`
                              }, 'video');
                            }}
                            className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Launch 1-on-1 Virtual Consultation</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {teacher.slots?.map((slot) => {
                          const isAvailable = slot.status === 'available';
                          return (
                            <button
                              key={slot.id}
                              disabled={!isAvailable}
                              onClick={() => {
                                bookPtmSlot(ptmEvents[0].id, teacher.teacherId, slot.id, {
                                  parentName: student?.guardianName || currentUser?.name || 'Parent',
                                  studentName: `${student?.firstName} ${student?.lastName}`,
                                  studentId: student?.id,
                                  rollNo: student?.rollNo
                                });
                                setPtmBookingSuccess(`Slot ${slot.time} booked with ${teacher.teacherName}!`);
                                setTimeout(() => setPtmBookingSuccess(''), 4000);
                              }}
                              className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition text-center border ${
                                isAvailable
                                  ? 'bg-slate-900 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border-slate-700 hover:border-cyan-500/50'
                                  : 'bg-slate-900/40 text-slate-600 border-slate-900 cursor-not-allowed line-through'
                              }`}
                              title={isAvailable ? `Click to book ${slot.time}` : 'Slot already booked'}
                            >
                              {slot.time.split(' - ')[0]}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Two Columns: Recent Grades Split & Fee Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Term Grades (Continuous Tests vs Term Exams) */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Academic Performance Breakdown</span>
            </h3>
            <span className="text-[10px] uppercase font-bold text-cyan-400">
              MBSE Assessment
            </span>
          </div>

          {access.isWithheld ? (
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-rose-500/30 text-center space-y-4 my-2">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">
                  Academic Progress Report Withheld
                </h4>
                <p className="text-xs text-rose-300">
                  {access.reason === 'fee_due' 
                    ? `School Fee clearance ba (₹${access.pendingAmount?.toLocaleString('en-IN')}) a awm vangin zirlai mark leh report card hi khar a ni rih e.`
                    : (access.customReason || 'Institutional clearance pending.')}
                </p>
              </div>

              {access.reason === 'fee_due' ? (
                <button
                  onClick={() => setIsOnlineCheckoutOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 inline-flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Fee Online (Instant Unlock)</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Khawngaihin school authority / office-ah clearance la rawh le.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Class Tests (Continuous 20-25M)
              </h4>
              {classTests.map((g) => (
                <div key={g.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{g.subject}</span>
                    <span className="text-[10px] text-slate-400">{g.testName}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-cyan-300">{g.marksObtained} / {g.maxMarks}</span>
                    <span className="block text-[10px] text-slate-500">
                      {Math.round((g.marksObtained / g.maxMarks) * 100)}%
                    </span>
                  </div>
                </div>
              ))}

              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider pt-2">
                Examinations (Term-End 100M)
              </h4>
              {examinations.map((g) => (
                <div key={g.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{g.subject}</span>
                    <span className="text-[10px] text-slate-400">{g.testName}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-emerald-400">{g.marksObtained} / {g.maxMarks}</span>
                    <span className="block text-[10px] text-slate-500">
                      {g.marksObtained >= 90 ? 'Grade A1' : 'Grade A2'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Fee History & Receipts */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <span>Fee Payment History &amp; Official Receipts</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">{studentFees.length} Records</span>
          </div>

          <div className="space-y-3">
            {studentFees.length > 0 ? (
              studentFees.map((fee) => (
                <div key={fee.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-400">{fee.receiptNo}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      fee.paymentMode === 'upi' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {fee.paymentMode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-medium">{fee.feeType}</span>
                    <span className="font-mono font-bold text-white text-sm">
                      ₹{Number(fee.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                    <span>Date: {fee.paymentDate}</span>
                    <span>{fee.transactionUtr ? `UTR: ${fee.transactionUtr}` : `Cashier: ${fee.cashierName}`}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">No payment records yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Online Leave Applications (Chawlh Dilna) Suite */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span>Chawlh Dilna (Online Leave Applications)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Apply online for medical, emergency, or sports leave. Review hierarchy: Class Master &rarr; Vice Principal &rarr; Principal.
            </p>
          </div>

          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Chawlh Dil Thar Rawh (Apply Leave)</span>
          </button>
        </div>

        {/* Student Leaves List */}
        <div className="space-y-3 pt-2">
          {studentLeaves.length > 0 ? (
            studentLeaves.map((leave) => {
              const isApproved = leave.status === 'approved';
              const isRejected = leave.status === 'rejected';
              const isPendingMaster = leave.status === 'pending_class_master';
              const isPendingPrincipal = leave.status === 'pending_principal';

              return (
                <div
                  key={leave.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isApproved
                      ? 'bg-slate-950/70 border-emerald-500/40'
                      : isRejected
                      ? 'bg-slate-950/70 border-rose-500/40'
                      : 'bg-slate-950/70 border-cyan-500/40'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-300">
                        {leave.applicationNo}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {leave.leaveType.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-300 font-semibold">
                        {leave.startDate} to {leave.endDate} ({leave.totalDays} {leave.totalDays === 1 ? 'Day' : 'Days'})
                      </span>
                    </div>

                    <div>
                      {isApproved && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Approved &amp; Excused in Attendance
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-400" />
                          Rejected
                        </span>
                      )}
                      {isPendingMaster && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          Awaiting Class Master Review
                        </span>
                      )}
                      {isPendingPrincipal && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 animate-pulse">
                          <ShieldCheck className="w-3 h-3 text-purple-400" />
                          Recommended &bull; Awaiting Principal
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Chhan:</strong> {leave.reason}
                  </p>

                  {/* Stepper feedback */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                      <strong className="text-slate-200 block">1. Class Master:</strong>
                      <span>{leave.classMasterReview?.remarks || (leave.classMasterReview?.status === 'approved' || leave.classMasterReview?.status === 'recommended' ? 'Endorsed' : 'Pending verification')}</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                      <strong className="text-slate-200 block">2. Vice Principal:</strong>
                      <span>{leave.vicePrincipalReview?.remarks || (leave.vicePrincipalReview?.status === 'endorsed' ? 'Endorsed' : 'Pending review')}</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                      <strong className="text-slate-200 block">3. Principal Seal:</strong>
                      <span>{leave.principalReview?.remarks || (leave.status === 'approved' ? 'Officially Approved' : 'Pending final seal')}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">
              No leave applications submitted yet for {student?.firstName}.
            </p>
          )}
        </div>
      </div>

      {/* Online Gateway Checkout Modal for Student/Parent */}
      <OnlineCheckoutModal
        isOpen={isOnlineCheckoutOpen}
        onClose={() => setIsOnlineCheckoutOpen(false)}
        student={student}
        feeAmount={pendingFees > 0 ? pendingFees : 18000}
        feeType="Tuition & Institutional Fee Clearance"
        onPaymentSuccess={() => {
          // Modal will show success and auto-close
        }}
      />

      {/* Student/Parent Leave Application Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e1628] border border-slate-700 shadow-2xl p-6 sm:p-7 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Chawlh Dilna Thehluhna (Leave Application)
                </h3>
                <p className="text-xs text-slate-400">
                  Class: {studentClass?.name || 'Class 12'} &bull; Class Master: {studentClass?.teacherName || 'Class Teacher'}
                </p>
              </div>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const start = new Date(leaveFormData.startDate);
                const end = new Date(leaveFormData.endDate);
                const diffTime = Math.abs(end - start);
                const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                applyForLeave({
                  studentId: student.id,
                  studentName: `${student.firstName} ${student.lastName}`,
                  rollNo: student.rollNo,
                  classId: student.classId,
                  className: studentClass?.name || 'Class 12',
                  classTeacherName: studentClass?.teacherName || 'Class Master',
                  applicantType: isParent ? 'parent' : 'student',
                  applicantName: isParent ? (currentUser?.displayName || 'Guardian') : `${student.firstName} ${student.lastName} (Self)`,
                  applicantPhone: isParent ? currentUser?.phone : student.guardianPhone,
                  leaveType: leaveFormData.leaveType,
                  startDate: leaveFormData.startDate,
                  endDate: leaveFormData.endDate,
                  totalDays: Math.max(1, totalDays),
                  reason: leaveFormData.reason,
                  documentName: leaveFormData.documentName || null
                });

                setIsLeaveModalOpen(false);
                setLeaveFormData({
                  leaveType: 'medical',
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: new Date().toISOString().split('T')[0],
                  reason: '',
                  documentName: ''
                });
                alert('Chawlh dilna chu hlawhtling taka thehluh a ni e! Class Master, VP leh Principal ten an endik dawn e.');
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-bold mb-1">Leave Type (Chawlh Dil Chhan) *</label>
                <select
                  value={leaveFormData.leaveType}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, leaveType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="medical">Medical / Khawsik &amp; Damlohna</option>
                  <option value="family_emergency">Family Emergency / Chhungkaw thil hmanhmawh</option>
                  <option value="bereavement">Bereavement / Chhiat tawk</option>
                  <option value="sports_official">Sports / State &amp; School Representation</option>
                  <option value="other">Other Reason</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Chawlh Tan Ni (Start Date) *</label>
                  <input
                    type="date"
                    required
                    value={leaveFormData.startDate}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Chawlh Tawp Ni (End Date) *</label>
                  <input
                    type="date"
                    required
                    value={leaveFormData.endDate}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Chawlh Dil Chhan Fiah Tak (Detailed Reason) *</label>
                <textarea
                  rows="3"
                  required
                  value={leaveFormData.reason}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                  placeholder="Khawsik, doctor inentir, etc. chiang takin ziak rawh le..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Doctor Lehkha / Document (Optional)</label>
                <input
                  type="text"
                  value={leaveFormData.documentName}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, documentName: e.target.value })}
                  placeholder="e.g. CivilHospital_Prescription.pdf"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                >
                  Submit Application (Thehlut Rawh)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE STREAMING CLASSROOM SUITE */}
      <LiveClassroomSuite
        isOpen={isLiveClassOpen}
        onClose={() => setIsLiveClassOpen(false)}
        defaultClassId={student?.classId || 'cls-12-sci'}
        isStudentPortal={true}
        studentUser={student}
      />

      {/* SPECIAL ONLINE PROCTORED EXAMINATION SUITE */}
      <SpecialOnlineExamSuite
        isOpen={isSpecialExamOpen}
        onClose={() => setIsSpecialExamOpen(false)}
        studentUser={student}
        isInvigilator={false}
      />

      {/* CANTEEN SMART WALLET TOP-UP MODAL */}
      {isCanteenTopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0e1628] border border-amber-500/40 shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Recharge Smart Meal Card
                  </h3>
                  <p className="text-xs text-slate-400">
                    {student?.firstName} {student?.lastName} ({student?.id?.toUpperCase()})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCanteenTopupOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Current Available Balance</span>
                <p className="text-2xl font-extrabold text-amber-400 font-mono">
                  ₹{canteenWallets[student?.id]?.balance || 0}
                </p>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Active RFID Card
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Select Quick Top-Up Amount
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[100, 200, 500, 1000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopupAmount(amt.toString())}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      topupAmount === amt.toString()
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Custom Recharge Amount (₹)
              </label>
              <input
                type="number"
                min="50"
                max="5000"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setIsCanteenTopupOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const val = Number(topupAmount);
                  if (val > 0) {
                    topupCanteenWallet(student?.id, val, 'Parent Online Top-Up');
                    setIsCanteenTopupOpen(false);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
              >
                Instant UPI Top-Up (₹{topupAmount})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
