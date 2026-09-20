import {
  FirestoreStudent,
  SchoolClass,
  FeeRecord,
  AttendanceRecord,
  NotificationLog,
  NotificationChannel,
  NotificationCategory,
  NotificationStatus,
} from '../types';
import { addDocument, updateDocument } from './firebase';

export interface InterpolationContext {
  student?: FirestoreStudent;
  schoolClass?: SchoolClass;
  feeRecord?: FeeRecord;
  attendanceRecord?: AttendanceRecord;
  customDate?: string;
  customAmount?: number;
  customDueDate?: string;
  schoolName?: string;
  teacherName?: string;
  remarks?: string;
}

/**
 * Clean and format phone number for WhatsApp wa.me API and SMS gateway.
 * For Indian/Mizoram numbers:
 * Converts "+91 98621 12345" -> "919862112345"
 * Converts "09862112345" -> "919862112345"
 * Converts "9862112345" -> "919862112345"
 */
export function formatPhoneNumberForApi(rawPhone: string): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return digits;
}

/**
 * Format for friendly human display (e.g., "+91 98621 12345")
 */
export function formatPhoneNumberDisplay(rawPhone: string): string {
  if (!rawPhone) return 'N/A';
  const clean = formatPhoneNumberForApi(rawPhone);
  if (clean.length === 12 && clean.startsWith('91')) {
    return `+91 ${clean.slice(2, 7)} ${clean.slice(7)}`;
  }
  return rawPhone;
}

/**
 * Generate direct WhatsApp API link (wa.me)
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const formattedPhone = formatPhoneNumberForApi(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
}

/**
 * Generate direct device SMS protocol link
 */
export function generateSmsLink(phone: string, message: string): string {
  const formattedPhone = formatPhoneNumberForApi(phone);
  const encodedText = encodeURIComponent(message);
  // Both mobile and modern desktop support sms: URI scheme
  return `sms:${formattedPhone}?body=${encodedText}`;
}

/**
 * Calculate SMS segments based on length and GSM-7 vs Unicode
 */
export function calculateSmsSegments(text: string): {
  charCount: number;
  segments: number;
  isUnicode: boolean;
} {
  const charCount = text.length;
  // Non-GSM characters include emojis or accented characters
  const isUnicode = /[^\u0000-\u007F]/.test(text);
  const limitPerSegment = isUnicode ? 70 : 160;
  const multiLimit = isUnicode ? 67 : 153;

  let segments = 1;
  if (charCount > limitPerSegment) {
    segments = Math.ceil(charCount / multiLimit);
  }

  return {
    charCount,
    segments,
    isUnicode,
  };
}

/**
 * Replace placeholders like {{student_name}}, {{roll_no}}, etc. with contextual data
 */
export function interpolateTemplate(
  templateContent: string,
  context: InterpolationContext
): string {
  const todayIso = new Date().toISOString().split('T')[0];
  const std = context.student;
  const cls = context.schoolClass;
  const fee = context.feeRecord;
  const att = context.attendanceRecord;

  const replacements: Record<string, string> = {
    '{{student_name}}': std?.name || 'Student',
    '{{roll_no}}': std ? std.rollNo.toString() : 'N/A',
    '{{class_name}}': std?.className || cls?.name || 'Class',
    '{{parent_name}}': std ? `Parent of ${std.name}` : 'Parent/Guardian',
    '{{parent_phone}}': std?.parentPhone || 'N/A',
    '{{date}}': context.customDate || att?.date || todayIso,
    '{{amount_due}}': (context.customAmount ?? fee?.balanceAmount ?? std?.totalFeesDue ?? 2200).toLocaleString(),
    '{{due_date}}': context.customDueDate || fee?.dueDate || '25th of this month',
    '{{school_name}}': context.schoolName || 'ZOXS Higher Secondary School, Aizawl',
    '{{teacher_name}}': context.teacherName || cls?.teacherName || 'Class Teacher',
    '{{remarks}}': context.remarks || std?.remarks || '',
  };

  let result = templateContent;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.split(key).join(value);
  }

  return result;
}

/**
 * Simulated enterprise SMS / WhatsApp Gateway dispatch with live Firestore logging
 */
export async function dispatchNotification({
  student,
  schoolClass,
  phone,
  channel,
  category,
  templateId,
  subject,
  message,
  dispatchedBy = 'Administrative Counter',
  forceFail = false,
}: {
  student?: FirestoreStudent;
  schoolClass?: SchoolClass;
  phone: string;
  channel: NotificationChannel;
  category: NotificationCategory;
  templateId?: string;
  subject?: string;
  message: string;
  dispatchedBy?: string;
  forceFail?: boolean;
}): Promise<NotificationLog> {
  const now = new Date();
  const timestamp = now.toISOString();
  const randomRef = Math.floor(1000 + Math.random() * 9000);
  const gatewayRef =
    channel === 'WhatsApp'
      ? `WA-API-${formatPhoneNumberForApi(phone).slice(-4)}-${randomRef}`
      : `SMS-DLT-${randomRef}`;

  let status: NotificationStatus = channel === 'WhatsApp' ? 'Delivered' : 'Sent';
  let failureReason: string | undefined = undefined;

  if (forceFail) {
    status = 'Failed';
    failureReason = 'Simulated Gateway Response: Carrier delivery route timeout / DND active';
  }

  const isDelivered = status === 'Delivered';
  const isFailed = status === 'Failed';

  const logEntry: Omit<NotificationLog, 'id'> = {
    studentId: student?.id,
    studentName: student?.name || (schoolClass ? `Class: ${schoolClass.name}` : 'General Broadcast'),
    rollNo: student?.rollNo,
    classId: student?.classId || schoolClass?.id,
    className: student?.className || schoolClass?.name || 'All Classes',
    parentName: student ? `Parent of ${student.name}` : 'Parent/Guardian',
    parentPhone: phone,
    channel,
    category,
    templateId,
    subject: subject || `${category} - ZOXS School`,
    message,
    status,
    timestamp,
    sentAt: !isFailed ? timestamp : undefined,
    deliveredAt: isDelivered ? timestamp : undefined,
    failureReason,
    gatewayRef,
    dispatchedBy,
  };

  const newId = await addDocument<NotificationLog>('notifications', logEntry);

  return {
    ...logEntry,
    id: newId,
  };
}

/**
 * Retry or re-send a failed/pending notification
 */
export async function retryNotificationLog(
  logId: string,
  updatedChannel?: NotificationChannel
): Promise<void> {
  const now = new Date().toISOString();
  const update: Partial<NotificationLog> = {
    status: 'Delivered',
    sentAt: now,
    deliveredAt: now,
    failureReason: undefined,
  };
  if (updatedChannel) {
    update.channel = updatedChannel;
    update.gatewayRef =
      updatedChannel === 'WhatsApp'
        ? `WA-RETRY-${Math.floor(1000 + Math.random() * 9000)}`
        : `SMS-RETRY-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  await updateDocument<NotificationLog>('notifications', logId, update);
}

/**
 * Update notification status manually (e.g., mark Delivered or Failed)
 */
export async function updateNotificationStatus(
  logId: string,
  status: NotificationStatus,
  failureReason?: string
): Promise<void> {
  const now = new Date().toISOString();
  const update: Partial<NotificationLog> = {
    status,
    failureReason: status === 'Failed' ? failureReason || 'Delivery failure reported by gateway' : undefined,
  };
  if (status === 'Delivered') {
    update.deliveredAt = now;
  }
  await updateDocument<NotificationLog>('notifications', logId, update);
}
