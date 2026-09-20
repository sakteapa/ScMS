export type AttendanceStatus = 'Present' | 'Absent' | 'Late';
export type FeeStatus = 'Paid' | 'Pending' | 'Overdue' | 'Partial' | 'Waived';
export type StudentFeeClearanceStatus = 'Cleared' | 'Pending' | 'Overdue' | 'Partial';
export type FeeType = 'Tuition' | 'Admission' | 'Examination' | 'Hostel' | 'Laboratory' | 'Transport' | 'Development' | 'Comprehensive';

export interface FeeComponentBreakdown {
  tuitionFee: number;
  examFee: number;
  computerLabFee: number;
  developmentFund: number;
  libraryFee: number;
  sportsActivityFee: number;
  lateFine: number;
  concessionDiscount: number;
}

export interface FeeTransaction {
  transactionId: string;
  receiptNo: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD or ISO
  paymentTime?: string;
  paymentMethod: string;
  paymentChannel?: 'Cash' | 'UPI' | 'Bank';
  referenceNumber?: string; // UTR or Bank Ref
  receivedBy: string;
  cashierName?: string;
  cashTendered?: number;
  changeGiven?: number;
  notes?: string;
}

export type NavTab =
  | 'dashboard'
  | 'students'
  | 'attendance'
  | 'fees'
  | 'qr-attendance'
  | 'gradebook'
  | 'timetable'
  | 'library'
  | 'transport-hostel'
  | 'transport'
  | 'hostel'
  | 'notifications'
  | 'staff'
  | 'admissions'
  | 'notices'
  | 'portal'
  | 'exports';

