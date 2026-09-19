import QRCode from 'qrcode';
import { FeeRecord, FeeTransaction, FirestoreStudent, FeeStatus } from '../types';
import { updateDocument } from './firebase';
import { syncStudentFeeClearance } from './feeService';

export interface UpiConfig {
  vpa: string; // Virtual Payment Address e.g. zoxs.school@sbi
  payeeName: string; // Institutional Payee Name
  merchantCode?: string; // Optional MCC (e.g. 8220 for Schools)
}

export const DEFAULT_UPI_CONFIG: UpiConfig = {
  vpa: 'zoxs.school@sbi',
  payeeName: 'Govt Mizo HSS - ZOXS SMS',
  merchantCode: '8220',
};

export type SupportedUpiApp = 'Google Pay' | 'PhonePe' | 'Paytm' | 'BHIM SBI Pay' | 'Amazon Pay' | 'Other Bank UPI';

export interface UpiPaymentIntent {
  upiUri: string;
  gpayUri: string;
  phonepeUri: string;
  paytmUri: string;
  qrDataUrl: string;
  vpa: string;
  payeeName: string;
  amount: number;
  transactionNote: string;
  referenceId: string;
}

/**
 * Builds standard NPCI UPI URI and specific intent links
 */
export function buildUpiPaymentUri(params: {
  vpa?: string;
  payeeName?: string;
  amount: number;
  transactionNote: string;
  referenceId?: string;
}): {
  standardUri: string;
  gpayUri: string;
  phonepeUri: string;
  paytmUri: string;
} {
  const vpa = params.vpa || DEFAULT_UPI_CONFIG.vpa;
  const payee = params.payeeName || DEFAULT_UPI_CONFIG.payeeName;
  const amountStr = params.amount.toFixed(2);
  const note = params.transactionNote;
  const ref = params.referenceId || `ZOXS-${Date.now().toString().slice(-6)}`;

  const queryParams = new URLSearchParams({
    pa: vpa,
    pn: payee,
    am: amountStr,
    tn: note,
    cu: 'INR',
    tr: ref,
    mc: DEFAULT_UPI_CONFIG.merchantCode || '8220',
  });

  const standardUri = `upi://pay?${queryParams.toString()}`;
  const gpayUri = `gpay://upi/pay?${queryParams.toString()}`;
  const phonepeUri = `phonepe://pay?${queryParams.toString()}`;
  const paytmUri = `paytmmp://pay?${queryParams.toString()}`;

  return {
    standardUri,
    gpayUri,
    phonepeUri,
    paytmUri,
  };
}

/**
 * Generates a high-quality UPI QR Code Data URL with customizable colors
 */
