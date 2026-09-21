// Mock and initial seed data for Mizoram School System (zoxs-sms)
// Reflects authentic educational structure in Mizoram: Nursery to Class 12 (Arts, Science, Commerce)

export const INITIAL_CLASSES = [
  { id: 'cls-nursery', name: 'Nursery', level: 'nursery', stream: null, section: 'A', roomNumber: 'N-101', academicYear: '2026-2027', teacherName: 'Lalrinchhani', classTeacherId: 'stf-008', classLeaderId: 'stu-106', classLeaderName: 'Remruatpuii Pachuau', asstClassLeaderId: null, asstClassLeaderName: null, leadersAppointedAt: '2026-09-10', leadersAppointedBy: 'Lalrinchhani (Class Master)' },
  { id: 'cls-lkg', name: 'LKG', level: 'lkg', stream: null, section: 'A', roomNumber: 'K-102', academicYear: '2026-2027', teacherName: 'Zonunmawii Ralte', classTeacherId: 'stf-009', classLeaderId: null, classLeaderName: null, asstClassLeaderId: null, asstClassLeaderName: null },
  { id: 'cls-ukg', name: 'UKG', level: 'ukg', stream: null, section: 'A', roomNumber: 'K-103', academicYear: '2026-2027', teacherName: 'C. Lalramhluna', classTeacherId: 'stf-010', classLeaderId: null, classLeaderName: null, asstClassLeaderId: null, asstClassLeaderName: null },
  { id: 'cls-1', name: 'Class 1', level: '1', stream: null, section: 'A', roomNumber: 'R-201', academicYear: '2026-2027', teacherName: 'Lalthanzuala', classTeacherId: 'stf-011', classLeaderId: null, classLeaderName: null, asstClassLeaderId: null, asstClassLeaderName: null },
  { id: 'cls-2', name: 'Class 2', level: '2', stream: null, section: 'A', roomNumber: 'R-202', academicYear: '2026-2027', teacherName: 'Vanlalruati', classTeacherId: 'stf-012', classLeaderId: null, classLeaderName: null, asstClassLeaderId: null, asstClassLeaderName: null },
  { id: 'cls-3', name: 'Class 3', level: '3', stream: null, section: 'A', roomNumber: 'R-203', academicYear: '2026-2027', teacherName: 'K. Lalbiakdika', classTeacherId: 'stf-013', classLeaderId: null, classLeaderName: null, asstClassLeaderId: null, asstClassLeaderName: null },
  { id: 'cls-4', name: 'Class 4', level: '4', stream: null, section: 'A', roomNumber: 'R-204', academicYear: '2026-2027', teacherName: 'Lalmuanpuii', classTeacherId: 'stf-014', classLeaderId: null, classLeaderName: null, asstClassLeaderId: null, asstClassLeaderName: null },
  { id: 'cls-5', name: 'Class 5', level: '5', stream: null, section: 'A', roomNumber: 'R-205', academicYear: '2026-2027', teacherName: 'Lalhmangaiha', classTeacherId: 'stf-015', classLeaderId: null, classLeaderName: null, asstClassLeaderId: null, asstClassLeaderName: null },
  { id: 'cls-6', name: 'Class 6', level: '6', stream: null, section: 'A', roomNumber: 'M-301', academicYear: '2026-2027', teacherName: 'Malsawmtluanga', classTeacherId: 'stf-016', classLeaderId: null, classLeaderName: null, asstClassLeaderId: null, asstClassLeaderName: null },
  { id: 'cls-7', name: 'Class 7', level: '7', stream: null, section: 'A', roomNumber: 'M-302', academicYear: '2026-2027', teacherName: 'Zothanpuii', classTeacherId: 'stf-017', classLeaderId: null, classLeaderName: null, asstClassLeaderId: null, asstClassLeaderName: null },
  { id: 'cls-8', name: 'Class 8', level: '8', stream: null, section: 'A', roomNumber: 'M-303', academicYear: '2026-2027', teacherName: 'David Lalnunmawia', classTeacherId: 'stf-018', classLeaderId: null, classLeaderName: null, asstClassLeaderId: null, asstClassLeaderName: null },
  { id: 'cls-9', name: 'Class 9', level: '9', stream: null, section: 'A', roomNumber: 'H-401', academicYear: '2026-2027', teacherName: 'H. Laldinpuia', classTeacherId: 'stf-019', classLeaderId: null, classLeaderName: null, asstClassLeaderId: null, asstClassLeaderName: null },
  { id: 'cls-10', name: 'Class 10 (Board)', level: '10', stream: null, section: 'A', roomNumber: 'H-402', academicYear: '2026-2027', teacherName: 'Dr. C. Zoramthanga', classTeacherId: 'stf-020', classLeaderId: 'stu-105', classLeaderName: 'Lalpekhlua Hmar', asstClassLeaderId: null, asstClassLeaderName: null, leadersAppointedAt: '2026-09-12', leadersAppointedBy: 'Dr. C. Zoramthanga (Class Master)' },
  { id: 'cls-11-sci', name: 'Class 11 - Science', level: '11', stream: 'science', section: 'A', roomNumber: 'S-501', academicYear: '2026-2027', teacherName: 'Prof. J. Lalramenga', classTeacherId: 'stf-024', classLeaderId: null, classLeaderName: null, asstClassLeaderId: null, asstClassLeaderName: null },
  { id: 'cls-11-arts', name: 'Class 11 - Arts', level: '11', stream: 'arts', section: 'A', roomNumber: 'A-502', academicYear: '2026-2027', teacherName: 'R. Lalhmingmawii', classTeacherId: 'stf-021', classLeaderId: null, classLeaderName: null, asstClassLeaderId: null, asstClassLeaderName: null },
  { id: 'cls-11-comm', name: 'Class 11 - Commerce', level: '11', stream: 'commerce', section: 'A', roomNumber: 'C-503', academicYear: '2026-2027', teacherName: 'V. Laltanpuia', classTeacherId: 'stf-022', classLeaderId: null, classLeaderName: null, asstClassLeaderId: null, asstClassLeaderName: null },
  { id: 'cls-12-sci', name: 'Class 12 - Science', level: '12', stream: 'science', section: 'A', roomNumber: 'S-601', academicYear: '2026-2027', teacherName: 'Lalthlamuana Sailo', classTeacherId: 'stf-002', classLeaderId: 'stu-101', classLeaderName: 'Lalrinsanga Sailo', asstClassLeaderId: 'stu-102', asstClassLeaderName: 'Vanlalhruaii Ralte', leadersAppointedAt: '2026-09-15', leadersAppointedBy: 'Lalthlamuana Sailo (Class Master)' },
  { id: 'cls-12-arts', name: 'Class 12 - Arts', level: '12', stream: 'arts', section: 'A', roomNumber: 'A-602', academicYear: '2026-2027', teacherName: 'Ruth Lalrinsangi', classTeacherId: 'stf-003', classLeaderId: 'stu-103', classLeaderName: 'Lalmuanpuia Chhangte', asstClassLeaderId: null, asstClassLeaderName: null, leadersAppointedAt: '2026-09-14', leadersAppointedBy: 'Ruth Lalrinsangi (Class Master)' },
  { id: 'cls-12-comm', name: 'Class 12 - Commerce', level: '12', stream: 'commerce', section: 'A', roomNumber: 'C-603', academicYear: '2026-2027', teacherName: 'Timothy Lalmuanawma', classTeacherId: 'stf-023', classLeaderId: 'stu-104', classLeaderName: 'Zodinpuii Khiangte', asstClassLeaderId: null, asstClassLeaderName: null, leadersAppointedAt: '2026-09-16', leadersAppointedBy: 'Timothy Lalmuanawma (Class Master)' }
];