export type BookIssueStatus = 'Issued' | 'Returned' | 'Overdue' | 'Lost';

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
  publishedYear?: number;
  publisher?: string;
  language?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookIssue {
  id: string;
  bookId: string;
  bookTitle: string;
  bookIsbn?: string;
  studentId: string;
  studentName: string;
  rollNo: number;
  classId: string;
  className: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  returnDate?: string | null; // YYYY-MM-DD
  status: BookIssueStatus;
  fineAmount: number;
  finePaid?: boolean;
  remarks?: string;
  issuedBy: string;
  returnedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface TimetableSlot {
  id: string;
  dayOfWeek: DayOfWeek;
  periodNumber: number; // 0 for Assembly/Devotion, 1..7 for periods, -1 for Lunch/Tiffin
  periodLabel: string;
  startTime: string; // "09:00"
  endTime: string; // "09:45"
  subject: string;
  teacherName: string;
  roomNumber: string;
  isBreak?: boolean;
  notes?: string;
}

export interface TimetableRecord {
  id: string;
  classId: string;
  className: string;
  academicYear: string;
  status: 'Draft' | 'Published' | 'Archived';
  isPublished: boolean;
  effectiveFrom?: string;
  slots: TimetableSlot[];
  updatedBy: string;
  updatedAt: string;
}

export type GradeStage =
  | 'Pre-Primary'
  | 'Primary'
  | 'Middle'
  | 'High School'
  | 'Higher Secondary';

export type StreamClassification = 'Arts' | 'Science' | 'Commerce' | 'General';

export type AssessmentCategory = 'Composite' | 'ClassTest' | 'Examination';

export interface SubjectScore {
  subjectName: string;
  maxMarks: number; // Combined / composite max marks e.g. 100
  marksObtained: number; // Combined / composite marks obtained (classTestObtained + examObtained)
  grade: string;
  // Distinct separation for Class Tests (continuous assessment) and Examinations (theory)
  classTestMax?: number; // e.g. 20 or 25
  classTestObtained?: number; // e.g. 18
  classTestWeightage?: number; // e.g. 20%
  examMax?: number; // e.g. 80 or 75
  examObtained?: number; // e.g. 68
  examWeightage?: number; // e.g. 80%
  remarks?: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: number;
  classId: string;
  className: string;
  stage?: GradeStage;
  stream?: StreamClassification;
  examTerm: string;
  assessmentCategory?: AssessmentCategory; // 'Composite' | 'ClassTest' | 'Examination'
  academicYear: string;
  subjects: SubjectScore[];
  // Continuous assessment vs Exam totals
  totalClassTestObtained?: number;
  totalClassTestMax?: number;
  totalExamObtained?: number;
  totalExamMax?: number;
  // Composite totals
  totalMarksObtained: number;
  totalMaxMarks: number;
  percentage: number;
  overallGrade: string;
  status: 'Passed' | 'Failed' | 'Needs Improvement';
  rank?: number;
  teacherRemarks: string;
  updatedAt: string;
}

// Dedicated Firestore Student Schema
export interface StudentQrPayload {
  system: 'zoxs-sms';
  version: number;
  studentId: string;
  name: string;
  rollNo: number;
  classId: string;
  className: string;
  stage?: GradeStage;
  stream?: StreamClassification;
  academicYear?: string;
  parentPhone?: string;
  bloodGroup?: string;
  timestamp?: number;
}

export interface FirestoreStudent {
  id: string;
  name: string;
  rollNo: number;
  classId: string;
  className: string;
  stage?: GradeStage;
  stream?: StreamClassification;
  parentPhone: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  marks: number;
  status: 'Active' | 'Inactive';
  feeStatus?: StudentFeeClearanceStatus;
  totalFeesDue?: number;
  totalFeesPaid?: number;
  lastFeePaymentDate?: string;
  lastReceiptNo?: string;
  qrCodeData?: string;
  qrCodeUrl?: string;
  bloodGroup?: string;
  dob?: string;
  emergencyContact?: string;
  createdAt: string;
  remarks?: string;
  userId?: string;
}

// Legacy Student Model for helper utilities
export interface Student {
  id: string;
  rollNumber: number;
  name: string;
  class: string;
  section: string;
  gender: 'Male' | 'Female' | 'Other';
  attendance: AttendanceStatus;
  marks: number;
  guardianPhone: string;
  remarks?: string;
  lastUpdated?: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  classGrade: string; // 'Nursery', 'LKG', 'UKG', 'Class 1', ..., 'Class 12'
  stage: GradeStage; // 'Pre-Primary' | 'Primary' | 'Middle' | 'High School' | 'Higher Secondary'
  stream?: StreamClassification; // 'Arts' | 'Science' | 'Commerce' | 'General'
  section: string;
  teacherName: string;
  teacherId?: string;
  roomNumber: string;
  studentCount?: number;
  academicYear?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  rollNo: number;
  classId: string;
  className: string;
  status: AttendanceStatus;
  markedAt: string;
  remarks?: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: number;
  classId: string;
  className: string;
  academicYear?: string;
  feeMonth: string;
  feeType?: FeeType;
  feeStructure?: FeeComponentBreakdown;
  totalAmount: number;
  paidAmount: number;
  balanceAmount?: number;
  dueDate: string;
  status: FeeStatus;
  paymentMethod: string;
  receiptNo: string;
  paymentHistory?: FeeTransaction[];
  isFeeCleared?: boolean;
  clearedAt?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt: string;
}

export type AIActionType =
  | 'ADD_STUDENT'
  | 'UPDATE_STUDENT'
  | 'DELETE_STUDENT'
  | 'MARK_ATTENDANCE'
  | 'FILTER_STUDENTS'
  | 'ANSWER_QUERY'
  | 'RECORD_FEE'
  | 'CHECK_TIMETABLE'
  | 'UNKNOWN';

export interface AICommandResult {
  action: AIActionType;
  message: string;
  success: boolean;
  data?: {
    student?: Partial<Student>;
    rollNumber?: number;
    targetName?: string;
    attendance?: AttendanceStatus;
    marks?: number;
    feeStatus?: FeeStatus;
    paidAmount?: number;
    filter?: {
      searchQuery?: string;
      class?: string;
      attendance?: AttendanceStatus | 'All';
      navTab?: NavTab;
    };
    answer?: string;
  };
}

export interface CommandLogItem {
  id: string;
  timestamp: string;
  prompt: string;
  action: AIActionType;
  message: string;
  success: boolean;
}

export type NotificationChannel = 'WhatsApp' | 'SMS';
export type NotificationCategory =
  | 'Attendance Alert'
  | 'Fee Due Reminder'
  | 'School Announcement'
  | 'Exam Notice'
  | 'Custom';
export type NotificationStatus = 'Sent' | 'Delivered' | 'Pending' | 'Failed';

export interface NotificationLog {
  id: string;
  studentId?: string;
  studentName?: string;
  rollNo?: number;
  classId?: string;
  className?: string;
  parentName?: string;
  parentPhone: string;
  channel: NotificationChannel;
  category: NotificationCategory;
  templateId?: string;
  subject?: string;
  message: string;
  status: NotificationStatus;
  timestamp: string; // ISO string
  sentAt?: string;
  deliveredAt?: string;
  failureReason?: string;
  gatewayRef?: string;
  dispatchedBy: string; // e.g. 'Principal Office', 'Class Teacher', 'Accounts Desk'
}

export interface NotificationTemplate {
  id: string;
  name: string;
  category: NotificationCategory;
  language: 'Mizo' | 'English' | 'Bilingual';
  description: string;
  subject?: string;
  content: string; // Dynamic placeholders: {{student_name}}, {{roll_no}}, {{class_name}}, {{date}}, {{amount_due}}, {{due_date}}, {{school_name}}, etc.
  defaultChannel: NotificationChannel;
}

/* =========================================================================
   STAFF & PAYROLL MANAGEMENT MODULE SCHEMAS
   ========================================================================= */

export type StaffDepartment =
  | 'Teaching'
  | 'Administration'
  | 'Science & Labs'
  | 'Mathematics'
  | 'Humanities'
  | 'Languages'
  | 'Physical Education'
  | 'Library'
  | 'Support Staff';

export type StaffEmploymentType = 'Full-time' | 'Contract' | 'Part-time' | 'Guest Lecturer';
export type StaffStatus = 'Active' | 'On Leave' | 'Resigned' | 'Retired';

export interface StaffBankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  upiId?: string;
  panNumber?: string;
}

