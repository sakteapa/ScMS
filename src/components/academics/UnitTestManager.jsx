import React, { useState } from 'react';
import { 
  Award, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Sliders, 
  FileText, 
  Percent,
  Search,
  Filter,
  Users,
  Check,
  X
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export default function UnitTestManager({ selectedClassId, currentSubjects, classStudents, selectedClass }) {
  const { 
    unitTests = [], 
    createUnitTest, 
    updateUnitTest, 
    deleteUnitTest, 
    recordUnitTestScores 
  } = useSchool();

  const [searchFilter, setSearchFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [scoringTest, setScoringTest] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // New Unit Test Form State
  const [newTest, setNewTest] = useState({
    title: 'Periodic Unit Assessment 1',
    testCode: 'UT-1',
    subject: currentSubjects[0] || 'Physics',
    date: new Date().toISOString().split('T')[0],
    maxMarks: 25,
    weightagePercent: 10,
    chaptersCovered: 'Unit 1 & Unit 2 foundational concepts'
  });

  // Scoring Form Temp State
  const [studentScores, setStudentScores] = useState({});

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter unit tests by selected class and filters
  const filteredUnitTests = unitTests.filter(t => {
    const matchesClass = t.classId === selectedClassId;
    const matchesSubject = subjectFilter === 'All' || t.subject === subjectFilter;
    const matchesSearch = !searchFilter || 
      t.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.testCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.chaptersCovered.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesClass && matchesSubject && matchesSearch;
  });

  const handleOpenScoring = (test) => {
    setScoringTest(test);
    // Pre-populate with existing scores or blank
    const initialScores = {};
    classStudents.forEach(st => {
      const existing = (test.scores || []).find(s => s.studentId === st.id);
      initialScores[st.id] = {
        marksObtained: existing ? existing.marksObtained : '',
        remarks: existing ? existing.remarks : ''
      };
    });
    setStudentScores(initialScores);
  };

  const handleSaveScores = (e) => {
    e.preventDefault();
    if (!scoringTest) return;

    const scoresArray = classStudents.map(st => {
      const entry = studentScores[st.id] || {};
      const marks = entry.marksObtained !== '' ? Number(entry.marksObtained) : 0;
      return {
        studentId: st.id,
        admissionNo: st.admissionNo,
        rollNo: st.rollNo,
        marksObtained: marks,
        remarks: entry.remarks || (marks >= (scoringTest.maxMarks * 0.8) ? 'Outstanding' : marks >= (scoringTest.maxMarks * 0.5) ? 'Good' : 'Needs Practice')
      };
    });

    recordUnitTestScores(scoringTest.id, scoresArray);
    showToast(`Scores recorded successfully for ${scoringTest.testCode} (${scoringTest.title})`);
    setScoringTest(null);
  };

  const handleCreateTest = (e) => {
    e.preventDefault();
    const created = createUnitTest({
      ...newTest,
      classId: selectedClassId,
      maxMarks: Number(newTest.maxMarks),
      weightagePercent: Number(newTest.weightagePercent)
    });
    setIsCreateModalOpen(false);
    showToast(`Unit Test "${created.testCode}" scheduled for ${selectedClass?.name || 'Class'}`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center justify-between shadow-xl animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-indigo-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Banner & Toolbar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0 shadow-inner">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold uppercase tracking-wider">
                Periodic Assessments (UT-1, UT-2, UT-3)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Class: <strong className="text-white">{selectedClass?.name}</strong>
              </span>
            </div>
            <h3 className="text-base font-bold text-white font-['Outfit'] mt-1">
              Unit Test &amp; Periodic Assessment Engine
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Formal continuous assessments with syllabus breakdown, weightage calculations, and class score sheets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Unit Test</span>
          </button>
        </div>
      </div>

      {/* Search & Subject Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tests, codes, or syllabus..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
            />
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-400"
          >
            <option value="All">All Subjects</option>
            {currentSubjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <strong className="text-indigo-400">{filteredUnitTests.length}</strong> Unit Tests
        </div>
      </div>

      {/* Unit Tests Grid */}
      {filteredUnitTests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUnitTests.map((test) => {
            const scoresCount = (test.scores || []).length;
            const avgMarks = scoresCount > 0 
              ? ((test.scores.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0) / scoresCount)).toFixed(1)
              : null;
            const avgPercent = avgMarks ? Math.round((avgMarks / test.maxMarks) * 100) : 0;

            return (
              <div 
                key={test.id} 
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition space-y-4 shadow-lg group relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold text-xs">
                        {test.testCode}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {test.subject}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white font-['Outfit'] group-hover:text-indigo-300 transition line-clamp-1">
                      {test.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete unit test "${test.testCode} - ${test.title}"?`)) {
                        deleteUnitTest(test.id);
                        showToast(`Deleted ${test.testCode}`);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition"
                    title="Delete Unit Test"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Date: <strong className="text-slate-200">{test.date}</strong></span>
                    <span>Max Marks: <strong className="text-indigo-400 font-mono">{test.maxMarks}</strong></span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Weightage: <strong className="text-emerald-400 font-mono">{test.weightagePercent}%</strong></span>
                    <span>Scores Entered: <strong className="text-cyan-400 font-mono">{scoresCount} / {classStudents.length}</strong></span>
                  </div>
                  <div className="pt-1 border-t border-slate-800/60 text-[11px] text-slate-400">
                    <span className="text-slate-500 block mb-0.5">Syllabus Chapters:</span>
                    <span className="text-slate-300 line-clamp-2">{test.chaptersCovered}</span>
                  </div>
                </div>

                {avgMarks && (
                  <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
                    <span className="text-slate-400">Class Average:</span>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-white font-mono">{avgMarks} / {test.maxMarks}</strong>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold font-mono ${avgPercent >= 70 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                        {avgPercent}%
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenScoring(test)}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{scoresCount > 0 ? 'Review & Update Scores' : 'Enter Student Scores'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-500 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-medium">No Unit Tests found for {selectedClass?.name || 'this class'}.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Create UT-1 Assessment</span>
          </button>
        </div>
      )}

      {/* SCHEDULE NEW UNIT TEST MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e1626] border border-indigo-500/40 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Schedule New Unit Test (Periodic Assessment)
                  </h3>
                  <p className="text-xs text-slate-400">Class: {selectedClass?.name}</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Test Code *</label>
                  <input
                    type="text"
                    required
                    value={newTest.testCode}
                    onChange={(e) => setNewTest({ ...newTest, testCode: e.target.value })}
                    placeholder="e.g. UT-1, UT-2, PA-1"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono uppercase focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Subject *</label>
                  <select
                    value={newTest.subject}
                    onChange={(e) => setNewTest({ ...newTest, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-indigo-400 focus:outline-none"
                  >
                    {currentSubjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Assessment Title *</label>
                <input
                  type="text"
                  required
                  value={newTest.title}
                  onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                  placeholder="e.g. Periodic Unit Assessment 1"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newTest.date}
                    onChange={(e) => setNewTest({ ...newTest, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Max Marks *</label>
                  <input
                    type="number"
                    required
                    min="5"
                    max="100"
                    value={newTest.maxMarks}
                    onChange={(e) => setNewTest({ ...newTest, maxMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Weightage % *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="50"
                    value={newTest.weightagePercent}
                    onChange={(e) => setNewTest({ ...newTest, weightagePercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Chapters / Syllabus Breakdown</label>
                <textarea
                  rows="2"
                  value={newTest.chaptersCovered}
                  onChange={(e) => setNewTest({ ...newTest, chaptersCovered: e.target.value })}
                  placeholder="e.g. Chapter 1: Real Numbers, Chapter 2: Polynomials"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-indigo-500/20"
                >
                  Save &amp; Schedule Unit Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT SCORING MODAL */}
      {scoringTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#0e1626] border border-indigo-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 bg-slate-900 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Score Sheet: {scoringTest.testCode} - {scoringTest.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Subject: <strong className="text-indigo-400">{scoringTest.subject}</strong> &bull; Max Marks: <strong className="text-white font-mono">{scoringTest.maxMarks}</strong> &bull; Class: {selectedClass?.name}
                  </p>
                </div>
              </div>
              <button onClick={() => setScoringTest(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScores} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 bg-slate-950/60 border-b border-slate-800 text-xs text-slate-400 flex items-center justify-between shrink-0">
                <span>Enter marks out of <strong>{scoringTest.maxMarks}</strong> for each student.</span>
                <span className="font-mono text-cyan-400">{classStudents.length} Students in Roster</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {classStudents.map((st) => {
                  const entry = studentScores[st.id] || { marksObtained: '', remarks: '' };
                  const marksNum = Number(entry.marksObtained);
                  const pct = entry.marksObtained !== '' ? Math.round((marksNum / scoringTest.maxMarks) * 100) : null;

                  return (
                    <div 
                      key={st.id} 
                      className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-slate-800 font-mono font-bold text-indigo-400 flex items-center justify-center shrink-0">
                          #{st.rollNo || '00'}
                        </span>
                        <div>
                          <p className="font-bold text-white">{st.firstName} {st.lastName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{st.admissionNo}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max={scoringTest.maxMarks}
                            placeholder="Marks"
                            value={entry.marksObtained}
                            onChange={(e) => {
                              const val = e.target.value;
                              setStudentScores(prev => ({
                                ...prev,
                                [st.id]: {
                                  ...prev[st.id],
                                  marksObtained: val
                                }
                              }));
                            }}
                            className="w-20 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold text-center focus:border-indigo-400 focus:outline-none"
                          />
                          <span className="text-slate-500 font-mono">/ {scoringTest.maxMarks}</span>
                        </div>

                        {pct !== null && (
                          <span className={`w-12 text-center py-1 rounded-lg font-mono font-bold text-[11px] ${
                            pct >= 80 ? 'bg-emerald-500/20 text-emerald-300' : pct >= 50 ? 'bg-cyan-500/20 text-cyan-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {pct}%
                          </span>
                        )}

                        <input
                          type="text"
                          placeholder="Remarks / Feedback"
                          value={entry.remarks}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStudentScores(prev => ({
                              ...prev,
                              [st.id]: {
                                ...prev[st.id],
                                remarks: val
                              }
                            }));
                          }}
                          className="w-40 sm:w-48 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-indigo-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setScoringTest(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                  Save All Marks &amp; Synchronize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
