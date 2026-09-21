import React, { useState, useMemo } from 'react';
import {
  Users,
  Video,
  Radio,
  Headphones,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  ShieldCheck,
  Send,
  MessageSquare,
  Sparkles,
  Search,
  Filter,
  Eye,
  Play,
  Award,
  BookOpen,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  Phone,
  Mail,
  FileText,
  UserCheck,
  Bell,
  Trash2,
  Lock,
  Unlock,
  RadioTower,
  Volume2,
  Megaphone,
  Check,
  CheckSquare,
  Square,
  UserCheck2
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import LiveClassroomSuite from '../components/LiveClassroomSuite';
import { STREAM_SUBJECTS } from '../data/mockData';

export default function ClassAdminLiveView({ setCurrentTab }) {
  const {
    classes = [],
    students = [],
    staff = [],
    leaveApplications = [],
    notices = [],
    publishNotice,
    liveSessionRequests = [],
    requestLiveSession,
    approveLiveSession,
    rejectLiveSession,
    startLiveSession,
    endLiveSession,
    deleteLiveSession
  } = useSchool();

  const { currentUser, isPrincipal, isVicePrincipal, isSuperAdmin, isTeacher } = useAuth();
  const canApprove = isPrincipal || isVicePrincipal || isSuperAdmin;
  const approverRoleName = isPrincipal ? 'Principal' : isVicePrincipal ? 'Vice Principal' : 'Administrator';

  // Identify if logged-in teacher is a Class Teacher
  const teacherStaffRecord = staff.find(s => 
    s.id === currentUser?.staffId || 
    s.name?.toLowerCase() === currentUser?.displayName?.toLowerCase() ||
    s.email?.toLowerCase() === currentUser?.email?.toLowerCase()
  );

  const teacherAssignedClass = classes.find(c => 
    c.classTeacherId === teacherStaffRecord?.id || 
    c.classTeacherId === currentUser?.staffId ||
    c.teacherName?.toLowerCase() === currentUser?.displayName?.toLowerCase() ||
    teacherStaffRecord?.classTeacherOf === c.id
  );

  // Selected class (Defaults to teacher's assigned class if exists, else first class)
  const [selectedClassId, setSelectedClassId] = useState(
    teacherAssignedClass ? teacherAssignedClass.id : 'cls-12-sci'
  );

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0] || {};
  const assignedClassTeacher = staff.find(s => 
    s.id === selectedClass.classTeacherId || 
    s.classTeacherOf === selectedClass.id
  );

  // Main Tabs: 'class_admin' | 'live_hub' | 'approval_queue'
  const [activeTab, setActiveTab] = useState(canApprove ? 'approval_queue' : 'live_hub');

  // Filter for Live Sessions
  const [sessionTypeFilter, setSessionTypeFilter] = useState('all'); // 'all' | 'live_class' | 'live_stream' | 'live_tuition'
  const [sessionStatusFilter, setSessionStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'live'

  // Live Classroom Suite Modal
  const [isLiveSuiteOpen, setIsLiveSuiteOpen] = useState(false);
  const [activeRunningSession, setActiveRunningSession] = useState(null);

  // Helper: Get subjects list dynamically based on Class stream/level
  const getSubjectsForClass = (cls) => {
    if (!cls) return STREAM_SUBJECTS.science;
    if (cls.stream && STREAM_SUBJECTS[cls.stream]) {
      return STREAM_SUBJECTS[cls.stream];
    }
    const numLevel = parseInt(cls.level);
    if (!isNaN(numLevel)) {
      if (numLevel <= 5) return STREAM_SUBJECTS.primary;
      if (numLevel <= 10) return STREAM_SUBJECTS.general_secondary;
    }
    if (cls.level === 'nursery' || cls.level === 'lkg' || cls.level === 'ukg') {
      return STREAM_SUBJECTS.primary;
    }
    return STREAM_SUBJECTS.general_secondary;
  };

  // Request New Live Session Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const initialSubjects = getSubjectsForClass(selectedClass);
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  const [requestForm, setRequestForm] = useState({
    title: '',
    classId: selectedClassId,
    subject: initialSubjects[0] || 'English',
    customSubject: '',
    sessionType: 'live_class', // 'live_class' | 'live_stream' | 'live_tuition'
    mediaMode: 'video_interactive', // 'video_interactive' | 'broadcast_stream' | 'voice_tuition'
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '06:30 PM - 07:30 PM',
    durationMinutes: 60,
    targetScope: 'all', // 'all' | 'specific_students'
    selectedStudentIds: [],
    targetGroup: 'All Class Students',
    agenda: ''
  });

  // Approval / Rejection Modal State
  const [selectedRequestForReview, setSelectedRequestForReview] = useState(null);
  const [reviewAction, setReviewAction] = useState('approve'); // 'approve' | 'reject'
  const [reviewRemarks, setReviewRemarks] = useState('');

  // Class Quick Notice State
  const [isClassNoticeModalOpen, setIsClassNoticeModalOpen] = useState(false);
  const [classNoticeTitle, setClassNoticeTitle] = useState('');
  const [classNoticeContent, setClassNoticeContent] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMsg({ text: msg, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Class specific data
  const classStudents = useMemo(() => {
    return students.filter(s => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  const classLeaves = useMemo(() => {
    return leaveApplications.filter(l => l.classId === selectedClassId);
  }, [leaveApplications, selectedClassId]);

  // Live session requests calculations
  const pendingRequests = useMemo(() => {
    return liveSessionRequests.filter(r => r.status === 'pending');
  }, [liveSessionRequests]);

  const classLiveSessions = useMemo(() => {
    return liveSessionRequests.filter(r => {
      const matchClass = canApprove ? true : r.classId === selectedClassId || r.teacherId === teacherStaffRecord?.id;
      const matchType = sessionTypeFilter === 'all' || r.sessionType === sessionTypeFilter;
      const matchStatus = sessionStatusFilter === 'all' || r.status === sessionStatusFilter;
      return matchClass && matchType && matchStatus;
    });
  }, [liveSessionRequests, selectedClassId, canApprove, sessionTypeFilter, sessionStatusFilter, teacherStaffRecord]);

  // Handle Submitting a New Request
  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!requestForm.title.trim()) {
      showToast('Khawngaihin session title chhu lut rawh', 'error');
      return;
    }

    const finalSubject = isCustomSubject 
      ? (requestForm.customSubject.trim() || 'General Studies') 
      : requestForm.subject;

    if (!finalSubject) {
      showToast('Khawngaihin subject thlang rawh', 'error');
      return;
    }

    if (requestForm.targetScope === 'specific_students' && requestForm.selectedStudentIds.length === 0) {
      showToast('Zirlai thlan bik an awm lo! Khawngaihin student pakhat tal thlang rawh emaw "Class Pum Pui" thlang rawh.', 'error');
      return;
    }

    const targetCls = classes.find(c => c.id === requestForm.classId) || selectedClass;
    const teacherName = currentUser?.displayName || teacherStaffRecord?.name || 'Faculty Member';
    const teacherId = teacherStaffRecord?.id || currentUser?.staffId || 'stf-001';

    let autoTargetGroup = 'All Class Students';
    if (requestForm.targetScope === 'specific_students') {
      const selectedNames = students
        .filter(s => requestForm.selectedStudentIds.includes(s.id))
        .map(s => `${s.firstName} ${s.lastName} (Roll ${s.rollNo})`);
      autoTargetGroup = `Remedial/Tuition Batch (${requestForm.selectedStudentIds.length} Students): ${selectedNames.slice(0, 3).join(', ')}${selectedNames.length > 3 ? '...' : ''}`;
    } else if (requestForm.targetGroup && requestForm.targetGroup.trim()) {
      autoTargetGroup = requestForm.targetGroup.trim();
    }

    const res = requestLiveSession({
      ...requestForm,
      subject: finalSubject,
      targetGroup: autoTargetGroup,
      className: targetCls.name,
      teacherId,
      teacherName
    });

    if (res?.success) {
      setIsRequestModalOpen(false);
      const defaultSubjects = getSubjectsForClass(selectedClass);
      setRequestForm({
        title: '',
        classId: selectedClassId,
        subject: defaultSubjects[0] || 'English',
        customSubject: '',
        sessionType: 'live_class',
        mediaMode: 'video_interactive',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '06:30 PM - 07:30 PM',
        durationMinutes: 60,
        targetScope: 'all',
        selectedStudentIds: [],
        targetGroup: 'All Class Students',
        agenda: ''
      });
      setIsCustomSubject(false);
      setStudentSearchQuery('');
      showToast('Live Session dilna chu Vice Principal & Principal hnenah thehluh a ni ta! An approve hunah start theih a ni ang.', 'success');
      setActiveTab('live_hub');
    }
  };

  // Handle Approval / Rejection by VP or Principal
  const handleConfirmReview = () => {
    if (!selectedRequestForReview) return;

    if (reviewAction === 'approve') {
      approveLiveSession(
        selectedRequestForReview.id,
        `${currentUser?.displayName || approverRoleName} (${approverRoleName})`,
        reviewRemarks || 'Approved by Executive Administration.'
      );
      showToast(`"${selectedRequestForReview.title}" chu approve a ni ta! Zirtirtu leh zirlai hnenah notification thawn a ni e.`, 'success');
    } else {
      if (!reviewRemarks.trim()) {
        showToast('Khawngaihin hnawlna chhan emaw hun sawn nanna remarks chhu lut rawh', 'error');
        return;
      }
      rejectLiveSession(
        selectedRequestForReview.id,
        `${currentUser?.displayName || approverRoleName} (${approverRoleName})`,
        reviewRemarks
      );
      showToast(`Dilna chu hnawl / hun sawn a ni ta. Teacher hnenah hriattir a ni e.`, 'info');
    }

    setSelectedRequestForReview(null);
    setReviewRemarks('');
  };

  // Launch Live Session (strictly for approved sessions)
  const handleLaunchLiveSession = (session) => {
    if (session.status !== 'approved' && session.status !== 'live') {
      showToast('He session hi Vice Principal emaw Principal-in an la approve lo! Start theih a ni rih lo.', 'error');
      return;
    }

    startLiveSession(session.id);
    setActiveRunningSession(session);
    setIsLiveSuiteOpen(true);
  };

  // Broadcast Class Notice
  const handleSendClassNotice = (e) => {
    e.preventDefault();
    if (!classNoticeTitle.trim() || !classNoticeContent.trim()) {
      showToast('Title leh Content chhu lut rawh', 'error');
      return;
    }

    publishNotice({
      title: `[${selectedClass.name}] ${classNoticeTitle}`,
      content: classNoticeContent,
      category: 'academic',
      priority: 'high',
      targetAudience: 'class',
      targetClassId: selectedClass.id,
      publishedBy: `${currentUser?.displayName || 'Class Master'} (${selectedClass.name} Class Teacher)`
    });

    setIsClassNoticeModalOpen(false);
    setClassNoticeTitle('');
    setClassNoticeContent('');
    showToast(`${selectedClass.name} zirlai leh nu&pa te hnenah notice thawn a ni ta!`, 'success');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Toast Alert */}
      {toastMsg && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border ${
          toastMsg.type === 'error'
            ? 'bg-rose-950/90 text-rose-200 border-rose-500/50'
            : toastMsg.type === 'info'
            ? 'bg-cyan-950/90 text-cyan-200 border-cyan-500/50'
            : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
        }`}>
          {toastMsg.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 font-bold border border-cyan-500/30 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                Class Administration &amp; Live Suite
              </span>
              <span className="text-[11px] px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                VP &amp; Principal Gatekeeper Protocol
              </span>
              {teacherAssignedClass && (
                <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  I Class: {teacherAssignedClass.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] tracking-tight">
              Class Teacher Command &amp; Live Streaming Suite
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Class Teacher ten an class bik enkawlna leh Live Video Class, Streaming, leh Online Video/Voice Tuition an buatsaih theihna hmun. 
              <span className="text-amber-300 font-medium ml-1">
                Heng live session te hi Vice Principal leh Principal ten an approve hnuah chauh kaltlangpui (start) theih a ni.
              </span>
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/25 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Session Dilna Thehlut Rawh</span>
            </button>

            {canApprove && (
              <button
                onClick={() => setActiveTab('approval_queue')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/25 transition cursor-pointer relative"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Approval Desk</span>
                {pendingRequests.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-bounce">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Class Selector Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Class Thlang Rawh:</span>
            <div className="flex flex-wrap gap-1.5 max-h-12 overflow-x-auto py-1">
              {classes.map(cls => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedClassId === cls.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {cls.name}
                </button>
              ))}
            </div>
          </div>

          {/* Assigned Class Teacher Pill */}
          <div className="flex items-center gap-3 bg-slate-800/60 px-4 py-1.5 rounded-xl border border-slate-700/60">
            {assignedClassTeacher?.photoUrl ? (
              <img src={assignedClassTeacher.photoUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                {assignedClassTeacher?.name?.charAt(0) || 'T'}
              </div>
            )}
            <div className="text-left">
              <div className="text-[10px] text-slate-400 font-medium">Class Teacher:</div>
              <div className="text-xs font-bold text-white">
                {assignedClassTeacher?.name || selectedClass.teacherName || 'Unassigned'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('live_hub')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'live_hub'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Radio className="w-4 h-4 text-rose-400" />
            <span>Live Class, Stream &amp; Tuition Hub</span>
            <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px]">
              {classLiveSessions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('class_admin')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'class_admin'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Class Administration ({selectedClass.name})</span>
            <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px]">
              {classStudents.length} Students
            </span>
          </button>

          {canApprove && (
            <button
              onClick={() => setActiveTab('approval_queue')}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'approval_queue'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>VP &amp; Principal Approval Desk</span>
              {pendingRequests.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-pulse">
                  {pendingRequests.length} Pending
                </span>
              )}
            </button>
          )}
        </div>

        {/* Tab Context Helper Note */}
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>Live classes are strictly locked until approved by Principal / Vice Principal</span>
        </div>
      </div>

      {/* TAB 1: LIVE CLASS, STREAM & TUITION HUB */}
      {activeTab === 'live_hub' && (
        <div className="space-y-6">
          {/* Subfilters & Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-medium">Class Sessions Total</div>
              <div className="text-2xl font-black text-white font-['Outfit']">{classLiveSessions.length}</div>
              <div className="text-[11px] text-slate-500">{selectedClass.name} online sessions</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-xs text-emerald-400 font-medium">Approved &amp; Ready</div>
              <div className="text-2xl font-black text-emerald-300 font-['Outfit']">
                {classLiveSessions.filter(s => s.status === 'approved' || s.status === 'live').length}
              </div>
              <div className="text-[11px] text-emerald-500/80">Can launch live immediately</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-xs text-amber-400 font-medium">Pending Review</div>
              <div className="text-2xl font-black text-amber-300 font-['Outfit']">
                {classLiveSessions.filter(s => s.status === 'pending').length}
              </div>
              <div className="text-[11px] text-amber-500/80">Awaiting VP &amp; Principal</div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-500/30 flex items-center justify-between p-5">
              <div>
                <div className="text-xs text-rose-300 font-bold">New Session Dilna</div>
                <div className="text-sm font-extrabold text-white font-['Outfit'] mt-0.5">Stream / Class / Tuition</div>
                <div className="text-[11px] text-slate-400">Class Teacher Request</div>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="w-10 h-10 rounded-xl bg-rose-500 hover:bg-rose-400 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium mr-1">Type:</span>
              {[
                { id: 'all', label: 'All Formats' },
                { id: 'live_class', label: 'Live Video Class' },
                { id: 'live_stream', label: 'Live Streaming' },
                { id: 'live_tuition', label: 'Online Video/Voice Tuition' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSessionTypeFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    sessionTypeFilter === f.id
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium mr-1">Status:</span>
              {[
                { id: 'all', label: 'All Status' },
                { id: 'approved', label: 'Approved Only' },
                { id: 'pending', label: 'Pending Only' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setSessionStatusFilter(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    sessionStatusFilter === s.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Session Cards */}
          {classLiveSessions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
                <Radio className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Session Siam a la awm lo
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {selectedClass.name} tan live class, streaming, emaw online tuition a la awm rih lo. Class Teacher i nih chuan request thehlut rawh le.
              </p>
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold shadow-lg shadow-rose-500/20 cursor-pointer"
              >
                + Request Live Session
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {classLiveSessions.map(session => {
                const isApproved = session.status === 'approved' || session.status === 'live';
                const isPending = session.status === 'pending';
                const isRejected = session.status === 'rejected';

                return (
                  <div
                    key={session.id}
                    className={`rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between space-y-5 shadow-xl relative overflow-hidden ${
                      session.status === 'live'
                        ? 'bg-rose-950/30 border-rose-500 shadow-rose-500/10 ring-1 ring-rose-500'
                        : isApproved
                        ? 'bg-gradient-to-b from-slate-900 to-slate-900/90 border-emerald-500/30 hover:border-emerald-500/60'
                        : isPending
                        ? 'bg-slate-900/80 border-amber-500/30'
                        : 'bg-slate-900/60 border-rose-800/40 opacity-80'
                    }`}
                  >
                    {/* Status Top Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {session.sessionType === 'live_tuition' ? (
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold flex items-center gap-1">
                            <Headphones className="w-3 h-3 text-cyan-400" />
                            Online Tuition
                          </span>
                        ) : session.sessionType === 'live_stream' ? (
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold flex items-center gap-1">
                            <RadioTower className="w-3 h-3 text-purple-400" />
                            Live Stream
                          </span>
                        ) : (
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1">
                            <Video className="w-3 h-3 text-rose-400" />
                            Live Video Class
                          </span>
                        )}

                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
                          {session.mediaMode === 'voice_tuition' ? 'Voice-Only' : 'HD Video'}
                        </span>
                      </div>

                      {/* Approval Status Pill */}
                      {session.status === 'live' ? (
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-rose-600 text-white font-black animate-pulse flex items-center gap-1 shadow-md shadow-rose-600/30">
                          <span className="w-2 h-2 rounded-full bg-white"></span>
                          LIVE NOW
                        </span>
                      ) : isApproved ? (
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Approved (Phalsak)
                        </span>
                      ) : isPending ? (
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          Pending Review
                        </span>
                      ) : (
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40 flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-400" />
                          Hnawl / Sawn
                        </span>
                      )}
                    </div>

                    {/* Title & Subject */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                        <span>{session.className} • {session.subject}</span>
                        <span className="text-slate-500 font-normal">{session.targetGroup}</span>
                      </div>
                      <h4 className="text-base font-extrabold text-white font-['Outfit'] leading-snug">
                        {session.title}
                      </h4>
                      {session.agenda && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {session.agenda}
                        </p>
                      )}
                    </div>

                    {/* Meta Timings */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Tarik &amp; Hun:</span>
                        </div>
                        <span className="font-semibold text-white">{session.scheduledDate} ({session.scheduledTime})</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>Zirtirtu:</span>
                        </div>
                        <span className="font-semibold text-indigo-300">{session.teacherName}</span>
                      </div>

                      {/* Approval Metadata */}
                      {session.approvedBy && (
                        <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-400 flex items-center justify-between">
                          <span>Pawmpuitu:</span>
                          <span className="font-bold text-emerald-300 truncate max-w-[180px]">{session.approvedBy}</span>
                        </div>
                      )}

                      {session.rejectionReason && (
                        <div className="pt-2 border-t border-slate-800 text-[11px] text-rose-400">
                          <span className="font-bold">Hnawlna Chhan: </span>
                          <span>{session.rejectionReason}</span>
                        </div>
                      )}
                    </div>

                    {/* Launch & Action Gatekeeper */}
                    <div className="pt-2 space-y-2">
                      {isApproved ? (
                        <button
                          onClick={() => handleLaunchLiveSession(session)}
                          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-slate-950" />
                          <span>🚀 Start Live Session (Kaltlangpui Rawh)</span>
                        </button>
                      ) : isPending ? (
                        <div className="space-y-2">
                          <div className="w-full py-2.5 px-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 text-center">
                            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Awaiting VP &amp; Principal Approval</span>
                          </div>

                          {canApprove && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedRequestForReview(session);
                                  setReviewAction('approve');
                                  setReviewRemarks('Sanctioned for academic execution.');
                                }}
                                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Phalsak Rawh</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequestForReview(session);
                                  setReviewAction('reject');
                                  setReviewRemarks('');
                                }}
                                className="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-bold text-xs cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-xs text-rose-400 py-2 bg-rose-950/20 rounded-xl border border-rose-900/30">
                          He request hi pawm a ni lo. Hun sawn a ngai e.
                        </div>
                      )}

                      {/* Delete Option for Author or Admin */}
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            if (window.confirm('He live session dilna hi paih i duh em?')) {
                              deleteLiveSession(session.id);
                              showToast('Session paih a ni ta', 'info');
                            }
                          }}
                          className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Paih (Delete)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CLASS ADMINISTRATION */}
      {activeTab === 'class_admin' && (
        <div className="space-y-6">
          {/* Class Teacher Overview Card */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-indigo-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {assignedClassTeacher?.photoUrl ? (
                <img src={assignedClassTeacher.photoUrl} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-lg" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl border border-indigo-500/30">
                  {assignedClassTeacher?.name?.charAt(0) || 'C'}
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold uppercase tracking-wider">
                    Class Section Head
                  </span>
                  <span className="text-xs text-slate-400">{selectedClass.roomNumber || 'Room S-601'}</span>
                </div>
                <h3 className="text-lg font-bold text-white font-['Outfit']">
                  {assignedClassTeacher?.name || selectedClass.teacherName || 'Unassigned Faculty'}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-3">
                  <span>{assignedClassTeacher?.designation || 'Class Master'}</span>
                  {assignedClassTeacher?.phone && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {assignedClassTeacher.phone}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setIsClassNoticeModalOpen(true)}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <Megaphone className="w-4 h-4" />
                <span>Class Notice Broadcast</span>
              </button>

              <button
                onClick={() => setCurrentTab && setCurrentTab('routine')}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Time Table &amp; Routine</span>
              </button>
            </div>
          </div>

          {/* Class Students Directory */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>{selectedClass.name} — Zirlai Danhming (Enrolled Students)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Total Students: {classStudents.length} • Section Master administration view
                </p>
              </div>

              <div className="text-xs font-semibold text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                Attendance Rate Avg: {(classStudents.reduce((acc, s) => acc + (s.attendanceRate || 85), 0) / (classStudents.length || 1)).toFixed(1)}%
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Roll</th>
                    <th className="py-3 px-4">Zirlai Hming</th>
                    <th className="py-3 px-4">Admission No</th>
                    <th className="py-3 px-4">Gender</th>
                    <th className="py-3 px-4">Nu / Pa Hming</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Attendance</th>
                    <th className="py-3 px-4">Fee Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {classStudents.map(student => (
                    <tr key={student.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-bold text-white">#{student.rollNo || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {student.photoUrl ? (
                            <img src={student.photoUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-[11px]">
                              {student.firstName?.charAt(0)}
                            </div>
                          )}
                          <span className="font-semibold text-slate-200">{student.firstName} {student.lastName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">{student.admissionNo}</td>
                      <td className="py-3 px-4 text-slate-300 capitalize">{student.gender}</td>
                      <td className="py-3 px-4 text-slate-300">{student.guardianName || student.parentName || '-'}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono">{student.guardianPhone || student.phone || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          (student.attendanceRate || 85) >= 75
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {student.attendanceRate || 85}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          student.feeStatus === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {student.feeStatus || 'Paid'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VP & PRINCIPAL APPROVAL DESK */}
      {canApprove && activeTab === 'approval_queue' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <span>Executive Live Session Gatekeeper &amp; Sanction Queue</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Class Teacher ten live video streaming, video class leh online tuition an dilte endikna leh phalsakna (approval).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-xl border border-purple-500/30">
                {pendingRequests.length} Pending Approval
              </span>
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white font-['Outfit']">
                Dilna thar a awm lo (Queue is Clear)
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Tun dinhmunah Class Teacher te aṭangin live streaming emaw tuition dilna pending a awm lo.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map(req => (
                <div
                  key={req.id}
                  className="p-6 rounded-3xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/60 shadow-xl transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {req.className}
                      </span>
                      <span className="text-xs font-bold text-white font-mono">{req.subject}</span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 capitalize">
                        {req.sessionType?.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Thehluh hun: {req.requestedAt}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <h4 className="text-base font-extrabold text-white font-['Outfit']">
                        {req.title}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        <span className="font-bold text-slate-400">Topic / Agenda: </span>
                        {req.agenda || 'General syllabus coverage and doubt clearance'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Class Teacher:</span>
                        <span className="font-bold text-indigo-300">{req.teacherName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ruahman Tarik:</span>
                        <span className="font-bold text-white">{req.scheduledDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hun:</span>
                        <span className="font-bold text-white">{req.scheduledTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Duration:</span>
                        <span className="font-bold text-white">{req.durationMinutes} Minutes</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => {
                        setSelectedRequestForReview(req);
                        setReviewAction('reject');
                        setReviewRemarks('');
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Hnar / Hun Sawn (Reject)</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedRequestForReview(req);
                        setReviewAction('approve');
                        setReviewRemarks('Sanctioned for academic execution. Ensure student attendance is recorded.');
                      }}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 fill-slate-950" />
                      <span>Pawmpui Rawh (Approve Request)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: REQUEST NEW LIVE SESSION */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0e1628] border border-rose-500/40 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Live Session Dilna Thehlut Rawh
                  </h3>
                  <p className="text-xs text-slate-400">
                    Vice Principal leh Principal approve veleh zirlai te nen in connect ang
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Session Title / Topic *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electromagnetic Induction Numerical Problem Solving & Doubt Clearing"
                  value={requestForm.title}
                  onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Class *
                  </label>
                  <select
                    value={requestForm.classId}
                    onChange={(e) => {
                      const newClsId = e.target.value;
                      const newCls = classes.find(c => c.id === newClsId);
                      const newSubjects = getSubjectsForClass(newCls);
                      setRequestForm({
                        ...requestForm,
                        classId: newClsId,
                        subject: newSubjects[0] || 'English',
                        selectedStudentIds: [] // Reset student selection when class changes
                      });
                      setIsCustomSubject(false);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-500 focus:outline-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300">
                      Subject (Zir tur Thlang Rawh) *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomSubject(!isCustomSubject);
                        if (!isCustomSubject) {
                          setRequestForm(prev => ({ ...prev, customSubject: '' }));
                        }
                      }}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline"
                    >
                      {isCustomSubject ? 'List atangin thlang rawh' : '+ Custom Subject'}
                    </button>
                  </div>
                  {isCustomSubject ? (
                    <input
                      type="text"
                      required
                      placeholder="e.g. Environmental Science / Special Coaching..."
                      value={requestForm.customSubject}
                      onChange={(e) => setRequestForm({ ...requestForm, customSubject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-rose-500/50 text-white text-xs focus:border-rose-500 focus:outline-none"
                    />
                  ) : (
                    <select
                      value={requestForm.subject}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomSubject(true);
                        } else {
                          setRequestForm({ ...requestForm, subject: e.target.value });
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-500 focus:outline-none"
                    >
                      {getSubjectsForClass(classes.find(c => c.id === requestForm.classId) || selectedClass).map(subj => (
                        <option key={subj} value={subj}>{subj}</option>
                      ))}
                      <option value="__custom__">+ Other / Custom Subject Type...</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Format (Session Type) *
                  </label>
                  <select
                    value={requestForm.sessionType}
                    onChange={(e) => setRequestForm({ ...requestForm, sessionType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-500 focus:outline-none"
                  >
                    <option value="live_class">Live Video Class (Interactive Classroom)</option>
                    <option value="live_tuition">Online Video/Voice Tuition (Remedial/Coaching)</option>
                    <option value="live_stream">Live Video Streaming (Broadcast)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Media Mode *
                  </label>
                  <select
                    value={requestForm.mediaMode}
                    onChange={(e) => setRequestForm({ ...requestForm, mediaMode: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-500 focus:outline-none"
                  >
                    <option value="video_interactive">Interactive Video &amp; Audio</option>
                    <option value="voice_tuition">Low-Bandwidth Voice Tuition</option>
                    <option value="broadcast_stream">One-Way HD Video Broadcast</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={requestForm.scheduledDate}
                    onChange={(e) => setRequestForm({ ...requestForm, scheduledDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Timing / Slot *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 06:30 PM - 07:30 PM"
                    value={requestForm.scheduledTime}
                    onChange={(e) => setRequestForm({ ...requestForm, scheduledTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    value={requestForm.durationMinutes}
                    onChange={(e) => setRequestForm({ ...requestForm, durationMinutes: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Target Audience: All Students vs Selected Students */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div>
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-rose-400" />
                      Target Group &amp; Zirlai Thlanna (Student Selection) *
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Class pum pui tan nge zirlai bik (Remedial/Tuition Batch) thlan i duh?
                    </p>
                  </div>

                  {/* Toggle Mode */}
                  <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-700 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setRequestForm(prev => ({ ...prev, targetScope: 'all', selectedStudentIds: [] }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        requestForm.targetScope === 'all'
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Class Pum Pui ({students.filter(s => s.classId === requestForm.classId).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestForm(prev => ({ ...prev, targetScope: 'specific_students' }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        requestForm.targetScope === 'specific_students'
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <UserCheck2 className="w-3.5 h-3.5" />
                      Zirlai Thlang Rawh ({requestForm.selectedStudentIds.length})
                    </button>
                  </div>
                </div>

                {requestForm.targetScope === 'all' ? (
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-400 block">
                      Batch Label / Hming (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. All Class Students, Board Exam Preparation Batch"
                      value={requestForm.targetGroup}
                      onChange={(e) => setRequestForm({ ...requestForm, targetGroup: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-emerald-400/90 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      {classes.find(c => c.id === requestForm.classId)?.name || 'Class'} zirlai zawng zawng te hnenah live notice leh schedule thawn a ni ang.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Search & Bulk Select Actions */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Zirlai hming, Roll No, Admission No zawng rawh..."
                          value={studentSearchQuery}
                          onChange={(e) => setStudentSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                      {(() => {
                        const currentClassStudents = students.filter(s => s.classId === requestForm.classId);
                        const allSelected = currentClassStudents.length > 0 && currentClassStudents.every(s => requestForm.selectedStudentIds.includes(s.id));
                        return (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                if (allSelected) {
                                  setRequestForm(prev => ({ ...prev, selectedStudentIds: [] }));
                                } else {
                                  setRequestForm(prev => ({
                                    ...prev,
                                    selectedStudentIds: currentClassStudents.map(s => s.id)
                                  }));
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-rose-300 font-bold border border-rose-500/20 flex items-center gap-1"
                            >
                              {allSelected ? 'Clear All' : 'Select All'}
                            </button>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Filtered Students Multi-Select List */}
                    {(() => {
                      const classRoster = students.filter(s => s.classId === requestForm.classId);
                      const filteredRoster = classRoster.filter(s => {
                        if (!studentSearchQuery.trim()) return true;
                        const q = studentSearchQuery.toLowerCase();
                        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
                        return fullName.includes(q) || (s.rollNo && s.rollNo.toString().includes(q)) || (s.admissionNo && s.admissionNo.toLowerCase().includes(q));
                      });

                      if (classRoster.length === 0) {
                        return (
                          <div className="p-4 rounded-xl bg-slate-900 text-center text-xs text-slate-400">
                            He class-ah hian zirlai an la in-enroll lo.
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-2">
                          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                            {filteredRoster.map(st => {
                              const isChecked = requestForm.selectedStudentIds.includes(st.id);
                              return (
                                <div
                                  key={st.id}
                                  onClick={() => {
                                    setRequestForm(prev => ({
                                      ...prev,
                                      selectedStudentIds: isChecked
                                        ? prev.selectedStudentIds.filter(id => id !== st.id)
                                        : [...prev.selectedStudentIds, st.id]
                                    }));
                                  }}
                                  className={`p-2 rounded-xl flex items-center justify-between gap-3 border transition cursor-pointer ${
                                    isChecked
                                      ? 'bg-rose-950/40 border-rose-500/60 text-white'
                                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0">
                                      {isChecked ? (
                                        <CheckSquare className="w-4 h-4 text-rose-400" />
                                      ) : (
                                        <Square className="w-4 h-4 text-slate-500" />
                                      )}
                                    </div>
                                    <img
                                      src={st.photoUrl || `https://ui-avatars.com/api/?name=${st.firstName}+${st.lastName}&background=e11d48&color=fff`}
                                      alt={st.firstName}
                                      className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <div className="text-xs font-bold truncate">
                                        {st.firstName} {st.lastName}
                                      </div>
                                      <div className="text-[10px] text-slate-400 truncate">
                                        Roll No: <span className="text-rose-300 font-semibold">{st.rollNo || 'N/A'}</span> • Adm: {st.admissionNo}
                                      </div>
                                    </div>
                                  </div>

                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                    isChecked ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-400'
                                  }`}>
                                    {isChecked ? 'Thlan a ni' : 'Thlang rawh'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                            <span>Zirlai thlan zat: <strong className="text-rose-400">{requestForm.selectedStudentIds.length}</strong> / {classRoster.length}</span>
                            {requestForm.selectedStudentIds.length > 0 && (
                              <span className="text-rose-300 font-semibold">
                                Private Remedial/Tuition Batch atan ruat a ni ang
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Agenda / Topics / Syllabus *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Zirtir tur thupui, numerical question chinfel tur te, MBSE previous year questions..."
                  value={requestForm.agenda}
                  onChange={(e) => setRequestForm({ ...requestForm, agenda: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-rose-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  He session dilna hi Vice Principal leh Principal hnenah notification hmanga thawn a ni ang a, an approve (phalsak) hnuah chauh i start thei ang.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-500/25 cursor-pointer"
                >
                  Thehlut Rawh (Submit Request)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VP & PRINCIPAL APPROVE / REJECT DIALOG */}
      {selectedRequestForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e1628] border border-purple-500/40 shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  reviewAction === 'approve'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}>
                  {reviewAction === 'approve' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    {reviewAction === 'approve' ? 'Phalsakna Pek (Approve Session)' : 'Dilna Hnawl / Hun Sawn (Reject/Reschedule)'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Executive Decision • {selectedRequestForReview.teacherName} ({selectedRequestForReview.className})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequestForReview(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="text-white font-bold text-sm">{selectedRequestForReview.title}</div>
              <div className="text-slate-400">
                Subject: <span className="text-indigo-300 font-semibold">{selectedRequestForReview.subject}</span> • Format: <span className="text-slate-200 capitalize">{selectedRequestForReview.sessionType?.replace('_', ' ')}</span>
              </div>
              <div className="text-slate-400">
                Scheduled: <span className="text-white font-semibold">{selectedRequestForReview.scheduledDate} at {selectedRequestForReview.scheduledTime}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {reviewAction === 'approve' ? 'Approval Remarks / Guidelines (Optional)' : 'Hnawlna Chhan / Hun Sawn Nanna (Required) *'}
              </label>
              <textarea
                rows="3"
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                placeholder={reviewAction === 'approve' ? 'e.g. Sanctioned. Ensure student attendance is recorded.' : 'e.g. Please reschedule to Friday 7 PM due to faculty meeting clash.'}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-purple-500 focus:outline-none"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setSelectedRequestForReview(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReview}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-lg cursor-pointer ${
                  reviewAction === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                }`}
              >
                {reviewAction === 'approve' ? 'Pawm Rawh (Confirm Approval)' : 'Hnar Rawh (Confirm Reject)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CLASS QUICK NOTICE BROADCAST */}
      {isClassNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e1628] border border-cyan-500/40 shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    {selectedClass.name} Notice Thehdarh Rawh
                  </h3>
                  <p className="text-xs text-slate-400">
                    He notice hi {selectedClass.name} zirlai leh nu&amp;pa te hnenah chauh a thleng ang
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsClassNoticeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendClassNotice} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Naktuk Class Test & Homework Submission Chungchang"
                  value={classNoticeTitle}
                  onChange={(e) => setClassNoticeTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Hriattirna Thuchhuak (Content) *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Thuchhuak kimchang ziah luhna..."
                  value={classNoticeContent}
                  onChange={(e) => setClassNoticeContent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsClassNoticeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 cursor-pointer"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMBEDDED LIVE CLASSROOM SUITE */}
      <LiveClassroomSuite
        isOpen={isLiveSuiteOpen}
        onClose={() => {
          setIsLiveSuiteOpen(false);
          if (activeRunningSession) {
            endLiveSession(activeRunningSession.id);
            setActiveRunningSession(null);
          }
        }}
        defaultClassId={activeRunningSession?.classId || selectedClassId}
      />
    </div>
  );
}
