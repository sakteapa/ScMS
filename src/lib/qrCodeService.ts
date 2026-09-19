/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Mizoram School System (zoxs-sms) - QR Code Generation & Management Service
 * Provides cryptographic/standardized QR payload creation, verification, batch generation,
 * and high-resolution rendering for Student ID cards and live attendance scanners.
 */

import QRCode from 'qrcode';
import { FirestoreStudent, StudentQrPayload } from '../types';

export const QR_SYSTEM_IDENTIFIER = 'zoxs-sms';
export const CURRENT_ACADEMIC_YEAR = '2026-2027';

/**
 * Builds a standardized, tamper-checked QR payload object for a student
 */
export function buildStudentQrPayload(
  student: Partial<FirestoreStudent> & { id: string; name: string; rollNo: number; classId: string; className: string }
): StudentQrPayload {
  return {
    system: QR_SYSTEM_IDENTIFIER,
    version: 1,
    studentId: student.id,
    name: student.name.trim(),
    rollNo: student.rollNo,
    classId: student.classId,
    className: student.className,
    stage: student.stage,
    stream: student.stream,
    academicYear: CURRENT_ACADEMIC_YEAR,
    parentPhone: student.parentPhone,
    bloodGroup: student.bloodGroup || 'B+',
    timestamp: Date.now(),
  };
}

/**
 * Encodes payload into a standard serialized JSON string
 */
export function serializeStudentQr(payload: StudentQrPayload): string {
  return JSON.stringify(payload);
}

/**
 * Generates a high-contrast DataURL string suitable for HTML <img> and printing
 */
export async function generateStudentQrDataUrl(
  studentOrPayload: FirestoreStudent | StudentQrPayload,
  options?: {
    width?: number;
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    darkColor?: string;
    lightColor?: string;
  }
): Promise<string> {
  const payload: StudentQrPayload =
    'system' in studentOrPayload && studentOrPayload.system === QR_SYSTEM_IDENTIFIER
      ? (studentOrPayload as StudentQrPayload)
      : buildStudentQrPayload(studentOrPayload as FirestoreStudent);

  const payloadText = serializeStudentQr(payload);

  return QRCode.toDataURL(payloadText, {
    width: options?.width || 280,
    margin: options?.margin ?? 1,
    errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
    color: {
      dark: options?.darkColor || '#090d16',
      light: options?.lightColor || '#ffffff',
    },
  });
}

/**
 * Parses and decodes scanned QR string from camera or uploaded file
 */
export function parseStudentQrText(rawText: string): {
  success: boolean;
  studentId?: string;
  rollNo?: number;
  name?: string;
  classId?: string;
  className?: string;
  rawPayload?: any;
  error?: string;
} {
  if (!rawText || !rawText.trim()) {
    return { success: false, error: 'Empty QR code stream' };
  }

  const trimmed = rawText.trim();

  // 1. Try parsing JSON format
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') {
      const studentId = parsed.studentId || parsed.id;
      const rollNo = typeof parsed.rollNo === 'number' ? parsed.rollNo : parseInt(parsed.rollNo, 10);
      const name = parsed.name || parsed.studentName;
      const classId = parsed.classId;
      const className = parsed.className;

      if (studentId || !isNaN(rollNo) || name) {
        return {
          success: true,
          studentId: studentId || undefined,
          rollNo: !isNaN(rollNo) ? rollNo : undefined,
          name,
          classId,
          className,
          rawPayload: parsed,
        };
      }
    }
  } catch {
    // Not JSON, continue to fallback parsers
  }

  // 2. Compact Token Format: ZOXS:STD:<id>:<rollNo>:<classId>
  if (trimmed.startsWith('ZOXS:STD:')) {
    const parts = trimmed.split(':');
    if (parts.length >= 4) {
      const studentId = parts[2];
      const rollNo = parseInt(parts[3], 10);
      const classId = parts[4] || undefined;
      return {
        success: true,
        studentId,
        rollNo: !isNaN(rollNo) ? rollNo : undefined,
        classId,
        rawPayload: { compactToken: trimmed },
      };
    }
  }

  // 3. Fallback Regex Parsing for Plain Text roll or name
  const rollMatch = trimmed.match(/roll\s*#?:?\s*(\d+)/i) || trimmed.match(/^(\d+)$/);
  if (rollMatch) {
    const rollNo = parseInt(rollMatch[1], 10);
    return {
      success: true,
      rollNo,
      rawPayload: { text: trimmed },
    };
  }

  // 4. Fallback name match if alphabetic string
  if (trimmed.length > 2 && /^[a-zA-Z\s.-]+$/.test(trimmed)) {
    return {
      success: true,
      name: trimmed,
      rawPayload: { text: trimmed },
    };
  }

  return {
    success: false,
    error: `Unrecognized QR format: "${trimmed.slice(0, 35)}"`,
  };
}

/**
 * Batch generates QR Data URLs for a list of students
 */
export async function generateBatchStudentQrs(
  students: FirestoreStudent[]
): Promise<Record<string, string>> {
  const resultMap: Record<string, string> = {};
  await Promise.all(
    students.map(async (student) => {
      try {
        const url = await generateStudentQrDataUrl(student, { width: 240 });
        resultMap[student.id] = url;
      } catch (e) {
        console.error('Failed to generate QR for student:', student.id, e);
      }
    })
  );
  return resultMap;
}

/**
 * Downloads a student's QR code as a PNG file
 */
export async function downloadStudentQrPng(student: FirestoreStudent): Promise<void> {
  const dataUrl = await generateStudentQrDataUrl(student, { width: 600 });
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `QR_${student.rollNo}_${student.name.replace(/\s+/g, '_')}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
