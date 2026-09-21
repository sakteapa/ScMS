import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  AlertTriangle, 
  UserX, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Send, 
  Phone, 
  MessageSquare, 
  AlertCircle, 
  RotateCcw, 
  Printer, 
  Award, 
  UserCheck,
  Building2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export default function StudentSuspensionModal({ isOpen, student, onClose }) {
  const { 
    classes, 
    disciplinaryRecords, 
    suspendStudent, 
    revokeSuspension, 
    systemConfig,
    sealConfig 
  } = useSchool();
  const { currentUser, isPrincipal, isVicePrincipal, isSuperAdmin, isTeacher } = useAuth();

  const [activeTab, setActiveTab] = useState('issue'); // 'issue' | 'history' | 'slip'
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  // Form State
  const [actionType, setActionType] = useState('suspension'); // 'suspension' | 'in_school_suspension' | 'exam_hold' | 'bus_ban' | 'warning'
  const [severity, setSeverity] = useState('high'); // 'low' | 'medium' | 'high' | 'critical'
  const [reasonCategory, setReasonCategory] = useState('bunking');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [hearingNotes, setHearingNotes] = useState('Guardian summoned to Principal Office for mandatory counseling session.');
  const [notifyParents, setNotifyParents] = useState(true);

  // Revoke state
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokingRecord, setRevokingRecord] = useState(null);
  const [revokeReason, setRevokeReason] = useState('Good conduct restored & counseling concluded');

  if (!isOpen || !student) return null;

  const studentClass = classes.find(c => c.id === student.classId);
  const studentRecords = (disciplinaryRecords || []).filter(r => r.studentId === student.id);
  const activeSuspension = studentRecords.find(r => r.status === 'active' && r.actionType === 'suspension') || student.activeSuspension;
  const isCurrentlySuspended = student.status === 'suspended' || Boolean(activeSuspension);

  // Calculate Duration
  const calculateDays = () => {
    try {
      const s = new Date(startDate);
      const e = new Date(endDate);
      const diffTime = e.getTime() - s.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 7;
    }
  };
  const durationDays = calculateDays();

  // User designation
  const issuerName = currentUser?.name || currentUser?.username || 'Senior Faculty';
  const issuerRole = isPrincipal 
    ? 'Principal' 
    : isVicePrincipal 
    ? 'Vice Principal' 
    : isSuperAdmin 
    ? 'System Administrator' 
    : isTeacher 
    ? 'Class Teacher' 
    : 'Administrative Staff';

  const handleIssueSuspension = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Khawngaihin disciplinary order title/thupui ziak rawh.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await suspendStudent({
        studentId: student.id,
        actionType,
        severity,
        reasonCategory,
        title,
        description,
        startDate,
        endDate,
        durationDays,
        issuedBy: issuerName,
        issuedByRole: issuerRole,
        authorizedBy: isPrincipal ? issuerName : (sealConfig?.principalSignatoryName || 'Dr. R. Lalrintluanga (Principal)'),
        hearingNotes,
        notifyParents
      });

      if (res.success) {
        setSuccessToast(`Disciplinary ${actionType.toUpperCase().replace(/_/g, ' ')} has been officially issued for ${student.firstName}.`);
        setActiveTab('history');
      }
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  const handleRevokeSuspension = async () => {
    if (!revokingRecord && !activeSuspension) return;
    setSubmitting(true);
    try {
      await revokeSuspension({
        studentId: student.id,
        recordId: revokingRecord?.id || activeSuspension?.id,
        reason: revokeReason,
        revokedBy: issuerName
      });
      setSuccessToast(`Suspension for ${student.firstName} has been officially REVOKED. Student reinstated to active status.`);
      setRevokeModalOpen(false);
      setRevokingRecord(null);
    } catch (err) {
      alert('Failed to revoke: ' + err.message);
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-rose-900/50 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isCurrentlySuspended 
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse' 
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-['Outfit']">
                  Student Disciplinary &amp; Suspension Suite
                </h2>
                {isCurrentlySuspended ? (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/30 text-rose-300 border border-rose-500/50 flex items-center gap-1">
                    <UserX className="w-3 h-3" /> CURRENTLY SUSPENDED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> ACTIVE STUDENT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Official disciplinary hearings, conduct warnings, campus suspensions &amp; guardian notices.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Student Identity Strip */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={student.photoUrl}
              alt=""
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-700 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {student.firstName} {student.lastName}
                </span>
                <span className="text-xs text-cyan-400 font-mono font-bold">
                  Roll #{student.rollNo}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({student.admissionNo})
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-3">
                <span>Class: <strong className="text-slate-200">{studentClass?.name || 'Class 12'}</strong></span>
                <span>•</span>
                <span>Guardian: <strong className="text-slate-200">{student.guardianName || 'N/A'}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-emerald-400">
                  <Phone className="w-3 h-3" /> {student.guardianPhone || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('issue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'issue'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Issue Disciplinary Order
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Incident History</span>
              {studentRecords.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-white font-mono">
                  {studentRecords.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('slip')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                activeTab === 'slip'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Official Order Slip</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {successToast && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-600/50 text-emerald-300 text-xs flex items-center gap-2 shadow-xl animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: ISSUE DISCIPLINARY / SUSPENSION */}
          {activeTab === 'issue' && (
            <form onSubmit={handleIssueSuspension} className="space-y-5">
              
              {/* Active Warning if already suspended */}
              {isCurrentlySuspended && (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-rose-200">
                        Zirlai hi tunah hian Disciplinary Suspension hnuaiah a awm mek!
                      </h4>
                      <p className="text-xs text-rose-300/80 mt-0.5">
                        Active Order: <strong>{activeSuspension?.title || 'Campus Suspension'}</strong> ({activeSuspension?.startDate} to {activeSuspension?.endDate}).
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRevokingRecord(activeSuspension);
                      setRevokeModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Lift / Revoke Suspension</span>
                  </button>
                </div>
              )}

              {/* Action Type & Reason Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                    Disciplinary Action Type (Thununna Chi Hrang)
                  </label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500 font-semibold"
                  >
                    <option value="suspension">⛔ Total Campus Suspension (School chawlhtir)</option>
                    <option value="in_school_suspension">⚠️ In-School Suspension / Supervised Detention</option>
                    <option value="exam_hold">📋 Exam Hall Ticket &amp; Marksheet Withhold</option>
                    <option value="bus_ban">🚌 Campus Transport &amp; Bus Fleet Suspension</option>
                    <option value="warning">📝 Official Written Conduct Warning (Zilhna lehkha)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                    Offense Category (Thil Tihsual Lam)
                  </label>
                  <select
                    value={reasonCategory}
                    onChange={(e) => setReasonCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500"
                  >
                    <option value="bunking">Class Bunking / Gate Passing Violation / Truancy</option>
                    <option value="bullying">Bullying, Physical Violence, or Harassment</option>
                    <option value="misconduct">Gross Classroom Disruption / Defiance of Faculty</option>
                    <option value="substance">Tobacco, Alcohol, or Prohibited Substance Possession</option>
                    <option value="damage">Campus Property Damage / Lab Equipment Vandalism</option>
                    <option value="academic_dishonesty">Examination Malpractice / Copying / Cheating</option>
                    <option value="insubordination">Insubordination &amp; Disrespect to Faculty</option>
                    <option value="other">Other Institutional Regulation Infringement</option>
                  </select>
                </div>
              </div>

              {/* Title & Severity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                    Order Title / Summary Heading
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Unauthorized Campus Absence during Practical Session"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                    Severity Level
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500"
                  >
                    <option value="low">Low (First Formal Incident)</option>
                    <option value="medium">Medium (Repeated Non-Compliance)</option>
                    <option value="high">High (Major Violation)</option>
                    <option value="critical">Critical (Severe Safety Breach)</option>
                  </select>
                </div>
              </div>

              {/* Narrative / Incident Evidence */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Detailed Incident Description &amp; Faculty Findings
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Zirlai thil tihsual, hmun leh hun, zirtirtute hmuh dan leh thu tling tarlan na..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Dates & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                    Suspension Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                    Suspension End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                    Total Duration (Ni zat)
                  </label>
                  <div className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-rose-400 font-bold font-mono text-xs flex items-center justify-between">
                    <span>{durationDays} Days</span>
                    <span className="text-[10px] text-slate-400">Class days included</span>
                  </div>
                </div>
              </div>

              {/* Parent Conference Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Guardian Hearing &amp; Conference Directive
                </label>
                <input
                  type="text"
                  value={hearingNotes}
                  onChange={(e) => setHearingNotes(e.target.value)}
                  placeholder="e.g. Mandatory meeting with Principal and Class Teacher on Monday"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Parent Notification Checkbox */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyParents}
                    onChange={(e) => setNotifyParents(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-0 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="text-white font-semibold flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-rose-400" />
                      Auto-dispatch Instant SMS &amp; WhatsApp Alert to Guardian
                    </span>
                    <span className="text-slate-400 block mt-0.5 font-mono">
                      Destination: +91 {student.guardianPhone || '9862000000'} ({student.guardianName || 'Guardian'})
                    </span>
                  </div>
                </label>
              </div>

              {/* Issued by Metadata */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div>
                  <span>Issued By: <strong className="text-slate-200">{issuerName}</strong> ({issuerRole})</span>
                </div>
                <div>
                  <span>Authorized Authority: <strong className="text-slate-200">{sealConfig?.principalSignatoryName || 'Principal'}</strong></span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2 transition disabled:opacity-50"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{submitting ? 'Issuing Order...' : 'Issue Formal Disciplinary Order'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: INCIDENT & SUSPENSION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-400" />
                  Chronological Conduct &amp; Disciplinary Records ({studentRecords.length})
                </h3>
                <button
                  onClick={() => setActiveTab('issue')}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                >
                  <span>+ Issue New Incident Order</span>
                </button>
              </div>

              {studentRecords.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-500 text-xs space-y-2">
                  <UserCheck className="w-8 h-8 text-emerald-500/60 mx-auto" />
                  <p className="font-semibold text-slate-400">He zirlai tan hian disciplinary record a awm lo.</p>
                  <p className="text-[11px]">Clean institutional conduct record maintained.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentRecords.map((rec) => {
                    const isActive = rec.status === 'active';
                    return (
                      <div
                        key={rec.id}
                        className={`p-4 rounded-xl border transition space-y-3 ${
                          isActive
                            ? 'bg-rose-950/20 border-rose-500/50 shadow-lg shadow-rose-950/20'
                            : 'bg-slate-950/70 border-slate-800/80 text-slate-400'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                                rec.actionType === 'suspension'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}>
                                {rec.actionType.replace(/_/g, ' ')}
                              </span>
                              <span className="text-sm font-bold text-white">
                                {rec.title}
                              </span>
                              {isActive ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                                  ACTIVE ORDER
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                  REVOKED / RESOLVED
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-300 mt-1">
                              {rec.description || 'No additional narrative recorded.'}
                            </p>
                          </div>

                          {isActive && (
                            <button
                              onClick={() => {
                                setRevokingRecord(rec);
                                setRevokeModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 flex items-center gap-1 shadow transition"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Revoke</span>
                            </button>
                          )}
                        </div>

                        {/* Record Details Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                          <div>
                            <span className="text-slate-500 uppercase block text-[9px]">Period</span>
                            <span className="font-mono text-slate-200">{rec.startDate} &rarr; {rec.endDate}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 uppercase block text-[9px]">Duration</span>
                            <span className="font-semibold text-rose-400">{rec.durationDays} Days</span>
                          </div>
                          <div>
                            <span className="text-slate-500 uppercase block text-[9px]">Issued By</span>
                            <span className="text-slate-200">{rec.issuedBy}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 uppercase block text-[9px]">Parent Alert</span>
                            <span className="text-emerald-400 font-mono">
                              {rec.notifiedParents ? '✓ SMS Dispatched' : 'Internal Only'}
                            </span>
                          </div>
                        </div>

                        {/* Revoked Info if any */}
                        {rec.revokedAt && (
                          <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-center justify-between">
                            <span>Revoked on: <strong>{new Date(rec.revokedAt).toLocaleDateString()}</strong> by {rec.revokedBy || 'Authority'}</span>
                            <span className="italic text-emerald-400/80">"{rec.revokedReason}"</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OFFICIAL ORDER SLIP (PRINT READY) */}
          {activeTab === 'slip' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Institutional official disciplinary order letterhead.
                </span>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 transition"
                >
                  <Printer className="w-4 h-4 text-cyan-400" />
                  <span>Print Disciplinary Order (A4)</span>
                </button>
              </div>

              {/* Letterhead Paper Container */}
              <div className="p-8 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-300 font-serif max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                  <h1 className="text-xl font-bold uppercase tracking-wider text-slate-950 font-['Outfit']">
                    {systemConfig?.schoolName || 'OHA (One Heart Academy)'}
                  </h1>
                  <p className="text-xs text-slate-600 font-sans">
                    Affiliation: {systemConfig?.affiliationNo || 'MBSE'} • Est. {systemConfig?.establishedYear || '1998'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-sans">
                    {systemConfig?.address || 'Lunglawn, Lunglei, Mizoram - 796701'} • Helpline: {systemConfig?.contactPhone || '+91 372 2322104'}
                  </p>
                </div>

                {/* Subheading */}
                <div className="text-center">
                  <span className="px-4 py-1 border border-rose-800 rounded text-xs font-bold uppercase tracking-widest text-rose-900 bg-rose-50 inline-block font-sans">
                    OFFICIAL DISCIPLINARY &amp; SUSPENSION ORDER
                  </span>
                  <div className="flex justify-between text-xs text-slate-600 font-sans mt-3">
                    <span>Ref No: MZ-DISP/{new Date().getFullYear()}/{student.rollNo}</span>
                    <span>Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Subject Line */}
                <div className="text-xs font-sans space-y-1">
                  <p><strong>To:</strong> The Guardian / Parent of <strong>{student.firstName} {student.lastName}</strong></p>
                  <p><strong>Student Particulars:</strong> Admission No: {student.admissionNo} • Class: {studentClass?.name || 'Class 12'} • Roll #{student.rollNo}</p>
                  <p className="pt-2 font-bold text-slate-950 uppercase">
                    Subject: Formal Notification of {actionType.toUpperCase().replace(/_/g, ' ')} for Student Misconduct
                  </p>
                </div>

                {/* Narrative Clauses */}
                <div className="text-xs font-sans leading-relaxed space-y-3 text-slate-800">
                  <p>
                    This is to formally inform you that following an institutional review and faculty assessment, student <strong>{student.firstName} {student.lastName}</strong> has been found in violation of the institutional code of discipline regarding <strong>"{title || 'School Rule Infringement'}"</strong>.
                  </p>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded font-mono text-[11px]">
                    <strong>Incident Summary:</strong> {description || 'Classroom disruption and non-compliance with faculty guidelines.'}
                  </div>
                  <p>
                    In accordance with the Academic Board regulations, the student is hereby placed under <strong>{actionType.toUpperCase().replace(/_/g, ' ')}</strong> for a duration of <strong>{durationDays} Days</strong>, effective from <strong>{startDate}</strong> through <strong>{endDate}</strong>.
                  </p>
                  <p className="font-semibold text-rose-900">
                    Mandatory Action Required: {hearingNotes}
                  </p>
                </div>

                {/* Signatory Seals */}
                <div className="pt-8 border-t border-slate-300 flex items-end justify-between text-xs font-sans">
                  <div className="text-left space-y-1">
                    <p className="font-bold text-slate-900">{issuerName}</p>
                    <p className="text-[10px] text-slate-500">{issuerRole}</p>
                    <p className="text-[9px] text-slate-400">Reporting Officer</p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="font-bold text-slate-900 font-serif italic text-sm">
                      {sealConfig?.principalSignatoryName || 'Dr. F. Lalhmachhuana'}
                    </p>
                    <p className="font-bold text-slate-900">{sealConfig?.principalDesignation || 'Principal & Head of Institution'}</p>
                    <p className="text-[10px] text-slate-500">{sealConfig?.schoolCrestText || 'OHA • ONE HEART ACADEMY • LUNGLAWN, LUNGLEI'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* REVOKE SUSPENSION CONFIRMATION MODAL */}
        {revokeModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-slate-900 border border-emerald-600/50 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-emerald-400">
                <RotateCcw className="w-6 h-6" />
                <h3 className="text-base font-bold text-white">
                  Lift / Revoke Disciplinary Suspension
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                Student <strong>{student.firstName} {student.lastName}</strong> suspension hi titawpin zirlai status hi <strong className="text-emerald-400">ACTIVE</strong>-ah dah let i duh em?
              </p>

              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
                  Revocation / Clearance Reason
                </label>
                <input
                  type="text"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Good conduct demonstrated & counseling concluded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRevokeModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRevokeSuspension}
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Revoking...' : 'Confirm Reinstatement'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
