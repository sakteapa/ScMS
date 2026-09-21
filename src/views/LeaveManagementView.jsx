import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Calendar, 
  User, 
  Users, 
  GraduationCap, 
  ShieldCheck, 
  Search, 
  Filter, 
  Plus, 
  ArrowRight, 
  Paperclip, 
  ExternalLink, 
  Phone, 
  CheckCheck, 
  Building2, 
  Award,
  Sparkles,
  Volume2,
  Trash2,
  Printer,
  Eye,
  X
} from 'lucide-react';
import LeaveDocumentUploadCapture from '../components/LeaveDocumentUploadCapture';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export default function LeaveManagementView() {
  const { 
    leaveApplications = [], 
    applyForLeave, 
    reviewLeaveApplication, 
    deleteLeaveApplication,
    students = [],
    classes = [],
    staff = []
  } = useSchool();
  const { currentUser, isPrincipal, isVicePrincipal, isTeacher, isSuperAdmin } = useAuth();

  // Filters
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending_me' | 'pending_class_master' | 'pending_principal' | 'approved' | 'rejected'
  const [filterClass, setFilterClass] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected leave for deep inspection & review
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [viewingLeaveAttachment, setViewingLeaveAttachment] = useState(null);

  // Apply modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [newLeaveData, setNewLeaveData] = useState({
    studentId: '',
    applicantType: 'student',
    applicantName: '',
    applicantPhone: '',
    leaveType: 'medical',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    documentName: 'Medical_Prescription.pdf'
  });

  // Calculate user review role
  // If teacher, they are Class Master. If VP, vice_principal. If Principal/Superadmin, principal.
  const activeReviewRole = isPrincipal || isSuperAdmin
    ? 'principal'
    : isVicePrincipal
    ? 'vice_principal'
    : 'class_master';

  const roleLabel = activeReviewRole === 'principal'
    ? 'Principal (Institutional Head)'
    : activeReviewRole === 'vice_principal'
    ? 'Vice Principal (Academic Dean)'
    : 'Class Master / Class Teacher';

  // Chime feedback on approval
  const playApprovalChime = () => {
    try {
      if (window.campusBellEngine && typeof window.campusBellEngine.playChime === 'function') {
        window.campusBellEngine.playChime();
        return;
      }
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3); // G5
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.55);
      }
    } catch(e) {}
  };

  // Filter logic
  const filteredLeaves = leaveApplications.filter(l => {
    // Status filter
    if (filterStatus === 'pending_me') {
      if (activeReviewRole === 'class_master' && l.status !== 'pending_class_master') return false;
      if ((activeReviewRole === 'principal' || activeReviewRole === 'vice_principal') && l.status !== 'pending_principal') return false;
    } else if (filterStatus !== 'all' && l.status !== filterStatus) {
      return false;
    }

    // Class filter
    if (filterClass !== 'all' && l.classId !== filterClass) return false;

    // Type filter
    if (filterType !== 'all' && l.leaveType !== filterType) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = l.studentName?.toLowerCase().includes(q);
      const matchAppNo = l.applicationNo?.toLowerCase().includes(q);
      const matchRoll = l.rollNo?.toString().includes(q);
      const matchReason = l.reason?.toLowerCase().includes(q);
      if (!matchName && !matchAppNo && !matchRoll && !matchReason) return false;
    }

    return true;
  });

  // Metrics
  const totalCount = leaveApplications.length;
  const pendingMasterCount = leaveApplications.filter(l => l.status === 'pending_class_master').length;
  const pendingPrincipalCount = leaveApplications.filter(l => l.status === 'pending_principal').length;
  const approvedCount = leaveApplications.filter(l => l.status === 'approved').length;

  // Handle Review action
  const handlePerformReview = (decision) => {
    if (!selectedLeave) return;

    reviewLeaveApplication(selectedLeave.id, {
      reviewerRole: activeReviewRole,
      reviewerName: currentUser?.displayName || roleLabel,
      decision,
      remarks: reviewRemarks || `${decision === 'approved' ? 'Approved' : decision === 'recommended' ? 'Recommended' : 'Rejected'} by ${roleLabel}`
    });

    if (decision === 'approved') {
      playApprovalChime();
    }

    // Refresh selected
    const updated = leaveApplications.find(l => l.id === selectedLeave.id);
    setSelectedLeave(null);
    setReviewRemarks('');
  };

  // Handle Apply on behalf of student
  const handleApplySubmit = (e) => {
    e.preventDefault();
    const st = students.find(s => s.id === newLeaveData.studentId);
    if (!st) {
      alert('Khawngaihin zirlai thlang rawh le.');
      return;
    }
    const cls = classes.find(c => c.id === st.classId);

    // Calculate total days
    const start = new Date(newLeaveData.startDate);
    const end = new Date(newLeaveData.endDate);
    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    applyForLeave({
      ...newLeaveData,
      studentName: `${st.firstName} ${st.lastName}`,
      rollNo: st.rollNo,
      classId: st.classId,
      className: cls?.name || 'Class 12',
      classTeacherName: cls?.teacherName || 'Class Master',
      totalDays: Math.max(1, totalDays)
    });

    setIsApplyModalOpen(false);
    setNewLeaveData({
      studentId: '',
      applicantType: 'student',
      applicantName: '',
      applicantPhone: '',
      leaveType: 'medical',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      reason: '',
      documentName: '',
      documentUrl: ''
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Multi-Role Context */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0e1628] to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] tracking-tight">
              Online Leave Applications &amp; Review Council
            </h2>
            <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              Chawlh Dilna Council
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Multi-tier leave review and clearance hierarchy: <strong className="text-cyan-300">Class Master (Zirtirtu)</strong> endorses, <strong className="text-purple-300">Vice Principal</strong> verifies, and <strong className="text-amber-300">Principal</strong> grants final executive approval with automatic attendance synchronization.
          </p>

          {/* Active Review Role Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400">Reviewing As:</span>
            <span className={`font-bold ${
              activeReviewRole === 'principal' ? 'text-amber-400' : activeReviewRole === 'vice_principal' ? 'text-purple-400' : 'text-cyan-400'
            }`}>
              {roleLabel}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">({currentUser?.displayName || 'Authorized User'})</span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Apply For Leave</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Applications</div>
          <div className="text-2xl font-black text-white font-['Outfit']">{totalCount}</div>
          <div className="text-[10px] text-slate-500">Academic Year 2026-27</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            Class Master Review
          </div>
          <div className="text-2xl font-black text-cyan-300 font-['Outfit']">{pendingMasterCount}</div>
          <div className="text-[10px] text-slate-500">Awaiting Class Teacher</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-purple-400" />
            VP / Principal Review
          </div>
          <div className="text-2xl font-black text-purple-300 font-['Outfit']">{pendingPrincipalCount}</div>
          <div className="text-[10px] text-slate-500">Awaiting Executive Seal</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Approved &amp; Excused
          </div>
          <div className="text-2xl font-black text-emerald-300 font-['Outfit']">{approvedCount}</div>
          <div className="text-[10px] text-slate-500">Attendance Synced</div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending_me', label: 'Pending My Review' },
            { key: 'pending_class_master', label: 'Pending Class Master' },
            { key: 'pending_principal', label: 'Pending Principal' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterStatus === tab.key
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dropdown Filters & Search */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Leave Types</option>
            <option value="medical">Medical / Sick</option>
            <option value="family_emergency">Family Emergency</option>
            <option value="sports_official">Sports / Representation</option>
            <option value="bereavement">Bereavement</option>
            <option value="other">Other</option>
          </select>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student, roll no..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Leave Applications List */}
      <div className="space-y-4">
        {filteredLeaves.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800 text-slate-500 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-medium">No leave applications match the selected filter criteria.</p>
          </div>
        ) : (
          filteredLeaves.map((leave) => {
            const isApproved = leave.status === 'approved';
            const isRejected = leave.status === 'rejected';
            const isPendingMaster = leave.status === 'pending_class_master';
            const isPendingPrincipal = leave.status === 'pending_principal';

            return (
              <div
                key={leave.id}
                className={`p-5 sm:p-6 rounded-3xl border transition-all space-y-4 shadow-lg ${
                  isApproved
                    ? 'bg-slate-900/80 border-emerald-500/30 hover:border-emerald-500/50'
                    : isRejected
                    ? 'bg-slate-900/80 border-rose-500/30'
                    : isPendingPrincipal
                    ? 'bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 border-purple-500/40 ring-1 ring-purple-500/20'
                    : 'bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 border-cyan-500/40 ring-1 ring-cyan-500/20'
                }`}
              >
                {/* Header Row: Applicant Bio & Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm shrink-0">
                      {leave.rollNo || 'ST'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white font-['Outfit']">
                          {leave.studentName}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {leave.applicationNo}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {leave.className} • Roll {leave.rollNo} • Class Master: <strong className="text-slate-300">{leave.classTeacherName}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Pill */}
                    {isApproved && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Approved &amp; Excused
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        Rejected
                      </span>
                    )}
                    {isPendingMaster && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 animate-pulse">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        Pending Class Master
                      </span>
                    )}
                    {isPendingPrincipal && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 animate-pulse">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        Pending Principal Clearance
                      </span>
                    )}

                    {(isPrincipal || isSuperAdmin) && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove leave application ${leave.applicationNo}?`)) {
                            deleteLeaveApplication(leave.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Leave Details Box */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500">Leave Duration:</span>
                      <div className="font-semibold text-white flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{leave.startDate} to {leave.endDate}</span>
                        <span className="px-2 py-0.2 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-bold border border-cyan-500/20">
                          {leave.totalDays} {leave.totalDays === 1 ? 'Day' : 'Days'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500">Category:</span>
                      <div className="font-semibold text-white capitalize mt-0.5">
                        {leave.leaveType.replace('_', ' ')}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500">Applicant:</span>
                      <div className="font-semibold text-white mt-0.5">
                        {leave.applicantName} ({leave.applicantType})
                      </div>
                    </div>
                  </div>

                  {/* Reason text */}
                  <div>
                    <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Chawlh Dil Chhan (Reason):</span>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap">
                      {leave.reason}
                    </p>
                  </div>

                  {/* Document Attachment chip */}
                  {leave.documentName && (
                    <div className="pt-2 flex items-center gap-2">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                        Attachment:
                      </span>
                      <a
                        href={leave.documentUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs flex items-center gap-1.5 transition"
                      >
                        <span>{leave.documentName}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* 3-Tier Multi-Role Approval Progress Stepper */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  {/* Tier 1: Class Master */}
                  <div className={`p-3 rounded-2xl border ${
                    leave.classMasterReview?.status === 'approved' || leave.classMasterReview?.status === 'recommended'
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                      : leave.classMasterReview?.status === 'rejected'
                      ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400'
                  }`}>
                    <div className="font-bold flex items-center justify-between">
                      <span>1. Class Master Review</span>
                      <span className="text-[10px] capitalize font-semibold">
                        {leave.classMasterReview?.status || 'Pending'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 truncate">
                      {leave.classMasterReview?.reviewedBy || leave.classTeacherName}
                    </div>
                    {leave.classMasterReview?.remarks && (
                      <div className="text-[10px] text-slate-300 italic mt-1 border-t border-slate-800/60 pt-1">
                        "{leave.classMasterReview.remarks}"
                      </div>
                    )}
                  </div>

                  {/* Tier 2: Vice Principal */}
                  <div className={`p-3 rounded-2xl border ${
                    leave.vicePrincipalReview?.status === 'approved' || leave.vicePrincipalReview?.status === 'endorsed'
                      ? 'bg-purple-950/20 border-purple-500/30 text-purple-300'
                      : leave.vicePrincipalReview?.status === 'rejected'
                      ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400'
                  }`}>
                    <div className="font-bold flex items-center justify-between">
                      <span>2. Vice Principal Endorsement</span>
                      <span className="text-[10px] capitalize font-semibold">
                        {leave.vicePrincipalReview?.status || 'Pending'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 truncate">
                      {leave.vicePrincipalReview?.reviewedBy || 'Academic Dean / VP'}
                    </div>
                    {leave.vicePrincipalReview?.remarks && (
                      <div className="text-[10px] text-slate-300 italic mt-1 border-t border-slate-800/60 pt-1">
                        "{leave.vicePrincipalReview.remarks}"
                      </div>
                    )}
                  </div>

                  {/* Tier 3: Principal */}
                  <div className={`p-3 rounded-2xl border ${
                    leave.principalReview?.status === 'approved'
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                      : leave.principalReview?.status === 'rejected'
                      ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400'
                  }`}>
                    <div className="font-bold flex items-center justify-between">
                      <span>3. Principal Final Decision</span>
                      <span className="text-[10px] capitalize font-semibold">
                        {leave.principalReview?.status || 'Pending'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 truncate">
                      {leave.principalReview?.reviewedBy || 'Rev. Dr. L. H. Rohmingliana'}
                    </div>
                    {leave.principalReview?.remarks && (
                      <div className="text-[10px] text-slate-300 italic mt-1 border-t border-slate-800/60 pt-1">
                        "{leave.principalReview.remarks}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    Submitted on: {new Date(leave.submittedAt).toLocaleString()}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedLeave(leave);
                        setReviewRemarks('');
                      }}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition active:scale-95"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Review &amp; Decide</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review & Decision Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0e1628] border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white font-['Outfit']">
                  Leave Application Review &amp; Decision
                </h3>
                <p className="text-xs text-slate-400">
                  Application Ref: <strong className="text-cyan-300">{selectedLeave.applicationNo}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedLeave(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Applicant Summary */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500">Student Name:</span>
                <div className="font-bold text-white text-sm mt-0.5">{selectedLeave.studentName}</div>
                <div className="text-slate-400">{selectedLeave.className} • Roll {selectedLeave.rollNo}</div>
              </div>
              <div>
                <span className="text-slate-500">Dates Requested:</span>
                <div className="font-bold text-cyan-300 mt-0.5">
                  {selectedLeave.startDate} to {selectedLeave.endDate} ({selectedLeave.totalDays} Days)
                </div>
                <div className="text-slate-400 capitalize">Type: {selectedLeave.leaveType}</div>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider">Leave Justification:</span>
              <p className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 leading-relaxed">
                {selectedLeave.reason}
              </p>
            </div>

            {/* Attachment preview if any */}
            {(selectedLeave.documentName || selectedLeave.documentUrl) && (
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-2 font-medium">
                    <Paperclip className="w-4 h-4 text-cyan-400" />
                    <span>Medical Document: <strong className="text-white">{selectedLeave.documentName || 'Scanned File'}</strong></span>
                  </span>
                  {selectedLeave.documentUrl && (
                    <button
                      type="button"
                      onClick={() => setViewingLeaveAttachment({ name: selectedLeave.documentName, url: selectedLeave.documentUrl })}
                      className="px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Full Document</span>
                    </button>
                  )}
                </div>

                {/* If image, display inline thumbnail preview */}
                {selectedLeave.documentUrl && (selectedLeave.documentUrl.startsWith('data:image') || /\.(jpg|jpeg|png|webp)$/i.test(selectedLeave.documentName)) && (
                  <div 
                    onClick={() => setViewingLeaveAttachment({ name: selectedLeave.documentName, url: selectedLeave.documentUrl })}
                    className="relative max-h-48 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer group flex items-center justify-center"
                    title="Click to zoom in"
                  >
                    <img 
                      src={selectedLeave.documentUrl} 
                      alt="Doctor slip preview" 
                      className="max-h-48 w-auto object-contain rounded-lg group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="text-xs bg-slate-900/90 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/40 font-bold flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        Click to enlarge
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Review Remarks Textbox */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-white">
                Official Review Remarks ({roleLabel}) *
              </label>
              <textarea
                rows="3"
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                placeholder={`Enter comments, conditions, or instructions from ${roleLabel}...`}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs leading-relaxed"
              ></textarea>
            </div>

            {/* Role Decision Action Buttons */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedLeave(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                {/* Reject Button */}
                <button
                  type="button"
                  onClick={() => handlePerformReview('rejected')}
                  className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition"
                >
                  Reject Application
                </button>

                {/* Class Master Actions */}
                {activeReviewRole === 'class_master' && (
                  <button
                    type="button"
                    onClick={() => handlePerformReview('recommended')}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Recommend to Principal</span>
                  </button>
                )}

                {/* Vice Principal Actions */}
                {activeReviewRole === 'vice_principal' && (
                  <button
                    type="button"
                    onClick={() => handlePerformReview('endorsed')}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Endorse to Principal</span>
                  </button>
                )}

                {/* Principal Actions (Final Executive Decision) */}
                {activeReviewRole === 'principal' && (
                  <button
                    type="button"
                    onClick={() => handlePerformReview('approved')}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/25 transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Official Approval (Sync Attendance)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e1628] border border-slate-700 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Apply For Student Leave (Chawlh Dilna)
              </h3>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Select Student *</label>
                <select
                  required
                  value={newLeaveData.studentId}
                  onChange={(e) => {
                    const st = students.find(s => s.id === e.target.value);
                    setNewLeaveData(prev => ({
                      ...prev,
                      studentId: e.target.value,
                      applicantName: st ? `${st.firstName} ${st.lastName}` : ''
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="">-- Choose student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} (Roll {s.rollNo} - {s.admissionNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Leave Type *</label>
                  <select
                    value={newLeaveData.leaveType}
                    onChange={(e) => setNewLeaveData({ ...newLeaveData, leaveType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="medical">Medical / Sick Leave</option>
                    <option value="family_emergency">Family Emergency</option>
                    <option value="bereavement">Bereavement (Chhiat tawk)</option>
                    <option value="sports_official">Sports / Representation</option>
                    <option value="other">Other Casual Reason</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Applicant Type</label>
                  <select
                    value={newLeaveData.applicantType}
                    onChange={(e) => setNewLeaveData({ ...newLeaveData, applicantType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="student">Student (Self)</option>
                    <option value="parent">Parent / Guardian</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newLeaveData.startDate}
                    onChange={(e) => setNewLeaveData({ ...newLeaveData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={newLeaveData.endDate}
                    onChange={(e) => setNewLeaveData({ ...newLeaveData, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Reason / Description *</label>
                <textarea
                  rows="3"
                  required
                  value={newLeaveData.reason}
                  onChange={(e) => setNewLeaveData({ ...newLeaveData, reason: e.target.value })}
                  placeholder="Chawlh dil chhan fiah takin ziak rawh le..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                ></textarea>
              </div>

              <div>
                <LeaveDocumentUploadCapture
                  documentName={newLeaveData.documentName}
                  documentUrl={newLeaveData.documentUrl}
                  onChange={({ documentName, documentUrl }) => {
                    setNewLeaveData(prev => ({
                      ...prev,
                      documentName,
                      documentUrl
                    }));
                  }}
                  label="Document / Doctor Prescription / Medical Slip"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Document Lightbox Viewer Modal */}
      {viewingLeaveAttachment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <Paperclip className="w-5 h-5 text-cyan-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {viewingLeaveAttachment.name || 'Medical Document / Doctor Slip'}
                  </h4>
                  <p className="text-[11px] text-slate-400">Supporting verification document</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {viewingLeaveAttachment.url && (
                  <a
                    href={viewingLeaveAttachment.url}
                    download={viewingLeaveAttachment.name || 'leave_document'}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700 transition"
                  >
                    Download File
                  </a>
                )}
                <button
                  onClick={() => setViewingLeaveAttachment(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40">
              {viewingLeaveAttachment.url && (viewingLeaveAttachment.url.startsWith('data:image') || /\.(jpg|jpeg|png|webp)$/i.test(viewingLeaveAttachment.name)) ? (
                <img
                  src={viewingLeaveAttachment.url}
                  alt={viewingLeaveAttachment.name || 'Document'}
                  className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-lg border border-slate-800"
                />
              ) : viewingLeaveAttachment.url && (viewingLeaveAttachment.url.startsWith('data:application/pdf') || /\.pdf$/i.test(viewingLeaveAttachment.name)) ? (
                <iframe
                  src={viewingLeaveAttachment.url}
                  title="PDF Viewer"
                  className="w-full h-[75vh] rounded-xl border border-slate-800"
                />
              ) : (
                <div className="text-center py-16 text-slate-400 space-y-3">
                  <FileText className="w-16 h-16 mx-auto text-slate-600" />
                  <p className="text-sm">Preview is not directly displayable inline.</p>
                  {viewingLeaveAttachment.url && (
                    <a
                      href={viewingLeaveAttachment.url}
                      download={viewingLeaveAttachment.name || 'document'}
                      className="inline-block px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                    >
                      Download / Open File
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