export const STREAM_SUBJECTS = {
  science: ['English', 'Mizo', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'],
  arts: ['English', 'Mizo', 'Political Science', 'History', 'Education', 'Economics', 'Sociology'],
  commerce: ['English', 'Mizo', 'Accountancy', 'Business Studies', 'Economics', 'Mathematics'],
  general_secondary: ['English', 'Mizo', 'Mathematics', 'Science', 'Social Science', 'Hindi / Alternative'],
  primary: ['English', 'Mizo', 'Mathematics', 'Environmental Studies', 'General Knowledge', 'Art & Craft']
};

export const INITIAL_STUDENTS = [
  {
    id: 'stu-101',
    admissionNo: 'MZ-2026-0101',
    rollNo: '01',
    firstName: 'Lalrinsanga',
    lastName: 'Sailo',
    gender: 'Male',
    dob: '2008-04-12',
    bloodGroup: 'O+',
    classId: 'cls-12-sci',
    stream: 'science',
    guardianName: 'Lalthanzuala Sailo',
    guardianPhone: '+91 98623 45671',
    guardianEmail: 'sailo.parent@oha.edu.in',
    address: 'Lunglawn, Lunglei, Mizoram - 796701',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    feeStatus: 'cleared',
    totalFees: 36000,
    paidFees: 36000,
    transportRouteId: 'route-1',
    hostelRoomId: null,
    attendanceRate: 94.5,
    isClassLeader: true,
    leadershipRole: 'class_leader'
  },
  {
    id: 'stu-102',
    admissionNo: 'MZ-2026-0102',
    rollNo: '02',
    firstName: 'Vanlalhruaii',
    lastName: 'Ralte',
    gender: 'Female',
    dob: '2008-08-25',
    bloodGroup: 'A+',
    classId: 'cls-12-sci',
    stream: 'science',
    guardianName: 'Dr. C. Lalremruata',
    guardianPhone: '+91 94361 52834',
    guardianEmail: 'remruata.ralte@gmail.com',
    address: 'Rahsi Veng, Lunglei, Mizoram - 796701',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    feeStatus: 'partial',
    totalFees: 36000,
    paidFees: 24000,
    transportRouteId: 'route-2',
    hostelRoomId: null,
    attendanceRate: 91.2,
    isAsstClassLeader: true,
    leadershipRole: 'asst_class_leader'
  },
  {
    id: 'stu-107',
    admissionNo: 'MZ-2026-0107',
    rollNo: '03',
    firstName: 'F. Lalhmingliana',
    lastName: 'Pachuau',
    gender: 'Male',
    dob: '2008-03-18',
    bloodGroup: 'B+',
    classId: 'cls-12-sci',
    stream: 'science',
    guardianName: 'F. Rohmingliana',
    guardianPhone: '+91 98622 10294',
    guardianEmail: 'f.pachuau@gmail.com',
    address: 'Venglai, Lunglei, Mizoram - 796701',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    feeStatus: 'cleared',
    totalFees: 36000,
    paidFees: 36000,
    transportRouteId: 'route-1',
    hostelRoomId: null,
    attendanceRate: 96.2
  },
  {
    id: 'stu-108',
    admissionNo: 'MZ-2026-0108',
    rollNo: '04',
    firstName: 'Malsawmdawngkimi',
    lastName: 'Royte',
    gender: 'Female',
    dob: '2008-07-09',
    bloodGroup: 'O+',
    classId: 'cls-12-sci',
    stream: 'science',
    guardianName: 'R. Lalhruaitluanga',
    guardianPhone: '+91 97740 44123',
    guardianEmail: 'royte.parent@gmail.com',
    address: 'Bazar Veng, Lunglei, Mizoram - 796701',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    feeStatus: 'cleared',
    totalFees: 36000,
    paidFees: 36000,
    transportRouteId: null,
    hostelRoomId: 'room-102',
    attendanceRate: 93.0
  },
  {
    id: 'stu-103',
    admissionNo: 'MZ-2026-0103',
    rollNo: '01',
    firstName: 'Lalmuanpuia',
    lastName: 'Chhangte',
    gender: 'Male',
    dob: '2008-11-14',
    bloodGroup: 'B+',
    classId: 'cls-12-arts',
    stream: 'arts',
    guardianName: 'Zonuntluanga Chhangte',
    guardianPhone: '+91 98625 11982',
    guardianEmail: 'chhangte.family@yahoo.com',
    address: 'College Veng, Lunglei, Mizoram - 796701',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    feeStatus: 'cleared',
    totalFees: 32000,
    paidFees: 32000,
    transportRouteId: null,
    hostelRoomId: 'room-101',
    attendanceRate: 88.0,
    isClassLeader: true,
    leadershipRole: 'class_leader'
  },
  {
    id: 'stu-109',
    admissionNo: 'MZ-2026-0109',
    rollNo: '02',
    firstName: 'Lalhriatpuii',
    lastName: 'Hnamte',
    gender: 'Female',
    dob: '2008-05-22',
    bloodGroup: 'AB+',
    classId: 'cls-12-arts',
    stream: 'arts',
    guardianName: 'H. Lalchungnunga',
    guardianPhone: '+91 94361 77210',
    guardianEmail: 'hnamte.family@gmail.com',
    address: 'Chanmari, Lunglei, Mizoram - 796701',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    feeStatus: 'cleared',
    totalFees: 32000,
    paidFees: 32000,
    transportRouteId: 'route-2',
    hostelRoomId: null,
    attendanceRate: 95.0
  },
  {
    id: 'stu-104',
    admissionNo: 'MZ-2026-0104',
    rollNo: '01',
    firstName: 'Zodinpuii',
    lastName: 'Khiangte',
    gender: 'Female',
    dob: '2008-01-30',
    bloodGroup: 'AB+',
    classId: 'cls-12-comm',
    stream: 'commerce',
    guardianName: 'Lalhmingthanga Khiangte',
    guardianPhone: '+91 97743 90211',
    guardianEmail: 'khiangte.trade@gmail.com',
    address: 'Farm Veng, Lunglei, Mizoram - 796701',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    feeStatus: 'overdue',
    totalFees: 32000,
    paidFees: 12000,
    transportRouteId: 'route-1',
    hostelRoomId: null,
    attendanceRate: 85.5,
    isClassLeader: true,
    leadershipRole: 'class_leader'
  },
  {
    id: 'stu-110',
    admissionNo: 'MZ-2026-0110',
    rollNo: '02',
    firstName: 'Emanuel',
    lastName: 'Lalrinkima',
    gender: 'Male',
    dob: '2008-10-04',
    bloodGroup: 'A+',
    classId: 'cls-12-comm',
    stream: 'commerce',
    guardianName: 'K. Lalrinmawia',
    guardianPhone: '+91 98623 99014',
    guardianEmail: 'emanuel.parent@gmail.com',
    address: 'Electric Veng, Lunglei, Mizoram - 796701',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    feeStatus: 'cleared',
    totalFees: 32000,
    paidFees: 32000,
    transportRouteId: 'route-1',
    hostelRoomId: null,
    attendanceRate: 92.5
  },
  {
    id: 'stu-105',
    admissionNo: 'MZ-2026-0105',
    rollNo: '01',
    firstName: 'Lalpekhlua',
    lastName: 'Hmar',
    gender: 'Male',
    dob: '2010-06-19',
    bloodGroup: 'O-',
    classId: 'cls-10',
    stream: null,
    guardianName: 'Rev. R. Lalrosanga',
    guardianPhone: '+91 94363 88712',
    guardianEmail: 'hmar.rosanga@mizoramschool.edu',
    address: 'Tuikual North, Aizawl, Mizoram - 796001',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    feeStatus: 'cleared',
    totalFees: 28000,
    paidFees: 28000,
    transportRouteId: 'route-3',
    hostelRoomId: null,
    attendanceRate: 96.0,
    isClassLeader: true,
    leadershipRole: 'class_leader'
  },
  {
    id: 'stu-111',
    admissionNo: 'MZ-2026-0111',
    rollNo: '02',
    firstName: 'Esther',
    lastName: 'Lalthanzuali',
    gender: 'Female',
    dob: '2010-12-01',
    bloodGroup: 'B+',
    classId: 'cls-10',
    stream: null,
    guardianName: 'Lalbiakdika Sailo',
    guardianPhone: '+91 94361 22890',
    guardianEmail: 'esther.parent@gmail.com',
    address: 'Dinthar, Aizawl, Mizoram',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    feeStatus: 'cleared',
    totalFees: 28000,
    paidFees: 28000,
    transportRouteId: 'route-3',
    hostelRoomId: null,
    attendanceRate: 97.4
  },
  {
    id: 'stu-106',
    admissionNo: 'MZ-2026-0106',
    rollNo: '01',
    firstName: 'Remruatpuii',
    lastName: 'Pachuau',
    gender: 'Female',
    dob: '2021-09-10',
    bloodGroup: 'A+',
    classId: 'cls-nursery',
    stream: null,
    guardianName: 'Lalbiakkima Pachuau',
    guardianPhone: '+91 98621 34900',
    guardianEmail: 'kima.pachuau@gmail.com',
    address: 'Ramhlun North, Aizawl, Mizoram - 796012',
    photoUrl: 'https://images.unsplash.com/photo-1595454223600-91fb57d2243d?w=150&auto=format&fit=crop&q=80',
    feeStatus: 'cleared',
    totalFees: 18000,
    paidFees: 18000,
    transportRouteId: 'route-2',
    hostelRoomId: null,
    attendanceRate: 98.0,
    isClassLeader: true,
    leadershipRole: 'class_leader'
  }
];

// Strict separation: Class Tests (Continuous Assessments) vs Examinations (Term/Final)
export const INITIAL_GRADES = [
  // Class Tests (20-25 marks weightage)
  {
    id: 'grd-ct-1',
    studentId: 'stu-101',
    classId: 'cls-12-sci',
    subject: 'Physics',
    type: 'class_test',
    testName: 'Unit Test 1 (Electrostatics)',
    maxMarks: 25,
    marksObtained: 23,
    date: '2026-05-15',
    remarks: 'Excellent numerical solving ability',
    gradingScale: 'Continuous Assessment'
  },
  {
    id: 'grd-ct-2',
    studentId: 'stu-101',
    classId: 'cls-12-sci',
    subject: 'Chemistry',
    type: 'class_test',
    testName: 'Unit Test 1 (Solutions)',
    maxMarks: 25,
    marksObtained: 22,
    date: '2026-05-18',
    remarks: 'Clear conceptual understanding',
    gradingScale: 'Continuous Assessment'
  },
  {
    id: 'grd-ct-3',
    studentId: 'stu-101',
    classId: 'cls-12-sci',
    subject: 'Mathematics',
    type: 'class_test',
    testName: 'Unit Test 1 (Matrices)',
    maxMarks: 25,
    marksObtained: 24,
    date: '2026-05-20',
    remarks: 'Flawless calculation',
    gradingScale: 'Continuous Assessment'
  },
  {
    id: 'grd-ct-4',
    studentId: 'stu-101',
    classId: 'cls-12-sci',
    subject: 'English',
    type: 'class_test',
    testName: 'Class Assessment 1',
    maxMarks: 20,
    marksObtained: 18,
    date: '2026-05-22',
    remarks: 'Good creative expression',
    gradingScale: 'Continuous Assessment'
  },
  {
    id: 'grd-ct-5',
    studentId: 'stu-101',
    classId: 'cls-12-sci',
    subject: 'Mizo',
    type: 'class_test',
    testName: 'Class Assessment 1 (Thu leh Hla)',
    maxMarks: 20,
    marksObtained: 19,
    date: '2026-05-24',
    remarks: 'Mizo țawng thiam tak leh fel tak',
    gradingScale: 'Continuous Assessment'
  },
  // Examinations (Term / Mid-Term / Board Prep 100 marks)
  {
    id: 'grd-ex-1',
    studentId: 'stu-101',
    classId: 'cls-12-sci',
    subject: 'Physics',
    type: 'examination',
    testName: 'Mid-Term Examination',
    maxMarks: 100,
    marksObtained: 89,
    date: '2026-08-20',
    remarks: 'Grade A1. High proficiency in theory and laboratory practicals.',
    gradingScale: 'MBSE Standard'
  },
  {
    id: 'grd-ex-2',
    studentId: 'stu-101',
    classId: 'cls-12-sci',
    subject: 'Chemistry',
    type: 'examination',
    testName: 'Mid-Term Examination',
    maxMarks: 100,
    marksObtained: 86,
    date: '2026-08-22',
    remarks: 'Grade A2. Strong organic mechanisms, minor calculation slip in stoichiometry.',
    gradingScale: 'MBSE Standard'
  },
  {
    id: 'grd-ex-3',
    studentId: 'stu-101',
    classId: 'cls-12-sci',
    subject: 'Mathematics',
    type: 'examination',
    testName: 'Mid-Term Examination',
    maxMarks: 100,
    marksObtained: 95,
    date: '2026-08-25',
    remarks: 'Grade A1. Outstanding score, neat presentation.',
    gradingScale: 'MBSE Standard'
  },
  {
    id: 'grd-ex-4',
    studentId: 'stu-101',
    classId: 'cls-12-sci',
    subject: 'English',
    type: 'examination',
    testName: 'Mid-Term Examination',
    maxMarks: 100,
    marksObtained: 84,
    date: '2026-08-27',
    remarks: 'Grade A2. Well structured essay and poetry analysis.',
    gradingScale: 'MBSE Standard'
  },
  {
    id: 'grd-ex-5',
    studentId: 'stu-101',
    classId: 'cls-12-sci',
    subject: 'Mizo',
    type: 'examination',
    testName: 'Mid-Term Examination',
    maxMarks: 100,
    marksObtained: 91,
    date: '2026-08-29',
    remarks: 'Grade A1. Hla chham leh Essay ziak țha hle.',
    gradingScale: 'MBSE Standard'
  },
  // Stu-103 Arts student
  {
    id: 'grd-ct-103-1',
    studentId: 'stu-103',
    classId: 'cls-12-arts',
    subject: 'Political Science',
    type: 'class_test',
    testName: 'Unit Test 1 (Constitution)',
    maxMarks: 25,
    marksObtained: 21,
    date: '2026-05-16',
    remarks: 'Good knowledge of democratic structures',
    gradingScale: 'Continuous Assessment'
  },
  {
    id: 'grd-ex-103-1',
    studentId: 'stu-103',
    classId: 'cls-12-arts',
    subject: 'Political Science',
    type: 'examination',
    testName: 'Mid-Term Examination',
    maxMarks: 100,
    marksObtained: 82,
    date: '2026-08-21',
    remarks: 'Grade A2. Insightful answers on contemporary global politics.',
    gradingScale: 'MBSE Standard'
  }
];

export const INITIAL_FEES = [
  {
    id: 'fee-rec-001',
    studentId: 'stu-101',
    studentName: 'Lalrinsanga Sailo',
    admissionNo: 'MZ-2026-0101',
    classId: 'cls-12-sci',
    amount: 18000,
    paymentMode: 'upi',
    feeType: 'Term 1 Tuition & Lab Fee',
    upiId: 'mizoramschool@oksbi',
    transactionUtr: 'UTR492837492811',
    paymentDate: '2026-04-10',
    verified: true,
    cashierName: null,
    receiptNo: 'MSS-UPI-2026-0081',
    remarks: 'GPay payment verified via bank settlement'
  },
  {
    id: 'fee-rec-002',
    studentId: 'stu-101',
    studentName: 'Lalrinsanga Sailo',
    admissionNo: 'MZ-2026-0101',
    classId: 'cls-12-sci',
    amount: 18000,
    paymentMode: 'cash',
    feeType: 'Term 2 Tuition & Exam Fee',
    upiId: null,
    transactionUtr: null,
    paymentDate: '2026-08-05',
    verified: true,
    cashierName: 'R. Laltluanga (Chief Cashier)',
    receiptNo: 'MSS-CSH-2026-0194',
    remarks: 'Full cash payment deposited at counter 2'
  },
  {
    id: 'fee-rec-003',
    studentId: 'stu-102',
    studentName: 'Vanlalhruaii Ralte',
    admissionNo: 'MZ-2026-0102',
    classId: 'cls-12-sci',
    amount: 24000,
    paymentMode: 'upi',
    feeType: 'Term 1 Tuition & Transport Fee',
    upiId: 'mizoramschool@oksbi',
    transactionUtr: 'UTR819203948512',
    paymentDate: '2026-04-12',
    verified: true,
    cashierName: null,
    receiptNo: 'MSS-UPI-2026-0102',
    remarks: 'PhonePe QR payment received'
  },
  {
    id: 'fee-rec-004',
    studentId: 'stu-105',
    studentName: 'Lalpekhlua Hmar',
    admissionNo: 'MZ-2026-0105',
    classId: 'cls-10',
    amount: 28000,
    paymentMode: 'cash',
    feeType: 'Annual Comprehensive Fee (Class 10)',
    upiId: null,
    transactionUtr: null,
    paymentDate: '2026-04-08',
    verified: true,
    cashierName: 'R. Laltluanga (Chief Cashier)',
    receiptNo: 'MSS-CSH-2026-0045',
    remarks: 'Annual fee paid in full with early clearance discount applied'
  }
];

export const INITIAL_ATTENDANCE = [
  { id: 'att-1', studentId: 'stu-101', classId: 'cls-12-sci', date: '2026-09-18', status: 'present', scanMethod: 'qr_scan', scannedBy: 'Lalthlamuana', timestamp: '2026-09-18T08:24:10Z' },
  { id: 'att-2', studentId: 'stu-102', classId: 'cls-12-sci', date: '2026-09-18', status: 'present', scanMethod: 'qr_scan', scannedBy: 'Lalthlamuana', timestamp: '2026-09-18T08:26:45Z' },
  { id: 'att-3', studentId: 'stu-103', classId: 'cls-12-arts', date: '2026-09-18', status: 'present', scanMethod: 'qr_scan', scannedBy: 'R. Lalhmingmawii', timestamp: '2026-09-18T08:30:12Z' },
  { id: 'att-4', studentId: 'stu-104', classId: 'cls-12-comm', date: '2026-09-18', status: 'late', scanMethod: 'manual', scannedBy: 'Timothy Lalmuanawma', timestamp: '2026-09-18T08:52:00Z' },
  { id: 'att-5', studentId: 'stu-105', classId: 'cls-10', date: '2026-09-18', status: 'present', scanMethod: 'qr_scan', scannedBy: 'Dr. C. Zoramthanga', timestamp: '2026-09-18T08:15:30Z' },
  { id: 'att-6', studentId: 'stu-101', classId: 'cls-12-sci', date: '2026-09-19', status: 'present', scanMethod: 'qr_scan', scannedBy: 'Lalthlamuana', timestamp: '2026-09-19T08:22:04Z' },
  { id: 'att-7', studentId: 'stu-102', classId: 'cls-12-sci', date: '2026-09-19', status: 'absent', scanMethod: 'manual', scannedBy: 'Lalthlamuana', timestamp: '2026-09-19T09:00:00Z' }
];

export const INITIAL_STAFF = [
  {
    id: 'stf-001',
    employeeId: 'EMP-ADM-001',
    name: 'Rev. Dr. L. H. Rohmingliana',
    designation: 'Principal',
    department: 'Administration',
    qualification: 'M.A., M.Ed., Ph.D.',
    bloodGroup: 'A+',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    email: 'principal@mizoramschool.edu',
    phone: '+91 94361 40001',
    emergencyContact: '+91 94361 40099',
    joiningDate: '2015-02-01',
    baseSalary: 75000,
    allowances: 15000,
    deductions: 8000,
    bankAccount: 'SBI 30291827461',
    status: 'active',
    classTeacherOf: null,
    subjectsTaught: ['Moral Science / Value Education'],
    committees: ['Managing Board Chairman', 'Academic Council Head', 'Discipline Committee Patron'],
    weeklyPeriods: 4,
    specialDuty: 'Chief Institutional Executive & MBSE Centre Superintendent'
  },
  {
    id: 'stf-006',
    employeeId: 'EMP-ADM-002',
    name: 'Dr. C. Lalremruata',
    designation: 'Vice Principal & Academic Dean',
    department: 'Academic Administration',
    qualification: 'M.Sc., Ph.D. (Chemistry), B.Ed.',
    bloodGroup: 'O+',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    email: 'vp.lalremruata@mizoramschool.edu',
    phone: '+91 94361 40002',
    emergencyContact: '+91 94361 40098',
    joiningDate: '2017-04-10',
    baseSalary: 62000,
    allowances: 12000,
    deductions: 6500,
    bankAccount: 'SBI 30291827499',
    status: 'active',
    classTeacherOf: null,
    subjectsTaught: ['Chemistry'],
    committees: ['Examination Cell Convenor', 'Academic Planning Committee', 'Admission Scrutiny Council'],
    weeklyPeriods: 18,
    specialDuty: 'Academic Dean & Chemistry Lab Overseer'
  },
  {
    id: 'stf-002',
    employeeId: 'EMP-FAC-014',
    name: 'Lalthlamuana Sailo',
    designation: 'PGT Senior Physics Teacher',
    department: 'Science Department',
    qualification: 'M.Sc. (Physics), B.Ed.',
    bloodGroup: 'B+',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    email: 'lalthlamuana@mizoramschool.edu',
    phone: '+91 98623 88124',
    emergencyContact: '+91 98623 88100',
    joiningDate: '2018-06-15',
    baseSalary: 48000,
    allowances: 8000,
    deductions: 4500,
    bankAccount: 'HDFC 50100293847',
    status: 'active',
    classTeacherOf: 'cls-12-sci',
    subjectsTaught: ['Physics'],
    committees: ['Examination Cell Member', 'Science Club In-Charge'],
    weeklyPeriods: 24,
    specialDuty: 'Physics Lab Superintendent & Science Exhibition Coordinator'
  },
  {
    id: 'stf-003',
    employeeId: 'EMP-FAC-018',
    name: 'Ruth Lalrinsangi',
    designation: 'PGT English & Literature',
    department: 'Humanities & Languages',
    qualification: 'M.A. (English), M.Phil.',
    bloodGroup: 'AB+',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    email: 'ruth.linsangi@mizoramschool.edu',
    phone: '+91 97740 51290',
    emergencyContact: '+91 97740 51200',
    joiningDate: '2019-01-10',
    baseSalary: 46000,
    allowances: 7500,
    deductions: 4200,
    bankAccount: 'SBI 20194857201',
    status: 'active',
    classTeacherOf: 'cls-12-arts',
    subjectsTaught: ['English', 'Alternative English'],
    committees: ['Discipline Committee', 'Literary & Debating Society Convener'],
    weeklyPeriods: 22,
    specialDuty: 'School Magazine Editor & Cultural Events In-Charge'
  },
  {
    id: 'stf-007',
    employeeId: 'EMP-HST-001',
    name: 'Pu K. Vanlalhruaia',
    designation: 'Chief Hostel Warden & Residential Head',
    department: 'Hostel & Student Welfare',
    qualification: 'B.A., Sports & Physical Education',
    bloodGroup: 'O+',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    email: 'warden.hruaia@mizoramschool.edu',
    phone: '+91 94361 55219',
    emergencyContact: '+91 94361 55200',
    joiningDate: '2018-09-01',
    baseSalary: 44000,
    allowances: 7000,
    deductions: 4000,
    bankAccount: 'SBI 30981726354',
    status: 'active',
    classTeacherOf: null,
    subjectsTaught: ['Physical & Health Education'],
    committees: ['Hostel Welfare Board', 'Discipline & Anti-Ragging Committee', 'Sports Council Member'],
    weeklyPeriods: 10,
    specialDuty: 'Senior Boys & Girls Hostel Superintendent & Night Gate Security'
  },
  {
    id: 'stf-004',
    employeeId: 'EMP-FIN-003',
    name: 'R. Laltluanga',
    designation: 'Chief Accounts Officer & Cashier',
    department: 'Finance & Accounts',
    qualification: 'M.Com, Certified Accountant',
    bloodGroup: 'A-',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    email: 'accounts@mizoramschool.edu',
    phone: '+91 94363 77210',
    emergencyContact: '+91 94363 77299',
    joiningDate: '2016-08-01',
    baseSalary: 42000,
    allowances: 6000,
    deductions: 3800,
    bankAccount: 'SBI 10827364501',
    status: 'active',
    classTeacherOf: null,
    subjectsTaught: ['Accountancy & Commercial Studies'],
    committees: ['Purchase & Audit Committee', 'Fee Concession Review Council'],
    weeklyPeriods: 8,
    specialDuty: 'Financial Ledger Keeper & Fee Counter Chief'
  },
  {
    id: 'stf-005',
    employeeId: 'EMP-LIB-002',
    name: 'Zonunmawii',
    designation: 'Senior Librarian',
    department: 'Central Library',
    qualification: 'M.Lib.Sc.',
    bloodGroup: 'B-',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    email: 'library@mizoramschool.edu',
    phone: '+91 98624 33019',
    emergencyContact: '+91 98624 33000',
    joiningDate: '2020-03-01',
    baseSalary: 38000,
    allowances: 5000,
    deductions: 3200,
    bankAccount: 'Mizoram Rural Bank 8001928374',
    status: 'active',
    classTeacherOf: null,
    subjectsTaught: [],
    committees: ['Library Advisory Board', 'Textbook Procurement Committee'],
    weeklyPeriods: 0,
    specialDuty: 'Digital Library & E-Resource Access Custodian'
  },
  {
    id: 'stf-008',
    employeeId: 'EMP-PRT-001',
    name: 'Pi Lalrinchhani',
    designation: 'PRT Nursery & Kindergarten In-Charge',
    department: 'Pre-Primary Department',
    qualification: 'B.A., D.El.Ed., Montessori Trained',
    bloodGroup: 'B+',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    email: 'lalrinchhani@mizoramschool.edu',
    phone: '+91 98621 11001',
    emergencyContact: '+91 98621 11099',
    joiningDate: '2021-02-15',
    baseSalary: 30000,
    allowances: 4500,
    deductions: 2800,
    bankAccount: 'SBI 20391827461',
    status: 'active',
    classTeacherOf: 'cls-nursery',
    subjectsTaught: ['English', 'Mizo Rhymes', 'Art & Craft'],
    committees: ['Literary, Cultural & Debating Society'],
    weeklyPeriods: 20,
    specialDuty: 'Pre-Primary Playgroup & Nursery Care In-Charge'
  },
  {
    id: 'stf-009',
    employeeId: 'EMP-PRT-002',
    name: 'Pi Zonunmawii Ralte',
    designation: 'PRT Pre-Primary Educator',
    department: 'Pre-Primary Department',
    qualification: 'B.Sc. (Home Sc.), D.El.Ed.',
    bloodGroup: 'O+',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    email: 'zonunmawii.ralte@mizoramschool.edu',
    phone: '+91 98621 11002',
    emergencyContact: '+91 98621 11098',
    joiningDate: '2021-03-01',
    baseSalary: 30000,
    allowances: 4500,
    deductions: 2800,
    bankAccount: 'MRB 9001928371',
    status: 'active',
    classTeacherOf: 'cls-lkg',
    subjectsTaught: ['English', 'Numbers & Basic Math', 'Moral Story'],
    committees: ['Student Welfare Committee'],
    weeklyPeriods: 20,
    specialDuty: 'LKG Activity Room Coordinator'
  },
  {
    id: 'stf-010',
    employeeId: 'EMP-PRT-003',
    name: 'Pu C. Lalramhluna',
    designation: 'PRT Senior Kindergarten Teacher',
    department: 'Pre-Primary Department',
    qualification: 'B.A., B.Ed.',
    bloodGroup: 'A+',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    email: 'lalramhluna@mizoramschool.edu',
    phone: '+91 98621 11003',
    emergencyContact: '+91 98621 11097',
    joiningDate: '2020-07-15',
    baseSalary: 31000,
    allowances: 4800,
    deductions: 2900,
    bankAccount: 'SBI 30291827410',
    status: 'active',
    classTeacherOf: 'cls-ukg',
    subjectsTaught: ['English', 'Mizo', 'Mathematics Basics'],
    committees: ['Sports & Physical Education Council'],
    weeklyPeriods: 20,
    specialDuty: 'Junior Sports & Playground Safety In-Charge'
  },
  {
    id: 'stf-011',
    employeeId: 'EMP-PRT-004',
    name: 'Pu Lalthanzuala',
    designation: 'PRT Primary Educator (Class 1)',
    department: 'Primary Department',
    qualification: 'B.Sc., B.Ed.',
    bloodGroup: 'B+',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    email: 'lalthanzuala.p@mizoramschool.edu',
    phone: '+91 98621 11004',
    emergencyContact: '+91 98621 11096',
    joiningDate: '2019-04-10',
    baseSalary: 32000,
    allowances: 5000,
    deductions: 3000,
    bankAccount: 'HDFC 50100293811',
    status: 'active',
    classTeacherOf: 'cls-1',
    subjectsTaught: ['Mathematics', 'Environmental Studies', 'Mizo'],
    committees: ['Discipline Committee'],
    weeklyPeriods: 22,
    specialDuty: 'Class 1 Academic Mentor'
  },
  {
    id: 'stf-012',
    employeeId: 'EMP-PRT-005',
    name: 'Pi Vanlalruati',
    designation: 'PRT Primary Educator (Class 2)',
    department: 'Primary Department',
    qualification: 'B.A. (English), B.Ed.',
    bloodGroup: 'O-',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    email: 'vanlalruati@mizoramschool.edu',
    phone: '+91 98621 11005',
    emergencyContact: '+91 98621 11095',
    joiningDate: '2019-06-01',
    baseSalary: 32000,
    allowances: 5000,
    deductions: 3000,
    bankAccount: 'SBI 30291827412',
    status: 'active',
    classTeacherOf: 'cls-2',
    subjectsTaught: ['English', 'Mizo', 'Moral Science'],
    committees: ['Literary, Cultural & Debating Society'],
    weeklyPeriods: 22,
    specialDuty: 'Primary School Morning Devotion In-Charge'
  },
  {
    id: 'stf-013',
    employeeId: 'EMP-PRT-006',
    name: 'Pu K. Lalbiakdika',
    designation: 'PRT Primary Educator (Class 3)',
    department: 'Primary Department',
    qualification: 'B.Sc. (Maths), B.Ed.',
    bloodGroup: 'A+',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    email: 'lalbiakdika@mizoramschool.edu',
    phone: '+91 98621 11006',
    emergencyContact: '+91 98621 11094',
    joiningDate: '2018-11-15',
    baseSalary: 33000,
    allowances: 5200,
    deductions: 3100,
    bankAccount: 'SBI 30291827413',
    status: 'active',
    classTeacherOf: 'cls-3',
    subjectsTaught: ['Mathematics', 'General Science', 'General Knowledge'],
    committees: ['Science Club Member'],
    weeklyPeriods: 22,
    specialDuty: 'Primary Math Olympiad Mentor'
  },
  {
    id: 'stf-014',
    employeeId: 'EMP-PRT-007',
    name: 'Pi Lalmuanpuii',
    designation: 'PRT Primary Educator (Class 4)',
    department: 'Primary Department',
    qualification: 'M.A., B.Ed.',
    bloodGroup: 'AB+',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    email: 'lalmuanpuii@mizoramschool.edu',
    phone: '+91 98621 11007',
    emergencyContact: '+91 98621 11093',
    joiningDate: '2018-05-20',
    baseSalary: 34000,
    allowances: 5400,
    deductions: 3200,
    bankAccount: 'HDFC 50100293814',
    status: 'active',
    classTeacherOf: 'cls-4',
    subjectsTaught: ['Social Studies', 'English', 'Environmental Studies'],
    committees: ['Admission Scrutiny Council'],
    weeklyPeriods: 22,
    specialDuty: 'Primary School Exhibition In-Charge'
  },
  {
    id: 'stf-015',
    employeeId: 'EMP-PRT-008',
    name: 'Pu Lalhmangaiha',
    designation: 'PRT Senior Primary Educator (Class 5)',
    department: 'Primary Department',
    qualification: 'B.Sc., B.Ed.',
    bloodGroup: 'O+',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    email: 'lalhmangaiha@mizoramschool.edu',
    phone: '+91 98621 11008',
    emergencyContact: '+91 98621 11092',
    joiningDate: '2017-08-10',
    baseSalary: 35000,
    allowances: 5600,
    deductions: 3300,
    bankAccount: 'SBI 30291827415',
    status: 'active',
    classTeacherOf: 'cls-5',
    subjectsTaught: ['Science', 'Mathematics', 'Mizo'],
    committees: ['Discipline Committee', 'Sports & Physical Education Council'],
    weeklyPeriods: 22,
    specialDuty: 'Primary-Middle Transition Coordinator'
  },
  {
    id: 'stf-016',
    employeeId: 'EMP-TGT-001',
    name: 'Pu Malsawmtluanga',
    designation: 'TGT Social Science & History',
    department: 'Social Science Department',
    qualification: 'M.A. (History), B.Ed.',
    bloodGroup: 'B+',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    email: 'malsawmtluanga@mizoramschool.edu',
    phone: '+91 98621 11009',
    emergencyContact: '+91 98621 11091',
    joiningDate: '2017-02-01',
    baseSalary: 38000,
    allowances: 6000,
    deductions: 3600,
    bankAccount: 'SBI 30291827416',
    status: 'active',
    classTeacherOf: 'cls-6',
    subjectsTaught: ['History', 'Civics / Political Science', 'Geography'],
    committees: ['Discipline & Anti-Ragging Committee'],
    weeklyPeriods: 22,
    specialDuty: 'Middle School Discipline Supervisor'
  },
  {
    id: 'stf-017',
    employeeId: 'EMP-TGT-002',
    name: 'Pi Zothanpuii',
    designation: 'TGT General Science & Biology',
    department: 'Science Department',
    qualification: 'M.Sc. (Botany), B.Ed.',
    bloodGroup: 'A+',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    email: 'zothanpuii.bio@mizoramschool.edu',
    phone: '+91 98621 11010',
    emergencyContact: '+91 98621 11090',
    joiningDate: '2016-09-15',
    baseSalary: 39000,
    allowances: 6200,
    deductions: 3700,
    bankAccount: 'MRB 9001928317',
    status: 'active',
    classTeacherOf: 'cls-7',
    subjectsTaught: ['Science', 'Biology Basics', 'Environmental Studies'],
    committees: ['Science Club Convenor', 'Eco Club In-Charge'],
    weeklyPeriods: 22,
    specialDuty: 'School Botanical Garden & Eco Club Head'
  },
  {
    id: 'stf-018',
    employeeId: 'EMP-TGT-003',
    name: 'Pu David Lalnunmawia',
    designation: 'TGT Mizo Language & Literature',
    department: 'Mizo Department',
    qualification: 'M.A. (Mizo), M.Phil., B.Ed.',
    bloodGroup: 'O+',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    email: 'david.lalnunmawia@mizoramschool.edu',
    phone: '+91 98621 11011',
    emergencyContact: '+91 98621 11089',
    joiningDate: '2016-04-01',
    baseSalary: 40000,
    allowances: 6400,
    deductions: 3800,
    bankAccount: 'SBI 30291827418',
    status: 'active',
    classTeacherOf: 'cls-8',
    subjectsTaught: ['Mizo (MIL)', 'Mizo Culture & Heritage'],
    committees: ['Literary, Cultural & Debating Society Chairman'],
    weeklyPeriods: 22,
    specialDuty: 'Mizo Zai & Cultural Festival Director'
  },
  {
    id: 'stf-019',
    employeeId: 'EMP-TGT-004',
    name: 'Pu H. Laldinpuia',
    designation: 'TGT Secondary Mathematics Teacher',
    department: 'Mathematics Department',
    qualification: 'M.Sc. (Maths), B.Ed.',
    bloodGroup: 'B+',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    email: 'laldinpuia.math@mizoramschool.edu',
    phone: '+91 98621 11012',
    emergencyContact: '+91 98621 11088',
    joiningDate: '2015-08-10',
    baseSalary: 42000,
    allowances: 6800,
    deductions: 4000,
    bankAccount: 'HDFC 50100293819',
    status: 'active',
    classTeacherOf: 'cls-9',
    subjectsTaught: ['Mathematics', 'Statistics Basics'],
    committees: ['Examination Cell Member', 'Sports Council Member'],
    weeklyPeriods: 24,
    specialDuty: 'High School Mathematics Remedial Head'
  },
  {
    id: 'stf-020',
    employeeId: 'EMP-PGT-001',
    name: 'Dr. C. Zoramthanga',
    designation: 'PGT Senior Science & Class 10 Board In-Charge',
    department: 'Science Department',
    qualification: 'M.Sc., Ph.D. (Physics), B.Ed.',
    bloodGroup: 'A+',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    email: 'zoramthanga@mizoramschool.edu',
    phone: '+91 98621 11013',
    emergencyContact: '+91 98621 11087',
    joiningDate: '2014-06-01',
    baseSalary: 52000,
    allowances: 9000,
    deductions: 5000,
    bankAccount: 'SBI 30291827420',
    status: 'active',
    classTeacherOf: 'cls-10',
    subjectsTaught: ['Physics', 'General Science'],
    committees: ['Examination Cell Assistant Convenor', 'MBSE HSLC Coordination Board'],
    weeklyPeriods: 22,
    specialDuty: 'MBSE HSLC Board Examination In-Charge & Chief Scrutinizer'
  },
  {
    id: 'stf-021',
    employeeId: 'EMP-PGT-002',
    name: 'Pi R. Lalhmingmawii',
    designation: 'PGT Political Science & Civics Head',
    department: 'Humanities & Languages',
    qualification: 'M.A. (Pol. Sci.), M.Phil., B.Ed.',
    bloodGroup: 'O+',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    email: 'lalhmingmawii.pol@mizoramschool.edu',
    phone: '+91 98621 11014',
    emergencyContact: '+91 98621 11086',
    joiningDate: '2016-01-15',
    baseSalary: 48000,
    allowances: 8000,
    deductions: 4500,
    bankAccount: 'SBI 30291827421',
    status: 'active',
    classTeacherOf: 'cls-11-arts',
    subjectsTaught: ['Political Science', 'Sociology'],
    committees: ['Admission Scrutiny Council', 'Discipline Committee'],
    weeklyPeriods: 22,
    specialDuty: 'Youth Parliament & Model UN Coordinator'
  },
  {
    id: 'stf-022',
    employeeId: 'EMP-PGT-003',
    name: 'Pu V. Laltanpuia',
    designation: 'PGT Accountancy & Commercial Math',
    department: 'Commerce Department',
    qualification: 'M.Com, B.Ed., NET',
    bloodGroup: 'B-',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    email: 'laltanpuia.com@mizoramschool.edu',
    phone: '+91 98621 11015',
    emergencyContact: '+91 98621 11085',
    joiningDate: '2017-05-10',
    baseSalary: 47000,
    allowances: 7800,
    deductions: 4400,
    bankAccount: 'HDFC 50100293822',
    status: 'active',
    classTeacherOf: 'cls-11-comm',
    subjectsTaught: ['Accountancy', 'Business Mathematics'],
    committees: ['Finance, Purchase & Audit Committee'],
    weeklyPeriods: 22,
    specialDuty: 'Commerce Club Mentor & Investor Pitch Advisor'
  },
  {
    id: 'stf-023',
    employeeId: 'EMP-PGT-004',
    name: 'Pu Timothy Lalmuanawma',
    designation: 'PGT Business Studies & Economics',
    department: 'Commerce Department',
    qualification: 'M.Com, M.B.A., B.Ed.',
    bloodGroup: 'A+',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    email: 'timothy.lalmuanawma@mizoramschool.edu',
    phone: '+91 98621 11016',
    emergencyContact: '+91 98621 11084',
    joiningDate: '2018-02-01',
    baseSalary: 47000,
    allowances: 7800,
    deductions: 4400,
    bankAccount: 'SBI 30291827423',
    status: 'active',
    classTeacherOf: 'cls-12-comm',
    subjectsTaught: ['Business Studies', 'Economics'],
    committees: ['Career Guidance & Placement Cell In-Charge'],
    weeklyPeriods: 22,
    specialDuty: 'Senior Secondary Career Guidance & University Admissions Head'
  },
  {
    id: 'stf-024',
    employeeId: 'EMP-PGT-005',
    name: 'Prof. J. Lalramenga',
    designation: 'PGT Senior Chemistry Specialist',
    department: 'Science Department',
    qualification: 'M.Sc. (Chemistry), M.Phil., B.Ed.',
    bloodGroup: 'O+',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    email: 'lalramenga.chem@mizoramschool.edu',
    phone: '+91 98621 11017',
    emergencyContact: '+91 98621 11083',
    joiningDate: '2015-01-10',
    baseSalary: 50000,
    allowances: 8500,
    deductions: 4700,
    bankAccount: 'SBI 30291827424',
    status: 'active',
    classTeacherOf: 'cls-11-sci',
    subjectsTaught: ['Chemistry', 'Environmental Chemistry'],
    committees: ['Science Club Patron', 'Safety & Chemical Disposal Board'],
    weeklyPeriods: 24,
    specialDuty: 'Higher Secondary Science Lab Director'
  }
];

export const INITIAL_PAYROLL = [
  {
    id: 'pay-2026-08-001',
    staffId: 'stf-001',
    staffName: 'Rev. Dr. L. H. Rohmingliana',
    designation: 'Principal',
    month: 'August',
    year: 2026,
    baseSalary: 75000,
    allowances: 15000,
    deductions: 8000,
    netSalary: 82000,
    status: 'paid',
    paymentDate: '2026-08-31',
    transactionRef: 'NEFT-MZB-8921004'
  },
  {
    id: 'pay-2026-08-002',
    staffId: 'stf-002',
    staffName: 'Lalthlamuana Sailo',
    designation: 'PGT Senior Physics Teacher',
    month: 'August',
    year: 2026,
    baseSalary: 48000,
    allowances: 8000,
    deductions: 4500,
    netSalary: 51500,
    status: 'paid',
    paymentDate: '2026-08-31',
    transactionRef: 'NEFT-MZB-8921005'
  },
  {
    id: 'pay-2026-08-003',
    staffId: 'stf-003',
    staffName: 'Ruth Lalrinsangi',
    designation: 'PGT English & Literature',
    month: 'August',
    year: 2026,
    baseSalary: 46000,
    allowances: 7500,
    deductions: 4200,
    netSalary: 49300,
    status: 'paid',
    paymentDate: '2026-08-31',
    transactionRef: 'NEFT-MZB-8921006'
  },
  {
    id: 'pay-2026-08-004',
    staffId: 'stf-004',
    staffName: 'R. Laltluanga',
    designation: 'Chief Accounts Officer & Cashier',
    month: 'August',
    year: 2026,
    baseSalary: 42000,
    allowances: 6000,
    deductions: 3800,
    netSalary: 44200,
    status: 'paid',
    paymentDate: '2026-08-31',
    transactionRef: 'NEFT-MZB-8921007'
  }
];

export const INITIAL_LIBRARY_BOOKS = [
  {
    id: 'lib-001',
    title: 'Concepts of Physics (Vol 1 & 2)',
    author: 'Dr. H. C. Verma',
    isbn: '978-8177091878',
    category: 'Science & Higher Secondary',
    totalCopies: 15,
    availableCopies: 12,
    rackLocation: 'Shelf S-04 / Rack 2',
    issuedTo: [
      { studentId: 'stu-101', studentName: 'Lalrinsanga Sailo', issueDate: '2026-09-01', dueDate: '2026-09-22', returned: false }
    ]
  },
  {
    id: 'lib-002',
    title: 'Mizo Thu Leh Hla Chanchin (History of Mizo Literature)',
    author: 'B. Lalthangliana',
    isbn: '978-9380300412',
    category: 'Mizo Culture & Literature',
    totalCopies: 20,
    availableCopies: 18,
    rackLocation: 'Shelf M-01 / Rack 1',
    issuedTo: []
  },
  {
    id: 'lib-003',
    title: 'Indian Polity (7th Edition)',
    author: 'M. Laxmikanth',
    isbn: '978-9355325884',
    category: 'Humanities & Social Sciences',
    totalCopies: 10,
    availableCopies: 8,
    rackLocation: 'Shelf A-02 / Rack 3',
    issuedTo: [
      { studentId: 'stu-103', studentName: 'Lalmuanpuia Chhangte', issueDate: '2026-09-05', dueDate: '2026-09-26', returned: false }
    ]
  },
  {
    id: 'lib-004',
    title: 'Double Entry Book Keeping (Class 12)',
    author: 'T. S. Grewal',
    isbn: '978-9352745586',
    category: 'Commerce & Accountancy',
    totalCopies: 12,
    availableCopies: 11,
    rackLocation: 'Shelf C-03 / Rack 1',
    issuedTo: []
  },
  {
    id: 'lib-005',
    title: 'The Blue Umbrella & Other Stories',
    author: 'Ruskin Bond',
    isbn: '978-8171673407',
    category: 'English Literature / Fiction',
    totalCopies: 25,
    availableCopies: 22,
    rackLocation: 'Shelf F-05 / Junior Section',
    issuedTo: []
  }
];

export const INITIAL_NOTICES = [
  {
    id: 'not-001',
    scope: 'broadcast',
    title: 'Chapchar Kût Holidays and Cultural Programme Announcement',
    content: 'All students, parents, and faculty members are hereby notified that the school will observe Chapchar Kût festive holidays. Special traditional Mizo cultural attire and Cheraw display competitions will take place on Thursday in the Main Auditorium.',
    category: 'holiday',
    priority: 'normal',
    targetAudience: 'all',
    targetUserId: null,
    targetUserName: null,
    senderId: 'stf-001',
    publishedBy: 'Rev. Dr. L. H. Rohmingliana (Principal)',
    publishedAt: '2026-09-18T10:00:00Z',
    isPinned: true,
    channels: { inApp: true, whatsapp: true, push: true, sms: false },
    readBy: ['stu-101', 'stu-102']
  },
  {
    id: 'not-002',
    scope: 'broadcast',
    title: 'Class 10 & 12 MBSE Board Registration and Mock Schedule',
    content: 'Registration documents, verification of Aadhaar/Birth certificates, and registration fees for Class 10 HSLC and Class 12 HSSLC must be submitted to the Academic Office before the end of the month. Mock examination dates will be published next week.',
    category: 'exam',
    priority: 'urgent',
    targetAudience: 'students',
    targetUserId: null,
    targetUserName: null,
    senderId: 'stf-006',
    publishedBy: 'Dr. C. Lalremruata (Vice Principal & Exam Cell)',
    publishedAt: '2026-09-16T14:30:00Z',
    isPinned: true,
    channels: { inApp: true, whatsapp: true, push: true, sms: true },
    readBy: ['stu-101']
  },
  {
    id: 'not-003',
    scope: 'broadcast',
    title: 'School Transport Route #2 Timing Adjustment (Mission Veng - Ramhlun)',
    content: 'Due to ongoing road maintenance along Temple Square, Morning Bus Route #2 will depart 10 minutes earlier starting Monday. Parents along Mission Veng and Khatla are requested to bring their wards to pickup points accordingly.',
    category: 'general',
    priority: 'normal',
    targetAudience: 'parents',
    targetUserId: null,
    targetUserName: null,
    senderId: 'stf-007',
    publishedBy: 'Transport Directorate (Pu K. Vanlalhruaia)',
    publishedAt: '2026-09-14T09:15:00Z',
    isPinned: false,
    channels: { inApp: true, whatsapp: true, push: false, sms: true },
    readBy: []
  },
  {
    id: 'not-004',
    scope: 'broadcast',
    title: 'Inter-House Sports Meet & Football Tournament Fixtures',
    content: 'The Annual Inter-House Football Tournament (Chhim House, Hmar House, Khawchhak House, Khawthlang House) commences next Friday at the School Sports Ground. Class teachers must submit finalized house player lists.',
    category: 'sports',
    priority: 'normal',
    targetAudience: 'all',
    targetUserId: null,
    targetUserName: null,
    senderId: 'stf-002',
    publishedBy: 'Sports In-charge (Lalthlamuana Sailo)',
    publishedAt: '2026-09-12T16:00:00Z',
    isPinned: false,
    channels: { inApp: true, whatsapp: true, push: true, sms: false },
    readBy: ['stu-101']
  },
  // PRIVATE NOTIFICATIONS (Pvt 1-to-1 Notifications)
  {
    id: 'pvt-001',
    scope: 'private',
    title: 'Confidential: Physics Unit Test 1 Result & Academic Feedback',
    content: 'Dear Lalrinsanga, you scored 23/25 in Electrostatics Unit Test. Outstanding numerical solving. Keep this consistency up for the upcoming MBSE Board pre-exam.',
    category: 'academic',
    priority: 'normal',
    targetAudience: 'individual',
    targetUserId: 'stu-101',
    targetUserName: 'Lalrinsanga Sailo (Class 12 Sci)',
    recipientRole: 'student',
    senderId: 'stf-002',
    publishedBy: 'Lalthlamuana Sailo (Class Teacher)',
    publishedAt: '2026-09-19T11:20:00Z',
    isPinned: false,
    channels: { inApp: true, whatsapp: true, push: true, sms: false },
    readBy: []
  },
  {
    id: 'pvt-002',
    scope: 'private',
    title: 'Urgent: School Fee Clearance & Progress Report Withhold Notice',
    content: 'Dear Zodinpuii Khiangte & Guardian, your 2nd Term tuition fee balance of ₹20,000 is overdue. As per institutional policy, progress report cards are withheld until cleared. Please pay online via student portal or visit the accounts counter.',
    category: 'general',
    priority: 'urgent',
    targetAudience: 'individual',
    targetUserId: 'stu-104',
    targetUserName: 'Zodinpuii Khiangte (Class 12 Comm)',
    recipientRole: 'student',
    senderId: 'stf-004',
    publishedBy: 'R. Laltluanga (Chief Accounts Officer)',
    publishedAt: '2026-09-19T08:45:00Z',
    isPinned: true,
    channels: { inApp: true, whatsapp: true, push: true, sms: true },
    readBy: []
  },
  {
    id: 'pvt-003',
    scope: 'private',
    title: 'Staff Academic Council & Moderation Meeting at 2:30 PM',
    content: 'Pu Lalthlamuana, please attend the urgent academic committee meeting in the Principal Chamber regarding MBSE practical examination center preparations.',
    category: 'general',
    priority: 'urgent',
    targetAudience: 'individual',
    targetUserId: 'stf-002',
    targetUserName: 'Lalthlamuana Sailo (PGT Physics)',
    recipientRole: 'teacher',
    senderId: 'stf-001',
    publishedBy: 'Rev. Dr. L. H. Rohmingliana (Principal)',
    publishedAt: '2026-09-19T13:00:00Z',
    isPinned: false,
    channels: { inApp: true, whatsapp: true, push: true, sms: false },
    readBy: []
  },
  {
    id: 'pvt-004',
    scope: 'private',
    title: 'Hostel Weekend Gate Pass Request Approved',
    content: 'Dear Guardian of Vanlalhruaii Ralte, your daughter weekend day-outing gate pass request for family visit has been approved by the residential warden.',
    category: 'general',
    priority: 'normal',
    targetAudience: 'individual',
    targetUserId: 'stu-102',
    targetUserName: 'Vanlalhruaii Ralte (Class 12 Sci)',
    recipientRole: 'parent',
    senderId: 'stf-007',
    publishedBy: 'Pu K. Vanlalhruaia (Chief Warden)',
    publishedAt: '2026-09-18T18:00:00Z',
    isPinned: false,
    channels: { inApp: true, whatsapp: true, push: true, sms: true },
    readBy: ['stu-102']
  },
  // WARDEN SPECIFIC DIRECT ALERTS
  {
    id: 'pvt-wdn-001',
    scope: 'private',
    title: 'Urgent: 3 Boarding Gate Pass Requisitions Awaiting Approval',
    content: 'Chief Warden Pu K. Vanlalhruaia, 3 students (Vanlalhruaii Ralte, Lalrinsanga Sailo, and Zodinpuii Khiangte) have submitted weekend day-outing and chapel visit passes requiring your biometric signoff.',
    category: 'hostel',
    priority: 'urgent',
    targetAudience: 'individual',
    targetUserId: 'user-warden-01',
    targetUserName: 'Pu K. Vanlalhruaia (Chief Warden)',
    recipientRole: 'warden',
    senderId: 'hostel-portal',
    publishedBy: 'Hostel Gate Security & Attendance',
    publishedAt: '2026-09-19T14:30:00Z',
    isPinned: true,
    channels: { inApp: true, whatsapp: true, push: true, sms: false },
    readBy: []
  },
  {
    id: 'pvt-wdn-002',
    scope: 'private',
    title: 'Hostel Mess Kitchen Stock & Saturday Feast Supply Arrived',
    content: 'Weekly dry rations, LPG cylinders, and fresh local pork/chicken have been received at the central mess store. Please verify inventory ledger.',
    category: 'hostel',
    priority: 'normal',
    targetAudience: 'individual',
    targetUserId: 'user-warden-01',
    targetUserName: 'Pu K. Vanlalhruaia (Chief Warden)',
    recipientRole: 'warden',
    senderId: 'stf-004',
    publishedBy: 'R. Laltluanga (Chief Accounts Officer)',
    publishedAt: '2026-09-19T11:00:00Z',
    isPinned: false,
    channels: { inApp: true, whatsapp: false, push: true, sms: false },
    readBy: []
  },

  // VICE PRINCIPAL SPECIFIC DIRECT ALERTS
  {
    id: 'pvt-vp-001',
    scope: 'private',
    title: 'Action Required: Special Proctored Online Examination Requisition',
    content: 'Vice Principal Pi Mary Lalnunpuii, a special video-proctored examination room request for Dengue-recovering student Lalpekhlua Hmar (Class 10 Board) has been submitted by the examination committee for your administrative sanction.',
    category: 'academic',
    priority: 'urgent',
    targetAudience: 'individual',
    targetUserId: 'user-vp-01',
    targetUserName: 'Pi Mary Lalnunpuii (Vice Principal)',
    recipientRole: 'vice_principal',
    senderId: 'stf-020',
    publishedBy: 'Dr. C. Zoramthanga (Exam Cell Convenor)',
    publishedAt: '2026-09-19T09:40:00Z',
    isPinned: true,
    channels: { inApp: true, whatsapp: true, push: true, sms: false },
    readBy: []
  },
  {
    id: 'pvt-vp-002',
    scope: 'private',
    title: 'Student Leave Dossier Endorsement Forwarded for VP Review',
    content: 'Class Master Lalthlamuana Sailo has endorsed 4-day medical leave application LA/2026/412. Please verify attached doctor certificate.',
    category: 'academic',
    priority: 'normal',
    targetAudience: 'individual',
    targetUserId: 'user-vp-01',
    targetUserName: 'Pi Mary Lalnunpuii (Vice Principal)',
    recipientRole: 'vice_principal',
    senderId: 'stf-002',
    publishedBy: 'Lalthlamuana Sailo (Class Teacher)',
    publishedAt: '2026-09-19T10:15:00Z',
    isPinned: false,
    channels: { inApp: true, whatsapp: false, push: true, sms: false },
    readBy: []
  },

  // TEACHER SPECIFIC DIRECT ALERTS
  {
    id: 'pvt-tch-001',
    scope: 'private',
    title: 'Urgent: MBSE Practical Score Moderation Deadline Friday 5:00 PM',
    content: 'Pu Lalthlamuana Sailo, please ensure that all Class 12 Science experimental laboratory marks and viva scores are locked before Friday.',
    category: 'academic',
    priority: 'urgent',
    targetAudience: 'individual',
    targetUserId: 'user-teacher-01',
    targetUserName: 'Lalthlamuana Sailo (Teacher)',
    recipientRole: 'teacher',
    senderId: 'user-vp-01',
    publishedBy: 'Pi Mary Lalnunpuii (Vice Principal)',
    publishedAt: '2026-09-19T13:00:00Z',
    isPinned: true,
    channels: { inApp: true, whatsapp: true, push: true, sms: false },
    readBy: []
  },
  {
    id: 'pvt-tch-002',
    scope: 'private',
    title: 'Attendance Alert: 2 Students Absent in Morning Face Scan',
    content: 'Class 12 Science morning attendance scan recorded 2 absentees: Lalpekhlua Hmar and Zodinpuii Khiangte. Automated WhatsApp notifications have been sent to their guardians.',
    category: 'academic',
    priority: 'normal',
    targetAudience: 'individual',
    targetUserId: 'user-teacher-01',
    targetUserName: 'Lalthlamuana Sailo (Teacher)',
    recipientRole: 'teacher',
    senderId: 'attendance-desk',
    publishedBy: 'Face Biometric Attendance Desk',
    publishedAt: '2026-09-19T08:50:00Z',
    isPinned: false,
    channels: { inApp: true, whatsapp: false, push: true, sms: false },
    readBy: []
  },

  // PARENT SPECIFIC DIRECT ALERTS
  {
    id: 'pvt-prt-001',
    scope: 'private',
    title: 'Real-time Arrival Alert: Student Present via Biometric Scan',
    content: 'Dear Lalthanzuala Sailo, your child Lalrinsanga Sailo (Roll #01, Class 12 Sci) arrived at school campus and checked in at 08:42 AM via Face Biometric Scanner.',
    category: 'general',
    priority: 'normal',
    targetAudience: 'individual',
    targetUserId: 'user-parent-01',
    targetUserName: 'Lalthanzuala Sailo (Parent)',
    recipientRole: 'parent',
    senderId: 'attendance-desk',
    publishedBy: 'Campus Gate Security',
    publishedAt: '2026-09-19T08:45:00Z',
    isPinned: false,
    channels: { inApp: true, whatsapp: true, push: true, sms: true },
    readBy: []
  },
  {
    id: 'pvt-prt-002',
    scope: 'private',
    title: 'Fee Payment Notice: Term 2 Tuition Fee Due Reminder',
    content: 'Dear Guardian of Lalrinsanga Sailo, your 2nd Term tuition fee balance of ₹20,000 is due on 2026-09-24. You may clear it securely via the Student & Parent Portal.',
    category: 'fee',
    priority: 'urgent',
    targetAudience: 'individual',
    targetUserId: 'user-parent-01',
    targetUserName: 'Lalthanzuala Sailo (Parent)',
    recipientRole: 'parent',
    senderId: 'stf-004',
    publishedBy: 'R. Laltluanga (Chief Accounts Officer)',
    publishedAt: '2026-09-19T09:00:00Z',
    isPinned: true,
    channels: { inApp: true, whatsapp: true, push: true, sms: true },
    readBy: []
  },

  // STUDENT SPECIFIC DIRECT ALERTS
  {
    id: 'pvt-stu-001',
    scope: 'private',
    title: 'Library Return Reminder: "Concept of Physics Vol. 1" Due in 2 Days',
    content: 'Dear Lalrinsanga, your borrowed library book (Accession #PH-2024-089) is due on 2026-09-23. Return it at the library counter to avoid overdue fines.',
    category: 'academic',
    priority: 'normal',
    targetAudience: 'individual',
    targetUserId: 'user-student-01',
    targetUserName: 'Lalrinsanga Sailo (Student)',
    recipientRole: 'student',
    senderId: 'library-desk',
    publishedBy: 'Pi Zonunmawii (School Librarian)',
    publishedAt: '2026-09-19T10:00:00Z',
    isPinned: false,
    channels: { inApp: true, whatsapp: false, push: true, sms: false },
    readBy: []
  },
  {
    id: 'pvt-stu-002',
    scope: 'private',
    title: 'Class Leader Duty: Morning Assembly Discipline & Order',
    content: 'Lalrinsanga Sailo, as Class Leader of Class 12 Science, please ensure your class forms lines punctually at 08:50 AM on the Assembly Grounds.',
    category: 'academic',
    priority: 'normal',
    targetAudience: 'individual',
    targetUserId: 'user-student-01',
    targetUserName: 'Lalrinsanga Sailo (Student)',
    recipientRole: 'student',
    senderId: 'stf-002',
    publishedBy: 'Lalthlamuana Sailo (Class Teacher)',
    publishedAt: '2026-09-19T08:15:00Z',
    isPinned: false,
    channels: { inApp: true, whatsapp: false, push: true, sms: false },
    readBy: []
  },

  // PRINCIPAL SPECIFIC DIRECT ALERTS
  {
    id: 'pvt-adm-001',
    scope: 'private',
    title: 'Institutional Alert: New Walk-In Admission Registered with Instant Fee Receipt',
    content: 'Rev. Dr. L. H. Rohmingliana, a walk-in admission for Malsawmtluanga Sailo (Class 11 Science) was recorded at the admission counter with ₹12,000 fee payment.',
    category: 'administrative',
    priority: 'normal',
    targetAudience: 'individual',
    targetUserId: 'user-principal-01',
    targetUserName: 'Rev. Dr. L. H. Rohmingliana (Principal)',
    recipientRole: 'principal',
    senderId: 'stf-004',
    publishedBy: 'Pu R. Laltluanga (Chief Cashier)',
    publishedAt: '2026-09-19T15:30:00Z',
    isPinned: false,
    channels: { inApp: true, whatsapp: false, push: true, sms: false },
    readBy: []
  }
];

// INSTITUTIONAL ACTIONABLE TASKS & TO-DO DIRECTIVES
export const INITIAL_TASKS = [
  // Principal / Admin Tasks
  {
    id: 'tsk-adm-001',
    title: 'Review & Verify Class 11 Science Online Admission Dossiers',
    description: 'Scrutinize MBSE marksheet, transfer certificate, and eligibility percentage for pending candidate submissions.',
    assignedToRole: 'principal',
    assignedToUserId: 'user-principal-01',
    assignedBy: 'Admission Desk',
    dueDate: '2026-09-22',
    priority: 'urgent',
    status: 'pending',
    category: 'administrative',
    actionLinkTab: 'admissions',
    actionLabel: 'Review Admissions',
    createdAt: '2026-09-19T09:00:00Z',
    completedAt: null
  },
  {
    id: 'tsk-adm-002',
    title: 'Sanction Sibling Fee Concessions & Special Category Applications',
    description: 'Finalize sibling discount quota and approve Principal Special Category scholarship applications.',
    assignedToRole: 'principal',
    assignedToUserId: 'user-principal-01',
    assignedBy: 'Accounts Cell',
    dueDate: '2026-09-24',
    priority: 'high',
    status: 'pending',
    category: 'fee',
    actionLinkTab: 'students',
    actionLabel: 'Concession Desk',
    createdAt: '2026-09-19T10:30:00Z',
    completedAt: null
  },
  {
    id: 'tsk-adm-003',
    title: 'Approve Annual Teaching Staff Pay Scale Increments',
    description: 'Review Level 10 and Level 12 pay scale DA & Special Allowance revisions for senior educators.',
    assignedToRole: 'principal',
    assignedToUserId: 'user-principal-01',
    assignedBy: 'Governing Board',
    dueDate: '2026-09-26',
    priority: 'normal',
    status: 'completed',
    category: 'administrative',
    actionLinkTab: 'staff_payroll',
    actionLabel: 'Open Payroll',
    createdAt: '2026-09-18T11:00:00Z',
    completedAt: '2026-09-19T15:00:00Z'
  },

  // Vice Principal Tasks
  {
    id: 'tsk-vp-001',
    title: 'Sanction Special Proctored Online Examination Requisitions',
    description: 'Scrutinize medical doctor certificate and sanction webcam-proctored room for Class 10/12 candidates on leave.',
    assignedToRole: 'vice_principal',
    assignedToUserId: 'user-vp-01',
    assignedBy: 'Examination Committee',
    dueDate: '2026-09-21',
    priority: 'urgent',
    status: 'pending',
    category: 'academic',
    actionLinkTab: 'academics',
    actionLabel: 'Sanction Exams',
    createdAt: '2026-09-19T08:00:00Z',
    completedAt: null
  },
  {
    id: 'tsk-vp-002',
    title: 'Endorse Student Extended Medical Leave Applications',
    description: 'Review Class Master recommendations and forward approved leave certificates to Principal desk.',
    assignedToRole: 'vice_principal',
    assignedToUserId: 'user-vp-01',
    assignedBy: 'Class Master Council',
    dueDate: '2026-09-23',
    priority: 'high',
    status: 'pending',
    category: 'administrative',
    actionLinkTab: 'students',
    actionLabel: 'Review Leaves',
    createdAt: '2026-09-19T11:45:00Z',
    completedAt: null
  },
  {
    id: 'tsk-vp-003',
    title: 'Inspect Higher Secondary MBSE Board Practical Laboratories',
    description: 'Verify chemistry reagents, physics apparatus calibration, and safety fire extinguishers.',
    assignedToRole: 'vice_principal',
    assignedToUserId: 'user-vp-01',
    assignedBy: 'Academic Council',
    dueDate: '2026-09-25',
    priority: 'normal',
    status: 'pending',
    category: 'academic',
    actionLinkTab: 'academics',
    actionLabel: 'Lab Inspection',
    createdAt: '2026-09-18T14:20:00Z',
    completedAt: null
  },

  // Teacher Tasks
  {
    id: 'tsk-tch-001',
    title: 'Lock Term 1 Physics Practical Internal Scores on MBSE Portal',
    description: 'Enter experiments viva and laboratory record marks for all students of Class 12 Science.',
    assignedToRole: 'teacher',
    assignedToUserId: 'user-teacher-01',
    assignedBy: 'Vice Principal (Academics)',
    dueDate: '2026-09-22',
    priority: 'urgent',
    status: 'pending',
    category: 'academic',
    actionLinkTab: 'academics',
    actionLabel: 'Enter Grades',
    createdAt: '2026-09-19T09:15:00Z',
    completedAt: null
  },
  {
    id: 'tsk-tch-002',
    title: 'Launch Live Classroom Stream for Home-Quarantined Students',
    description: 'Host Chapter 4: Electromagnetic Waves video lecture with interactive whiteboard and digital notes.',
    assignedToRole: 'teacher',
    assignedToUserId: 'user-teacher-01',
    assignedBy: 'Academic Dean',
    dueDate: '2026-09-21',
    priority: 'high',
    status: 'pending',
    category: 'academic',
    actionLinkTab: 'academics',
    actionLabel: 'Start Live Class',
    createdAt: '2026-09-19T12:00:00Z',
    completedAt: null
  },
  {
    id: 'tsk-tch-003',
    title: 'Review Medical Leave Application for Lalpekhlua Hmar (Roll #05)',
    description: 'Verify parent doctor prescription note and enter Class Master recommendation remarks.',
    assignedToRole: 'teacher',
    assignedToUserId: 'user-teacher-01',
    assignedBy: 'Parent (H. Lalthanpuia)',
    dueDate: '2026-09-23',
    priority: 'high',
    status: 'completed',
    category: 'administrative',
    actionLinkTab: 'students',
    actionLabel: 'Review Leave',
    createdAt: '2026-09-18T10:00:00Z',
    completedAt: '2026-09-19T14:30:00Z'
  },
  {
    id: 'tsk-tch-004',
    title: 'Submit Weekly Class 12 Attendance & Disciplinary Summary',
    description: 'Compile monthly attendance percentages and list chronic absentees for Principal briefing.',
    assignedToRole: 'teacher',
    assignedToUserId: 'user-teacher-01',
    assignedBy: 'Principal Office',
    dueDate: '2026-09-25',
    priority: 'normal',
    status: 'pending',
    category: 'academic',
    actionLinkTab: 'attendance',
    actionLabel: 'View Attendance',
    createdAt: '2026-09-19T14:00:00Z',
    completedAt: null
  },

  // Warden Tasks
  {
    id: 'tsk-wdn-001',
    title: 'Approve Weekend Family Outing Gate Passes (3 Applications Pending)',
    description: 'Verify parent telephone confirmation and authorize gate exit passes for Sabbath family visits.',
    assignedToRole: 'warden',
    assignedToUserId: 'user-warden-01',
    assignedBy: 'Hostel Committee',
    dueDate: '2026-09-21',
    priority: 'urgent',
    status: 'pending',
    category: 'hostel',
    actionLinkTab: 'hostel',
    actionLabel: 'Manage Passes',
    createdAt: '2026-09-19T07:30:00Z',
    completedAt: null
  },
  {
    id: 'tsk-wdn-002',
    title: 'Conduct Daily 8:00 PM Night Roll Call in Boys & Girls Dormitory',
    description: 'Take biometric and signature roll call across all rooms and log absent boarders immediately.',
    assignedToRole: 'warden',
    assignedToUserId: 'user-warden-01',
    assignedBy: 'Residential Board',
    dueDate: '2026-09-20',
    priority: 'urgent',
    status: 'pending',
    category: 'hostel',
    actionLinkTab: 'hostel',
    actionLabel: 'Start Roll Call',
    createdAt: '2026-09-19T17:00:00Z',
    completedAt: null
  },
  {
    id: 'tsk-wdn-003',
    title: 'Inspect Dormitory Rooms for Unapproved Electrical Appliances',
    description: 'Conduct surprise check for immersion heaters, electric stoves, and ensure smoke detectors are active.',
    assignedToRole: 'warden',
    assignedToUserId: 'user-warden-01',
    assignedBy: 'Campus Safety Council',
    dueDate: '2026-09-24',
    priority: 'normal',
    status: 'pending',
    category: 'hostel',
    actionLinkTab: 'hostel',
    actionLabel: 'Hostel Rules',
    createdAt: '2026-09-19T13:00:00Z',
    completedAt: null
  },
  {
    id: 'tsk-wdn-004',
    title: 'Verify Saturday Special Feast Mess Menu Stock & Procurement',
    description: 'Ensure fresh pork, country chicken, and vegetables supplied from Dawrpui market.',
    assignedToRole: 'warden',
    assignedToUserId: 'user-warden-01',
    assignedBy: 'Mess Committee',
    dueDate: '2026-09-23',
    priority: 'normal',
    status: 'completed',
    category: 'hostel',
    actionLinkTab: 'hostel',
    actionLabel: 'View Mess Menu',
    createdAt: '2026-09-18T16:00:00Z',
    completedAt: '2026-09-19T11:00:00Z'
  },

  // Parent Tasks
  {
    id: 'tsk-prt-001',
    title: 'Pay Term 2 Pending Tuition Fee Balance (₹20,000)',
    description: 'Tuition and laboratory maintenance fee for Class 12 Science. Pay online via portal or school counter.',
    assignedToRole: 'parent',
    assignedToUserId: 'user-parent-01',
    assignedBy: 'Chief Accounts Officer',
    dueDate: '2026-09-24',
    priority: 'urgent',
    status: 'pending',
    category: 'fee',
    actionLinkTab: 'portal',
    actionLabel: 'Pay Fee Online',
    createdAt: '2026-09-19T08:45:00Z',
    completedAt: null
  },
  {
    id: 'tsk-prt-002',
    title: 'E-Sign & Acknowledge Term 1 Student Progress Report Card',
    description: 'Review student marks in Physics, Chemistry, and Math. Provide parent feedback comment.',
    assignedToRole: 'parent',
    assignedToUserId: 'user-parent-01',
    assignedBy: 'Class Master',
    dueDate: '2026-09-25',
    priority: 'high',
    status: 'pending',
    category: 'academic',
    actionLinkTab: 'portal',
    actionLabel: 'Sign Report Card',
    createdAt: '2026-09-19T10:00:00Z',
    completedAt: null
  },
  {
    id: 'tsk-prt-003',
    title: 'Confirm Weekend Day Outing Pickup Guardian Details',
    description: 'Submit guardian name and contact phone for authorized exit gate verification with hostel warden.',
    assignedToRole: 'parent',
    assignedToUserId: 'user-parent-01',
    assignedBy: 'Chief Warden',
    dueDate: '2026-09-21',
    priority: 'normal',
    status: 'completed',
    category: 'hostel',
    actionLinkTab: 'portal',
    actionLabel: 'Gate Pass Status',
    createdAt: '2026-09-18T18:00:00Z',
    completedAt: '2026-09-19T09:30:00Z'
  },

  // Student Tasks
  {
    id: 'tsk-stu-001',
    title: 'Submit Chemistry Electrochemistry Laboratory Record Book',
    description: 'Complete Galvanic cell potential graphs and teacher verification signature by Tuesday 4:00 PM.',
    assignedToRole: 'student',
    assignedToUserId: 'user-student-01',
    assignedBy: 'Prof. J. Lalramenga',
    dueDate: '2026-09-22',
    priority: 'urgent',
    status: 'pending',
    category: 'academic',
    actionLinkTab: 'portal',
    actionLabel: 'Open Assignments',
    createdAt: '2026-09-19T11:00:00Z',
    completedAt: null
  },
  {
    id: 'tsk-stu-002',
    title: 'Return "Advanced Level Physics (Vol. 1)" to School Library',
    description: 'Book issued on 2026-09-08 is due for return. Return at library counter to avoid overdue fines.',
    assignedToRole: 'student',
    assignedToUserId: 'user-student-01',
    assignedBy: 'School Librarian',
    dueDate: '2026-09-23',
    priority: 'high',
    status: 'pending',
    category: 'academic',
    actionLinkTab: 'library',
    actionLabel: 'Library Portal',
    createdAt: '2026-09-19T10:00:00Z',
    completedAt: null
  },
  {
    id: 'tsk-stu-003',
    title: 'Class Leader Duty: Verify Afternoon Class Attendance Register',
    description: 'Check period 5 & 6 roll call register and report absentees to Class Master room S-601.',
    assignedToRole: 'student',
    assignedToUserId: 'user-student-01',
    assignedBy: 'Lalthlamuana Sailo (Class Master)',
    dueDate: '2026-09-21',
    priority: 'normal',
    status: 'pending',
    category: 'academic',
    actionLinkTab: 'portal',
    actionLabel: 'Class Leadership',
    createdAt: '2026-09-19T13:30:00Z',
    completedAt: null
  },
  {
    id: 'tsk-stu-004',
    title: 'Take Sample Online Proctored Video Mock Test',
    description: 'Test browser webcam and microphone compatibility for the upcoming special online examination.',
    assignedToRole: 'student',
    assignedToUserId: 'user-student-01',
    assignedBy: 'Examination Cell',
    dueDate: '2026-09-21',
    priority: 'normal',
    status: 'completed',
    category: 'academic',
    actionLinkTab: 'portal',
    actionLabel: 'Online Exam Room',
    createdAt: '2026-09-18T14:00:00Z',
    completedAt: '2026-09-19T16:00:00Z'
  }
];

export const INITIAL_ADMISSION_REQUIREMENTS = [
  {
    id: 'req-birth-cert',
    title: 'Birth Certificate (Govt. of Mizoram / Municipal)',
    category: 'identity',
    description: 'Official birth certificate issued by Local Registrar of Births & Deaths.',
    mandatory: true,
    targetStreams: 'all',
    allowedFormats: 'PDF, JPG, PNG (Max 5MB)'
  },
  {
    id: 'req-hslc-marksheet',
    title: 'MBSE HSLC / Previous Class Marksheet',
    category: 'academic',
    description: 'Official marksheet showing grade breakups and qualifying percentage.',
    mandatory: true,
    targetStreams: 'Class 1 to 12',
    allowedFormats: 'PDF, JPG, PNG (Max 5MB)'
  },
  {
    id: 'req-tc',
    title: 'Transfer Certificate (TC) from Previous Institution',
    category: 'academic',
    description: 'Original or countersigned TC from head of previous recognized institution.',
    mandatory: true,
    targetStreams: 'Class 1 to 12',
    allowedFormats: 'PDF (Max 5MB)'
  },
  {
    id: 'req-photo',
    title: 'Recent Passport Size Color Photograph',
    category: 'identity',
    description: 'Formal portrait photo for institutional ID card and student record.',
    mandatory: true,
    targetStreams: 'all',
    allowedFormats: 'JPG, PNG (Max 2MB)'
  },
  {
    id: 'req-aadhaar',
    title: 'Aadhaar Card / Student Identification Proof',
    category: 'identity',
    description: 'Government UIDAI Aadhaar copy for official board registration.',
    mandatory: false,
    targetStreams: 'all',
    allowedFormats: 'PDF, JPG (Max 5MB)'
  },
  {
    id: 'req-tribal-cert',
    title: 'ST / Tribal Certificate (Govt. of Mizoram)',
    category: 'reservation',
    description: 'Scheduled Tribe certificate issued by DC / SDO (Civil).',
    mandatory: false,
    targetStreams: 'all',
    allowedFormats: 'PDF, JPG (Max 5MB)'
  }
];

export const INITIAL_ADMISSIONS = [
  {
    id: 'adm-001',
    applicantName: 'Lalrinkimi Fanai',
    appliedClass: 'cls-11-sci',
    appliedStream: 'science',
    gender: 'Female',
    dob: '2009-03-14',
    bloodGroup: 'A+',
    parentName: 'F. Lalthanpuia',
    guardianOccupation: 'Govt. Teacher, School Education Dept.',
    contactPhone: '+91 98620 91823',
    email: 'fanai.family@gmail.com',
    address: 'Chaltlang South, Near Presbyterian Church, Aizawl',
    previousSchool: 'Government Mizo High School, Aizawl',
    marksPercentage: '92.4% (MBSE HSLC)',
    entryType: 'online',
    registeredBy: 'Applicant (Online Public Portal)',
    status: 'pending',
    submittedAt: '2026-09-17T11:20:00Z',
    remarks: 'Scored 98 in Mathematics & 94 in Science. Applying for Science stream with Physics, Chem, Maths, Bio.',
    documents: [
      {
        id: 'doc-01',
        title: 'MBSE HSLC Marksheet',
        category: 'academic',
        fileName: 'Lalrinkimi_Fanai_HSLC_Marksheet.pdf',
        fileSize: '1.4 MB',
        status: 'verified',
        uploadedAt: '2026-09-17T11:20:00Z',
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&auto=format&fit=crop&q=80'
      },
      {
        id: 'doc-02',
        title: 'Birth Certificate',
        category: 'identity',
        fileName: 'Birth_Certificate_Lalrinkimi.pdf',
        fileSize: '820 KB',
        status: 'verified',
        uploadedAt: '2026-09-17T11:20:00Z',
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&auto=format&fit=crop&q=80'
      },
      {
        id: 'doc-03',
        title: 'Transfer Certificate (TC)',
        category: 'academic',
        fileName: 'GMHS_TC_Scanned.pdf',
        fileSize: '950 KB',
        status: 'resubmission_requested',
        uploadedAt: '2026-09-17T11:20:00Z',
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&auto=format&fit=crop&q=80'
      },
      {
        id: 'doc-04',
        title: 'Passport Size Photo',
        category: 'identity',
        fileName: 'Lalrinkimi_Photo_Formal.jpg',
        fileSize: '420 KB',
        status: 'verified',
        uploadedAt: '2026-09-17T11:20:00Z',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
      }
    ],
    documentRequests: [
      {
        id: 'dreq-01',
        title: 'Original Transfer Certificate (TC)',
        message: 'A hmaa TC upload kha signature a fiah lo deuh va, Headmaster sign leh seal fiah zawk thlalak/scan rawn dah leh tur a ni e.',
        requestedBy: 'Dr. C. Lalremruata (Vice Principal)',
        requestedAt: '2026-09-18T14:30:00Z',
        status: 'pending'
      }
    ],
    auditLogs: [
      { action: 'Submitted via Online Portal', by: 'Applicant', timestamp: '2026-09-17 11:20 AM' },
      { action: 'TC Flagged for Resubmission', by: 'Dr. C. Lalremruata (VP)', timestamp: '2026-09-18 02:30 PM' }
    ]
  },
  {
    id: 'adm-002',
    applicantName: 'Malsawmdawngzuala',
    appliedClass: 'cls-11-arts',
    appliedStream: 'arts',
    gender: 'Male',
    dob: '2009-07-22',
    bloodGroup: 'B+',
    parentName: 'Zoramchhana',
    guardianOccupation: 'Advocate, Gauhati High Court Aizawl Bench',
    contactPhone: '+91 94361 77299',
    email: 'zoram.chhana@gmail.com',
    address: 'Khatla, Near High Court Guest House, Aizawl',
    previousSchool: 'St. Paul’s Higher Secondary School',
    marksPercentage: '86.0%',
    entryType: 'offline_walkin',
    registeredBy: 'School Admission Desk (Pu R. Laltluanga, Cashier)',
    status: 'approved',
    submittedAt: '2026-09-15T09:40:00Z',
    remarks: 'Approved by Principal. Allocated to Section A. Offline admission fees settled at school counter.',
    documents: [
      {
        id: 'doc-11',
        title: 'MBSE HSLC Marksheet',
        category: 'academic',
        fileName: 'Malsawma_Marksheet.pdf',
        fileSize: '1.8 MB',
        status: 'verified',
        uploadedAt: '2026-09-15T09:40:00Z',
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&auto=format&fit=crop&q=80'
      },
      {
        id: 'doc-12',
        title: 'Original Transfer Certificate',
        category: 'academic',
        fileName: 'StPauls_TC_Original.pdf',
        fileSize: '1.1 MB',
        status: 'verified',
        uploadedAt: '2026-09-15T09:40:00Z',
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&auto=format&fit=crop&q=80'
      }
    ],
    documentRequests: [],
    auditLogs: [
      { action: 'Offline Walk-In Form Submitted', by: 'Pu R. Laltluanga', timestamp: '2026-09-15 09:40 AM' },
      { action: 'Documents Verified & Approved', by: 'Rev. Dr. L.H. Rohmingliana (Principal)', timestamp: '2026-09-15 11:15 AM' }
    ]
  },
  {
    id: 'adm-003',
    applicantName: 'Baby Esther Lalduhsangi',
    appliedClass: 'cls-nursery',
    appliedStream: null,
    gender: 'Female',
    dob: '2023-01-15',
    bloodGroup: 'O+',
    parentName: 'Lalmuankima',
    guardianOccupation: 'Businessman, Millennium Centre Aizawl',
    contactPhone: '+91 98622 14500',
    email: 'muankima.esther@gmail.com',
    address: 'Mission Veng, Aizawl',
    previousSchool: 'First Time School Admission',
    marksPercentage: 'N/A',
    entryType: 'offline_walkin',
    registeredBy: 'School Admission Desk (Pi Zonunmawii)',
    status: 'pending',
    submittedAt: '2026-09-19T08:00:00Z',
    remarks: 'Birth certificate and all primary immunization vaccination records verified at counter.',
    documents: [
      {
        id: 'doc-21',
        title: 'Birth Certificate',
        category: 'identity',
        fileName: 'Esther_Birth_Cert.pdf',
        fileSize: '950 KB',
        status: 'verified',
        uploadedAt: '2026-09-19T08:00:00Z',
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&auto=format&fit=crop&q=80'
      },
      {
        id: 'doc-22',
        title: 'Immunization Vaccination Record',
        category: 'health',
        fileName: 'Vaccination_Card_GovtHospital.pdf',
        fileSize: '1.2 MB',
        status: 'verified',
        uploadedAt: '2026-09-19T08:00:00Z',
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&auto=format&fit=crop&q=80'
      }
    ],
    documentRequests: [],
    auditLogs: [
      { action: 'Offline Walk-In Registration Recorded', by: 'Pi Zonunmawii', timestamp: '2026-09-19 08:00 AM' }
    ]
  }
];

export const INITIAL_TRANSPORT_ROUTES = [
  {
    id: 'route-1',
    routeName: 'Route 1: Lunglei Bazar - Venglai - Rahsi Veng - OHA Lunglawn',
    vehicleNo: 'MZ-02-A-3104 (Tata Starbus 32-Seater)',
    driverName: 'Pu Lalrintluanga',
    driverPhone: '+91 94361 90871',
    pickupPoints: ['Lunglei Super Market', 'Venglai Kawn', 'Rahsi Veng Junction', 'Electric Veng', 'OHA Lunglawn Campus'],
    monthlyFee: 1600,
    enrolledStudents: ['stu-101', 'stu-104']
  },
  {
    id: 'route-2',
    routeName: 'Route 2: Chanmari - Farm Veng - Sethlun - OHA Lunglawn',
    vehicleNo: 'MZ-02-B-1108 (Mahindra Cruiser 24-Seater)',
    driverName: 'Pu K. Lalthazuala',
    driverPhone: '+91 98624 81765',
    pickupPoints: ['Chanmari Kawn', 'Farm Veng Point', 'Sethlun Road', 'OHA Lunglawn Gate'],
    monthlyFee: 1700,
    enrolledStudents: ['stu-102', 'stu-106']
  },
  {
    id: 'route-3',
    routeName: 'Route 3: Hrangchalkawn - Theiriat - College Veng - OHA Lunglawn',
    vehicleNo: 'MZ-02-C-7734 (Force Traveller 20-Seater)',
    driverName: 'Pu R. Lalbiakmawia',
    driverPhone: '+91 97741 22904',
    pickupPoints: ['Hrangchalkawn Junction', 'Theiriat Mual', 'Lunglei Govt College Gate', 'OHA Lunglawn Campus'],
    monthlyFee: 1800,
    enrolledStudents: ['stu-105']
  }
];

export const INITIAL_HOSTEL_ROOMS = [
  {
    id: 'room-101',
    buildingName: 'OHA Boys Boarding (Lunglawn Block A)',
    roomNumber: 'A-101',
    floor: '1st Floor',
    capacity: 4,
    occupiedBeds: 2,
    wardenName: 'Pu K. Vanlalhruaia',
    wardenPhone: '+91 98623 77112',
    monthlyFee: 5500,
    enrolledStudents: ['stu-101', 'stu-104'],
    beds: [
      { bedNumber: 'Bed-1', studentId: 'stu-101', studentName: 'Lalrinsanga Sailo', class: 'Class 12 - Sci' },
      { bedNumber: 'Bed-2', studentId: 'stu-104', studentName: 'C. Zothanpuia', class: 'Class 11 - Sci' },
      { bedNumber: 'Bed-3', studentId: null, studentName: null, class: null },
      { bedNumber: 'Bed-4', studentId: null, studentName: null, class: null }
    ]
  },
  {
    id: 'room-102',
    buildingName: 'Lushai Boys Hostel (Block A)',
    roomNumber: 'A-102',
    floor: '1st Floor',
    capacity: 4,
    occupiedBeds: 1,
    wardenName: 'Pu K. Vanlalhruaia',
    wardenPhone: '+91 98623 77112',
    monthlyFee: 5500,
    enrolledStudents: ['stu-102'],
    beds: [
      { bedNumber: 'Bed-1', studentId: 'stu-102', studentName: 'Vanlalpeka Ralte', class: 'Class 12 - Sci' },
      { bedNumber: 'Bed-2', studentId: null, studentName: null, class: null },
      { bedNumber: 'Bed-3', studentId: null, studentName: null, class: null },
      { bedNumber: 'Bed-4', studentId: null, studentName: null, class: null }
    ]
  },
  {
    id: 'room-201',
    buildingName: 'Chhimhe Girls Hostel (Block B)',
    roomNumber: 'B-201',
    floor: '2nd Floor',
    capacity: 4,
    occupiedBeds: 2,
    wardenName: 'Pi Lalrammawii (Matron)',
    wardenPhone: '+91 98625 90123',
    monthlyFee: 5500,
    enrolledStudents: ['stu-103', 'stu-105'],
    beds: [
      { bedNumber: 'Bed-1', studentId: 'stu-103', studentName: 'Lalremruati Hmar', class: 'Class 12 - Arts' },
      { bedNumber: 'Bed-2', studentId: 'stu-105', studentName: 'Jenny Malsawmdawngi', class: 'Class 11 - Comm' },
      { bedNumber: 'Bed-3', studentId: null, studentName: null, class: null },
      { bedNumber: 'Bed-4', studentId: null, studentName: null, class: null }
    ]
  },
  {
    id: 'room-202',
    buildingName: 'Chhimhe Girls Hostel (Block B)',
    roomNumber: 'B-202',
    floor: '2nd Floor',
    capacity: 4,
    occupiedBeds: 0,
    wardenName: 'Pi Lalrammawii (Matron)',
    wardenPhone: '+91 98625 90123',
    monthlyFee: 5500,
    enrolledStudents: [],
    beds: [
      { bedNumber: 'Bed-1', studentId: null, studentName: null, class: null },
      { bedNumber: 'Bed-2', studentId: null, studentName: null, class: null },
      { bedNumber: 'Bed-3', studentId: null, studentName: null, class: null },
      { bedNumber: 'Bed-4', studentId: null, studentName: null, class: null }
    ]
  }
];

export const INITIAL_HOSTEL_GATE_PASSES = [
  {
    id: 'gp-2026-001',
    studentId: 'stu-101',
    studentName: 'Lalrinsanga Sailo',
    hostelBuilding: 'Lushai Boys Hostel (Block A)',
    roomNumber: 'A-101',
    destination: 'Civil Hospital / Pharmacy, Aizawl',
    purpose: 'Doctor follow-up appointment & medicine refill',
    departureTime: '15:30',
    expectedReturnTime: '18:00',
    actualReturnTime: '17:45',
    guardianContact: '+91 98623 45671 (Parent confirmed)',
    status: 'returned', // 'pending' | 'approved' | 'checked_out' | 'returned' | 'late'
    date: '2026-09-19',
    issuedBy: 'Pu K. Vanlalhruaia (Warden)'
  },
  {
    id: 'gp-2026-002',
    studentId: 'stu-103',
    studentName: 'Lalremruati Hmar',
    hostelBuilding: 'Chhimhe Girls Hostel (Block B)',
    roomNumber: 'B-201',
    destination: 'Bawngkawn, Aizawl (Home Weekend)',
    purpose: 'Weekend home visit with parent approval letter',
    departureTime: '16:00',
    expectedReturnTime: '17:00 (Sunday)',
    actualReturnTime: null,
    guardianContact: '+91 94361 22910',
    status: 'checked_out',
    date: '2026-09-19',
    issuedBy: 'Pi Lalrammawii (Matron)'
  },
  {
    id: 'gp-2026-003',
    studentId: 'stu-104',
    studentName: 'C. Zothanpuia',
    hostelBuilding: 'Lushai Boys Hostel (Block A)',
    roomNumber: 'A-101',
    destination: 'Millennium Centre Market',
    purpose: 'Purchase academic project materials & stationery',
    departureTime: '16:30',
    expectedReturnTime: '18:30',
    actualReturnTime: null,
    guardianContact: '+91 98621 11200',
    status: 'approved',
    date: '2026-09-20',
    issuedBy: 'Pu K. Vanlalhruaia (Warden)'
  }
];

export const INITIAL_HOSTEL_ROLL_CALLS = [
  {
    id: 'rc-2026-09-19',
    date: '2026-09-19',
    curfewTime: '20:00 (8:00 PM)',
    wardenName: 'Pu K. Vanlalhruaia',
    records: [
      { studentId: 'stu-101', studentName: 'Lalrinsanga Sailo', room: 'A-101', status: 'present', remarks: 'In dormitory room' },
      { studentId: 'stu-102', studentName: 'Vanlalpeka Ralte', room: 'A-102', status: 'present', remarks: 'Attended night prayer' },
      { studentId: 'stu-103', studentName: 'Lalremruati Hmar', room: 'B-201', status: 'approved_leave', remarks: 'Home weekend visit (GP-002)' },
      { studentId: 'stu-104', studentName: 'C. Zothanpuia', room: 'A-101', status: 'present', remarks: 'Study hour verified' },
      { studentId: 'stu-105', studentName: 'Jenny Malsawmdawngi', room: 'B-201', status: 'present', remarks: 'In dormitory room' }
    ]
  }
];

export const INITIAL_HOSTEL_MESS_MENU = {
  Monday: {
    breakfast: 'Thingpui Sen / Duhlian Tea + Chhangban / Toast with Butter',
    lunch: 'Buhfai Rice, Dal Tadka, Antam Hnah Hmui Bai, Alu Chana',
    snacks: 'Thingpui + Biscuit / Alu Chop',
    dinner: 'Buhfai Rice, Vawksa / Arsa Chhum (Pork/Chicken Stew), Iskut Bai, Chawhmeh Raw'
  },
  Tuesday: {
    breakfast: 'Sawhchiar (Traditional Mizo Rice Porridge) + Thingpui',
    lunch: 'Rice, Maian Bai (Pumpkin Vine Stew), Chana Dal, Tomato Chutney',
    snacks: 'Thingpui + Veg Samosa',
    dinner: 'Rice, Sangha / Fish Curry, Bean Bai, Hmarcha Rawt'
  },
  Wednesday: {
    breakfast: 'Boiled Eggs (2 nos) + Bread Butter + Milk Tea',
    lunch: 'Rice, Rajma Dal, Bawkbawn (Brinjal) Bai, Aloo Jeera',
    snacks: 'Thingpui + Banana Cake',
    dinner: 'Rice, Arsa / Chicken Curry with Potatoes, Hnah Bai, Salad'
  },
  Thursday: {
    breakfast: 'Alu Paratha with Curd & Pickle + Thingpui',
    lunch: 'Rice, Yellow Moong Dal, Hmarcha Rawt, Rep Chhum Bai',
    snacks: 'Thingpui + Suji Halwa',
    dinner: 'Rice, Vawklak / Pork Gravy, Behhlawi Bai, Fresh Cucumber'
  },
  Friday: {
    breakfast: 'Chana Masala + Puri + Thingpui',
    lunch: 'Rice, Dal Fry, Mai (Pumpkin) Bai, Papad, Salad',
    snacks: 'Thingpui + Chhang Thlum',
    dinner: 'Special Feast: Buhfai Rice, Mizo Arsa (Country Chicken), Dinthar Bai, Kuthria'
  },
  Saturday: {
    breakfast: 'Sawhchiar with Meat Soup + Boiled Egg + Tea',
    lunch: 'Rice, Dal Makhani, Mixed Vegetable Bai, Aloo Dum',
    snacks: 'Thingpui + Pakora',
    dinner: 'Rice, Egg Curry (2 eggs), Rawtuai (Bamboo Shoot) Bai, Chutney'
  },
  Sunday: {
    breakfast: 'Chapel Tea + Special Sweet Bun / Butter Bun',
    lunch: 'Sabbath Special: Rice, Dal, Antam Bai, Boiled Meat, Hmarcha',
    snacks: 'Evening Tea + Biscuits',
    dinner: 'Rice, Arsa Tui Hang (Chicken Stew), Maian Chhum, Fresh Veggies'
  }
};

export const INITIAL_HOSTEL_RULES = [
  {
    id: 'rule-1',
    category: 'Curfew & Gate Timings',
    title: 'Hostel Main Gate Curfew',
    description: 'Hostel main gate hi tlai dar 6:00 PM-ah khar tlat tur a ni a, Warden phalna (Approved Gate Pass) nei lo tan chhuah emaw luh phal a ni lo.',
    penalty: 'Warning letter & Warden hearing'
  },
  {
    id: 'rule-2',
    category: 'Study Hours',
    title: 'Compulsory Night Study (Lehkha Zir Hun)',
    description: 'Zan dar 7:00 PM atanga 10:00 PM inkar hi Study Hour a ni a, bengchheng siam, room danga vah kual, leh mobile phone hman phal a ni lo.',
    penalty: 'Device confiscation for 1 week'
  },
  {
    id: 'rule-3',
    category: 'Night Roll Call',
    title: 'Daily Night Roll Call Attendance',
    description: 'Zan tin dar 8:00 PM-ah Warden-in dormitory roll-call a nei ziah ang. Zirlai zawng zawng mahni room leh khumah an awm ngei tur a ni.',
    penalty: 'Immediate phone call to Guardian'
  },
  {
    id: 'rule-4',
    category: 'Electrical & Cleanliness',
    title: 'Room Sanitization & Appliance Ban',
    description: 'Electric heater, immersion rod, leh gas stove hman phal a ni lo. Inrinni tuk tin room inspection a awm ziah ang.',
    penalty: 'Confiscation & ₹500 maintenance fine'
  }
];


export const DEFAULT_USERS = [
  {
    uid: 'user-principal-01',
    email: 'principal@mizoramschool.edu',
    displayName: 'Rev. Dr. L. H. Rohmingliana',
    role: 'principal',
    phone: '+91 94361 40001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  },
  {
    uid: 'user-teacher-01',
    email: 'teacher@mizoramschool.edu',
    displayName: 'Lalthlamuana Sailo (Teacher)',
    role: 'teacher',
    phone: '+91 98623 88124',
    classId: 'cls-12-sci',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
  },
  {
    uid: 'user-student-01',
    email: 'student@mizoramschool.edu',
    displayName: 'Lalrinsanga Sailo',
    role: 'student',
    studentId: 'stu-101',
    classId: 'cls-12-sci',
    phone: '+91 98623 45671',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80'
  },
  {
    uid: 'user-parent-01',
    email: 'parent@mizoramschool.edu',
    displayName: 'Lalthanzuala Sailo (Parent)',
    role: 'parent',
    wardStudentId: 'stu-101',
    phone: '+91 98623 45671',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'
  },
  {
    uid: 'user-dev-01',
    email: 'developer@mizoramschool.edu',
    displayName: 'Zoxs System Architect',
    role: 'superadmin',
    phone: '+91 94361 99999',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
  },
  {
    uid: 'user-vp-01',
    email: 'viceprincipal@mizoramschool.edu',
    displayName: 'Pi Mary Lalnunpuii (Vice Principal)',
    role: 'vice_principal',
    phone: '+91 94361 40002',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'
  },
  {
    uid: 'user-warden-01',
    email: 'warden@mizoramschool.edu',
    displayName: 'Pu K. Vanlalhruaia (Chief Warden)',
    role: 'warden',
    hostelBuilding: 'Lushai Boys Hostel',
    phone: '+91 98623 77112',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_TIMETABLES = {
  'cls-12-sci': {
    Monday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Physics', teacher: 'Lalthlamuana Sailo', room: 'S-601' },
      { period: 2, time: '09:45 - 10:30', subject: 'Chemistry', teacher: 'Prof. J. Lalramenga', room: 'S-601' },
      { period: 3, time: '10:30 - 11:15', subject: 'Mathematics', teacher: 'V. Laltanpuia', room: 'S-601' },
      { period: 4, time: '11:45 - 12:30', subject: 'Biology / CS', teacher: 'Zothanpuii', room: 'Lab 1' },
      { period: 5, time: '12:30 - 01:15', subject: 'English Core', teacher: 'Ruth Lalrinsangi', room: 'S-601' },
      { period: 6, time: '01:15 - 02:00', subject: 'Mizo (MIL)', teacher: 'David Lalnunmawia', room: 'S-601' },
      { period: 7, time: '02:00 - 02:45', subject: 'Physics Practical Lab', teacher: 'Lalthlamuana Sailo', room: 'Phys Lab' }
    ],
    Tuesday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Chemistry', teacher: 'Prof. J. Lalramenga', room: 'S-601' },
      { period: 2, time: '09:45 - 10:30', subject: 'Mathematics', teacher: 'V. Laltanpuia', room: 'S-601' },
      { period: 3, time: '10:30 - 11:15', subject: 'Physics', teacher: 'Lalthlamuana Sailo', room: 'S-601' },
      { period: 4, time: '11:45 - 12:30', subject: 'English Core', teacher: 'Ruth Lalrinsangi', room: 'S-601' },
      { period: 5, time: '12:30 - 01:15', subject: 'Biology / CS', teacher: 'Zothanpuii', room: 'Lab 1' },
      { period: 6, time: '01:15 - 02:00', subject: 'Mizo (MIL)', teacher: 'David Lalnunmawia', room: 'S-601' },
      { period: 7, time: '02:00 - 02:45', subject: 'Chemistry Lab', teacher: 'Prof. J. Lalramenga', room: 'Chem Lab' }
    ],
    Wednesday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Mathematics', teacher: 'V. Laltanpuia', room: 'S-601' },
      { period: 2, time: '09:45 - 10:30', subject: 'Physics', teacher: 'Lalthlamuana Sailo', room: 'S-601' },
      { period: 3, time: '10:30 - 11:15', subject: 'Chemistry', teacher: 'Prof. J. Lalramenga', room: 'S-601' },
      { period: 4, time: '11:45 - 12:30', subject: 'Biology / CS', teacher: 'Zothanpuii', room: 'Lab 1' },
      { period: 5, time: '12:30 - 01:15', subject: 'English Core', teacher: 'Ruth Lalrinsangi', room: 'S-601' },
      { period: 6, time: '01:15 - 02:00', subject: 'Mizo (MIL)', teacher: 'David Lalnunmawia', room: 'S-601' },
      { period: 7, time: '02:00 - 02:45', subject: 'Library / Remedial', teacher: 'Zonunmawii', room: 'Library' }
    ],
    Thursday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Physics', teacher: 'Lalthlamuana Sailo', room: 'S-601' },
      { period: 2, time: '09:45 - 10:30', subject: 'Chemistry', teacher: 'Prof. J. Lalramenga', room: 'S-601' },
      { period: 3, time: '10:30 - 11:15', subject: 'Mathematics', teacher: 'V. Laltanpuia', room: 'S-601' },
      { period: 4, time: '11:45 - 12:30', subject: 'Biology / CS', teacher: 'Zothanpuii', room: 'Lab 1' },
      { period: 5, time: '12:30 - 01:15', subject: 'English Core', teacher: 'Ruth Lalrinsangi', room: 'S-601' },
      { period: 6, time: '01:15 - 02:00', subject: 'Sports / Physical Ed', teacher: 'Sports Master', room: 'Ground' },
      { period: 7, time: '02:00 - 02:45', subject: 'Continuous Test Review', teacher: 'Lalthlamuana Sailo', room: 'S-601' }
    ],
    Friday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Mathematics', teacher: 'V. Laltanpuia', room: 'S-601' },
      { period: 2, time: '09:45 - 10:30', subject: 'English Core', teacher: 'Ruth Lalrinsangi', room: 'S-601' },
      { period: 3, time: '10:30 - 11:15', subject: 'Physics', teacher: 'Lalthlamuana Sailo', room: 'S-601' },
      { period: 4, time: '11:45 - 12:30', subject: 'Chemistry', teacher: 'Prof. J. Lalramenga', room: 'S-601' },
      { period: 5, time: '12:30 - 01:15', subject: 'Mizo (MIL)', teacher: 'David Lalnunmawia', room: 'S-601' },
      { period: 6, time: '01:15 - 02:00', subject: 'Biology / CS Lab', teacher: 'Zothanpuii', room: 'Bio Lab' },
      { period: 7, time: '02:00 - 02:45', subject: 'Chapel / Moral Ed', teacher: 'Rev. Dr. Rohmingliana', room: 'Hall' }
    ]
  },
  'cls-12-arts': {
    Monday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Political Science', teacher: 'R. Lalhmingmawii', room: 'A-602' },
      { period: 2, time: '09:45 - 10:30', subject: 'History', teacher: 'H. Laldinpuia', room: 'A-602' },
      { period: 3, time: '10:30 - 11:15', subject: 'Education', teacher: 'Zonunmawii', room: 'A-602' },
      { period: 4, time: '11:45 - 12:30', subject: 'Economics', teacher: 'V. Laltanpuia', room: 'A-602' },
      { period: 5, time: '12:30 - 01:15', subject: 'English Core', teacher: 'Ruth Lalrinsangi', room: 'A-602' },
      { period: 6, time: '01:15 - 02:00', subject: 'Mizo (Thu leh Hla)', teacher: 'David Lalnunmawia', room: 'A-602' },
      { period: 7, time: '02:00 - 02:45', subject: 'Sociology', teacher: 'R. Lalhmingmawii', room: 'A-602' }
    ],
    Tuesday: [
      { period: 1, time: '09:00 - 09:45', subject: 'History', teacher: 'H. Laldinpuia', room: 'A-602' },
      { period: 2, time: '09:45 - 10:30', subject: 'Political Science', teacher: 'R. Lalhmingmawii', room: 'A-602' },
      { period: 3, time: '10:30 - 11:15', subject: 'Economics', teacher: 'V. Laltanpuia', room: 'A-602' },
      { period: 4, time: '11:45 - 12:30', subject: 'Education', teacher: 'Zonunmawii', room: 'A-602' },
      { period: 5, time: '12:30 - 01:15', subject: 'English Core', teacher: 'Ruth Lalrinsangi', room: 'A-602' },
      { period: 6, time: '01:15 - 02:00', subject: 'Mizo (MIL)', teacher: 'David Lalnunmawia', room: 'A-602' },
      { period: 7, time: '02:00 - 02:45', subject: 'Debate / Seminar', teacher: 'Ruth Lalrinsangi', room: 'A-602' }
    ],
    Wednesday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Education', teacher: 'Zonunmawii', room: 'A-602' },
      { period: 2, time: '09:45 - 10:30', subject: 'Political Science', teacher: 'R. Lalhmingmawii', room: 'A-602' },
      { period: 3, time: '10:30 - 11:15', subject: 'History', teacher: 'H. Laldinpuia', room: 'A-602' },
      { period: 4, time: '11:45 - 12:30', subject: 'English Core', teacher: 'Ruth Lalrinsangi', room: 'A-602' },
      { period: 5, time: '12:30 - 01:15', subject: 'Economics', teacher: 'V. Laltanpuia', room: 'A-602' },
      { period: 6, time: '01:15 - 02:00', subject: 'Mizo', teacher: 'David Lalnunmawia', room: 'A-602' },
      { period: 7, time: '02:00 - 02:45', subject: 'Library Hour', teacher: 'Zonunmawii', room: 'Library' }
    ],
    Thursday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Political Science', teacher: 'R. Lalhmingmawii', room: 'A-602' },
      { period: 2, time: '09:45 - 10:30', subject: 'History', teacher: 'H. Laldinpuia', room: 'A-602' },
      { period: 3, time: '10:30 - 11:15', subject: 'Economics', teacher: 'V. Laltanpuia', room: 'A-602' },
      { period: 4, time: '11:45 - 12:30', subject: 'Education', teacher: 'Zonunmawii', room: 'A-602' },
      { period: 5, time: '12:30 - 01:15', subject: 'English', teacher: 'Ruth Lalrinsangi', room: 'A-602' },
      { period: 6, time: '01:15 - 02:00', subject: 'Sports', teacher: 'Sports Master', room: 'Ground' },
      { period: 7, time: '02:00 - 02:45', subject: 'Project Review', teacher: 'R. Lalhmingmawii', room: 'A-602' }
    ],
    Friday: [
      { period: 1, time: '09:00 - 09:45', subject: 'History', teacher: 'H. Laldinpuia', room: 'A-602' },
      { period: 2, time: '09:45 - 10:30', subject: 'English', teacher: 'Ruth Lalrinsangi', room: 'A-602' },
      { period: 3, time: '10:30 - 11:15', subject: 'Political Science', teacher: 'R. Lalhmingmawii', room: 'A-602' },
      { period: 4, time: '11:45 - 12:30', subject: 'Education', teacher: 'Zonunmawii', room: 'A-602' },
      { period: 5, time: '12:30 - 01:15', subject: 'Mizo', teacher: 'David Lalnunmawia', room: 'A-602' },
      { period: 6, time: '01:15 - 02:00', subject: 'Economics', teacher: 'V. Laltanpuia', room: 'A-602' },
      { period: 7, time: '02:00 - 02:45', subject: 'Chapel Service', teacher: 'Rev. Dr. Rohmingliana', room: 'Hall' }
    ]
  },
  'cls-10': {
    Monday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Mathematics', teacher: 'Dr. C. Zoramthanga', room: 'H-402' },
      { period: 2, time: '09:45 - 10:30', subject: 'General Science', teacher: 'Lalthlamuana Sailo', room: 'H-402' },
      { period: 3, time: '10:30 - 11:15', subject: 'Social Science', teacher: 'H. Laldinpuia', room: 'H-402' },
      { period: 4, time: '11:45 - 12:30', subject: 'English', teacher: 'Ruth Lalrinsangi', room: 'H-402' },
      { period: 5, time: '12:30 - 01:15', subject: 'Mizo (MIL)', teacher: 'David Lalnunmawia', room: 'H-402' },
      { period: 6, time: '01:15 - 02:00', subject: 'Hindi / Alt', teacher: 'Zonunmawii', room: 'H-402' },
      { period: 7, time: '02:00 - 02:45', subject: 'Board Prep Mock Quiz', teacher: 'Dr. C. Zoramthanga', room: 'H-402' }
    ],
    Tuesday: [
      { period: 1, time: '09:00 - 09:45', subject: 'General Science', teacher: 'Lalthlamuana Sailo', room: 'H-402' },
      { period: 2, time: '09:45 - 10:30', subject: 'Mathematics', teacher: 'Dr. C. Zoramthanga', room: 'H-402' },
      { period: 3, time: '10:30 - 11:15', subject: 'English', teacher: 'Ruth Lalrinsangi', room: 'H-402' },
      { period: 4, time: '11:45 - 12:30', subject: 'Social Science', teacher: 'H. Laldinpuia', room: 'H-402' },
      { period: 5, time: '12:30 - 01:15', subject: 'Mizo (MIL)', teacher: 'David Lalnunmawia', room: 'H-402' },
      { period: 6, time: '01:15 - 02:00', subject: 'Hindi', teacher: 'Zonunmawii', room: 'H-402' },
      { period: 7, time: '02:00 - 02:45', subject: 'Science Lab Practicals', teacher: 'Lalthlamuana Sailo', room: 'Lab' }
    ],
    Wednesday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Social Science', teacher: 'H. Laldinpuia', room: 'H-402' },
      { period: 2, time: '09:45 - 10:30', subject: 'Mathematics', teacher: 'Dr. C. Zoramthanga', room: 'H-402' },
      { period: 3, time: '10:30 - 11:15', subject: 'General Science', teacher: 'Lalthlamuana Sailo', room: 'H-402' },
      { period: 4, time: '11:45 - 12:30', subject: 'English', teacher: 'Ruth Lalrinsangi', room: 'H-402' },
      { period: 5, time: '12:30 - 01:15', subject: 'Mizo', teacher: 'David Lalnunmawia', room: 'H-402' },
      { period: 6, time: '01:15 - 02:00', subject: 'Work Education', teacher: 'Lalhmangaiha', room: 'H-402' },
      { period: 7, time: '02:00 - 02:45', subject: 'Library Reading', teacher: 'Zonunmawii', room: 'Library' }
    ],
    Thursday: [
      { period: 1, time: '09:00 - 09:45', subject: 'Mathematics', teacher: 'Dr. C. Zoramthanga', room: 'H-402' },
      { period: 2, time: '09:45 - 10:30', subject: 'General Science', teacher: 'Lalthlamuana Sailo', room: 'H-402' },
      { period: 3, time: '10:30 - 11:15', subject: 'Social Science', teacher: 'H. Laldinpuia', room: 'H-402' },
      { period: 4, time: '11:45 - 12:30', subject: 'English', teacher: 'Ruth Lalrinsangi', room: 'H-402' },
      { period: 5, time: '12:30 - 01:15', subject: 'Mizo', teacher: 'David Lalnunmawia', room: 'H-402' },
      { period: 6, time: '01:15 - 02:00', subject: 'Games & Sports', teacher: 'Sports Master', room: 'Ground' },
      { period: 7, time: '02:00 - 02:45', subject: 'Class Test Revision', teacher: 'Dr. C. Zoramthanga', room: 'H-402' }
    ],
    Friday: [
      { period: 1, time: '09:00 - 09:45', subject: 'English', teacher: 'Ruth Lalrinsangi', room: 'H-402' },
      { period: 2, time: '09:45 - 10:30', subject: 'Mathematics', teacher: 'Dr. C. Zoramthanga', room: 'H-402' },
      { period: 3, time: '10:30 - 11:15', subject: 'General Science', teacher: 'Lalthlamuana Sailo', room: 'H-402' },
      { period: 4, time: '11:45 - 12:30', subject: 'Social Science', teacher: 'H. Laldinpuia', room: 'H-402' },
      { period: 5, time: '12:30 - 01:15', subject: 'Hindi', teacher: 'Zonunmawii', room: 'H-402' },
      { period: 6, time: '01:15 - 02:00', subject: 'Mizo', teacher: 'David Lalnunmawia', room: 'H-402' },
      { period: 7, time: '02:00 - 02:45', subject: 'Chapel / Devotion', teacher: 'Rev. Dr. Rohmingliana', room: 'Hall' }
    ]
  }
};

