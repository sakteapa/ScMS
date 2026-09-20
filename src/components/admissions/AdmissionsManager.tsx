import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  UserCheck,
  XCircle,
  FileText,
  Printer,
  ChevronDown,
  UserPlus,
  School,
  Sparkles,
  ExternalLink,
  Check,
  AlertTriangle,
  MapPin,
  Phone,
  BookOpen,
} from 'lucide-react';
import { AdmissionApplication, AdmissionStatus, SchoolClass, FirestoreStudent } from '../../types';
import { updateDocument, addDocument } from '../../lib/firebase';
import { PrintableAdmissionSlipModal } from './PrintableAdmissionSlipModal';
import { PublicAdmissionPortalModal } from './PublicAdmissionPortalModal';

interface AdmissionsManagerProps {
  applications: AdmissionApplication[];
  classes: SchoolClass[];
  students: FirestoreStudent[];
  userRole: string;
}

export const AdmissionsManager: React.FC<AdmissionsManagerProps> = ({
  applications,
  classes,
  students,
  userRole,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [classFilter, setClassFilter] = useState<string>('All');

  // Modals
  const [isPublicPortalOpen, setIsPublicPortalOpen] = useState(false);
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [selectedSlipApp, setSelectedSlipApp] = useState<AdmissionApplication | null>(null);

  // Approval & Interview Modals
  const [interviewModalApp, setInterviewModalApp] = useState<AdmissionApplication | null>(null);
  const [interviewDate, setInterviewDate] = useState('2026-09-25');
  const [interviewTime, setInterviewTime] = useState('10:00 AM');
  const [interviewVenue, setInterviewVenue] = useState("Principal's Chamber, Main Block");
  const [interviewNotes, setInterviewNotes] = useState('');

  const [approveModalApp, setApproveModalApp] = useState<AdmissionApplication | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [assignedRollNo, setAssignedRollNo] = useState<number>(31);
  const [enrollmentNotes, setEnrollmentNotes] = useState('');

  // Selected Detail Modal
  const [detailModalApp, setDetailModalApp] = useState<AdmissionApplication | null>(null);

  // Stats
  const totalApps = applications.length;
  const pendingCount = applications.filter((a) => a.status === 'Pending').length;
  const reviewCount = applications.filter((a) => a.status === 'Under Review').length;
  const interviewCount = applications.filter((a) => a.status === 'Interview Scheduled').length;
  const approvedCount = applications.filter((a) => a.status === 'Approved').length;
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length;

  // Filtered List
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.parentPhone.includes(searchTerm) ||
      app.previousSchool.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesClass = classFilter === 'All' || app.targetClass === classFilter;

    return matchesSearch && matchesStatus && matchesClass;
  });

  // Action Handlers
  const handleQuickStatusChange = async (appId: string, newStatus: AdmissionStatus, remarks?: string) => {
    try {
      const updates: Partial<AdmissionApplication> = {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
      if (remarks) {
        updates.reviewerRemarks = remarks;
      }
      await updateDocument('admissions', appId, updates);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewModalApp) return;

    try {
      await updateDocument('admissions', interviewModalApp.id, {
        status: 'Interview Scheduled',
        interviewDate,
        interviewTime,
        interviewVenue,
        reviewerRemarks: interviewNotes || `Interview scheduled on ${interviewDate} at ${interviewTime} at ${interviewVenue}.`,
        updatedAt: new Date().toISOString(),
      });
      setInterviewModalApp(null);
    } catch (err) {
      console.error('Failed to schedule interview', err);
    }
  };

  const handleConfirmApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveModalApp) return;

    try {
      const targetClassObj = classes.find((c) => c.id === selectedClassId) || classes[0];
      const className = targetClassObj ? `${targetClassObj.name} - ${targetClassObj.section}` : approveModalApp.targetClass;

      // 1. Update Admission status to Approved
      await updateDocument('admissions', approveModalApp.id, {
        status: 'Approved',
        assignedClassId: targetClassObj ? targetClassObj.id : undefined,
        assignedClassName: className,
        assignedRollNo: Number(assignedRollNo),
        reviewerRemarks: enrollmentNotes || `Admission approved and enrolled into ${className}, Roll #${assignedRollNo}.`,
        updatedAt: new Date().toISOString(),
      });

      // 2. Auto-enroll into the active students collection if not already enrolled
      const existingStudent = students.find((s) => s.name.toLowerCase() === approveModalApp.applicantName.toLowerCase());
      if (!existingStudent) {
        const newStudentDoc: Partial<FirestoreStudent> = {
          name: approveModalApp.applicantName,
          rollNo: Number(assignedRollNo),
          classId: targetClassObj ? targetClassObj.id : 'class-10-a',
          className: className,
          gender: approveModalApp.gender as any,
          parentPhone: approveModalApp.parentPhone,
          address: approveModalApp.address,
          status: 'Active',
          feeStatus: 'Pending',
          totalFeesDue: 12000,
          totalFeesPaid: 0,
          marks: 80,
          createdAt: new Date().toISOString(),
        };
        await addDocument('students', newStudentDoc);
      }

      setApproveModalApp(null);
    } catch (err) {
      console.error('Failed to approve admission', err);
    }
  };

  const handleToggleDocVerification = async (app: AdmissionApplication, docKey: keyof AdmissionApplication['documents']) => {
    const updatedDocs = {
      ...app.documents,
      [docKey]: !app.documents[docKey],
    };
    await updateDocument('admissions', app.id, {
      documents: updatedDocs,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-900 to-indigo-950/40 border border-gray-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <UserPlus className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Online Admission & Scrutiny Management
            </h1>
          </div>
          <p className="text-xs text-gray-400">
            Process candidate registrations, schedule screening interviews, verify documents, and auto-enroll into MBSE classes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPublicPortalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Public Registration Web Form</span>
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800">
          <span className="text-xs font-medium text-gray-400 block">Total Applications</span>
          <span className="text-2xl font-bold text-white mt-1 block">{totalApps}</span>
          <span className="text-[10px] text-gray-500">Academic Year 2026</span>
        </div>
        <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800">
          <span className="text-xs font-medium text-amber-400 block">Pending Verification</span>
          <span className="text-2xl font-bold text-amber-300 mt-1 block">{pendingCount}</span>
          <span className="text-[10px] text-gray-500">Awaiting scrutiny</span>
        </div>
        <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800">
          <span className="text-xs font-medium text-blue-400 block">Under Review</span>
          <span className="text-2xl font-bold text-blue-300 mt-1 block">{reviewCount}</span>
          <span className="text-[10px] text-gray-500">Document checking</span>
        </div>
        <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800">
          <span className="text-xs font-medium text-indigo-400 block">Interviews</span>
          <span className="text-2xl font-bold text-indigo-300 mt-1 block">{interviewCount}</span>
          <span className="text-[10px] text-gray-500">Scheduled routine</span>
        </div>
        <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800">
          <span className="text-xs font-medium text-emerald-400 block">Approved & Enrolled</span>
          <span className="text-2xl font-bold text-emerald-300 mt-1 block">{approvedCount}</span>
          <span className="text-[10px] text-gray-500">Class allocated</span>
        </div>
        <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800">
          <span className="text-xs font-medium text-rose-400 block">Rejected</span>
          <span className="text-2xl font-bold text-rose-300 mt-1 block">{rejectedCount}</span>
          <span className="text-[10px] text-gray-500">Did not qualify</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-gray-900/70 border border-gray-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search candidate name, application #, parent phone, or school..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="All">All Target Classes</option>
            <option value="Class 10">Class 10</option>
            <option value="Class 9">Class 9</option>
            <option value="Class 8">Class 8</option>
          </select>
        </div>
      </div>

      {/* Applications Table / Cards */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-950/60 text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Application ID</th>
                <th className="py-3.5 px-4">Candidate & Class</th>
                <th className="py-3.5 px-4">Parent & Contact</th>
                <th className="py-3.5 px-4">Academic Background</th>
                <th className="py-3.5 px-4">Documents</th>
                <th className="py-3.5 px-4">Status & Pipeline</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-indigo-400 block">{app.applicationNo}</span>
                      <span className="text-[10px] text-gray-500 block">{app.appliedDate}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">{app.applicantName}</span>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <span className="text-gray-300 font-medium">{app.targetClass}</span>
                        <span>•</span>
                        <span>{app.gender}, DoB {app.dob}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-gray-200 block font-medium">{app.parentName} ({app.parentRelation})</span>
                      <span className="font-mono text-[11px] text-gray-400 block">{app.parentPhone}</span>
                      <span className="text-[10px] text-gray-500 block">{app.address}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-gray-300 block truncate max-w-[170px]" title={app.previousSchool}>
                        {app.previousSchool}
                      </span>
                      <span className="text-[11px] text-emerald-400 font-semibold block">
                        {app.previousBoard} Board • {app.previousMarksPercentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleDocVerification(app, 'birthCertificate')}
                          title={`Birth Certificate: ${app.documents.birthCertificate ? 'Verified' : 'Pending'}`}
                          className={`p-1 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                            app.documents.birthCertificate ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-800 text-gray-500'
                          }`}
                        >
                          BC
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleDocVerification(app, 'transferCertificate')}
                          title={`Transfer Certificate: ${app.documents.transferCertificate ? 'Verified' : 'Pending'}`}
                          className={`p-1 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                            app.documents.transferCertificate ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-800 text-gray-500'
                          }`}
                        >
                          TC
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleDocVerification(app, 'previousMarksheet')}
                          title={`Marksheet: ${app.documents.previousMarksheet ? 'Verified' : 'Pending'}`}
                          className={`p-1 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                            app.documents.previousMarksheet ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-800 text-gray-500'
                          }`}
                        >
                          MS
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleDocVerification(app, 'passportPhoto')}
                          title={`Photo: ${app.documents.passportPhoto ? 'Verified' : 'Pending'}`}
                          className={`p-1 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                            app.documents.passportPhoto ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-800 text-gray-500'
                          }`}
                        >
                          PH
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          app.status === 'Approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : app.status === 'Interview Scheduled'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : app.status === 'Under Review'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : app.status === 'Rejected'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {app.status}
                      </span>
                      {app.status === 'Interview Scheduled' && app.interviewDate && (
                        <span className="block text-[10px] text-indigo-300 font-mono mt-0.5">
                          {app.interviewDate} ({app.interviewTime || '10 AM'})
                        </span>
                      )}
                      {app.status === 'Approved' && app.assignedClassName && (
                        <span className="block text-[10px] text-emerald-300 font-medium mt-0.5">
                          {app.assignedClassName} (Roll #{app.assignedRollNo})
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      {/* Action Dropdown / Buttons */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSlipApp(app);
                          setSlipModalOpen(true);
                        }}
                        title="Print Acknowledgment Slip"
                        className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-gray-800 rounded transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {app.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(app.id, 'Under Review', 'Marked for document verification.')}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold bg-blue-600/30 hover:bg-blue-600 text-blue-200 transition-colors cursor-pointer"
                        >
                          Review
                        </button>
                      )}

                      {(app.status === 'Pending' || app.status === 'Under Review') && (
                        <button
                          type="button"
                          onClick={() => {
                            setInterviewModalApp(app);
                          }}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 transition-colors cursor-pointer"
                        >
                          Interview
                        </button>
                      )}

                      {app.status !== 'Approved' && (
                        <button
                          type="button"
                          onClick={() => {
                            setApproveModalApp(app);
                            // Pre-fill matching class
                            const matched = classes.find((c) => c.name.includes(app.targetClass));
                            if (matched) setSelectedClassId(matched.id);
                            else if (classes.length > 0) setSelectedClassId(classes[0].id);
                          }}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                      )}

                      {app.status !== 'Rejected' && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(app.id, 'Rejected', 'Application does not meet eligibility threshold.')}
                          className="px-2 py-1 rounded text-[11px] font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 text-xs">
                    No admission applications found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {interviewModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 bg-gray-950 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Schedule Candidate Interview</span>
              </div>
              <button
                type="button"
                onClick={() => setInterviewModalApp(null)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleScheduleInterview} className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-gray-800/60 border border-gray-700 space-y-1">
                <span className="text-gray-400 block text-[11px]">Candidate:</span>
                <span className="font-bold text-white text-sm block">{interviewModalApp.applicantName}</span>
                <span className="text-indigo-300 font-mono">{interviewModalApp.applicationNo} • {interviewModalApp.targetClass}</span>
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">Interview Date *</label>
                <input
                  type="date"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">Interview Time</label>
                <input
                  type="text"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  placeholder="e.g. 10:30 AM"
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">Interview Venue / Room</label>
                <input
                  type="text"
                  value={interviewVenue}
                  onChange={(e) => setInterviewVenue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">Candidate Instructions / Remarks</label>
                <textarea
                  rows={2}
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  placeholder="Bring original MBSE marksheet, Birth Certificate, and passport photos."
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInterviewModalApp(null)}
                  className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve Admission & Enroll Student Modal */}
      {approveModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 bg-gray-950 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Approve Admission & Enroll Student</span>
              </div>
              <button
                type="button"
                onClick={() => setApproveModalApp(null)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleConfirmApproval} className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 space-y-1">
                <span className="text-emerald-300 block text-[11px] font-semibold">Candidate to be Enrolled:</span>
                <span className="font-bold text-white text-sm block">{approveModalApp.applicantName}</span>
                <span className="text-gray-300 text-[11px]">
                  Applied for {approveModalApp.targetClass} • Score: {approveModalApp.previousMarksPercentage}%
                </span>
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">Assign School Section / Class *</label>
                <select
                  required
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - Section {cls.section} ({cls.teacherName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">Assign Official Roll Number *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={assignedRollNo}
                  onChange={(e) => setAssignedRollNo(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">Enrollment Remarks / Order Ref</label>
                <input
                  type="text"
                  value={enrollmentNotes}
                  onChange={(e) => setEnrollmentNotes(e.target.value)}
                  placeholder="e.g. Scrutiny cleared, admitted on merit quota"
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-lg bg-gray-800/60 border border-gray-700 text-[11px] text-gray-400">
                Approving this admission will automatically add <span className="text-white font-medium">{approveModalApp.applicantName}</span> to the active Student roster and generate initial tuition fee vouchers.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApproveModalApp(null)}
                  className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Public Form Modal */}
      <PublicAdmissionPortalModal
        isOpen={isPublicPortalOpen}
        onClose={() => setIsPublicPortalOpen(false)}
        applications={applications}
      />

      {/* Printable Slip Modal */}
      <PrintableAdmissionSlipModal
        isOpen={slipModalOpen}
        onClose={() => {
          setSlipModalOpen(false);
          setSelectedSlipApp(null);
        }}
        application={selectedSlipApp}
      />
    </div>
  );
};
