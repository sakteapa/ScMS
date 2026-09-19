import {
  TransportRoute,
  TransportStudentAssignment,
  HostelRoom,
  HostelResident,
  FeeRecord,
  FirestoreStudent,
  FeeType,
} from '../types';
import { addDocument, updateDocument } from './firebase';
import { recordFeeTransaction, syncStudentFeeClearance } from './feeService';

/**
 * Checks whether a specific fee type has already been invoiced for a student in the specified month
 */
export function isFeeAlreadyInvoiced(
  studentId: string,
  feeType: FeeType,
  feeMonth: string,
  allFees: FeeRecord[]
): FeeRecord | undefined {
  return allFees.find(
    (f) =>
      f.studentId === studentId &&
      f.feeType === feeType &&
      f.feeMonth.toLowerCase().trim() === feeMonth.toLowerCase().trim()
  );
}

/**
 * Posts an individual Transport Fee invoice directly to student accounts / fee ledger
 */
export async function postTransportFeeToStudentLedger(params: {
  route: TransportRoute;
  student: TransportStudentAssignment;
  feeMonth: string;
  dueDate: string;
  academicYear?: string;
  allFees: FeeRecord[];
  allStudents: FirestoreStudent[];
}): Promise<{ success: boolean; feeRecordId?: string; message: string; alreadyExisted?: boolean }> {
  const { route, student, feeMonth, dueDate, academicYear = '2026-2027', allFees, allStudents } = params;

  // Check if duplicate
  const existing = isFeeAlreadyInvoiced(student.studentId, 'Transport', feeMonth, allFees);
  if (existing) {
    return {
      success: true,
      feeRecordId: existing.id,
      alreadyExisted: true,
      message: `Transport fee for ${feeMonth} already exists (Invoice #${existing.receiptNo || existing.id}).`,
    };
  }

  const now = new Date().toISOString();
  const feeId = `fee-trn-${Date.now().toString().slice(-6)}-${student.rollNo}`;
  const amount = student.monthlyFee || route.monthlyFee || 1500;

  const newFeeRecord: FeeRecord = {
    id: feeId,
    studentId: student.studentId,
    studentName: student.studentName,
    rollNo: student.rollNo,
    classId: student.classId,
    className: student.className,
    academicYear,
    feeMonth,
    feeType: 'Transport',
    feeStructure: {
      tuitionFee: 0,
      examFee: 0,
      computerLabFee: 0,
      developmentFund: 0,
      libraryFee: 0,
      sportsActivityFee: 0,
      lateFine: 0,
      concessionDiscount: 0,
    },
    totalAmount: amount,
    paidAmount: 0,
    balanceAmount: amount,
    dueDate,
    status: 'Pending',
    paymentMethod: 'Pending',
    receiptNo: '—',
    paymentHistory: [],
    isFeeCleared: false,
    remarks: `School Bus Transport (${route.busNumber} - ${route.routeNumber}, Stop: ${student.pickupPointName})`,
    createdAt: now,
    updatedAt: now,
  };

  // Add to Firestore collections
  await addDocument<FeeRecord>('fee_records', newFeeRecord);
  await addDocument<FeeRecord>('fees', newFeeRecord);

  // Sync fee clearance on student profile
  await syncStudentFeeClearance(student.studentId, [...allFees, newFeeRecord], allStudents);

  // Update student fee status in transport_routes
  const updatedStudents = route.assignedStudents.map((s) =>
    s.studentId === student.studentId ? { ...s, feeStatus: 'Pending' as const } : s
  );
  await updateDocument<TransportRoute>('transport_routes', route.id, {
    assignedStudents: updatedStudents,
    updatedAt: now,
  });

  return {
    success: true,
    feeRecordId: feeId,
    message: `Applied Transport Fee of ₹${amount.toLocaleString()} for ${feeMonth} to ${student.studentName}'s account.`,
  };
}

/**
 * Posts an individual Hostel Fee invoice directly to student accounts / fee ledger
 */