export const INITIAL_SYSTEM_PLUGINS = [
  {
    id: 'plugin-canvas-confetti',
    name: 'Celebration Confetti & Effects',
    version: '1.9.4',
    enabled: true,
    category: 'UI & Animations',
    cdnUrl: 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.min.js',
    cdnCssUrl: '',
    loadTiming: 'async',
    scope: 'all',
    description: 'Triggers celebratory confetti bursts on fee clearance and report card approvals.',
    script: 'console.log("[Plugin Loaded] Celebration Confetti Engine Ready");',
    config: {
      particleCount: 120,
      spread: 75,
      originY: 0.6,
      soundEffectEnabled: true,
      colors: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b']
    }
  },
  {
    id: 'plugin-mbse-moderation',
    name: 'MBSE Continuous Assessment Moderation',
    version: '2.1.0',
    enabled: true,
    category: 'Academics',
    cdnUrl: '',
    cdnCssUrl: '',
    loadTiming: 'boot',
    scope: 'faculty',
    description: 'Auto-calculates 20% continuous test + 80% term exam weighting and generates MBSE grade letters (A1-E).',
    script: 'window.mbseModeration = { active: true, ratio: "20:80" }; console.log("[Plugin Loaded] MBSE Moderation active");',
    config: {
      continuousAssessmentRatio: 20,
      termExamRatio: 80,
      passingMarks: 33,
      graceMarksCap: 5,
      gradingScale: 'MBSE Standard A1-E'
    }
  },
  {
    id: 'plugin-sms-gateway',
    name: 'Mizoram SMS Gateway & WhatsApp Webhook',
    version: '1.4.2',
    enabled: true,
    category: 'Integrations',
    cdnUrl: '',
    cdnCssUrl: '',
    loadTiming: 'async',
    scope: 'admin',
    description: 'Dispatches real-time student absence alerts and fee reminder SMS to guardian mobile numbers.',
    script: 'window.smsGatewayReady = true; console.log("[Plugin Loaded] SMS Dispatcher ready");',
    config: {
      apiEndpoint: 'https://api.mizoramsms.gov.in/v2/dispatch',
      senderId: 'MZSMS',
      apiKey: 'mzs_live_99a8b7c6d5e4f3a2',
      defaultAbsenceTemplate: 'Zirlai {student_name} hi vawiin {date} khan Class {class_name}-ah a rawn kal lo e.',
      webhookSecret: 'whsec_99a87129bca'
    }
  },
  {
    id: 'plugin-matrix-glow',
    name: 'Cyberpunk Dark Matrix Theme Glow',
    version: '1.0.0',
    enabled: false,
    category: 'Themes',
    cdnUrl: '',
    cdnCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
    loadTiming: 'async',
    scope: 'all',
    description: 'Injects neon cyan/emerald matrix glow styling to all cards and navigation pills.',
    script: 'console.log("[Plugin Loaded] Matrix Theme Glow Engine loaded");',
    config: {
      glowColor: '#06b6d4',
      glowIntensity: 0.4,
      cardBorderGlow: true,
      enablePulsingAnimations: true
    }
  },
  {
    id: 'plugin-whatsapp-broadcast',
    name: 'WhatsApp Institutional Broadcast & Webhook',
    version: '2.4.0',
    enabled: true,
    category: 'Communication',
    cdnUrl: '',
    cdnCssUrl: '',
    loadTiming: 'async',
    scope: 'admin',
    description: 'Direct WhatsApp Meta Cloud API gateway for broadcast circulars, homework alerts, and emergency campus closures.',
    script: 'window.whatsappBroadcastReady = true; console.log("[Plugin Loaded] WhatsApp Broadcast Engine Active");',
    config: {
      metaPhoneNumberId: '109823485719200',
      apiVersion: 'v18.0',
      accessToken: 'EAAG_mizoram_meta_cloud_token_live',
      verifiedSenderNumber: '+91 94361 22000',
      defaultTemplateName: 'school_circular_alert',
      autoSendAbsenceAlert: true
    }
  },
  {
    id: 'plugin-browser-push',
    name: 'Web Push & Desktop Notification Engine',
    version: '1.8.0',
    enabled: true,
    category: 'Communication',
    cdnUrl: '',
    cdnCssUrl: '',
    loadTiming: 'async',
    scope: 'all',
    description: 'Delivers native desktop and mobile browser push notifications for urgent circulars and private direct messages.',
    script: 'window.pushNotificationsActive = true; console.log("[Plugin Loaded] Web Push Engine Initialized");',
    config: {
      vapidPublicKey: 'BEl62iUYg_Mizoram_School_VAPID_PublicKey_2026',
      autoPromptPermission: true,
      notificationIconUrl: '/favicon.ico',
      badgeIconUrl: '/badge.png'
    }
  },
  {
    id: 'plugin-campus-bell',
    name: 'Campus Audio Bell & Chime Broadcast',
    version: '1.2.0',
    enabled: true,
    category: 'Audio & Hardware',
    cdnUrl: '',
    cdnCssUrl: '',
    loadTiming: 'boot',
    scope: 'all',
    description: 'Web Audio API synthesized institutional chimes, period change bells, and emergency alarm broadcasting.',
    script: 'window.campusBellEngine = { playChime: () => { try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.setValueAtTime(587.33, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4); osc.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.6); } catch(e){} } };',
    config: {
      baseFrequency: 587.33,
      topFrequency: 880.0,
      waveType: 'sine',
      volumePercent: 85,
      durationSeconds: 0.8,
      chimeType: 'dual_tone_harmonic'
    }
  },
  {
    id: 'plugin-telegram-broadcast',
    name: 'Telegram Channel Broadcast & Sync',
    version: '1.1.5',
    enabled: true,
    category: 'Communication',
    cdnUrl: '',
    cdnCssUrl: '',
    loadTiming: 'async',
    scope: 'admin',
    description: 'Instantly broadcasts verified school notices and event photos to the official school public Telegram channel.',
    script: 'window.telegramBotSync = true; console.log("[Plugin Loaded] Telegram Sync ready");',
    config: {
      botToken: '7189201948:AAEk_mizoram_school_bot_token',
      channelUsername: '@mizoram_school_official',
      autoSyncNotices: true,
      includeAttachmentPreview: true
    }
  },
  {
    id: 'plugin-live-broadcast-streaming',
    name: 'Live Video Broadcast & RTMP/HLS Streaming Engine',
    version: '3.2.0',
    enabled: true,
    category: 'Communication',
    cdnUrl: 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js',
    cdnCssUrl: '',
    loadTiming: 'async',
    scope: 'all',
    description: 'Broadcasts low-latency HD live lectures via RTMP ingest with multi-bitrate HLS distribution, YouTube restreaming, and cloud DVR archiving.',
    script: 'window.liveStreamingEngine = { active: true, protocol: "RTMP/HLS", ready: true }; console.log("[Plugin Loaded] Live Streaming Engine ready");',
    config: {
      rtmpIngestUrl: 'rtmps://live.mizoramschool.edu.in:443/live',
      streamKey: 'live_mzs_stream_key_9988',
      hlsPlaybackUrl: 'https://cdn.mizoramschool.edu.in/hls/live_mzs_stream_key_9988/master.m3u8',
      latencyMode: 'low-latency',
      dvrRecordingEnabled: true,
      storageBucket: 's3://mzs-lecture-recordings-2026/',
      restreamYouTube: false,
      restreamFacebook: false,
      maxBroadcastResolution: '1080p'
    }
  },
  {
    id: 'plugin-webrtc-video-conference',
    name: 'WebRTC Multi-Party Video Conference & Voice Call Gateway',
    version: '2.5.0',
    enabled: true,
    category: 'Communication',
    cdnUrl: '',
    cdnCssUrl: '',
    loadTiming: 'async',
    scope: 'all',
    description: 'Powers 2-way interactive video conferences, breakout rooms, screen sharing, and crystal clear voice calling with AI echo cancellation.',
    script: 'window.webrtcGateway = { ready: true, activeEngine: "WebRTC Mesh / SFU" }; console.log("[Plugin Loaded] WebRTC Video Conference Gateway active");',
    config: {
      activeProvider: 'webrtc_mesh',
      iceServers: 'stun:stun.l.google.com:19302,turn:turn.mizoramschool.edu.in:3478',
      turnUsername: 'mzs_turn_user',
      turnCredential: 'turn_password_secure_2026',
      maxConferenceParticipants: 100,
      audioNoiseSuppression: true,
      audioEchoCancellation: true,
      audioAutoGain: true,
      opusBitrateKbps: 128,
      defaultVideoQuality: '720p',
      agoraAppId: '98a76bc43210ef891234567890abcdef',
      livekitHost: 'wss://livekit.mizoramschool.edu.in'
    }
  },
  {
    id: 'plugin-realtime-classroom-chat',
    name: 'Real-Time Classroom Live Chat & Moderation Socket',
    version: '2.0.1',
    enabled: true,
    category: 'Communication',
    cdnUrl: '',
    cdnCssUrl: '',
    loadTiming: 'async',
    scope: 'all',
    description: 'High-speed WebSocket chat engine for live classrooms with slow-mode throttling, profanity shielding, and automated session transcript archival.',
    script: 'window.classroomChatSocket = { status: "connected", slowMode: 3 }; console.log("[Plugin Loaded] Classroom Chat Socket ready");',
    config: {
      socketEndpoint: 'wss://chat.mizoramschool.edu.in/ws',
      channelPrefix: 'class_room_',
      slowModeSeconds: 3,
      profanityFilter: true,
      allowStudentDirectMessages: false,
      allowAttachmentUploads: true,
      autoArchiveSessionChat: true,
      maxMessageLength: 500
    }
  },
  {
    id: 'plugin-katex-math',
    name: 'KaTeX Scientific & Math Formula Typesetter',
    version: '0.16.10',
    enabled: true,
    category: 'Academics',
    cdnUrl: 'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js',
    cdnCssUrl: 'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css',
    loadTiming: 'async',
    scope: 'all',
    description: 'Renders high-speed, publication-grade mathematical formulas, calculus integrals, and chemical equations in study materials and exams.',
    script: 'window.katexEngineReady = true; console.log("[Plugin Loaded] KaTeX Formula Renderer Ready");',
    config: {
      displayMode: true,
      throwOnError: false,
      errorColor: '#f43f5e',
      delimiters: '$$...$$, $...$',
      enableChemicalMacros: true,
      autoRenderQuestions: true
    }
  },
  {
    id: 'plugin-html5-qrcode',
    name: 'Physical Camera Hardware Barcode & QR Scanner Engine',
    version: '2.3.8',
    enabled: true,
    category: 'Hardware & Devices',
    cdnUrl: 'https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js',
    cdnCssUrl: '',
    loadTiming: 'async',
    scope: 'all',
    description: 'Enables high-performance video stream camera decoding for ISBN barcodes on library books and student QR code ID passes.',
    script: 'window.html5QrEngineReady = true; console.log("[Plugin Loaded] HTML5 QR/Barcode Engine Ready");',
    config: {
      fps: 15,
      qrboxSize: 250,
      facingMode: 'environment',
      audioBeepOnSuccess: true,
      supportedFormats: 'QR_CODE, CODE_128, EAN_13, UPC_A',
      enableTorchLight: false
    }
  }
];