export interface StaffAllowances {
  hra: number; // House Rent Allowance
  da: number; // Dearness Allowance
  medical: number; // Medical Allowance
  special: number; // Special Allowance
  conveyance?: number;
}

export interface StaffMember {
  id: string;
  employeeId: string; // e.g. "ZOXS-STF-01"
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  dob?: string;
  qualification: string;
  department: StaffDepartment;
  designation: string;
  joiningDate: string; // YYYY-MM-DD
  employmentType: StaffEmploymentType;
  baseSalary: number;
  allowances: StaffAllowances;
  status: StaffStatus;
  bankDetails: StaffBankDetails;
  epfNumber?: string;
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  assignedClassId?: string;
  assignedClassName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PayrollPaymentStatus = 'Pending' | 'Processing' | 'Paid' | 'Held';
export type PayrollPaymentMethod = 'Bank Transfer' | 'Cash' | 'UPI' | 'Cheque';

export interface PayrollAllowances {
  hra: number;
  da: number;
  medical: number;
  bonus: number;
  conveyance: number;
  other: number;
}

export interface PayrollDeductions {
  epf: number; // Employees Provident Fund (12% of basic)
  profTax: number; // Professional Tax (Mizoram standard)
  leaveWithoutPay: number; // LWP Deduction
  tds: number; // Tax Deducted at Source
  advanceRecovery: number; // Staff salary advance repayment
  other: number;
}

export interface PayrollRecord {
  id: string;
  payslipNumber: string; // e.g. "SLIP-202609-001"
  month: string; // "YYYY-MM", e.g. "2026-09"
  staffId: string;
  staffName: string;
  employeeId: string;
  designation: string;
  department: string;
  baseSalary: number;
  allowances: PayrollAllowances;
  totalEarnings: number;
  deductions: PayrollDeductions;
  totalDeductions: number;
  netSalary: number;
  workingDays: number;
  presentDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  paymentStatus: PayrollPaymentStatus;
  paymentDate?: string | null;
  paymentMethod: PayrollPaymentMethod;
  transactionRef?: string;
  disbursedBy?: string;
  notes?: string;
  generatedAt: string;
  updatedAt: string;
}

export type StaffLeaveType =
  | 'Casual Leave'
  | 'Earned Leave'
  | 'Medical Leave'
  | 'Maternity Leave'
  | 'Duty Leave'
  | 'Leave Without Pay';

export type StaffLeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface StaffLeave {
  id: string;
  staffId: string;
  staffName: string;
  employeeId: string;
  designation: string;
  department: string;
  leaveType: StaffLeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  reason: string;
  status: StaffLeaveStatus;
  appliedDate: string; // YYYY-MM-DD
  reviewedBy?: string;
  reviewedDate?: string;
  remarks?: string;
  isLwp?: boolean;
  createdAt: string;
  updatedAt: string;
}

/* =========================================================================
   ONLINE ADMISSION TYPES & SCHEMAS
   ========================================================================= */

export type AdmissionStatus =
  | 'Pending'
  | 'Under Review'
  | 'Interview Scheduled'
  | 'Approved'
  | 'Rejected';

export interface AdmissionDocuments {
  birthCertificate: boolean;
  transferCertificate: boolean;
  previousMarksheet: boolean;
  characterCertificate?: boolean;
  passportPhoto: boolean;
  aadhaarCard?: boolean;
}

export interface AdmissionApplication {
  id: string;
  applicationNo: string; // e.g. "ADM-2026-001"
  applicantName: string;
  dob: string; // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  targetClass: string; // e.g. "Class 8", "Class 9", "Class 10"
  academicYear: string; // e.g. "2026-2027"
  parentName: string;
  parentRelation: 'Father' | 'Mother' | 'Guardian';
  parentPhone: string;
  parentEmail?: string;
  parentOccupation?: string;
  address: string; // Veng/Locality e.g. "Mission Veng, Aizawl"
  city: string; // e.g. "Aizawl"
  district: string; // e.g. "Aizawl", "Lunglei", "Champhai"
  state: string; // "Mizoram"
  pincode: string; // e.g. "796001"
  previousSchool: string;
  previousBoard: 'MBSE' | 'CBSE' | 'ICSE' | 'Other';
  previousMarksPercentage: number;
  previousMarksGrade?: string;
  mediumOfInstruction: 'English' | 'Mizo';
  aadhaarNumber?: string;
  documents: AdmissionDocuments;
  status: AdmissionStatus;
  interviewDate?: string; // YYYY-MM-DD
  interviewTime?: string; // e.g. "10:30 AM"
  interviewVenue?: string; // e.g. "Room 102 / Principal's Chamber"
  reviewerRemarks?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  assignedClassId?: string;
  assignedClassName?: string;
  assignedRollNo?: number;
  enrolledStudentId?: string;
  appliedDate: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

/* =========================================================================
   NOTICE BOARD TYPES & SCHEMAS
   ========================================================================= */

export type NoticeCategory =
  | 'Circular'
  | 'Holiday'
  | 'Exam'
  | 'General'
  | 'Event'
  | 'Urgent';

export type NoticeAudience =
  | 'All'
  | 'Parents & Students'
  | 'Teachers & Staff'
  | 'Class 10 Only';

export type NoticePriority = 'Normal' | 'High' | 'Urgent';

export interface NoticeItem {
  id: string;
  noticeNo: string; // e.g. "CIR/MBSE/2026/04"
  title: string;
  content: string;
  category: NoticeCategory;
  targetAudience: NoticeAudience;
  priority: NoticePriority;
  publishDate: string; // YYYY-MM-DD
  expiryDate?: string; // YYYY-MM-DD
  isActive: boolean;
  isPinned: boolean;
  authorName: string;
  authorDesignation: string;
  attachmentName?: string;
  attachmentUrl?: string;
  viewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

/* =========================================================================
   USER ACCOUNTS & AUTHENTICATION TYPES
   ========================================================================= */

export type UserRole = 'Principal' | 'Teacher' | 'Student' | 'Parent';

export interface UserAccount {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  assignedClassId?: string;
  assignedClassName?: string;
  studentId?: string; // Links to Student ID for Student or Parent role
  studentName?: string;
  createdAt: string;
  updatedAt?: string;
}

/* =========================================================================
   TRANSPORT & HOSTEL MANAGEMENT TYPES
   ========================================================================= */

export interface TransportPickupPoint {
  id: string;
  pointName: string; // e.g. "Khatla West Junction", "Mission Veng Field Point"
  locality: string; // e.g. "Khatla", "Mission Veng", "Chanmari"
  pickupTime: string; // "07:30 AM"
  dropTime: string; // "03:45 PM"
  order: number;
  landmark?: string;
  monthlyFee: number;
}

export interface TransportStudentAssignment {
  studentId: string;
  studentName: string;
  rollNo: number;
  classId: string;
  className: string;
  pickupPointId: string;
  pickupPointName: string;
  parentPhone: string;
  emergencyContact?: string;
  feeStatus: 'Paid' | 'Pending' | 'Overdue';
  monthlyFee: number;
  assignedDate: string;
}

export interface TransportRoute {
  id: string;
  routeNumber: string; // e.g. "Route 01 - Khatla / Mission Veng Express"
  busNumber: string; // e.g. "MZ-01-E-4281"
  vehicleModel: string; // e.g. "Tata Starbus 34-Seater"
  capacity: number;
  driverName: string;
  driverPhone: string;
  driverLicense: string;
  conductorName?: string;
  conductorPhone?: string;
  status: 'Active' | 'Under Maintenance' | 'Inactive';
  monthlyFee: number;
  emergencyContact?: string;
  notes?: string;
  pickupPoints: TransportPickupPoint[];
  assignedStudents: TransportStudentAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface HostelResident {
  studentId: string;
  studentName: string;
  rollNo: number;
  classId: string;
  className: string;
  bedNumber: string; // e.g. "Bed 101-A", "Bed G-101-A"
  checkInDate: string; // "2026-01-10"
  checkOutDate?: string | null;
  status: 'Active' | 'Checked-Out' | 'On Leave';
  gender: 'Male' | 'Female';
  parentName?: string;
  parentPhone: string;
  bloodGroup?: string;
  hostelFeeStatus: 'Paid' | 'Pending' | 'Overdue';
  monthlyFee: number;
  lastPaidMonth?: string;
  remarks?: string;
}

export interface HostelRoom {
  id: string;
  roomNumber: string; // e.g. "Room 101", "Room G-101"
  blockName: string; // e.g. "Boys Hostel - Hmuifang Block", "Girls Hostel - Reiek Block"
  gender: 'Boys' | 'Girls';
  floor: string; // "Ground Floor", "1st Floor", "2nd Floor"
  roomType: 'Single' | 'Double' | 'Triple' | 'Dormitory (4-Bed)' | 'Dormitory (6-Bed)';
  capacity: number;
  occupiedBeds: number;
  status: 'Available' | 'Full' | 'Maintenance';
  monthlyFee: number;
  wardenName: string;
  wardenPhone: string;
  amenities: string[];
  residents: HostelResident[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}




