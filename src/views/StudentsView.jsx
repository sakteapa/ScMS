import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  QrCode, 
  FileText, 
  CreditCard, 
  Phone, 
  Video,
  Mail, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Sparkles,
  ArrowRight,
  Crown,
  Star,
  Award,
  ShieldCheck,
  Percent,
  HeartHandshake,
  Lock,
  ShieldAlert,
  UserX,
  UserCheck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import ClassLeaderModal from '../components/ClassLeaderModal';
import StudentConcessionSpecialModal from '../components/StudentConcessionSpecialModal';
import StudentIdCardModal from '../components/StudentIdCardModal';
import StudentSuspensionModal from '../components/StudentSuspensionModal';

export default function StudentsView({ setCurrentTab, setSelectedStudentForReport }) {
  const { students, classes, staff, transportRoutes, hostelRooms, startPrivateCall } = useSchool();
  const { currentUser, isPrincipal, isVicePrincipal, isSuperAdmin, isTeacher } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [selectedFeeStatus, setSelectedFeeStatus] = useState('all');
  const [activeModalStudent, setActiveModalStudent] = useState(null);
  const [leaderModalTarget, setLeaderModalTarget] = useState(null);
  const [concessionModalTarget, setConcessionModalTarget] = useState(null);
  const [concessionModalTab, setConcessionModalTab] = useState('concession');
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [idCardTargetStudent, setIdCardTargetStudent] = useState(null);
  const [suspensionModalStudent, setSuspensionModalStudent] = useState(null);
  const [selectedConductStatus, setSelectedConductStatus] = useState('all');

  // Identify if logged-in teacher has a class they are Class Master of
  const teacherClass = isTeacher 
    ? classes.find(c => c.id === currentUser?.classId || staff.find(s => s.phone === currentUser?.phone)?.classTeacherOf === c.id)
    : null;

  const filteredStudents = students.filter(s => {
    const matchesClass = selectedClassId === 'all' || s.classId === selectedClassId;
    const matchesFee = selectedFeeStatus === 'all' || s.feeStatus === selectedFeeStatus;
    const isSuspended = s.status === 'suspended' || Boolean(s.activeSuspension);
    const matchesStatus = selectedConductStatus === 'all' 
      ? true 
      : selectedConductStatus === 'suspended' 
      ? isSuspended 
      : !isSuspended;
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const matchesSearch = !searchQuery || 
      fullName.includes(searchQuery.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.guardianName && s.guardianName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesClass && matchesFee && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
            <span>Student Master Directory</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {students.length} Enrolled
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Nursery through Class 12 with Higher Secondary Arts, Science, and Commerce streams.
          </p>
        </div>

        <button
          onClick={() => {
            setIdCardTargetStudent(null);
            setIsIdCardModalOpen(true);
          }}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition shrink-0"
        >
          <CreditCard className="w-4 h-4" />
          <span>Student ID Cards &amp; Admit Cards</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
            >
              <option value="all">All Classes (Nursery - 12)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name} {c.stream ? `(${c.stream.toUpperCase()})` : ''}</option>
              ))}
            </select>
          </div>

          {/* Fee Status Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Fee Status</label>
            <select
              value={selectedFeeStatus}
              onChange={(e) => setSelectedFeeStatus(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
            >
              <option value="all">All Fee Statuses</option>
              <option value="cleared">Cleared (Full Paid)</option>
              <option value="partial">Partial</option>
              <option value="overdue">Overdue / Unpaid</option>
            </select>
          </div>

          {/* Conduct & Status Filter */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Conduct &amp; Status</label>
            <select
              value={selectedConductStatus}
              onChange={(e) => setSelectedConductStatus(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
            >
              <option value="all">All Student Statuses</option>
              <option value="active">Active Enrolled</option>
              <option value="suspended">⛔ Suspended</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or admission number..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Class Leadership & Governance Banner (Class Master Authority) */}
      {selectedClassId !== 'all' && (() => {
        const selClass = classes.find(c => c.id === selectedClassId);
        if (!selClass) return null;

        const classMasterStaff = staff.find(s => s.classTeacherOf === selClass.id || s.id === selClass.classTeacherId);
        const leaderStudent = students.find(s => s.id === selClass.classLeaderId);
        const asstLeaderStudent = students.find(s => s.id === selClass.asstClassLeaderId);

        return (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-slate-950 border border-amber-500/30 shadow-xl space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-black text-white font-['Outfit']">
                    {selClass.name} Leadership &amp; Governance
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                    Room {selClass.roomNumber || 'R-01'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" /> Class Master Ruat
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Class Master: <strong className="text-white">{selClass.teacherName || 'Not Assigned'}</strong> 
                  {classMasterStaff?.phone ? ` (📞 ${classMasterStaff.phone})` : ''}
                </p>
              </div>

              <button
                onClick={() => setLeaderModalTarget(selClass)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition self-start sm:self-auto"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Ruat / Siamrem Leaders</span>
              </button>
            </div>

            {/* Leadership Roster Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Class Leader (Monitor) */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <img
                      src={leaderStudent?.photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-400 shrink-0"
                    />
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[10px] shadow">
                      👑
                    </div>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block">
                      Class Leader (Monitor)
                    </span>
                    <div className="font-bold text-white text-xs truncate">
                      {leaderStudent ? `${leaderStudent.firstName} ${leaderStudent.lastName}` : selClass.classLeaderName || 'Ruat a la ni lo'}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate font-mono">
                      {leaderStudent ? `Roll #${leaderStudent.rollNo} • ${leaderStudent.admissionNo}` : 'Class Master ruat tur'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setLeaderModalTarget(selClass)}
                  className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition shrink-0"
                  title="Siamrem Class Leader"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Assistant Class Leader (Vice Monitor) */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <img
                      src={asstLeaderStudent?.photoUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-cyan-400 shrink-0"
                    />
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold text-[10px] shadow">
                      ⭐
                    </div>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">
                      Assistant Class Leader
                    </span>
                    <div className="font-bold text-white text-xs truncate">
                      {asstLeaderStudent ? `${asstLeaderStudent.firstName} ${asstLeaderStudent.lastName}` : selClass.asstClassLeaderName || 'Ruat a la ni lo'}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate font-mono">
                      {asstLeaderStudent ? `Roll #${asstLeaderStudent.rollNo} • ${asstLeaderStudent.admissionNo}` : 'Class Master ruat tur'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setLeaderModalTarget(selClass)}
                  className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition shrink-0"
                  title="Siamrem Asst. Class Leader"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Helper Banner for Logged-In Teacher */}
      {selectedClassId === 'all' && teacherClass && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/70 to-slate-900 border border-cyan-500/40 text-xs flex items-center justify-between gap-3 shadow-md animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">
                  I Class Enkawl Lai Mek: {teacherClass.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                  Room {teacherClass.roomNumber || 'R-01'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Class Leader: <strong className="text-amber-300">{teacherClass.classLeaderName || 'Ruat a la ni lo'}</strong> • 
                Asst: <strong className="text-cyan-300">{teacherClass.asstClassLeaderName || 'Ruat a la ni lo'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setLeaderModalTarget(teacherClass)}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Siamrem Leaders</span>
          </button>
        </div>
      )}

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.map((st) => {
          const studentClass = classes.find(c => c.id === st.classId);
          const feePercent = Math.min(100, Math.round(((st.paidFees || 0) / (st.totalFees || 32000)) * 100));
          const isLeader = st.isClassLeader || studentClass?.classLeaderId === st.id;
          const isAsstLeader = st.isAsstClassLeader || studentClass?.asstClassLeaderId === st.id;
          const isSuspended = st.status === 'suspended' || Boolean(st.activeSuspension);

          return (
            <div
              key={st.id}
              className={`p-5 rounded-2xl bg-slate-900/80 border transition space-y-4 shadow-lg group ${
                isSuspended
                  ? 'border-rose-600/70 hover:border-rose-500 bg-gradient-to-b from-rose-950/20 to-slate-900/95 ring-1 ring-rose-500/30'
                  : isLeader 
                  ? 'border-amber-500/50 hover:border-amber-400 bg-gradient-to-b from-amber-950/10 to-slate-900/90' 
                  : isAsstLeader
                  ? 'border-cyan-500/50 hover:border-cyan-400 bg-gradient-to-b from-cyan-950/10 to-slate-900/90'
                  : 'border-slate-800 hover:border-cyan-500/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={st.photoUrl}
                      alt=""
                      className={`w-12 h-12 rounded-xl object-cover ring-2 transition ${
                        isSuspended
                          ? 'ring-rose-500 animate-pulse'
                          : isLeader 
                          ? 'ring-amber-400' 
                          : isAsstLeader 
                          ? 'ring-cyan-400' 
                          : 'ring-slate-700 group-hover:ring-cyan-400/60'
                      }`}
                    />
                    {isLeader && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[10px] shadow">
                        👑
                      </div>
                    )}
                    {isAsstLeader && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold text-[10px] shadow">
                        ⭐
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                        {st.firstName} {st.lastName}
                      </h3>
                      {isSuspended && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/50 text-[9px] font-bold flex items-center gap-1 animate-pulse">
                          <ShieldAlert className="w-2.5 h-2.5" /> Suspended
                        </span>
                      )}
                      {isLeader && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5" /> Leader
                        </span>
                      )}
                      {isAsstLeader && (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5" /> Asst
                        </span>
                      )}
                      {st.isSpecialCategory && (
                        <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5 text-amber-400" /> Special
                        </span>
                      )}
                      {st.feeConcession && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-bold flex items-center gap-0.5">
                          <Percent className="w-2.5 h-2.5 text-purple-400" /> {st.feeConcession.discountPercent}% Off
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span>{st.admissionNo}</span>
                      <span>•</span>
                      <span className="text-cyan-400 font-bold">Roll #{st.rollNo}</span>
                    </div>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                  st.feeStatus === 'cleared'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : st.feeStatus === 'partial'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {st.feeStatus}
                </span>
              </div>

              {/* Class & Details */}
              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800/80 text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Class &amp; Stream</span>
                  <span className="font-semibold text-slate-200">
                    {studentClass?.name} {st.stream ? `(${st.stream.toUpperCase()})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Attendance Rate</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {st.attendanceRate || 92}%
                  </span>
                </div>
              </div>

              {/* Fee Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Fee Clearance</span>
                  <span className="font-mono font-semibold text-white">
                    ₹{(st.paidFees || 0).toLocaleString()} / ₹{(st.totalFees || 32000).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${
                      feePercent >= 100 ? 'bg-emerald-400' : feePercent >= 50 ? 'bg-cyan-400' : 'bg-rose-400'
                    }`}
                    style={{ width: `${feePercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => setActiveModalStudent(st)}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <span>Full Profile &amp; QR</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  {(isPrincipal || isVicePrincipal || isSuperAdmin) && (
                    <button
                      onClick={() => {
                        setConcessionModalTarget(st);
                        setConcessionModalTab('concession');
                      }}
                      className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 transition"
                      title="Sibling / Fee Concession (Admin & VP)"
                    >
                      <Percent className="w-4 h-4" />
                    </button>
                  )}
                  {(isPrincipal || isSuperAdmin) && (
                    <button
                      onClick={() => {
                        setConcessionModalTarget(st);
                        setConcessionModalTab('special_category');
                      }}
                      className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition"
                      title="Principal Special Category Discretion"
                    >
                      <Crown className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => startPrivateCall({
                      id: st.id,
                      name: `${st.firstName} ${st.lastName}`,
                      role: 'Student / Parent Consultation',
                      phone: st.phone || st.guardianPhone,
                      photoUrl: st.photoUrl,
                      info: `Class: ${studentClass?.name || 'Class 12'} • Roll #${st.rollNo}`
                    }, 'video')}
                    className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition"
                    title="1-on-1 Private Video Consultation Call"
                  >
                    <Video className="w-4 h-4" />
                  </button>

                  {/* Disciplinary & Suspension Suite Button */}
                  <button
                    onClick={() => setSuspensionModalStudent(st)}
                    className={`p-1.5 rounded-lg border transition ${
                      isSuspended
                        ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/50 animate-pulse'
                        : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}
                    title="Student Disciplinary & Suspension Suite (Thununna / Hremna)"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setIdCardTargetStudent(st);
                      setIsIdCardModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Print Student ID Card & Admit Card"
                  >
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                  </button>
                  <button
                    onClick={() => {
                      if (setSelectedStudentForReport) setSelectedStudentForReport(st);
                      setCurrentTab('report_cards');
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Generate Report Card"
                  >
                    <FileText className="w-4 h-4 text-cyan-400" />
                  </button>
                  <button
                    onClick={() => setCurrentTab('financials')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Collect Fee Payment"
                  >
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* STUDENT FULL PROFILE & QR MODAL */}
      {activeModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0e1626] border border-slate-700 shadow-2xl p-6 space-y-5 overflow-y-auto max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-['Outfit']">Student Identity &amp; Record</h3>
              <button onClick={() => setActiveModalStudent(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={activeModalStudent.photoUrl}
                alt=""
                className="w-20 h-24 rounded-xl object-cover ring-2 ring-cyan-400/50"
              />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white font-['Outfit']">
                  {activeModalStudent.firstName} {activeModalStudent.lastName}
                </h4>
                <p className="text-xs text-cyan-400 font-mono">Admission No: {activeModalStudent.admissionNo}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Roll #{activeModalStudent.rollNo}</span>
                  <span>•</span>
                  <span>Blood: <strong className="text-rose-400">{activeModalStudent.bloodGroup}</strong></span>
                </div>
                <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {classes.find(c => c.id === activeModalStudent.classId)?.name}
                  </span>
                  {(activeModalStudent.isClassLeader || classes.find(c => c.id === activeModalStudent.classId)?.classLeaderId === activeModalStudent.id) && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm">
                      <Crown className="w-3 h-3 text-amber-400" /> Class Leader (CR)
                    </span>
                  )}
                  {(activeModalStudent.isAsstClassLeader || classes.find(c => c.id === activeModalStudent.classId)?.asstClassLeaderId === activeModalStudent.id) && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 text-cyan-400" /> Asst. Class Leader
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic QR Code */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Official Verification QR Code</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Scannable by Teacher attendance reader</p>
              </div>
              <div className="p-2 bg-white rounded-lg shadow">
                <QRCodeSVG
                  value={JSON.stringify({
                    id: activeModalStudent.id,
                    admissionNo: activeModalStudent.admissionNo,
                    rollNo: activeModalStudent.rollNo,
                    name: `${activeModalStudent.firstName} ${activeModalStudent.lastName}`,
                    classId: activeModalStudent.classId
                  })}
                  size={72}
                  level="M"
                />
              </div>
            </div>

            {/* Guardian & Contact */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Users className="w-4 h-4 text-slate-500" />
                <span>Guardian: <strong>{activeModalStudent.guardianName}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-slate-500" />
                <span>Contact: {activeModalStudent.guardianPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>Email: {activeModalStudent.guardianEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>Address: {activeModalStudent.address}</span>
              </div>
            </div>

            {/* Quick 1-on-1 Communication Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const target = activeModalStudent;
                  setActiveModalStudent(null);
                  startPrivateCall({
                    id: target.id,
                    name: `${target.firstName} ${target.lastName}`,
                    role: `Student (Roll #${target.rollNo})`,
                    phone: target.guardianPhone || target.phone,
                    photoUrl: target.photoUrl,
                    info: `Guardian: ${target.guardianName || 'Parent'}`
                  }, 'video');
                }}
                className="px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
              >
                <Video className="w-3.5 h-3.5 text-cyan-400" />
                <span>Private Video Call</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = activeModalStudent;
                  setActiveModalStudent(null);
                  startPrivateCall({
                    id: target.id,
                    name: `${target.firstName} ${target.lastName}`,
                    role: `Student (Roll #${target.rollNo})`,
                    phone: target.guardianPhone || target.phone,
                    photoUrl: target.photoUrl,
                    info: `Guardian: ${target.guardianName || 'Parent'}`
                  }, 'voice');
                }}
                className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Voice Call</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  if (setSelectedStudentForReport) setSelectedStudentForReport(activeModalStudent);
                  setActiveModalStudent(null);
                  setCurrentTab('report_cards');
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
              >
                Generate Report Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLASS LEADER & ASSISTANT APPOINTMENT MODAL */}
      <ClassLeaderModal
        isOpen={Boolean(leaderModalTarget)}
        onClose={() => setLeaderModalTarget(null)}
        targetClass={leaderModalTarget}
      />

      {/* SIBLING CONCESSION & PRINCIPAL SPECIAL CATEGORY MODAL */}
      <StudentConcessionSpecialModal
        isOpen={Boolean(concessionModalTarget)}
        onClose={() => setConcessionModalTarget(null)}
        targetStudent={concessionModalTarget}
        initialTab={concessionModalTab}
      />
      {/* Student ID Card & Exam Admit Card Generator Suite */}
      <StudentIdCardModal
        isOpen={isIdCardModalOpen}
        onClose={() => setIsIdCardModalOpen(false)}
        initialStudent={idCardTargetStudent}
        selectedClassId={selectedClassId !== 'all' ? selectedClassId : null}
      />

      {/* Student Disciplinary & Suspension Modal */}
      <StudentSuspensionModal
        isOpen={Boolean(suspensionModalStudent)}
        student={suspensionModalStudent}
        onClose={() => setSuspensionModalStudent(null)}
      />
    </div>
  );
}
