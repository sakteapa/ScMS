import React, { useState, useRef } from 'react';
import { 
  Printer, 
  Download, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  UserCheck, 
  Building2, 
  FileCheck,
  Lock,
  Unlock,
  AlertTriangle,
  ShieldAlert,
  CreditCard,
  ArrowUpRight,
  ShieldCheck,
  BookOpen,
  Filter,
  Users,
  Settings,
  X,
  Check,
  HelpCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import OnlineCheckoutModal from '../components/OnlineCheckoutModal';

export default function ReportCardView({ selectedStudentForReport }) {
  const { 
    students, 
    classes, 
    grades, 
    attendance, 
    fees, 
    reportCardWithholds, 
    checkReportCardAccess, 
    setStudentReportHold, 
    waiveStudentReportHold, 
    updateReportWithholdSettings,
    paymentConfig,
    systemConfig
  } = useSchool();
  const { currentUser, isStudent, isParent, isPrincipal, isVicePrincipal, isTeacher } = useAuth();

  const isManagement = isPrincipal || isVicePrincipal || isTeacher || currentUser?.role === 'superadmin';
  const isStudentOrParent = isStudent || isParent;

  // Selected Class Filter
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');

  // Selected Student
  const [activeStudentId, setActiveStudentId] = useState(() => {
    if (selectedStudentForReport?.id) return selectedStudentForReport.id;
    if (isStudent && currentUser?.studentId) return currentUser.studentId;
    if (isParent && currentUser?.wardStudentId) return currentUser.wardStudentId;
    return students[0]?.id || 'stu-101';
  });

  const [termName, setTermName] = useState('Mid-Term Assessment & Examination');
  const [academicYear, setAcademicYear] = useState('2026-2027');

  // Modals & States
  const [isWithholdModalOpen, setIsWithholdModalOpen] = useState(false);
  const [isOnlineCheckoutOpen, setIsOnlineCheckoutOpen] = useState(false);
  const [isBatchPrintMode, setIsBatchPrintMode] = useState(false);
  const [batchSkipWithheld, setBatchSkipWithheld] = useState(true);

  // Withhold Form State
  const [withholdForm, setWithholdForm] = useState({
    reason: 'fee_due',
    customReason: '',
    notes: '',
    waiveNote: ''
  });

  const student = students.find(s => s.id === activeStudentId) || students[0];
  const studentClass = classes.find(c => c.id === student?.classId) || classes[0];

  // Access check for current student
  const access = checkReportCardAccess(student?.id);

  // Filter students based on selected class
  const filteredStudents = students.filter(s => {
    if (isStudentOrParent) {
      if (isStudent) return s.id === currentUser?.studentId;
      if (isParent) return s.id === currentUser?.wardStudentId;
    }
    if (selectedClassFilter === 'All') return true;
    return s.classId === selectedClassFilter;
  });

  // Calculate fees for active student
  const totalFees = student?.totalFees || 36000;
  const paidFees = student?.paidFees || 0;
  const pendingFees = Math.max(0, totalFees - paidFees);

  // Fetch all grades for this student
  const studentGrades = grades.filter(g => g.studentId === student?.id);
  const classTests = studentGrades.filter(g => g.type === 'class_test');
  const examinations = studentGrades.filter(g => g.type === 'examination');

  // Distinct subjects taken by this student
  const subjectsSet = new Set(studentGrades.map(g => g.subject));
  if (subjectsSet.size === 0) {
    ['English', 'Mizo', 'Mathematics', 'Science', 'Social Science'].forEach(s => subjectsSet.add(s));
  }
  const subjects = Array.from(subjectsSet);

  let grandTotalMax = 0;
  let grandTotalObtained = 0;

  const subjectRows = subjects.map(subject => {
    // Continuous Class Test calculation (converted to 20% weightage)
    const ctList = classTests.filter(g => g.subject === subject);
    let ctMax = 0;
    let ctObtained = 0;
    ctList.forEach(g => {
      ctMax += g.maxMarks;
      ctObtained += g.marksObtained;
    });
    const ctScaled = ctMax > 0 ? Math.round((ctObtained / ctMax) * 20) : 18; // 20 marks max

    // Examination calculation (converted to 80% weightage)
    const exList = examinations.filter(g => g.subject === subject);
    let exMax = 0;
    let exObtained = 0;
    exList.forEach(g => {
      exMax += g.maxMarks;
      exObtained += g.marksObtained;
    });
    const exScaled = exMax > 0 ? Math.round((exObtained / exMax) * 80) : 72; // 80 marks max

    const total100 = ctScaled + exScaled;
    grandTotalMax += 100;
    grandTotalObtained += total100;

    let gradeLetter = 'A1';
    let gradePoint = '10.0';
    let remark = 'Outstanding proficiency';

    if (total100 >= 91) { gradeLetter = 'A1'; gradePoint = '10.0'; remark = 'Zirtur thiam tak leh fel tak'; }
    else if (total100 >= 81) { gradeLetter = 'A2'; gradePoint = '9.0'; remark = 'Excellent performance'; }
    else if (total100 >= 71) { gradeLetter = 'B1'; gradePoint = '8.0'; remark = 'Very good comprehension'; }
    else if (total100 >= 61) { gradeLetter = 'B2'; gradePoint = '7.0'; remark = 'Good effort & consistency'; }
    else if (total100 >= 51) { gradeLetter = 'C1'; gradePoint = '6.0'; remark = 'Above average progress'; }
    else if (total100 >= 41) { gradeLetter = 'C2'; gradePoint = '5.0'; remark = 'Average; needs practice'; }
    else if (total100 >= 33) { gradeLetter = 'D'; gradePoint = '4.0'; remark = 'Pass mark reached'; }
    else { gradeLetter = 'E'; gradePoint = '0.0'; remark = 'Needs remedial attention'; }

    return {
      subject,
      ctScaled,
      exScaled,
      total100,
      gradeLetter,
      gradePoint,
      remark
    };
  });

  const overallPercentage = grandTotalMax > 0 ? Math.round((grandTotalObtained / grandTotalMax) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  // Handle Save Withhold Settings for student
  const handleSaveWithhold = (withheldStatus) => {
    if (withheldStatus) {
      setStudentReportHold(student.id, {
        withheld: true,
        reason: withholdForm.reason,
        customReason: withholdForm.customReason || (
          withholdForm.reason === 'fee_due' ? `Pending school fee clearance (₹${pendingFees.toLocaleString('en-IN')})` :
          withholdForm.reason === 'library_clearance' ? 'Central library books/fine pending clearance' :
          withholdForm.reason === 'disciplinary_hold' ? 'Disciplinary & student conduct review hold' :
          withholdForm.reason === 'document_incomplete' ? 'Mandatory admission documents incomplete' :
          'Administrative hold'
        ),
        notes: withholdForm.notes,
        withheldBy: isPrincipal ? 'Rev. Dr. L. H. Rohmingliana (Principal)' : isVicePrincipal ? 'Vice Principal' : 'Examination Committee'
      });
      // Remove waiver if setting hold
      waiveStudentReportHold(student.id, { waived: false });
    } else {
      setStudentReportHold(student.id, { withheld: false });
    }
    setIsWithholdModalOpen(false);
  };

  // Handle Principal Waiver
  const handleToggleWaiver = () => {
    if (access.isWaived) {
      waiveStudentReportHold(student.id, { waived: false });
    } else {
      waiveStudentReportHold(student.id, {
        waived: true,
        waivedBy: 'Rev. Dr. L. H. Rohmingliana (Principal)',
        note: withholdForm.waiveNote || 'Special Principal academic waiver granted'
      });
    }
    setIsWithholdModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Dynamic Print Stylesheet for Flawless A4 Printing */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          body {
            background: white !important;
            color: #0f172a !important;
            font-size: 11pt !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print, nav, aside, header {
            display: none !important;
          }
          .printable-report-card {
            box-shadow: none !important;
            border: 2px solid #0f172a !important;
            border-radius: 0 !important;
            padding: 20px 24px !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background: white !important;
            color: #0f172a !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #475569 !important;
            padding: 5px 8px !important;
          }
          .bg-slate-900 {
            background-color: #0f172a !important;
            color: white !important;
          }
          .bg-slate-100, .bg-slate-50 {
            background-color: #f1f5f9 !important;
          }
        }
      `}</style>

      {/* TOP TOOLBAR (Hidden during print) */}
      <div className="no-print p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-cyan-400" />
              <span>MBSE Standard Progress Report Card</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
                Academic Year 2026-2027
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous Assessment (20%) + Term Examinations (80%) • Withholding governance &amp; A4 print layout.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isManagement && (
              <button
                onClick={() => setIsWithholdModalOpen(true)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow ${
                  access.isWithheld
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    : access.isWaived
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {access.isWithheld ? <Lock className="w-4 h-4 text-rose-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                <span>{access.isWithheld ? 'Report Withheld (Manage)' : 'Withhold / Lock Settings'}</span>
              </button>
            )}

            {(!access.isWithheld || isManagement) && (
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official A4 PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Student & Class Switchers */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80 text-xs">
          {/* Class Filter */}
          {isManagement && (
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Class:</span>
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="bg-transparent text-white focus:outline-none font-medium"
              >
                <option value="All" className="bg-slate-900 text-white">All Classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Select Student */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 flex-1 min-w-[240px]">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Student:</span>
            <select
              value={activeStudentId}
              onChange={(e) => setActiveStudentId(e.target.value)}
              className="bg-transparent text-white focus:outline-none font-medium flex-1 truncate"
            >
              {filteredStudents.map((s) => {
                const sAccess = checkReportCardAccess(s.id);
                return (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.firstName} {s.lastName} (Roll #{s.rollNo} • {s.admissionNo}) {sAccess.isWithheld ? '🔒 [WITHHELD]' : sAccess.isWaived ? '⚠️ [WAIVED]' : '✓'}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Term Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={termName}
              onChange={(e) => setTermName(e.target.value)}
              className="bg-transparent text-white focus:outline-none font-medium"
            >
              <option value="Mid-Term Assessment & Examination" className="bg-slate-900">Mid-Term Assessment (Combined)</option>
              <option value="Half-Yearly Examination 2026" className="bg-slate-900">Half-Yearly Examination</option>
              <option value="Annual Pre-Board Examination" className="bg-slate-900">Annual / Pre-Board Examination</option>
            </select>
          </div>
        </div>
      </div>

      {/* GOVERNANCE STATUS BANNER (For Management View) */}
      {isManagement && (
        <div className="no-print">
          {access.isWithheld ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/70 via-red-900/40 to-slate-900 border border-rose-500/50 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                      Progress Report Withheld (Khàr A Ni)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                      Locked from Student &amp; Parent
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 mt-0.5">
                    <strong>Chhan:</strong> {access.customReason || access.notes || 'School Management thu neihna hmangin khar a ni.'}
                  </p>
                  {access.pendingAmount && (
                    <span className="text-[11px] text-amber-300 font-mono">
                      Fee Balance Pending: ₹{access.pendingAmount.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleWaiver()}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Principal Waiver</span>
                </button>
                <button
                  onClick={() => handleSaveWithhold(false)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Release Hold</span>
                </button>
              </div>
            </div>
          ) : access.isWaived ? (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 shadow flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    Principal Administrative Waiver Active
                  </span>
                  <p className="text-xs text-slate-300">
                    He zirlai hi fee ba / hold awm mahse Principal thuthluknain report card en phalsak a ni e.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggleWaiver()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Revoke Waiver
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  <strong>Report Card Accessible:</strong> Zirlai leh Nu &amp; Pa ten he report card hi an hmu thei e.
                </span>
              </div>
              <button
                onClick={() => setIsWithholdModalOpen(true)}
                className="text-slate-400 hover:text-rose-400 underline font-medium"
              >
                Withhold / Khar duh em?
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* STUDENT & PARENT WITHHOLD LOCK SCREEN (When Access is Denied) */}
      {/* ============================================================ */}
      {isStudentOrParent && access.isWithheld && (
        <div className="max-w-2xl mx-auto my-8 p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-rose-950/40 border-2 border-rose-500/50 shadow-2xl text-center space-y-6 animate-fadeIn font-sans">
          <div className="w-20 h-20 rounded-2xl bg-rose-500/20 text-rose-400 border-2 border-rose-500/40 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
            <Lock className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Institutional Clearance Required
            </span>
            <h2 className="text-2xl font-black text-white font-['Outfit']">
              Progress Report Withheld
            </h2>
            <p className="text-sm font-semibold text-rose-400">
              Lehkha Thiamna Record / Marksheet Khar A Ni Rih E
            </p>
          </div>

          {/* Student Profile Cardlet */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-center gap-4 font-mono">
            <span>Student: <strong className="text-white">{student?.firstName} {student?.lastName}</strong></span>
            <span>•</span>
            <span>Roll #{student?.rollNo}</span>
            <span>•</span>
            <span>Class: {studentClass?.name}</span>
          </div>

          {/* Detailed Reason Box */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-rose-500/30 text-left space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">
                  {access.reason === 'fee_due' ? 'School Fee Clear Loh Vanga Khar' : 'Institutional Clearance Pending'}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {access.reason === 'fee_due' ? (
                    <>
                      Zirlai <strong>{student?.firstName} {student?.lastName}</strong>-i/a Progress Report hi school dan angin 
                      School Fee pek fel a nih hma chu en theih loh leh download theih lova khar (withheld) a ni rih e. 
                      Hnuai ami button hmang hian Fee Due balance hi Online-in a hmunah i pe fel nghal thei a, 
                      fee pek zawh rualin Report Card hi a in-unlock nghal dawn a ni.
                    </>
                  ) : (
                    access.customReason || access.notes || 'Khawngaihin school authority hnenah clearance la rawh le.'
                  )}
                </p>
              </div>
            </div>

            {access.pendingAmount && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Outstanding Fee Balance:</span>
                <span className="text-base font-black text-white font-mono">
                  ₹{access.pendingAmount.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          {/* Resolution Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {access.reason === 'fee_due' && (
              <button
                onClick={() => setIsOnlineCheckoutOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Outstanding Fee Online (Instant Unlock)</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}

            <a
              href="tel:+919436140001"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-2 border border-slate-700"
            >
              <span>Contact Accounts Desk</span>
            </a>
          </div>

          <p className="text-[11px] text-slate-500 pt-2">
            Accounts Helpdesk: info@mizoramschool.edu • Office Hours: 09:00 AM - 03:00 PM
          </p>
        </div>
      )}

      {/* ============================================================ */}
      {/* PRINTABLE OFFICIAL REPORT CARD (Visible when allowed or admin) */}
      {/* ============================================================ */}
      {(!isStudentOrParent || !access.isWithheld) && (
        <div className="printable-report-card max-w-4xl mx-auto rounded-2xl bg-white text-slate-900 border border-slate-300 shadow-2xl p-8 sm:p-10 font-sans relative">
          {/* Official MBSE Institutional Header */}
          <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1 relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-cyan-400 mb-2 shadow-md">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 font-['Outfit'] uppercase">
              {systemConfig?.schoolName || 'OHA (One Heart Academy)'}
            </h1>
            <p className="text-xs font-semibold text-slate-700 tracking-wider uppercase">
              Affiliated to Mizoram Board of School Education (MBSE) • Affiliation No: {systemConfig?.affiliationNo || 'MBSE-HSS-LGL-0421'} • Estd: {systemConfig?.establishedYear || '1998'}
            </p>
            <p className="text-xs text-slate-600">
              {systemConfig?.address || 'Lunglawn, Lunglei, Mizoram - 796701'} • Contact: {systemConfig?.contactPhone || '+91 372 2322104'}
            </p>
            <div className="pt-2">
              <span className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-900 text-white shadow-sm">
                LEHKHA THIAMNA LEH NUNGCHANG RECORD • OFFICIAL PROGRESS REPORT
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-800 pt-1 font-mono">
              {termName} • Academic Session: {academicYear}
            </p>
          </div>

          {/* Student Identification Profile Matrix */}
          <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Student Name</span>
              <span className="font-bold text-slate-900 text-sm">{student?.firstName} {student?.lastName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Admission Number</span>
              <span className="font-mono font-bold text-slate-900">{student?.admissionNo}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Class &amp; Stream</span>
              <span className="font-bold text-slate-900">
                {studentClass?.name} {student?.stream ? `(${student.stream.toUpperCase()})` : ''}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Roll Number</span>
              <span className="font-mono font-bold text-indigo-700 text-sm">#{student?.rollNo}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Parent / Guardian</span>
              <span className="font-medium text-slate-900">{student?.guardianName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Date of Birth</span>
              <span className="font-medium text-slate-900">{student?.dob}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Blood Group</span>
              <span className="font-bold text-rose-700 font-mono">{student?.bloodGroup}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Attendance Rate</span>
              <span className="font-bold text-emerald-700 font-mono">{student?.attendanceRate || 94.5}%</span>
            </div>
          </div>

          {/* Combined Assessment Marksheet Table */}
          <div className="overflow-x-auto my-6">
            <table className="w-full text-left text-xs border-collapse border border-slate-400">
              <thead className="bg-slate-100 text-slate-900 font-bold border-b-2 border-slate-400">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-300">Subject Name</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center">
                    Class Tests<br/>
                    <span className="text-[10px] font-normal text-slate-600">(Continuous 20M)</span>
                  </th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center">
                    Term Exam<br/>
                    <span className="text-[10px] font-normal text-slate-600">(Exam 80M)</span>
                  </th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center">
                    Total<br/>
                    <span className="text-[10px] font-normal text-slate-600">(100M)</span>
                  </th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center">Grade</th>
                  <th className="py-2.5 px-3 text-left">Remarks &amp; Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-slate-800">
                {subjectRows.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                    <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-300">
                      {row.subject}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono border-r border-slate-300">
                      {row.ctScaled}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono border-r border-slate-300">
                      {row.exScaled}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-950 border-r border-slate-300">
                      {row.total100}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold border-r border-slate-300 text-indigo-800">
                      {row.gradeLetter}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 italic">
                      {row.remark}
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Table Footer Aggregate */}
              <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-bold text-slate-900">
                <tr>
                  <td className="py-2.5 px-3 border-r border-slate-300 uppercase">
                    Grand Total Aggregates:
                  </td>
                  <td className="py-2.5 px-3 text-center border-r border-slate-300 font-mono">
                    {subjectRows.reduce((a, c) => a + c.ctScaled, 0)}
                  </td>
                  <td className="py-2.5 px-3 text-center border-r border-slate-300 font-mono">
                    {subjectRows.reduce((a, c) => a + c.exScaled, 0)}
                  </td>
                  <td className="py-2.5 px-3 text-center border-r border-slate-300 font-mono text-sm text-slate-950">
                    {grandTotalObtained} / {grandTotalMax}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono border-r border-slate-300 text-sm text-emerald-800">
                    {overallPercentage >= 80 ? 'A1' : overallPercentage >= 70 ? 'B1' : 'B2'}
                  </td>
                  <td className="py-2.5 px-3 text-emerald-800 uppercase tracking-wider font-bold">
                    Aggregate: {overallPercentage}% (Passed with Distinction)
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Co-Scholastic & Personality Assessment Matrix */}
          <div className="my-5 p-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs">
            <span className="font-bold text-slate-900 block mb-2 uppercase text-[10px] tracking-wider">
              Co-Scholastic Traits &amp; Behavioral Assessment (MBSE CCE Standard)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Discipline &amp; Conduct</span>
                <span className="font-bold text-slate-900">Exemplary (Grade A)</span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Work Ethic &amp; Homework</span>
                <span className="font-bold text-slate-900">Consistent &amp; Timely</span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Co-Curricular / Games</span>
                <span className="font-bold text-slate-900">Active Participant</span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Attitude to Teachers</span>
                <span className="font-bold text-slate-900">Respectful &amp; Courteous</span>
              </div>
            </div>
          </div>

          {/* Grading Scale Legend */}
          <div className="my-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-600">
            <span className="font-bold text-slate-800 block mb-1">MBSE Official Grading Scale:</span>
            <div className="flex flex-wrap items-center gap-3 font-mono">
              <span><strong>A1:</strong> 91-100% (Outstanding)</span>
              <span><strong>A2:</strong> 81-90% (Excellent)</span>
              <span><strong>B1:</strong> 71-80% (Very Good)</span>
              <span><strong>B2:</strong> 61-70% (Good)</span>
              <span><strong>C1:</strong> 51-60% (Fair)</span>
              <span><strong>C2:</strong> 41-50% (Average)</span>
              <span><strong>D:</strong> 33-40% (Pass)</span>
              <span><strong>E:</strong> Below 33% (Needs Remedial)</span>
            </div>
          </div>

          {/* Teacher Comments & Signatures */}
          <div className="mt-8 pt-6 border-t-2 border-slate-300 space-y-6">
            <div className="p-3.5 rounded-xl border border-dashed border-slate-400 bg-slate-50/50">
              <span className="text-[10px] uppercase font-bold text-slate-600 block">Class Teacher Assessment &amp; Remarks:</span>
              <p className="text-xs text-slate-800 italic mt-1">
                "{student?.firstName} has shown tremendous academic aptitude, high discipline, and regular classroom attendance. His critical analytical skills in Physics and Mathematics are exemplary."
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4 pt-8 text-center text-xs items-end">
              <div className="border-t border-slate-800 pt-2">
                <span className="font-bold text-slate-900 block">Lalthlamuana Sailo</span>
                <span className="text-[10px] text-slate-600">Class Teacher Signature</span>
              </div>

              <div className="border-t border-slate-800 pt-2">
                <span className="font-bold text-slate-900 block">Dr. C. Lalremruata</span>
                <span className="text-[10px] text-slate-600">Exam Superintendent</span>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-[8px] font-bold text-slate-500 uppercase text-center p-1">
                  Official School Seal
                </div>
                <span className="text-[9px] text-slate-500 mt-1 font-semibold">Institutional Stamp</span>
              </div>

              <div className="border-t border-slate-800 pt-2">
                <span className="font-bold text-slate-900 block">Rev. Dr. L. H. Rohmingliana</span>
                <span className="text-[10px] text-slate-600">Principal Signature</span>
              </div>
            </div>

            {/* Bottom Security QR Code & MBSE Verification */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500">
              <div className="flex items-center gap-2.5">
                <div className="p-1 bg-white border border-slate-300 rounded shadow-sm">
                  <QRCodeSVG
                    value={JSON.stringify({
                      reportCardNo: `RC-${student?.admissionNo}-${termName.slice(0, 4)}`,
                      studentId: student?.id,
                      name: `${student?.firstName} ${student?.lastName}`,
                      percentage: overallPercentage,
                      verified: true,
                      school: systemConfig?.schoolName || 'OHA (One Heart Academy)'
                    })}
                    size={42}
                    level="M"
                  />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block font-mono">
                    SEC-REP-{student?.admissionNo}-2026
                  </span>
                  <span>Scan QR code with mobile phone to verify authentic grade record</span>
                </div>
              </div>

              <div className="text-right font-mono">
                <div>Date of Issue: {new Date().toLocaleDateString('en-IN')}</div>
                <div>{systemConfig?.schoolName || 'OHA (One Heart Academy)'} • MBSE Regd.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: WITHHOLD & CLEARANCE GOVERNANCE (For Management) */}
      {/* ============================================================ */}
      {isWithholdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 text-white shadow-2xl p-6 font-sans space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Progress Report Withholding Governance
                  </h3>
                  <p className="text-xs text-slate-400">
                    {student?.firstName} {student?.lastName} ({student?.admissionNo})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWithholdModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Status Overview */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Access Status:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                  access.isWithheld 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                    : access.isWaived
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {access.isWithheld ? 'Locked / Withheld' : access.isWaived ? 'Principal Waived' : 'Active / Released'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Fee Balance Dues:</span>
                <span className="font-mono font-bold text-white">
                  ₹{pendingFees.toLocaleString('en-IN')} ({pendingFees === 0 ? 'Fully Cleared' : 'Unpaid Balance'})
                </span>
              </div>
              {access.isWithheld && (
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-rose-300">
                  <strong>Withheld Reason:</strong> {access.customReason || access.notes}
                </div>
              )}
            </div>

            {/* Global Auto-Fee Withhold Policy Setting */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  <span>Global Auto-Fee Withholding Policy</span>
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportCardWithholds?.autoFeeWithhold ?? true}
                    onChange={(e) => updateReportWithholdSettings({ autoFeeWithhold: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>
              <p className="text-[11px] text-slate-400">
                He policy hi a on chuan, zirlai fee la ba zawng zawng (due &gt; ₹0) progress report chu auto-in a in-lock ang a, fee an pek fel rualin a in-unlock nghal ang.
              </p>
            </div>

            {/* Set Specific Hold / Reason */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white">Select Hold Reason (Khar chhan tur thlang rawh):</h4>
              
              <div className="space-y-2">
                {[
                  { key: 'fee_due', label: 'School Fee Dues Pending (Fee clear loh vangin)', desc: `Unpaid fee balance of ₹${pendingFees.toLocaleString('en-IN')}` },
                  { key: 'library_clearance', label: 'Library Clearance Pending (Lehkhabu pulh dah let loh)', desc: 'Books overdue or unpaid library fines' },
                  { key: 'disciplinary_hold', label: 'Disciplinary & Conduct Review (Nungchang / Thununna)', desc: 'Conduct investigation or suspension' },
                  { key: 'document_incomplete', label: 'Mandatory Admission Documents Missing', desc: 'Birth certificate, TC or ST card pending' },
                  { key: 'manual_admin', label: 'Administrative Discretion (School Management)', desc: 'Custom withholding order' }
                ].map(item => (
                  <label 
                    key={item.key} 
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                      withholdForm.reason === item.key 
                        ? 'bg-rose-950/30 border-rose-500 text-white' 
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="withholdReason"
                      value={item.key}
                      checked={withholdForm.reason === item.key}
                      onChange={(e) => setWithholdForm({ ...withholdForm, reason: e.target.value })}
                      className="mt-0.5 text-rose-500 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold block">{item.label}</span>
                      <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">
                  Custom Notice Text for Student &amp; Parent:
                </label>
                <textarea
                  rows={2}
                  placeholder="Khawngaihin school office-ah fee emaw library clearance la tura hriattir in ni..."
                  value={withholdForm.notes}
                  onChange={(e) => setWithholdForm({ ...withholdForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleWaiver}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    access.isWaived
                      ? 'bg-slate-800 text-slate-300 border-slate-700'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{access.isWaived ? 'Revoke Principal Waiver' : 'Grant Principal Waiver'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {access.isWithheld ? (
                  <button
                    type="button"
                    onClick={() => handleSaveWithhold(false)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Release / Unlock Now</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSaveWithhold(true)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Withhold / Lock Report Card</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Online Gateway Checkout Modal for Student/Parent */}
      <OnlineCheckoutModal
        isOpen={isOnlineCheckoutOpen}
        onClose={() => setIsOnlineCheckoutOpen(false)}
        student={student}
        feeAmount={pendingFees > 0 ? pendingFees : 12000}
        feeType="School Tuition & Institutional Fee Clearance"
        onPaymentSuccess={() => {
          setIsOnlineCheckoutOpen(false);
        }}
      />
    </div>
  );
}
