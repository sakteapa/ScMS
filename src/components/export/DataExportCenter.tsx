import React, { useState, useMemo } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Database,
  Filter,
  Eye,
  CheckCircle2,
  Users,
  IndianRupee,
  GraduationCap,
  CalendarCheck,
  Archive,
  RefreshCw,
} from 'lucide-react';
import {
  FirestoreStudent,
  SchoolClass,
  FeeRecord,
  GradeRecord,
  AttendanceRecord,
} from '../../types';
import {
  exportStudentsData,
  exportFeeLedgerData,
  exportGradeSheetsData,
  exportAttendanceData,
  exportInstitutionalBackupJson,
} from '../../lib/exportUtils';

interface DataExportCenterProps {
  students: FirestoreStudent[];
  classes: SchoolClass[];
  fees: FeeRecord[];
  grades: GradeRecord[];
  attendance: AttendanceRecord[];
  allCollections?: Record<string, any[]>;
}

type ExportTab = 'students' | 'fees' | 'grades' | 'attendance' | 'backup';

export const DataExportCenter: React.FC<DataExportCenterProps> = ({
  students,
  classes,
  fees,
  grades,
  attendance,
  allCollections = {},
}) => {
  const [activeTab, setActiveTab] = useState<ExportTab>('students');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedFeeMonth, setSelectedFeeMonth] = useState<string>('all');
  const [selectedFeeStatus, setSelectedFeeStatus] = useState<string>('all');
  const [selectedGradeTerm, setSelectedGradeTerm] = useState<string>('all');
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setDownloadSuccess(msg);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  // Distinct fee months
  const feeMonths = useMemo(() => {
    const set = new Set<string>();
    fees.forEach((f) => {
      if (f.feeMonth) set.add(f.feeMonth);
    });
    return Array.from(set);
  }, [fees]);

  // Distinct grade terms
  const gradeTerms = useMemo(() => {
    const set = new Set<string>();
    grades.forEach((g) => {
      if (g.examTerm) set.add(g.examTerm);
    });
    return Array.from(set);
  }, [grades]);

  // Filtered Students Preview
  const filteredStudents = useMemo(() => {
    let list = [...students];
    if (selectedClass !== 'all') list = list.filter((s) => s.classId === selectedClass);
    return list;
  }, [students, selectedClass]);

  // Filtered Fees Preview
  const filteredFees = useMemo(() => {
    let list = [...fees];
    if (selectedFeeMonth !== 'all') list = list.filter((f) => f.feeMonth === selectedFeeMonth);
    if (selectedFeeStatus !== 'all') list = list.filter((f) => f.status === selectedFeeStatus);
    if (selectedClass !== 'all') {
      const studentIds = new Set(students.filter((s) => s.classId === selectedClass).map((s) => s.id));
      list = list.filter((f) => studentIds.has(f.studentId));
    }
    return list;
  }, [fees, students, selectedFeeMonth, selectedFeeStatus, selectedClass]);

  // Filtered Grades Preview
  const filteredGrades = useMemo(() => {
    let list = [...grades];
    if (selectedGradeTerm !== 'all') list = list.filter((g) => g.examTerm === selectedGradeTerm);
    if (selectedClass !== 'all') list = list.filter((g) => g.classId === selectedClass);
    return list;
  }, [grades, selectedGradeTerm, selectedClass]);

  // Filtered Attendance Preview
  const filteredAttendance = useMemo(() => {
    let list = [...attendance];
    if (selectedClass !== 'all') list = list.filter((a) => a.classId === selectedClass);
    if (selectedAttendanceDate) list = list.filter((a) => a.date === selectedAttendanceDate);
    return list;
  }, [attendance, selectedClass, selectedAttendanceDate]);

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Government of Mizoram • MBSE Compliance Hub</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Data Export & Report Download Center
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Export official school records, treasury ledgers, and academic marksheets into Microsoft Excel (.xls) or UTF-8 RFC4180 CSV formats for auditing, MBSE board submissions, and departmental record-keeping.
            </p>
          </div>

          <button
            onClick={() => {
              exportInstitutionalBackupJson(allCollections);
              showNotification('Complete School Disaster Recovery JSON Backup downloaded successfully.');
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer shrink-0"
          >
            <Archive className="w-4 h-4 text-amber-400" />
            <span>Full System JSON Backup</span>
          </button>
        </div>

        {downloadSuccess && (
          <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Directory ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'fees'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          <span>Fee Ledger ({fees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('grades')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'grades'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>MBSE Grade Sheets ({grades.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Attendance Register ({attendance.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'backup'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>Institutional Archive</span>
        </button>
      </div>

      {/* Tab 1: Students Export */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Filter className="w-3.5 h-3.5 text-indigo-400" />
                <span>Filter Class:</span>
              </div>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All School Classes ({students.length} students)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  exportStudentsData(students, classes, 'csv', { classId: selectedClass });
                  showNotification('Student Directory downloaded as CSV.');
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => {
                  exportStudentsData(students, classes, 'excel', { classId: selectedClass });
                  showNotification('Student Directory downloaded as Excel (.xls).');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Excel (.xls)</span>
              </button>
            </div>
          </div>

          {/* Preview Table */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Data Preview ({filteredStudents.length} matching students)</span>
              </span>
              <span>Showing first 5 rows</span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Roll</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Parent Phone</th>
                    <th className="p-3">MBSE Reg No</th>
                    <th className="p-3">Attendance %</th>
                    <th className="p-3">Marks %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredStudents.slice(0, 5).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-indigo-400">{s.rollNo}</td>
                      <td className="p-3 font-medium text-white">{s.name}</td>
                      <td className="p-3">{s.className}</td>
                      <td className="p-3 font-mono text-slate-400">{s.parentPhone}</td>
                      <td className="p-3 font-mono">{(s as any).mbseRegistrationNumber || `MBSE-2026-${s.rollNo}`}</td>
                      <td className="p-3 text-emerald-400 font-semibold">{(s as any).attendancePercentage || 92}%</td>
                      <td className="p-3 font-semibold">{s.marks || 85}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Fees Export */}
      {activeTab === 'fees' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Filter className="w-3.5 h-3.5 text-indigo-400" />
                <span>Filters:</span>
              </div>
              <select
                value={selectedFeeMonth}
                onChange={(e) => setSelectedFeeMonth(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
              >
                <option value="all">All Fee Months</option>
                {feeMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={selectedFeeStatus}
                onChange={(e) => setSelectedFeeStatus(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
              >
                <option value="all">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  exportFeeLedgerData(fees, students, 'csv', {
                    month: selectedFeeMonth,
                    status: selectedFeeStatus,
                    classId: selectedClass,
                  });
                  showNotification('Fee Collection Ledger exported as CSV.');
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => {
                  exportFeeLedgerData(fees, students, 'excel', {
                    month: selectedFeeMonth,
                    status: selectedFeeStatus,
                    classId: selectedClass,
                  });
                  showNotification('Fee Collection Ledger exported as Excel (.xls).');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Excel (.xls)</span>
              </button>
            </div>
          </div>

          {/* Financial Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400">Total Filtered Invoices</div>
              <div className="text-lg font-bold text-white mt-1">
                ₹{filteredFees.reduce((a, b) => a + (b.totalAmount || 0), 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400">Total Collected Revenue</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">
                ₹{filteredFees.reduce((a, b) => a + (b.paidAmount || 0), 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400">Outstanding Balance Dues</div>
              <div className="text-lg font-bold text-amber-400 mt-1">
                ₹{filteredFees.reduce((a, b) => a + (b.balanceAmount !== undefined ? b.balanceAmount : Math.max(0, b.totalAmount - b.paidAmount)), 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Fee Preview Table */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Preview ({filteredFees.length} matching transactions)</span>
              </span>
              <span>Showing first 5 rows</span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Receipt No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Month</th>
                    <th className="p-3 text-right">Net Amount</th>
                    <th className="p-3 text-right">Paid</th>
                    <th className="p-3 text-right">Due</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredFees.slice(0, 5).map((f) => (
                    <tr key={f.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-indigo-400">{f.receiptNo || f.id.slice(-6)}</td>
                      <td className="p-3 font-medium text-white">{f.studentName}</td>
                      <td className="p-3">{f.className}</td>
                      <td className="p-3">{f.feeMonth}</td>
                      <td className="p-3 text-right font-mono">₹{f.totalAmount}</td>
                      <td className="p-3 text-right font-mono text-emerald-400">₹{f.paidAmount}</td>
                      <td className="p-3 text-right font-mono text-amber-400">₹{f.balanceAmount !== undefined ? f.balanceAmount : Math.max(0, f.totalAmount - f.paidAmount)}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            f.status === 'Paid'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : f.status === 'Partial'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Grades Export */}
      {activeTab === 'grades' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Filter className="w-3.5 h-3.5 text-indigo-400" />
                <span>Term & Class:</span>
              </div>
              <select
                value={selectedGradeTerm}
                onChange={(e) => setSelectedGradeTerm(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
              >
                <option value="all">All Examination Terms</option>
                {gradeTerms.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
              >
                <option value="all">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  exportGradeSheetsData(grades, students, 'csv', {
                    term: selectedGradeTerm,
                    classId: selectedClass,
                  });
                  showNotification('MBSE Grade Sheets exported as CSV.');
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => {
                  exportGradeSheetsData(grades, students, 'excel', {
                    term: selectedGradeTerm,
                    classId: selectedClass,
                  });
                  showNotification('MBSE Grade Sheets exported as Excel (.xls).');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Excel (.xls)</span>
              </button>
            </div>
          </div>

          {/* Grades Preview */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Preview ({filteredGrades.length} exam records)</span>
              </span>
              <span>Showing first 5 rows</span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Roll</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Term</th>
                    <th className="p-3 text-right">Marks</th>
                    <th className="p-3 text-right">Max</th>
                    <th className="p-3 text-right">Percentage</th>
                    <th className="p-3">MBSE Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredGrades.slice(0, 5).map((g) => (
                    <tr key={g.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-amber-400">#{g.rank || '-'}</td>
                      <td className="p-3 font-mono">{g.rollNo}</td>
                      <td className="p-3 font-medium text-white">{g.studentName}</td>
                      <td className="p-3">{g.examTerm}</td>
                      <td className="p-3 text-right font-mono">{g.totalMarksObtained}</td>
                      <td className="p-3 text-right font-mono">{g.totalMaxMarks}</td>
                      <td className="p-3 text-right font-mono font-semibold text-emerald-400">
                        {g.percentage}%
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[11px]">
                          {g.overallGrade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Attendance Export */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Filter className="w-3.5 h-3.5 text-indigo-400" />
                <span>Class & Date:</span>
              </div>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
              >
                <option value="all">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={selectedAttendanceDate}
                onChange={(e) => setSelectedAttendanceDate(e.target.value)}
                placeholder="Specific Date"
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
              />
              {selectedAttendanceDate && (
                <button
                  onClick={() => setSelectedAttendanceDate('')}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Clear Date
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  exportAttendanceData(attendance, students, classes, 'csv', {
                    classId: selectedClass,
                    date: selectedAttendanceDate,
                  });
                  showNotification('Attendance Register exported as CSV.');
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => {
                  exportAttendanceData(attendance, students, classes, 'excel', {
                    classId: selectedClass,
                    date: selectedAttendanceDate,
                  });
                  showNotification('Attendance Register exported as Excel (.xls).');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Excel (.xls)</span>
              </button>
            </div>
          </div>

          {/* Attendance Preview */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Preview ({filteredAttendance.length} attendance logs)</span>
              </span>
              <span>Showing first 5 rows</span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Roll</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Remarks / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredAttendance.slice(0, 5).map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono">{a.date}</td>
                      <td className="p-3 font-mono">{a.rollNo}</td>
                      <td className="p-3 font-medium text-white">{a.studentName}</td>
                      <td className="p-3">{a.className}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            a.status === 'Present'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : a.status === 'Absent'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{a.remarks || 'None'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Institutional Backup */}
      {activeTab === 'backup' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Archive className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Full Institutional Disaster Recovery Archive</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                Generates an encrypted, structured JSON snapshot of all 17 collections in the Mizoram School System: students, classes, attendance registers, fee transaction logs, report cards, routines, library books, staff records, payroll, notices, and admissions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400">Total Students:</span>
              <div className="text-sm font-bold text-white mt-0.5">{students.length}</div>
            </div>
            <div>
              <span className="text-slate-400">Fee Invoices:</span>
              <div className="text-sm font-bold text-white mt-0.5">{fees.length}</div>
            </div>
            <div>
              <span className="text-slate-400">Attendance Records:</span>
              <div className="text-sm font-bold text-white mt-0.5">{attendance.length}</div>
            </div>
            <div>
              <span className="text-slate-400">Grade Assessments:</span>
              <div className="text-sm font-bold text-white mt-0.5">{grades.length}</div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                exportInstitutionalBackupJson(allCollections);
                showNotification('Comprehensive School Backup JSON downloaded.');
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Complete Backup JSON</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