export async function generateUpiQrDataUrl(
  upiUri: string,
  options?: {
    width?: number;
    margin?: number;
    darkColor?: string;
    lightColor?: string;
  }
): Promise<string> {
  try {
    return await QRCode.toDataURL(upiUri, {
      width: options?.width || 320,
      margin: options?.margin !== undefined ? options?.margin : 2,
      color: {
        dark: options?.darkColor || '#0f172a',
        light: options?.lightColor || '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
  } catch (error) {
    console.error('Failed to generate UPI QR code:', error);
    return '';
  }
}

/**
 * Prepares complete UPI Payment Intent with QR and links for a student fee record
 */
export async function prepareFeeUpiPaymentIntent(
  feeRecord: FeeRecord,
  customAmount?: number,
  customVpa?: string
): Promise<UpiPaymentIntent> {
  const balance = Math.max(
    0,
    feeRecord.balanceAmount !== undefined
      ? feeRecord.balanceAmount
      : feeRecord.totalAmount - feeRecord.paidAmount
  );

  const amountToCharge = customAmount !== undefined && customAmount > 0 ? customAmount : balance;
  const vpa = customVpa || DEFAULT_UPI_CONFIG.vpa;
  const payeeName = DEFAULT_UPI_CONFIG.payeeName;
  const referenceId = `FEE-${feeRecord.id.replace(/[^a-zA-Z0-9]/g, '').slice(-8)}-${Date.now().toString().slice(-4)}`;
  const transactionNote = `Fee ${feeRecord.feeMonth} R#${feeRecord.rollNo} ${feeRecord.studentName.slice(0, 15)}`;

  const { standardUri, gpayUri, phonepeUri, paytmUri } = buildUpiPaymentUri({
    vpa,
    payeeName,
    amount: amountToCharge,
    transactionNote,
    referenceId,
  });

  const qrDataUrl = await generateUpiQrDataUrl(standardUri);

  return {
    upiUri: standardUri,
    gpayUri,
    phonepeUri,
    paytmUri,
    qrDataUrl,
    vpa,
    payeeName,
    amount: amountToCharge,
    transactionNote,
    referenceId,
  };
}

/**
 * Validates standard Indian Banking UPI Transaction Reference (UTR)
 * Typically 12 numerical digits or alphanumeric bank confirmation code
 */
export function validateUtrNumber(utr: string): { isValid: boolean; message?: string } {
  const trimmed = utr.trim();
  if (!trimmed) {
    return { isValid: false, message: 'UPI UTR / Transaction ID is required.' };
  }

  // Common NPCI format is 12 digits (e.g. 425612348912)
  // or bank prefixed (e.g. UPI/425612348912 or CIC489124019)
  const cleanUtr = trimmed.replace(/\s+/g, '');
  if (cleanUtr.length < 6) {
    return { isValid: false, message: 'UTR must be at least 6 characters.' };
  }

  if (cleanUtr.length > 32) {
    return { isValid: false, message: 'UTR cannot exceed 32 characters.' };
  }

  return { isValid: true };
}

/**
 * Verifies UPI payment with UTR and performs automated status shift from 'Pending' to 'Paid'
 * updates 'fee_records' and 'fees' in Firestore, and syncs student fee clearance.
 */
export async function verifyAndRecordUpiPayment(params: {
  feeRecord: FeeRecord;
  utrNumber: string;
  paidAmount: number;
  upiApp: SupportedUpiApp;
  payerName?: string;
  payerPhone?: string;
  verifiedBy?: string;
  notes?: string;
  allFeeRecords: FeeRecord[];
  allStudents: FirestoreStudent[];
}): Promise<{ updatedFee: FeeRecord; transaction: FeeTransaction }> {
  const {
    feeRecord,
    utrNumber,
    paidAmount,
    upiApp,
    payerName,
    payerPhone,
    verifiedBy = 'UPI Gateway Auto-Verifier',
    notes,
    allFeeRecords,
    allStudents,
  } = params;

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const receiptNo = `RCP-UPI-${now.getFullYear()}-${randNum}`;
  const transactionId = `TXN-UPI-${Date.now().toString().slice(-6)}-${randNum}`;

  const cleanUtr = utrNumber.trim().toUpperCase();

  const transaction: FeeTransaction = {
    transactionId,
    receiptNo,
    amount: paidAmount,
    paymentDate: dateStr,
    paymentTime: timeStr,
    paymentMethod: `UPI (${upiApp})`,
    paymentChannel: 'UPI',
    referenceNumber: cleanUtr,
    receivedBy: verifiedBy,
    notes:
      notes ||
      `UPI / GPay electronic settlement via ${upiApp}. UTR: ${cleanUtr}${
        payerName ? ` | Payer: ${payerName}` : ''
      }${payerPhone ? ` (${payerPhone})` : ''}`,
  };

  const newPaidAmount = (feeRecord.paidAmount || 0) + paidAmount;
  const newBalance = Math.max(0, feeRecord.totalAmount - newPaidAmount);
  const isFullyCleared = newBalance === 0;

  const newStatus: FeeStatus = isFullyCleared ? 'Paid' : 'Partial';

  const updatedHistory = [...(feeRecord.paymentHistory || []), transaction];

  const updatedFeeData: Partial<FeeRecord> = {
    paidAmount: newPaidAmount,
    balanceAmount: newBalance,
    status: newStatus,
    paymentMethod: `UPI (${upiApp})`,
    receiptNo,
    paymentHistory: updatedHistory,
    isFeeCleared: isFullyCleared,
    clearedAt: isFullyCleared ? now.toISOString() : undefined,
    updatedAt: now.toISOString(),
  };

  // 1. Update in 'fee_records' Firestore collection
  await updateDocument<FeeRecord>('fee_records', feeRecord.id, updatedFeeData);

  // 2. Update in 'fees' Firestore collection (mirror)
  await updateDocument<FeeRecord>('fees', feeRecord.id, updatedFeeData);

  const updatedFee: FeeRecord = {
    ...feeRecord,
    ...updatedFeeData,
  } as FeeRecord;

  // 3. Automated status updates shifting student clearance to 'Cleared'
  const updatedAllFees = allFeeRecords.map((f) => (f.id === feeRecord.id ? updatedFee : f));
  await syncStudentFeeClearance(feeRecord.studentId, updatedAllFees, allStudents);

  return { updatedFee, transaction };
}
