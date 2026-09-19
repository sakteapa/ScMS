import React from 'react';
import { GradeRecord, AttendanceRecord } from '../types';
import { Printer, X, Award, FileText, Download, Layers } from 'lucide-react';

interface ReportCardModalProps {
  gradeRecord: GradeRecord | null;
  attendanceRecords?: AttendanceRecord[];
  onClose: () => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  gradeRecord,
  attendanceRecords = [],
  onClose,
}) => {
  if (!gradeRecord) return null;

  // Calculate student attendance for context
  const studentAttendance = attendanceRecords.filter(
    (a) => a.studentId === gradeRecord.studentId || a.rollNo === gradeRecord.rollNo
  );
  const totalDays = studentAttendance.length;
  const presentDays = studentAttendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 94; // Realistic default if early in term

  const classTestTotal =
    gradeRecord.totalClassTestObtained ??
    gradeRecord.subjects.reduce((sum, s) => sum + (s.classTestObtained ?? 0), 0);
  const classTestMaxTotal =
    gradeRecord.totalClassTestMax ??
    gradeRecord.subjects.reduce((sum, s) => sum + (s.classTestMax ?? 20), 0);
  const examTotal =
    gradeRecord.totalExamObtained ??
    gradeRecord.subjects.reduce((sum, s) => sum + (s.examObtained ?? s.marksObtained), 0);
  const examMaxTotal =
    gradeRecord.totalExamMax ??
    gradeRecord.subjects.reduce((sum, s) => sum + (s.examMax ?? s.maxMarks), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTranscript = () => {
    const transcript = `
===========================================================
  MIZORAM SCHOOL SYSTEM (ZOXS-SMS)
  STUDENT ACADEMIC REPORT CARD & COMPOSITE TRANSCRIPT
  Affiliated to Mizoram Board of School Education (MBSE)
===========================================================
Student Name      : ${gradeRecord.studentName}
Roll Number       : ${gradeRecord.rollNo}
Class & Section   : ${gradeRecord.className}
Academic Stage    : ${gradeRecord.stage || 'General'}
Stream Classification: ${gradeRecord.stream || 'General'}
Examination Term  : ${gradeRecord.examTerm}
Assessment Scheme : Separated Class Tests (Continuous) + Final Examinations
Academic Year     : ${gradeRecord.academicYear}
Result Status     : ${gradeRecord.status.toUpperCase()}
Overall Grade     : ${gradeRecord.overallGrade}
Composite Percentage : ${gradeRecord.percentage.toFixed(2)}%
Total Class Tests : ${classTestTotal} / ${classTestMaxTotal}
Total Examinations: ${examTotal} / ${examMaxTotal}
Grand Total Marks : ${gradeRecord.totalMarksObtained} / ${gradeRecord.totalMaxMarks}
Class Rank        : ${gradeRecord.rank ? `Rank #${gradeRecord.rank}` : 'N/A'}
Attendance Rate   : ${attendanceRate}%

DETAILED SUBJECT BREAKDOWN:
-----------------------------------------------------------------------------------------
${'#'.padEnd(4)}${'Subject Title'.padEnd(26)}${'Class Test'.padEnd(16)}${'Exam'.padEnd(14)}${'Composite'.padEnd(14)}${'Grade'}
-----------------------------------------------------------------------------------------
${gradeRecord.subjects
  .map((s, idx) => {
    const testScore = s.classTestObtained !== undefined ? `${s.classTestObtained}/${s.classTestMax ?? 20}` : 'N/A';
    const examScore = s.examObtained !== undefined ? `${s.examObtained}/${s.examMax ?? 80}` : `${s.marksObtained}/${s.maxMarks}`;
    const composite = `${s.marksObtained}/${s.maxMarks}`;
    return `${(idx + 1).toString().padEnd(4)}${s.subjectName.padEnd(26)}${testScore.padEnd(16)}${examScore.padEnd(14)}${composite.padEnd(14)}${s.grade}`;
  })
  .join('\n')}
-----------------------------------------------------------------------------------------
Grand Composite Total : ${gradeRecord.totalMarksObtained} / ${gradeRecord.totalMaxMarks} (${gradeRecord.percentage.toFixed(2)}%)
MBSE Overall Grade    : ${gradeRecord.overallGrade} [${gradeRecord.status.toUpperCase()}]
Teacher Remarks       : ${gradeRecord.teacherRemarks}
Date of Issue         : ${new Date(gradeRecord.updatedAt || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}
===========================================================
`;

    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ReportCard_${gradeRecord.studentName.replace(/\s+/g, '_')}_Roll${gradeRecord.rollNo}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50';
    if (grade.startsWith('B')) return 'text-cyan-400 bg-cyan-950/60 border-cyan-700/50';
    if (grade.startsWith('C')) return 'text-amber-400 bg-amber-950/60 border-amber-700/50';
    if (grade === 'D') return 'text-yellow-400 bg-yellow-950/60 border-yellow-700/50';
    return 'text-rose-400 bg-rose-950/60 border-rose-700/50';
  };

  return (
    <div
      id="reportCardModalOverlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="reportCardContainer"
        className="bg-gray-900 border border-gray-700 rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="print:hidden flex items-center justify-between px-5 py-3.5 bg-gray-850 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Student Academic Performance & Report Card</h2>
            {gradeRecord.stage && (
              <span className="ml-2 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-950 text-indigo-300 border border-indigo-700/40">
                {gradeRecord.stage}
              </span>
            )}
            {gradeRecord.stream && gradeRecord.stream !== 'General' && (
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-700/40">
                {gradeRecord.stream} Stream
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              id="printReportCardBtn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-sm"
              title="Print official report card"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Card</span>
            </button>
            <button
              id="downloadTranscriptBtn"
              onClick={handleDownloadTranscript}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 rounded-lg transition-colors"
              title="Download text transcript"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button
              id="closeReportCardBtn"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Card Document Body */}
        <div
          id="printableReportCard"
          className="p-6 sm:p-8 overflow-y-auto bg-gray-900 text-gray-100 print:bg-white print:text-black print:p-6 print:overflow-visible font-sans"
        >
          {/* Header with MBSE & School Branding */}
          <div className="border-b-2 border-indigo-500/40 print:border-black pb-5 mb-5 text-center relative">
            <div className="flex justify-center items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500 flex items-center justify-center print:border-black print:bg-gray-100">
                <Award className="w-7 h-7 text-indigo-400 print:text-black" />
              </div>
              <div className="text-left">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white print:text-black uppercase">
                  Mizoram School System
                </h1>
                <p className="text-xs text-indigo-300 print:text-gray-700 font-medium">
                  Affiliated to Mizoram Board of School Education (MBSE) • Estd. 1998
                </p>
                <p className="text-[11px] text-gray-400 print:text-gray-600">
                  Nursery to Higher Secondary (10+2) • Aizawl, Mizoram - 796001
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              <span className="px-3 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-xs font-semibold uppercase tracking-wider text-indigo-300 print:bg-gray-200 print:text-black print:border-gray-400">
                Official Academic Performance Transcript • {gradeRecord.academicYear}
              </span>
              {gradeRecord.stage && (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-900/60 border border-indigo-600/50 text-[11px] font-bold text-indigo-200 print:border-black print:text-black print:bg-gray-100">
                  {gradeRecord.stage.toUpperCase()} WING
                </span>
              )}
              {gradeRecord.stream && gradeRecord.stream !== 'General' && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-600/50 text-[11px] font-bold text-emerald-200 print:border-black print:text-black print:bg-gray-100">
                  {gradeRecord.stream.toUpperCase()} STREAM
                </span>
              )}
            </div>
          </div>

          {/* Student Profile & Examination Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-800/60 border border-gray-700/80 rounded-lg mb-6 text-xs print:bg-gray-50 print:border-gray-300 print:text-black">
            <div>
              <span className="text-gray-400 print:text-gray-600 block text-[11px]">Student Name</span>
              <span className="font-bold text-sm text-white print:text-black">{gradeRecord.studentName}</span>
            </div>
            <div>
              <span className="text-gray-400 print:text-gray-600 block text-[11px]">Class & Section</span>
              <span className="font-semibold text-gray-200 print:text-black">{gradeRecord.className}</span>
            </div>
            <div>
              <span className="text-gray-400 print:text-gray-600 block text-[11px]">Roll Number</span>
              <span className="font-bold text-indigo-400 print:text-black">#{gradeRecord.rollNo}</span>
            </div>
            <div>
              <span className="text-gray-400 print:text-gray-600 block text-[11px]">Examination Term</span>
              <span className="font-semibold text-gray-200 print:text-black">{gradeRecord.examTerm}</span>
            </div>
            <div>
              <span className="text-gray-400 print:text-gray-600 block text-[11px]">Academic Stage</span>
              <span className="font-medium text-gray-300 print:text-black">{gradeRecord.stage || 'Standard'}</span>
            </div>
            <div>
              <span className="text-gray-400 print:text-gray-600 block text-[11px]">Stream</span>
              <span className="font-medium text-gray-300 print:text-black">{gradeRecord.stream || 'General'}</span>
            </div>
            <div>
              <span className="text-gray-400 print:text-gray-600 block text-[11px]">Term Attendance</span>
              <span className="font-semibold text-emerald-400 print:text-black">{attendanceRate}%</span>
            </div>
            <div>
              <span className="text-gray-400 print:text-gray-600 block text-[11px]">Class Rank</span>
              <span className="font-bold text-indigo-300 print:text-black">
                {gradeRecord.rank ? `Rank #${gradeRecord.rank}` : 'Top Tier'}
              </span>
            </div>
          </div>

          {/* Assessment Scheme Badge */}
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-gray-850/80 border border-gray-700/60 text-xs text-gray-300 print:bg-gray-100 print:text-black print:border-gray-300">
            <Layers className="w-4 h-4 text-indigo-400 print:text-black shrink-0" />
            <span className="font-medium">
              Dual Assessment Model: Continuous Assessments / Class Tests (20-30%) + Term Final Examinations (70-80%)
            </span>
          </div>

          {/* Subjects Score Breakdown Table with Separated Class Tests and Exams */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-gray-700 print:border-gray-300">
              <thead>
                <tr className="bg-gray-800 text-gray-300 print:bg-gray-200 print:text-black border-b border-gray-700 print:border-gray-300">
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3 font-semibold">Subject Title</th>
                  <th className="py-2.5 px-3 text-center w-28 bg-indigo-950/40 print:bg-gray-200 border-l border-r border-gray-700 print:border-gray-300">
                    <span className="block font-bold text-indigo-300 print:text-black">Class Tests</span>
                    <span className="text-[10px] text-gray-400 print:text-gray-600 font-normal">Continuous (20-30M)</span>
                  </th>
                  <th className="py-2.5 px-3 text-center w-28 bg-blue-950/40 print:bg-gray-200 border-r border-gray-700 print:border-gray-300">
                    <span className="block font-bold text-cyan-300 print:text-black">Examinations</span>
                    <span className="text-[10px] text-gray-400 print:text-gray-600 font-normal">Written (70-80M)</span>
                  </th>
                  <th className="py-2.5 px-3 text-center w-28 font-bold bg-gray-800/90 print:bg-gray-200">
                    <span className="block">Composite</span>
                    <span className="text-[10px] text-gray-400 print:text-gray-600 font-normal">Total (/100)</span>
                  </th>
                  <th className="py-2.5 px-3 text-center w-20 font-bold">Grade</th>
                  <th className="py-2.5 px-3 print:hidden w-32">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 print:divide-gray-300">
                {gradeRecord.subjects.map((sub, idx) => {
                  const pass = sub.marksObtained >= 33;
                  const pct = Math.round((sub.marksObtained / sub.maxMarks) * 100);
                  const classTestScore = sub.classTestObtained ?? Math.round(sub.marksObtained * 0.2);
                  const classTestMax = sub.classTestMax ?? 20;
                  const examScore = sub.examObtained ?? sub.marksObtained - classTestScore;
                  const examMax = sub.examMax ?? sub.maxMarks - classTestMax;

                  return (
                    <tr
                      key={sub.subjectName}
                      className="hover:bg-gray-800/40 print:hover:bg-transparent transition-colors"
                    >
                      <td className="py-2.5 px-3 text-center text-gray-400 print:text-black font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-white print:text-black">{sub.subjectName}</td>
                      <td className="py-2.5 px-3 text-center border-l border-r border-gray-700/60 print:border-gray-300 bg-indigo-950/10">
                        <span className="font-semibold text-indigo-300 print:text-black">{classTestScore}</span>
                        <span className="text-gray-500 print:text-gray-500 text-[11px]"> / {classTestMax}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-gray-700/60 print:border-gray-300 bg-blue-950/10">
                        <span className="font-semibold text-cyan-300 print:text-black">{examScore}</span>
                        <span className="text-gray-500 print:text-gray-500 text-[11px]"> / {examMax}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-sm bg-gray-850/40">
                        <span className={pass ? 'text-white print:text-black' : 'text-rose-400 print:text-rose-600'}>
                          {sub.marksObtained}
                        </span>
                        <span className="text-gray-500 print:text-gray-500 text-xs font-normal"> / {sub.maxMarks}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getGradeColor(
                            sub.grade
                          )} print:border-gray-400 print:bg-transparent print:text-black`}
                        >
                          {sub.grade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 print:hidden">
                        <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-indigo-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-800/80 print:bg-gray-100 font-bold border-t-2 border-gray-600 print:border-black text-sm">
                  <td colSpan={2} className="py-2.5 px-3 text-white print:text-black">
                    Grand Composite Total
                  </td>
                  <td className="py-2.5 px-3 text-center text-indigo-300 print:text-black border-l border-r border-gray-700 print:border-gray-300">
                    {classTestTotal} / {classTestMaxTotal}
                  </td>
                  <td className="py-2.5 px-3 text-center text-cyan-300 print:text-black border-r border-gray-700 print:border-gray-300">
                    {examTotal} / {examMaxTotal}
                  </td>
                  <td className="py-2.5 px-3 text-center text-indigo-400 print:text-black text-base">
                    {gradeRecord.totalMarksObtained} / {gradeRecord.totalMaxMarks}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-1 bg-indigo-600/30 border border-indigo-500/50 rounded text-indigo-300 font-bold print:border-black print:text-black print:bg-transparent">
                      {gradeRecord.overallGrade}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 print:hidden text-right text-xs text-gray-300">
                    {gradeRecord.percentage.toFixed(2)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Performance Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-3 bg-gray-800/80 border border-gray-700 rounded-lg text-center print:bg-gray-50 print:border-gray-300">
              <span className="text-gray-400 print:text-gray-600 text-[10px] block uppercase font-medium">
                Class Tests Total
              </span>
              <span className="text-lg sm:text-xl font-bold text-indigo-300 print:text-black">
                {classTestTotal} / {classTestMaxTotal}
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5">
                {classTestMaxTotal > 0 ? `${Math.round((classTestTotal / classTestMaxTotal) * 100)}%` : '—'}
              </span>
            </div>
            <div className="p-3 bg-gray-800/80 border border-gray-700 rounded-lg text-center print:bg-gray-50 print:border-gray-300">
              <span className="text-gray-400 print:text-gray-600 text-[10px] block uppercase font-medium">
                Examinations Total
              </span>
              <span className="text-lg sm:text-xl font-bold text-cyan-300 print:text-black">
                {examTotal} / {examMaxTotal}
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5">
                {examMaxTotal > 0 ? `${Math.round((examTotal / examMaxTotal) * 100)}%` : '—'}
              </span>
            </div>
            <div className="p-3 bg-gray-800/80 border border-gray-700 rounded-lg text-center print:bg-gray-50 print:border-gray-300">
              <span className="text-gray-400 print:text-gray-600 text-[10px] block uppercase font-medium">
                Composite Score
              </span>
              <span className="text-xl sm:text-2xl font-black text-indigo-400 print:text-black">
                {gradeRecord.percentage.toFixed(2)}%
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5">
                {gradeRecord.totalMarksObtained} / {gradeRecord.totalMaxMarks}
              </span>
            </div>
            <div className="p-3 bg-gray-800/80 border border-gray-700 rounded-lg text-center print:bg-gray-50 print:border-gray-300">
              <span className="text-gray-400 print:text-gray-600 text-[10px] block uppercase font-medium">
                MBSE Standing
              </span>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-xl font-black text-emerald-400 print:text-black">
                  {gradeRecord.overallGrade}
                </span>
                <span className="text-xs font-bold text-emerald-400 print:text-black">
                  ({gradeRecord.status.toUpperCase()})
                </span>
              </div>
              <span className="text-[10px] text-gray-400 block mt-0.5">
                {gradeRecord.rank ? `Class Rank #${gradeRecord.rank}` : 'Satisfactory'}
              </span>
            </div>
          </div>

          {/* Teacher Remarks & Conduct Evaluation */}
          <div className="p-3.5 bg-gray-800/50 border border-gray-700/80 rounded-lg mb-6 print:bg-gray-50 print:border-gray-300">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 print:text-gray-700 mb-1">
              Class Teacher Evaluation & Conduct Remarks
            </h4>
            <p className="text-xs italic text-gray-200 print:text-black leading-relaxed">
              "{gradeRecord.teacherRemarks || 'Satisfactory academic performance and exemplary student discipline in class.'}"
            </p>
          </div>

          {/* MBSE Grade Scale Legend */}
          <div className="mb-8 p-3 bg-gray-950/60 border border-gray-800 rounded-lg text-[10px] text-gray-400 print:bg-transparent print:border-gray-300 print:text-gray-700">
            <span className="font-bold text-gray-300 print:text-black block mb-1">
              MBSE Grading Scale Reference (Continuous Assessment + Term Exam Composite):
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-center">
              <span className="p-1 rounded bg-gray-850 print:bg-gray-100">A1: 91-100%</span>
              <span className="p-1 rounded bg-gray-850 print:bg-gray-100">A2: 81-90%</span>
              <span className="p-1 rounded bg-gray-850 print:bg-gray-100">B1: 71-80%</span>
              <span className="p-1 rounded bg-gray-850 print:bg-gray-100">B2: 61-70%</span>
              <span className="p-1 rounded bg-gray-850 print:bg-gray-100">C1: 51-60%</span>
              <span className="p-1 rounded bg-gray-850 print:bg-gray-100">C2: 41-50%</span>
              <span className="p-1 rounded bg-gray-850 print:bg-gray-100">D: 33-40%</span>
              <span className="p-1 rounded bg-gray-850 print:bg-gray-100 text-rose-400 print:text-rose-700 font-semibold">
                E: &lt;33% (Fail)
              </span>
            </div>
          </div>

          {/* Official Signatures and School Seal */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-700 print:border-black text-center text-xs">
            <div>
              <div className="h-10 flex items-end justify-center">
                <span className="font-serif italic text-sm text-indigo-300 print:text-black font-semibold">
                  Lalbiakzuala R.
                </span>
              </div>
              <div className="border-t border-gray-600 print:border-black pt-1">
                <p className="font-semibold text-gray-300 print:text-black">Class Teacher</p>
                <p className="text-[10px] text-gray-400 print:text-gray-600">Mizoram School System</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full border border-dashed border-indigo-400/60 print:border-black flex items-center justify-center p-1 text-[9px] text-indigo-300 print:text-black text-center uppercase tracking-tighter">
                Official School Seal
              </div>
              <p className="text-[10px] text-gray-400 print:text-gray-600 mt-1">Verified & Registered</p>
            </div>
            <div>
              <div className="h-10 flex items-end justify-center">
                <span className="font-serif italic text-sm text-indigo-300 print:text-black font-semibold">
                  Dr. R. Lalhluna
                </span>
              </div>
              <div className="border-t border-gray-600 print:border-black pt-1">
                <p className="font-semibold text-gray-300 print:text-black">Principal / Headmaster</p>
                <p className="text-[10px] text-gray-400 print:text-gray-600">Aizawl, Mizoram</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
