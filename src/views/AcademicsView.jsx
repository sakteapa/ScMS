import React, { useState } from 'react';
import { 
  GraduationCap, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  ArrowRight,
  Sparkles,
  BookOpen,
  Calendar,
  Radio,
  Video,
  ShieldCheck,
  CalendarCheck,
  Sliders,
  Settings,
  Clock,
  UserCheck,
  Check,
  X
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { STREAM_SUBJECTS } from '../data/mockData';
import LiveClassroomSuite from '../components/LiveClassroomSuite';
import SpecialOnlineExamSuite from '../components/SpecialOnlineExamSuite';
import StudentIdCardModal from '../components/StudentIdCardModal';
import { CreditCard } from 'lucide-react';

export default function AcademicsView({ setCurrentTab, setSelectedStudentForReport }) {
  const { 
    classes, 
    students, 
    grades, 
    addGrade,
    ptmEvents = [],
    ptmConfig = {},
    createPtmEvent,
    cancelPtmSlot,
    updatePtmConfig,
    startPrivateCall,
    staff = []
  } = useSchool();
  
  // Strict separation tabs: 'class_test' vs 'examination' vs 'ptm'
  const [assessmentType, setAssessmentType] = useState('class_test'); // 'class_test' | 'examination' | 'ptm'
  const [selectedClassId, setSelectedClassId] = useState('cls-12-sci');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLiveClassOpen, setIsLiveClassOpen] = useState(false);
  const [isSpecialExamOpen, setIsSpecialExamOpen] = useState(false);
  const [isAdmitCardOpen, setIsAdmitCardOpen] = useState(false);

  // PTM Modals & State
  const [isPtmCreateModalOpen, setIsPtmCreateModalOpen] = useState(false);
  const [isPtmConfigModalOpen, setIsPtmConfigModalOpen] = useState(false);
  const [ptmForm, setPtmForm] = useState({
    title: 'Term 1 Mid-Academic Parent-Teacher Consultation',
    date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    startTime: '09:00 AM',
    endTime: '01:30 PM',
    venue: 'Academic Wing & Google Meet',
    description: 'Quarterly review of academic trajectory, board prep, continuous assessments and attendance.'
  });
  const [tempPtmConfig, setTempPtmConfig] = useState(ptmConfig);
  const [ptmToast, setPtmToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    subject: 'Physics',
    testName: '',
    maxMarks: assessmentType === 'class_test' ? 25 : 100,
    marksObtained: '',
    remarks: ''
  });

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(s => s.classId === selectedClassId);

  // Available subjects based on class stream
  const getSubjectsForClass = (cls) => {
    if (cls?.stream === 'science') return STREAM_SUBJECTS.science;
    if (cls?.stream === 'arts') return STREAM_SUBJECTS.arts;
    if (cls?.stream === 'commerce') return STREAM_SUBJECTS.commerce;
    if (Number(cls?.level) >= 6) return STREAM_SUBJECTS.general_secondary;
    return STREAM_SUBJECTS.primary;
  };

  const currentSubjects = getSubjectsForClass(selectedClass);

  // Filter grades strictly by active assessment type
  const filteredGrades = grades.filter(g => {
    const matchesType = g.type === assessmentType;
    const matchesClass = g.classId === selectedClassId;
    const student = students.find(s => s.id === g.studentId);
    const matchesSearch = !searchQuery || 
      g.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student && `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesType && matchesClass && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setFormData({
      studentId: classStudents[0]?.id || '',
      subject: currentSubjects[0] || 'English',
      testName: assessmentType === 'class_test' ? 'Unit Test 2' : 'Annual Examination',
      maxMarks: assessmentType === 'class_test' ? 25 : 100,
      marksObtained: '',
      remarks: ''
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitGrade = (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.marksObtained) return;

    addGrade({
      ...formData,
      classId: selectedClassId,
      type: assessmentType
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Module Title & Assessment Type Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
            <span>Academic Management &amp; Gradebook</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Nursery - 12
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Strict separation between continuous assessments (Class Tests) and term-end evaluations (Examinations).
          </p>
        </div>

        {/* Strict Distinction Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => {
              setAssessmentType('class_test');
              setFormData(f => ({ ...f, maxMarks: 25, testName: 'Unit Test 2' }));
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
              assessmentType === 'class_test'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Class Tests (Continuous)</span>
          </button>
          <button
            onClick={() => {
              setAssessmentType('examination');
              setFormData(f => ({ ...f, maxMarks: 100, testName: 'Term Examination' }));
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
              assessmentType === 'examination'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Examinations (Term/Final)</span>
          </button>
          <button
            onClick={() => setAssessmentType('ptm')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
              assessmentType === 'ptm'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>PTM Conferences</span>
          </button>
        </div>
      </div>

      {/* Live Classroom & Special Exam Suite Quick Launch Toolbar */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center animate-pulse">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
              <span>Online Learning &amp; Proctored Testing Suite</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                Live Class &amp; Special Exams
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Host live audio/video lectures for students on leave, or conduct sanctioned proctored online examinations.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsLiveClassOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 transition"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Launch Live Streaming Class</span>
          </button>

          <button
            onClick={() => setIsSpecialExamOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Special Online Exam Room</span>
          </button>

          <button
            onClick={() => setIsAdmitCardOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
          >
            <CreditCard className="w-4 h-4" />
            <span>Exam Admit Cards (Hall Tickets)</span>
          </button>
        </div>
      </div>

      {/* Conditional: PTM vs Gradebook */}
      {assessmentType === 'ptm' ? (
        <div className="space-y-6">
          {/* PTM Banner & Toolbar */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider">
                    PTM Scheduler &amp; Consultation Suite
                  </span>
                  <span className="text-xs text-slate-400">
                    Slot Duration: {ptmConfig?.defaultSlotDurationMinutes || 15} Mins
                  </span>
                </div>
                <h3 className="text-base font-bold text-white font-['Outfit'] mt-1">
                  Parent-Teacher Conference Management
                </h3>
                <p className="text-xs text-slate-400">
                  Organize scheduled academic consultations, track booked parents, and launch 1-on-1 video conferences.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsPtmCreateModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Schedule New PTM</span>
              </button>
              <button
                onClick={() => {
                  setTempPtmConfig(ptmConfig);
                  setIsPtmConfigModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition flex items-center gap-1.5"
              >
                <Sliders className="w-4 h-4" />
                <span>PTM Settings</span>
              </button>
            </div>
          </div>

          {/* Toast feedback */}
          {ptmToast && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{ptmToast}</span>
            </div>
          )}

          {/* PTM Events Cards */}
          <div className="space-y-6">
            {ptmEvents.map((evt) => {
              const allSlots = (evt.teachersAvailable || []).flatMap(t => t.slots || []);
              const bookedSlots = allSlots.filter(s => s.status === 'booked');
              const availableSlots = allSlots.filter(s => s.status === 'available');

              return (
                <div key={evt.id} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                          {evt.status}
                        </span>
                        <span className="text-xs text-slate-400 font-mono font-medium">
                          {evt.date} &bull; {evt.startTime} - {evt.endTime}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-white font-['Outfit'] mt-1">
                        {evt.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Venue: <strong className="text-cyan-400">{evt.venue}</strong> &bull; {evt.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                        <span className="text-[10px] uppercase text-slate-500 font-bold block">Booked Consultations</span>
                        <span className="text-lg font-bold text-emerald-400 font-mono">{bookedSlots.length}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                        <span className="text-[10px] uppercase text-slate-500 font-bold block">Available Slots</span>
                        <span className="text-lg font-bold text-cyan-400 font-mono">{availableSlots.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Teacher Schedules */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Teacher Consultation Rooms &amp; Appointments
                    </h5>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {evt.teachersAvailable?.map((teacher) => (
                        <div key={teacher.teacherId} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h6 className="text-sm font-bold text-white">{teacher.teacherName}</h6>
                              <p className="text-xs text-cyan-400">{teacher.subject} &bull; {teacher.room}</p>
                            </div>
                            <span className="text-xs text-slate-400 font-mono">
                              {teacher.slots?.filter(s => s.status === 'booked').length} booked / {teacher.slots?.length} total
                            </span>
                          </div>

                          <div className="space-y-2">
                            {teacher.slots?.map((slot) => {
                              const isBooked = slot.status === 'booked';
                              return (
                                <div
                                  key={slot.id}
                                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                                    isBooked
                                      ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-white">{slot.time}</span>
                                    {isBooked ? (
                                      <span className="text-[11px] text-emerald-300">
                                        &bull; {slot.studentName} (Roll #{slot.rollNo}) - Parent: {slot.parentName}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-500 italic">
                                        (Open for parent booking)
                                      </span>
                                    )}
                                  </div>

                                  {isBooked && (
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        onClick={() => {
                                          startPrivateCall({
                                            id: `ptm-call-${slot.id}`,
                                            name: slot.parentName || 'Parent',
                                            role: `Parent of ${slot.studentName}`,
                                            phone: '+91 98623 45671',
                                            photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200',
                                            info: `PTM Call: ${slot.time}`
                                          }, 'video');
                                        }}
                                        className="p-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white"
                                        title="Launch Virtual Video Consultation"
                                      >
                                        <Video className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          cancelPtmSlot(evt.id, teacher.teacherId, slot.id);
                                          setPtmToast('Slot appointment cancelled');
                                          setTimeout(() => setPtmToast(null), 3000);
                                        }}
                                        className="p-1 rounded-md bg-slate-800 hover:bg-rose-500/30 text-slate-400 hover:text-rose-300"
                                        title="Cancel Slot"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {/* Assessment Info Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
            assessmentType === 'class_test'
              ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-200'
              : 'bg-purple-950/20 border-purple-500/30 text-purple-200'
          }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
            assessmentType === 'class_test' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300'
          }`}>
            {assessmentType === 'class_test' ? 'CT' : 'EX'}
          </div>
          <div>
            <span className="font-bold">
              {assessmentType === 'class_test' ? 'Continuous Assessment Mode (Class Tests & Quizzes)' : 'Formal Examination Mode (MBSE Standard Evaluations)'}
            </span>
            <p className="text-[11px] opacity-80 mt-0.5">
              {assessmentType === 'class_test' 
                ? 'Records weekly evaluations, class quizzes & unit tests (typically 20-25 marks). Calculated as continuous internal metrics.'
                : 'Records Mid-term, Half-yearly, and Final Board Prep examinations (100 marks). Powers the term-end percentage on report cards.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentTab('report_cards')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-cyan-400 text-xs font-medium transition shrink-0"
        >
          <span>Combined Report Cards</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>

      {/* Class Selector & Actions Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Class Filter Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Active Class Level</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-medium focus:border-cyan-400 focus:outline-none"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.stream ? `(${c.stream.toUpperCase()})` : ''} - Room {c.roomNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Search Record</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject or student..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Add Grade Entry Button */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Log {assessmentType === 'class_test' ? 'Class Test' : 'Exam'} Marks</span>
          </button>
        </div>
      </div>

      {/* Grade Records Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Roll No</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Test / Examination Title</th>
                <th className="py-3.5 px-4">Score</th>
                <th className="py-3.5 px-4">Percentage</th>
                <th className="py-3.5 px-4">Grade &amp; Remarks</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredGrades.length > 0 ? (
                filteredGrades.map((grd) => {
                  const student = students.find(s => s.id === grd.studentId);
                  const percentage = Math.round((grd.marksObtained / grd.maxMarks) * 100);
                  let gradeLetter = 'A1';
                  let gradeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

                  if (percentage >= 91) { gradeLetter = 'A1'; }
                  else if (percentage >= 81) { gradeLetter = 'A2'; }
                  else if (percentage >= 71) { gradeLetter = 'B1'; }
                  else if (percentage >= 61) { gradeLetter = 'B2'; }
                  else if (percentage >= 51) { gradeLetter = 'C1'; }
                  else if (percentage >= 41) { gradeLetter = 'C2'; }
                  else if (percentage >= 33) { gradeLetter = 'D'; gradeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20'; }
                  else { gradeLetter = 'E (Failed)'; gradeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20'; }

                  return (
                    <tr key={grd.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={student?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt=""
                            className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700"
                          />
                          <div>
                            <span className="font-bold text-white block">
                              {student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {student?.admissionNo}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                        {student?.rollNo || '00'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {grd.subject}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-slate-300 font-medium">{grd.testName}</span>
                        <span className="block text-[10px] text-slate-500">{grd.date}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className="text-white">{grd.marksObtained}</span>
                        <span className="text-slate-500"> / {grd.maxMarks}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{percentage}%</span>
                          <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${percentage >= 80 ? 'bg-emerald-400' : percentage >= 50 ? 'bg-cyan-400' : 'bg-rose-400'}`}
                              style={{ width: `${Math.min(100, percentage)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border font-mono ${gradeColor}`}>
                            {gradeLetter}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate max-w-[140px]" title={grd.remarks}>
                            {grd.remarks || 'Satisfactory'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            if (setSelectedStudentForReport) setSelectedStudentForReport(student);
                            setCurrentTab('report_cards');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 font-semibold text-[11px] transition inline-flex items-center gap-1"
                        >
                          <span>Report Card</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-500">
                    No {assessmentType === 'class_test' ? 'Class Test' : 'Examination'} records found for {selectedClass.name}. Click "Log Marks" to add one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}

      {/* Add Grade Entry Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0e1626] border border-slate-700/80 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Log {assessmentType === 'class_test' ? 'Class Test (Continuous)' : 'Examination'} Marks
                </h3>
                <p className="text-xs text-slate-400">Class: {selectedClass.name}</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitGrade} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Select Student</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  {classStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      Roll #{s.rollNo} - {s.firstName} {s.lastName} ({s.admissionNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    {currentSubjects.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Test / Exam Title</label>
                  <input
                    type="text"
                    required
                    value={formData.testName}
                    onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                    placeholder="e.g. Unit Test 2, Mid-Term"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Max Marks</label>
                  <input
                    type="number"
                    required
                    value={formData.maxMarks}
                    onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Marks Obtained</label>
                  <input
                    type="number"
                    required
                    max={formData.maxMarks}
                    value={formData.marksObtained}
                    onChange={(e) => setFormData({ ...formData, marksObtained: e.target.value })}
                    placeholder={`Max ${formData.maxMarks}`}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Teacher Remarks</label>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="e.g. Outstanding conceptual clarity"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                >
                  Save Marks Entry
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
        defaultClassId={selectedClassId}
      />

      {/* SPECIAL ONLINE PROCTORED EXAMINATION SUITE */}
      <SpecialOnlineExamSuite
        isOpen={isSpecialExamOpen}
        onClose={() => setIsSpecialExamOpen(false)}
        isInvigilator={true}
      />

      {/* EXAM ADMIT CARD / HALL TICKET GENERATOR */}
      <StudentIdCardModal
        isOpen={isAdmitCardOpen}
        onClose={() => setIsAdmitCardOpen(false)}
        selectedClassId={selectedClassId}
      />

      {/* SCHEDULE NEW PTM CONFERENCE MODAL */}
      {isPtmCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0e1626] border border-emerald-500/40 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Schedule Parent-Teacher Conference (PTM)
                  </h3>
                  <p className="text-xs text-slate-400">Organize Consultation Day with Teacher Time Slots</p>
                </div>
              </div>
              <button onClick={() => setIsPtmCreateModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newEvt = {
                  title: ptmForm.title,
                  date: ptmForm.date,
                  startTime: ptmForm.startTime,
                  endTime: ptmForm.endTime,
                  venue: ptmForm.venue,
                  description: ptmForm.description,
                  teachersAvailable: [
                    {
                      teacherId: 'stf-001',
                      teacherName: 'Pu Lalthlamuana Sailo',
                      subject: 'Physics & Senior Science',
                      room: 'Room 201 (Science Block)',
                      slots: [
                        { id: `s-${Date.now()}-1`, time: '09:00 AM - 09:15 AM', status: 'available', parentName: null, studentName: null, rollNo: null },
                        { id: `s-${Date.now()}-2`, time: '09:20 AM - 09:35 AM', status: 'available', parentName: null, studentName: null, rollNo: null },
                        { id: `s-${Date.now()}-3`, time: '09:40 AM - 09:55 AM', status: 'available', parentName: null, studentName: null, rollNo: null },
                        { id: `s-${Date.now()}-4`, time: '10:00 AM - 10:15 AM', status: 'available', parentName: null, studentName: null, rollNo: null }
                      ]
                    },
                    {
                      teacherId: 'stf-002',
                      teacherName: 'Pi Ruth Lalrinsangi',
                      subject: 'English Literature & Grammar',
                      room: 'Room 202 (Arts Block)',
                      slots: [
                        { id: `s-${Date.now()}-5`, time: '09:00 AM - 09:15 AM', status: 'available', parentName: null, studentName: null, rollNo: null },
                        { id: `s-${Date.now()}-6`, time: '09:20 AM - 09:35 AM', status: 'available', parentName: null, studentName: null, rollNo: null },
                        { id: `s-${Date.now()}-7`, time: '09:40 AM - 09:55 AM', status: 'available', parentName: null, studentName: null, rollNo: null }
                      ]
                    }
                  ]
                };
                createPtmEvent(newEvt);
                setIsPtmCreateModalOpen(false);
                setPtmToast('New PTM Conference scheduled with automatic slot generation!');
                setTimeout(() => setPtmToast(null), 3000);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-bold mb-1">Conference Title *</label>
                <input
                  type="text"
                  required
                  value={ptmForm.title}
                  onChange={(e) => setPtmForm({ ...ptmForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Meeting Date *</label>
                  <input
                    type="date"
                    required
                    value={ptmForm.date}
                    onChange={(e) => setPtmForm({ ...ptmForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Start Time *</label>
                  <input
                    type="text"
                    required
                    value={ptmForm.startTime}
                    onChange={(e) => setPtmForm({ ...ptmForm, startTime: e.target.value })}
                    placeholder="09:00 AM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">End Time *</label>
                  <input
                    type="text"
                    required
                    value={ptmForm.endTime}
                    onChange={(e) => setPtmForm({ ...ptmForm, endTime: e.target.value })}
                    placeholder="01:30 PM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Venue / Physical Location &amp; Virtual Link *</label>
                <input
                  type="text"
                  required
                  value={ptmForm.venue}
                  onChange={(e) => setPtmForm({ ...ptmForm, venue: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Agenda &amp; Discussion Purpose</label>
                <textarea
                  rows="2"
                  value={ptmForm.description}
                  onChange={(e) => setPtmForm({ ...ptmForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-400 focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPtmCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                >
                  Schedule PTM Conference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PTM CONFIGURATION SETTINGS MODAL */}
      {isPtmConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0e1626] border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    PTM Consultation Configuration
                  </h3>
                  <p className="text-xs text-slate-400">Slots, Buffers &amp; Video Call Rules</p>
                </div>
              </div>
              <button onClick={() => setIsPtmConfigModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Default Slot Duration (Minutes)
                </label>
                <select
                  value={tempPtmConfig.defaultSlotDurationMinutes || 15}
                  onChange={(e) => setTempPtmConfig({ ...tempPtmConfig, defaultSlotDurationMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value={10}>10 Minutes (Quick briefing)</option>
                  <option value={15}>15 Minutes (Standard recommendation)</option>
                  <option value={20}>20 Minutes (Deep dive review)</option>
                  <option value={30}>30 Minutes (Comprehensive consultation)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Buffer Gap Between Slots (Minutes)
                </label>
                <select
                  value={tempPtmConfig.bufferBetweenSlotsMinutes || 5}
                  onChange={(e) => setTempPtmConfig({ ...tempPtmConfig, bufferBetweenSlotsMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value={0}>0 Minutes (No buffer)</option>
                  <option value={5}>5 Minutes (Recommended)</option>
                  <option value={10}>10 Minutes (Rest &amp; notes)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Max Teacher Bookings Per Parent
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tempPtmConfig.maxBookingsPerParent || 3}
                  onChange={(e) => setTempPtmConfig({ ...tempPtmConfig, maxBookingsPerParent: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Auto SMS/App Reminder Notice (Hours Prior)
                </label>
                <select
                  value={tempPtmConfig.autoReminderHoursPrior || 24}
                  onChange={(e) => setTempPtmConfig({ ...tempPtmConfig, autoReminderHoursPrior: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value={12}>12 Hours Before</option>
                  <option value={24}>24 Hours Before (1 Day)</option>
                  <option value={48}>48 Hours Before (2 Days)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Allow Virtual Video PTM</span>
                  <span className="text-[11px] text-slate-400">
                    Parents can join consultation via live 1-on-1 video call
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={tempPtmConfig.allowVirtualVideoPtm ?? true}
                  onChange={(e) => setTempPtmConfig({ ...tempPtmConfig, allowVirtualVideoPtm: e.target.value ? e.target.checked : false })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-0 bg-slate-800 border-slate-700"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
              <button
                onClick={() => setIsPtmConfigModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updatePtmConfig(tempPtmConfig);
                  setIsPtmConfigModalOpen(false);
                  setPtmToast('PTM configuration settings saved successfully!');
                  setTimeout(() => setPtmToast(null), 3000);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
