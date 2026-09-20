import React, { useState, useMemo } from 'react';
import {
  GradeRecord,
  FirestoreStudent,
  SchoolClass,
  SubjectScore,
  GradeStage,
  StreamClassification,
  AssessmentCategory,
} from '../types';
import { addDocument, updateDocument, deleteDocument } from '../lib/firebase';
import { ReportCardModal } from './ReportCardModal';
import {
  getCurriculumForClass,
  calculateCompositeSubjectScore,
  calculateMBSEGrade,
  STAGES_CONFIG,
  STREAMS_LIST,
  detectStageAndStreamFromClass,
  SubjectConfig,
} from '../data/curriculumSubjects';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  FileText,
  Award,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Layers,
  BookOpen,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { exportGradeSheetsData } from '../lib/exportUtils';

interface GradebookManagerProps {
  grades: GradeRecord[];
  students: FirestoreStudent[];
  classes: SchoolClass[];
}

export const GradebookManager: React.FC<GradebookManagerProps> = ({
  grades,
  students,
  classes,
}) => {
  // Navigation & Filtering States
  const [selectedStage, setSelectedStage] = useState<GradeStage | 'All'>('All');
  const [selectedStream, setSelectedStream] = useState<StreamClassification | 'All'>('All');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>('Term 1 (Half Yearly Exam 2026)');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [assessmentView, setAssessmentView] = useState<'Composite' | 'ClassTest' | 'Examination'>('Composite');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Modal States
  const [viewReportCard, setViewReportCard] = useState<GradeRecord | null>(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState<boolean>(false);
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);

  // Mark Entry Form State
  const [formStudentId, setFormStudentId] = useState<string>('');
  const [formExamTerm, setFormExamTerm] = useState<string>('Term 1 (Half Yearly Exam 2026)');
  const [formAcademicYear, setFormAcademicYear] = useState<string>('2026-2027');
  const [formAssessmentCategory, setFormAssessmentCategory] = useState<AssessmentCategory>('Composite');
  const [formRemarks, setFormRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Dynamic Subject Scores for Form
  const [formSubjectScores, setFormSubjectScores] = useState<
    Record<
      string,
      {
        classTestObtained: number;
        classTestMax: number;
        examObtained: number;
        examMax: number;
      }
    >
  >({});

  // Selected student in entry form
  const activeStudent = useMemo(() => {
    return students.find((s) => s.id === formStudentId) || (students.length > 0 ? students[0] : null);
  }, [students, formStudentId]);

  // Detected stage and stream for active student in form
  const activeStageStream = useMemo(() => {
    if (!activeStudent) return { stage: 'High School' as GradeStage, stream: 'General' as StreamClassification };
    if (activeStudent.stage) {
      return {
        stage: activeStudent.stage,
        stream: activeStudent.stream || 'General',
      };
    }
    return detectStageAndStreamFromClass(activeStudent.className);
  }, [activeStudent]);

  // Filtered classes list based on selected stage
  const stageClasses = useMemo(() => {
    return classes.filter((c) => {
      if (selectedStage === 'All') return true;
      if (c.stage) return c.stage === selectedStage;
      const detected = detectStageAndStreamFromClass(c.name);
      return detected.stage === selectedStage;
    });
  }, [classes, selectedStage]);

  // Filtered grades list based on Stage, Stream, Class, Term, and Search
  const filteredGrades = useMemo(() => {
    return grades.filter((g) => {
      // Stage matching
      if (selectedStage !== 'All') {
        const stage = g.stage || detectStageAndStreamFromClass(g.className).stage;
        if (stage !== selectedStage) return false;
      }

      // Stream matching
      if (selectedStream !== 'All') {
        const stream = g.stream || detectStageAndStreamFromClass(g.className).stream;
        if (stream !== selectedStream) return false;
      }

      // Class matching
      const matchClass = selectedClass === 'all' || g.classId === selectedClass;

      // Term matching
      const matchTerm = selectedTerm === 'all' || g.examTerm.toLowerCase() === selectedTerm.toLowerCase();

      // Search matching
      const matchSearch =
        searchQuery === '' ||
        g.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.rollNo.toString().includes(searchQuery) ||
        g.className.toLowerCase().includes(searchQuery.toLowerCase());

      return matchClass && matchTerm && matchSearch;
    });
  }, [grades, selectedStage, selectedStream, selectedClass, selectedTerm, searchQuery]);

  // Performance KPI Metrics
  const stats = useMemo(() => {
    if (filteredGrades.length === 0) {
      return {
        total: 0,
        classAvg: 0,
        classTestAvg: 0,
        examAvg: 0,
        topper: null,
        passRate: 0,
      };
    }
    const total = filteredGrades.length;
    const avgPct = filteredGrades.reduce((sum, g) => sum + g.percentage, 0) / total;
    const passed = filteredGrades.filter((g) => g.status === 'Passed').length;
    const passRate = Math.round((passed / total) * 100);

    const totalClassTestPct =
      filteredGrades.reduce((sum, g) => {
        const ctObtained = g.totalClassTestObtained ?? g.subjects.reduce((s, sub) => s + (sub.classTestObtained ?? 0), 0);
        const ctMax = g.totalClassTestMax ?? g.subjects.reduce((s, sub) => s + (sub.classTestMax ?? 20), 0);
        return sum + (ctMax > 0 ? (ctObtained / ctMax) * 100 : 0);
      }, 0) / total;

    const totalExamPct =
      filteredGrades.reduce((sum, g) => {
        const exObtained = g.totalExamObtained ?? g.subjects.reduce((s, sub) => s + (sub.examObtained ?? sub.marksObtained), 0);
        const exMax = g.totalExamMax ?? g.subjects.reduce((s, sub) => s + (sub.examMax ?? sub.maxMarks), 0);
        return sum + (exMax > 0 ? (exObtained / exMax) * 100 : 0);
      }, 0) / total;

    const sorted = [...filteredGrades].sort((a, b) => b.percentage - a.percentage);
    const topper = sorted[0];

    return {
      total,
      classAvg: Number(avgPct.toFixed(1)),
      classTestAvg: Number(totalClassTestPct.toFixed(1)),
      examAvg: Number(totalExamPct.toFixed(1)),
      topper,
      passRate,
    };
  }, [filteredGrades]);

  // Handle when changing student in Mark Entry Modal: load their stage/stream curriculum
  const handleSelectStudentForEntry = (studentId: string) => {
    setFormStudentId(studentId);
    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent) return;

    const curriculum = getCurriculumForClass(
      targetStudent.className,
      targetStudent.stage,
      targetStudent.stream
    );

    const initialMap: Record<
      string,
      {
        classTestObtained: number;
        classTestMax: number;
        examObtained: number;
        examMax: number;
      }
    > = {};

    curriculum.forEach((sub: SubjectConfig) => {
      initialMap[sub.name] = {
        classTestObtained: Math.round(sub.defaultClassTestMax * 0.85),
        classTestMax: sub.defaultClassTestMax,
        examObtained: Math.round(sub.defaultExamMax * 0.8),
        examMax: sub.defaultExamMax,
      };
    });

    setFormSubjectScores(initialMap);
  };

  // Live calculation for Mark Entry Form
  const liveFormCalculation = useMemo(() => {
    const subjectsArray: SubjectScore[] = Object.entries(formSubjectScores).map(([subName, score]) => {
      return calculateCompositeSubjectScore(
        score.classTestObtained,
        score.classTestMax,
        score.examObtained,
        score.examMax,
        subName
      );
    });

    const totalClassTestObtained = subjectsArray.reduce((acc, curr) => acc + (curr.classTestObtained ?? 0), 0);
    const totalClassTestMax = subjectsArray.reduce((acc, curr) => acc + (curr.classTestMax ?? 0), 0);
    const totalExamObtained = subjectsArray.reduce((acc, curr) => acc + (curr.examObtained ?? 0), 0);
    const totalExamMax = subjectsArray.reduce((acc, curr) => acc + (curr.examMax ?? 0), 0);
    const totalObtained = subjectsArray.reduce((acc, curr) => acc + curr.marksObtained, 0);
    const totalMax = subjectsArray.reduce((acc, curr) => acc + curr.maxMarks, 0);
    const percentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(2)) : 0;
    const overallGrade = calculateMBSEGrade(percentage);

    // MBSE requirement: All core subjects must pass with >= 33%
    const hasFailedSubject = subjectsArray.some((s) => s.marksObtained < s.maxMarks * 0.33);
    const status: 'Passed' | 'Failed' | 'Needs Improvement' =
      percentage >= 33 && !hasFailedSubject
        ? 'Passed'
        : percentage >= 30
        ? 'Needs Improvement'
        : 'Failed';

    return {
      subjectsArray,
      totalClassTestObtained,
      totalClassTestMax,
      totalExamObtained,
      totalExamMax,
      totalObtained,
      totalMax,
      percentage,
      overallGrade,
      status,
    };
  }, [formSubjectScores]);

  const handleOpenNewEntry = () => {
    setEditingGradeId(null);
    const firstStudent = students[0];
    if (firstStudent) {
      handleSelectStudentForEntry(firstStudent.id);
    }
    setFormExamTerm(selectedTerm === 'all' ? 'Term 1 (Half Yearly Exam 2026)' : selectedTerm);
    setFormAcademicYear('2026-2027');
    setFormAssessmentCategory('Composite');
    setFormRemarks('Shows steady academic performance and conscientious participation in class tests and term examinations.');
    setIsEntryModalOpen(true);
  };

  const handleOpenEdit = (grade: GradeRecord) => {
    setEditingGradeId(grade.id);
    setFormStudentId(grade.studentId);
    setFormExamTerm(grade.examTerm);
    setFormAcademicYear(grade.academicYear);
    setFormAssessmentCategory(grade.assessmentCategory || 'Composite');
    setFormRemarks(grade.teacherRemarks || '');

    const targetStudent = students.find((s) => s.id === grade.studentId);
    const className = grade.className || targetStudent?.className || '';
    const stage = grade.stage || targetStudent?.stage;
    const stream = grade.stream || targetStudent?.stream;
    const curriculum = getCurriculumForClass(className, stage, stream);

    const scoresMap: Record<
      string,
      {
        classTestObtained: number;
        classTestMax: number;
        examObtained: number;
        examMax: number;
      }
    > = {};

    curriculum.forEach((cfg: SubjectConfig) => {
      const existing = grade.subjects.find((s) => s.subjectName.toLowerCase() === cfg.name.toLowerCase());
      if (existing) {
        scoresMap[cfg.name] = {
          classTestObtained: existing.classTestObtained ?? Math.round(existing.marksObtained * 0.2),
          classTestMax: existing.classTestMax ?? cfg.defaultClassTestMax,
          examObtained: existing.examObtained ?? existing.marksObtained - (existing.classTestObtained ?? 0),
          examMax: existing.examMax ?? cfg.defaultExamMax,
        };
      } else {
        scoresMap[cfg.name] = {
          classTestObtained: Math.round(cfg.defaultClassTestMax * 0.8),
          classTestMax: cfg.defaultClassTestMax,
          examObtained: Math.round(cfg.defaultExamMax * 0.75),
          examMax: cfg.defaultExamMax,
        };
      }
    });

    setFormSubjectScores(scoresMap);
    setIsEntryModalOpen(true);
  };

  const handleDeleteGrade = async (gradeId: string, studentName: string) => {
    if (window.confirm(`Are you sure you want to remove examination and class test records for ${studentName}?`)) {
      await deleteDocument('grades', gradeId);
    }
  };

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentId) return;

    const studentObj = students.find((s) => s.id === formStudentId);
    if (!studentObj) return;

    const stageStream = studentObj.stage
      ? { stage: studentObj.stage, stream: studentObj.stream || 'General' }
      : detectStageAndStreamFromClass(studentObj.className);

    setIsSubmitting(true);
    try {
      const gradePayload: Omit<GradeRecord, 'id'> = {
        studentId: studentObj.id,
        studentName: studentObj.name,
        rollNo: studentObj.rollNo,
        classId: studentObj.classId,
        className: studentObj.className,
        stage: stageStream.stage,
        stream: stageStream.stream,
        assessmentCategory: formAssessmentCategory,
        examTerm: formExamTerm,
        academicYear: formAcademicYear,
        subjects: liveFormCalculation.subjectsArray,
        totalClassTestObtained: liveFormCalculation.totalClassTestObtained,
        totalClassTestMax: liveFormCalculation.totalClassTestMax,
        totalExamObtained: liveFormCalculation.totalExamObtained,
        totalExamMax: liveFormCalculation.totalExamMax,
        totalMarksObtained: liveFormCalculation.totalObtained,
        totalMaxMarks: liveFormCalculation.totalMax,
        percentage: liveFormCalculation.percentage,
        overallGrade: liveFormCalculation.overallGrade,
        status: liveFormCalculation.status,
        teacherRemarks: formRemarks.trim() || 'Satisfactory academic evaluation.',
        updatedAt: new Date().toISOString(),
      };

      if (editingGradeId) {
        await updateDocument('grades', editingGradeId, gradePayload);
      } else {
        await addDocument('grades', gradePayload);
      }

      setIsEntryModalOpen(false);
    } catch (err) {
      console.error('Failed to save grade record', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBadgeGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (grade.startsWith('B')) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    if (grade.startsWith('C')) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    if (grade === 'D') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-indigo-400" />
            <span>Nursery to Class 12 Academic Gradebook</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Dual Assessment System • Separate Class Tests (Continuous) & Examinations with Composite Report Cards.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => exportGradeSheetsData(filteredGrades, students, 'excel', { term: selectedTerm, classId: selectedClass })}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-all border border-emerald-500/40 shadow-sm cursor-pointer"
            title="Download MBSE Grade Register as Excel (.xls)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Export Marksheets</span>
          </button>
          <button
            id="openMarkEntryModalBtn"
            onClick={handleOpenNewEntry}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] w-full sm:w-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enter Student Marks</span>
          </button>
        </div>
      </div>

      {/* Stage Filter Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-gray-900/80 border border-gray-800 rounded-xl">
        <button
          id="stageFilterAll"
          onClick={() => {
            setSelectedStage('All');
            setSelectedClass('all');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            selectedStage === 'All'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Stages</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30">
            {grades.length}
          </span>
        </button>

        {(['Pre-Primary', 'Primary', 'Middle', 'High School', 'Higher Secondary'] as GradeStage[]).map((stage) => {
          const count = grades.filter((g) => {
            const st = g.stage || detectStageAndStreamFromClass(g.className).stage;
            return st === stage;
          }).length;
          return (
            <button
              key={stage}
              id={`stageFilter-${stage.replace(/\s+/g, '')}`}
              onClick={() => {
                setSelectedStage(stage);
                setSelectedClass('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                selectedStage === stage
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{stage}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Stream Filter Pills (Visible when Higher Secondary or All is selected) */}
      {(selectedStage === 'Higher Secondary' || selectedStage === 'All') && (
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Stream:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              id="streamFilterAll"
              onClick={() => setSelectedStream('All')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                selectedStream === 'All'
                  ? 'bg-indigo-950 border-indigo-500 text-indigo-200'
                  : 'bg-gray-850/60 border-gray-700/60 text-gray-400 hover:text-gray-300'
              }`}
            >
              All Streams
            </button>
            {STREAMS_LIST.map((st) => (
              <button
                key={st}
                id={`streamFilter-${st}`}
                onClick={() => setSelectedStream(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                  selectedStream === st
                    ? 'bg-indigo-950 border-indigo-500 text-indigo-200'
                    : 'bg-gray-850/60 border-gray-700/60 text-gray-400 hover:text-gray-300'
                }`}
              >
                {st} Stream
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KPI Performance Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Class Tests Avg</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-300">{stats.classTestAvg}%</span>
            <span className="text-[11px] text-gray-500">Continuous</span>
          </div>
        </div>

        <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Examinations Avg</span>
            <FileText className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-300">{stats.examAvg}%</span>
            <span className="text-[11px] text-gray-500">Final Written</span>
          </div>
        </div>

        <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Composite Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">{stats.classAvg}%</span>
            <span className="text-[11px] text-gray-500">Combined</span>
          </div>
        </div>

        <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">MBSE Pass Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats.passRate}%</span>
            <span className="text-[11px] text-gray-500">({stats.total} evaluated)</span>
          </div>
        </div>
      </div>

      {/* Assessment Mode Switcher & Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-3 bg-gray-900/60 border border-gray-800 rounded-xl">
        {/* Assessment View Switcher */}
        <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-lg border border-gray-800">
          <button
            id="viewModeComposite"
            onClick={() => setAssessmentView('Composite')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              assessmentView === 'Composite'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Composite View</span>
          </button>
          <button
            id="viewModeClassTest"
            onClick={() => setAssessmentView('ClassTest')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              assessmentView === 'ClassTest'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-300" />
            <span>Class Tests (Continuous)</span>
          </button>
          <button
            id="viewModeExam"
            onClick={() => setAssessmentView('Examination')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              assessmentView === 'Examination'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-cyan-300" />
            <span>Examinations (Term)</span>
          </button>
        </div>

        {/* Dropdowns & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Class Selector */}
          <select
            id="classFilterSelect"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">All Classes</option>
            {stageClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.stream && c.stream !== 'General' ? `(${c.stream})` : ''}
              </option>
            ))}
          </select>

          {/* Term Selector */}
          <select
            id="termFilterSelect"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">All Terms</option>
            <option value="Term 1 (Half Yearly Exam 2026)">Term 1 (Half Yearly 2026)</option>
            <option value="Term 2 (Annual Exam 2027)">Term 2 (Annual Exam 2027)</option>
            <option value="Continuous Assessment Test 1">Continuous Assessment Test 1</option>
            <option value="Continuous Assessment Test 2">Continuous Assessment Test 2</option>
          </select>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              id="gradebookSearchInput"
              type="text"
              placeholder="Search student or roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none w-44"
            />
          </div>
        </div>
      </div>

      {/* Main Gradebook Evaluation Table */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-850 text-gray-400 font-semibold border-b border-gray-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Roll</th>
                <th className="py-3 px-4">Student & Class</th>
                <th className="py-3 px-4">Stage / Stream</th>

                {assessmentView === 'Composite' && (
                  <>
                    <th className="py-3 px-4 text-center text-indigo-300">Class Tests</th>
                    <th className="py-3 px-4 text-center text-cyan-300">Examinations</th>
                    <th className="py-3 px-4 text-center">Composite Total</th>
                    <th className="py-3 px-4 text-center">Percentage</th>
                    <th className="py-3 px-4 text-center">MBSE Grade</th>
                  </>
                )}

                {assessmentView === 'ClassTest' && (
                  <>
                    <th className="py-3 px-4 text-center text-indigo-300">Class Tests Total</th>
                    <th className="py-3 px-4 text-center">Continuous %</th>
                    <th className="py-3 px-4 text-center">Subject Count</th>
                    <th className="py-3 px-4 text-center">Internal Standing</th>
                  </>
                )}

                {assessmentView === 'Examination' && (
                  <>
                    <th className="py-3 px-4 text-center text-cyan-300">Examinations Total</th>
                    <th className="py-3 px-4 text-center">Written %</th>
                    <th className="py-3 px-4 text-center">Subject Count</th>
                    <th className="py-3 px-4 text-center">MBSE Grade</th>
                  </>
                )}

                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-300">
              {filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-gray-500">
                    No academic assessment records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredGrades.map((grade) => {
                  const isExpanded = expandedRowId === grade.id;

                  const ctObtained =
                    grade.totalClassTestObtained ??
                    grade.subjects.reduce((sum, s) => sum + (s.classTestObtained ?? 0), 0);
                  const ctMax =
                    grade.totalClassTestMax ??
                    grade.subjects.reduce((sum, s) => sum + (s.classTestMax ?? 20), 0);
                  const ctPct = ctMax > 0 ? Math.round((ctObtained / ctMax) * 100) : 0;

                  const exObtained =
                    grade.totalExamObtained ??
                    grade.subjects.reduce((sum, s) => sum + (s.examObtained ?? s.marksObtained), 0);
                  const exMax =
                    grade.totalExamMax ??
                    grade.subjects.reduce((sum, s) => sum + (s.examMax ?? s.maxMarks), 0);
                  const exPct = exMax > 0 ? Math.round((exObtained / exMax) * 100) : 0;

                  return (
                    <React.Fragment key={grade.id}>
                      <tr className="hover:bg-gray-800/40 transition-colors">
                        <td className="py-3 px-4 text-center font-mono font-bold text-gray-400">
                          #{grade.rollNo}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{grade.studentName}</div>
                          <div className="text-[11px] text-gray-400">{grade.className}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-indigo-300 font-medium text-[11px]">
                              {grade.stage || 'Standard'}
                            </span>
                            {grade.stream && grade.stream !== 'General' && (
                              <span className="text-emerald-400 text-[10px] font-semibold">
                                {grade.stream} Stream
                              </span>
                            )}
                          </div>
                        </td>

                        {assessmentView === 'Composite' && (
                          <>
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-indigo-300">{ctObtained}</span>
                              <span className="text-gray-500 text-[10px]"> / {ctMax}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-cyan-300">{exObtained}</span>
                              <span className="text-gray-500 text-[10px]"> / {exMax}</span>
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-white">
                              {grade.totalMarksObtained}
                              <span className="text-gray-500 text-[10px] font-normal"> / {grade.totalMaxMarks}</span>
                            </td>
                            <td className="py-3 px-4 text-center font-semibold text-indigo-400">
                              {grade.percentage.toFixed(1)}%
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getBadgeGradeColor(
                                  grade.overallGrade
                                )}`}
                              >
                                {grade.overallGrade}
                              </span>
                            </td>
                          </>
                        )}

                        {assessmentView === 'ClassTest' && (
                          <>
                            <td className="py-3 px-4 text-center">
                              <span className="font-bold text-indigo-300 text-sm">{ctObtained}</span>
                              <span className="text-gray-500 text-xs"> / {ctMax}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <div className="w-16 bg-gray-800 rounded-full h-1.5">
                                  <div
                                    className="h-1.5 rounded-full bg-indigo-500"
                                    style={{ width: `${Math.min(100, ctPct)}%` }}
                                  />
                                </div>
                                <span className="font-semibold text-xs text-indigo-300">{ctPct}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center text-gray-400">{grade.subjects.length} Subjects</td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-700/40">
                                {ctPct >= 75 ? 'Distinction' : ctPct >= 50 ? 'Satisfactory' : 'Needs Practice'}
                              </span>
                            </td>
                          </>
                        )}

                        {assessmentView === 'Examination' && (
                          <>
                            <td className="py-3 px-4 text-center">
                              <span className="font-bold text-cyan-300 text-sm">{exObtained}</span>
                              <span className="text-gray-500 text-xs"> / {exMax}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <div className="w-16 bg-gray-800 rounded-full h-1.5">
                                  <div
                                    className="h-1.5 rounded-full bg-cyan-500"
                                    style={{ width: `${Math.min(100, exPct)}%` }}
                                  />
                                </div>
                                <span className="font-semibold text-xs text-cyan-300">{exPct}%</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center text-gray-400">{grade.subjects.length} Subjects</td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getBadgeGradeColor(
                                  grade.overallGrade
                                )}`}
                              >
                                {grade.overallGrade}
                              </span>
                            </td>
                          </>
                        )}

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              grade.status === 'Passed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {grade.status === 'Passed' ? 'PASSED' : 'RE-TEST'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              id={`toggleBreakdown-${grade.id}`}
                              onClick={() => setExpandedRowId(isExpanded ? null : grade.id)}
                              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                              title="Toggle subject marks breakdown"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            <button
                              id={`viewReportCard-${grade.id}`}
                              onClick={() => setViewReportCard(grade)}
                              className="px-2.5 py-1 text-xs font-semibold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Report Card</span>
                            </button>

                            <button
                              id={`editGrade-${grade.id}`}
                              onClick={() => handleOpenEdit(grade)}
                              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                              title="Edit marks"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              id={`deleteGrade-${grade.id}`}
                              onClick={() => handleDeleteGrade(grade.id, grade.studentName)}
                              className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-gray-800 transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Subject-level Breakdown Row */}
                      {isExpanded && (
                        <tr className="bg-gray-950/60 border-y border-gray-800">
                          <td colSpan={10} className="p-4">
                            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>
                                    Subject Evaluation Matrix ({grade.studentName} - {grade.className})
                                  </span>
                                </span>
                                <span className="text-[11px] text-gray-400">
                                  Stage: {grade.stage || 'General'} | Stream: {grade.stream || 'General'}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                {grade.subjects.map((sub) => {
                                  const ct = sub.classTestObtained ?? Math.round(sub.marksObtained * 0.2);
                                  const ctM = sub.classTestMax ?? 20;
                                  const ex = sub.examObtained ?? sub.marksObtained - ct;
                                  const exM = sub.examMax ?? sub.maxMarks - ctM;
                                  const subPct = Math.round((sub.marksObtained / sub.maxMarks) * 100);

                                  return (
                                    <div
                                      key={sub.subjectName}
                                      className="p-2.5 rounded-lg bg-gray-850/80 border border-gray-700/60 text-xs"
                                    >
                                      <div className="flex items-center justify-between mb-1.5">
                                        <span className="font-semibold text-white">{sub.subjectName}</span>
                                        <span
                                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getBadgeGradeColor(
                                            sub.grade
                                          )}`}
                                        >
                                          {sub.grade}
                                        </span>
                                      </div>

                                      <div className="grid grid-cols-3 gap-1 text-[11px] pt-1 border-t border-gray-750">
                                        <div>
                                          <span className="text-gray-400 block text-[10px]">Class Test</span>
                                          <span className="font-medium text-indigo-300">
                                            {ct}/{ctM}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-gray-400 block text-[10px]">Exam</span>
                                          <span className="font-medium text-cyan-300">
                                            {ex}/{exM}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-gray-400 block text-[10px]">Composite</span>
                                          <span className="font-bold text-white">
                                            {sub.marksObtained}/{sub.maxMarks}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark Entry / Edit Modal */}
      {isEntryModalOpen && (
        <div
          id="markEntryModalOverlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto"
        >
          <div
            id="markEntryModalContainer"
            className="bg-gray-900 border border-gray-700 rounded-xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-gray-850 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <h2 className="text-sm font-semibold text-white">
                  {editingGradeId ? 'Edit Student Evaluation Record' : 'Record Class Tests & Examination Marks'}
                </h2>
              </div>
              <button
                id="closeMarkEntryModalBtn"
                onClick={() => setIsEntryModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveMarks} className="p-5 overflow-y-auto space-y-5">
              {/* Student & Class Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">Select Student</label>
                  <select
                    id="formStudentSelect"
                    value={formStudentId}
                    onChange={(e) => handleSelectStudentForEntry(e.target.value)}
                    disabled={!!editingGradeId}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        Roll #{st.rollNo} • {st.name} ({st.className}
                        {st.stage ? ` • ${st.stage}` : ''}
                        {st.stream && st.stream !== 'General' ? ` • ${st.stream}` : ''})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Assessment Category</label>
                  <select
                    id="formAssessmentCategorySelect"
                    value={formAssessmentCategory}
                    onChange={(e) => setFormAssessmentCategory(e.target.value as AssessmentCategory)}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Composite">Composite (Test + Exam)</option>
                    <option value="ClassTest">Class Test Only</option>
                    <option value="Examination">Examination Only</option>
                  </select>
                </div>
              </div>

              {/* Term & Academic Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Exam Term / Assessment Cycle</label>
                  <input
                    id="formExamTermInput"
                    type="text"
                    value={formExamTerm}
                    onChange={(e) => setFormExamTerm(e.target.value)}
                    placeholder="e.g. Term 1 (Half Yearly Exam 2026)"
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Academic Year</label>
                  <input
                    id="formAcademicYearInput"
                    type="text"
                    value={formAcademicYear}
                    onChange={(e) => setFormAcademicYear(e.target.value)}
                    placeholder="2026-2027"
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Subject Scores Input Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Curriculum Subjects & Marks Allocation</span>
                  </label>
                  <span className="text-[11px] text-gray-400">
                    Stage: {activeStageStream.stage} | Stream: {activeStageStream.stream}
                  </span>
                </div>

                <div className="bg-gray-850/60 border border-gray-750 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-800 text-gray-400 text-[11px] font-semibold border-b border-gray-700">
                      <tr>
                        <th className="py-2.5 px-3">Subject Name</th>
                        <th className="py-2.5 px-3 text-center w-32 bg-indigo-950/40 text-indigo-300">
                          Class Test Marks
                        </th>
                        <th className="py-2.5 px-3 text-center w-32 bg-blue-950/40 text-cyan-300">
                          Exam Marks
                        </th>
                        <th className="py-2.5 px-3 text-center w-28">Composite Total</th>
                        <th className="py-2.5 px-3 text-center w-16">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {Object.entries(formSubjectScores).map(([subName, score]) => {
                        const composite = score.classTestObtained + score.examObtained;
                        const maxComposite = score.classTestMax + score.examMax;
                        const pct = maxComposite > 0 ? (composite / maxComposite) * 100 : 0;
                        const grade = calculateMBSEGrade(pct);

                        return (
                          <tr key={subName} className="hover:bg-gray-800/30">
                            <td className="py-2 px-3 font-medium text-white">{subName}</td>
                            <td className="py-2 px-3 text-center bg-indigo-950/20">
                              <div className="flex items-center justify-center gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  max={score.classTestMax}
                                  value={score.classTestObtained}
                                  onChange={(e) => {
                                    const val = Number(e.target.value) || 0;
                                    setFormSubjectScores((prev) => ({
                                      ...prev,
                                      [subName]: {
                                        ...prev[subName],
                                        classTestObtained: Math.min(score.classTestMax, Math.max(0, val)),
                                      },
                                    }));
                                  }}
                                  className="w-14 bg-gray-900 border border-indigo-500/50 rounded px-2 py-1 text-center font-semibold text-indigo-300 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                />
                                <span className="text-gray-500 text-[10px]">/{score.classTestMax}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-center bg-blue-950/20">
                              <div className="flex items-center justify-center gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  max={score.examMax}
                                  value={score.examObtained}
                                  onChange={(e) => {
                                    const val = Number(e.target.value) || 0;
                                    setFormSubjectScores((prev) => ({
                                      ...prev,
                                      [subName]: {
                                        ...prev[subName],
                                        examObtained: Math.min(score.examMax, Math.max(0, val)),
                                      },
                                    }));
                                  }}
                                  className="w-14 bg-gray-900 border border-blue-500/50 rounded px-2 py-1 text-center font-semibold text-cyan-300 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                                />
                                <span className="text-gray-500 text-[10px]">/{score.examMax}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-center font-bold text-white">
                              {composite} <span className="text-gray-500 font-normal text-[10px]">/{maxComposite}</span>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span
                                className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold border ${getBadgeGradeColor(
                                  grade
                                )}`}
                              >
                                {grade}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Live Composite Calculation KPI Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-gray-800/80 border border-gray-700 rounded-lg text-center text-xs">
                <div>
                  <span className="text-gray-400 text-[10px] block">Class Tests Total</span>
                  <span className="font-bold text-indigo-300">
                    {liveFormCalculation.totalClassTestObtained} / {liveFormCalculation.totalClassTestMax}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Examinations Total</span>
                  <span className="font-bold text-cyan-300">
                    {liveFormCalculation.totalExamObtained} / {liveFormCalculation.totalExamMax}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Composite Total</span>
                  <span className="font-bold text-white">
                    {liveFormCalculation.totalObtained} / {liveFormCalculation.totalMax}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Overall Percentage</span>
                  <span className="font-black text-indigo-400">
                    {liveFormCalculation.percentage}% ({liveFormCalculation.overallGrade})
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-gray-400 text-[10px] block">Result Status</span>
                  <span
                    className={`font-bold ${
                      liveFormCalculation.status === 'Passed' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {liveFormCalculation.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Teacher Remarks */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Teacher Evaluation Remarks & Discipline Notes
                </label>
                <textarea
                  id="formTeacherRemarksInput"
                  rows={2}
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  placeholder="Enter remarks on student diligence, class participation, and exam performance..."
                  className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
                <button
                  type="button"
                  id="cancelMarkEntryBtn"
                  onClick={() => setIsEntryModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="saveMarksSubmitBtn"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-indigo-600/20"
                >
                  {isSubmitting ? 'Saving Assessment...' : 'Save & Compile Marks'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Report Card Modal */}
      {viewReportCard && (
        <ReportCardModal
          gradeRecord={viewReportCard}
          onClose={() => setViewReportCard(null)}
        />
      )}
    </div>
  );
};
