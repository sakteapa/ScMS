import React, { useState } from 'react';
import { 
  CalendarDays, 
  Clock, 
  Printer, 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Users, 
  Building2, 
  Sparkles,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Search,
  FileText,
  Trash2,
  Megaphone,
  AlertCircle,
  Calendar,
  ShieldCheck,
  Award,
  ArrowRight,
  Lock
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import { STREAM_SUBJECTS } from '../data/mockData';

export default function RoutineView() {
  const { 
    classes, 
    students = [],
    timetables, 
    updateTimeTableSlot, 
    staff, 
    systemConfig,
    assignClassMaster,
    examRoutines = {},
    addExamRoutineSlot,
    updateExamRoutineSlot,
    deleteExamRoutineSlot,
    publishExamRoutineNotice
  } = useSchool();

  const { currentUser, isPrincipal, isVicePrincipal, isSuperAdmin, isTeacher, isStudent, isParent } = useAuth();
  
  // Strict RBAC: Only Principal and Vice Principal (and Super Admin) can manage routines & class teachers
  const canManage = isPrincipal || isVicePrincipal || isSuperAdmin;
  const assignerName = isPrincipal ? 'Principal' : isVicePrincipal ? 'Vice Principal' : 'Admin';

  // Sub-tab: 'class_routine' | 'exam_routine'
  const [activeMainTab, setActiveMainTab] = useState('class_routine');

  // Identify Student's class if logged in as Student or Parent
  const studentRecord = isStudent
    ? students.find(s => s.id === currentUser?.studentId || s.guardianEmail === currentUser?.email || `${s.firstName} ${s.lastName}`.toLowerCase() === currentUser?.displayName?.toLowerCase())
    : isParent
    ? students.find(s => s.id === currentUser?.wardStudentId || s.guardianPhone === currentUser?.phone || s.guardianEmail === currentUser?.email)
    : null;

  const lockedClassId = studentRecord ? studentRecord.classId : (currentUser?.classId || null);

  // Class Selection: If Student/Parent, strictly locked to their class; otherwise default to Class 12 Sci or first class
  const [selectedClassId, setSelectedClassId] = useState(lockedClassId || 'cls-12-sci');
  const selectedClass = classes.find(c => c.id === (lockedClassId || selectedClassId)) || classes[0] || {};

  // Class Teacher assignment modal state
  const [isAssignTeacherModalOpen, setIsAssignTeacherModalOpen] = useState(false);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  // Time Table state
  const [activeDay, setActiveDay] = useState('Monday');
  const [isEditSlotModalOpen, setIsEditSlotModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null); // { day, periodIndex, slot }
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const classTimetable = timetables[selectedClassId] || timetables['cls-12-sci'] || {};

  // Exam Routine state
  const [selectedExamTerm, setSelectedExamTerm] = useState('Half Yearly');
  const examTerms = ['Half Yearly', 'Final / Annual', 'Unit Test', 'Pre-Board'];
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExamPaper, setEditingExamPaper] = useState(null); // null = new, object = edit
  const [examForm, setExamForm] = useState({
    subject: '',
    paperCode: '',
    date: new Date().toISOString().split('T')[0],
    day: 'Monday',
    time: '09:30 AM - 12:30 PM',
    session: 'Morning',
    room: selectedClass.roomNumber || 'Hall A-1',
    maxMarks: 100,
    passMarks: 33,
    invigilator: ''
  });

  // Current assigned class teacher info
  const assignedClassTeacher = staff.find(s => s.id === selectedClass.classTeacherId || s.classTeacherOf === selectedClass.id);

  const showToast = (message, type = 'success') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 4500);
  };

  // ── Class Teacher Handlers ──────────────────────────────────────────────────
  const handleAssignTeacher = (teacherId) => {
    if (!canManage) {
      alert('Thuneihna: Vice Principal leh Principal chauhvin Class Teacher an ruat/thlak thei.');
      return;
    }
    const result = assignClassMaster(selectedClassId, teacherId, `${currentUser?.displayName || assignerName} (${assignerName})`);
    if (result && result.error) {
      showToast(result.error, 'error');
      return;
    }
    const targetTeacher = teacherId ? staff.find(s => s.id === teacherId) : null;
    showToast(
      targetTeacher 
        ? `${selectedClass.name} Class Teacher atan ${targetTeacher.name} ruat fel a ni e.` 
        : `${selectedClass.name} Class Teacher paih fel a ni e.`
    );
    setIsAssignTeacherModalOpen(false);
    setTeacherSearchQuery('');
  };

  // ── Time Table Handlers ─────────────────────────────────────────────────────
  const handleOpenEditSlot = (day, periodIndex, slot) => {
    if (!canManage) return;
    setSelectedSlot({
      day,
      periodIndex,
      subject: slot.subject,
      teacher: slot.teacher,
      room: slot.room,
      time: slot.time
    });
    setIsEditSlotModalOpen(true);
  };

  const handleSaveSlot = (e) => {
    e.preventDefault();
    if (!canManage || !selectedSlot) return;

    updateTimeTableSlot(selectedClassId, selectedSlot.day, selectedSlot.periodIndex, {
      subject: selectedSlot.subject,
      teacher: selectedSlot.teacher,
      room: selectedSlot.room,
      time: selectedSlot.time
    });

    setIsEditSlotModalOpen(false);
    setSelectedSlot(null);
    showToast(`${selectedSlot.day} Period ${selectedSlot.periodIndex + 1} siamṭhat fel a ni e.`);
  };

  // ── Exam Routine Handlers ───────────────────────────────────────────────────
  const currentClassExams = (examRoutines[selectedClassId] || []).filter(
    e => !selectedExamTerm || e.term === selectedExamTerm
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleOpenNewExamModal = () => {
    if (!canManage) return;
    setEditingExamPaper(null);
    setExamForm({
      subject: (STREAM_SUBJECTS[selectedClass.stream] || STREAM_SUBJECTS.general_secondary || [])[0] || 'English',
      paperCode: '',
      date: new Date().toISOString().split('T')[0],
      day: 'Monday',
      time: '09:30 AM - 12:30 PM',
      session: 'Morning',
      room: selectedClass.roomNumber || 'Hall A-1',
      maxMarks: 100,
      passMarks: 33,
      invigilator: staff[0]?.name || ''
    });
    setIsExamModalOpen(true);
  };

  const handleOpenEditExamModal = (paper) => {
    if (!canManage) return;
    setEditingExamPaper(paper);
    setExamForm({
      subject: paper.subject,
      paperCode: paper.paperCode || '',
      date: paper.date,
      day: paper.day,
      time: paper.time,
      session: paper.session || 'Morning',
      room: paper.room,
      maxMarks: paper.maxMarks,
      passMarks: paper.passMarks,
      invigilator: paper.invigilator || ''
    });
    setIsExamModalOpen(true);
  };

  const handleSaveExamPaper = (e) => {
    e.preventDefault();
    if (!canManage) return;

    // Calculate day from date
    const dateObj = new Date(examForm.date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const computedDay = !isNaN(dateObj.getTime()) ? dayNames[dateObj.getDay()] : examForm.day;

    const payload = {
      ...examForm,
      day: computedDay,
      term: selectedExamTerm,
      examName: `MBSE ${selectedClass.name} ${selectedExamTerm} Examination 2026-2027`
    };

    if (editingExamPaper) {
      updateExamRoutineSlot(selectedClassId, editingExamPaper.id, payload);
      showToast(`${payload.subject} exam schedule siamṭhat fel a ni e.`);
    } else {
      addExamRoutineSlot(selectedClassId, payload);
      showToast(`${payload.subject} exam paper thar dah luh a ni e.`);
    }

    setIsExamModalOpen(false);
    setEditingExamPaper(null);
  };

  const handleDeleteExamPaper = (examId, subjectName) => {
    if (!canManage) return;
    if (window.confirm(`He exam paper (${subjectName}) hi paih i chiang chiah em?`)) {
      deleteExamRoutineSlot(selectedClassId, examId);
      showToast(`${subjectName} exam schedule paih a ni e.`, 'info');
    }
  };

  const handleBroadcastExamNotice = () => {
    if (!canManage) return;
    const res = publishExamRoutineNotice(
      selectedClassId, 
      selectedExamTerm, 
      `${currentUser?.displayName || assignerName} (${assignerName})`
    );
    if (res.success) {
      showToast(`Hlawhtling takin Notice Broadcast Board-ah exam routine thawn a ni e!`);
    } else {
      showToast(res.error || 'Notice broadcast theih a ni lo.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Interactive Toast Notification */}
      {toastMsg && (
        <div className="fixed top-24 right-6 z-50 animate-in fade-in slide-in-from-top-4">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold ${
            toastMsg.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : toastMsg.type === 'info'
              ? 'bg-slate-900/90 border-cyan-500/50 text-cyan-200'
              : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg.message}</span>
          </div>
        </div>
      )}

      {/* Main Top Header & Sub-Tab Switcher */}
      <div className="no-print space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/30">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white font-['Outfit'] tracking-tight">
                Academic Routine &amp; Exam Schedule
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Class Time Table, Class Teacher Allocation, leh Official Exam Date-Sheet (Principal &amp; Vice Principal Governance)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Class selector or Locked Student Class Badge */}
            {isStudent || isParent ? (
              <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-2xl border border-cyan-500/40 shadow-md">
                <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white font-bold">
                    {selectedClass.name} {selectedClass.stream ? `(${selectedClass.stream.toUpperCase()})` : ''} • Room {selectedClass.roomNumber}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-cyan-400" />
                    My Class
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800">
                <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer pr-2"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name} {c.stream ? `(${c.stream.toUpperCase()})` : ''} • Room {c.roomNumber}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Print Official Sheet button */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{activeMainTab === 'class_routine' ? 'Print Time Table' : 'Print Exam Routine'}</span>
            </button>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-2 sm:px-4 pt-2 rounded-2xl gap-1.5 sm:gap-2 overflow-x-auto max-w-full">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setActiveMainTab('class_routine')}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                activeMainTab === 'class_routine'
                  ? 'bg-slate-950 text-cyan-300 border-t-2 border-cyan-400 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              <span className="hidden sm:inline">Class Time Table (Daily Periods)</span>
              <span className="sm:hidden">Time Table</span>
            </button>

            <button
              onClick={() => setActiveMainTab('exam_routine')}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                activeMainTab === 'exam_routine'
                  ? 'bg-slate-950 text-amber-300 border-t-2 border-amber-400 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span className="hidden sm:inline">Exam Routine (Date-Sheet &amp; Schedule)</span>
              <span className="sm:hidden">Exam Routine</span>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {currentClassExams.length}
              </span>
            </button>
          </div>

          {/* RBAC Authority Indicator Badge */}
          <div className="hidden md:flex items-center gap-2 pb-2 shrink-0">
            {canManage ? (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isPrincipal ? 'Principal Authority' : isVicePrincipal ? 'Vice Principal Authority' : 'Admin'} • Edit Allowed</span>
              </span>
            ) : (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5 font-medium" title="Time table leh Exam Routine hi Principal leh Vice Principal ten an ruahman a ni.">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>View Only • Vice Principal &amp; Principal Authority</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── CLASS TEACHER BANNER (Distinct 1-to-1 Teacher Rule) ────────────────── */}
      <div className="no-print p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <img
              src={assignedClassTeacher?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt=""
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/50 shadow-md"
            />
            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${assignedClassTeacher ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Official Class Teacher / Section In-Charge
              </span>
              <span className="text-xs text-slate-400">• {selectedClass.name} (Room {selectedClass.roomNumber})</span>
            </div>
            <h3 className="text-base font-bold text-white font-['Outfit'] truncate mt-0.5">
              {assignedClassTeacher ? assignedClassTeacher.name : selectedClass.teacherName || 'Ruat a la ni lo (Unassigned)'}
            </h3>
            <p className="text-xs text-slate-400 truncate">
              {assignedClassTeacher 
                ? `${assignedClassTeacher.designation} • ${assignedClassTeacher.department || 'Faculty'} • 📞 ${assignedClassTeacher.phone}`
                : 'Principal emaw Vice Principal-in he class tan hian Class Teacher an ruat/thlak thei e.'}
            </p>
          </div>
        </div>

        {/* Reassign / Change Class Teacher Trigger (Principal & Vice Principal only) */}
        {canManage ? (
          <button
            onClick={() => {
              setTeacherSearchQuery('');
              setIsAssignTeacherModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            title="Class Teacher ruat emaw thlak danglamna (Principal & Vice Principal)"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Thlak / Ruat (Assign Class Teacher)</span>
          </button>
        ) : (
          <div className="text-right shrink-0">
            <span className="text-[11px] text-slate-400 block">Class In-charge</span>
            <span className="text-xs font-bold text-indigo-300">MBSE Verified</span>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* SUB-TAB 1: CLASS TIME TABLE (DAILY PERIOD ROUTINE)                        */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {activeMainTab === 'class_routine' && (
        <div className="space-y-6">
          {/* Day Selector Tabs (Hidden in print) */}
          <div className="no-print flex border-b border-slate-800 bg-slate-900/60 px-2 sm:px-4 pt-2 sm:pt-3 gap-1.5 sm:gap-2 overflow-x-auto rounded-t-2xl max-w-full">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  activeDay === day
                    ? 'bg-slate-950 text-cyan-300 border-t-2 border-cyan-400 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{day}</span>
              </button>
            ))}
          </div>

          {/* Interactive Day Routine Grid (Screen View) */}
          <div className="no-print p-4 sm:p-6 rounded-b-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white font-['Outfit']">
                  {activeDay} Schedule • {selectedClass.name}
                </span>
                <span className="text-xs text-slate-400">
                  (Room: {selectedClass.roomNumber} • Class Teacher: {assignedClassTeacher?.name || selectedClass.teacherName})
                </span>
              </div>

              {canManage ? (
                <span className="text-[11px] text-cyan-400 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Period slot hmet la, subject leh zirtirtu thlak rawh</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-500 font-medium">
                  🔒 Vice Principal &amp; Principal-in an schedule a ni e (View Only)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(classTimetable[activeDay] || []).map((slot, idx) => (
                <div
                  key={idx}
                  onClick={() => handleOpenEditSlot(activeDay, idx, slot)}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 group ${
                    canManage 
                      ? 'bg-slate-950/70 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/40 cursor-pointer shadow-md' 
                      : 'bg-slate-950/50 border-slate-800/80 cursor-default'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      PERIOD {slot.period}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {slot.time}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition line-clamp-1">
                      {slot.subject}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      Faculty: <strong className="text-slate-200">{slot.teacher}</strong>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Room: {slot.room}</span>
                    {canManage && (
                      <span className="text-cyan-400 group-hover:underline text-[10px] flex items-center gap-1 font-bold">
                        <Edit3 className="w-3 h-3" />
                        <span>Siamṭha</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PRINTABLE OFFICIAL WALL ROUTINE SHEET */}
          <div className="printable-area max-w-5xl mx-auto rounded-3xl bg-white text-slate-950 border border-slate-300 shadow-2xl p-8 sm:p-10 font-sans mt-8">
            {/* School Crest & Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
              <h1 className="text-2xl font-black uppercase tracking-tight font-['Outfit']">
                {systemConfig?.schoolName || 'OHA (One Heart Academy)'}
              </h1>
              <p className="text-xs font-semibold text-slate-700 tracking-wider uppercase">
                Mizoram Board of School Education (MBSE) • Academic Session: {systemConfig?.academicSession || '2026-2027'}
              </p>
              <div className="pt-1">
                <span className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-900 text-white">
                  CLASS ACADEMIC ROUTINE • {selectedClass.name} {selectedClass.stream ? `(${selectedClass.stream.toUpperCase()} STREAM)` : ''}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 pt-1 font-mono">
                Class Room: {selectedClass.roomNumber} • Class Teacher In-charge: {assignedClassTeacher?.name || selectedClass.teacherName}
              </p>
            </div>

            {/* Timetable Matrix Table */}
            <div className="overflow-x-auto my-6">
              <table className="w-full text-left text-xs border-collapse border border-slate-400">
                <thead className="bg-slate-100 text-slate-950 font-bold border-b-2 border-slate-400">
                  <tr>
                    <th className="py-3 px-3 border-r border-slate-300 w-24">Day</th>
                    <th className="py-3 px-2 border-r border-slate-300 text-center">
                      Period 1<br/>
                      <span className="text-[10px] font-normal text-slate-600">09:00 - 09:45</span>
                    </th>
                    <th className="py-3 px-2 border-r border-slate-300 text-center">
                      Period 2<br/>
                      <span className="text-[10px] font-normal text-slate-600">09:45 - 10:30</span>
                    </th>
                    <th className="py-3 px-2 border-r border-slate-300 text-center">
                      Period 3<br/>
                      <span className="text-[10px] font-normal text-slate-600">10:30 - 11:15</span>
                    </th>
                    <th className="py-3 px-1 border-r border-slate-300 text-center bg-slate-200/80 font-bold text-[10px] uppercase w-12">
                      Break
                    </th>
                    <th className="py-3 px-2 border-r border-slate-300 text-center">
                      Period 4<br/>
                      <span className="text-[10px] font-normal text-slate-600">11:45 - 12:30</span>
                    </th>
                    <th className="py-3 px-2 border-r border-slate-300 text-center">
                      Period 5<br/>
                      <span className="text-[10px] font-normal text-slate-600">12:30 - 01:15</span>
                    </th>
                    <th className="py-3 px-2 border-r border-slate-300 text-center">
                      Period 6<br/>
                      <span className="text-[10px] font-normal text-slate-600">01:15 - 02:00</span>
                    </th>
                    <th className="py-3 px-2 text-center">
                      Period 7<br/>
                      <span className="text-[10px] font-normal text-slate-600">02:00 - 02:45</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 text-slate-800">
                  {days.map((dayName) => {
                    const daySlots = classTimetable[dayName] || [];
                    return (
                      <tr key={dayName} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold border-r border-slate-300 bg-slate-50">
                          {dayName}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center">
                          <div className="font-bold text-slate-900">{daySlots[0]?.subject || '-'}</div>
                          <div className="text-[10px] text-slate-500">{daySlots[0]?.teacher || '-'}</div>
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center">
                          <div className="font-bold text-slate-900">{daySlots[1]?.subject || '-'}</div>
                          <div className="text-[10px] text-slate-500">{daySlots[1]?.teacher || '-'}</div>
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center">
                          <div className="font-bold text-slate-900">{daySlots[2]?.subject || '-'}</div>
                          <div className="text-[10px] text-slate-500">{daySlots[2]?.teacher || '-'}</div>
                        </td>
                        <td className="p-1 border-r border-slate-300 text-center bg-slate-100 font-bold text-[10px] text-slate-500">
                          Tiffin
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center">
                          <div className="font-bold text-slate-900">{daySlots[3]?.subject || '-'}</div>
                          <div className="text-[10px] text-slate-500">{daySlots[3]?.teacher || '-'}</div>
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center">
                          <div className="font-bold text-slate-900">{daySlots[4]?.subject || '-'}</div>
                          <div className="text-[10px] text-slate-500">{daySlots[4]?.teacher || '-'}</div>
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center">
                          <div className="font-bold text-slate-900">{daySlots[5]?.subject || '-'}</div>
                          <div className="text-[10px] text-slate-500">{daySlots[5]?.teacher || '-'}</div>
                        </td>
                        <td className="p-2 text-center">
                          <div className="font-bold text-slate-900">{daySlots[6]?.subject || '-'}</div>
                          <div className="text-[10px] text-slate-500">{daySlots[6]?.teacher || '-'}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Official Signatures */}
            <div className="grid grid-cols-3 gap-8 pt-8 text-center text-xs">
              <div className="border-t border-slate-800 pt-2">
                <span className="font-bold text-slate-900 block">{assignedClassTeacher?.name || selectedClass.teacherName}</span>
                <span className="text-[10px] text-slate-600">Class Teacher In-charge</span>
              </div>

              <div className="border-t border-slate-800 pt-2">
                <span className="font-bold text-slate-900 block">Dr. H. Lalrinsanga</span>
                <span className="text-[10px] text-slate-600">Vice Principal / Academic Dean</span>
              </div>

              <div className="border-t border-slate-800 pt-2">
                <span className="font-bold text-slate-900 block">Rev. Dr. L. H. Rohmingliana</span>
                <span className="text-[10px] text-slate-600">Principal / Head of Institution</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* SUB-TAB 2: EXAM ROUTINE (DATE-SHEET & TIME TABLE)                         */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {activeMainTab === 'exam_routine' && (
        <div className="space-y-6">
          {/* Exam Term Filter & Action Bar */}
          <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-300 mr-1">Exam Term:</span>
              {examTerms.map((term) => (
                <button
                  key={term}
                  onClick={() => setSelectedExamTerm(term)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    selectedExamTerm === term
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{term}</span>
                </button>
              ))}
            </div>

            {/* Principal & Vice Principal Exam Controls */}
            {canManage && (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleOpenNewExamModal}
                  className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Exam Paper Dah Belh</span>
                </button>

                <button
                  onClick={handleBroadcastExamNotice}
                  className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs transition border border-cyan-500/30 flex items-center gap-1.5 cursor-pointer"
                  title="Notice Board-ah official exam routine thawn chhuak rawh"
                >
                  <Megaphone className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">Notice-ah Broadcast</span>
                </button>
              </div>
            )}
          </div>

          {/* Exam Routine Table (Interactive View) */}
          <div className="no-print p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  {selectedClass.name} • {selectedExamTerm} Date-Sheet
                </h3>
                <p className="text-xs text-slate-400">
                  Room: {selectedClass.roomNumber} • Official MBSE Examination Timings &amp; Hall Allotment
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                {currentClassExams.length} Total Papers
              </span>
            </div>

            {currentClassExams.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl p-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white font-['Outfit']">Exam Schedule A La Awm Lo</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {selectedClass.name} tan hian {selectedExamTerm} routine a la in-ziak lo. 
                  {canManage ? ' Vice Principal emaw Principal-in chunglama "+ Exam Paper Dah Belh" button hmangin an siam thei e.' : ''}
                </p>
                {canManage && (
                  <button
                    onClick={handleOpenNewExamModal}
                    className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Paper Hmasa Ber Dah Luhna
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-950/80 text-slate-300 font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Date &amp; Day</th>
                      <th className="py-3 px-4">Time &amp; Session</th>
                      <th className="py-3 px-4">Subject &amp; Paper</th>
                      <th className="py-3 px-4">Hall / Room</th>
                      <th className="py-3 px-4">Marks (Max / Pass)</th>
                      <th className="py-3 px-4">Invigilator Faculty</th>
                      {canManage && <th className="py-3 px-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {currentClassExams.map((paper) => (
                      <tr key={paper.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                            <span>{paper.date}</span>
                            <span className="text-[11px] font-normal text-slate-400">({paper.day})</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-cyan-300 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[11px]">
                            {paper.time}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-xs">{paper.subject}</div>
                          {paper.paperCode && (
                            <span className="text-[10px] font-mono text-slate-400">{paper.paperCode}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {paper.room || selectedClass.roomNumber}
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <span className="text-white font-bold">{paper.maxMarks}</span>
                          <span className="text-slate-500"> / </span>
                          <span className="text-emerald-400">{paper.passMarks}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-slate-300 font-medium">
                            {paper.invigilator || 'Faculty In-Charge'}
                          </span>
                        </td>

                        {canManage && (
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditExamModal(paper)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 transition cursor-pointer"
                                title="Edit exam paper"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteExamPaper(paper.id, paper.subject)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                                title="Paih rawh"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PRINTABLE OFFICIAL EXAM ROUTINE SHEET */}
          <div className="printable-area max-w-5xl mx-auto rounded-3xl bg-white text-slate-950 border border-slate-300 shadow-2xl p-8 sm:p-10 font-sans mt-8">
            <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
              <h1 className="text-2xl font-black uppercase tracking-tight font-['Outfit']">
                {systemConfig?.schoolName || 'OHA (One Heart Academy)'}
              </h1>
              <p className="text-xs font-semibold text-slate-700 tracking-wider uppercase">
                Mizoram Board of School Education (MBSE) • Academic Session: {systemConfig?.academicSession || '2026-2027'}
              </p>
              <div className="pt-2">
                <span className="inline-block px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-900 text-white">
                  OFFICIAL EXAM DATE-SHEET • {selectedClass.name} ({selectedExamTerm.toUpperCase()})
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 pt-1 font-mono">
                Class Room: {selectedClass.roomNumber} • Class Teacher In-Charge: {assignedClassTeacher?.name || selectedClass.teacherName}
              </p>
            </div>

            {/* Exam Table */}
            <div className="overflow-x-auto my-6">
              <table className="w-full text-left text-xs border-collapse border border-slate-400">
                <thead className="bg-slate-100 text-slate-950 font-bold border-b-2 border-slate-400">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-300">Date &amp; Day</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Examination Time</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Subject &amp; Paper</th>
                    <th className="py-2.5 px-2 border-r border-slate-300 text-center">Room/Hall</th>
                    <th className="py-2.5 px-2 border-r border-slate-300 text-center">Full Marks</th>
                    <th className="py-2.5 px-3">Invigilator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 text-slate-800">
                  {currentClassExams.map((ex) => (
                    <tr key={ex.id}>
                      <td className="py-2.5 px-3 border-r border-slate-300 font-bold text-slate-900">
                        {ex.date} ({ex.day})
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-300 font-mono">
                        {ex.time}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-300 font-bold">
                        {ex.subject} {ex.paperCode ? `(${ex.paperCode})` : ''}
                      </td>
                      <td className="py-2.5 px-2 border-r border-slate-300 text-center font-mono">
                        {ex.room}
                      </td>
                      <td className="py-2.5 px-2 border-r border-slate-300 text-center font-mono font-bold">
                        {ex.maxMarks} (Pass: {ex.passMarks})
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {ex.invigilator || 'Faculty In-Charge'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Candidate Instructions */}
            <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-300 text-[11px] text-slate-700 space-y-1">
              <strong className="text-slate-900 block font-bold uppercase tracking-wider text-xs">
                Candidate-te Tana Hriattirna Pawimawh (Examination Rules):
              </strong>
              <p>1. Zirlai zawng zawngte exam ṭan hma minute 15 ah mahni ṭhutna ṭheuh thleng kim tur a ni.</p>
              <p>2. Admit Card leh Official School ID Card theihnghilh miah loh tur a ni.</p>
              <p>3. Examination Hall-ah mobile phone, programmable smart watch, leh electronic gadgets ken luh khap tlat a ni.</p>
              <p>4. Question paper chhiar chian nan minute 15 pek belh a ni ang.</p>
            </div>

            {/* Official Signatures */}
            <div className="grid grid-cols-3 gap-8 pt-8 text-center text-xs">
              <div className="border-t border-slate-800 pt-2">
                <span className="font-bold text-slate-900 block">{assignedClassTeacher?.name || selectedClass.teacherName}</span>
                <span className="text-[10px] text-slate-600">Class Teacher In-charge</span>
              </div>

              <div className="border-t border-slate-800 pt-2">
                <span className="font-bold text-slate-900 block">Dr. H. Lalrinsanga</span>
                <span className="text-[10px] text-slate-600">Vice Principal / Controller of Examinations</span>
              </div>

              <div className="border-t border-slate-800 pt-2">
                <span className="font-bold text-slate-900 block">Rev. Dr. L. H. Rohmingliana</span>
                <span className="text-[10px] text-slate-600">Principal / Head of Institution</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 1: ASSIGN / CHANGE CLASS TEACHER (PRINCIPAL & VICE PRINCIPAL ONLY)   */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {isAssignTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e1626] border border-indigo-500/40 shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col font-sans">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Class Teacher Ruat / Thlakna
                  </h3>
                  <p className="text-xs text-indigo-300">
                    {selectedClass.name} (Room {selectedClass.roomNumber}) • {assignerName} Authority
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAssignTeacherModalOpen(false)} 
                className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Policy notice */}
            <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Class Tin Tan Zirtirtu Hran Ṭheuh (Distinct Rule)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Class khatah zirtirtu pakhat chauh Class Teacher a ni thei ang. Zirtirtu dang i thlan chuan a class hmasa zawk aṭangin a in-relieve nghal ang.
              </p>
            </div>

            {/* Current Teacher */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Currently Appointed:</span>
              {assignedClassTeacher ? (
                <div className="flex items-center gap-2">
                  <img 
                    src={assignedClassTeacher.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                    alt="" 
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-500"
                  />
                  <span className="font-bold text-emerald-300">{assignedClassTeacher.name}</span>
                  <span className="text-[10px] text-slate-500">({assignedClassTeacher.designation})</span>
                </div>
              ) : (
                <span className="text-amber-400 font-bold">Unassigned / Ruat a la ni lo</span>
              )}
            </div>

            {/* Faculty Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Zirtirtu hming emaw department zawnna..."
                value={teacherSearchQuery}
                onChange={(e) => setTeacherSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-400"
                autoFocus
              />
            </div>

            {/* Faculty List */}
            <div className="space-y-2 overflow-y-auto flex-1 pr-1 max-h-64">
              {/* Unassign / Clear Option */}
              <button
                onClick={() => handleAssignTeacher(null)}
                className="w-full p-2.5 rounded-2xl bg-slate-950/60 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-500/40 text-left text-slate-400 hover:text-rose-300 transition flex items-center justify-between text-xs group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-slate-800 group-hover:bg-rose-900/40 flex items-center justify-center text-slate-400 group-hover:text-rose-300">
                    <X className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold">Unassign / No Class Teacher</div>
                    <div className="text-[10px] text-slate-500">Class Teacher awm lo tura siamna</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">Clear</span>
              </button>

              {staff
                .filter(stf => {
                  if (!teacherSearchQuery.trim()) return true;
                  const q = teacherSearchQuery.toLowerCase();
                  return stf.name.toLowerCase().includes(q) ||
                    stf.designation.toLowerCase().includes(q) ||
                    (stf.department && stf.department.toLowerCase().includes(q));
                })
                .map(stf => {
                  const isCurrent = stf.id === selectedClass.classTeacherId || stf.classTeacherOf === selectedClass.id;
                  const otherClass = stf.classTeacherOf && !isCurrent 
                    ? classes.find(c => c.id === stf.classTeacherOf) 
                    : null;

                  return (
                    <button
                      key={stf.id}
                      onClick={() => handleAssignTeacher(stf.id)}
                      className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between gap-3 text-xs cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-950/40 border-emerald-500/60 text-white ring-1 ring-emerald-500/30'
                          : otherClass
                          ? 'bg-slate-950 hover:bg-amber-950/30 border-slate-800 hover:border-amber-500/40 text-slate-200'
                          : 'bg-slate-950 hover:bg-indigo-950/30 border-slate-800 hover:border-indigo-500/40 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={stf.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt=""
                          className="w-9 h-9 rounded-xl object-cover shrink-0 ring-1 ring-slate-700"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                            <span>{stf.name}</span>
                            {isCurrent && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            )}
                          </div>
                          <div className="text-[11px] text-indigo-300 truncate">{stf.designation}</div>
                          <div className="text-[10px] text-slate-500 truncate">{stf.department} • 📞 {stf.phone}</div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {isCurrent ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                            Current In-Charge
                          </span>
                        ) : otherClass ? (
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold block">
                              In-Charge: {otherClass.name}
                            </span>
                            <span className="text-[9px] text-slate-500">Will be reallocated</span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold">
                            Select Teacher
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 2: EDIT PERIOD SLOT (TIME TABLE)                                    */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {isEditSlotModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0e1626] border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Edit Time Table Slot
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedSlot.day} • Period {selectedSlot.periodIndex + 1} • {selectedClass.name}
                </p>
              </div>
              <button onClick={() => setIsEditSlotModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={selectedSlot.subject}
                  onChange={(e) => setSelectedSlot({ ...selectedSlot, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Teacher / Faculty Name *</label>
                <input
                  type="text"
                  required
                  value={selectedSlot.teacher}
                  onChange={(e) => setSelectedSlot({ ...selectedSlot, teacher: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Room Number</label>
                  <input
                    type="text"
                    value={selectedSlot.room}
                    onChange={(e) => setSelectedSlot({ ...selectedSlot, room: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Time Range</label>
                  <input
                    type="text"
                    value={selectedSlot.time}
                    onChange={(e) => setSelectedSlot({ ...selectedSlot, time: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditSlotModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* MODAL 3: ADD / EDIT EXAM PAPER (PRINCIPAL & VICE PRINCIPAL ONLY)          */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e1626] border border-amber-500/40 shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>{editingExamPaper ? 'Exam Paper Siamṭhatna' : 'Exam Paper Tharlam Dah Belhna'}</span>
                </h3>
                <p className="text-xs text-amber-300">
                  {selectedClass.name} • {selectedExamTerm} Examination
                </p>
              </div>
              <button 
                onClick={() => setIsExamModalOpen(false)} 
                className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExamPaper} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subject Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics / Physics"
                    value={examForm.subject}
                    onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Paper Code / Type</label>
                  <input
                    type="text"
                    placeholder="e.g. MTH-101 / Theory"
                    value={examForm.paperCode}
                    onChange={(e) => setExamForm({ ...examForm, paperCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Exam Date *</label>
                  <input
                    type="date"
                    required
                    value={examForm.date}
                    onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Timing &amp; Session *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09:30 AM - 12:30 PM"
                    value={examForm.time}
                    onChange={(e) => setExamForm({ ...examForm, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Room / Hall</label>
                  <input
                    type="text"
                    value={examForm.room}
                    onChange={(e) => setExamForm({ ...examForm, room: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Marks *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={examForm.maxMarks}
                    onChange={(e) => setExamForm({ ...examForm, maxMarks: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pass Marks *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={examForm.passMarks}
                    onChange={(e) => setExamForm({ ...examForm, passMarks: parseInt(e.target.value) || 33 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Invigilator Faculty</label>
                <select
                  value={examForm.invigilator}
                  onChange={(e) => setExamForm({ ...examForm, invigilator: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="">Faculty In-Charge</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingExamPaper ? 'Siamṭhatna Save Rawh' : 'Paper Dah Lut Rawh'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
