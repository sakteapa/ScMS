import { FeeRecord, FeeTransaction, FeeComponentBreakdown, FirestoreStudent, FeeStatus, StudentFeeClearanceStatus, FeeType } from '../types';
import { updateDocument, subscribeToCollection, addDocument } from './firebase';

export interface FeeStructurePreset {
  classGrade: string;
  monthlyFee: number;
  breakdown: FeeComponentBreakdown;
  description: string;
}

export const STANDARD_FEE_PRESETS: Record<string, FeeStructurePreset> = {
  'Class 10': {
    classGrade: 'Class 10',
    monthlyFee: 2200,
    breakdown: {
      tuitionFee: 1400,
      examFee: 300,
      computerLabFee: 250,
      developmentFund: 100,
      libraryFee: 50,
      sportsActivityFee: 100,
      lateFine: 0,
      concessionDiscount: 0,
    },
    description: 'MBSE High School Secondary standard monthly tuition and lab fees',
  },
  'Class 9': {
    classGrade: 'Class 9',
    monthlyFee: 2000,
    breakdown: {
      tuitionFee: 1300,
      examFee: 250,
      computerLabFee: 200,
      developmentFund: 100,
      libraryFee: 50,
      sportsActivityFee: 100,
      lateFine: 0,
      concessionDiscount: 0,
    },
    description: 'Class 9 regular academic and digital computer lab fees',
  },
  'Class 8': {
    classGrade: 'Class 8',
    monthlyFee: 1800,
    breakdown: {
      tuitionFee: 1200,
      examFee: 200,
      computerLabFee: 180,
      developmentFund: 100,
      libraryFee: 40,
      sportsActivityFee: 80,
      lateFine: 0,
      concessionDiscount: 0,
    },
    description: 'Middle School foundation and activity fees',
  },
};

/**
 * Converts a number to words in Indian Rupees format for official vouchers
 */
export function numberToIndianRupeesWords(amount: number): string {
  if (amount === 0) return 'Zero Rupees Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(num: number): string {
    if (num === 0) return '';
    if (num < 20) return a[num] + ' ';
    if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + a[num % 10] : '') + ' ';
    if (num < 1000) return a[Math.floor(num / 100)] + ' Hundred ' + inWords(num % 100);
    if (num < 100000) return inWords(Math.floor(num / 1000)) + 'Thousand ' + inWords(num % 1000);
    if (num < 10000000) return inWords(Math.floor(num / 100000)) + 'Lakh ' + inWords(num % 100000);
    return inWords(Math.floor(num / 10000000)) + 'Crore ' + inWords(num % 10000000);
  }

  const words = inWords(Math.floor(amount)).trim();
  return `Rupees ${words} Only`;
}

/**
 * Calculates current fee clearance status across all fee records for a student
 */
