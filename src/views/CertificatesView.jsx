import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Search,
  Award,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  User,
  ShieldCheck,
  Download,
  Plus,
  RefreshCw,
  QrCode,
  Sparkles,
  BookOpen,
  Filter,
  FileCheck,
  X,
  Eye,
  Check
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import OfficialSealSignatureModal from '../components/OfficialSealSignatureModal';

export default function CertificatesView() {
  const { students, classes, issuedCertificates = [], issueCertificate, revokeCertificate, deleteCertificate, sealConfig, systemConfig } = useSchool();
  const { isPrincipal, isVicePrincipal, isSuperAdmin } = useAuth();
  const canIssue = isPrincipal || isVicePrincipal || isSuperAdmin;

  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'register'
  const [selectedCertType, setSelectedCertType] = useState('transfer'); // 'transfer' | 'migration' | 'character'
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [isSealModalOpen, setIsSealModalOpen] = useState(false);

  // Form State for Generator
  const [certForm, setCertForm] = useState({
    certNumber: 'TC/2026/043',
    bookNumber: 'BK/2026/04',
    studentId: students[0]?.id || '',
    studentName: 'Lalmuanpuia Pachuau',
    admissionNo: 'MZ-2026-0101',
    rollNo: '01',
    fatherName: 'P.C. Lalthanmawia',
    motherName: 'Lalnunfeli',
    nationality: 'Indian',
    category: 'Scheduled Tribe (Mizo)',
    dob: '2008-04-12',
    dobInWords: 'Twelfth April Two Thousand Eight',
    admissionDate: '2024-06-01',
    admissionClass: 'Class 11 Science',
    classLastStudied: 'Class 12 - Science',
    stream: 'Science',
    academicYear: '2025-2026',
    boardExamResult: 'Passed HSSLC Pre-Board with Distinction',
    failedStatus: 'No',
    subjectsStudied: 'Physics, Chemistry, Mathematics, English, Mizo',
    qualifiedForPromotion: 'Yes, Qualified for University Degree Course',
    feeClearance: 'All school dues cleared up to March 2026',
    feeConcession: 'No',
    totalWorkingDays: '216 Days',
    daysPresent: '204 Days (94.4%)',
    extraCurricular: 'School Basketball Team Captain, Science Society',
    conduct: 'Exemplary & Diligent',
    applicationDate: '2026-08-28',
    issueDate: new Date().toISOString().slice(0, 10),
    reasonForLeaving: 'Higher Secondary Completed / Pursuing B.Tech Engineering in NIT Mizoram',
    destinationBoard: 'National Institute of Technology (NIT) Mizoram',
    remarks: 'Character and conduct have been very satisfactory throughout his tenure.',
    preparedBy: 'Pu R. Laltluanga (Head Clerk)',
    authorizedBy: 'Rev. Dr. L. H. Rohmingliana (Principal)'
  });

  // Register Filter
  const [registerFilter, setRegisterFilter] = useState('all');
  const [registerSearch, setRegisterSearch] = useState('');
  const [reprintCert, setReprintCert] = useState(null);

  // Auto-fill form when student is selected
  const handleStudentSelect = (stuId) => {
    setSelectedStudentId(stuId);
    const stu = students.find(s => s.id === stuId);
    if (!stu) return;

    const stuClass = classes.find(c => c.id === stu.classId);
    const certPrefix = selectedCertType === 'transfer' ? 'TC' : selectedCertType === 'migration' ? 'MIG' : 'BON';
    const autoNumber = `${certPrefix}/2026/0${(issuedCertificates.length + 45).toString().padStart(2, '0')}`;

    setCertForm(prev => ({
      ...prev,
      certNumber: autoNumber,
      studentId: stu.id,
      studentName: `${stu.firstName} ${stu.lastName}`,
      admissionNo: stu.admissionNo,
      rollNo: stu.rollNo,
      fatherName: stu.guardianName || 'Lalthanpuia',
      motherName: 'Lalduhawmi',
      dob: stu.dob || '2008-01-01',
      classLastStudied: `${stuClass?.name || 'Class 12'} (${stu.stream ? stu.stream.toUpperCase() : 'General'})`,
      stream: stu.stream ? stu.stream.toUpperCase() : 'General',
      daysPresent: `${Math.round(216 * (stu.attendanceRate / 100))} / 216 Days (${stu.attendanceRate}%)`,
      feeClearance: stu.feeStatus === 'cleared' ? 'All dues cleared in full' : 'Clearance provisional upon final ledger audit',
      conduct: 'Good & Well Behaved'
    }));
  };

  const handleCertTypeChange = (type) => {
    setSelectedCertType(type);
    const certPrefix = type === 'transfer' ? 'TC' : type === 'migration' ? 'MIG' : 'BON';
    const autoNumber = `${certPrefix}/2026/0${(issuedCertificates.length + 45).toString().padStart(2, '0')}`;
    setCertForm(prev => ({ ...prev, certNumber: autoNumber }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveAndIssue = (e) => {
    e.preventDefault();
    issueCertificate({
      ...certForm,
      certType: selectedCertType
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {}

    alert(`Official ${selectedCertType.toUpperCase()} Certificate (${certForm.certNumber}) has been generated and recorded in the institutional register!`);
  };

  // Filtered Register Records
  const filteredRegister = issuedCertificates.filter(cert => {
    const matchesType = registerFilter === 'all' || cert.certType === registerFilter;
    const matchesSearch = !registerSearch ||
      cert.studentName.toLowerCase().includes(registerSearch.toLowerCase()) ||
      cert.certNumber.toLowerCase().includes(registerSearch.toLowerCase()) ||
      cert.admissionNo.toLowerCase().includes(registerSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
            <span>Institutional Certificates &amp; TC Generator</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
              MBSE Standard Format
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Generate and print official School Transfer Certificates (TC), Migration Certificates, and Character/Bonafide Certificates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canIssue && (
            <button
              onClick={() => setIsSealModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/30 font-bold text-xs transition flex items-center gap-1.5 shadow"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Official Seal &amp; Signature Studio</span>
            </button>
          )}

          {/* Tab Switcher */}
          <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('generator')}
              className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'generator' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Certificate Generator</span>
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'register' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Issued Register ({issuedCertificates.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: CERTIFICATE GENERATOR & LIVE PREVIEW */}
      {activeTab === 'generator' && (
        <div className="space-y-6">
          {/* Certificate Type Selector & Quick Student Auto-Fill Bar */}
          <div className="no-print p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            {/* Format Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleCertTypeChange('transfer')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedCertType === 'transfer'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Transfer Certificate (TC)</span>
              </button>
              <button
                type="button"
                onClick={() => handleCertTypeChange('migration')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedCertType === 'migration'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Migration Certificate</span>
              </button>
              <button
                type="button"
                onClick={() => handleCertTypeChange('character')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedCertType === 'character'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Bonafide &amp; Character Cert</span>
              </button>
            </div>

            {/* Quick Student Select */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-semibold">Select Student:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => handleStudentSelect(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} ({s.admissionNo})
                  </option>
                ))}
              </select>
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-white text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>

          {/* Generator Layout: 2 Columns (Left: Field Editor, Right: A4 Document Sheet) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 5 Cols: Quick Field Controls */}
            <div className="no-print lg:col-span-5 space-y-4 max-h-[850px] overflow-y-auto pr-1">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-white uppercase tracking-wider text-[11px] text-cyan-400">
                    Certificate Particulars Editor
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">{certForm.certNumber}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Certificate / TC No *</label>
                    <input
                      type="text"
                      value={certForm.certNumber}
                      onChange={(e) => setCertForm({ ...certForm, certNumber: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Book No</label>
                    <input
                      type="text"
                      value={certForm.bookNumber}
                      onChange={(e) => setCertForm({ ...certForm, bookNumber: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      value={certForm.studentName}
                      onChange={(e) => setCertForm({ ...certForm, studentName: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Admission No</label>
                    <input
                      type="text"
                      value={certForm.admissionNo}
                      onChange={(e) => setCertForm({ ...certForm, admissionNo: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Father's Name</label>
                    <input
                      type="text"
                      value={certForm.fatherName}
                      onChange={(e) => setCertForm({ ...certForm, fatherName: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Mother's Name</label>
                    <input
                      type="text"
                      value={certForm.motherName}
                      onChange={(e) => setCertForm({ ...certForm, motherName: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Date of Birth (Fig)</label>
                    <input
                      type="date"
                      value={certForm.dob}
                      onChange={(e) => setCertForm({ ...certForm, dob: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Nationality / Category</label>
                    <input
                      type="text"
                      value={certForm.category}
                      onChange={(e) => setCertForm({ ...certForm, category: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">DOB In Words</label>
                  <input
                    type="text"
                    value={certForm.dobInWords}
                    onChange={(e) => setCertForm({ ...certForm, dobInWords: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Class Last Studied</label>
                    <input
                      type="text"
                      value={certForm.classLastStudied}
                      onChange={(e) => setCertForm({ ...certForm, classLastStudied: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Annual Exam Result</label>
                    <input
                      type="text"
                      value={certForm.boardExamResult}
                      onChange={(e) => setCertForm({ ...certForm, boardExamResult: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Subjects Studied</label>
                  <input
                    type="text"
                    value={certForm.subjectsStudied}
                    onChange={(e) => setCertForm({ ...certForm, subjectsStudied: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Attendance Record</label>
                    <input
                      type="text"
                      value={certForm.daysPresent}
                      onChange={(e) => setCertForm({ ...certForm, daysPresent: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">General Conduct</label>
                    <input
                      type="text"
                      value={certForm.conduct}
                      onChange={(e) => setCertForm({ ...certForm, conduct: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Reason for Leaving</label>
                  <textarea
                    rows={2}
                    value={certForm.reasonForLeaving}
                    onChange={(e) => setCertForm({ ...certForm, reasonForLeaving: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                {selectedCertType === 'migration' && (
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Destination University / Board</label>
                    <input
                      type="text"
                      value={certForm.destinationBoard}
                      onChange={(e) => setCertForm({ ...certForm, destinationBoard: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAndIssue}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold transition shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save to Issued Register</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 7 Cols: Live A4 Printable Sheet */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="printable-certificate-sheet w-full max-w-[760px] bg-white text-slate-950 p-8 sm:p-10 shadow-2xl rounded-2xl border-4 border-double border-slate-900 font-serif relative">
                {/* Certificate Watermark Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                  <span className="text-8xl font-black uppercase tracking-widest text-slate-900 rotate-[-30deg]">
                    {systemConfig?.schoolName?.slice(0, 15) || 'OXFORD HIGHER'}
                  </span>
                </div>

                {/* Institutional Crest Header */}
                <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600 font-sans block">
                    Government of Mizoram • Department of School Education
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 font-['Outfit']">
                    {systemConfig?.schoolName || 'OHA (Oxford Higher Academy)'}
                  </h1>
                  <p className="text-[11px] text-slate-700 uppercase tracking-wide font-sans font-semibold">
                    Affiliated to Mizoram Board of School Education (MBSE)
                  </p>
                  <div className="flex items-center justify-center gap-4 text-[10px] text-slate-600 font-mono font-medium pt-0.5">
                    <span>Affiliation No: {systemConfig?.affiliationNo || 'MBSE-HSS-LGL-0421'}</span>
                    <span>•</span>
                    <span>Estd: {systemConfig?.establishedYear || '1998'}</span>
                    <span>•</span>
                    <span>Campus: {systemConfig?.address?.split(',')[0] || 'Lunglawn, Lunglei'}</span>
                  </div>
                  <div className="pt-2">
                    <span className="inline-block px-4 py-1 rounded-full border-2 border-slate-900 text-xs uppercase tracking-widest font-black font-sans bg-slate-100 shadow-sm">
                      {selectedCertType === 'transfer' ? 'TRANSFER CERTIFICATE (TC)' : selectedCertType === 'migration' ? 'MIGRATION CERTIFICATE' : 'BONAFIDE & CHARACTER CERTIFICATE'}
                    </span>
                  </div>
                </div>

                {/* Top Reference Metadata Line */}
                <div className="flex items-center justify-between text-xs py-3 border-b border-slate-300 font-sans">
                  <div>
                    <span className="text-slate-600">TC / Cert No: </span>
                    <strong className="font-mono font-bold text-slate-950">{certForm.certNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-600">Book No: </span>
                    <strong className="font-mono text-slate-900">{certForm.bookNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-600">Admission No: </span>
                    <strong className="font-mono text-slate-900">{certForm.admissionNo}</strong>
                  </div>
                  <div>
                    <span className="text-slate-600">Date of Issue: </span>
                    <strong className="font-mono text-slate-900">{certForm.issueDate}</strong>
                  </div>
                </div>

                {/* Body Content by Certificate Type */}
                {selectedCertType === 'transfer' && (
                  <div className="py-4 space-y-2 text-xs leading-relaxed font-sans">
                    <div className="flex border-b border-dotted border-slate-300 py-1">
                      <span className="w-1/2 text-slate-700">1. Name of the Pupil:</span>
                      <span className="w-1/2 font-bold uppercase text-slate-950">{certForm.studentName}</span>
                    </div>
                    <div className="flex border-b border-dotted border-slate-300 py-1">
                      <span className="w-1/2 text-slate-700">2. Father's / Guardian's Name:</span>
                      <span className="w-1/2 font-bold text-slate-950">{certForm.fatherName}</span>
                    </div>
                    <div className="flex border-b border-dotted border-slate-300 py-1">
                      <span className="w-1/2 text-slate-700">3. Mother's Name:</span>
                      <span className="w-1/2 font-bold text-slate-950">{certForm.motherName}</span>
                    </div>
                    <div className="flex border-b border-dotted border-slate-300 py-1">
                      <span className="w-1/2 text-slate-700">4. Nationality &amp; Social Category:</span>
                      <span className="w-1/2 text-slate-900">{certForm.nationality} • {certForm.category}</span>
                    </div>
                    <div className="flex border-b border-dotted border-slate-300 py-1">
                      <span className="w-1/2 text-slate-700">5. Date of first admission into school with class:</span>
                      <span className="w-1/2 text-slate-900">{certForm.admissionDate} ({certForm.admissionClass})</span>
                    </div>
                    <div className="flex border-b border-dotted border-slate-300 py-1">
                      <span className="w-1/2 text-slate-700">6. Date of Birth (in figures and words):</span>
                      <span className="w-1/2 text-slate-900">
                        <strong className="font-mono">{certForm.dob}</strong> ({certForm.dobInWords})
                      </span>
                    </div>
                    <div className="flex border-b border-dotted border-slate-300 py-1">
                      <span className="w-1/2 text-slate-700">7. Class in which the pupil last studied:</span>
                      <span className="w-1/2 font-bold text-slate-950">{certForm.classLastStudied}</span>
                    </div>
                    <div className="flex border-b border-dotted border-slate-300 py-1">
                      <span className="w-1/2 text-slate-700">8. School / Board Annual Exam last taken:</span>
                      <span className="w-1/2 text-slate-900 font-medium">{certForm.boardExamResult}</span>
                    </div>
                    <div className="flex border-b border-dotted border-slate-300 py-1">
                      <span className="w-1/2 text-slate-700">9. Whether failed, if so once/twice:</span>
                      <span className="w-1/2 text-slate-900">{certForm.failedStatus}</span>
                    </div>
                    <div className="flex border-b border-dotted border-slate-300 py-1">
                      <span className="w-1/2 text-slate-700">10. Subjects studied:</span>
                      <span className="w-1/2 text-slate-900">{certForm.subjectsStudied}</span>
                    </div>
                    <div className="flex border-b border-dotted border-slate-300 py-1">
                      <span className="w-1/2 text-slate-700">11. Whether qualified for promotion to higher class:</span>
                      <span className="w-1/2 font-bold text-emerald-800">{certForm.qualifiedForPromotion}</span>
                    </div>
                    <div className="flex border-b border-dotted border-slate-300 py-1">
                      <span className="w-1/2 text-slate-700">12. Month up to which pupil paid school dues:</span>
                      <span className="w-1/2 text-slate-900">{certForm.feeClearance}</span>
                    </div>
                    <div className="flex border-b border-dotted border-slate-300 py-1">
                      <span className="w-1/2 text-slate-700">13. Total attendance in academic session:</span>
                      <span className="w-1/2 font-mono font-medium text-slate-900">{certForm.daysPresent}</span>
                    </div>
                    <div className="flex border-b border-dotted border-slate-300 py-1">
                      <span className="w-1/2 text-slate-700">14. General conduct &amp; character:</span>
                      <span className="w-1/2 font-bold text-slate-950">{certForm.conduct}</span>
                    </div>
                    <div className="flex border-b border-dotted border-slate-300 py-1">
                      <span className="w-1/2 text-slate-700">15. Reason for leaving the school:</span>
                      <span className="w-1/2 text-slate-900">{certForm.reasonForLeaving}</span>
                    </div>
                  </div>
                )}

                {selectedCertType === 'migration' && (
                  <div className="py-8 space-y-4 text-sm leading-relaxed text-slate-800 font-sans text-justify">
                    <p>
                      This is to officially certify that <strong className="uppercase font-bold text-slate-950">{certForm.studentName}</strong>, Son/Daughter of <strong className="text-slate-950">{certForm.fatherName}</strong> and <strong className="text-slate-950">{certForm.motherName}</strong>, having Admission No: <strong className="font-mono text-slate-950">{certForm.admissionNo}</strong>, was a bonafide student of this institution in <strong className="text-slate-950">{certForm.classLastStudied}</strong> during the academic session <strong className="text-slate-950">{certForm.academicYear}</strong>.
                    </p>
                    <p>
                      He/She has successfully appeared for the Higher Secondary Examination / Assessment and has cleared all institutional dues.
                    </p>
                    <p>
                      This school has <strong className="text-slate-950 uppercase">No Objection</strong> whatsoever to his/her admission or migration to <strong className="text-slate-950">{certForm.destinationBoard || 'any recognized Board / University / College in India'}</strong> for continuing his/her higher education.
                    </p>
                    <p>
                      His/Her conduct and character during his/her tenure at this institution have been <strong className="text-slate-950">{certForm.conduct}</strong>. We wish him/her success in all future academic pursuits.
                    </p>
                  </div>
                )}

                {selectedCertType === 'character' && (
                  <div className="py-8 space-y-4 text-sm leading-relaxed text-slate-800 font-sans text-justify">
                    <p>
                      TO WHOMSOEVER IT MAY CONCERN
                    </p>
                    <p>
                      This is to certify that <strong className="uppercase font-bold text-slate-950">{certForm.studentName}</strong>, Son/Daughter of <strong className="text-slate-950">{certForm.fatherName}</strong>, resident of {certForm.district || 'Lunglei'}, Mizoram, is a bonafide student of {systemConfig?.schoolName || 'OHA (Oxford Higher Academy)'}, studying in <strong className="text-slate-950">{certForm.classLastStudied}</strong>, Roll No: <strong className="font-mono text-slate-950">{certForm.rollNo}</strong>, Admission No: <strong className="font-mono text-slate-950">{certForm.admissionNo}</strong>.
                    </p>
                    <p>
                      To the best of our official knowledge and institutional records, he/she bears an <strong className="text-slate-950">{certForm.conduct}</strong> moral character and has shown sincere diligence and exemplary participation in school curricular and sports activities.
                    </p>
                    <p>
                      This certificate is issued upon the request of the parent/guardian for the purpose of scholarship, admission verification, and official identification.
                    </p>
                  </div>
                )}

                {/* Bottom Verification & Signatures Bar */}
                <div className="pt-6 border-t-2 border-slate-900 font-sans">
                  <div className="flex items-end justify-between">
                    {/* Security QR Code */}
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 border border-slate-400 rounded-lg bg-white shadow-sm">
                        <QRCodeSVG
                          value={JSON.stringify({
                            school: systemConfig?.schoolName || "OHA (Oxford Higher Academy)",
                            certType: selectedCertType,
                            certNo: certForm.certNumber,
                            student: certForm.studentName,
                            admNo: certForm.admissionNo,
                            issued: certForm.issueDate,
                            verified: true
                          })}
                          size={54}
                          level="M"
                        />
                      </div>
                      <div className="text-[9px] text-slate-600 font-mono space-y-0.5">
                        <span className="block font-bold text-slate-800 uppercase">Institutional Verification</span>
                        <span className="block">DIGITAL-SEC-{certForm.admissionNo}</span>
                        <span className="block text-[8px] text-slate-500">Scan to verify authenticity</span>
                      </div>
                    </div>

                    {/* Signatures */}
                    <div className="flex items-end gap-6 text-center text-[10px] text-slate-700">
                      <div>
                        <div className="w-20 h-9 border-b border-dashed border-slate-500 mx-auto"></div>
                        <span className="block mt-1 font-semibold">Prepared By (Clerk)</span>
                      </div>
                      <div>
                        <div className="w-20 h-9 border-b border-dashed border-slate-500 mx-auto"></div>
                        <span className="block mt-1 font-semibold">Checked By (VP)</span>
                      </div>
                      <div className="text-center relative min-w-[120px]">
                        {/* Live Golden Circular Emblem Seal */}
                        {sealConfig?.showSealOnCertificates && (
                          <div 
                            className="absolute -top-14 -left-10 w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center p-1 opacity-80 pointer-events-none select-none z-10"
                            style={{ borderColor: sealConfig?.sealColor || '#d97706', color: sealConfig?.sealColor || '#d97706' }}
                          >
                            <ShieldCheck className="w-5 h-5 mb-0.5" />
                            <span className="text-[6px] font-black uppercase tracking-tighter leading-none text-center">
                              {sealConfig?.schoolCrestText?.split('•')[0] || 'MIZORAM HSS'}
                            </span>
                            <span className="text-[5px] font-bold font-mono mt-0.5">ESTD {sealConfig?.establishedYear || 1984}</span>
                          </div>
                        )}

                        <div className="h-10 flex items-end justify-center">
                          {sealConfig?.signatureMode === 'drawn' && sealConfig?.signatureSvgData ? (
                            <img src={sealConfig.signatureSvgData} alt="Principal Signature" className="max-h-9 max-w-[130px] object-contain" />
                          ) : (
                            <span className="font-serif italic text-lg font-bold text-blue-950 tracking-wider" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                              {sealConfig?.principalSignatoryName || 'Rev. Dr. L. H. Rohmingliana'}
                            </span>
                          )}
                        </div>
                        <div className="w-28 border-b border-slate-900 mx-auto"></div>
                        <span className="block mt-1 font-bold text-slate-950 uppercase text-[9px]">
                          {sealConfig?.principalDesignation || 'Principal & Official Seal'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ISSUED CERTIFICATES REGISTER */}
      {activeTab === 'register' && (
        <div className="space-y-5">
          {/* Register Toolbar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {['all', 'transfer', 'migration', 'character'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setRegisterFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                    registerFilter === cat
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat === 'all' ? `All (${issuedCertificates.length})` : cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student, TC No, or Adm No..."
                value={registerSearch}
                onChange={(e) => setRegisterSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Table of Issued Certificates */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Cert / TC No.</th>
                  <th className="py-3.5 px-4 font-semibold">Student Name &amp; Adm No</th>
                  <th className="py-3.5 px-4 font-semibold">Type</th>
                  <th className="py-3.5 px-4 font-semibold">Class / Stream</th>
                  <th className="py-3.5 px-4 font-semibold">Date of Issue</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRegister.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                      No certificate records match your search query.
                    </td>
                  </tr>
                ) : (
                  filteredRegister.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                        {cert.certNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{cert.studentName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{cert.admissionNo}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          cert.certType === 'transfer' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                          cert.certType === 'migration' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {cert.certType === 'transfer' ? 'TC' : cert.certType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {cert.classLastStudied}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {cert.issueDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          cert.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {cert.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedCertType(cert.certType);
                              setCertForm({ ...cert });
                              setActiveTab('generator');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-[11px] transition flex items-center gap-1"
                            title="Load into Certificate Sheet & Print"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View &amp; Print</span>
                          </button>
                          {cert.status === 'active' && canIssue && (
                            <button
                              onClick={() => {
                                if (window.confirm(`He certificate (${cert.certNumber}) hi cancel / revoke i duh tak tak em?`)) {
                                  revokeCertificate(cert.id, 'Revoked by Administration');
                                }
                              }}
                              className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-[11px] transition"
                              title="Revoke / Cancel Certificate"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OFFICIAL SEAL & SIGNATURE STUDIO MODAL */}
      <OfficialSealSignatureModal
        isOpen={isSealModalOpen}
        onClose={() => setIsSealModalOpen(false)}
      />
    </div>
  );
}
