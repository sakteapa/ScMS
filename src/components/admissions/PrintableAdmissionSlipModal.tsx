import React from 'react';
import { X, Printer, CheckCircle2, School, Calendar, MapPin, Phone, User, FileText } from 'lucide-react';
import { AdmissionApplication } from '../../types';

interface PrintableAdmissionSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: AdmissionApplication | null;
}

export const PrintableAdmissionSlipModal: React.FC<PrintableAdmissionSlipModalProps> = ({
  isOpen,
  onClose,
  application,
}) => {
  if (!isOpen || !application) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Top Control Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/70 print:hidden">
          <div className="flex items-center gap-2 text-white font-semibold text-sm sm:text-base">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Official Admission Acknowledgment Slip</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 text-gray-100 bg-gray-900 print:bg-white print:text-black print:p-8">
          {/* Institutional Header */}
          <div className="text-center border-b border-gray-700/80 print:border-black pb-5 mb-6">
            <div className="flex items-center justify-center gap-2.5 mb-2">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 print:bg-transparent print:text-black">
                <School className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white print:text-black">
                  GOVERNMENT OF MIZORAM
                </h1>
                <p className="text-xs font-semibold text-indigo-400 print:text-gray-700 uppercase tracking-wider">
                  Mizoram School System (zoxs-sms) • Aizawl District
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 print:text-gray-600">
              Affiliated to Mizoram Board of School Education (MBSE) • Estd. 1982
            </p>
            <div className="mt-3 inline-block px-4 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 print:border-black print:bg-gray-100 print:text-black text-xs font-mono font-bold tracking-wider uppercase">
              Online Admission Registration Slip ({application.academicYear})
            </div>
          </div>

          {/* Key Reference Callout */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-gray-800/60 border border-gray-700/70 print:bg-gray-50 print:border-gray-300 mb-6 text-xs">
            <div>
              <span className="text-gray-400 print:text-gray-600 block text-[10px] uppercase font-semibold">Application No.</span>
              <span className="font-mono font-bold text-sm text-indigo-300 print:text-black">{application.applicationNo}</span>
            </div>
            <div>
              <span className="text-gray-400 print:text-gray-600 block text-[10px] uppercase font-semibold">Target Grade</span>
              <span className="font-bold text-white print:text-black">{application.targetClass}</span>
            </div>
            <div>
              <span className="text-gray-400 print:text-gray-600 block text-[10px] uppercase font-semibold">Submission Date</span>
              <span className="font-medium text-gray-200 print:text-black">{application.appliedDate}</span>
            </div>
            <div>
              <span className="text-gray-400 print:text-gray-600 block text-[10px] uppercase font-semibold">Application Status</span>
              <span className={`font-bold inline-block px-2 py-0.5 rounded text-[11px] ${
                application.status === 'Approved'
                  ? 'bg-emerald-500/20 text-emerald-300 print:bg-emerald-100 print:text-emerald-900'
                  : application.status === 'Interview Scheduled'
                  ? 'bg-indigo-500/20 text-indigo-300 print:bg-indigo-100 print:text-indigo-900'
                  : 'bg-amber-500/20 text-amber-300 print:bg-amber-100 print:text-amber-900'
              }`}>
                {application.status}
              </span>
            </div>
          </div>

          {/* Applicant & Parent Profile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Applicant Section */}
            <div className="space-y-2.5 p-4 rounded-xl bg-gray-800/40 border border-gray-800 print:bg-transparent print:border-gray-300">
              <h3 className="text-xs font-bold text-indigo-400 print:text-black uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-gray-700/50 print:border-gray-200">
                <User className="w-3.5 h-3.5" />
                Applicant Particulars
              </h3>
              <div className="text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-400 print:text-gray-600">Full Name:</span>
                  <span className="font-semibold text-white print:text-black">{application.applicantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 print:text-gray-600">Date of Birth:</span>
                  <span className="text-gray-200 print:text-black">{application.dob}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 print:text-gray-600">Gender & Blood Group:</span>
                  <span className="text-gray-200 print:text-black">{application.gender} {application.bloodGroup ? `• ${application.bloodGroup}` : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 print:text-gray-600">Medium Choice:</span>
                  <span className="text-gray-200 print:text-black">{application.mediumOfInstruction} Medium</span>
                </div>
                {application.aadhaarNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 print:text-gray-600">Aadhaar Ref:</span>
                    <span className="font-mono text-gray-300 print:text-black">{application.aadhaarNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Parent/Guardian Section */}
            <div className="space-y-2.5 p-4 rounded-xl bg-gray-800/40 border border-gray-800 print:bg-transparent print:border-gray-300">
              <h3 className="text-xs font-bold text-indigo-400 print:text-black uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-gray-700/50 print:border-gray-200">
                <Phone className="w-3.5 h-3.5" />
                Parent / Guardian Contact
              </h3>
              <div className="text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-400 print:text-gray-600">Name ({application.parentRelation}):</span>
                  <span className="font-semibold text-white print:text-black">{application.parentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 print:text-gray-600">Phone Contact:</span>
                  <span className="font-mono text-gray-200 print:text-black">{application.parentPhone}</span>
                </div>
                {application.parentEmail && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 print:text-gray-600">Email:</span>
                    <span className="text-gray-200 print:text-black">{application.parentEmail}</span>
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <span className="text-gray-400 print:text-gray-600">Address:</span>
                  <span className="text-right text-gray-200 print:text-black max-w-[65%]">
                    {application.address}, {application.city}, {application.district} - {application.pincode}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Records & Submitted Documents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-800 print:bg-transparent print:border-gray-300 space-y-2 text-xs">
              <h3 className="font-bold text-indigo-400 print:text-black uppercase tracking-wider pb-1 border-b border-gray-700/50 print:border-gray-200">
                Previous Academic Records
              </h3>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-400 print:text-gray-600">Previous School:</span>
                  <span className="font-medium text-white print:text-black">{application.previousSchool}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 print:text-gray-600">Board of Study:</span>
                  <span className="text-gray-200 print:text-black">{application.previousBoard} Board</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 print:text-gray-600">Qualifying Score:</span>
                  <span className="font-bold text-emerald-400 print:text-black">
                    {application.previousMarksPercentage}% {application.previousMarksGrade ? `(Grade ${application.previousMarksGrade})` : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-800 print:bg-transparent print:border-gray-300 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-gray-700/50 print:border-gray-200">
                <h3 className="font-bold text-indigo-400 print:text-black uppercase tracking-wider">
                  Document Verification Status
                </h3>
                {Array.isArray(application.documents) && application.documents.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 print:text-black font-semibold font-mono">
                    {application.documents.length} Files Attached
                  </span>
                )}
              </div>
              {(() => {
                const hasDoc = (key: string, titleMatch: string) => {
                  if (Array.isArray(application.documents)) {
                    return application.documents.some(d => 
                      (d.slotId && d.slotId.toLowerCase().includes(key)) ||
                      (d.title && d.title.toLowerCase().includes(titleMatch.toLowerCase()))
                    );
                  }
                  if (application.documentChecklist) {
                    return Boolean((application.documentChecklist as any)[key]);
                  }
                  if (application.documents && typeof application.documents === 'object') {
                    return Boolean((application.documents as any)[key]);
                  }
                  return false;
                };

                return (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${hasDoc('birthCertificate', 'birth') ? 'text-emerald-400 print:text-black' : 'text-gray-600 print:text-gray-400'}`} />
                        <span>Birth Certificate</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${hasDoc('transferCertificate', 'transfer') ? 'text-emerald-400 print:text-black' : 'text-gray-600 print:text-gray-400'}`} />
                        <span>Transfer Cert. (TC)</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${hasDoc('previousMarksheet', 'marksheet') ? 'text-emerald-400 print:text-black' : 'text-gray-600 print:text-gray-400'}`} />
                        <span>Mark Sheet</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${hasDoc('passportPhoto', 'photo') ? 'text-emerald-400 print:text-black' : 'text-gray-600 print:text-gray-400'}`} />
                        <span>Passport Photo</span>
                      </span>
                    </div>

                    {Array.isArray(application.documents) && application.documents.length > 0 && (
                      <div className="pt-2 border-t border-gray-700/40 print:border-gray-200">
                        <span className="text-[10px] text-gray-400 print:text-gray-600 font-semibold block mb-1">
                          Uploaded Document Files:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {application.documents.map((d: any, idx: number) => (
                            <span 
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded bg-gray-800/80 border border-gray-700 text-gray-200 print:bg-gray-100 print:text-black print:border-gray-300 font-mono"
                            >
                              ✓ {d.title} ({d.fileName || d.fileSize || 'Attached'})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Interview Schedule or Enrollment Status If Applicable */}
          {application.status === 'Interview Scheduled' && application.interviewDate && (
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 print:bg-indigo-50 print:border-indigo-200 mb-6 text-xs">
              <div className="flex items-center gap-2 font-bold text-indigo-300 print:text-indigo-900 mb-1">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Admission Interview & Assessment Routine</span>
              </div>
              <p className="text-gray-300 print:text-black">
                Date: <strong>{application.interviewDate}</strong> at <strong>{application.interviewTime || '10:00 AM'}</strong> • Venue: <strong>{application.interviewVenue || "Principal's Office"}</strong>
              </p>
              <p className="text-[11px] text-gray-400 print:text-gray-600 mt-1">
                * Please bring original documents along with one set of self-attested photocopies.
              </p>
            </div>
          )}

          {application.status === 'Approved' && application.assignedClassName && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 print:bg-emerald-50 print:border-emerald-200 mb-6 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-300 print:text-emerald-900 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Admission Approved & Enrollment Allocated</span>
              </div>
              <p className="text-gray-300 print:text-black">
                Assigned Section: <strong>{application.assignedClassName}</strong> • Assigned Roll No.: <strong>#{application.assignedRollNo}</strong>
              </p>
            </div>
          )}

          {/* Instructions & Signatures */}
          <div className="border-t border-gray-700/80 print:border-black pt-6 mt-6 flex flex-col sm:flex-row justify-between items-end gap-8 text-xs">
            <div className="text-[11px] text-gray-400 print:text-gray-600 max-w-sm space-y-1">
              <p className="font-semibold text-gray-300 print:text-black">Important Notice to Parents:</p>
              <p>Keep this acknowledgment slip for all future reference. Final admission is subject to physical verification of original certificates and payment of initial term fee.</p>
            </div>
            <div className="text-center w-48 space-y-1">
              <div className="h-10 border-b border-gray-600 print:border-black"></div>
              <span className="text-[11px] font-bold text-gray-300 print:text-black block">Convener / Principal</span>
              <span className="text-[10px] text-gray-500 print:text-gray-600 block">Admission Screening Committee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