export const INITIAL_CUSTOM_SCRIPTS = {
  css: `/* Zoxs SMS Custom In-App CSS Overrides */
/* Edit here directly without opening VS Code or Antigravity! */
:root {
  --zoxs-brand-accent: #6366f1;
  --zoxs-brand-glow: rgba(99, 102, 241, 0.25);
}

/* Custom badge styling demonstration */
.zoxs-custom-pill {
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
}`,
  js: `// Zoxs SMS Custom In-App JavaScript & Hooks
// You can execute custom functions and event listeners here!
console.log("[Zoxs Script Studio] In-App Custom Script executed successfully at: " + new Date().toLocaleTimeString());
`,
  head: `<!-- Custom Head Tags & Meta injected dynamically -->
<meta name="zoxs-system" content="Mizoram School System v1.0.0" />`
};

export const INITIAL_SYSTEM_CONFIG = {
  schoolName: 'OHA (Oxford Higher Academy)',
  motto: 'Knowledge is Light (Hriatna chu Eng a ni)',
  establishedYear: '1998',
  affiliationNo: 'MBSE-HSS-LGL-0421',
  address: 'Lunglawn, Lunglei, Mizoram - 796701',
  contactPhone: '+91 372 2322104 / +91 94361 40552',
  contactEmail: 'oha.lunglawn@gmail.com',
  primaryColor: '#6366f1',
  currency: 'INR',
  currencySymbol: '₹',
  academicSession: '2026 - 2027',
  enableOnlineAdmissions: true,
  enableUpiPayments: true,
  enableSmsNotifications: true,
  enableHostelModule: true,
  enableTransportModule: true
};

