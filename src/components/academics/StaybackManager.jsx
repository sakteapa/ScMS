import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Users, 
  Phone, 
  Send, 
  LogOut, 
  Check, 
  X,
  Calendar,
  Building,
  UserCheck,
  Search,
  MessageSquare
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export default function StaybackManager({ selectedClassId, classStudents, selectedClass }) {
  const { 
    staybackSessions = [], 
    createStaybackSession, 
    updateStaybackSession, 
    deleteStaybackSession, 
    checkoutStaybackStudent, 
    notifyStaybackParent,
    staff = [] 
  } = useSchool();

  const [searchFilter, setSearchFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // New Stayback Session Form State
  const [newSession, setNewSession] = useState({
    title: 'Senior Board Remedial Coaching & Practical Revision',
    reason: 'Remedial Coaching',
    sessionType: 'remedial',
    classId: selectedClassId,
    supervisorTeacher: staff[0]?.name || 'Pu Lalthlamuana Sailo',
    room: 'Room 204 (Academic Wing)',
    date: new Date().toISOString().split('T')[0],
    scheduledDismissal: '04:30 PM',
    notes: 'Covering organic reaction mechanisms and numerical practice.',
    selectedStudentIds: classStudents.slice(0, 3).map(s => s.id)
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredSessions = staybackSessions.filter(s => {
    const matchesClass = s.classId === selectedClassId;
    const matchesReason = reasonFilter === 'All' || s.reason === reasonFilter;
    const matchesSearch = !searchFilter ||
      s.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.supervisorTeacher.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.room.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesClass && matchesReason && matchesSearch;
  });

  const handleCreateSession = (e) => {
    e.preventDefault();
    const enrolledStudents = classStudents
      .filter(st => newSession.selectedStudentIds.includes(st.id))
      .map(st => ({
        studentId: st.id,
        admissionNo: st.admissionNo,
        name: `${st.firstName} ${st.lastName}`,
        rollNo: st.rollNo,
        parentPhone: st.guardianPhone || st.phone || '+91 94361 50000',
        parentNotified: false,
        checkoutStatus: 'active',
        checkoutTime: null
      }));

    if (enrolledStudents.length === 0) {
      alert('Please select at least one student for the stayback roster.');
      return;
    }

    const created = createStaybackSession({
      title: newSession.title,
      reason: newSession.reason,
      sessionType: newSession.sessionType,
      classId: selectedClassId,
      supervisorTeacher: newSession.supervisorTeacher,
      room: newSession.room,
      date: newSession.date,
      scheduledDismissal: newSession.scheduledDismissal,
      notes: newSession.notes,
      students: enrolledStudents
    });

    setIsCreateModalOpen(false);
    showToast(`Stayback Session "${created.title}" scheduled with ${enrolledStudents.length} students!`);
  };

  const handleNotifyWhatsApp = (sessionId, studentId, studentName) => {
    notifyStaybackParent(sessionId, studentId, 'WhatsApp');
    showToast(`WhatsApp stayback departure alert sent to parent of ${studentName}!`);
  };

  const handleCheckoutStudent = (sessionId, studentId, studentName) => {
    checkoutStaybackStudent(sessionId, studentId, 'Dismissed safely into authorized transport/with parent');
    showToast(`${studentName} safely checked out & dismissed!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center justify-between shadow-xl animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Banner & Actions */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-red-950/30 to-slate-900 border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 shrink-0 shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold uppercase tracking-wider">
                After-School Stayback Safety Suite
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Class: <strong className="text-white">{selectedClass?.name}</strong>
              </span>
            </div>
            <h3 className="text-base font-bold text-white font-['Outfit'] mt-1">
              Student Stayback Management &amp; Departure Verification
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Track remedial coaching, disciplinary detentions, sports practice, parent notifications, and safe student departure checkout.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Stayback Session</span>
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
              placeholder="Search sessions, supervisor or room..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
            />
          </div>

          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-rose-400"
          >
            <option value="All">All Reasons</option>
            <option value="Remedial Coaching">Remedial Coaching</option>
            <option value="Disciplinary Detention">Disciplinary Detention</option>
            <option value="Sports Practice">Sports Practice</option>
            <option value="Board Exam Prep">Board Exam Prep</option>
            <option value="Cultural / Choir Practice">Cultural / Choir Practice</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <strong className="text-rose-400">{filteredSessions.length}</strong> Stayback Sessions
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length > 0 ? (
        <div className="space-y-6">
          {filteredSessions.map((session) => {
            const studentsList = session.students || [];
            const activeStudents = studentsList.filter(s => s.checkoutStatus === 'active');
            const checkedOutStudents = studentsList.filter(s => s.checkoutStatus === 'checked_out');

            return (
              <div 
                key={session.id}
                className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/30 transition space-y-6 shadow-xl"
              >
                {/* Session Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        session.reason === 'Disciplinary Detention'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : session.reason === 'Remedial Coaching'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {session.reason}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {session.date} &bull; Dismissal: <strong className="text-rose-400">{session.scheduledDismissal}</strong>
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-white font-['Outfit'] mt-1">
                      {session.title}
                    </h4>

                    <p className="text-xs text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                      <span>Supervisor: <strong className="text-cyan-400">{session.supervisorTeacher}</strong></span>
                      <span>&bull;</span>
                      <span>Venue: <strong className="text-white">{session.room}</strong></span>
                      {session.notes && (
                        <>
                          <span>&bull;</span>
                          <span className="text-slate-400 italic">"{session.notes}"</span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold text-white font-mono block">
                        {activeStudents.length} On Campus / {checkedOutStudents.length} Dismissed
                      </span>
                      <span className={`text-[10px] font-bold ${activeStudents.length === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {activeStudents.length === 0 ? '✓ All Students Safely Checked Out' : 'Active On-Campus Session'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete stayback session "${session.title}"?`)) {
                          deleteStaybackSession(session.id);
                          showToast(`Deleted ${session.title}`);
                        }
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Students Roster & Actions */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-rose-400" />
                    <span>Stayback Student Roster ({studentsList.length} Students)</span>
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {studentsList.map((st) => {
                      const isCheckedOut = st.checkoutStatus === 'checked_out';

                      return (
                        <div
                          key={st.studentId}
                          className={`p-4 rounded-2xl border transition space-y-3 ${
                            isCheckedOut 
                              ? 'bg-slate-950/40 border-slate-800/80 opacity-70' 
                              : 'bg-slate-900 border-slate-700/80 shadow-md'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded-lg bg-slate-800 font-mono font-bold text-xs text-rose-400 flex items-center justify-center shrink-0">
                                #{st.rollNo || '00'}
                              </span>
                              <div>
                                <p className="font-bold text-white text-xs">{st.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{st.admissionNo}</p>
                              </div>
                            </div>

                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isCheckedOut ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {isCheckedOut ? 'Dismissed' : 'On Campus'}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1">
                            <div className="flex items-center justify-between text-slate-400">
                              <span>Parent Phone:</span>
                              <span className="font-mono text-slate-200">{st.parentPhone || 'Not Set'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Parent Alert:</span>
                              <span className={`font-semibold ${st.parentNotified ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {st.parentNotified ? '✓ Sent (WhatsApp)' : 'Pending'}
                              </span>
                            </div>
                            {st.checkoutTime && (
                              <div className="flex items-center justify-between text-slate-400 pt-0.5 border-t border-slate-800">
                                <span>Checked Out:</span>
                                <span className="font-mono text-emerald-300 font-bold">{st.checkoutTime}</span>
                              </div>
                            )}
                          </div>

                          {/* Quick Actions */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleNotifyWhatsApp(session.id, st.studentId, st.name)}
                              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition ${
                                st.parentNotified 
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                              }`}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{st.parentNotified ? 'Alert Sent' : 'WhatsApp'}</span>
                            </button>

                            <button
                              type="button"
                              disabled={isCheckedOut}
                              onClick={() => handleCheckoutStudent(session.id, st.studentId, st.name)}
                              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition ${
                                isCheckedOut
                                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm cursor-pointer'
                              }`}
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>{isCheckedOut ? 'Dismissed' : 'Checkout'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-500 space-y-3">
          <Clock className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-medium">No stayback sessions active for {selectedClass?.name || 'this class'}.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Remedial / Stayback Session</span>
          </button>
        </div>
      )}

      {/* SCHEDULE NEW STAYBACK SESSION MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-3xl bg-[#0e1626] border border-rose-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 bg-slate-900 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Schedule After-School Stayback Session
                  </h3>
                  <p className="text-xs text-slate-400">Class: {selectedClass?.name}</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="flex-1 flex flex-col overflow-hidden text-xs">
              <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Stayback Reason *</label>
                    <select
                      value={newSession.reason}
                      onChange={(e) => setNewSession({ ...newSession, reason: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-rose-400 focus:outline-none"
                    >
                      <option value="Remedial Coaching">Remedial Coaching</option>
                      <option value="Disciplinary Detention">Disciplinary Detention</option>
                      <option value="Sports Practice">Sports Practice</option>
                      <option value="Board Exam Prep">Board Exam Prep</option>
                      <option value="Cultural / Choir Practice">Cultural / Choir Practice</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Supervisor Teacher *</label>
                    <select
                      value={newSession.supervisorTeacher}
                      onChange={(e) => setNewSession({ ...newSession, supervisorTeacher: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-rose-400 focus:outline-none"
                    >
                      {staff.map(st => (
                        <option key={st.id} value={st.name}>{st.name} ({st.role})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Session Title *</label>
                  <input
                    type="text"
                    required
                    value={newSession.title}
                    onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                    placeholder="e.g. Science Remedial Practical Work"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-rose-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={newSession.date}
                      onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-rose-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Room / Venue *</label>
                    <input
                      type="text"
                      required
                      value={newSession.room}
                      onChange={(e) => setNewSession({ ...newSession, room: e.target.value })}
                      placeholder="e.g. Room 204"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-rose-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Dismissal Time *</label>
                    <input
                      type="text"
                      required
                      value={newSession.scheduledDismissal}
                      onChange={(e) => setNewSession({ ...newSession, scheduledDismissal: e.target.value })}
                      placeholder="04:30 PM"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-rose-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Session Objective / Remarks</label>
                  <textarea
                    rows="2"
                    value={newSession.notes}
                    onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                    placeholder="Instructions, topics or disciplinary note..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-rose-400 focus:outline-none"
                  />
                </div>

                {/* Student Selection Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-300 font-bold">Select Students for Stayback ({newSession.selectedStudentIds.length} Selected)</label>
                    <button
                      type="button"
                      onClick={() => {
                        if (newSession.selectedStudentIds.length === classStudents.length) {
                          setNewSession({ ...newSession, selectedStudentIds: [] });
                        } else {
                          setNewSession({ ...newSession, selectedStudentIds: classStudents.map(s => s.id) });
                        }
                      }}
                      className="text-cyan-400 hover:underline font-semibold"
                    >
                      {newSession.selectedStudentIds.length === classStudents.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="max-h-40 overflow-y-auto p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    {classStudents.map(st => {
                      const isSelected = newSession.selectedStudentIds.includes(st.id);
                      return (
                        <div
                          key={st.id}
                          onClick={() => {
                            if (isSelected) {
                              setNewSession({
                                ...newSession,
                                selectedStudentIds: newSession.selectedStudentIds.filter(id => id !== st.id)
                              });
                            } else {
                              setNewSession({
                                ...newSession,
                                selectedStudentIds: [...newSession.selectedStudentIds, st.id]
                              });
                            }
                          }}
                          className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition ${
                            isSelected ? 'bg-rose-500/20 text-white border border-rose-500/30' : 'hover:bg-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-rose-400">#{st.rollNo}</span>
                            <span className="font-bold">{st.firstName} {st.lastName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">({st.admissionNo})</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-rose-400" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold shadow-lg shadow-rose-500/20"
                >
                  Create Stayback Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
