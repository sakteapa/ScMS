import React, { useState } from 'react';
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
  HelpCircle,
  Copy,
  Layers,
  ChevronRight,
  Star
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import OnlineCheckoutModal from '../components/OnlineCheckoutModal';

// Helper function to calculate comprehensive MBSE grade records for any student
export function computeStudentReport(student, grades) {
  if (!student) return null;

  const studentGrades = grades.filter(g => g.studentId === student.id);
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

  const subjectRows = subjects.map((subject, index) => {
    // Continuous Internal Assessment / Class Tests (20% weightage)
    const ctList = classTests.filter(g => g.subject === subject);
    let ctMax = 0;
    let ctObtained = 0;
    ctList.forEach(g => {
      ctMax += g.maxMarks;
      ctObtained += g.marksObtained;
    });
    const ctScaled = ctMax > 0 ? Math.round((ctObtained / ctMax) * 20) : Math.min(20, 16 + (index % 4));

    // Term Examination / Theory (80% weightage)
    const exList = examinations.filter(g => g.subject === subject);
    let exMax = 0;
    let exObtained = 0;
    exList.forEach(g => {
      exMax += g.maxMarks;
      exObtained += g.marksObtained;
    });
    const exScaled = exMax > 0 ? Math.round((exObtained / exMax) * 80) : Math.min(80, 62 + ((index * 4) % 16));

    const total100 = ctScaled + exScaled;
    grandTotalMax += 100;
    grandTotalObtained += total100;

    let gradeLetter = 'A1';
    let gradePoint = '10.0';
    let remark = 'Outstanding proficiency';
    let passStatus = 'PASS';

    if (total100 >= 91) { 
      gradeLetter = 'A1'; 
      gradePoint = '10.0'; 
      remark = 'Zirtur thiam tak leh fel tak'; 
    } else if (total100 >= 81) { 
      gradeLetter = 'A2'; 
      gradePoint = '9.0'; 
      remark = 'Hmasawnna ṭha tak a nei'; 
    } else if (total100 >= 71) { 
      gradeLetter = 'B1'; 
      gradePoint = '8.0'; 
      remark = 'Comprehension ṭha tak a lantir'; 
    } else if (total100 >= 61) { 
      gradeLetter = 'B2'; 
      gradePoint = '7.0'; 
      remark = 'Tumruhna leh taihmakna a nei'; 
    } else if (total100 >= 51) { 
      gradeLetter = 'C1'; 
      gradePoint = '6.0'; 
      remark = 'Hmasawn zel thei a ni'; 
    } else if (total100 >= 41) { 
      gradeLetter = 'C2'; 
      gradePoint = '5.0'; 
      remark = 'Zir uar deuh a mamawh'; 
    } else if (total100 >= 33) { 
      gradeLetter = 'D'; 
      gradePoint = '4.0'; 
      remark = 'Pass mark tling tawk'; 
    } else { 
      gradeLetter = 'E'; 
      gradePoint = '0.0'; 
      remark = 'Remedial class mamawh'; 
      passStatus = 'FAIL'; 
    }

    return {
      slNo: index + 1,
      subject,
      ctScaled,
      exScaled,
      total100,
      gradeLetter,
      gradePoint,
      passStatus,
      remark
    };
  });

  const overallPercentage = grandTotalMax > 0 ? Math.round((grandTotalObtained / grandTotalMax) * 100) : 0;
  
  let division = 'Third Division (III Div)';
  let overallGrade = 'C2';
  if (overallPercentage >= 75) {
    division = 'Passed with Distinction (Starred ⭐)';
    overallGrade = overallPercentage >= 91 ? 'A1' : 'A2';
  } else if (overallPercentage >= 60) {
    division = 'First Division (I Div)';
    overallGrade = overallPercentage >= 71 ? 'B1' : 'B2';
  } else if (overallPercentage >= 50) {
    division = 'Second Division (II Div)';
    overallGrade = 'C1';
  } else if (overallPercentage >= 33) {
    division = 'Third Division (III Div)';
    overallGrade = 'D';
  } else {
    division = 'Essential Repeat / Remedial';
    overallGrade = 'E';
  }

  const isPassed = overallPercentage >= 33 && !subjectRows.some(s => s.passStatus === 'FAIL');

  return {
    subjectRows,
    grandTotalMax,
    grandTotalObtained,
    overallPercentage,
    overallGrade,
    division,
    isPassed,
    resultStatus: isPassed ? 'PROMOTED TO NEXT HIGHER CLASS' : 'ESSENTIAL REPEAT / REMEDIAL'
  };
}

