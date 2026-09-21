import React, { useState } from 'react';
import { 
  Calendar, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Search, 
  UserCheck, 
  Clock, 
  FileText, 
  Printer, 
  Sparkles, 
  X, 
  RotateCw, 
  Layers, 
  Building, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Award,
  Filter,
  Check,
  CheckSquare,
  Square
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export default function AcademicSessionPromotionModal({
  isOpen,
  onClose,
  initialTab = 'sessions', // 'sessions' | 'batch_promotion' | 'single_promotion' | 'history'
  initialStudent = null
}) {
  const { 
    classes, 
    students, 
    systemConfig, 
    academicSessions = [], 
    startNewAcademicSession, 
    switchActiveAcademicSession, 
    promoteStudent, 
    batchPromoteStudents,
    reEnrollStudent,
    onlineAdmissionConfig,
    offlineAdmissionConfig,
    updateOnlineAdmissionConfig,
    updateOfflineAdmissionConfig
  } = useSchool();

  const { currentUser, isPrincipal, isVicePrincipal, isSuperAdmin } = useAuth();
  const canManage = isPrincipal || isVicePrincipal || isSuperAdmin;

  const [activeTab, setActiveTab] = useState(initialStudent ? 'single_promotion' : initialTab);
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Session Setup Form State
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [newSessionForm, setNewSessionForm] = useState({
    sessionName: `${new Date().getFullYear() + 1} - ${new Date().getFullYear() + 2}`,
    startDate: `${new Date().getFullYear() + 1}-04-01`,
    endDate: `${new Date().getFullYear() + 2}-03-31`,
    notes: 'New Academic Session registered under Mizoram Board of School Education (MBSE).'
  });

  // 2. Batch Promotion Form State
  const [batchSourceClassId, setBatchSourceClassId] = useState(classes[0]?.id || 'cls-10');
  const [batchTargetClassId, setBatchTargetClassId] = useState(classes[1]?.id || 'cls-11-sci');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [batchTargetSession, setBatchTargetSession] = useState(systemConfig?.academicSession || '2026 - 2027');
  const [batchPromoType, setBatchPromoType] = useState('session_advancement');
  const [batchRemarks, setBatchRemarks] = useState('Promoted following Annual Evaluation & Academic Board clearance.');

  // 3. Single Student Detailed Promotion State
  const [singleStudentId, setSingleStudentId] = useState(initialStudent?.id || students[0]?.id || '');
  const [singleTargetClassId, setSingleTargetClassId] = useState(classes[1]?.id || 'cls-12-sci');
  const [singleNewRollNo, setSingleNewRollNo] = useState('');
  const [singleTargetSession, setSingleTargetSession] = useState(systemConfig?.academicSession || '2026 - 2027');
  const [singlePromoType, setSinglePromoType] = useState('session_advancement');
  const [singleReason, setSingleReason] = useState('Satisfactory academic progress, board syllabus completion and term assessment.');
  const [singleRemarks, setSingleRemarks] = useState('Approved by School Academic Council and endorsed by Leadership.');
  const [singleEffectiveDate, setSingleEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [singlePromotedBy, setSinglePromotedBy] = useState(
    isPrincipal ? 'Dr. Lalthlamuana (Principal)' : isVicePrincipal ? 'Lalhmingliani (Vice Principal)' : 'Administrative Board'
  );

  // 4. Inspection / Printable Promotion Order
  const [previewPromotionRecord, setPreviewPromotionRecord] = useState(null);
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  if (!isOpen) return null;

  const activeSessionObj = academicSessions.find(s => s.status === 'active') || {
    sessionName: systemConfig?.academicSession || '2026 - 2027',
    startDate: '2026-04-01',
    endDate: '2027-03-31'
  };

  const currentActiveSessionName = systemConfig?.academicSession || activeSessionObj.sessionName;

  // Selected student for single promotion
  const selectedStudent = students.find(s => s.id === singleStudentId) || students[0];
  const selectedStudentCurrentClass = classes.find(c => c.id === selectedStudent?.classId);

  // Source students for batch promotion
  const sourceClassStudents = students.filter(s => s.classId === batchSourceClassId);

  // Toggle all students in batch selection
  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === sourceClassStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(sourceClassStudents.map(s => s.id));
    }
  };

  const handleToggleStudent = (id) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Execute Batch Promotion
  const handleExecuteBatchPromotion = (e) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) {
      alert('Khawngaihin promote tur zirlai thlang rawh le.');
      return;
    }

    const targetClass = classes.find(c => c.id === batchTargetClassId);

    const results = batchPromoteStudents(selectedStudentIds, {
      toClassId: batchTargetClassId,
      type: batchPromoType,
      targetSession: batchTargetSession,
      remarks: batchRemarks,
      reason: `Batch class progression from ${classes.find(c => c.id === batchSourceClassId)?.name} to ${targetClass?.name}.`,
      promotedBy: isPrincipal ? 'Dr. Lalthlamuana (Principal)' : 'Lalhmingliani (Vice Principal)',
      effectiveDate: new Date().toISOString().split('T')[0]
    });

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setSuccessMessage(`Zirlai ${results.length} te chu ${targetClass?.name}-ah hlawhtling taka promote an ni e!`);
    setSelectedStudentIds([]);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  // Execute Single Detailed Promotion
  const handleExecuteSinglePromotion = (e) => {
    e.preventDefault();
    if (!singleStudentId || !singleTargetClassId) return;

    const result = promoteStudent(singleStudentId, {
      toClassId: singleTargetClassId,
      newRollNo: singleNewRollNo,
      type: singlePromoType,
      targetSession: singleTargetSession,
      reason: singleReason,
      remarks: singleRemarks,
      promotedBy: singlePromotedBy,
      effectiveDate: singleEffectiveDate
    });

    if (result) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
      setPreviewPromotionRecord(result);
      setSuccessMessage(`Zirlai ${selectedStudent?.firstName} chu ${classes.find(c => c.id === singleTargetClassId)?.name}-ah detail fel tak nen promote a ni e!`);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  // Start New Session Execution
  const handleStartNewSession = (e) => {
    e.preventDefault();
    if (!newSessionForm.sessionName) return;

    const confirmMsg = `Academic Session thar "${newSessionForm.sessionName}" tan i duh chiang chiah em?\n\n• Session liam ta zirlai leh parent-te hi automatic-in an in enroll LO vang.\n• Zirlai te chu class tharah promote emaw re-admit an ngai ang.`;
    if (!window.confirm(confirmMsg)) return;

    const newSess = startNewAcademicSession(newSessionForm);
    setShowNewSessionModal(false);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    setSuccessMessage(`Academic Session thar "${newSess.sessionName}" chu hlawhtling taka hawn a ni ta! Zirlai hlui te chu session thar atan promote theih an ni tawh e.`);
    setTimeout(() => setSuccessMessage(''), 6000);
  };

  // All promotions aggregated across all students
  const allPromotions = students.flatMap(s => (s.promotionHistory || []));
  const filteredPromotions = allPromotions.filter(p => {
    if (!historySearchQuery) return true;
    const q = historySearchQuery.toLowerCase();
    return (
      p.studentName?.toLowerCase().includes(q) ||
      p.admissionNo?.toLowerCase().includes(q) ||
      p.orderNumber?.toLowerCase().includes(q) ||
      p.fromClassName?.toLowerCase().includes(q) ||
      p.toClassName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-purple-400">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-white font-['Outfit']">
                  Academic Sessions &amp; Class Promotion Suite
                </h2>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Active: {currentActiveSessionName}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage academic session turnovers, batch progressions, and mid-stream class advancement dossiers.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SUCCESS TOAST BANNER */}
        {successMessage && (
          <div className="px-6 py-3 bg-emerald-500/15 border-b border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs font-semibold animate-in fade-in duration-200 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB CONTROLS */}
        <div className="px-5 sm:px-6 pt-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 ${
                activeTab === 'sessions'
                  ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Academic Sessions ({academicSessions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('batch_promotion')}
              className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 ${
                activeTab === 'batch_promotion'
                  ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Batch Class Promotion</span>
            </button>

            <button
              onClick={() => setActiveTab('single_promotion')}
              className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 ${
                activeTab === 'single_promotion'
                  ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Individual / Mid-Session Promotion</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 ${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Promotion History ({allPromotions.length})</span>
            </button>
          </div>

          {/* Quick Leadership Admission Badges */}
          <div className="hidden md:flex items-center gap-2 pb-2">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Gates:</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
              onlineAdmissionConfig?.isOpen !== false ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
            }`}>
              Online: {onlineAdmissionConfig?.isOpen !== false ? 'OPEN' : 'CLOSED'}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
              offlineAdmissionConfig?.isOpen !== false ? 'bg-purple-500/20 text-purple-300' : 'bg-rose-500/20 text-rose-300'
            }`}>
              Offline: {offlineAdmissionConfig?.isOpen !== false ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: ACADEMIC SESSIONS & TURNOVER */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              {/* Session Overview Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-950 to-indigo-950/30 border border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Academic Year</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase font-mono">
                      Current Live Session
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white font-['Outfit']">
                    {currentActiveSessionName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Duration: {activeSessionObj.startDate || '2026-04-01'} to {activeSessionObj.endDate || '2027-03-31'} • Total Enrolled Students: {students.filter(s => (s.enrolledSessions || [s.academicSession]).includes(currentActiveSessionName)).length} of {students.length}
                  </p>
                </div>

                {canManage && (
                  <button
                    onClick={() => setShowNewSessionModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Start / Inaugurate New Session</span>
                  </button>
                )}
              </div>

              {/* CRITICAL GOVERNANCE BANNER */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-amber-300 block">
                    Institutional Governance Rule: No Automatic Rollover
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    Academic session hlui a zirlai leh parent/guardian te hi session tharah <strong>automatic-in an in-enroll ngai lo</strong>. Session thar a zirlai an nih chhunzawm theih nan Administration emaw Class Master ten <strong>Class Promotion</strong> emaw <strong>Re-enrollment</strong> an tihfel hmasak a ngai.
                  </p>
                </div>
              </div>

              {/* SESSIONS LIST */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Academic Sessions Register
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {academicSessions.map((sess) => {
                    const isActive = sess.status === 'active';
                    const isCompleted = sess.status === 'completed';
                    const enrolledCount = students.filter(s => (s.enrolledSessions || [s.academicSession]).includes(sess.sessionName)).length;

                    return (
                      <div 
                        key={sess.id}
                        className={`p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                          isActive 
                            ? 'bg-indigo-950/20 border-indigo-500/40 shadow-lg shadow-indigo-500/10' 
                            : 'bg-slate-900/80 border-slate-800'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${
                              isActive 
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                                : isCompleted 
                                ? 'bg-slate-800 text-slate-400 border-slate-700' 
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}>
                              {sess.status}
                            </span>

                            {isActive && (
                              <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Live
                              </span>
                            )}
                          </div>

                          <div>
                            <h5 className="text-lg font-bold text-white font-['Outfit']">
                              {sess.sessionName}
                            </h5>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {sess.startDate} → {sess.endDate}
                            </p>
                          </div>

                          <p className="text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                            {sess.notes || 'Institutional academic period.'}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">
                            Enrolled: <strong className="text-white font-mono">{enrolledCount}</strong>
                          </span>

                          {!isActive && canManage && (
                            <button
                              onClick={() => switchActiveAcademicSession(sess.id)}
                              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                            >
                              Switch to this Session
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BATCH CLASS PROMOTION */}
          {activeTab === 'batch_promotion' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">
                <span className="font-bold">Batch Promotion Guide:</span> Class pakhat atangin zirlai zinga pass emaw promote turte thlang la, class thar leh session thar atan vawikhatah an zaain promote vek rawh.
              </div>

              {/* Class & Target Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    1. Source Class (Kal Lai Mek)
                  </label>
                  <select
                    value={batchSourceClassId}
                    onChange={(e) => {
                      setBatchSourceClassId(e.target.value);
                      setSelectedStudentIds([]);
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.stream ? `(${c.stream.toUpperCase()})` : ''} • Section {c.section}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    2. Target Class (Promote-na Tur)
                  </label>
                  <select
                    value={batchTargetClassId}
                    onChange={(e) => setBatchTargetClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.stream ? `(${c.stream.toUpperCase()})` : ''} • Section {c.section}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    3. Target Academic Session
                  </label>
                  <select
                    value={batchTargetSession}
                    onChange={(e) => setBatchTargetSession(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {academicSessions.map(s => (
                      <option key={s.id} value={s.sessionName}>
                        {s.sessionName} {s.status === 'active' ? '(Current Active)' : `(${s.status})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student Roster Table for Batch Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Students in {classes.find(c => c.id === batchSourceClassId)?.name} ({sourceClassStudents.length})
                    </span>
                    <span className="text-[11px] text-slate-400">
                      • Selected: <strong className="text-indigo-400">{selectedStudentIds.length}</strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition"
                  >
                    {selectedStudentIds.length === sourceClassStudents.length ? (
                      <><CheckSquare className="w-4 h-4" /> Deselect All</>
                    ) : (
                      <><Square className="w-4 h-4" /> Select All ({sourceClassStudents.length})</>
                    )}
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/80">
                    {sourceClassStudents.map(student => {
                      const isSelected = selectedStudentIds.includes(student.id);
                      const isEnrolledInTarget = (student.enrolledSessions || [student.academicSession]).includes(batchTargetSession);

                      return (
                        <div 
                          key={student.id}
                          onClick={() => handleToggleStudent(student.id)}
                          className={`p-3 sm:px-4 flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                            isSelected ? 'bg-indigo-500/10' : 'hover:bg-slate-900/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // Handled by div click
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-0 accent-indigo-600 cursor-pointer"
                            />
                            <img
                              src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">
                                  {student.firstName} {student.lastName}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Roll #{student.rollNo} • Adm: {student.admissionNo}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                Guardian: {student.guardianName} ({student.guardianPhone})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                              student.feeStatus === 'cleared' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              Fees: {student.feeStatus?.toUpperCase()}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              Attd: {student.attendanceRate || 92}%
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {sourceClassStudents.length === 0 && (
                      <div className="p-8 text-center text-xs text-slate-400">
                        He class-ah hian zirlai an awm lo rih e.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Batch Remarks & Execute Button */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Promotion Category
                    </label>
                    <select
                      value={batchPromoType}
                      onChange={(e) => setBatchPromoType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    >
                      <option value="session_advancement">Standard Year-End Session Advancement</option>
                      <option value="board_merit_advancement">MBSE Board Exam Merit Clearance</option>
                      <option value="remedial_conditional_advancement">Conditional Promotion (Remedial Required)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Batch Evaluation Remarks
                    </label>
                    <input
                      type="text"
                      value={batchRemarks}
                      onChange={(e) => setBatchRemarks(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                      placeholder="e.g. Promoted to next class upon clearing annual exams"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleExecuteBatchPromotion}
                    disabled={selectedStudentIds.length === 0}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Promote Selected ({selectedStudentIds.length}) Students to {classes.find(c => c.id === batchTargetClassId)?.name}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INDIVIDUAL / MID-SESSION DETAILED PROMOTION */}
          {activeTab === 'single_promotion' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200">
                <span className="font-bold">Zirlai Mal Promotena &amp; Transfer:</span> Zirlai kal lai mek class atang pawhin detail kimchang (reasons, evaluation marks, remarks, roll no thar, authorizer) nen awlsam takin class dangah a promote theih e.
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Student Dossier Profile */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300">
                      Select Student to Promote / Transfer
                    </label>
                    <select
                      value={singleStudentId}
                      onChange={(e) => {
                        setSingleStudentId(e.target.value);
                        const s = students.find(item => item.id === e.target.value);
                        setSingleNewRollNo(s?.rollNo || '');
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                    >
                      {students.map(s => {
                        const cls = classes.find(c => c.id === s.classId);
                        return (
                          <option key={s.id} value={s.id}>
                            {s.firstName} {s.lastName} ({cls?.name || 'Class'} • Roll #{s.rollNo})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {selectedStudent && (
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedStudent.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                          alt=""
                          className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white">
                            {selectedStudent.firstName} {selectedStudent.lastName}
                          </h4>
                          <span className="text-[11px] text-indigo-400 font-mono block">
                            Adm No: {selectedStudent.admissionNo}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            DOB: {selectedStudent.dob} ({selectedStudent.gender})
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Current Class:</span>
                          <span className="font-bold text-white">
                            {selectedStudentCurrentClass?.name} {selectedStudentCurrentClass?.stream ? `(${selectedStudentCurrentClass.stream.toUpperCase()})` : ''}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Current Roll No:</span>
                          <span className="font-mono font-bold text-cyan-300">#{selectedStudent.rollNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Enrolled Session:</span>
                          <span className="font-mono text-slate-300">{selectedStudent.academicSession || '2026 - 2027'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Fee Status:</span>
                          <span className={`font-bold capitalize ${selectedStudent.feeStatus === 'cleared' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {selectedStudent.feeStatus}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Attendance:</span>
                          <span className="font-mono text-white">{selectedStudent.attendanceRate || 92}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Past Promotions summary */}
                  {selectedStudent?.promotionHistory && selectedStudent.promotionHistory.length > 0 && (
                    <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 space-y-1 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Past Advancement:</span>
                      <p className="text-slate-300">
                        Promoted to {selectedStudent.promotionHistory[0].toClassName} on {selectedStudent.promotionHistory[0].promotedAt}
                      </p>
                    </div>
                  )}
                </div>

                {/* Column 2 & 3: Detailed Promotion Dossier Form */}
                <form onSubmit={handleExecuteSinglePromotion} className="lg:col-span-2 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>Official Promotion &amp; Advancement Order Form</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Target Class (Promote-na Tur) *
                      </label>
                      <select
                        value={singleTargetClassId}
                        onChange={(e) => setSingleTargetClassId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                        required
                      >
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.stream ? `(${c.stream.toUpperCase()})` : ''} • Section {c.section}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        New Assigned Roll Number
                      </label>
                      <input
                        type="text"
                        value={singleNewRollNo}
                        onChange={(e) => setSingleNewRollNo(e.target.value)}
                        placeholder={`e.g. ${selectedStudent?.rollNo || '01'}`}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Target Academic Session *
                      </label>
                      <select
                        value={singleTargetSession}
                        onChange={(e) => setSingleTargetSession(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                        required
                      >
                        {academicSessions.map(s => (
                          <option key={s.id} value={s.sessionName}>
                            {s.sessionName} {s.status === 'active' ? '(Current Active)' : `(${s.status})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Advancement Nature / Category *
                      </label>
                      <select
                        value={singlePromoType}
                        onChange={(e) => setSinglePromoType(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                      >
                        <option value="session_advancement">Standard Year-End Session Advancement</option>
                        <option value="mid_term_accelerated">Accelerated Double Promotion (Merit Skip)</option>
                        <option value="stream_transfer">Stream Realignment / Academic Stream Transfer</option>
                        <option value="special_council_advance">Special Academic Council Administrative Advancement</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Effective Date *
                      </label>
                      <input
                        type="date"
                        value={singleEffectiveDate}
                        onChange={(e) => setSingleEffectiveDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Authorizing Authority *
                      </label>
                      <input
                        type="text"
                        value={singlePromotedBy}
                        onChange={(e) => setSinglePromotedBy(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Academic Reason &amp; Evaluation Basis *
                    </label>
                    <textarea
                      rows={2}
                      value={singleReason}
                      onChange={(e) => setSingleReason(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. Cleared MBSE Board Screening Assessment with 89% aggregate and distinction in Science."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Council Remarks &amp; Promotion Conditions
                    </label>
                    <input
                      type="text"
                      value={singleRemarks}
                      onChange={(e) => setSingleRemarks(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. Regular promotion. Subject to maintaining minimum 75% attendance in new class."
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Promote to {classes.find(c => c.id === singleTargetClassId)?.name} &amp; Issue Order</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: PROMOTION HISTORY & AUDIT TRAIL */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    placeholder="Search by student, admission no, or order no..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  Showing {filteredPromotions.length} of {allPromotions.length} orders
                </span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                <div className="divide-y divide-slate-800/80">
                  {filteredPromotions.map((promo) => (
                    <div key={promo.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/50 transition">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              {promo.studentName}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                              #{promo.orderNumber || 'PROMO-ORDER'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Adm: {promo.admissionNo}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <span className="font-semibold text-slate-400">{promo.fromClassName}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="font-bold text-emerald-400">{promo.toClassName}</span>
                            <span className="text-slate-500 font-mono">• Session: {promo.toSession}</span>
                          </div>

                          <p className="text-[11px] text-slate-400 italic">
                            "{promo.reason}"
                          </p>

                          <div className="text-[10px] text-slate-500 flex items-center gap-2">
                            <span>Authorized: {promo.promotedBy}</span>
                            <span>•</span>
                            <span>Effective: {promo.promotedAt}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setPreviewPromotionRecord(promo)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition shrink-0"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Order</span>
                      </button>
                    </div>
                  ))}

                  {filteredPromotions.length === 0 && (
                    <div className="p-12 text-center text-xs text-slate-400">
                      Promotion order zawn hmuh a awm rih lo.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 px-6 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Mizoram Board of School Education (MBSE) Affiliated Promotion Standard</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* POPUP 1: START NEW ACADEMIC SESSION FORM MODAL */}
      {showNewSessionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <form 
            onSubmit={handleStartNewSession}
            className="w-full max-w-lg p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Start New Academic Session
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowNewSessionModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  New Academic Session Title *
                </label>
                <input
                  type="text"
                  value={newSessionForm.sessionName}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, sessionName: e.target.value })}
                  placeholder="e.g. 2027 - 2028"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newSessionForm.startDate}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newSessionForm.endDate}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Administrative Notes</label>
                <textarea
                  rows={2}
                  value={newSessionForm.notes}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  placeholder="Official session notes..."
                />
              </div>

              {/* Strict Notice */}
              <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Enforced Policy: No Automatic Rollover
                </span>
                <p className="text-[11px] text-amber-200/90 leading-tight">
                  He session thar hi activated anih rualin, session liam ta ami zirlai leh nu/pa te hi automatic-in an in enroll LO vang. Returning students te chu promote emaw re-admit an nih hnuah chauh active session zirlai an ni ang.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewSessionModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Officially Inaugurate Session</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* POPUP 2: PRINTABLE PROMOTION ORDER MODAL */}
      {previewPromotionRecord && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl my-auto bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden p-8 space-y-6">
            <button
              onClick={() => setPreviewPromotionRecord(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition print:hidden"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Official Letterhead */}
            <div className="text-center pb-4 border-b-2 border-indigo-900/30 space-y-1">
              <div className="flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest text-indigo-900">
                <span>{systemConfig?.affiliationNo || 'MBSE-HSS-LGL-0421'}</span>
                <span>•</span>
                <span>Govt Recognized</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 font-['Outfit']">
                {systemConfig?.schoolName || 'ONE HEART ACADEMY (OHA)'}
              </h2>
              <p className="text-xs text-slate-600">
                {systemConfig?.address || 'Lunglawn, Lunglei, Mizoram - 796701'}
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-900 text-xs font-extrabold uppercase rounded-full tracking-wider">
                Official Class Promotion &amp; Advancement Order
              </span>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Order Number</span>
                <p className="font-mono font-bold text-slate-900 text-sm">{previewPromotionRecord.orderNumber || 'PROMO-ORDER'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Effective Date</span>
                <p className="font-bold text-slate-900 text-sm">{previewPromotionRecord.promotedAt || new Date().toISOString().split('T')[0]}</p>
              </div>
            </div>

            {/* Student Dossier Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-100 p-2.5 font-bold text-slate-800 border-b border-slate-200">
                Student Advancement Particulars
              </div>
              <div className="p-4 space-y-2.5">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Student Full Name:</span>
                  <span className="font-bold text-slate-900">{previewPromotionRecord.studentName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Admission Number:</span>
                  <span className="font-mono font-bold text-slate-900">{previewPromotionRecord.admissionNo}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Previous Class &amp; Roll:</span>
                  <span className="font-semibold text-slate-800">{previewPromotionRecord.fromClassName} (Roll #{previewPromotionRecord.fromRollNo})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-bold text-indigo-900">Promoted Target Class:</span>
                  <span className="font-black text-indigo-950 text-sm">{previewPromotionRecord.toClassName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Assigned New Roll No:</span>
                  <span className="font-mono font-bold text-indigo-900">#{previewPromotionRecord.newRollNo}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Target Academic Session:</span>
                  <span className="font-mono font-bold text-slate-900">{previewPromotionRecord.toSession}</span>
                </div>
                <div className="py-1">
                  <span className="text-slate-500 block mb-1">Academic Evaluation &amp; Basis:</span>
                  <p className="font-medium text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 italic">
                    "{previewPromotionRecord.reason}"
                  </p>
                </div>
                {previewPromotionRecord.remarks && (
                  <div className="py-1">
                    <span className="text-slate-500 block mb-1">Council Remarks:</span>
                    <p className="font-medium text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      {previewPromotionRecord.remarks}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code & Signatures */}
            <div className="pt-4 flex items-end justify-between gap-6 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <QRCodeSVG 
                    value={`https://oha.edu.in/verify/promotion/${previewPromotionRecord.orderNumber}`}
                    size={64}
                    level="M"
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-mono block">MBSE Verified Order</span>
                  <span className="text-[9px] text-slate-400 block">Scan to authenticate record</span>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="w-36 border-b border-slate-400 mb-1"></div>
                <span className="font-bold text-slate-900 block">{previewPromotionRecord.promotedBy || 'Principal / Academic Dean'}</span>
                <span className="text-[10px] text-slate-500 block">Authorizing Officer &amp; Institutional Seal</span>
              </div>
            </div>

            {/* Print Button (Screen only) */}
            <div className="pt-4 flex justify-end gap-2 print:hidden border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