export const INITIAL_ONLINE_ADMISSION_CONFIG = {
  isOpen: true,
  academicSession: '2026 - 2027',
  startDate: '2026-03-01',
  endDate: '2026-06-30',
  applicationDeadline: '2026-06-30',
  autoEnforceDates: true,
  noticeTitle: 'Admissions 2026-2027 Open',
  noticeMessage: 'Official Online Student Admission & Status Verification Portal • MBSE Affiliated',
  closedMessage: 'Online admissions for the current academic session are temporarily closed by the School Administration. Please contact the administrative desk for inquiry.',
  openClassNames: [
    'Nursery', 'LKG', 'UKG',
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10 (Board)',
    'Class 11 - Science', 'Class 11 - Arts', 'Class 11 - Commerce',
    'Class 12 - Science', 'Class 12 - Arts', 'Class 12 - Commerce'
  ],
  requireAadhaar: true,
  minimumPercentage: 40,
  contactPhone: '+91 372 2322104 / +91 94361 40552',
  contactEmail: 'admissions@mizoramschool.edu.in'
};

export const INITIAL_PAYMENT_CONFIG = {
  activeGateway: 'direct_upi', // 'direct_upi' | 'razorpay' | 'cashfree' | 'phonepe'
  gateways: {
    direct_upi: {
      id: 'direct_upi',
      name: 'Direct NPCI UPI & Dynamic QR',
      enabled: true,
      upiId: 'ohalunglawn@oksbi',
      merchantName: 'OHA Lunglawn, Lunglei',
      accountNumber: '30291827461',
      ifscCode: 'SBIN0001300',
      description: 'Zero transaction fee, direct settlement to school State Bank of India account in Lunglei.',
      autoVerifyWithUtr: true
    },
    razorpay: {
      id: 'razorpay',
      name: 'Razorpay Standard Checkout',
      enabled: false,
      keyId: 'rzp_test_98OHALunglawn2026',
      keySecret: 'sec_live_9283748291029384756',
      environment: 'sandbox', // 'sandbox' | 'live'
      themeColor: '#06b6d4',
      enableCards: true,
      enableNetbanking: true,
      enableUpi: true,
      enableWallets: false,
      webhookSecret: 'whsec_mizoramschool_rzp_2026',
      description: 'Accept credit/debit cards, net banking from 50+ banks, and UPI with instant automated webhooks.'
    },
    cashfree: {
      id: 'cashfree',
      name: 'Cashfree Payments Suite',
      enabled: false,
      appId: 'CF_APP_OHA_LUNGLAWN_2026',
      secretKey: 'cfsk_ma_test_9283719283746152',
      environment: 'sandbox',
      enableCards: true,
      enableUpi: true,
      enableNetbanking: true,
      description: 'High-speed payment processing designed for Indian educational institutions.'
    },
    phonepe: {
      id: 'phonepe',
      name: 'PhonePe Payment Gateway',
      enabled: false,
      merchantId: 'M228391827361_LUNGLEI',
      saltKey: '92837461-8273-4918-b291-928374615293',
      saltIndex: '1',
      environment: 'sandbox',
      description: 'Seamless integration with India’s leading UPI ecosystem.'
    }
  }
};

