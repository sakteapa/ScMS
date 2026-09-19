// Data Export Utilities for Mizoram School System (zoxs-sms)
// Generates UTF-8 encoded RFC4180 CSV and formatted Excel-compatible spreadsheets (.xls)

import { FirestoreStudent, SchoolClass, FeeRecord, GradeRecord, AttendanceRecord } from '../types';

export interface ExportColumn<T> {
  header: string;
  accessor: (item: T, index: number) => string | number | null | undefined;
}

/**
 * Trigger browser file download via Blob and hidden anchor
 */
export function downloadFile(content: string | Blob, filename: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Clean & escape field value for RFC4180 CSV
 */
function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Export arbitrary dataset to RFC4180 compliant CSV with UTF-8 BOM
 */
export function exportToCsv<T>(
  data: T[],
  filename: string,
  columns: ExportColumn<T>[]
) {
  // UTF-8 BOM (\uFEFF) ensures Excel opens multilingual characters & Rupee symbols correctly
  const headerRow = columns.map((c) => escapeCsvValue(c.header)).join(',');
  const rows = data.map((item, idx) =>
    columns.map((c) => escapeCsvValue(c.accessor(item, idx))).join(',')
  );

  const csvContent = '\uFEFF' + [headerRow, ...rows].join('\r\n');
  downloadFile(csvContent, filename.endsWith('.csv') ? filename : `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Generate formatted HTML/XML Excel file (.xls) with custom header, column styles, and summary totals
 */
export function exportToExcelTable(options: {
  title: string;
  subtitle?: string;
  filename: string;
  headers: string[];
  rows: (string | number)[][];
  summaryRows?: { label: string; value: string | number }[];
}) {
  const { title, subtitle, filename, headers, rows, summaryRows } = options;

  const headerHtml = headers
    .map(
      (h) =>
        `<th style="background-color: #1e1b4b; color: #ffffff; font-weight: bold; padding: 10px 14px; border: 1px solid #4338ca; font-family: Arial, sans-serif; font-size: 11pt; text-align: left;">${h}</th>`
    )
    .join('');

  const rowsHtml = rows
    .map((row, rIdx) => {
      const bg = rIdx % 2 === 0 ? '#f8fafc' : '#ffffff';
      const cells = row
        .map((cell) => {
          const isNum = typeof cell === 'number';
          return `<td style="background-color: ${bg}; padding: 8px 12px; border: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 10pt; text-align: ${
            isNum ? 'right' : 'left'
          };">${cell ?? ''}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  let summaryHtml = '';
  if (summaryRows && summaryRows.length > 0) {
    summaryHtml = summaryRows
      .map(
        (s) =>
          `<tr>
            <td colspan="${headers.length - 1}" style="background-color: #f1f5f9; padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; text-align: right; font-family: Arial, sans-serif; font-size: 10pt;">${s.label}</td>
            <td style="background-color: #f1f5f9; padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; text-align: right; font-family: Arial, sans-serif; font-size: 10pt; color: #1e1b4b;">${s.value}</td>
          </tr>`
      )
      .join('');
  }

  const excelDoc = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${title.slice(0, 31)}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td colspan="${headers.length}" style="background-color: #0f172a; color: #f8fafc; font-size: 16pt; font-weight: bold; padding: 14px; text-align: center; font-family: Arial, sans-serif;">
              ${title}
            </td>
          </tr>
          ${
            subtitle
              ? `<tr>
                  <td colspan="${headers.length}" style="background-color: #1e293b; color: #94a3b8; font-size: 10pt; padding: 6px 14px; text-align: center; font-family: Arial, sans-serif;">
                    ${subtitle} • Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>`
              : ''
          }
          <tr><td colspan="${headers.length}" style="height: 10px;"></td></tr>
          <thead>
            <tr>${headerHtml}</tr>
          </thead>
          <tbody>
            ${rowsHtml}
            ${summaryHtml}
          </tbody>
        </table>
      </body>
    </html>
  `;

  downloadFile(
    excelDoc,
    filename.endsWith('.xls') ? filename : `${filename}.xls`,
    'application/vnd.ms-excel;charset=utf-8;'
  );
}

/* =========================================================================
   SPECIALIZED DOMAIN EXPORTERS
   ========================================================================= */

/**
 * 1. Export Students Master Directory
 */
export function exportStudentsData(
  students: FirestoreStudent[],
  classes: SchoolClass[],
  format: 'csv' | 'excel' = 'csv',
  filters?: { classId?: string; status?: string }
) {
  let list = [...students];
  if (filters?.classId && filters.classId !== 'all') {
    list = list.filter((s) => s.classId === filters.classId);
  }
  if (filters?.status && filters.status !== 'all') {
    list = list.filter((s) => (s as any).feeStatus === filters.status);
  }

  const columns: ExportColumn<FirestoreStudent>[] = [
    { header: 'Student ID', accessor: (s) => s.id },
    { header: 'Roll No', accessor: (s) => s.rollNo },
    { header: 'Student Name', accessor: (s) => s.name },
    { header: 'Class', accessor: (s) => s.className },
    { header: 'Section', accessor: (s) => (s as any).section || 'A' },
    { header: 'Stream', accessor: (s) => s.stream || 'General' },
    { header: 'Gender', accessor: (s) => s.gender || 'Not Specified' },
    { header: 'Parent Phone', accessor: (s) => s.parentPhone },
    { header: 'Residence Address', accessor: (s) => s.address || 'Aizawl, Mizoram' },
    { header: 'Blood Group', accessor: (s) => s.bloodGroup || 'O+' },
    { header: 'MBSE Reg Number', accessor: (s) => (s as any).mbseRegistrationNumber || `MBSE-2026-${s.rollNo}` },
    { header: 'Admission Date', accessor: (s) => (s as any).admissionDate || '2026-01-15' },
    { header: 'Attendance %', accessor: (s) => ((s as any).attendancePercentage ? `${(s as any).attendancePercentage}%` : '92%') },
    { header: 'Aggregate Marks %', accessor: (s) => (s.marks ? `${s.marks}%` : '85%') },
    { header: 'Fee Status', accessor: (s) => s.feeStatus || 'Pending' },
  ];

  const dateTag = new Date().toISOString().split('T')[0];
  const filename = `Mizoram_School_Students_${dateTag}`;

  if (format === 'csv') {
    exportToCsv(list, filename, columns);
  } else {
    const headers = columns.map((c) => c.header);
    const rows = list.map((item, idx) => columns.map((c) => c.accessor(item, idx) ?? ''));
    exportToExcelTable({
      title: 'GOVERNMENT OF MIZORAM - SCHOOL EDUCATION DEPARTMENT',
      subtitle: `Official Student Master Directory (${list.length} Enrolled Pupils)`,
      filename,
      headers,
      rows,
      summaryRows: [
        { label: 'Total Enrolled Students:', value: list.length },
      ],
    });
  }
}

/**
 * 2. Export Financial Fee Collection Ledger
 */
export function exportFeeLedgerData(
  fees: FeeRecord[],
  students: FirestoreStudent[],
  format: 'csv' | 'excel' = 'csv',
  filters?: { month?: string; status?: string; classId?: string }
) {
  let list = [...fees];
  if (filters?.month && filters.month !== 'all') {
    list = list.filter((f) => f.feeMonth === filters.month);
  }
  if (filters?.status && filters.status !== 'all') {
    list = list.filter((f) => f.status === filters.status);
  }
  if (filters?.classId && filters.classId !== 'all') {
    const studentIdsInClass = new Set(
      students.filter((s) => s.classId === filters.classId).map((s) => s.id)
    );
    list = list.filter((f) => studentIdsInClass.has(f.studentId));
  }

  const columns: ExportColumn<FeeRecord>[] = [
    { header: 'Receipt No', accessor: (f) => f.receiptNo || `REC-${f.id.slice(-6)}` },
    { header: 'Student Name', accessor: (f) => f.studentName },
    { header: 'Roll No', accessor: (f) => f.rollNo },
    { header: 'Class', accessor: (f) => f.className },
    { header: 'Fee Month', accessor: (f) => f.feeMonth },
    { header: 'Academic Year', accessor: (f) => f.academicYear || '2026-2027' },
    { header: 'Total Invoiced (₹)', accessor: (f) => f.totalAmount },
    { header: 'Discount / Concession (₹)', accessor: () => 0 },
    { header: 'Net Amount (₹)', accessor: (f) => f.totalAmount },
    { header: 'Amount Paid (₹)', accessor: (f) => f.paidAmount },
    { header: 'Balance Due (₹)', accessor: (f) => (f.balanceAmount !== undefined ? f.balanceAmount : Math.max(0, f.totalAmount - f.paidAmount)) },
    { header: 'Payment Status', accessor: (f) => f.status },
    { header: 'Payment Date', accessor: (f) => f.paymentHistory?.[0]?.paymentDate || f.updatedAt || 'N/A' },
    { header: 'Payment Mode', accessor: (f) => f.paymentMethod || 'N/A' },
    { header: 'Bank / UPI Ref / UTR', accessor: (f) => f.paymentHistory?.[0]?.referenceNumber || 'N/A' },
    { header: 'Cashier / Collector', accessor: (f) => f.paymentHistory?.[0]?.receivedBy || 'Finance Office' },
  ];

  const totalInvoiced = list.reduce((acc, f) => acc + (f.totalAmount || 0), 0);
  const totalCollected = list.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
  const totalBalanceDue = list.reduce((acc, f) => acc + (f.balanceAmount !== undefined ? f.balanceAmount : Math.max(0, f.totalAmount - f.paidAmount)), 0);
  const dateTag = new Date().toISOString().split('T')[0];
  const filename = `Mizoram_School_Fee_Collection_Report_${dateTag}`;

  if (format === 'csv') {
    exportToCsv(list, filename, columns);
  } else {
    const headers = columns.map((c) => c.header);
    const rows = list.map((item, idx) => columns.map((c) => c.accessor(item, idx) ?? ''));
    exportToExcelTable({
      title: 'MIZORAM SCHOOL SYSTEM - FINANCIAL FEE COLLECTION LEDGER',
      subtitle: `Official Treasury & Fee Collection Audit (${list.length} Fee Invoices)`,
      filename,
      headers,
      rows,
      summaryRows: [
        { label: 'Total Invoiced Amount (₹):', value: `₹${totalInvoiced.toLocaleString('en-IN')}` },
        { label: 'Total Revenue Collected (₹):', value: `₹${totalCollected.toLocaleString('en-IN')}` },
        { label: 'Total Outstanding Dues (₹):', value: `₹${totalBalanceDue.toLocaleString('en-IN')}` },
        {
          label: 'Overall Collection Efficiency:',
          value: totalInvoiced > 0 ? `${((totalCollected / totalInvoiced) * 100).toFixed(1)}%` : '100%',
        },
      ],
    });
  }
}

/**
 * 3. Export Examination Marksheets & MBSE Grade Register
 */
export function exportGradeSheetsData(
  grades: GradeRecord[],
  students: FirestoreStudent[],
  format: 'csv' | 'excel' = 'csv',
  filters?: { term?: string; classId?: string }
) {
  let list = [...grades];
  if (filters?.term && filters.term !== 'all') {
    list = list.filter((g) => g.examTerm === filters.term);
  }
  if (filters?.classId && filters.classId !== 'all') {
    list = list.filter((g) => g.classId === filters.classId);
  }

  // Sort by percentage descending
  list.sort((a, b) => (b.percentage || 0) - (a.percentage || 0));

  const columns: ExportColumn<GradeRecord>[] = [
    { header: 'Class Rank', accessor: (g) => g.rank || 'N/A' },
    { header: 'Roll No', accessor: (g) => g.rollNo },
    { header: 'Student Name', accessor: (g) => g.studentName },
    { header: 'Class', accessor: (g) => g.className },
    { header: 'Exam Term', accessor: (g) => g.examTerm },
    { header: 'Total Marks Obtained', accessor: (g) => g.totalMarksObtained },
    { header: 'Maximum Marks', accessor: (g) => g.totalMaxMarks },
    { header: 'Percentage (%)', accessor: (g) => `${g.percentage}%` },
    { header: 'MBSE Letter Grade', accessor: (g) => g.overallGrade },
    {
      header: 'Result Status',
      accessor: (g) => (g.percentage >= 33 ? 'Passed (Promoted)' : 'Compartment / Needs Improvement'),
    },
    { header: 'Class Teacher Appraisal Remarks', accessor: (g) => g.teacherRemarks || 'Satisfactory' },
  ];

  const dateTag = new Date().toISOString().split('T')[0];
  const filename = `MBSE_Grade_Register_${filters?.term || 'All_Terms'}_${dateTag}`;

  if (format === 'csv') {
    exportToCsv(list, filename, columns);
  } else {
    const headers = columns.map((c) => c.header);
    const rows = list.map((item, idx) => columns.map((c) => c.accessor(item, idx) ?? ''));
    const avgScore = list.length > 0 ? (list.reduce((a, b) => a + b.percentage, 0) / list.length).toFixed(1) : '0';
    exportToExcelTable({
      title: 'MIZORAM BOARD OF SCHOOL EDUCATION (MBSE) - OFFICIAL GRADE REGISTER',
      subtitle: `Form No. 14-B Academic Performance Ledger (${list.length} Candidate Records)`,
      filename,
      headers,
      rows,
      summaryRows: [
        { label: 'Total Candidates Assessed:', value: list.length },
        { label: 'Class Average Performance (%):', value: `${avgScore}%` },
      ],
    });
  }
}

/**
 * 4. Export Attendance Register
 */
export function exportAttendanceData(
  attendance: AttendanceRecord[],
  students: FirestoreStudent[],
  classes: SchoolClass[],
  format: 'csv' | 'excel' = 'csv',
  filters?: { classId?: string; date?: string }
) {
  let list = [...attendance];
  if (filters?.classId && filters.classId !== 'all') {
    list = list.filter((a) => a.classId === filters.classId);
  }
  if (filters?.date) {
    list = list.filter((a) => a.date === filters.date);
  }

  const columns: ExportColumn<AttendanceRecord>[] = [
    { header: 'Attendance ID', accessor: (a) => a.id },
    { header: 'Date', accessor: (a) => a.date },
    { header: 'Roll No', accessor: (a) => a.rollNo },
    { header: 'Student Name', accessor: (a) => a.studentName },
    { header: 'Class', accessor: (a) => a.className },
    { header: 'Status', accessor: (a) => a.status },
    { header: 'Absence Reason / Leave Remarks', accessor: (a) => a.remarks || 'None' },
    { header: 'Marked At / Time', accessor: (a) => a.markedAt || 'Class Teacher' },
  ];

  const dateTag = filters?.date || new Date().toISOString().split('T')[0];
  const filename = `Mizoram_School_Attendance_Register_${dateTag}`;

  if (format === 'csv') {
    exportToCsv(list, filename, columns);
  } else {
    const headers = columns.map((c) => c.header);
    const rows = list.map((item, idx) => columns.map((c) => c.accessor(item, idx) ?? ''));
    const presents = list.filter((a) => a.status === 'Present').length;
    const absents = list.filter((a) => a.status === 'Absent').length;
    const lates = list.filter((a) => a.status === 'Late').length;

    exportToExcelTable({
      title: 'MIZORAM SCHOOL SYSTEM - DAILY ATTENDANCE & PUNCTUALITY REGISTER',
      subtitle: `Official Roll Call Record (${list.length} Logs)`,
      filename,
      headers,
      rows,
      summaryRows: [
        { label: 'Present Count:', value: presents },
        { label: 'Absent Count:', value: absents },
        { label: 'Late Count:', value: lates },
        {
          label: 'Day Attendance Rate:',
          value: list.length > 0 ? `${((presents / list.length) * 100).toFixed(1)}%` : '0%',
        },
      ],
    });
  }
}

/**
 * 5. Full School Institutional Backup in JSON format
 */
export function exportInstitutionalBackupJson(allData: Record<string, any[]>) {
  const payload = {
    system: 'Mizoram School System (zoxs-sms)',
    version: '2.4.0',
    exportTimestamp: new Date().toISOString(),
    institution: 'Government of Mizoram School Education Department',
    boardAffiliation: 'Mizoram Board of School Education (MBSE)',
    collections: allData,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const dateTag = new Date().toISOString().split('T')[0];
  downloadFile(jsonStr, `ZoxsSMS_Disaster_Recovery_Backup_${dateTag}.json`, 'application/json;charset=utf-8;');
}
