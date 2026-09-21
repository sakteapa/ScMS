import React, { useState } from 'react';
import {
  X,
  Send,
  Search,
  CheckCircle2,
  Calendar,
  Phone,
  User,
  School,
  FileText,
  AlertCircle,
  Clock,
  Printer,
  Sparkles,
  Award,
  ChevronRight,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { AdmissionApplication, AdmissionStatus } from '../../types';
import { addDocument } from '../../lib/firebase';
import { PrintableAdmissionSlipModal } from './PrintableAdmissionSlipModal';
import AdmissionDocumentUploader from '../AdmissionDocumentUploader';

interface PublicAdmissionPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: AdmissionApplication[];
  onApplicationSubmitted?: (newApp: AdmissionApplication) => void;
}

const AIZAWL_LOCALITIES = [
  'Mission Veng',
  'Khatla',
  'Chanmari',
  'Kulikawn',
  'Bawngkawn',
  'Ramhlun North',
  'Ramhlun South',
  'Zarkawt',
  'Dawrpui',
  'Tuikual',
  'Chhinga Veng',
  'Dinthar',
  'Venghnuai',
  'Salem Veng',
  'Luangmual',
  'Tanhril',
  'Other Locality / District',
];

export const PUBLIC_ADMISSION_SLOTS = [
  {
    id: 'student_photo',
    title: 'Student Passport Photo',
    description: 'Recent passport-size photograph with plain background (Upload or Live Camera)',
    icon: User,
    color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
    mandatory: true,
  },
  {
    id: 'birth_cert',
    title: 'Birth Certificate',
    description: 'Govt / Municipal issued Birth Certificate or Aadhaar Card (PDF or Image)',
    icon: FileText,
    color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    mandatory: true,
  },
  {
    id: 'previous_marksheet',
    title: 'Previous Class Marksheet',
    description: 'Last passed qualifying examination marksheet or promotion card',
    icon: Award,
    color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
    mandatory: true,
  },
  {
    id: 'aadhaar_id',
    title: 'Aadhaar / Parent Photo ID',
    description: 'Student or Parent/Guardian Aadhaar / Voter ID / Govt ID card',
    icon: ShieldCheck,
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    mandatory: true,
  },
  {
    id: 'transfer_cert',
    title: 'Transfer Certificate (TC)',
    description: 'Transfer certificate from previous institution (Optional during online application)',
    icon: FileText,
    color: 'from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30',
    mandatory: false,
  },
];

