import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Calendar,
  Search,
  Users,
  Check,
  X,
  AlertCircle,
  UploadCloud,
  Send
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export default function AssignmentManager({ selectedClassId, currentSubjects, classStudents, selectedClass }) {
  const { 
    assignments = [], 
    createAssignment, 
    updateAssignment, 
    deleteAssignment, 
    evaluateAssignment 
  } = useSchool();

  const [searchFilter, setSearchFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [reviewingAssignment, setReviewingAssignment] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // New Assignment Form State
  const [newAssignment, setNewAssignment] = useState({
    title: 'Numerical Problems on Newton’s Laws',
    subject: currentSubjects[0] || 'Physics',
    teacherName: 'Teacher in Charge',
    assignedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    maxMarks: 20,
    allowDigitalUpload: true,
    description: 'Solve problem set 3 from chapter exercises. Show all step-by-step vector calculations.',
    chaptersCovered: 'Laws of Motion & Friction'
  });

  // Temporary evaluation state for active assignment
  const [evaluationData, setEvaluationData] = useState({});

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesClass = a.classId === selectedClassId;
    const matchesSubject = subjectFilter === 'All' || a.subject === subjectFilter;
    const matchesSearch = !searchFilter ||
      a.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.chaptersCovered?.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesClass && matchesSubject && matchesSearch;
  });

  const handleOpenReview = (assign) => {
    setReviewingAssignment(assign);
    const initialEvals = {};
    classStudents.forEach(st => {
      const existingSub = (assign.submissions || []).find(s => s.studentId === st.id);
      initialEvals[st.id] = {
        status: existingSub?.status || 'pending',
        marksObtained: existingSub?.marksObtained !== undefined ? existingSub.marksObtained : '',
        teacherFeedback: existingSub?.teacherFeedback || ''
      };
    });
    setEvaluationData(initialEvals);
  };

  const handleSaveEvaluation = (stId) => {
    if (!reviewingAssignment) return;
    const item = evaluationData[stId];
    if (!item) return;

    evaluateAssignment(reviewingAssignment.id, stId, {
      status: item.marksObtained !== '' ? 'evaluated' : item.status,
      marksObtained: item.marksObtained !== '' ? Number(item.marksObtained) : null,
      teacherFeedback: item.teacherFeedback || 'Good effort'
    });
    showToast(`Saved evaluation for student!`);
  };

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    const initialSubs = classStudents.map(st => ({
      studentId: st.id,
      admissionNo: st.admissionNo,
      name: `${st.firstName} ${st.lastName}`,
      rollNo: st.rollNo,
      status: 'pending',
      submittedAt: null,
      marksObtained: null,
      teacherFeedback: ''
    }));

    const created = createAssignment({
      ...newAssignment,
      classId: selectedClassId,
      maxMarks: Number(newAssignment.maxMarks),
      submissions: initialSubs
    });

    setIsCreateModalOpen(false);
    showToast(`Assignment "${created.title}" published to ${selectedClass?.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-between shadow-xl animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-amber-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Banner & Actions */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0 shadow-inner">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider">
                Homework &amp; Assignments
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Class: <strong className="text-white">{selectedClass?.name}</strong>
              </span>
            </div>
            <h3 className="text-base font-bold text-white font-['Outfit'] mt-1">
              Assignment &amp; Coursework Tracker
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Publish homework tasks, set deadlines, collect student submissions, and record continuous homework grades.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Assignment</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assignments or topics..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
          >
            <option value="All">All Subjects</option>
            {currentSubjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <strong className="text-amber-400">{filteredAssignments.length}</strong> Assignments
        </div>
      </div>

      {/* Assignment Cards Grid */}
      {filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssignments.map((assign) => {
            const subs = assign.submissions || [];
            const submittedCount = subs.filter(s => s.status === 'submitted' || s.status === 'evaluated').length;
            const evaluatedCount = subs.filter(s => s.status === 'evaluated').length;
            const isDueSoon = new Date(assign.dueDate) < new Date(Date.now() + 2 * 86400000);

            return (
              <div 
                key={assign.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition space-y-4 shadow-lg group relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-[11px]">
                        {assign.subject}
                      </span>
                      {assign.allowDigitalUpload && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          Online Upload
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white font-['Outfit'] group-hover:text-amber-300 transition line-clamp-1">
                      {assign.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete assignment "${assign.title}"?`)) {
                        deleteAssignment(assign.id);
                        showToast(`Deleted ${assign.title}`);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition"
                    title="Delete Assignment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2">
                  {assign.description}
                </p>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Due Date: <strong className={isDueSoon ? 'text-rose-400 font-bold' : 'text-slate-200'}>{assign.dueDate}</strong></span>
                    <span>Max Marks: <strong className="text-amber-400 font-mono">{assign.maxMarks}</strong></span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Submissions:</span>
                    <strong className="text-cyan-400 font-mono">{submittedCount} / {classStudents.length}</strong>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-amber-400 h-1.5 rounded-full"
                      style={{ width: `${classStudents.length ? Math.min(100, Math.round((submittedCount / classStudents.length) * 100)) : 0}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Graded: {evaluatedCount} / {submittedCount}</span>
                    <span>Chapters: {assign.chaptersCovered || 'All'}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenReview(assign)}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Review Submissions &amp; Grade</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-500 space-y-3">
          <FileText className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-medium">No assignments published for {selectedClass?.name || 'this class'}.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Assignment</span>
          </button>
        </div>
      )}

      {/* CREATE NEW ASSIGNMENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e1626] border border-amber-500/40 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Create New Assignment / Homework
                  </h3>
                  <p className="text-xs text-slate-400">Class: {selectedClass?.name}</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Subject *</label>
                  <select
                    value={newAssignment.subject}
                    onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  >
                    {currentSubjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Teacher In-Charge</label>
                  <input
                    type="text"
                    value={newAssignment.teacherName}
                    onChange={(e) => setNewAssignment({ ...newAssignment, teacherName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Assignment Title *</label>
                <input
                  type="text"
                  required
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder="e.g. Chapter 4 Practice Set & Case Study"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Instructions &amp; Problem Questions *</label>
                <textarea
                  rows="3"
                  required
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  placeholder="Detail instructions, question references or essay topics..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Max Marks *</label>
                  <input
                    type="number"
                    required
                    min="5"
                    max="100"
                    value={newAssignment.maxMarks}
                    onChange={(e) => setNewAssignment({ ...newAssignment, maxMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Chapters</label>
                  <input
                    type="text"
                    value={newAssignment.chaptersCovered}
                    onChange={(e) => setNewAssignment({ ...newAssignment, chaptersCovered: e.target.value })}
                    placeholder="Chapter numbers"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Allow Digital File Upload</span>
                  <span className="text-[11px] text-slate-400">Students can attach PDF or photo in Parent/Student Portal</span>
                </div>
                <input
                  type="checkbox"
                  checked={newAssignment.allowDigitalUpload}
                  onChange={(e) => setNewAssignment({ ...newAssignment, allowDigitalUpload: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700"
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW & EVALUATION MODAL */}
      {reviewingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl rounded-3xl bg-[#0e1626] border border-amber-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 bg-slate-900 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Submissions: {reviewingAssignment.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Subject: <strong className="text-amber-400">{reviewingAssignment.subject}</strong> &bull; Max Marks: <strong className="text-white font-mono">{reviewingAssignment.maxMarks}</strong> &bull; Due: {reviewingAssignment.dueDate}
                  </p>
                </div>
              </div>
              <button onClick={() => setReviewingAssignment(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {classStudents.map((st) => {
                const subItem = (reviewingAssignment.submissions || []).find(s => s.studentId === st.id) || {};
                const currentEval = evaluationData[st.id] || { status: subItem.status || 'pending', marksObtained: subItem.marksObtained ?? '', teacherFeedback: subItem.teacherFeedback || '' };
                const isSubmitted = currentEval.status === 'submitted' || currentEval.status === 'evaluated';

                return (
                  <div
                    key={st.id}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-slate-800 font-mono font-bold text-amber-400 flex items-center justify-center shrink-0">
                        #{st.rollNo || '00'}
                      </span>
                      <div>
                        <p className="font-bold text-white">{st.firstName} {st.lastName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{st.admissionNo}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <select
                        value={currentEval.status}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEvaluationData(prev => ({
                            ...prev,
                            [st.id]: { ...prev[st.id], status: val }
                          }));
                        }}
                        className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold ${
                          currentEval.status === 'evaluated'
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : currentEval.status === 'submitted'
                            ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                            : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="submitted">Submitted</option>
                        <option value="evaluated">Graded / Evaluated</option>
                        <option value="late">Late Submission</option>
                      </select>

                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max={reviewingAssignment.maxMarks}
                          placeholder="Marks"
                          value={currentEval.marksObtained}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEvaluationData(prev => ({
                              ...prev,
                              [st.id]: { ...prev[st.id], marksObtained: val }
                            }));
                          }}
                          className="w-16 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold text-center focus:border-amber-400 focus:outline-none"
                        />
                        <span className="text-slate-500 font-mono">/ {reviewingAssignment.maxMarks}</span>
                      </div>

                      <input
                        type="text"
                        placeholder="Feedback / Remarks"
                        value={currentEval.teacherFeedback}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEvaluationData(prev => ({
                            ...prev,
                            [st.id]: { ...prev[st.id], teacherFeedback: val }
                          }));
                        }}
                        className="w-48 sm:w-60 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-amber-400 focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => handleSaveEvaluation(st.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setReviewingAssignment(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Done / Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
