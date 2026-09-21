import React, { useState } from 'react';
import {
  Layers,
  BookOpen,
  Award,
  DollarSign,
  FileText,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
  Save,
  AlertTriangle,
  School,
  GraduationCap,
  Users,
  ShieldCheck,
  Tag,
  Eye,
  Sliders,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';

export default function InAppMasterConfigStudio() {
  const {
    classes,
    addClass,
    updateClass,
    deleteClass,
    staff,
    students,
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    resetSubjects,
    gradingScales,
    addGradeScale,
    updateGradeScale,
    deleteGradeScale,
    resetGradeScales,
    feeHeads,
    addFeeHead,
    updateFeeHead,
    deleteFeeHead,
    resetFeeHeads,
    documentTemplates,
    updateDocumentTemplates,
    resetDocumentTemplates,
    systemNomenclature,
    updateSystemNomenclature,
    resetSystemNomenclature,
    customStudentFields,
    addCustomStudentField,
    deleteCustomStudentField,
    systemConfig
  } = useSchool();

  const [activeSubTab, setActiveSubTab] = useState('classes'); // 'classes', 'subjects', 'grading', 'fee_heads', 'documents', 'nomenclature'
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- Modal States ---
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classForm, setClassForm] = useState({
    name: '',
    level: '1',
    stream: '',
    section: 'A',
    roomNumber: '',
    academicYear: '2026-2027',
    teacherName: '',
    classTeacherId: ''
  });

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    stream: 'all',
    category: 'Core Curriculum',
    fullMarks: 100,
    passMarks: 40,
    classes: []
  });

  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    grade: '',
    minScore: 0,
    maxScore: 100,
    gradePoint: 10.0,
    remark: '',
    color: '#6366f1'
  });

  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [feeForm, setFeeForm] = useState({
    name: '',
    code: '',
    frequency: 'monthly',
    defaultAmount: 1000,
    mandatory: true,
    description: ''
  });

  const [customFieldForm, setCustomFieldForm] = useState({
    label: '',
    key: '',
    type: 'text',
    required: false
  });

  // Local state for live editable document templates
  const [localDocTemplates, setLocalDocTemplates] = useState(() => documentTemplates || {});
  const [activeDocType, setActiveDocType] = useState('transferCertificate'); // 'transferCertificate' | 'characterCertificate'

  // Local state for nomenclature
  const [localNomenclature, setLocalNomenclature] = useState(() => systemNomenclature || {});

  // -------------------------------------------------------------
  // CLASS HANDLERS
  // -------------------------------------------------------------
  const openAddClass = () => {
    setEditingClass(null);
    setClassForm({
      name: '',
      level: '1',
      stream: '',
      section: 'A',
      roomNumber: `R-${Math.floor(Math.random() * 800 + 100)}`,
      academicYear: '2026-2027',
      teacherName: '',
      classTeacherId: ''
    });
    setClassModalOpen(true);
  };

  const openEditClass = (cls) => {
    setEditingClass(cls);
    setClassForm({
      name: cls.name || '',
      level: cls.level || '1',
      stream: cls.stream || '',
      section: cls.section || 'A',
      roomNumber: cls.roomNumber || '',
      academicYear: cls.academicYear || '2026-2027',
      teacherName: cls.teacherName || '',
      classTeacherId: cls.classTeacherId || ''
    });
    setClassModalOpen(true);
  };

  const handleSaveClass = (e) => {
    e.preventDefault();
    if (!classForm.name.trim()) return;

    const selectedTeacher = staff.find(s => s.id === classForm.classTeacherId);
    const resolvedTeacherName = selectedTeacher ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}` : (classForm.teacherName || 'Unassigned');

    const payload = {
      ...classForm,
      stream: classForm.stream || null,
      teacherName: resolvedTeacherName
    };

    if (editingClass) {
      updateClass(editingClass.id, payload);
      showToast(`Class "${payload.name}" updated successfully!`);
    } else {
      addClass(payload);
      showToast(`New Class "${payload.name}" created and added to school!`);
    }
    setClassModalOpen(false);
  };

  const handleDeleteClass = (cls) => {
    const studentCount = students.filter(s => s.classId === cls.id).length;
    const confirmMsg = studentCount > 0
      ? `Class "${cls.name}" contains ${studentCount} enrolled students. Are you sure you want to delete it?`
      : `Are you sure you want to delete class "${cls.name}"?`;
    
    if (window.confirm(confirmMsg)) {
      deleteClass(cls.id);
      showToast(`Class "${cls.name}" deleted.`);
    }
  };

  // -------------------------------------------------------------
  // SUBJECT HANDLERS
  // -------------------------------------------------------------
  const openAddSubject = () => {
    setEditingSubject(null);
    setSubjectForm({
      name: '',
      code: `SUB-${Math.floor(Math.random() * 800 + 100)}`,
      stream: 'all',
      category: 'General Subject',
      fullMarks: 100,
      passMarks: 40,
      classes: []
    });
    setSubjectModalOpen(true);
  };

  const openEditSubject = (sub) => {
    setEditingSubject(sub);
    setSubjectForm({
      name: sub.name || '',
      code: sub.code || '',
      stream: sub.stream || 'all',
      category: sub.category || 'Core Curriculum',
      fullMarks: sub.fullMarks || 100,
      passMarks: sub.passMarks || 40,
      classes: sub.classes || []
    });
    setSubjectModalOpen(true);
  };

  const handleSaveSubject = (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) return;

    if (editingSubject) {
      updateSubject(editingSubject.id, subjectForm);
      showToast(`Subject "${subjectForm.name}" updated!`);
    } else {
      addSubject(subjectForm);
      showToast(`New Subject "${subjectForm.name}" created!`);
    }
    setSubjectModalOpen(false);
  };

  // -------------------------------------------------------------
  // GRADING SCALE HANDLERS
  // -------------------------------------------------------------
  const openAddGrade = () => {
    setEditingGrade(null);
    setGradeForm({
      grade: '',
      minScore: 0,
      maxScore: 100,
      gradePoint: 8.0,
      remark: 'Good',
      color: '#8b5cf6'
    });
    setGradeModalOpen(true);
  };

  const openEditGrade = (grd) => {
    setEditingGrade(grd);
    setGradeForm({
      grade: grd.grade || '',
      minScore: grd.minScore || 0,
      maxScore: grd.maxScore || 100,
      gradePoint: grd.gradePoint || 0,
      remark: grd.remark || '',
      color: grd.color || '#6366f1'
    });
    setGradeModalOpen(true);
  };

  const handleSaveGrade = (e) => {
    e.preventDefault();
    if (!gradeForm.grade.trim()) return;

    if (editingGrade) {
      updateGradeScale(editingGrade.id, gradeForm);
      showToast(`Grade tier ${gradeForm.grade} updated!`);
    } else {
      addGradeScale(gradeForm);
      showToast(`Grade tier ${gradeForm.grade} added!`);
    }
    setGradeModalOpen(false);
  };

  // -------------------------------------------------------------
  // FEE HEAD HANDLERS
  // -------------------------------------------------------------
  const openAddFee = () => {
    setEditingFee(null);
    setFeeForm({
      name: '',
      code: `FEE_${Date.now().toString().slice(-4)}`,
      frequency: 'monthly',
      defaultAmount: 1500,
      mandatory: true,
      description: ''
    });
    setFeeModalOpen(true);
  };

  const openEditFee = (fee) => {
    setEditingFee(fee);
    setFeeForm({
      name: fee.name || '',
      code: fee.code || '',
      frequency: fee.frequency || 'monthly',
      defaultAmount: fee.defaultAmount || 0,
      mandatory: fee.mandatory ?? true,
      description: fee.description || ''
    });
    setFeeModalOpen(true);
  };

  const handleSaveFee = (e) => {
    e.preventDefault();
    if (!feeForm.name.trim()) return;

    if (editingFee) {
      updateFeeHead(editingFee.id, feeForm);
      showToast(`Fee head "${feeForm.name}" updated!`);
    } else {
      addFeeHead(feeForm);
      showToast(`Fee head "${feeForm.name}" registered!`);
    }
    setFeeModalOpen(false);
  };

  // -------------------------------------------------------------
  // DOCUMENT TEMPLATES HANDLERS
  // -------------------------------------------------------------
  const handleSaveTemplates = () => {
    updateDocumentTemplates(localDocTemplates);
    showToast('Official Document & Certificate Templates saved successfully!');
  };

  const handleResetTemplates = () => {
    if (window.confirm('Reset all document templates to official system defaults?')) {
      resetDocumentTemplates();
      setLocalDocTemplates(documentTemplates);
      showToast('Document templates reset to default.');
    }
  };

  // -------------------------------------------------------------
  // NOMENCLATURE HANDLERS
  // -------------------------------------------------------------
  const handleSaveNomenclature = () => {
    updateSystemNomenclature(localNomenclature);
    showToast('Institutional Terminology & Roles saved!');
  };

  const handleResetNomenclature = () => {
    if (window.confirm('Reset all terminology and labels to defaults?')) {
      resetSystemNomenclature();
      setLocalNomenclature(systemNomenclature);
      showToast('Terminology reset to default.');
    }
  };

  // Custom Field addition
  const handleAddCustomField = (e) => {
    e.preventDefault();
    if (!customFieldForm.label.trim()) return;
    const generatedKey = customFieldForm.key.trim() || customFieldForm.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    addCustomStudentField({
      ...customFieldForm,
      key: generatedKey
    });
    setCustomFieldForm({ label: '', key: '', type: 'text', required: false });
    showToast(`Custom student attribute "${customFieldForm.label}" created!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-950 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Zero External Dependency Master
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live In-App Architecture
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Sliders className="w-7 h-7 text-indigo-400" />
              Institutional Master Architecture Studio
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Software pawn (IDE, code editors, command line) a kal miah lova school pumpui inrelbawlna—Class, Subjects, Grading scale, Fee types, Certificates leh Terminology—a chhung atanga tih danglam leh siam chawp vekna.
            </p>
          </div>
        </div>

        {/* Studio Sub-Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto mt-6 pt-4 border-t border-slate-800/80 scrollbar-none">
          <button
            onClick={() => setActiveSubTab('classes')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeSubTab === 'classes'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <School className="w-4 h-4" />
            <span>Classes &amp; Sections</span>
            <span className="px-1.5 py-0.2 rounded-full text-xs bg-indigo-500/30 text-indigo-200">
              {classes?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('subjects')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeSubTab === 'subjects'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Curriculum &amp; Subjects</span>
            <span className="px-1.5 py-0.2 rounded-full text-xs bg-indigo-500/30 text-indigo-200">
              {subjects?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('grading')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeSubTab === 'grading'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Grading Framework</span>
            <span className="px-1.5 py-0.2 rounded-full text-xs bg-indigo-500/30 text-indigo-200">
              {gradingScales?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('fee_heads')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeSubTab === 'fee_heads'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Fee Heads &amp; Structure</span>
            <span className="px-1.5 py-0.2 rounded-full text-xs bg-indigo-500/30 text-indigo-200">
              {feeHeads?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('documents')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeSubTab === 'documents'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Certificate &amp; Document Designer</span>
          </button>

          <button
            onClick={() => setActiveSubTab('nomenclature')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeSubTab === 'nomenclature'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Terminology &amp; Custom Fields</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB 1: CLASSES & SECTIONS MASTER                      */}
      {/* ========================================================= */}
      {activeSubTab === 'classes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <School className="w-5 h-5 text-indigo-400" />
                Classes &amp; Sections Directory
              </h3>
              <p className="text-xs text-slate-400">
                School chhunga class awm zawng zawng (Nursery thleng Class 12). A thar siam belh la, zirtirtu ruat la, room number siam rem rawh.
              </p>
            </div>
            <button
              onClick={openAddClass}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Class</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => {
              const enrolled = students.filter(s => s.classId === cls.id).length;
              return (
                <div
                  key={cls.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/40 transition flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">{cls.name}</h4>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 uppercase">
                            Sec {cls.section || 'A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {cls.stream ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                              {cls.stream}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
                              General Secondary
                            </span>
                          )}
                          <span className="text-xs text-slate-400">Room {cls.roomNumber || 'TBD'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => openEditClass(cls)}
                          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 rounded-lg transition"
                          title="Edit Class Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls)}
                          className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition"
                          title="Delete Class"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400">Class Master:</span>
                        <span className="font-semibold text-white truncate max-w-[150px]">
                          {cls.teacherName || 'Not Assigned'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400">Class Leader:</span>
                        <span className="text-amber-300 truncate max-w-[150px]">
                          {cls.classLeaderName || 'Not Appointed'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400">Enrolled Students:</span>
                        <span className="font-bold text-emerald-400">{enrolled} students</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>ID: {cls.id}</span>
                    <span className="text-slate-400">AY: {cls.academicYear || '2026-2027'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: SUBJECTS & CURRICULUM MASTER                   */}
      {/* ========================================================= */}
      {activeSubTab === 'subjects' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Subjects &amp; Academic Curriculum Master
              </h3>
              <p className="text-xs text-slate-400">
                Subject thar dah belhna, pass mark leh full mark siam remna, leh stream hrang hrang (Science, Arts, Commerce) a subject insemna.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (window.confirm('Reset subjects to MBSE standard curriculum?')) {
                    resetSubjects();
                    showToast('Curriculum reset to MBSE standard subjects.');
                  }
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
              <button
                onClick={openAddSubject}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Subject</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(subjects || []).map((sub) => (
              <div
                key={sub.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/40 transition flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{sub.name}</h4>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold">
                          {sub.code}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 uppercase">
                          {sub.stream}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => openEditSubject(sub)}
                        className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 rounded-lg transition"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete subject "${sub.name}"?`)) {
                            deleteSubject(sub.id);
                            showToast(`Subject "${sub.name}" deleted.`);
                          }
                        }}
                        className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Category:</span>
                      <span className="text-slate-200">{sub.category || 'Core'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Mark Framework:</span>
                      <span className="font-bold text-emerald-400">
                        Full: {sub.fullMarks} / Pass: {sub.passMarks}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Assigned Classes:</span>
                      <span className="text-indigo-300 font-semibold">
                        {sub.classes?.length ? `${sub.classes.length} classes` : 'Universal'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>ID: {sub.id}</span>
                  <span className="capitalize">{sub.stream} Stream</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 3: GRADING FRAMEWORK MASTER                       */}
      {/* ========================================================= */}
      {activeSubTab === 'grading' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                Grading Framework &amp; Score Ranges (MBSE Standard)
              </h3>
              <p className="text-xs text-slate-400">
                Grade tier (A1, A2, B1...) score threshold, Grade Point (GPA), remark leh rawng khawih danglamna.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (window.confirm('Reset grading scales to MBSE standards?')) {
                    resetGradeScales();
                    showToast('Grading scale reset to MBSE standard.');
                  }
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
              <button
                onClick={openAddGrade}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Grade Tier</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(gradingScales || []).map((grd) => (
              <div
                key={grd.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/40 transition flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-lg"
                        style={{ backgroundColor: grd.color || '#6366f1' }}
                      >
                        {grd.grade}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400">GPA Point</span>
                        <h4 className="text-base font-bold text-white">{grd.gradePoint?.toFixed(1)}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => openEditGrade(grd)}
                        className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 rounded-lg transition"
                        title="Edit Grade"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete grade tier "${grd.grade}"?`)) {
                            deleteGradeScale(grd.id);
                            showToast(`Grade tier "${grd.grade}" deleted.`);
                          }
                        }}
                        className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition"
                        title="Delete Grade"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Score Range:</span>
                      <span className="font-bold text-emerald-400">
                        {grd.minScore}% - {grd.maxScore}%
                      </span>
                    </div>
                    <div className="flex items-start justify-between text-slate-300 gap-2">
                      <span className="text-slate-400 shrink-0">Official Remark:</span>
                      <span className="text-right text-slate-200 font-medium truncate">
                        {grd.remark}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>ID: {grd.id}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: grd.color }} />
                    {grd.color}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 4: FEE HEADS & FINANCIAL STRUCTURE                */}
      {/* ========================================================= */}
      {activeSubTab === 'fee_heads' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-400" />
                Fee Heads &amp; Financial Master
              </h3>
              <p className="text-xs text-slate-400">
                School fee chi hrang hrang (Tuition fee, Admission, Exam fee, Practical lab fee, Bus, Hostel mess) dah belhna leh a man bitukna.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (window.confirm('Reset fee heads to standard defaults?')) {
                    resetFeeHeads();
                    showToast('Fee heads reset to defaults.');
                  }
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
              <button
                onClick={openAddFee}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create Fee Head</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(feeHeads || []).map((fee) => (
              <div
                key={fee.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/40 transition flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{fee.name}</h4>
                        {fee.mandatory ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Compulsory
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                            Optional
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold">
                          {fee.code}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 capitalize">
                          {fee.frequency}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => openEditFee(fee)}
                        className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 rounded-lg transition"
                        title="Edit Fee Head"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete fee head "${fee.name}"?`)) {
                            deleteFeeHead(fee.id);
                            showToast(`Fee head "${fee.name}" deleted.`);
                          }
                        }}
                        className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition"
                        title="Delete Fee Head"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Default Amount:</span>
                      <span className="text-lg font-black text-emerald-400">
                        ₹{Number(fee.defaultAmount || 0).toLocaleString()}
                      </span>
                    </div>
                    {fee.description && (
                      <p className="text-slate-400 text-xs line-clamp-2 mt-1">
                        {fee.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>ID: {fee.id}</span>
                  <span className="capitalize">{fee.frequency} billing</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 5: CERTIFICATES & DOCUMENT DESIGNER               */}
      {/* ========================================================= */}
      {activeSubTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Certificate &amp; Official Document Templates Designer
              </h3>
              <p className="text-xs text-slate-400">
                Transfer Certificate (TC) leh Character Certificate thu, header, signature leh placeholders ({'{{studentName}}'}, {'{{class}}'}, {'{{admissionNo}}'}) khawih danglamna.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetTemplates}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
              <button
                onClick={handleSaveTemplates}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save All Templates</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveDocType('transferCertificate')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeDocType === 'transferCertificate'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Transfer Certificate (TC)
            </button>
            <button
              onClick={() => setActiveDocType('characterCertificate')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeDocType === 'characterCertificate'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Bonafide &amp; Character Certificate
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor form */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Edit Template Content
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Header Title
                </label>
                <input
                  type="text"
                  value={localDocTemplates[activeDocType]?.header || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocalDocTemplates(prev => ({
                      ...prev,
                      [activeDocType]: { ...prev[activeDocType], header: val }
                    }));
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sub-Header / Affiliation Line
                </label>
                <input
                  type="text"
                  value={localDocTemplates[activeDocType]?.subHeader || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocalDocTemplates(prev => ({
                      ...prev,
                      [activeDocType]: { ...prev[activeDocType], subHeader: val }
                    }));
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Body Paragraph Template
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Use placeholders: {'{{studentName}}'}, {'{{class}}'}, {'{{guardianName}}'}, {'{{admissionNo}}'}, {'{{rollNo}}'}
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={localDocTemplates[activeDocType]?.bodyTemplate || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocalDocTemplates(prev => ({
                      ...prev,
                      [activeDocType]: { ...prev[activeDocType], bodyTemplate: val }
                    }));
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-indigo-500 focus:outline-none font-sans leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Left Signatory Title
                  </label>
                  <input
                    type="text"
                    value={localDocTemplates[activeDocType]?.signatoryLeft || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocalDocTemplates(prev => ({
                        ...prev,
                        [activeDocType]: { ...prev[activeDocType], signatoryLeft: val }
                      }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Right Signatory Title
                  </label>
                  <input
                    type="text"
                    value={localDocTemplates[activeDocType]?.signatoryRight || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocalDocTemplates(prev => ({
                        ...prev,
                        [activeDocType]: { ...prev[activeDocType], signatoryRight: val }
                      }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Live Visual Document Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Eye className="w-4 h-4" />
                  Live Certificate Preview
                </h4>

                <div className="bg-white text-slate-900 rounded-xl p-8 shadow-2xl border-4 border-double border-indigo-900 font-serif relative">
                  <div className="text-center border-b-2 border-indigo-900/40 pb-4 mb-4">
                    <h3 className="text-lg font-black tracking-wider text-indigo-950 uppercase">
                      {systemConfig?.schoolName || 'One Heart Academy'}
                    </h3>
                    <p className="text-xs text-slate-600 italic">
                      {systemConfig?.address || 'Lunglawn, Lunglei, Mizoram'}
                    </p>
                    <h4 className="text-sm font-bold mt-2 text-indigo-900 uppercase underline">
                      {localDocTemplates[activeDocType]?.header || 'OFFICIAL CERTIFICATE'}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                      {localDocTemplates[activeDocType]?.subHeader || ''}
                    </p>
                  </div>

                  <div className="text-xs leading-relaxed text-slate-800 space-y-3 font-sans py-2">
                    <p>
                      {(localDocTemplates[activeDocType]?.bodyTemplate || '')
                        .replace(/\{\{studentName\}\}/g, 'Lalrinsanga Sailo')
                        .replace(/\{\{guardianName\}\}/g, 'Lalthanzuala Sailo')
                        .replace(/\{\{admissionNo\}\}/g, 'MZ-2026-0101')
                        .replace(/\{\{rollNo\}\}/g, '01')
                        .replace(/\{\{class\}\}/g, 'Class 12 - Science')
                        .replace(/\{\{admissionDate\}\}/g, '01-Apr-2025')
                        .replace(/\{\{schoolName\}\}/g, systemConfig?.schoolName || 'One Heart Academy')
                        .replace(/\{\{address\}\}/g, 'Lunglawn, Lunglei, Mizoram')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-12 mt-4 text-[11px] font-sans font-bold text-slate-800 border-t border-slate-200">
                    <div className="text-center">
                      <div className="w-28 border-b border-slate-400 mb-1" />
                      <span>{localDocTemplates[activeDocType]?.signatoryLeft || 'Class Teacher'}</span>
                    </div>
                    <div className="text-center">
                      <div className="w-28 border-b border-slate-400 mb-1" />
                      <span>{localDocTemplates[activeDocType]?.signatoryRight || 'Principal'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mt-4 text-center">
                This preview shows mock student data substituted into your customized template fields in real time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 6: NOMENCLATURE & CUSTOM STUDENT FIELDS           */}
      {/* ========================================================= */}
      {activeSubTab === 'nomenclature' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-400" />
                Terminology, Labels &amp; Custom Student Fields
              </h3>
              <p className="text-xs text-slate-400">
                School official nihna leh designation (Principal, Vice Principal, Class Master, Hostel Warden) thlakna leh Student profile a extra fields siamna.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetNomenclature}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
              <button
                onClick={handleSaveNomenclature}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save Terminology</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Nomenclature Editor */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Institutional Designations &amp; Labels
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Head of Institution Designation
                </label>
                <input
                  type="text"
                  value={localNomenclature.institutionHead || ''}
                  onChange={(e) => setLocalNomenclature(p => ({ ...p, institutionHead: e.target.value }))}
                  placeholder="e.g. Principal & Head of Institution"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Academic Dean / Second-in-Charge
                </label>
                <input
                  type="text"
                  value={localNomenclature.academicDean || ''}
                  onChange={(e) => setLocalNomenclature(p => ({ ...p, academicDean: e.target.value }))}
                  placeholder="e.g. Vice Principal / Academic Dean"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Class Teacher / Class Master Title
                </label>
                <input
                  type="text"
                  value={localNomenclature.classMentor || ''}
                  onChange={(e) => setLocalNomenclature(p => ({ ...p, classMentor: e.target.value }))}
                  placeholder="e.g. Class Teacher / Class Master"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hostel Warden / Residential Head
                </label>
                <input
                  type="text"
                  value={localNomenclature.boardingWarden || ''}
                  onChange={(e) => setLocalNomenclature(p => ({ ...p, boardingWarden: e.target.value }))}
                  placeholder="e.g. Hostel Superintendent / Warden"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Academic Term Label
                </label>
                <input
                  type="text"
                  value={localNomenclature.termDivision || ''}
                  onChange={(e) => setLocalNomenclature(p => ({ ...p, termDivision: e.target.value }))}
                  placeholder="e.g. Term Examination / Semester"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Custom Student Fields Builder */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" />
                Dynamic Student Profile Fields Builder
              </h4>
              <p className="text-xs text-slate-400">
                Database khawih ngai lova student profile ah extra data (Aadhaar No, MBSE Reg No, Bus stop etc.) ziah belhna fields siam chawp rawh.
              </p>

              <form onSubmit={handleAddCustomField} className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Field Label</label>
                    <input
                      type="text"
                      value={customFieldForm.label}
                      onChange={(e) => setCustomFieldForm(p => ({ ...p, label: e.target.value }))}
                      placeholder="e.g. Aadhaar Card No"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Field Type</label>
                    <select
                      value={customFieldForm.type}
                      onChange={(e) => setCustomFieldForm(p => ({ ...p, type: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="text">Text Input</option>
                      <option value="number">Numeric</option>
                      <option value="date">Date</option>
                      <option value="boolean">Yes / No Toggle</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customFieldForm.required}
                      onChange={(e) => setCustomFieldForm(p => ({ ...p, required: e.target.checked }))}
                      className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <span>Mandatory during student admission</span>
                  </label>

                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Attribute</span>
                  </button>
                </div>
              </form>

              {/* List existing custom fields */}
              <div className="space-y-2 mt-4">
                <h5 className="text-xs font-bold text-slate-300">Active Custom Fields ({customStudentFields?.length || 0}):</h5>
                {(!customStudentFields || customStudentFields.length === 0) ? (
                  <p className="text-xs text-slate-500 italic">No custom fields created yet.</p>
                ) : (
                  customStudentFields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200"
                    >
                      <div>
                        <span className="font-bold text-white">{field.label}</span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          <span>Key: <code>{field.key}</code></span>
                          <span>•</span>
                          <span className="capitalize">{field.type}</span>
                          {field.required && (
                            <span className="text-rose-400 font-semibold">• Mandatory</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete custom field "${field.label}"?`)) {
                            deleteCustomStudentField(field.id);
                            showToast(`Custom field "${field.label}" deleted.`);
                          }
                        }}
                        className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT CLASS                                   */}
      {/* ========================================================= */}
      {classModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <School className="w-5 h-5 text-indigo-400" />
              {editingClass ? 'Edit Class Details' : 'Create New Class'}
            </h3>

            <form onSubmit={handleSaveClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Class Display Name *</label>
                <input
                  type="text"
                  value={classForm.name}
                  onChange={(e) => setClassForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Class 11 - Computer Science"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Section</label>
                  <input
                    type="text"
                    value={classForm.section}
                    onChange={(e) => setClassForm(p => ({ ...p, section: e.target.value }))}
                    placeholder="e.g. A"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Room Number</label>
                  <input
                    type="text"
                    value={classForm.roomNumber}
                    onChange={(e) => setClassForm(p => ({ ...p, roomNumber: e.target.value }))}
                    placeholder="e.g. S-501"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Stream</label>
                  <select
                    value={classForm.stream}
                    onChange={(e) => setClassForm(p => ({ ...p, stream: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">None (Primary / Secondary)</option>
                    <option value="science">Science</option>
                    <option value="arts">Arts</option>
                    <option value="commerce">Commerce</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={classForm.academicYear}
                    onChange={(e) => setClassForm(p => ({ ...p, academicYear: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assign Class Master / Teacher</label>
                <select
                  value={classForm.classTeacherId}
                  onChange={(e) => setClassForm(p => ({ ...p, classTeacherId: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Select a Faculty Member</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.department || s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setClassModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition"
                >
                  {editingClass ? 'Update Class' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT SUBJECT                                 */}
      {/* ========================================================= */}
      {subjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </h3>

            <form onSubmit={handleSaveSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Subject Name *</label>
                <input
                  type="text"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Advanced Mathematics"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Subject Code *</label>
                  <input
                    type="text"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm(p => ({ ...p, code: e.target.value }))}
                    placeholder="e.g. MTH-201"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Stream</label>
                  <select
                    value={subjectForm.stream}
                    onChange={(e) => setSubjectForm(p => ({ ...p, stream: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="all">Universal / All Streams</option>
                    <option value="science">Science</option>
                    <option value="arts">Arts</option>
                    <option value="commerce">Commerce</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Full Marks</label>
                  <input
                    type="number"
                    value={subjectForm.fullMarks}
                    onChange={(e) => setSubjectForm(p => ({ ...p, fullMarks: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Pass Marks</label>
                  <input
                    type="number"
                    value={subjectForm.passMarks}
                    onChange={(e) => setSubjectForm(p => ({ ...p, passMarks: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  value={subjectForm.category}
                  onChange={(e) => setSubjectForm(p => ({ ...p, category: e.target.value }))}
                  placeholder="e.g. STEM Core, Humanities, Language"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSubjectModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition"
                >
                  {editingSubject ? 'Update Subject' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT GRADE                                   */}
      {/* ========================================================= */}
      {gradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              {editingGrade ? 'Edit Grade Tier' : 'Add Grade Tier'}
            </h3>

            <form onSubmit={handleSaveGrade} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Grade Letter *</label>
                  <input
                    type="text"
                    value={gradeForm.grade}
                    onChange={(e) => setGradeForm(p => ({ ...p, grade: e.target.value }))}
                    placeholder="e.g. A1"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Grade Point (GPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={gradeForm.gradePoint}
                    onChange={(e) => setGradeForm(p => ({ ...p, gradePoint: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Min Score (%)</label>
                  <input
                    type="number"
                    value={gradeForm.minScore}
                    onChange={(e) => setGradeForm(p => ({ ...p, minScore: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Max Score (%)</label>
                  <input
                    type="number"
                    value={gradeForm.maxScore}
                    onChange={(e) => setGradeForm(p => ({ ...p, maxScore: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Official Qualitative Remark</label>
                <input
                  type="text"
                  value={gradeForm.remark}
                  onChange={(e) => setGradeForm(p => ({ ...p, remark: e.target.value }))}
                  placeholder="e.g. Outstanding Performance"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Badge Color Hex</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={gradeForm.color}
                    onChange={(e) => setGradeForm(p => ({ ...p, color: e.target.value }))}
                    className="w-10 h-10 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={gradeForm.color}
                    onChange={(e) => setGradeForm(p => ({ ...p, color: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setGradeModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition"
                >
                  {editingGrade ? 'Update Grade' : 'Add Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT FEE HEAD                                */}
      {/* ========================================================= */}
      {feeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-400" />
              {editingFee ? 'Edit Fee Head' : 'Create Fee Head'}
            </h3>

            <form onSubmit={handleSaveFee} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Fee Head Name *</label>
                <input
                  type="text"
                  value={feeForm.name}
                  onChange={(e) => setFeeForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Science Laboratory Maintenance"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Fee Code *</label>
                  <input
                    type="text"
                    value={feeForm.code}
                    onChange={(e) => setFeeForm(p => ({ ...p, code: e.target.value }))}
                    placeholder="e.g. LAB_FEE"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Billing Frequency</label>
                  <select
                    value={feeForm.frequency}
                    onChange={(e) => setFeeForm(p => ({ ...p, frequency: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="term">Per Term</option>
                    <option value="annual">Annual</option>
                    <option value="one_time">One Time</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Default Amount (₹) *</label>
                  <input
                    type="number"
                    value={feeForm.defaultAmount}
                    onChange={(e) => setFeeForm(p => ({ ...p, defaultAmount: e.target.value }))}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={feeForm.mandatory}
                      onChange={(e) => setFeeForm(p => ({ ...p, mandatory: e.target.checked }))}
                      className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <span>Mandatory Fee</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={feeForm.description}
                  onChange={(e) => setFeeForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Purpose of this fee head..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setFeeModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition"
                >
                  {editingFee ? 'Update Fee Head' : 'Create Fee Head'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