export async function postHostelFeeToStudentLedger(params: {
  room: HostelRoom;
  resident: HostelResident;
  feeMonth: string;
  dueDate: string;
  academicYear?: string;
  allFees: FeeRecord[];
  allStudents: FirestoreStudent[];
}): Promise<{ success: boolean; feeRecordId?: string; message: string; alreadyExisted?: boolean }> {
  const { room, resident, feeMonth, dueDate, academicYear = '2026-2027', allFees, allStudents } = params;

  // Check duplicate
  const existing = isFeeAlreadyInvoiced(resident.studentId, 'Hostel', feeMonth, allFees);
  if (existing) {
    return {
      success: true,
      feeRecordId: existing.id,
      alreadyExisted: true,
      message: `Hostel boarding fee for ${feeMonth} already exists (Invoice #${existing.receiptNo || existing.id}).`,
    };
  }

  const now = new Date().toISOString();
  const feeId = `fee-hst-${Date.now().toString().slice(-6)}-${resident.rollNo}`;
  const amount = resident.monthlyFee || room.monthlyFee || 4500;

  const newFeeRecord: FeeRecord = {
    id: feeId,
    studentId: resident.studentId,
    studentName: resident.studentName,
    rollNo: resident.rollNo,
    classId: resident.classId,
    className: resident.className,
    academicYear,
    feeMonth,
    feeType: 'Hostel',
    feeStructure: {
      tuitionFee: 0,
      examFee: 0,
      computerLabFee: 0,
      developmentFund: 0,
      libraryFee: 0,
      sportsActivityFee: 0,
      lateFine: 0,
      concessionDiscount: 0,
    },
    totalAmount: amount,
    paidAmount: 0,
    balanceAmount: amount,
    dueDate,
    status: 'Pending',
    paymentMethod: 'Pending',
    receiptNo: '—',
    paymentHistory: [],
    isFeeCleared: false,
    remarks: `Hostel Room & Boarding Fee (${room.blockName} - ${room.roomNumber}, ${resident.bedNumber})`,
    createdAt: now,
    updatedAt: now,
  };

  // Add to Firestore collections
  await addDocument<FeeRecord>('fee_records', newFeeRecord);
  await addDocument<FeeRecord>('fees', newFeeRecord);

  // Sync fee clearance on student profile
  await syncStudentFeeClearance(resident.studentId, [...allFees, newFeeRecord], allStudents);

  // Update resident fee status in hostel_rooms
  const updatedResidents = room.residents.map((r) =>
    r.studentId === resident.studentId ? { ...r, hostelFeeStatus: 'Pending' as const } : r
  );
  await updateDocument<HostelRoom>('hostel_rooms', room.id, {
    residents: updatedResidents,
    updatedAt: now,
  });

  return {
    success: true,
    feeRecordId: feeId,
    message: `Applied Hostel Boarding Fee of ₹${amount.toLocaleString()} for ${feeMonth} to ${resident.studentName}'s account.`,
  };
}

/**
 * Bulk generate Transport Fees for all assigned students across routes
 */