export const PublicAdmissionPortalModal: React.FC<PublicAdmissionPortalModalProps> = ({
  isOpen,
  onClose,
  applications,
  onApplicationSubmitted,
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'track'>('register');

  // Form State
  const [applicantName, setApplicantName] = useState('');
  const [dob, setDob] = useState('2012-05-15');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [targetClass, setTargetClass] = useState('Class 10');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [parentName, setParentName] = useState('');
  const [parentRelation, setParentRelation] = useState<'Father' | 'Mother' | 'Guardian'>('Father');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentOccupation, setParentOccupation] = useState('');
  const [locality, setLocality] = useState('Mission Veng');
  const [customAddress, setCustomAddress] = useState('');
  const [district, setDistrict] = useState('Aizawl');
  const [pincode, setPincode] = useState('796001');
  const [previousSchool, setPreviousSchool] = useState('');
  const [previousBoard, setPreviousBoard] = useState<'MBSE' | 'CBSE' | 'ICSE' | 'Other'>('MBSE');
  const [previousMarksPercentage, setPreviousMarksPercentage] = useState<number>(85);
  const [mediumOfInstruction, setMediumOfInstruction] = useState<'English' | 'Mizo'>('English');
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  // Documents & File Attachments
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const [declarationAgreed, setDeclarationAgreed] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<AdmissionApplication | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Tracking Search State
  const [trackQuery, setTrackQuery] = useState('');
  const [matchedApplication, setMatchedApplication] = useState<AdmissionApplication | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Print Slip
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [selectedSlipApp, setSelectedSlipApp] = useState<AdmissionApplication | null>(null);

  if (!isOpen) return null;

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!applicantName.trim()) {
      setErrorMessage('Please enter student applicant full name.');
      return;
    }
    if (!parentName.trim()) {
      setErrorMessage('Please enter parent or guardian name.');
      return;
    }
    if (!parentPhone.trim() || parentPhone.length < 8) {
      setErrorMessage('Please enter a valid phone number (at least 8 digits).');
      return;
    }
    if (!previousSchool.trim()) {
      setErrorMessage('Please enter the name of previous institution attended.');
      return;
    }

    // Mandatory Aadhaar Number validation
    const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
    if (!cleanAadhaar) {
      setErrorMessage('Student Aadhaar Card Number hi mandatory a ni. Khawngaihin 12-digit Aadhaar number ziak lut rawh.');
      return;
    }
    if (cleanAadhaar.length !== 12) {
      setErrorMessage(`Aadhaar Card Number hi digit 12 a ni tur a ni (tunah digit ${cleanAadhaar.length} chauh a la ni). Entirnan: 1234 5678 9012.`);
      return;
    }
    const formattedAadhaar = cleanAadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');

    if (!declarationAgreed) {
      setErrorMessage('Please accept the declaration stating all submitted details are accurate.');
      return;
    }

    // Check mandatory documents
    const mandatorySlots = PUBLIC_ADMISSION_SLOTS.filter((s) => s.mandatory);
    const missingDocs = mandatorySlots.filter(
      (slot) => !uploadedDocs.some((d) => d.slotId === slot.id || d.title === slot.title)
    );

    if (missingDocs.length > 0) {
      setErrorMessage(
        `Mandatory documents upload a ngai: ${missingDocs.map((m) => m.title).join(', ')}. Khawngaihin heng mandatory document-te hi upload/scan hmasa rawh.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Auto-generate application number
      const existingCount = applications.length + 1;
      const appNumber = `ADM-2026-${String(existingCount).padStart(3, '0')}`;
      const todayStr = new Date().toISOString().split('T')[0];

      const fullAddress = locality === 'Other Locality / District' && customAddress.trim()
        ? `${customAddress.trim()}, ${district}`
        : `${locality}, ${district}`;

      const newApplication: AdmissionApplication = {
        id: `adm-${Date.now()}`,
        applicationNo: appNumber,
        applicantName: applicantName.trim(),
        dob,
        gender,
        bloodGroup: bloodGroup || undefined,
        targetClass,
        academicYear,
        parentName: parentName.trim(),
        parentRelation,
        parentPhone: parentPhone.trim(),
        parentEmail: parentEmail.trim() || undefined,
        parentOccupation: parentOccupation.trim() || undefined,
        address: fullAddress,
        city: 'Aizawl',
        district,
        state: 'Mizoram',
        pincode,
        previousSchool: previousSchool.trim(),
        previousBoard,
        previousMarksPercentage: Number(previousMarksPercentage) || 0,
        mediumOfInstruction,
        aadhaarNumber: formattedAadhaar,
        documents: uploadedDocs,
        attachedDocuments: uploadedDocs,
        documentChecklist: {
          birthCertificate: uploadedDocs.some(d => d.slotId === 'birth_cert' || d.title.toLowerCase().includes('birth')),
          transferCertificate: uploadedDocs.some(d => d.slotId === 'transfer_cert' || d.title.toLowerCase().includes('transfer')),
          previousMarksheet: uploadedDocs.some(d => d.slotId === 'previous_marksheet' || d.title.toLowerCase().includes('marksheet')),
          passportPhoto: uploadedDocs.some(d => d.slotId === 'student_photo' || d.title.toLowerCase().includes('photo')),
          aadhaarCard: uploadedDocs.some(d => d.slotId === 'aadhaar_id' || d.title.toLowerCase().includes('aadhaar') || d.title.toLowerCase().includes('id')),
        },
        status: 'Pending',
        reviewerRemarks: `Application submitted via Online Public Admission Portal with ${uploadedDocs.length} documents attached.`,
        appliedDate: todayStr,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDocument('admissions', newApplication);
      setSubmittedApp(newApplication);
      if (onApplicationSubmitted) {
        onApplicationSubmitted(newApplication);
      }
    } catch (err: any) {
      console.error('Admission submit error:', err);
      setErrorMessage('Failed to submit application. Please verify details and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const q = trackQuery.trim().toLowerCase();
    if (!q) {
      setMatchedApplication(null);
      return;
    }

    const found = applications.find(
      (a) =>
        a.applicationNo.toLowerCase() === q ||
        a.parentPhone.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
        a.applicantName.toLowerCase().includes(q)
    );
    setMatchedApplication(found || null);
  };

  const resetForm = () => {
    setSubmittedApp(null);
    setApplicantName('');
    setParentName('');
    setParentPhone('');
    setParentEmail('');
    setPreviousSchool('');
    setAadhaarNumber('');
    setUploadedDocs([]);
    setDeclarationAgreed(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 bg-gray-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Mizoram School System (zoxs-sms)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono border border-emerald-500/30">
                  Admissions 2026-2027 Open
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Official Online Student Admission & Status Verification Portal • MBSE Affiliated
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 bg-gray-900/60 px-6 py-2.5 gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>New Student Online Registration</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('track')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'track'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track Application Status</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* TAB 1: REGISTRATION FORM */}
          {activeTab === 'register' && (
            <div>
              {submittedApp ? (
                /* Success Confirmation State */
                <div className="p-8 text-center space-y-6 max-w-xl mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Application Successfully Submitted!</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Your admission request has been registered into the Mizoram School System cloud registry.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-800/80 border border-gray-700/80 text-left space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-gray-700/60">
                      <span className="text-gray-400">Application Number:</span>
                      <span className="font-mono font-bold text-indigo-400 text-sm">{submittedApp.applicationNo}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-700/60">
                      <span className="text-gray-400">Applicant:</span>
                      <span className="font-semibold text-white">{submittedApp.applicantName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-700/60">
                      <span className="text-gray-400">Applied Grade:</span>
                      <span className="font-medium text-gray-200">{submittedApp.targetClass}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-700/60">
                      <span className="text-gray-400">Attached Documents:</span>
                      <span className="font-semibold text-emerald-300">
                        {Array.isArray(submittedApp.documents) ? submittedApp.documents.length : 0} Files Uploaded &amp; Scanned
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-400">Current Status:</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold text-[11px]">
                        {submittedApp.status} (Pending Scrutiny)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSlipApp(submittedApp);
                        setSlipModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow"
                    >
                      <Printer className="w-4 h-4" />
                      View & Print Acknowledgment Slip
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors cursor-pointer"
                    >
                      Submit Another Application
                    </button>
                  </div>
                </div>
              ) : (
                /* Application Form */
                <form onSubmit={handleSubmitApplication} className="space-y-6">
                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Section 1: Academic Enrollment Preference */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                      <School className="w-4 h-4" />
                      1. Admission Preference
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-300 mb-1 font-medium">Target Grade / Class *</label>
                        <select
                          value={targetClass}
                          onChange={(e) => setTargetClass(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="Nursery">Nursery / Pre-School</option>
                          <option value="Kindergarten (KG)">Kindergarten (KG)</option>
                          <option value="Class 1">Class 1</option>
                          <option value="Class 2">Class 2</option>
                          <option value="Class 3">Class 3</option>
                          <option value="Class 4">Class 4</option>
                          <option value="Class 5">Class 5</option>
                          <option value="Class 6">Class 6 (Middle School)</option>
                          <option value="Class 7">Class 7</option>
                          <option value="Class 8">Class 8</option>
                          <option value="Class 9">Class 9 (Secondary)</option>
                          <option value="Class 10">Class 10 (MBSE HSLC Board)</option>
                          <option value="Class 11 - Science">Class 11 - Science (MBSE HSSLC)</option>
                          <option value="Class 11 - Arts">Class 11 - Arts (MBSE HSSLC)</option>
                          <option value="Class 11 - Commerce">Class 11 - Commerce (MBSE HSSLC)</option>
                          <option value="Class 12 - Science">Class 12 - Science (MBSE HSSLC)</option>
                          <option value="Class 12 - Arts">Class 12 - Arts (MBSE HSSLC)</option>
                          <option value="Class 12 - Commerce">Class 12 - Commerce (MBSE HSSLC)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1 font-medium">Academic Session</label>
                        <input
                          type="text"
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:outline-none"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1 font-medium">Medium of Instruction</label>
                        <select
                          value={mediumOfInstruction}
                          onChange={(e) => setMediumOfInstruction(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="English">English Medium (with Mizo MIL)</option>
                          <option value="Mizo">Mizo Medium</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Student Applicant Particulars */}
                  <div className="space-y-3 pt-4 border-t border-gray-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      2. Applicant Particulars
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-gray-300 mb-1 font-medium">Student Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Lalmuanpuia Ralte"
                          value={applicantName}
                          onChange={(e) => setApplicantName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1 font-medium">Date of Birth *</label>
                        <input
                          type="date"
                          required
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1 font-medium">Gender</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1 font-medium">Blood Group</label>
                        <select
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </select>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs text-gray-300 font-medium">Aadhaar Card Number *</label>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                            Mandatory
                          </span>
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={14}
                          placeholder="xxxx xxxx xxxx (12 digits)"
                          value={aadhaarNumber}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
                            const parts = raw.match(/[\s\S]{1,4}/g) || [];
                            setAadhaarNumber(parts.join(' '));
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-500 font-mono tracking-wider"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">12-digit UIDAI official Aadhaar number</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Parent/Guardian & Residential Address */}
                  <div className="space-y-3 pt-4 border-t border-gray-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      3. Parent / Guardian Particulars & Residential Address
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-300 mb-1 font-medium">Parent / Guardian Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. C. Lalramliana"
                          value={parentName}
                          onChange={(e) => setParentName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1 font-medium">Relationship</label>
                        <select
                          value={parentRelation}
                          onChange={(e) => setParentRelation(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Guardian">Legal Guardian</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1 font-medium">Mobile Phone Contact *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98623 12345"
                          value={parentPhone}
                          onChange={(e) => setParentPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1 font-medium">Email Address (Optional)</label>
                        <input
                          type="email"
                          placeholder="parent@example.com"
                          value={parentEmail}
                          onChange={(e) => setParentEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1 font-medium">Occupation</label>
                        <input
                          type="text"
                          placeholder="e.g. Govt. Servant, Business, Teacher"
                          value={parentOccupation}
                          onChange={(e) => setParentOccupation(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1 font-medium">Residential Veng / Locality *</label>
                        <select
                          value={locality}
                          onChange={(e) => setLocality(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          {AIZAWL_LOCALITIES.map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                        </select>
                      </div>

                      {locality === 'Other Locality / District' && (
                        <div className="sm:col-span-3">
                          <label className="block text-xs text-gray-300 mb-1 font-medium">Specific Street / Locality Name</label>
                          <input
                            type="text"
                            placeholder="Enter specific address or town in Mizoram"
                            value={customAddress}
                            onChange={(e) => setCustomAddress(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs text-gray-300 mb-1 font-medium">District</label>
                        <select
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="Aizawl">Aizawl District</option>
                          <option value="Lunglei">Lunglei District</option>
                          <option value="Champhai">Champhai District</option>
                          <option value="Serchhip">Serchhip District</option>
                          <option value="Kolasib">Kolasib District</option>
                          <option value="Mamit">Mamit District</option>
                          <option value="Lawngtlai">Lawngtlai District</option>
                          <option value="Siaha">Siaha District</option>
                          <option value="Saitual">Saitual District</option>
                          <option value="Khawzawl">Khawzawl District</option>
                          <option value="Hnahthial">Hnahthial District</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1 font-medium">PIN Code</label>
                        <input
                          type="text"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Academic Background */}
                  <div className="space-y-3 pt-4 border-t border-gray-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      4. Previous Academic Background
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-gray-300 mb-1 font-medium">Previous School Attended *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. St. Pauls HSS, Synod HSS, Govt. Mizo High School"
                          value={previousSchool}
                          onChange={(e) => setPreviousSchool(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1 font-medium">Previous Board</label>
                        <select
                          value={previousBoard}
                          onChange={(e) => setPreviousBoard(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="MBSE">MBSE (Mizoram Board)</option>
                          <option value="CBSE">CBSE (Central Board)</option>
                          <option value="ICSE">ICSE</option>
                          <option value="Other">Other State Board</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1 font-medium">Qualifying Percentage Score (%) *</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={previousMarksPercentage}
                          onChange={(e) => setPreviousMarksPercentage(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Mandatory Documents Upload & Live Camera Scanner */}
                  <div className="pt-4 border-t border-gray-800">
                    <AdmissionDocumentUploader
                      uploadedDocs={uploadedDocs}
                      onDocsChange={setUploadedDocs}
                      slots={PUBLIC_ADMISSION_SLOTS}
                      title="5. Mandatory Documents & Photo Upload"
                      subtitle="Attach required official documents (PDF/JPG/PNG) or use your phone/laptop camera to capture passport photos & mark sheets directly."
                    />
                  </div>

                  {/* Declaration */}
                  <div className="pt-4 border-t border-gray-800">
                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-800/40 border border-gray-700/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={declarationAgreed}
                        onChange={(e) => setDeclarationAgreed(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-gray-900 border-gray-700 mt-0.5"
                      />
                      <span className="text-[11px] text-gray-300 leading-relaxed">
                        I hereby declare that the information furnished in this admission application is true, accurate, and complete. I agree to abide by the institutional rules and code of conduct formulated by the School and the Mizoram Board of School Education (MBSE).
                      </span>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          Submitting to Cloud...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Submit Admission Application
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: TRACK APPLICATION STATUS */}
          {activeTab === 'track' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-white">Track Your Admission Application</h3>
                <p className="text-xs text-gray-400">
                  Enter your assigned Application ID (e.g. <span className="font-mono text-indigo-300">ADM-2026-001</span>) or registered parent phone number.
                </p>
              </div>

              <form onSubmit={handleTrackSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter Application ID, phone, or student name..."
                    value={trackQuery}
                    onChange={(e) => setTrackQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-500 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  Verify Status
                </button>
              </form>

              {/* Search Results */}
              {hasSearched && (
                <div>
                  {matchedApplication ? (
                    <div className="p-5 rounded-2xl bg-gray-800/80 border border-gray-700/80 space-y-4">
                      {/* Top Status Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-700/60">
                        <div>
                          <span className="font-mono font-bold text-indigo-400 text-sm">
                            {matchedApplication.applicationNo}
                          </span>
                          <h4 className="text-base font-bold text-white mt-0.5">
                            {matchedApplication.applicantName}
                          </h4>
                          <span className="text-xs text-gray-400">
                            Applied for {matchedApplication.targetClass} ({matchedApplication.academicYear})
                          </span>
                        </div>
                        <div className="self-start sm:self-auto">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              matchedApplication.status === 'Approved'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : matchedApplication.status === 'Interview Scheduled'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : matchedApplication.status === 'Under Review'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : matchedApplication.status === 'Rejected'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {matchedApplication.status}
                          </span>
                        </div>
                      </div>

                      {/* Detailed Status Breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 space-y-1">
                          <span className="text-gray-400 block text-[11px]">Parent / Guardian:</span>
                          <span className="font-semibold text-white">{matchedApplication.parentName} ({matchedApplication.parentRelation})</span>
                          <span className="text-gray-400 block font-mono text-[11px]">{matchedApplication.parentPhone}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 space-y-1">
                          <span className="text-gray-400 block text-[11px]">Previous Academic Merit:</span>
                          <span className="font-semibold text-white">{matchedApplication.previousSchool}</span>
                          <span className="text-emerald-400 font-bold block">{matchedApplication.previousMarksPercentage}% score</span>
                        </div>
                      </div>

                      {/* Attached Documents Status in Tracking */}
                      {Array.isArray(matchedApplication.documents) && matchedApplication.documents.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
                          <span className="text-gray-400 block text-[11px] font-semibold">
                            Uploaded Mandatory Documents ({matchedApplication.documents.length}):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {matchedApplication.documents.map((d: any, idx: number) => (
                              <span 
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-200"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{d.title}</span>
                                <span className="text-[10px] text-gray-400 font-mono">({d.fileName || d.fileSize || 'Attached'})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interview Notice Callout */}
                      {matchedApplication.status === 'Interview Scheduled' && matchedApplication.interviewDate && (
                        <div className="p-3.5 rounded-xl bg-indigo-950/50 border border-indigo-500/40 text-xs space-y-1">
                          <div className="flex items-center gap-2 font-bold text-indigo-300">
                            <Calendar className="w-4 h-4 text-indigo-400" />
                            <span>Interview Scheduled</span>
                          </div>
                          <p className="text-gray-200">
                            Date: <strong>{matchedApplication.interviewDate}</strong> ({matchedApplication.interviewTime || '10:00 AM'})
                          </p>
                          <p className="text-gray-300">
                            Venue: <strong>{matchedApplication.interviewVenue || "Principal's Office"}</strong>
                          </p>
                        </div>
                      )}

                      {/* Approved Enrollment Callout */}
                      {matchedApplication.status === 'Approved' && matchedApplication.assignedClassName && (
                        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs space-y-1">
                          <div className="flex items-center gap-2 font-bold text-emerald-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Admission Granted & Enrolled</span>
                          </div>
                          <p className="text-gray-200">
                            Assigned Class: <strong>{matchedApplication.assignedClassName}</strong> • Roll Number: <strong>#{matchedApplication.assignedRollNo}</strong>
                          </p>
                          <p className="text-[11px] text-gray-400">
                            Student account active in cloud school roster. Please complete fee deposit at counter.
                          </p>
                        </div>
                      )}

                      {/* Review Remarks */}
                      {matchedApplication.reviewerRemarks && (
                        <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 text-xs text-gray-300">
                          <span className="text-gray-400 block text-[10px] uppercase font-semibold mb-0.5">Official Remarks:</span>
                          <p>{matchedApplication.reviewerRemarks}</p>
                        </div>
                      )}

                      {/* Print Slip Action */}
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSlipApp(matchedApplication);
                            setSlipModalOpen(true);
                          }}
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-700 hover:bg-gray-600 text-white transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-indigo-400" />
                          Print Acknowledgment Slip
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-2xl bg-gray-800/40 border border-gray-800 space-y-2">
                      <AlertCircle className="w-8 h-8 text-gray-500 mx-auto" />
                      <p className="text-sm font-semibold text-gray-300">No application found</p>
                      <p className="text-xs text-gray-500">
                        Could not find any application matching "{trackQuery}". Please double check your Application ID or mobile number.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Slip Print Modal */}
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