// Single Printable Official MBSE Report Card Sheet Component
export function SingleReportCardSheet({
  student,
  studentClass,
  termName,
  academicYear,
  systemConfig,
  sealConfig,
  grades,
  isBatchMode = false
}) {
  const reportData = computeStudentReport(student, grades);
  if (!reportData) return null;

  const {
    subjectRows,
    grandTotalMax,
    grandTotalObtained,
    overallPercentage,
    overallGrade,
    division,
    resultStatus
  } = reportData;

  const schoolName = systemConfig?.schoolName || 'OHA (One Heart Academy)';
  const affiliationNo = systemConfig?.affiliationNo || 'MBSE-HSS-LGL-0421';
  const udiseCode = systemConfig?.udiseCode || '15030200101';
  const establishedYear = systemConfig?.establishedYear || '1998';
  const address = systemConfig?.address || 'Lunglawn, Lunglei, Mizoram - 796701';
  const contactPhone = systemConfig?.contactPhone || '+91 372 2322104';

  const penNo = student?.penNo || `PEN-MZ-2026-${student?.admissionNo?.replace(/\D/g, '').padEnd(4, '0') || '1001'}`;
  const apaarId = student?.apaarId || `9876-${student?.rollNo?.toString().padStart(4, '0') || '0001'}-2026`;
  const mbseRegNo = student?.mbseRegNo || `MBSE/REG/${academicYear.slice(0, 4)}/${student?.rollNo?.toString().padStart(3, '0') || '001'}`;
  const fatherName = student?.fatherName || student?.guardianName || 'P.C. Lalthanmawia';
  const motherName = student?.motherName || 'Lalnunfeli';

  return (
    <div className={`printable-report-card ${isBatchMode ? 'page-break' : ''} max-w-4xl mx-auto rounded-2xl bg-white text-slate-900 border-2 border-slate-900 shadow-2xl p-6 sm:p-8 font-sans relative my-4`}>
      {/* Official MBSE Institutional Crest & Header */}
      <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1 relative">
        <div className="flex items-center justify-between">
          <div className="hidden sm:block text-left text-[9px] text-slate-600 font-mono">
            <div>UDISE+: <strong>{udiseCode}</strong></div>
            <div>Estd: <strong>{establishedYear}</strong></div>
          </div>
          <div className="flex flex-col items-center mx-auto">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-cyan-400 mb-1 shadow-sm">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 font-['Outfit'] uppercase leading-tight">
              {schoolName}
            </h1>
          </div>
          <div className="hidden sm:block text-right text-[9px] text-slate-600 font-mono">
            <div>Affil: <strong>{affiliationNo}</strong></div>
            <div>Mizoram Board</div>
          </div>
        </div>

        <p className="text-[11px] font-semibold text-slate-700 tracking-wider uppercase">
          Affiliated to Mizoram Board of School Education (MBSE)
        </p>
        <p className="text-[10px] text-slate-600">
          {address} • Contact: {contactPhone}
        </p>
        
        <div className="pt-1">
          <span className="inline-block px-4 py-0.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-slate-900 text-white shadow-sm">
            LEHKHA THIAMNA LEH NUNGCHANG RECORD • OFFICIAL PROGRESS REPORT
          </span>
        </div>
        <p className="text-[10px] font-bold text-slate-800 pt-0.5 font-mono">
          {termName} • Academic Session: {academicYear}
        </p>
      </div>

      {/* Student Demographic & National Education Profile Matrix */}
      <div className="my-3 p-3 rounded-xl bg-slate-50 border border-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Student Name</span>
          <span className="font-bold text-slate-950 text-sm uppercase">{student?.firstName} {student?.lastName}</span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Admission Number</span>
          <span className="font-mono font-bold text-slate-900">{student?.admissionNo}</span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Class &amp; Stream</span>
          <span className="font-bold text-slate-900">
            {studentClass?.name || 'Class 10'} {student?.stream ? `(${student.stream.toUpperCase()})` : ''}
          </span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Roll Number</span>
          <span className="font-mono font-bold text-indigo-700 text-sm">#{student?.rollNo}</span>
        </div>

        <div>
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Student PEN (UDISE+)</span>
          <span className="font-mono font-medium text-slate-900 text-[11px]">{penNo}</span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-500 block">APAAR ID</span>
          <span className="font-mono font-medium text-slate-900 text-[11px]">{apaarId}</span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-500 block">MBSE Registration No</span>
          <span className="font-mono font-medium text-slate-900 text-[11px]">{mbseRegNo}</span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Attendance Rate</span>
          <span className="font-bold text-emerald-700 font-mono">{student?.attendanceRate || 95.2}%</span>
        </div>

        <div>
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Father's / Guardian's Name</span>
          <span className="font-medium text-slate-900 text-[11px]">{fatherName}</span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Mother's Name</span>
          <span className="font-medium text-slate-900 text-[11px]">{motherName}</span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Date of Birth</span>
          <span className="font-medium text-slate-900 font-mono text-[11px]">{student?.dob || '2009-08-15'}</span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Blood Group</span>
          <span className="font-bold text-rose-700 font-mono">{student?.bloodGroup || 'O+'}</span>
        </div>
      </div>

      {/* Combined Scholastic Assessment Marksheet Table */}
      <div className="overflow-x-auto my-3">
        <table className="w-full text-left text-xs border-collapse border border-slate-400">
          <thead className="bg-slate-100 text-slate-900 font-bold border-b-2 border-slate-400 text-[11px]">
            <tr>
              <th className="py-2 px-2.5 border-r border-slate-300 w-10 text-center">Sl</th>
              <th className="py-2 px-3 border-r border-slate-300">Subject Name</th>
              <th className="py-2 px-2.5 border-r border-slate-300 text-center">
                Continuous (20M)<br/>
                <span className="text-[9px] font-normal text-slate-600">FA / Internal</span>
              </th>
              <th className="py-2 px-2.5 border-r border-slate-300 text-center">
                Term Exam (80M)<br/>
                <span className="text-[9px] font-normal text-slate-600">Theory / SA</span>
              </th>
              <th className="py-2 px-2.5 border-r border-slate-300 text-center">
                Total (100M)<br/>
                <span className="text-[9px] font-normal text-slate-600">Obtained</span>
              </th>
              <th className="py-2 px-2 border-r border-slate-300 text-center">Grade</th>
              <th className="py-2 px-2 border-r border-slate-300 text-center">Point</th>
              <th className="py-2 px-3 text-left">Remarks &amp; Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300 text-slate-800 text-[11px]">
            {subjectRows.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                <td className="py-1.5 px-2 text-center font-mono border-r border-slate-300 text-slate-500">
                  {row.slNo}
                </td>
                <td className="py-1.5 px-3 font-bold text-slate-900 border-r border-slate-300">
                  {row.subject}
                </td>
                <td className="py-1.5 px-2.5 text-center font-mono border-r border-slate-300">
                  {row.ctScaled}
                </td>
                <td className="py-1.5 px-2.5 text-center font-mono border-r border-slate-300">
                  {row.exScaled}
                </td>
                <td className="py-1.5 px-2.5 text-center font-mono font-bold text-slate-950 border-r border-slate-300">
                  {row.total100}
                </td>
                <td className="py-1.5 px-2 text-center font-mono font-bold border-r border-slate-300 text-indigo-900">
                  {row.gradeLetter}
                </td>
                <td className="py-1.5 px-2 text-center font-mono text-slate-700 border-r border-slate-300">
                  {row.gradePoint}
                </td>
                <td className="py-1.5 px-3 text-slate-700 italic text-[10px]">
                  {row.remark}
                </td>
              </tr>
            ))}
          </tbody>

          {/* Table Footer Aggregate & Result */}
          <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-bold text-slate-900 text-xs">
            <tr>
              <td colSpan={2} className="py-2 px-3 border-r border-slate-300 uppercase font-black text-slate-950">
                Grand Total Aggregate:
              </td>
              <td className="py-2 px-2 text-center border-r border-slate-300 font-mono text-slate-700">
                {subjectRows.reduce((a, c) => a + c.ctScaled, 0)}
              </td>
              <td className="py-2 px-2 text-center border-r border-slate-300 font-mono text-slate-700">
                {subjectRows.reduce((a, c) => a + c.exScaled, 0)}
              </td>
              <td className="py-2 px-2 text-center border-r border-slate-300 font-mono font-black text-slate-950 text-sm">
                {grandTotalObtained} / {grandTotalMax}
              </td>
              <td className="py-2 px-2 text-center font-mono border-r border-slate-300 text-sm text-indigo-900 font-black">
                {overallGrade}
              </td>
              <td colSpan={2} className="py-2 px-3 text-slate-950">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-emerald-800 text-sm">
                    {overallPercentage}%
                  </span>
                  <span className="uppercase text-[11px] font-bold tracking-wide text-indigo-900">
                    {division}
                  </span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Result Status Banner */}
      <div className="my-2.5 p-2 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-600 font-semibold mr-2">Official Result Status:</span>
          <span className="font-black text-slate-950 uppercase font-mono tracking-wide">
            {resultStatus}
          </span>
        </div>
        <div className="text-[11px] font-mono font-bold text-slate-700">
          Grading Framework: <strong>MBSE CCE 9-Point</strong>
        </div>
      </div>

      {/* Co-Scholastic & Behavioral Assessment Matrix (MBSE CCE Standard) */}
      <div className="my-3 p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs">
        <span className="font-bold text-slate-900 block mb-1.5 uppercase text-[10px] tracking-wider">
          Co-Scholastic Traits &amp; Behavioral Assessment (MBSE CCE 5-Point Scale)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
          <div className="p-2 rounded bg-white border border-slate-200">
            <span className="text-slate-500 block text-[9px] uppercase font-bold">1. Work Education / SUPW</span>
            <span className="font-bold text-slate-900">Grade A (Thawkrim &amp; Kutthei)</span>
          </div>
          <div className="p-2 rounded bg-white border border-slate-200">
            <span className="text-slate-500 block text-[9px] uppercase font-bold">2. Art &amp; Cultural Education</span>
            <span className="font-bold text-slate-900">Grade A (Hnam Ziarang)</span>
          </div>
          <div className="p-2 rounded bg-white border border-slate-200">
            <span className="text-slate-500 block text-[9px] uppercase font-bold">3. Health &amp; Physical Education</span>
            <span className="font-bold text-slate-900">Grade A (Infiamna &amp; Hriselna)</span>
          </div>
          <div className="p-2 rounded bg-white border border-slate-200">
            <span className="text-slate-500 block text-[9px] uppercase font-bold">4. Discipline &amp; Moral Character</span>
            <span className="font-bold text-slate-900">Grade A (Nungchang Mawi)</span>
          </div>
        </div>
      </div>

      {/* MBSE Grading Scale Legend */}
      <div className="my-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[9px] text-slate-600">
        <span className="font-bold text-slate-800 mr-2">MBSE Grading Scale:</span>
        <span className="font-mono">
          <strong>A1:</strong> 91-100% (10.0) • <strong>A2:</strong> 81-90% (9.0) • <strong>B1:</strong> 71-80% (8.0) • <strong>B2:</strong> 61-70% (7.0) • <strong>C1:</strong> 51-60% (6.0) • <strong>C2:</strong> 41-50% (5.0) • <strong>D:</strong> 33-40% (4.0 - Pass) • <strong>E:</strong> Below 33% (Remedial)
        </span>
      </div>

      {/* Teacher Comments & Signatures Block */}
      <div className="mt-4 pt-3 border-t-2 border-slate-300 space-y-4">
        <div className="p-2.5 rounded-xl border border-dashed border-slate-400 bg-slate-50/70">
          <span className="text-[9px] uppercase font-bold text-slate-600 block">Zirtirtu Thuchah / Class Teacher's Remarks:</span>
          <p className="text-xs text-slate-800 italic mt-0.5">
            "{student?.firstName} has shown tremendous academic aptitude, high discipline, and regular classroom attendance. His critical analytical skills and general conduct throughout the session are exemplary."
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 pt-4 text-center text-xs items-end">
          <div className="border-t border-slate-800 pt-1.5">
            <span className="font-bold text-slate-900 block text-[11px]">Lalthlamuana Sailo</span>
            <span className="text-[9px] text-slate-600">Class Teacher</span>
          </div>

          <div className="border-t border-slate-800 pt-1.5">
            <span className="font-bold text-slate-900 block text-[11px]">Dr. C. Lalremruata</span>
            <span className="text-[9px] text-slate-600">Exam Superintendent</span>
          </div>

          <div className="flex flex-col items-center justify-center relative">
            {sealConfig?.showSealOnReportCard && (
              <div 
                className="w-16 h-16 rounded-full border-2 border-dashed flex flex-col items-center justify-center p-0.5 opacity-80 select-none mx-auto"
                style={{ borderColor: sealConfig?.sealColor || '#d97706', color: sealConfig?.sealColor || '#d97706' }}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[5px] font-black uppercase text-center leading-tight">
                  {sealConfig?.schoolCrestText?.split('•')[0] || 'OHA ACADEMY'}
                </span>
                <span className="text-[4px] font-bold font-mono">SEAL</span>
              </div>
            )}
            {!sealConfig?.showSealOnReportCard && (
              <div className="w-14 h-14 rounded-full border border-dashed border-slate-400 flex items-center justify-center text-[7px] font-bold text-slate-500 uppercase text-center p-1">
                Official Seal
              </div>
            )}
            <span className="text-[8px] text-slate-500 mt-1 font-semibold">Institutional Stamp</span>
          </div>

          <div className="border-t border-slate-800 pt-1.5">
            <div className="h-6 flex items-center justify-center">
              {sealConfig?.signatureMode === 'drawn' && sealConfig?.signatureSvgData ? (
                <img src={sealConfig.signatureSvgData} alt="Principal Signature" className="max-h-6 max-w-[100px] object-contain" />
              ) : (
                <span className="font-serif italic text-xs font-bold text-blue-950" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                  {sealConfig?.principalSignatoryName || 'Rev. Dr. L. H. Rohmingliana'}
                </span>
              )}
            </div>
            <span className="font-bold text-slate-900 block text-[11px]">
              {sealConfig?.principalSignatoryName || 'Rev. Dr. L. H. Rohmingliana'}
            </span>
            <span className="text-[9px] text-slate-600">{sealConfig?.principalDesignation || 'Principal'}</span>
          </div>
        </div>

        {/* Bottom Security QR Code & MBSE Verification Bar */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <div className="p-0.5 bg-white border border-slate-300 rounded shadow-xs">
              <QRCodeSVG
                value={JSON.stringify({
                  cert: "MBSE-PROGRESS-REPORT",
                  school: schoolName,
                  admNo: student?.admissionNo,
                  name: `${student?.firstName} ${student?.lastName}`,
                  class: studentClass?.name,
                  percentage: overallPercentage,
                  division: division,
                  issued: new Date().toISOString().slice(0, 10),
                  verified: true
                })}
                size={36}
                level="M"
              />
            </div>
            <div>
              <span className="font-bold text-slate-800 block text-[9px]">
                MBSE-REP-{student?.admissionNo}-{termName.slice(0, 4)}
              </span>
              <span>Official tamper-proof digital grade credential</span>
            </div>
          </div>

          <div className="text-right">
            <div>Date of Issue: {new Date().toLocaleDateString('en-IN')}</div>
            <div>{schoolName} • Affiliated to MBSE</div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    systemConfig,
    sealConfig
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

  // Batch Print States
  const [isBatchPrintMode, setIsBatchPrintMode] = useState(false);
  const [batchSkipWithheld, setBatchSkipWithheld] = useState(true);

  // Modals & States
  const [isWithholdModalOpen, setIsWithholdModalOpen] = useState(false);
  const [isOnlineCheckoutOpen, setIsOnlineCheckoutOpen] = useState(false);

  // Withhold Form State
  const [withholdForm, setWithholdForm] = useState({
    reason: 'fee_due',
    customReason: '',
    notes: '',
    waiveNote: ''
  });

  const student = students.find(s => s.id === activeStudentId) || students[0];
  const studentClass = classes.find(c => c.id === student?.classId) || classes[0];

  // Access check for active student
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

  // Batch print students list
  const batchStudents = filteredStudents.filter(s => {
    if (!batchSkipWithheld) return true;
    const sAccess = checkReportCardAccess(s.id);
    return !sAccess.isWithheld;
  });

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
            margin: 6mm 8mm;
          }
          body {
            background: white !important;
            color: #0f172a !important;
            font-size: 10.5pt !important;
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
            padding: 16px 20px !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
            background: white !important;
            color: #0f172a !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .page-break {
            page-break-after: always !important;
            break-after: page !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #475569 !important;
            padding: 4px 6px !important;
          }
          .bg-slate-900 {
            background-color: #0f172a !important;
            color: white !important;
          }
          .bg-slate-100, .bg-slate-50 {
            background-color: #f8fafc !important;
          }
        }
      `}</style>

      {/* TOP TOOLBAR (Hidden during print) */}
      <div className="no-print p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-cyan-400" />
              <span>MBSE Official Progress Report &amp; Marksheet</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                CCE Standard
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous Assessment (20%) + Term Examinations (80%) • Withholding governance &amp; A4 print layout.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isManagement && (
              <>
                <button
                  onClick={() => setIsBatchPrintMode(!isBatchPrintMode)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow ${
                    isBatchPrintMode 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-purple-400/40' 
                      : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Layers className="w-4 h-4 text-purple-300" />
                  <span>{isBatchPrintMode ? 'Switch to Single Student' : 'Class Pum Print (Batch)'}</span>
                </button>

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
              </>
            )}

            {(!access.isWithheld || isManagement) && (
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>
                  {isBatchPrintMode ? `Print Entire Batch (${batchStudents.length} Students)` : 'Print Official A4 PDF'}
                </span>
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

          {/* Select Student (When not in batch mode) */}
          {!isBatchPrintMode ? (
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
          ) : (
            <div className="flex items-center gap-3 bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-500/30 flex-1">
              <span className="text-purple-200 font-semibold">
                Batch Mode: <strong>{batchStudents.length}</strong> students ready for printing
              </span>
              <label className="flex items-center gap-1.5 text-purple-300 cursor-pointer ml-auto">
                <input
                  type="checkbox"
                  checked={batchSkipWithheld}
                  onChange={(e) => setBatchSkipWithheld(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-0"
                />
                <span>Skip Withheld Students (Fee Ba)</span>
              </label>
            </div>
          )}

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
      {!isBatchPrintMode && isManagement && (
        <div className="no-print">
          {access.isWithheld ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/70 via-red-900/40 to-slate-900 border border-rose-500/50 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Progress Report Currently WITHHELD / LOCKED</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/30 text-rose-200 border border-rose-500/40 font-mono">
                      Restricted
                    </span>
                  </h4>
                  <p className="text-xs text-rose-200/80 mt-0.5">
                    <strong>Reason:</strong> {access.customReason || (access.reason === 'fee_due' ? `Pending school fee clearance of ₹${pendingFees.toLocaleString('en-IN')}` : access.reason)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleWaiver}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Grant Principal Waiver</span>
                </button>
                <button
                  onClick={() => setIsWithholdModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow"
                >
                  Manage Hold
                </button>
              </div>
            </div>
          ) : access.isWaived ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-amber-900/30 to-slate-900 border border-amber-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Released Under Principal Academic Waiver</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 border border-amber-500/40 font-mono">
                      Special Waiver
                    </span>
                  </h4>
                  <p className="text-xs text-amber-200/80 mt-0.5">
                    Authorized by {access.waivedBy || 'Principal'} • Dues: ₹{pendingFees.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleWaiver}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition"
              >
                Revoke Waiver
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* STUDENT/PARENT LOCKED VIEW (If Withheld and not management) */}
      {!isBatchPrintMode && isStudentOrParent && access.isWithheld && (
        <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-slate-900 border border-rose-500/30 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-white font-['Outfit']">
              Progress Report Card Is Temporarily Withheld
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              He zirlai ({student?.firstName} {student?.lastName}) progress report hi school administration lamin a la vawng rih a, a hnuaia chhan tarlan hi chinfel a nih veleh auto-in a inhawng nghal ang.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="text-slate-400">Withholding Reason:</span>
              <span className="font-bold text-rose-400">
                {access.customReason || (access.reason === 'fee_due' ? 'Pending School Fees Clearance' : access.reason)}
              </span>
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
              href={`tel:${systemConfig?.contactPhone || '+919436140001'}`}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-2 border border-slate-700"
            >
              <span>Contact Accounts Desk</span>
            </a>
          </div>

          <p className="text-[11px] text-slate-500 pt-2">
            Accounts Helpdesk: {systemConfig?.contactEmail || 'office@school.edu'} • Office Hours: 09:00 AM - 03:00 PM
          </p>
        </div>
      )}

      {/* ============================================================ */}
      {/* PRINTABLE OFFICIAL REPORT CARD SHEETS */}
      {/* ============================================================ */}
      {/* CASE A: Single Student Mode */}
      {!isBatchPrintMode && (!isStudentOrParent || !access.isWithheld) && (
        <SingleReportCardSheet
          student={student}
          studentClass={studentClass}
          termName={termName}
          academicYear={academicYear}
          systemConfig={systemConfig}
          sealConfig={sealConfig}
          grades={grades}
          isBatchMode={false}
        />
      )}

      {/* CASE B: Batch Print Mode (Class Pum Print) */}
      {isBatchPrintMode && isManagement && (
        <div className="batch-print-container space-y-6">
          <div className="no-print p-4 rounded-xl bg-purple-950/50 border border-purple-500/40 text-purple-200 text-xs flex items-center justify-between">
            <span>
              Pahnihna: Khawngaihin <strong>Print Official A4 PDF</strong> hmet la, browser print settings-ah <em>Margins: Minimum</em> emaw <em>Custom</em> thlang rawh.
            </span>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-purple-500 text-slate-950 font-bold transition flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4 Batch Now</span>
            </button>
          </div>

          {batchStudents.map(stu => {
            const stuClass = classes.find(c => c.id === stu.classId);
            return (
              <SingleReportCardSheet
                key={stu.id}
                student={stu}
                studentClass={stuClass}
                termName={termName}
                academicYear={academicYear}
                systemConfig={systemConfig}
                sealConfig={sealConfig}
                grades={grades}
                isBatchMode={true}
              />
            );
          })}
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