export const INITIAL_LIVE_MEDIA_CONFIG = {
  activeProvider: 'webrtc_mesh', // 'webrtc_mesh' | 'agora' | 'livekit' | 'jitsi'
  streamQuality: '1080p', // '360p' | '720p' | '1080p' | '4k'
  frameRate: 30, // 24 | 30 | 60
  bitrateKbps: 2500,
  audio: {
    noiseSuppression: true,
    echoCancellation: true,
    autoGainControl: true,
    bitrateKbps: 128
  },
  webrtc: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'turn:turn.mizoramschool.edu.in:3478', username: 'mzs_turn_user', credential: 'turn_password_secure_2026' }
    ],
    iceCandidatePoolSize: 10
  },
  broadcast: {
    enabled: true,
    rtmpIngestUrl: 'rtmps://live.mizoramschool.edu.in:443/live',
    streamKey: 'live_mzs_stream_key_9988',
    hlsPlaybackUrl: 'https://cdn.mizoramschool.edu.in/hls/live_mzs_stream_key_9988/master.m3u8',
    dvrRecordingEnabled: true,
    storageBucket: 's3://mzs-lecture-recordings-2026/',
    restreamTargets: {
      youtube: false,
      facebook: false,
      schoolAppCdn: true
    }
  },
  agora: {
    appId: '98a76bc43210ef891234567890abcdef',
    channelName: 'mzs_classroom_main',
    token: '00698a76bc43210ef891234567890abcdefIAC...'
  },
  livekit: {
    hostUrl: 'wss://livekit.mizoramschool.edu.in',
    apiKey: 'API_mzs_livekit_key_2026',
    apiSecret: 'SECRET_mzs_livekit_sec_9918'
  },
  chat: {
    socketEndpoint: 'wss://chat.mizoramschool.edu.in/ws',
    slowModeSeconds: 3,
    profanityFilter: true,
    allowStudentPrivateChat: false,
    allowAttachments: true,
    autoArchiveSessionChat: true,
    maxMessageLength: 500
  },
  conference: {
    defaultLayout: 'stage', // 'stage' | 'grid' | 'voice'
    maxGridTiles: 9, // 4 | 9 | 16
    activeSpeakerSpotlight: true,
    bandwidthSaverVoiceMode: false,
    virtualBackgroundBlur: true,
    allowParticipantScreenShare: false,
    audioEqualizerSensitivity: 75,
    waitingRoomEnabled: true
  },
  privateCall: {
    ringtoneEnabled: true,
    ringTimeoutSeconds: 25,
    lowBandwidthVoiceKbps: 24,
    autoLogNotes: true,
    endToEndEncryption: true
  }
};

export const INITIAL_ACADEMIC_EVENTS = [
  {
    id: 'evt-01',
    title: 'Chapchar Kût (State Festival)',
    date: '2026-03-06',
    endDate: '2026-03-06',
    category: 'holiday',
    badge: 'Mizoram Holiday',
    description: 'Mizoram state spring festival celebration. School closed.',
    color: 'emerald'
  },
  {
    id: 'evt-02',
    title: 'Good Friday & Easter Weekend',
    date: '2026-04-03',
    endDate: '2026-04-06',
    category: 'holiday',
    badge: 'Christian Holiday',
    description: 'Good Friday to Easter Monday holidays.',
    color: 'emerald'
  },
  {
    id: 'evt-03',
    title: 'Mid-Term Unit Class Tests',
    date: '2026-05-18',
    endDate: '2026-05-22',
    category: 'exam',
    badge: 'Class Test (25M)',
    description: 'Continuous assessment evaluation for all streams (Nursery to Class 12).',
    color: 'amber'
  },
  {
    id: 'evt-04',
    title: 'Remna Ni (Mizoram Peace Day)',
    date: '2026-06-30',
    endDate: '2026-06-30',
    category: 'holiday',
    badge: 'State Gazetted',
    description: 'Commemoration of the Historic Mizoram Peace Accord 1986.',
    color: 'emerald'
  },
  {
    id: 'evt-05',
    title: 'Annual School Sports Week',
    date: '2026-07-14',
    endDate: '2026-07-18',
    category: 'sports',
    badge: 'Sports & Games',
    description: 'Inter-house football, basketball, badminton, and track events at AR Ground.',
    color: 'purple'
  },
  {
    id: 'evt-06',
    title: 'Independence Day & Parade',
    date: '2026-08-15',
    endDate: '2026-08-15',
    category: 'event',
    badge: 'National Day',
    description: 'Flag hoisting, NCC march past, and cultural performances.',
    color: 'cyan'
  },
  {
    id: 'evt-07',
    title: 'Half-Yearly MBSE Examinations',
    date: '2026-09-14',
    endDate: '2026-09-25',
    category: 'exam',
    badge: 'Term Exam (100M)',
    description: 'Half-yearly term evaluation for Nursery through Class 12.',
    color: 'amber'
  },
  {
    id: 'evt-08',
    title: 'Parents-Teachers Meeting (PTM)',
    date: '2026-10-03',
    endDate: '2026-10-03',
    category: 'event',
    badge: 'Parent Consultation',
    description: 'Distribution of Half-Yearly Report Cards and academic counseling.',
    color: 'cyan'
  },
  {
    id: 'evt-09',
    title: 'Spiritual Retreat & Chapel Week',
    date: '2026-10-21',
    endDate: '2026-10-23',
    category: 'event',
    badge: 'Chapel Fellowship',
    description: 'Annual devotional retreat with guest speakers and musical praise.',
    color: 'purple'
  },
  {
    id: 'evt-10',
    title: 'MBSE Pre-Board Examination (Class 10 & 12)',
    date: '2026-11-16',
    endDate: '2026-11-27',
    category: 'exam',
    badge: 'MBSE Pre-Board',
    description: 'Mandatory trial board exam for HSSLC Science, Arts, Commerce & HSLC Class 10.',
    color: 'amber'
  },
  {
    id: 'evt-11',
    title: 'Christmas & Winter Vacation',
    date: '2026-12-18',
    endDate: '2027-01-08',
    category: 'holiday',
    badge: 'Winter Break',
    description: 'School reopens in January 2027 for final session.',
    color: 'emerald'
  }
];

export const INITIAL_VACATIONS = [
  {
    id: 'vac-01',
    title: 'Summer & Monsoon Vacation 2026',
    titleMizo: 'Nipui & Ruahsur Chawlh',
    type: 'vacation',
    category: 'Summer Break',
    startDate: '2026-06-22',
    endDate: '2026-07-10',
    totalDays: 19,
    academicYear: '2026-2027',
    reopenDate: '2026-07-13',
    hostelReportDate: '2026-07-12',
    hostelReportTime: '04:00 PM',
    applicableTo: 'All Classes (Nursery to Class 12)',
    officeStatus: 'skeleton_duty',
    status: 'completed',
    officialCircularNo: 'MS/ADM/VAC/2026/02',
    approvedBy: 'Rev. Dr. L. H. Rohmingliana (Principal)',
    description: 'Annual summer break for all students. Administrative office remains open between 10:00 AM and 1:00 PM on weekdays.',
    dutyStaff: [
      { name: 'R. Laltluanga', role: 'Head Cashier', contact: '+91 94361 40011', dutyDays: 'Mon, Wed, Fri' },
      { name: 'V. Lalchhanhima', role: 'Hostel Asst Warden', contact: '+91 98620 55122', dutyDays: 'Daily Campus Watch' }
    ],
    homeworkPackets: [
      { id: 'hw-01', classId: 'cls-12-sci', className: 'Class 12 - Science', subject: 'Physics & Chemistry', title: 'Summer Investigatory Project Portfolio', dueDate: '2026-07-15', downloadUrl: '#' },
      { id: 'hw-02', classId: 'cls-10', className: 'Class 10 (Board)', subject: 'Mathematics & Science', title: 'MBSE Formula Mastery & Model Question Papers', dueDate: '2026-07-15', downloadUrl: '#' }
    ]
  },
  {
    id: 'vac-02',
    title: 'Autumn & Durga Puja Mid-Term Vacation 2026',
    titleMizo: 'Thal Chawlh & Puja Chawlh',
    type: 'vacation',
    category: 'Autumn Break',
    startDate: '2026-10-19',
    endDate: '2026-10-25',
    totalDays: 7,
    academicYear: '2026-2027',
    reopenDate: '2026-10-26',
    hostelReportDate: '2026-10-25',
    hostelReportTime: '05:00 PM',
    applicableTo: 'All Classes (Nursery to Class 12)',
    officeStatus: 'skeleton_duty',
    status: 'upcoming',
    officialCircularNo: 'MS/ADM/VAC/2026/03',
    approvedBy: 'Rev. Dr. L. H. Rohmingliana (Principal)',
    description: 'Mid-term break following the completion of Half-Yearly Assessments. Students are advised to complete their practical notebooks and art-integrated projects.',
    dutyStaff: [
      { name: 'David Lalnunmawia', role: 'Examination Coordinator', contact: '+91 94361 11200', dutyDays: 'Tue, Thu' }
    ],
    homeworkPackets: [
      { id: 'hw-03', classId: 'cls-12-sci', className: 'Class 12 - Science', subject: 'Biology & Computer Science', title: 'Practical Record Book Completion & AI Ethics Essay', dueDate: '2026-10-28', downloadUrl: '#' },
      { id: 'hw-04', classId: 'cls-12-arts', className: 'Class 12 - Arts', subject: 'Political Science', title: 'Mizoram State Governance Case Study', dueDate: '2026-10-28', downloadUrl: '#' },
      { id: 'hw-05', classId: 'cls-10', className: 'Class 10 (Board)', subject: 'Social Science & Mizo', title: 'Mizo Cultural Heritage & Map Skills Assignment', dueDate: '2026-10-28', downloadUrl: '#' }
    ]
  },
  {
    id: 'vac-03',
    title: 'Christmas & Winter Vacation 2026-2027',
    titleMizo: 'Krismas & Furpui Chawlh',
    type: 'vacation',
    category: 'Winter Vacation',
    startDate: '2026-12-18',
    endDate: '2027-01-08',
    totalDays: 22,
    academicYear: '2026-2027',
    reopenDate: '2027-01-11',
    hostelReportDate: '2027-01-10',
    hostelReportTime: '03:00 PM',
    applicableTo: 'All Classes & Boarders',
    officeStatus: 'fully_closed',
    status: 'scheduled',
    officialCircularNo: 'MS/ADM/VAC/2026/04',
    approvedBy: 'Rev. Dr. L. H. Rohmingliana (Principal)',
    description: 'Grand winter and Christmas celebration holiday. Boarding hostel dormitories will be sanitized and locked on Dec 18 at 5:00 PM. Boarders must report back in formal uniform on Jan 10 before 3:00 PM.',
    dutyStaff: [
      { name: 'Campus Security & Warden Watch', role: 'Security Desk', contact: '+91 98623 00099', dutyDays: '24/7 Security Rotation' }
    ],
    homeworkPackets: [
      { id: 'hw-06', classId: 'cls-12-sci', className: 'Class 12 - Science', subject: 'All Core Subjects', title: 'HSSLC Board 5-Year Question Bank Solving Drill', dueDate: '2027-01-12', downloadUrl: '#' },
      { id: 'hw-07', classId: 'cls-10', className: 'Class 10 (Board)', subject: 'All Subjects', title: 'HSLC Winter Revision Intensive Problem Sets', dueDate: '2027-01-12', downloadUrl: '#' }
    ]
  },
  {
    id: 'vac-04',
    title: 'HSSLC & HSLC Pre-Board Study & Preparatory Leave',
    titleMizo: 'Board Exam Inbuatsaih Chawlh',
    type: 'term_break',
    category: 'Preparatory Leave',
    startDate: '2027-02-15',
    endDate: '2027-02-22',
    totalDays: 8,
    academicYear: '2026-2027',
    reopenDate: '2027-02-23',
    hostelReportDate: 'Resident Boarders in Study Hall',
    hostelReportTime: 'Mandatory Evening Study',
    applicableTo: 'Class 10 and Class 12 Only',
    officeStatus: 'open_administrative',
    status: 'scheduled',
    officialCircularNo: 'MS/ADM/VAC/2027/01',
    approvedBy: 'Dr. C. Lalremruata (Vice Principal & Academic Dean)',
    description: 'Self-study preparatory break before the final MBSE State Board Examinations. Faculty available for daily doubt-clearing sessions in designated science labs and conference rooms.',
    dutyStaff: [
      { name: 'Lalthlamuana Sailo', role: 'PGT Science In-Charge', contact: '+91 94361 22334', dutyDays: 'Daily 9:00 AM - 1:00 PM' }
    ],
    homeworkPackets: [
      { id: 'hw-08', classId: 'cls-12-sci', className: 'Class 12 - Science', subject: 'Physics, Chem, Bio, Maths', title: 'Mock Test Speed & Accuracy Time-Trials', dueDate: '2027-02-23', downloadUrl: '#' }
    ]
  }
];

export const MIZORAM_GAZETTED_HOLIDAYS_2026 = [
  { id: 'hol-01', title: 'New Year Day', titleMizo: 'Kum Thar Ni', date: '2026-01-01', type: 'gazetted', category: 'Festival', days: 1, remarks: 'State Gazetted Holiday' },
  { id: 'hol-02', title: 'New Year Celebration', titleMizo: 'Kum Thar Chawlh', date: '2026-01-02', type: 'gazetted', category: 'Festival', days: 1, remarks: 'State Gazetted Holiday' },
  { id: 'hol-03', title: 'Missionary Day', titleMizo: 'Chanchin Tha Thlen Ni', date: '2026-01-11', type: 'gazetted', category: 'Christian', days: 1, remarks: 'Commemoration of Pioneer Missionaries arrival' },
  { id: 'hol-04', title: 'Republic Day', titleMizo: 'Republic Ni', date: '2026-01-26', type: 'gazetted', category: 'National', days: 1, remarks: 'National Celebration & Parade' },
  { id: 'hol-05', title: 'State Day', titleMizo: 'Mizoram Statehood Ni', date: '2026-02-20', type: 'gazetted', category: 'State', days: 1, remarks: 'Statehood day of Mizoram' },
  { id: 'hol-06', title: 'Chapchar Kût', titleMizo: 'Chapchar Kût', date: '2026-03-06', type: 'gazetted', category: 'Cultural', days: 1, remarks: 'Premier cultural spring festival of the Mizo people' },
  { id: 'hol-07', title: 'Good Friday', titleMizo: 'Good Friday', date: '2026-04-03', type: 'gazetted', category: 'Christian', days: 1, remarks: 'Crucifixion commemoration' },
  { id: 'hol-08', title: 'Easter Monday', titleMizo: 'Easter Monday', date: '2026-04-06', type: 'gazetted', category: 'Christian', days: 1, remarks: 'Resurrection fellowship holiday' },
  { id: 'hol-09', title: 'YMA Day', titleMizo: 'YMA Day', date: '2026-06-15', type: 'gazetted', category: 'Community', days: 1, remarks: 'Young Mizo Association Foundation Day' },
  { id: 'hol-10', title: 'Remna Ni (Peace Day)', titleMizo: 'Remna Ni', date: '2026-06-30', type: 'gazetted', category: 'State', days: 1, remarks: 'Mizoram Peace Accord 1986 Commemoration' },
  { id: 'hol-11', title: 'MHIP Day', titleMizo: 'MHIP Day', date: '2026-07-06', type: 'gazetted', category: 'Community', days: 1, remarks: 'Mizo Hmeichhe Insuihkhawm Pawl Day' },
  { id: 'hol-12', title: 'Independence Day', titleMizo: 'Zalenna Ni', date: '2026-08-15', type: 'gazetted', category: 'National', days: 1, remarks: 'National Flag Hoisting & March Past' },
  { id: 'hol-13', title: 'Mahatma Gandhi Birthday', titleMizo: 'Gandhi Jayanti', date: '2026-10-02', type: 'gazetted', category: 'National', days: 1, remarks: 'National Gazetted' },
  { id: 'hol-14', title: 'Diwali (Deepavali)', titleMizo: 'Diwali Chawlh', date: '2026-11-08', type: 'gazetted', category: 'Festival', days: 1, remarks: 'Festival of Lights' },
  { id: 'hol-15', title: 'Christmas Eve', titleMizo: 'Krismas Urlawk Ni', date: '2026-12-24', type: 'gazetted', category: 'Christian', days: 1, remarks: 'State Gazetted' },
  { id: 'hol-16', title: 'Christmas Day', titleMizo: 'Krismas Ni', date: '2026-12-25', type: 'gazetted', category: 'Christian', days: 1, remarks: 'Nativity of Jesus Christ' },
  { id: 'hol-17', title: 'Boxing Day / Christmas Celebration', titleMizo: 'Krismas Ni Hnihna', date: '2026-12-26', type: 'gazetted', category: 'Christian', days: 1, remarks: 'Second day of Christmas' },
  { id: 'hol-18', title: 'New Year Eve', titleMizo: 'Kum Hlui Thlah Ni', date: '2026-12-31', type: 'gazetted', category: 'Festival', days: 1, remarks: 'Year end transition holiday' }
];


export const INITIAL_ISSUED_CERTIFICATES = [
  {
    id: 'cert-tc-001',
    certType: 'transfer', // 'transfer' | 'migration' | 'character'
    certNumber: 'TC/2026/042',
    studentId: 'stu-101',
    studentName: 'Lalmuanpuia Pachuau',
    admissionNo: 'MZ-2026-0101',
    rollNo: '01',
    fatherName: 'P.C. Lalthanmawia',
    motherName: 'Lalnunfeli',
    dob: '2008-04-12',
    dobInWords: 'Twelfth April Two Thousand Eight',
    classLastStudied: 'Class 12 - Science',
    stream: 'Science',
    academicYear: '2025-2026',
    boardExamResult: 'Passed HSSLC Pre-Board with Distinction',
    subjectsStudied: 'Physics, Chemistry, Mathematics, English, Mizo',
    attendanceRecord: '204 / 216 days (94.4%)',
    feeClearance: 'All dues cleared up to March 2026',
    conduct: 'Exemplary & Diligent',
    reasonForLeaving: 'Course Completed / Pursuing B.Tech Engineering in NIT Mizoram',
    destinationBoard: 'National Institute of Technology (NIT) Mizoram',
    issueDate: '2026-08-20',
    preparedBy: 'Pu R. Laltluanga (Head Clerk)',
    authorizedBy: 'Rev. Dr. L. H. Rohmingliana (Principal)',
    status: 'active'
  },
  {
    id: 'cert-mig-002',
    certType: 'migration',
    certNumber: 'MIG/2026/018',
    studentId: 'stu-103',
    studentName: 'C. Lalrinsanga',
    admissionNo: 'MZ-2026-0103',
    rollNo: '03',
    fatherName: 'Zonuntluanga Chhangte',
    motherName: 'Lalhriatpuii',
    dob: '2008-09-05',
    dobInWords: 'Fifth September Two Thousand Eight',
    classLastStudied: 'Class 12 - Arts',
    stream: 'Arts',
    academicYear: '2025-2026',
    boardExamResult: 'Passed Higher Secondary Examination',
    subjectsStudied: 'History, Political Science, Economics, English, Mizo',
    attendanceRecord: '192 / 216 days (88.9%)',
    feeClearance: 'All Tuition and Hostel Dues Cleared',
    conduct: 'Very Good',
    reasonForLeaving: 'Higher Secondary Completed',
    destinationBoard: 'Mizoram University (MZU) / Pachhunga University College',
    issueDate: '2026-08-25',
    preparedBy: 'Pu R. Laltluanga (Head Clerk)',
    authorizedBy: 'Rev. Dr. L. H. Rohmingliana (Principal)',
    status: 'active'
  }
];