export async function bulkGenerateTransportFees(params: {
  routes: TransportRoute[];
  targetRouteId?: string; // 'all' or specific route
  feeMonth: string;
  dueDate: string;
  allFees: FeeRecord[];
  allStudents: FirestoreStudent[];
}): Promise<{ totalGenerated: number; totalSkipped: number; totalAmount: number }> {
  const { routes, targetRouteId, feeMonth, dueDate, allFees, allStudents } = params;

  let totalGenerated = 0;
  let totalSkipped = 0;
  let totalAmount = 0;
  let accumulatedFees = [...allFees];

  const targetRoutes = targetRouteId && targetRouteId !== 'all'
    ? routes.filter((r) => r.id === targetRouteId)
    : routes;

  for (const route of targetRoutes) {
    let routeUpdated = false;
    const updatedAssignments = [...route.assignedStudents];

    for (let i = 0; i < updatedAssignments.length; i++) {
      const student = updatedAssignments[i];
      const existing = isFeeAlreadyInvoiced(student.studentId, 'Transport', feeMonth, accumulatedFees);

      if (existing) {
        totalSkipped++;
        continue;
      }

      const res = await postTransportFeeToStudentLedger({
        route,
        student,
        feeMonth,
        dueDate,
        allFees: accumulatedFees,
        allStudents,
      });

      if (res.success && !res.alreadyExisted) {
        totalGenerated++;
        totalAmount += student.monthlyFee;
        updatedAssignments[i] = { ...student, feeStatus: 'Pending' };
        routeUpdated = true;
      }
    }

    if (routeUpdated) {
      await updateDocument<TransportRoute>('transport_routes', route.id, {
        assignedStudents: updatedAssignments,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return { totalGenerated, totalSkipped, totalAmount };
}

/**
 * Bulk generate Hostel Fees for all resident students across rooms
 */
export async function bulkGenerateHostelFees(params: {
  rooms: HostelRoom[];
  targetRoomId?: string; // 'all' or specific room
  feeMonth: string;
  dueDate: string;
  allFees: FeeRecord[];
  allStudents: FirestoreStudent[];
}): Promise<{ totalGenerated: number; totalSkipped: number; totalAmount: number }> {
  const { rooms, targetRoomId, feeMonth, dueDate, allFees, allStudents } = params;

  let totalGenerated = 0;
  let totalSkipped = 0;
  let totalAmount = 0;
  let accumulatedFees = [...allFees];

  const targetRooms = targetRoomId && targetRoomId !== 'all'
    ? rooms.filter((r) => r.id === targetRoomId)
    : rooms;

  for (const room of targetRooms) {
    let roomUpdated = false;
    const updatedResidents = [...room.residents];

    for (let i = 0; i < updatedResidents.length; i++) {
      const resident = updatedResidents[i];
      if (resident.status !== 'Active') continue; // Skip checked out students

      const existing = isFeeAlreadyInvoiced(resident.studentId, 'Hostel', feeMonth, accumulatedFees);
      if (existing) {
        totalSkipped++;
        continue;
      }

      const res = await postHostelFeeToStudentLedger({
        room,
        resident,
        feeMonth,
        dueDate,
        allFees: accumulatedFees,
        allStudents,
      });

      if (res.success && !res.alreadyExisted) {
        totalGenerated++;
        totalAmount += resident.monthlyFee;
        updatedResidents[i] = { ...resident, hostelFeeStatus: 'Pending' };
        roomUpdated = true;
      }
    }

    if (roomUpdated) {
      await updateDocument<HostelRoom>('hostel_rooms', room.id, {
        residents: updatedResidents,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return { totalGenerated, totalSkipped, totalAmount };
}

/**
 * Quick settlement for Transport or Hostel fee payment, updating both Fee Ledger and Module status
 */
export async function settleTransportOrHostelFee(params: {
  feeRecord: FeeRecord;
  paymentAmount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer';
  referenceNumber?: string;
  cashierName: string;
  allFees: FeeRecord[];
  allStudents: FirestoreStudent[];
  routes: TransportRoute[];
  rooms: HostelRoom[];
}): Promise<{ success: boolean; receiptNo: string }> {
  const { feeRecord, paymentAmount, paymentMethod, referenceNumber, cashierName, allFees, allStudents, routes, rooms } = params;

  // Record through verified fee ledger
  const result = await recordFeeTransaction({
    feeRecordId: feeRecord.id,
    studentId: feeRecord.studentId,
    studentName: feeRecord.studentName,
    paymentAmount,
    paymentMethod,
    paymentChannel: paymentMethod === 'Cash' ? 'Cash' : paymentMethod === 'UPI' ? 'UPI' : 'Bank',
    referenceNumber,
    cashierName,
    receivedBy: cashierName,
    currentFeeRecord: feeRecord,
    allFeeRecords: allFees,
    allStudents,
  });

  const isCleared = result.updatedFee.isFeeCleared;

  // Synchronize status in Transport Routes if feeType is Transport
  if (feeRecord.feeType === 'Transport' && isCleared) {
    const matchedRoute = routes.find((r) =>
      r.assignedStudents.some((s) => s.studentId === feeRecord.studentId)
    );
    if (matchedRoute) {
      const updatedStudents = matchedRoute.assignedStudents.map((s) =>
        s.studentId === feeRecord.studentId ? { ...s, feeStatus: 'Paid' as const } : s
      );
      await updateDocument<TransportRoute>('transport_routes', matchedRoute.id, {
        assignedStudents: updatedStudents,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Synchronize status in Hostel Rooms if feeType is Hostel
  if (feeRecord.feeType === 'Hostel' && isCleared) {
    const matchedRoom = rooms.find((rm) =>
      rm.residents.some((res) => res.studentId === feeRecord.studentId)
    );
    if (matchedRoom) {
      const updatedResidents = matchedRoom.residents.map((r) =>
        r.studentId === feeRecord.studentId
          ? {
              ...r,
              hostelFeeStatus: 'Paid' as const,
              lastPaidMonth: feeRecord.feeMonth,
            }
          : r
      );
      await updateDocument<HostelRoom>('hostel_rooms', matchedRoom.id, {
        residents: updatedResidents,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return {
    success: true,
    receiptNo: result.transaction.receiptNo,
  };
}