export function computeStudentFeeClearance(studentFeeRecords: FeeRecord[]): {
  status: StudentFeeClearanceStatus;
  totalDue: number;
  totalPaid: number;
  totalBilled: number;
  lastPaymentDate?: string;
  lastReceiptNo?: string;
} {
  if (!studentFeeRecords || studentFeeRecords.length === 0) {
    return {
      status: 'Cleared',
      totalDue: 0,
      totalPaid: 0,
      totalBilled: 0,
    };
  }

  let totalDue = 0;
  let totalPaid = 0;
  let totalBilled = 0;
  let hasOverdue = false;
  let hasPartial = false;
  let hasPending = false;
  let latestPaymentDate: string | undefined;
  let latestReceiptNo: string | undefined;

  const todayStr = new Date().toISOString().split('T')[0];

  studentFeeRecords.forEach((record) => {
    const total = record.totalAmount || 0;
    const paid = record.paidAmount || 0;
    const balance = Math.max(0, record.balanceAmount !== undefined ? record.balanceAmount : total - paid);

    totalBilled += total;
    totalPaid += paid;
    totalDue += balance;

    if (record.paymentHistory && record.paymentHistory.length > 0) {
      const sortedHistory = [...record.paymentHistory].sort(
        (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      );
      if (sortedHistory[0]) {
        if (!latestPaymentDate || new Date(sortedHistory[0].paymentDate) > new Date(latestPaymentDate)) {
          latestPaymentDate = sortedHistory[0].paymentDate;
          latestReceiptNo = sortedHistory[0].receiptNo;
        }
      }
    } else if (record.receiptNo && record.receiptNo !== '—' && record.paidAmount > 0) {
      latestReceiptNo = record.receiptNo;
      latestPaymentDate = record.updatedAt?.split('T')[0] || todayStr;
    }

    if (balance > 0) {
      if (record.status === 'Overdue' || (record.dueDate && record.dueDate < todayStr)) {
        hasOverdue = true;
      } else if (paid > 0) {
        hasPartial = true;
      } else {
        hasPending = true;
      }
    }
  });

  let status: StudentFeeClearanceStatus = 'Cleared';
  if (totalDue > 0) {
    if (hasOverdue) {
      status = 'Overdue';
    } else if (hasPartial) {
      status = 'Partial';
    } else if (hasPending) {
      status = 'Pending';
    }
  }

  return {
    status,
    totalDue,
    totalPaid,
    totalBilled,
    lastPaymentDate: latestPaymentDate,
    lastReceiptNo: latestReceiptNo,
  };
}

/**
 * Automatically calculates and synchronizes fee clearance status on a student's profile
 */
export async function syncStudentFeeClearance(
  studentId: string,
  feeRecords: FeeRecord[],
  studentsList: FirestoreStudent[]
): Promise<void> {
  const student = studentsList.find((s) => s.id === studentId);
  if (!student) return;

  const studentFees = feeRecords.filter((f) => f.studentId === studentId);
  const clearance = computeStudentFeeClearance(studentFees);

  const needsUpdate =
    student.feeStatus !== clearance.status ||
    student.totalFeesDue !== clearance.totalDue ||
    student.totalFeesPaid !== clearance.totalPaid;

  if (needsUpdate) {
    await updateDocument<FirestoreStudent>('students', studentId, {
      feeStatus: clearance.status,
      totalFeesDue: clearance.totalDue,
      totalFeesPaid: clearance.totalPaid,
      lastFeePaymentDate: clearance.lastPaymentDate,
      lastReceiptNo: clearance.lastReceiptNo,
    });
  }
}

/**
 * Synchronizes fee clearance status across all students in batch
 */
export async function syncAllStudentsFeeClearance(
  feeRecords: FeeRecord[],
  studentsList: FirestoreStudent[]
): Promise<void> {
  for (const student of studentsList) {
    await syncStudentFeeClearance(student.id, feeRecords, studentsList);
  }
}

/**
 * Records a payment transaction, updates fee record, appends transaction history,
 * and triggers automated fee clearance synchronization on the student profile.
 */
export async function recordFeeTransaction(params: {
  feeRecordId: string;
  studentId: string;
  studentName: string;
  paymentAmount: number;
  paymentMethod: string;
  paymentChannel?: 'Cash' | 'UPI' | 'Bank';
  receiptNo?: string;
  cashierName?: string;
  cashTendered?: number;
  changeGiven?: number;
  referenceNumber?: string;
  receivedBy: string;
  notes?: string;
  currentFeeRecord: FeeRecord;
  allFeeRecords: FeeRecord[];
  allStudents: FirestoreStudent[];
}): Promise<{ updatedFee: FeeRecord; transaction: FeeTransaction }> {
  const {
    feeRecordId,
    studentId,
    paymentAmount,
    paymentMethod,
    paymentChannel,
    receiptNo: customReceiptNo,
    cashierName,
    cashTendered,
    changeGiven,
    referenceNumber,
    receivedBy,
    notes,
    currentFeeRecord,
    allFeeRecords,
    allStudents,
  } = params;

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const randCode = Math.floor(1000 + Math.random() * 9000);

  // Determine channel if not explicitly passed
  const isCash = paymentChannel === 'Cash' || paymentMethod.toLowerCase().includes('cash');
  const isUpi = paymentChannel === 'UPI' || paymentMethod.toLowerCase().includes('upi') || paymentMethod.toLowerCase().includes('gpay');
  const detectedChannel: 'Cash' | 'UPI' | 'Bank' = isCash ? 'Cash' : isUpi ? 'UPI' : 'Bank';

  // Smart receipt number formatting
  let finalReceiptNo = customReceiptNo;
  if (!finalReceiptNo) {
    if (detectedChannel === 'Cash') {
      finalReceiptNo = `RCP-CSH-${now.getFullYear()}-${randCode}`;
    } else if (detectedChannel === 'UPI') {
      finalReceiptNo = `RCP-UPI-${now.getFullYear()}-${randCode}`;
    } else {
      finalReceiptNo = `RCP-${now.getFullYear()}-${randCode}`;
    }
  }

  const transactionId = `TXN-${Date.now().toString().slice(-6)}-${randCode}`;

  const transaction: FeeTransaction = {
    transactionId,
    receiptNo: finalReceiptNo,
    amount: paymentAmount,
    paymentDate: dateStr,
    paymentTime: timeStr,
    paymentMethod,
    paymentChannel: detectedChannel,
    referenceNumber: referenceNumber || (isCash ? `CSH-${randCode}` : `REF-${Math.floor(Math.random() * 1000000)}`),
    receivedBy: cashierName || receivedBy || 'Accounts & Bursar Office',
    cashierName: cashierName || receivedBy || 'Accounts Cashier',
    cashTendered: cashTendered !== undefined ? cashTendered : (isCash ? paymentAmount : undefined),
    changeGiven: changeGiven !== undefined ? changeGiven : (isCash ? 0 : undefined),
    notes: notes || (isCash ? 'Cash counter receipt settlement' : 'Tuition and institutional fee collection'),
  };

  const newPaidAmount = (currentFeeRecord.paidAmount || 0) + paymentAmount;
  const newBalance = Math.max(0, currentFeeRecord.totalAmount - newPaidAmount);
  const isFullyCleared = newBalance === 0;

  let newStatus: FeeStatus = 'Paid';
  if (newBalance > 0) {
    newStatus = 'Partial';
  }

  const updatedHistory = [...(currentFeeRecord.paymentHistory || []), transaction];

  const updatedFeeData: Partial<FeeRecord> = {
    paidAmount: newPaidAmount,
    balanceAmount: newBalance,
    status: newStatus,
    paymentMethod,
    receiptNo: finalReceiptNo,
    paymentHistory: updatedHistory,
    isFeeCleared: isFullyCleared,
    clearedAt: isFullyCleared ? now.toISOString() : undefined,
    updatedAt: now.toISOString(),
  };

  // Update in fee_records and fees collections
  await updateDocument<FeeRecord>('fee_records', feeRecordId, updatedFeeData);
  await updateDocument<FeeRecord>('fees', feeRecordId, updatedFeeData);

  const updatedRecord: FeeRecord = {
    ...currentFeeRecord,
    ...updatedFeeData,
  } as FeeRecord;

  // Sync fee clearance on student profile
  const updatedAllFees = allFeeRecords.map((f) => (f.id === feeRecordId ? updatedRecord : f));
  await syncStudentFeeClearance(studentId, updatedAllFees, allStudents);

  return { updatedFee: updatedRecord, transaction };
}

/**
 * Creates a brand new fee record for a student (e.g. Monthly, Exam, or Special Term)
 */
export async function createStudentFeeRecord(params: {
  student: FirestoreStudent;
  feeMonth: string;
  academicYear: string;
  feeType: FeeType;
  breakdown: FeeComponentBreakdown;
  dueDate: string;
  remarks?: string;
  allFeeRecords: FeeRecord[];
  allStudents: FirestoreStudent[];
}): Promise<FeeRecord> {
  const { student, feeMonth, academicYear, feeType, breakdown, dueDate, remarks, allFeeRecords, allStudents } = params;

  const totalAmount =
    (breakdown.tuitionFee || 0) +
    (breakdown.examFee || 0) +
    (breakdown.computerLabFee || 0) +
    (breakdown.developmentFund || 0) +
    (breakdown.libraryFee || 0) +
    (breakdown.sportsActivityFee || 0) +
    (breakdown.lateFine || 0) -
    (breakdown.concessionDiscount || 0);

  const now = new Date().toISOString();
  const id = `fee-${Date.now().toString().slice(-6)}-${student.rollNo}`;

  const newRecord: FeeRecord = {
    id,
    studentId: student.id,
    studentName: student.name,
    rollNo: student.rollNo,
    classId: student.classId,
    className: student.className,
    academicYear: academicYear || '2026-2027',
    feeMonth,
    feeType: feeType || 'Tuition',
    feeStructure: breakdown,
    totalAmount,
    paidAmount: 0,
    balanceAmount: totalAmount,
    dueDate,
    status: 'Pending',
    paymentMethod: 'Pending',
    receiptNo: '—',
    paymentHistory: [],
    isFeeCleared: false,
    remarks: remarks || '',
    createdAt: now,
    updatedAt: now,
  };

  await addDocument<FeeRecord>('fee_records', newRecord);
  await addDocument<FeeRecord>('fees', newRecord);

  // Sync fee clearance on student profile
  await syncStudentFeeClearance(student.id, [...allFeeRecords, newRecord], allStudents);

  return newRecord;
}

/**
 * Generates an official Mizo / English fee reminder message for parents
 */
export function generateParentReminderMessage(student: FirestoreStudent, feeRecord?: FeeRecord): string {
  const due = feeRecord ? (feeRecord.balanceAmount !== undefined ? feeRecord.balanceAmount : feeRecord.totalAmount - feeRecord.paidAmount) : (student.totalFeesDue || 2200);
  const month = feeRecord?.feeMonth || 'September 2026';
  const dueDate = feeRecord?.dueDate || '15th of the month';

  return `🔔 ZOXS HIGHER SECONDARY SCHOOL, AIZAWL
Hriattirna / Fee Reminder Notice

Nu leh Pa / Enkawltu zahawm takte u,
I fa duhtak ${student.name} (Roll No: ${student.rollNo}, ${student.className}) ${month} School Fee ba ₹${due.toLocaleString()} hi ni ${dueDate} hma ngeia pe tura ngen in ni e.

Payment Mode:
1. School Cash Counter / Bursar Office
2. UPI (GPay / PhonePe / Paytm): 9862112345@mizoram-sbi
3. SBI Collect / mPAY Mizoram Rural Bank

Fee pek zawhah Official Receipt Voucher lak chhuah theih a ni.
- Bursar / Accounts Section, Mizoram School System`;
}