export const INITIAL_REPORT_CARD_WITHHOLDS = {
  autoFeeWithhold: true,
  feeDueThreshold: 0,
  holds: {
    'stu-104': {
      withheld: true,
      reason: 'fee_due',
      customReason: 'Pending tuition fees of ₹20,000',
      notes: 'Fee clearance pending for Term 1 & 2. Please clear via Accounts or Online Portal to unlock.',
      withheldBy: 'Finance & Accounts Office (R. Laltluanga)',
      date: '2026-08-15'
    },
    'stu-102': {
      withheld: true,
      reason: 'fee_due',
      customReason: 'Installment fee balance pending (₹12,000)',
      notes: 'Term 2 balance overdue. Progress report withheld until fee clearance.',
      withheldBy: 'System / Fee Policy',
      date: '2026-08-20'
    }
  },
  exemptions: {}
};

export const INITIAL_LEAVE_APPLICATIONS = [
  {
    id: 'leave-2026-001',
    applicationNo: 'LA/2026/041',
    studentId: 'stu-101',
    studentName: 'Lalrinsanga Sailo',
    rollNo: '01',
    classId: 'cls-12-sci',
    className: 'Class 12 - Science',
    classTeacherName: 'Lalthlamuana Sailo',
    applicantType: 'parent',
    applicantName: 'Lalthanzuala Sailo (Father)',
    applicantPhone: '+91 98623 45671',
    leaveType: 'medical',
    startDate: '2026-09-21',
    endDate: '2026-09-23',
    totalDays: 3,
    reason: 'Khawsik sang leh awmna vanga damdawi in (Civil Hospital Aizawl) a inentir leh chawlh hahdam ngai.',
    documentName: 'Civil_Hospital_Prescription.pdf',
    documentUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&auto=format&fit=crop&q=80',
    status: 'pending_class_master',
    classMasterReview: {
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      remarks: ''
    },
    vicePrincipalReview: {
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      remarks: ''
    },
    principalReview: {
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      remarks: ''
    },
    finalDecision: 'pending',
    submittedAt: '2026-09-20T07:15:00Z',
    auditTrail: [
      { action: 'Online Leave Application Submitted', by: 'Lalthanzuala Sailo (Parent)', timestamp: '2026-09-20 07:15 AM' }
    ]
  },
  {
    id: 'leave-2026-002',
    applicationNo: 'LA/2026/040',
    studentId: 'stu-102',
    studentName: 'Vanlalhruaii Ralte',
    rollNo: '02',
    classId: 'cls-12-sci',
    className: 'Class 12 - Science',
    classTeacherName: 'Lalthlamuana Sailo',
    applicantType: 'student',
    applicantName: 'Vanlalhruaii Ralte (Self)',
    applicantPhone: '+91 97741 88201',
    leaveType: 'family_emergency',
    startDate: '2026-09-22',
    endDate: '2026-09-24',
    totalDays: 3,
    reason: 'Ka pi (Lunglei a awm) boral vanga chhungkuain kal ve a ngaih avangin chawlh min phalsak turin ka ngen a che u.',
    documentName: 'Family_Notice_Letter.pdf',
    documentUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&auto=format&fit=crop&q=80',
    status: 'pending_principal',
    classMasterReview: {
      status: 'recommended',
      reviewedBy: 'Lalthlamuana Sailo (Class Master)',
      reviewedAt: '2026-09-19T14:30:00Z',
      remarks: 'Recommended for Principal approval. Bereavement travel verified with guardian.'
    },
    vicePrincipalReview: {
      status: 'endorsed',
      reviewedBy: 'Dr. C. Lalremruata (Vice Principal)',
      reviewedAt: '2026-09-19T16:00:00Z',
      remarks: 'Endorsed. Sent to Principal for final institutional clearance.'
    },
    principalReview: {
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      remarks: ''
    },
    finalDecision: 'pending',
    submittedAt: '2026-09-19T12:00:00Z',
    auditTrail: [
      { action: 'Online Leave Application Submitted', by: 'Vanlalhruaii Ralte', timestamp: '2026-09-19 12:00 PM' },
      { action: 'Recommended to Principal', by: 'Lalthlamuana Sailo (Class Master)', timestamp: '2026-09-19 02:30 PM' },
      { action: 'Endorsed by Vice Principal', by: 'Dr. C. Lalremruata (VP)', timestamp: '2026-09-19 04:00 PM' }
    ]
  },
  {
    id: 'leave-2026-003',
    applicationNo: 'LA/2026/039',
    studentId: 'stu-103',
    studentName: 'C. Lalrinsanga',
    rollNo: '03',
    classId: 'cls-12-arts',
    className: 'Class 12 - Arts',
    classTeacherName: 'Ruth Lalrinsangi',
    applicantType: 'student',
    applicantName: 'C. Lalrinsanga (Self)',
    applicantPhone: '+91 94361 22899',
    leaveType: 'sports_official',
    startDate: '2026-09-17',
    endDate: '2026-09-19',
    totalDays: 3,
    reason: 'Mizoram Sub-Junior State Football Championship at Lammual represent tura koh ka nih avangin.',
    documentName: 'MFA_Selection_Order.pdf',
    documentUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&auto=format&fit=crop&q=80',
    status: 'approved',
    classMasterReview: {
      status: 'approved',
      reviewedBy: 'Ruth Lalrinsangi (Class Teacher)',
      reviewedAt: '2026-09-16T10:00:00Z',
      remarks: 'Official MFA order verified. Recommended enthusiastically.'
    },
    vicePrincipalReview: {
      status: 'approved',
      reviewedBy: 'Dr. C. Lalremruata (Vice Principal)',
      reviewedAt: '2026-09-16T11:30:00Z',
      remarks: 'Sports quota official leave endorsed.'
    },
    principalReview: {
      status: 'approved',
      reviewedBy: 'Rev. Dr. L. H. Rohmingliana (Principal)',
      reviewedAt: '2026-09-16T14:00:00Z',
      remarks: 'Officially Approved. Attendance registered as Excused/On Leave. All the best to the player!'
    },
    finalDecision: 'approved',
    submittedAt: '2026-09-16T09:00:00Z',
    auditTrail: [
      { action: 'Submitted via Online Portal', by: 'C. Lalrinsanga', timestamp: '2026-09-16 09:00 AM' },
      { action: 'Approved by Class Master', by: 'Ruth Lalrinsangi', timestamp: '2026-09-16 10:00 AM' },
      { action: 'Endorsed by Vice Principal', by: 'Dr. C. Lalremruata', timestamp: '2026-09-16 11:30 AM' },
      { action: 'Final Approval by Principal', by: 'Rev. Dr. L. H. Rohmingliana', timestamp: '2026-09-16 02:00 PM' }
    ]
  },
  {
    id: 'leave-2026-004',
    applicationNo: 'LA/2026/038',
    studentId: 'stu-104',
    studentName: 'Zodinpuii Khiangte',
    rollNo: '04',
    classId: 'cls-12-comm',
    className: 'Class 12 - Commerce',
    classTeacherName: 'Timothy Lalmuanawma',
    applicantType: 'student',
    applicantName: 'Zodinpuii Khiangte (Self)',
    applicantPhone: '+91 98628 33100',
    leaveType: 'other',
    startDate: '2026-09-15',
    endDate: '2026-09-15',
    totalDays: 1,
    reason: 'Thianpa birthday party lawmnaa kal lawk ka duh a.',
    documentName: null,
    documentUrl: null,
    status: 'rejected',
    classMasterReview: {
      status: 'rejected',
      reviewedBy: 'Timothy Lalmuanawma (Class Master)',
      reviewedAt: '2026-09-14T15:00:00Z',
      remarks: 'School class regular hours-ah private party vanga chawlh dilna hi school dan kalh a ni a, pawm theih a ni lo.'
    },
    vicePrincipalReview: {
      status: 'rejected',
      reviewedBy: 'Dr. C. Lalremruata (Vice Principal)',
      reviewedAt: '2026-09-14T16:00:00Z',
      remarks: 'Class master rejection confirmed.'
    },
    principalReview: {
      status: 'rejected',
      reviewedBy: 'Rev. Dr. L. H. Rohmingliana (Principal)',
      reviewedAt: '2026-09-14T17:00:00Z',
      remarks: 'Rejected as per Institutional Conduct Policy.'
    },
    finalDecision: 'rejected',
    submittedAt: '2026-09-14T11:00:00Z',
    auditTrail: [
      { action: 'Submitted via Online Portal', by: 'Zodinpuii Khiangte', timestamp: '2026-09-14 11:00 AM' },
      { action: 'Rejected by Class Master', by: 'Timothy Lalmuanawma', timestamp: '2026-09-14 03:00 PM' }
    ]
  }
];

export const INITIAL_PAY_SCALES = [
  {
    id: 'scale-l14',
    level: 'Level 14',
    title: 'Executive & Institutional Head',
    designations: ['Principal', 'Superintendent'],
    minBase: 70000,
    maxBase: 120000,
    currentBase: 75000,
    daRatePercent: 38,
    hraRatePercent: 16,
    medicalAllowance: 2000,
    specialAllowance: 5000,
    epfNpsPercent: 10,
    profTax: 200,
    description: 'Senior apex institutional governance pay scale with executive allowances.'
  },
  {
    id: 'scale-l12',
    level: 'Level 12',
    title: 'Academic Dean & Vice Principal',
    designations: ['Vice Principal & Academic Dean', 'Vice Principal'],
    minBase: 55000,
    maxBase: 90000,
    currentBase: 62000,
    daRatePercent: 38,
    hraRatePercent: 16,
    medicalAllowance: 1500,
    specialAllowance: 3000,
    epfNpsPercent: 10,
    profTax: 200,
    description: 'Senior academic administration, supervision and examination authority.'
  },
  {
    id: 'scale-l10',
    level: 'Level 10',
    title: 'PGT Senior Secondary Faculty',
    designations: ['PGT Senior Physics Teacher', 'PGT English & Literature', 'PGT Mathematics Teacher'],
    minBase: 42000,
    maxBase: 72000,
    currentBase: 48000,
    daRatePercent: 38,
    hraRatePercent: 16,
    medicalAllowance: 1200,
    specialAllowance: 1500,
    epfNpsPercent: 10,
    profTax: 200,
    description: 'Higher Secondary (Classes 11 & 12) Science, Arts, and Commerce specialized teaching staff.'
  },
  {
    id: 'scale-l8',
    level: 'Level 8',
    title: 'TGT High School Faculty',
    designations: ['TGT Science Teacher', 'TGT Mathematics', 'TGT Social Science', 'TGT Mizo'],
    minBase: 34000,
    maxBase: 56000,
    currentBase: 38000,
    daRatePercent: 38,
    hraRatePercent: 16,
    medicalAllowance: 1000,
    specialAllowance: 1000,
    epfNpsPercent: 10,
    profTax: 150,
    description: 'Secondary School (Classes 9 & 10) certified graduate teachers.'
  },
  {
    id: 'scale-l7',
    level: 'Level 7',
    title: 'PRT Primary Faculty & Kindergarten',
    designations: ['Primary Teacher', 'Kindergarten In-Charge', 'Nursery Teacher'],
    minBase: 26000,
    maxBase: 42000,
    currentBase: 30000,
    daRatePercent: 38,
    hraRatePercent: 16,
    medicalAllowance: 800,
    specialAllowance: 500,
    epfNpsPercent: 10,
    profTax: 150,
    description: 'Elementary & Primary School educators (Nursery to Class 8).'
  },
  {
    id: 'scale-l6',
    level: 'Level 6',
    title: 'Finance & Ministerial Administration',
    designations: ['Chief Accounts Officer & Cashier', 'Head Clerk', 'Senior Accountant'],
    minBase: 30000,
    maxBase: 50000,
    currentBase: 42000,
    daRatePercent: 38,
    hraRatePercent: 16,
    medicalAllowance: 1000,
    specialAllowance: 1500,
    epfNpsPercent: 10,
    profTax: 150,
    description: 'School institutional finance, accounts ledger, and office administration officers.'
  },
  {
    id: 'scale-l4',
    level: 'Level 4',
    title: 'Support & Residential Campus Staff',
    designations: ['Chief Hostel Warden & Residential Head', 'Bus Fleet Supervisor', 'Lab Technician'],
    minBase: 22000,
    maxBase: 38000,
    currentBase: 28000,
    daRatePercent: 38,
    hraRatePercent: 16,
    medicalAllowance: 600,
    specialAllowance: 1000,
    epfNpsPercent: 10,
    profTax: 100,
    description: 'Boarding hostel wardens, logistics drivers, and campus security staff.'
  }
];

// ==========================================
// 1. HEALTH CLINIC & INFIRMARY DATA
// ==========================================
export const INITIAL_CLINIC_CONFIG = {
  nurseInCharge: 'Pi Lalmuanpuii, RN',
  doctorOnCall: 'Dr. Zothansanga, MD (Civil Hospital Lunglei)',
  operatingHours: '08:00 AM - 05:00 PM',
  emergencyAlertChannels: { sms: true, whatsapp: true, push: true },
  autoParentAlertOnAdmission: true,
  sickBayBedCount: 6,
  dispensaryLowStockThreshold: 10,
  syncWithAttendance: true
};

export const INITIAL_CLINIC_RECORDS = [
  {
    id: 'cln-001',
    studentId: 'stu-101',
    studentName: 'Lalmuanpuia Sailo',
    classId: 'cls-12-sci',
    className: 'Class 12 - Science',
    rollNo: '01',
    date: '2026-09-20',
    time: '10:15 AM',
    complaint: 'Severe headache and mild dehydration after sports period',
    vitals: { temp: '98.6°F', bp: '115/75', pulse: '78 bpm', spo2: '99%' },
    treatment: 'Administered Paracetamol 500mg, ORS electrolyte solution (200ml)',
    bedAllocated: 'Bed #02',
    durationMinutes: 45,
    status: 'recovering', // 'resting', 'discharged', 'referred'
    parentNotified: true,
    nurseNotes: 'Patient responded well to rehydration. Resting quietly in sick bay.'
  },
  {
    id: 'cln-002',
    studentId: 'stu-102',
    studentName: 'Vanlalhruaii Ralte',
    classId: 'cls-12-sci',
    className: 'Class 12 - Science',
    rollNo: '02',
    date: '2026-09-19',
    time: '01:30 PM',
    complaint: 'Ankle sprain during basketball practice',
    vitals: { temp: '98.4°F', bp: '120/80', pulse: '84 bpm', spo2: '98%' },
    treatment: 'RICE protocol: Cold ice compression, crepe bandage immobilization, Diclofenac gel',
    bedAllocated: 'Bed #01',
    durationMinutes: 60,
    status: 'discharged',
    parentNotified: true,
    nurseNotes: 'No bone fracture observed. Advised 2 days physical rest from games.'
  },
  {
    id: 'cln-003',
    studentId: 'stu-103',
    studentName: 'C. Lalrinsanga',
    classId: 'cls-12-arts',
    className: 'Class 12 - Arts',
    rollNo: '03',
    date: '2026-09-18',
    time: '11:00 AM',
    complaint: 'Mild seasonal dry cough and throat irritation',
    vitals: { temp: '99.1°F', bp: '110/70', pulse: '76 bpm', spo2: '99%' },
    treatment: 'Warm salt water gargle, Cetirizine 10mg, throat lozenge',
    bedAllocated: 'Outpatient',
    durationMinutes: 15,
    status: 'discharged',
    parentNotified: false,
    nurseNotes: 'Vitals stable. Returned to classroom with lozenge.'
  }
];

// ==========================================
// 2. MAIN CAMPUS VISITOR & GATE PASS DATA
// ==========================================
export const INITIAL_VISITOR_CONFIG = {
  gateSecurityChief: 'Havildar Laltlanhlua (Ex-Assam Rifles)',
  defaultPassValidityMinutes: 90,
  requireVehicleNumber: true,
  requireHostApproval: true,
  autoCheckoutAtCurfew: true,
  curfewTime: '17:30 (5:30 PM)',
  gateBadgePrintFormat: 'badge_80mm' // 'badge_80mm' | 'slip_a6'
};

export const INITIAL_VISITORS = [
  {
    id: 'vis-101',
    passNo: 'GP-2026-049',
    visitorName: 'Pu K. Zothanmawia',
    phone: '+91 94361 88921',
    purpose: 'Parent Inquiry regarding CBSE Board Exam Registration',
    visitingWhom: 'Lalthlamuana Sailo (Class Master, Cl-12 Sci)',
    visitingDepartment: 'Academic Secondary Faculty',
    studentName: 'Vanlalhruaia Chawngthu',
    studentRoll: '07',
    vehicleNo: 'MZ-01-M-4819 (Scooty)',
    entryTime: '10:00 AM',
    exitTime: null,
    status: 'inside', // 'inside' | 'checked_out'
    idProofType: 'Aadhaar Card',
    remarks: 'Approved by Vice Principal Desk'
  },
  {
    id: 'vis-102',
    passNo: 'GP-2026-048',
    visitorName: 'Pi Ramhluni & Er. Lalnunmawia',
    phone: '+91 98624 33011',
    purpose: 'Science Laboratory Equipment Inspection & Delivery',
    visitingWhom: 'Science Dept. In-Charge (Pu C. Lalhmingliana)',
    visitingDepartment: 'Science Laboratories',
    studentName: null,
    vehicleNo: 'MZ-01-K-9012 (Bolero Pickup)',
    entryTime: '08:45 AM',
    exitTime: '11:15 AM',
    status: 'checked_out',
    idProofType: 'Driving License',
    remarks: 'Physics optical bench crates safely received'
  },
  {
    id: 'vis-103',
    passNo: 'GP-2026-050',
    visitorName: 'Rev. B. Lalsangliana',
    phone: '+91 94363 77109',
    purpose: 'Guest Speaker for Morning Assembly & Devotional Talk',
    visitingWhom: 'Rev. Dr. L. H. Rohmingliana (Principal)',
    visitingDepartment: 'Principal Executive Office',
    studentName: null,
    vehicleNo: 'MZ-01-E-3321',
    entryTime: '08:15 AM',
    exitTime: '10:30 AM',
    status: 'checked_out',
    idProofType: 'Voter ID',
    remarks: 'Assembly guest speaker badge issued'
  }
];

// ==========================================
// 3. INVENTORY & SCIENCE LAB ASSETS DATA
// ==========================================
export const INITIAL_INVENTORY_CONFIG = {
  custodianName: 'Pu T. Vanlalruata (Campus Estate & Lab Officer)',
  lowStockThreshold: 3,
  depreciationRatePercent: 10,
  approvalThresholdAmount: 5000,
  preferredSupplier: 'Mizoram Scientific Equipment Supplies Ltd., Lunglei Branch',
  auditCycleMonths: 6
};

export const INITIAL_INVENTORY_ASSETS = [
  {
    id: 'ast-001',
    code: 'MZS-SCI-01',
    name: 'Binocular Compound Laboratory Microscope (1000x)',
    category: 'Physics & Biology Lab',
    quantity: 16,
    unit: 'Units',
    condition: 'good', // 'good' | 'fair' | 'needs_repair'
    location: 'Senior Secondary Biology Lab (Room 204)',
    purchaseDate: '2024-06-15',
    costPerUnit: 14500,
    warrantyExpiry: '2027-06-15',
    lastInspected: '2026-08-10'
  },
  {
    id: 'ast-002',
    code: 'MZS-SCI-02',
    name: 'Digital Analytical Chemical Balance (0.0001g Acc.)',
    category: 'Chemistry Lab',
    quantity: 4,
    unit: 'Units',
    condition: 'good',
    location: 'Senior Secondary Chemistry Lab (Room 205)',
    purchaseDate: '2025-01-20',
    costPerUnit: 22000,
    warrantyExpiry: '2028-01-20',
    lastInspected: '2026-09-01'
  },
  {
    id: 'ast-003',
    code: 'MZS-IT-01',
    name: 'Dell OptiPlex 7090 Desktop PC (Core i7, 16GB, SSD)',
    category: 'Computer & AI Lab',
    quantity: 32,
    unit: 'Workstations',
    condition: 'good',
    location: 'Main Computer Center (Lab A)',
    purchaseDate: '2024-03-10',
    costPerUnit: 58000,
    warrantyExpiry: '2027-03-10',
    lastInspected: '2026-09-15'
  },
  {
    id: 'ast-004',
    code: 'MZS-SPT-01',
    name: 'FIFA Quality Pro Match Footballs (Size 5)',
    category: 'Sports & Athletics',
    quantity: 18,
    unit: 'Balls',
    condition: 'good',
    location: 'Sports Equipment Store & Gymnasium',
    purchaseDate: '2026-02-10',
    costPerUnit: 2800,
    warrantyExpiry: '2027-02-10',
    lastInspected: '2026-09-10'
  },
  {
    id: 'ast-005',
    code: 'MZS-FUR-01',
    name: 'Ergonomic Dual Wooden Desk & Bench Set',
    category: 'Classroom Furniture',
    quantity: 140,
    unit: 'Sets',
    condition: 'good',
    location: 'High School & Higher Sec Classrooms',
    purchaseDate: '2023-04-12',
    costPerUnit: 4200,
    warrantyExpiry: '2028-04-12',
    lastInspected: '2026-07-20'
  }
];

export const INITIAL_MAINTENANCE_TICKETS = [
  {
    id: 'tkt-201',
    assetCode: 'MZS-IT-01',
    assetName: 'Computer Lab Workstation #14',
    issue: 'CMOS battery dead and monitor display flickering',
    reportedBy: 'Computer Instructor (H. Lalremruata)',
    priority: 'medium',
    status: 'in_progress', // 'open' | 'in_progress' | 'resolved'
    estimatedCost: 800,
    createdAt: '2026-09-18'
  },
  {
    id: 'tkt-202',
    assetCode: 'MZS-SCI-01',
    assetName: 'Microscope Lens Calibration #08',
    issue: 'Fine focus adjustment knob slipping',
    reportedBy: 'Lab Technician',
    priority: 'low',
    status: 'open',
    estimatedCost: 600,
    createdAt: '2026-09-19'
  }
];

// ==========================================
// 4. PARENT-TEACHER MEETING (PTM) DATA
// ==========================================
export const INITIAL_PTM_CONFIG = {
  defaultSlotDurationMinutes: 15,
  bufferBetweenSlotsMinutes: 5,
  maxBookingsPerParent: 3,
  autoReminderHoursPrior: 24,
  allowVirtualVideoPtm: true
};

export const INITIAL_PTM_EVENTS = [
  {
    id: 'ptm-2026-t1',
    title: 'Term 1 Mid-Academic Parent-Teacher Consultation Conference',
    date: '2026-09-26',
    startTime: '09:00 AM',
    endTime: '02:00 PM',
    status: 'open', // 'upcoming', 'open', 'completed'
    venue: 'Academic Classrooms & Live Video Hub',
    description: 'Direct consultation on student academic performance, CBSE exam preparation, attendance, and behavioral growth.',
    teachersAvailable: [
      {
        teacherId: 'stf-001',
        teacherName: 'Pu Lalthlamuana Sailo',
        subject: 'Physics & Senior Science',
        room: 'Room 201 (Science Block)',
        slots: [
          { id: 's-1', time: '09:00 AM - 09:15 AM', status: 'booked', parentName: 'Lalthanzuala Sailo', studentName: 'Lalmuanpuia Sailo', rollNo: '01' },
          { id: 's-2', time: '09:20 AM - 09:35 AM', status: 'booked', parentName: 'Pi Lalmuanpuii', studentName: 'Vanlalhruaii Ralte', rollNo: '02' },
          { id: 's-3', time: '09:40 AM - 09:55 AM', status: 'available', parentName: null, studentName: null, rollNo: null },
          { id: 's-4', time: '10:00 AM - 10:15 AM', status: 'available', parentName: null, studentName: null, rollNo: null },
          { id: 's-5', time: '10:20 AM - 10:35 AM', status: 'available', parentName: null, studentName: null, rollNo: null }
        ]
      },
      {
        teacherId: 'stf-002',
        teacherName: 'Pi Ruth Lalrinsangi',
        subject: 'English Literature & Grammar',
        room: 'Room 202 (Arts Block)',
        slots: [
          { id: 's-6', time: '09:00 AM - 09:15 AM', status: 'booked', parentName: 'Pu C. Vanlalruata', studentName: 'C. Lalrinsanga', rollNo: '03' },
          { id: 's-7', time: '09:20 AM - 09:35 AM', status: 'available', parentName: null, studentName: null, rollNo: null },
          { id: 's-8', time: '09:40 AM - 09:55 AM', status: 'available', parentName: null, studentName: null, rollNo: null }
        ]
      }
    ]
  }
];

// ==========================================
// 5. ALUMNI & FORMER STUDENTS NETWORK DATA
// ==========================================
export const INITIAL_ALUMNI_CONFIG = {
  associationPresident: 'Dr. Zoramthanga Fanai (Batch of 2015, Civil Surgeon)',
  publicDirectoryEnabled: true,
  transcriptFeeAmount: 300,
  allowOnlineTranscriptRequests: true,
  courierDeliveryPartner: 'India Post Speed Post & DTDC'
};

export const INITIAL_ALUMNI = [
  {
    id: 'alm-001',
    name: 'Dr. Vanlalpeka Hnamte',
    graduatingBatch: 2019,
    classCompleted: 'Class 12 - Science',
    currentRole: 'Senior Resident Doctor (MBBS, MD Pediatrics)',
    organization: 'Civil Hospital Aizawl',
    location: 'Aizawl, Mizoram',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
    email: 'vanlalpeka.md@gmail.com',
    phone: '+91 94361 70019',
    achievement: 'Secured State 1st Rank in NEET UG 2019 from Mizoram School',
    status: 'active'
  },
  {
    id: 'alm-002',
    name: 'Lalrinchhani Khiangte',
    graduatingBatch: 2021,
    classCompleted: 'Class 12 - Commerce',
    currentRole: 'Chartered Accountant (CA)',
    organization: 'Ernst & Young (EY) Global Delivery',
    location: 'Bengaluru, India',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    email: 'rinchhani.khiangte@ey.com',
    phone: '+91 98621 44021',
    achievement: 'Cleared CA Final Exam in first attempt with All India 48th Rank',
    status: 'active'
  },
  {
    id: 'alm-003',
    name: 'Samuel Lalhmangaiha',
    graduatingBatch: 2022,
    classCompleted: 'Class 12 - Science',
    currentRole: 'B.Tech Computer Science & Engineering',
    organization: 'Indian Institute of Technology (IIT) Guwahati',
    location: 'Guwahati, Assam',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    email: 'samuel.iitg@alumni.mzs.edu',
    phone: '+91 97741 55902',
    achievement: 'JEE Advanced Top 500 Ranker; Google Summer of Code Contributor',
    status: 'active'
  }
];

export const INITIAL_TRANSCRIPT_REQUESTS = [
  {
    id: 'tr-101',
    alumniName: 'Dr. Vanlalpeka Hnamte',
    batch: 2019,
    documentType: 'Official English Migration & Character Transcript',
    purpose: 'Higher Fellowship Application in UK (NHS)',
    status: 'dispatched', // 'pending', 'processed', 'dispatched'
    trackingNo: 'EM904128912IN',
    feePaid: 300,
    requestedAt: '2026-09-10'
  },
  {
    id: 'tr-102',
    alumniName: 'Lalrinchhani Khiangte',
    batch: 2021,
    documentType: 'Duplicate Consolidated Marksheet (CBSE Verification)',
    purpose: 'CA Institute Verification',
    status: 'processed',
    trackingNo: null,
    feePaid: 300,
    requestedAt: '2026-09-17'
  }
];

// ==========================================
// 6. SCHOOL CANTEEN & SMART LUNCH CARD DATA
// ==========================================
export const INITIAL_CANTEEN_CONFIG = {
  canteenManager: 'Pu K. Lalremruata & Pi Zonuni',
  dailySpendingLimit: 150,
  cashlessSmartCardOnly: false,
  orderCutoffTime: '10:30 AM',
  lowBalanceThreshold: 50,
  taxGstPercent: 0,
  operationalTiming: '09:00 AM - 03:30 PM'
};

export const INITIAL_CANTEEN_MENU = [
  { id: 'cnt-1', name: 'Fresh Vegetable Chowmein', category: 'Hot Meals', price: 60, inStock: true, image: '🍜' },
  { id: 'cnt-2', name: 'Chicken Fried Rice with Sunny Egg', category: 'Hot Meals', price: 90, inStock: true, image: '🍗' },
  { id: 'cnt-3', name: 'Warm Baked Samosa (2 Pcs)', category: 'Snacks', price: 30, inStock: true, image: '🥟' },
  { id: 'cnt-4', name: 'Whole Wheat Egg Roll', category: 'Snacks', price: 45, inStock: true, image: '🌯' },
  { id: 'cnt-5', name: 'Fresh Banana & Seasonal Fruit Cup', category: 'Healthy Treats', price: 30, inStock: true, image: '🍌' },
  { id: 'cnt-6', name: 'Chilled Amul Milk Bottle (Chocolate)', category: 'Beverages', price: 35, inStock: true, image: '🥛' },
  { id: 'cnt-7', name: 'Mizoram Herbal Lemon Tea', category: 'Beverages', price: 15, inStock: true, image: '🍵' }
];

export const INITIAL_CANTEEN_WALLETS = {
  'stu-101': { balance: 420, dailySpentToday: 60, status: 'active' },
  'stu-102': { balance: 680, dailySpentToday: 30, status: 'active' },
  'stu-103': { balance: 190, dailySpentToday: 0, status: 'active' },
  'stu-104': { balance: 35, dailySpentToday: 45, status: 'active' }
};

export const INITIAL_CANTEEN_TRANSACTIONS = [
  { id: 'ctx-01', studentId: 'stu-101', studentName: 'Lalmuanpuia Sailo', item: 'Fresh Vegetable Chowmein', amount: 60, time: '11:45 AM', date: '2026-09-20', type: 'debit' },
  { id: 'ctx-02', studentId: 'stu-102', studentName: 'Vanlalhruaii Ralte', item: 'Warm Baked Samosa (2 Pcs)', amount: 30, time: '11:30 AM', date: '2026-09-20', type: 'debit' },
  { id: 'ctx-03', studentId: 'stu-101', studentName: 'Lalmuanpuia Sailo', item: 'Parent Online Wallet Top-Up (UPI)', amount: 500, time: '08:30 AM', date: '2026-09-20', type: 'credit' }
];

// ==========================================
// 7. ACADEMIC STUDY MATERIALS & QUESTION PAPERS VAULT
// ==========================================
export const INITIAL_STUDY_CONFIG = {
  allowPublicDownload: false,
  maxUploadSizeBytes: 25000000,
  watermarkDownloads: true,
  watermarkText: 'OHA Lunglawn, Lunglei - Confidential Student Copy',
  enableRatingsAndComments: true,
  autoArchivePastYears: true,
  storageProvider: 'Cloudflare R2 / AWS S3 Education'
};

export const INITIAL_STUDY_MATERIALS = [
  {
    id: 'mat-001',
    title: 'MBSE Class 12 Physics - Ray Optics & Optical Instruments Comprehensive Notes',
    subject: 'Physics',
    classId: 'cls-12-sci',
    stream: 'science',
    category: 'Chapter Notes',
    author: 'Pu Lalthlamuana Sailo (PGT Physics)',
    fileType: 'PDF',
    fileSize: '3.4 MB',
    downloadUrl: '#',
    uploadedDate: '2026-09-12',
    downloadsCount: 142,
    hasFormulaCheatSheet: true,
    tags: ['Optics', 'Class 12', 'MBSE 2026', 'Derivations']
  },
  {
    id: 'mat-002',
    title: 'Class 10 MBSE Mathematics - Standard Model Question Paper & Marking Scheme (2026)',
    subject: 'Mathematics',
    classId: 'cls-10',
    stream: 'general_secondary',
    category: 'Model Question Paper',
    author: 'Dr. C. Zoramthanga (Head of Mathematics)',
    fileType: 'PDF',
    fileSize: '1.8 MB',
    downloadUrl: '#',
    uploadedDate: '2026-09-15',
    downloadsCount: 310,
    hasFormulaCheatSheet: false,
    tags: ['Class 10 Board', 'Model Paper', 'Marking Scheme']
  },
  {
    id: 'mat-003',
    title: 'Class 12 Chemistry - Organic Reaction Mechanisms & Name Reactions Cheat Sheet',
    subject: 'Chemistry',
    classId: 'cls-12-sci',
    stream: 'science',
    category: 'Formula / Cheat Sheet',
    author: 'Chemistry Faculty (Pu C. Lalhmingliana)',
    fileType: 'PDF',
    fileSize: '2.1 MB',
    downloadUrl: '#',
    uploadedDate: '2026-09-16',
    downloadsCount: 185,
    hasFormulaCheatSheet: true,
    tags: ['Organic', 'Reactions', 'Aldehydes', 'Polymers']
  },
  {
    id: 'mat-004',
    title: 'Class 12 Political Science - Indian Constitution at Work & Cold War Era Digest',
    subject: 'Political Science',
    classId: 'cls-12-arts',
    stream: 'arts',
    category: 'Revision Digest',
    author: 'Pi R. Lalhmingmawii (PGT Arts)',
    fileType: 'PDF',
    fileSize: '4.2 MB',
    downloadUrl: '#',
    uploadedDate: '2026-09-14',
    downloadsCount: 98,
    hasFormulaCheatSheet: false,
    tags: ['Constitution', 'Arts Stream', 'MBSE Syllabus']
  },
  {
    id: 'mat-005',
    title: 'Class 12 Accountancy - Company Balance Sheet & Partnership Solved Problems',
    subject: 'Accountancy',
    classId: 'cls-12-comm',
    stream: 'commerce',
    category: 'Solved Examples',
    author: 'Pu Timothy Lalmuanawma (PGT Commerce)',
    fileType: 'PDF',
    fileSize: '2.8 MB',
    downloadUrl: '#',
    uploadedDate: '2026-09-17',
    downloadsCount: 112,
    hasFormulaCheatSheet: true,
    tags: ['Commerce', 'Partnership', 'Cash Flow', 'Balance Sheet']
  }
];

// ==========================================
// 8. OFFICIAL SCHOOL SEAL & PRINCIPAL SIGNATURE CONFIG
// ==========================================
export const INITIAL_SEAL_CONFIG = {
  schoolCrestText: 'OHA • OXFORD HIGHER ACADEMY • LUNGLAWN, LUNGLEI',
  affiliationNumber: 'MBSE Affiliation No: MBSE-HSS-LGL-0421',
  mottoText: 'KNOWLEDGE IS LIGHT',
  establishedYear: '1998',
  sealColor: '#d97706',
  sealType: 'circular_crest',
  showSealOnTC: true,
  showSealOnReportCard: true,
  showSealOnCertificates: true,
  sealOpacity: 0.88,
  principalSignatoryName: 'Dr. F. Lalhmachhuana',
  principalDesignation: 'Principal & Head of Institution',
  signatureMode: 'calligraphic',
  signatureSvgData: '',
  calligraphyStyle: 'cursive_formal',
  dateStampFormat: 'DD MMMM YYYY',
  counterSignatoryName: 'Prof. Lalthanmawia (Vice Principal)',
  enableDigitalVerificationQr: true
};

// ==========================================
// 9. PUBLIC SCHOOL WEBSITE & CMS CONFIG
// ==========================================
export const INITIAL_WEBSITE_CONFIG = {
  enabled: true,
  schoolName: 'OHA (Oxford Higher Academy)',
  tagline: 'Excellence in Education, Discipline & Moral Character',
  motto: 'Knowledge is Light (Hriatna chu Eng a ni)',
  establishedYear: '1998',
  affiliationBadge: 'MBSE Affiliated Higher Secondary Institution',
  logoUrl: '/favicon.svg',
  hero: {
    badge: '🎓 Admissions Open for Academic Session 2026 - 2027',
    headline: 'Nurturing Leaders of Tomorrow in Lunglawn, Lunglei',
    subheadline: 'Providing holistic secondary and higher secondary education with modern science laboratories, dedicated faculty, and vibrant campus life in Lunglawn, Lunglei, Mizoram.',
    ctaPrimaryText: 'Apply for Admission Online',
    ctaPrimaryLink: 'admissions',
    ctaSecondaryText: 'Explore Campus & Facilities',
    ctaSecondaryLink: 'facilities',
    heroImage: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=1200&auto=format&fit=crop&q=80',
    stats: [
      { label: 'Students Enrolled', value: '1,250+' },
      { label: 'MBSE Pass Rate', value: '99.2%' },
      { label: 'Expert Faculty', value: '48+' },
      { label: 'Years of Service', value: '28' }
    ]
  },
  principalMessage: {
    name: 'Dr. F. Lalhmachhuana',
    designation: 'Principal & Head of Institution',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    quote: 'Our mission is to nurture not just academic toppers, but compassionate leaders grounded in moral integrity and service to Mizoram and the nation.',
    fullMessage: 'At OHA (Oxford Higher Academy), Lunglawn, Lunglei, we believe that true education enlightens the mind and strengthens character. For nearly three decades, our institution has stood as a beacon of academic rigor and moral discipline in southern Mizoram. We warmly welcome every student and parent to join our OHA family.'
  },
  programs: [
    {
      id: 'hsslc_science',
      title: 'HSSLC Science Stream',
      duration: 'Class 11 - 12',
      badge: 'MBSE Affiliated',
      description: 'Physics, Chemistry, Biology, Mathematics & Computer Science with modern research labs and NEET/JEE mentoring.',
      icon: 'Atom'
    },
    {
      id: 'hsslc_arts',
      title: 'HSSLC Arts & Humanities',
      duration: 'Class 11 - 12',
      badge: 'MBSE Affiliated',
      description: 'Political Science, History, Education, Economics, Mizo Elective & English Literature nurturing future civil servants and thinkers.',
      icon: 'BookOpen'
    },
    {
      id: 'hsslc_commerce',
      title: 'HSSLC Commerce Stream',
      duration: 'Class 11 - 12',
      badge: 'MBSE Affiliated',
      description: 'Accountancy, Business Studies, Economics, and Financial Mathematics with modern software and CA foundation training.',
      icon: 'TrendingUp'
    },
    {
      id: 'hslc_secondary',
      title: 'Secondary School (High School)',
      duration: 'Class 9 - 10',
      badge: 'State Curriculum',
      description: 'Comprehensive curriculum focusing on STEM foundations, language proficiency, physical education and moral science.',
      icon: 'Award'
    },
    {
      id: 'primary_middle',
      title: 'Primary & Middle Section',
      duration: 'Nursery to Class 8',
      badge: 'Foundational Stage',
      description: 'Activity-based learning, phonics, mental math, moral development, sports and arts in a supportive environment.',
      icon: 'Sparkles'
    }
  ],
  facilities: [
    {
      title: 'Advanced Science Laboratories',
      description: 'Separate Physics, Chemistry and Biology research-grade labs with optical benches, chemical hoods and digital microscopes.',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80'
    },
    {
      title: 'High-Speed Computer & AI Lab',
      description: '60 networked terminals with high-speed fiber internet, coding tools, and multimedia workstations for digital learning.',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
    },
    {
      title: 'Centenary Central Library',
      description: 'Over 12,000 physical volumes, reference encyclopedias, competitive exam digests, and silent study halls.',
      image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80'
    },
    {
      title: 'Residential Hostels & Sports Ground',
      description: 'Safe on-campus boys & girls boarding with wholesome dining, basketball court, badminton hall, and football ground in Lunglawn.',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80'
    }
  ],
  contact: {
    address: 'Lunglawn, Lunglei, Mizoram - 796701',
    phone: '+91 372 2322104 / +91 94361 40552',
    email: 'oha.lunglawn@gmail.com',
    officeHours: 'Monday - Friday: 8:30 AM - 4:00 PM',
    googleMapEmbedUrl: ''
  },
  socialLinks: {
    facebook: 'https://facebook.com',
    youtube: 'https://youtube.com',
    instagram: 'https://instagram.com',
    whatsapp: 'https://wa.me/919436140552'
  }
};

export const INITIAL_DISCIPLINARY_RECORDS = [
  {
    id: 'disp-2026-001',
    studentId: 'stu-107',
    studentName: 'F. Lalhmingliana Pachuau',
    admissionNo: 'MZ-2026-0107',
    classId: 'cls-12-sci',
    actionType: 'suspension',
    severity: 'high',
    reasonCategory: 'bunking',
    title: 'Unauthorized Campus Leaving & Class Bunking',
    description: 'Caught leaving campus through back gate without gate pass during Chemistry practical hour.',
    startDate: '2026-09-18',
    endDate: '2026-09-24',
    durationDays: 7,
    issuedBy: 'Sir Lalthana (Class Master)',
    issuedByRole: 'teacher',
    authorizedBy: 'Dr. R. Lalrintluanga (Principal)',
    status: 'active',
    notifiedParents: true,
    notificationChannel: 'whatsapp_sms',
    guardianPhone: '+91 94361 28941',
    hearingNotes: 'Guardian summoned for counseling on Monday 11:00 AM. Agreed to monitor movement.',
    createdAt: '2026-09-18T10:30:00Z',
    revokedAt: null,
    revokedReason: null,
    revokedBy: null
  },
  {
    id: 'disp-2026-002',
    studentId: 'stu-101',
    studentName: 'Lalmuanpuia Hmar',
    admissionNo: 'MZ-2026-0101',
    classId: 'cls-12-sci',
    actionType: 'warning',
    severity: 'low',
    reasonCategory: 'misconduct',
    title: 'Uniform Code Non-Compliance Warning',
    description: 'First official reminder regarding non-regulation footwear.',
    startDate: '2026-08-10',
    endDate: '2026-08-10',
    durationDays: 1,
    issuedBy: 'Miss Cindy Lalduhawmi',
    issuedByRole: 'staff',
    authorizedBy: 'Vice Principal',
    status: 'completed',
    notifiedParents: false,
    notificationChannel: 'portal',
    guardianPhone: '+91 94361 40293',
    hearingNotes: 'Student resolved to correct uniform with immediate effect.',
    createdAt: '2026-08-10T09:15:00Z',
    revokedAt: null,
    revokedReason: null,
    revokedBy: null
  }
];

// ==========================================
// 11. IN-APP MASTER ARCHITECTURE SEED DATA
// ==========================================
export const INITIAL_SUBJECTS = [
  { id: 'sub-01', name: 'English Literature & Language', code: 'ENG-101', stream: 'all', category: 'Core Language', fullMarks: 100, passMarks: 40, classes: ['cls-11-sci', 'cls-11-arts', 'cls-11-comm', 'cls-12-sci', 'cls-12-arts', 'cls-12-comm'] },
  { id: 'sub-02', name: 'Mizo (MIL)', code: 'MIZ-102', stream: 'all', category: 'Modern Indian Language', fullMarks: 100, passMarks: 40, classes: ['cls-11-sci', 'cls-11-arts', 'cls-11-comm', 'cls-12-sci', 'cls-12-arts', 'cls-12-comm'] },
  { id: 'sub-03', name: 'Physics (Theory & Practical)', code: 'PHY-201', stream: 'science', category: 'STEM Core', fullMarks: 100, passMarks: 40, classes: ['cls-11-sci', 'cls-12-sci'] },
  { id: 'sub-04', name: 'Chemistry (Theory & Practical)', code: 'CHM-202', stream: 'science', category: 'STEM Core', fullMarks: 100, passMarks: 40, classes: ['cls-11-sci', 'cls-12-sci'] },
  { id: 'sub-05', name: 'Mathematics', code: 'MTH-203', stream: 'science', category: 'STEM Core', fullMarks: 100, passMarks: 40, classes: ['cls-11-sci', 'cls-12-sci', 'cls-11-comm', 'cls-12-comm'] },
  { id: 'sub-06', name: 'Biology (Botany & Zoology)', code: 'BIO-204', stream: 'science', category: 'Life Sciences', fullMarks: 100, passMarks: 40, classes: ['cls-11-sci', 'cls-12-sci'] },
  { id: 'sub-07', name: 'Computer Science & Python', code: 'CSC-205', stream: 'science', category: 'Information Technology', fullMarks: 100, passMarks: 40, classes: ['cls-11-sci', 'cls-12-sci'] },
  { id: 'sub-08', name: 'Political Science', code: 'POL-301', stream: 'arts', category: 'Social Sciences', fullMarks: 100, passMarks: 40, classes: ['cls-11-arts', 'cls-12-arts'] },
  { id: 'sub-09', name: 'History of India & World', code: 'HIS-302', stream: 'arts', category: 'Humanities', fullMarks: 100, passMarks: 40, classes: ['cls-11-arts', 'cls-12-arts'] },
  { id: 'sub-10', name: 'Education', code: 'EDU-303', stream: 'arts', category: 'Pedagogy', fullMarks: 100, passMarks: 40, classes: ['cls-11-arts', 'cls-12-arts'] },
  { id: 'sub-11', name: 'Economics', code: 'ECO-304', stream: 'arts', category: 'Social Sciences', fullMarks: 100, passMarks: 40, classes: ['cls-11-arts', 'cls-12-arts', 'cls-11-comm', 'cls-12-comm'] },
  { id: 'sub-12', name: 'Accountancy', code: 'ACC-401', stream: 'commerce', category: 'Financial Commerce', fullMarks: 100, passMarks: 40, classes: ['cls-11-comm', 'cls-12-comm'] },
  { id: 'sub-13', name: 'Business Studies', code: 'BST-402', stream: 'commerce', category: 'Management', fullMarks: 100, passMarks: 40, classes: ['cls-11-comm', 'cls-12-comm'] }
];

export const INITIAL_GRADING_SCALES = [
  { id: 'grd-01', grade: 'A1', minScore: 91, maxScore: 100, gradePoint: 10.0, remark: 'Outstanding Performance', color: '#10b981' },
  { id: 'grd-02', grade: 'A2', minScore: 81, maxScore: 90, gradePoint: 9.0, remark: 'Excellent', color: '#06b6d4' },
  { id: 'grd-03', grade: 'B1', minScore: 71, maxScore: 80, gradePoint: 8.0, remark: 'Very Good', color: '#6366f1' },
  { id: 'grd-04', grade: 'B2', minScore: 61, maxScore: 70, gradePoint: 7.0, remark: 'Good', color: '#8b5cf6' },
  { id: 'grd-05', grade: 'C1', minScore: 51, maxScore: 60, gradePoint: 6.0, remark: 'Satisfactory / Above Average', color: '#f59e0b' },
  { id: 'grd-06', grade: 'C2', minScore: 41, maxScore: 50, gradePoint: 5.0, remark: 'Average Pass', color: '#f97316' },
  { id: 'grd-07', grade: 'D', minScore: 33, maxScore: 40, gradePoint: 4.0, remark: 'Marginal Pass', color: '#eab308' },
  { id: 'grd-08', grade: 'E', minScore: 0, maxScore: 32, gradePoint: 0.0, remark: 'Needs Improvement / Remedial Required', color: '#ef4444' }
];

export const INITIAL_FEE_HEADS = [
  { id: 'fh-00', name: 'Monthly School Fee', code: 'MONTHLY_FEE', frequency: 'monthly', defaultAmount: 1800, mandatory: true, description: 'Compulsory standard monthly institutional school fee for all enrolled students.' },
  { id: 'fh-01', name: 'Evening Tuition & Coaching (Optional)', code: 'TUITION_OPTIONAL', frequency: 'monthly', defaultAmount: 1200, mandatory: false, description: 'Optional extra coaching & evening tuition fee for participating students only.' },
  { id: 'fh-02', name: 'Annual Admission & Registration', code: 'ADM_REG', frequency: 'annual', defaultAmount: 3500, mandatory: true, description: 'Institutional session enrolment and board record maintenance.' },
  { id: 'fh-03', name: 'MBSE Terminal Examination Fee', code: 'EXAM_TERM', frequency: 'term', defaultAmount: 800, mandatory: true, description: 'Question paper printing, answer script evaluation, and marksheet generation.' },
  { id: 'fh-04', name: 'Science & Computer Lab Fee', code: 'LAB_PRACTICAL', frequency: 'term', defaultAmount: 600, mandatory: false, description: 'Reagents, microscopes, internet bandwidth, and optical equipment upkeep.' },
  { id: 'fh-05', name: 'Campus Bus Transport (Optional)', code: 'TRANSPORT_BUS', frequency: 'monthly', defaultAmount: 1200, mandatory: false, description: 'Daily bus transit with live GPS tracking for day scholars.' },
  { id: 'fh-06', name: 'Residential Hostel Boarding & Mess', code: 'HOSTEL_MESS', frequency: 'monthly', defaultAmount: 4500, mandatory: false, description: 'Hostel dorm bed, electricity, laundry and 3 hot meals per day.' }
];

export const INITIAL_DOCUMENT_TEMPLATES = {
  transferCertificate: {
    header: 'TRANSFER CERTIFICATE (TC) / SCHOOL LEAVING RECORD',
    subHeader: 'Issued under the authority of Oxford Higher Academy, Lunglawn, Lunglei (MBSE Affiliated)',
    bodyTemplate: 'This is to certify that {{studentName}}, Son/Daughter of {{guardianName}}, bearing Admission No: {{admissionNo}} and Roll No: {{rollNo}}, was admitted to this institution in Class {{class}} on {{admissionDate}}. He/She has paid all institutional school dues and has passed the qualifying board assessments with exemplary conduct. He/She is granted this Transfer Certificate to pursue further education.',
    conductRemark: 'Exemplary and Diligent',
    signatoryLeft: 'Class Teacher',
    signatoryRight: 'Principal & Head of Institution'
  },
  characterCertificate: {
    header: 'BONAFIDE RESIDENTIAL & CHARACTER CERTIFICATE',
    subHeader: 'Department of School Education, Govt. of Mizoram',
    bodyTemplate: 'TO WHOMSOEVER IT MAY CONCERN: This is to officially certify that {{studentName}}, Son/Daughter of {{guardianName}}, resident of {{address}}, is a bonafide student of {{schoolName}} studying in {{class}}. He/She bears an upright moral character and has shown active participation in curricular and co-curricular sports and cultural programs.',
    signatoryLeft: 'Vice Principal',
    signatoryRight: 'Principal'
  }
};

export const INITIAL_NOMENCLATURE = {
  institutionHead: 'Principal & Head of Institution',
  academicDean: 'Vice Principal / Academic Dean',
  classMentor: 'Class Teacher / Class Master',
  boardingWarden: 'Hostel Superintendent / Warden',
  termDivision: 'Term Examination',
  dormitoryLabel: 'Boarding Hostel',
  transitLabel: 'School Bus Fleet'
};

