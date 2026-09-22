/**
 * Mizoram Model Demonstration Academy (Center ID: demo)
 * Dedicated Seed Data & Showcase Configuration for Live Demo Testing
 */

export const DEMO_SCHOOL_INFO = {
  id: 'demo',
  name: 'Mizoram Model Demonstration Academy',
  shortName: 'Mizoram Demo Academy',
  subdomain: 'demo',
  code: 'DEMO-MZ-00',
  address: 'Model Veng, Ramhlun North, Aizawl, Mizoram - 796012',
  contactPhone: '+91 98623 00100 / +91 94361 00200',
  contactEmail: 'demo.academy@mizoramschool.edu.in',
  motto: 'Inspiring Excellence & Innovation (Hlawhtlinna leh Hmasawnna)',
  affiliationBadge: 'MBSE Model Lab • Live Interactive Demo',
  primaryColor: '#6366f1',
  secondaryColor: '#06b6d4',
  establishedYear: 2020
};

export const DEMO_CLASSES = [
  {
    id: 'demo-cls-nursery',
    name: 'Nursery (Early Spark)',
    level: 'nursery',
    stream: null,
    section: 'A',
    roomNumber: 'KG-101',
    academicYear: '2026 - 2027',
    teacherName: 'Pi Cynthia Lalduhzuali',
    classTeacherId: 'demo-stf-005',
    classLeaderId: null,
    classLeaderName: null
  },
  {
    id: 'demo-cls-5',
    name: 'Class 5 - Primary Achievers',
    level: '5',
    stream: null,
    section: 'A',
    roomNumber: 'PR-201',
    academicYear: '2026 - 2027',
    teacherName: 'Pu Robert Lalthansanga',
    classTeacherId: 'demo-stf-006',
    classLeaderId: 'demo-stu-004',
    classLeaderName: 'Lalrinhlua Sailo'
  },
  {
    id: 'demo-cls-9',
    name: 'Class 9 - High School',
    level: '9',
    stream: null,
    section: 'A',
    roomNumber: 'HS-301',
    academicYear: '2026 - 2027',
    teacherName: 'Pu Zonunsanga Colney',
    classTeacherId: 'demo-stf-003',
    classLeaderId: 'demo-stu-001',
    classLeaderName: 'Lalmuanpuia Ralte'
  },
  {
    id: 'demo-cls-10',
    name: 'Class 10 (MBSE Board Batch)',
    level: '10',
    stream: null,
    section: 'A',
    roomNumber: 'HS-302',
    academicYear: '2026 - 2027',
    teacherName: 'Pi Mary Lalnunpuii',
    classTeacherId: 'demo-stf-004',
    classLeaderId: 'demo-stu-002',
    classLeaderName: 'Zonunmawii Pachuau'
  },
  {
    id: 'demo-cls-11-sci',
    name: 'Class 11 - Science (STEM Stream)',
    level: '11',
    stream: 'science',
    section: 'A',
    roomNumber: 'SC-401',
    academicYear: '2026 - 2027',
    teacherName: 'Pu Dr. David Lalhruaitluanga',
    classTeacherId: 'demo-stf-007',
    classLeaderId: 'demo-stu-005',
    classLeaderName: 'Malsawmtluanga Hmar'
  },
  {
    id: 'demo-cls-12-arts',
    name: 'Class 12 - Arts (Humanities Stream)',
    level: '12',
    stream: 'arts',
    section: 'A',
    roomNumber: 'AR-402',
    academicYear: '2026 - 2027',
    teacherName: 'Pi Rebecca Lalbiakdiki',
    classTeacherId: 'demo-stf-008',
    classLeaderId: 'demo-stu-006',
    classLeaderName: 'Grace Lalremruati'
  }
];

export const DEMO_STUDENTS = [
  {
    id: 'demo-stu-001',
    admissionNo: 'DEMO-2025-001',
    rollNo: '1',
    firstName: 'Lalmuanpuia',
    lastName: 'Ralte',
    classId: 'demo-cls-9',
    stream: null,
    academicSession: '2026 - 2027',
    gender: 'Male',
    dob: '2011-03-15',
    bloodGroup: 'O+',
    parentName: 'Pu C. Lalrintluanga Ralte',
    phone: '+91 98623 11001',
    email: 'muanpuia.demo@mizoramschool.edu.in',
    address: 'Ramhlun North, Aizawl, Mizoram',
    status: 'active',
    attendance: { present: 52, total: 54, rate: 96.3 },
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'demo-stu-002',
    admissionNo: 'DEMO-2024-042',
    rollNo: '1',
    firstName: 'Zonunmawii',
    lastName: 'Pachuau',
    classId: 'demo-cls-10',
    stream: null,
    academicSession: '2026 - 2027',
    gender: 'Female',
    dob: '2010-06-21',
    bloodGroup: 'A+',
    parentName: 'Pi Zonunsangi Pachuau',
    phone: '+91 98623 11002',
    email: 'zonuni.demo@mizoramschool.edu.in',
    address: 'Chanmari, Aizawl, Mizoram',
    status: 'active',
    attendance: { present: 53, total: 54, rate: 98.1 },
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'demo-stu-003',
    admissionNo: 'DEMO-2026-101',
    rollNo: '1',
    firstName: 'Lalthanpuia',
    lastName: 'Sailo',
    classId: 'demo-cls-nursery',
    stream: null,
    academicSession: '2026 - 2027',
    gender: 'Male',
    dob: '2022-09-10',
    bloodGroup: 'B+',
    parentName: 'Pu Sailo Lalhmingmawia',
    phone: '+91 98623 11003',
    email: 'parent.sailo@gmail.com',
    address: 'Zarkawt, Aizawl, Mizoram',
    status: 'active',
    attendance: { present: 48, total: 50, rate: 96.0 }
  },
  {
    id: 'demo-stu-004',
    admissionNo: 'DEMO-2023-018',
    rollNo: '1',
    firstName: 'Lalrinhlua',
    lastName: 'Sailo',
    classId: 'demo-cls-5',
    stream: null,
    academicSession: '2026 - 2027',
    gender: 'Male',
    dob: '2015-01-18',
    bloodGroup: 'AB+',
    parentName: 'Pu K. Lalrinchhana',
    phone: '+91 98623 11004',
    email: 'rinhlua.demo@mizoramschool.edu.in',
    address: 'Bawngkawn, Aizawl, Mizoram',
    status: 'active',
    attendance: { present: 50, total: 52, rate: 96.1 }
  },
  {
    id: 'demo-stu-005',
    admissionNo: 'DEMO-2025-205',
    rollNo: '1',
    firstName: 'Malsawmtluanga',
    lastName: 'Hmar',
    classId: 'demo-cls-11-sci',
    stream: 'science',
    academicSession: '2026 - 2027',
    gender: 'Male',
    dob: '2009-11-12',
    bloodGroup: 'O+',
    parentName: 'Pu Hmar Vanlalvena',
    phone: '+91 98623 11005',
    email: 'sawmtea.hmar@gmail.com',
    address: 'Tuikual North, Aizawl, Mizoram',
    status: 'active',
    attendance: { present: 51, total: 54, rate: 94.4 }
  },
  {
    id: 'demo-stu-006',
    admissionNo: 'DEMO-2024-310',
    rollNo: '1',
    firstName: 'Grace Lalremruati',
    lastName: 'Chhangte',
    classId: 'demo-cls-12-arts',
    stream: 'arts',
    academicSession: '2026 - 2027',
    gender: 'Female',
    dob: '2008-04-28',
    bloodGroup: 'A+',
    parentName: 'Pi Chhangte Lalbiaknungi',
    phone: '+91 98623 11006',
    email: 'grace.chhangte@gmail.com',
    address: 'Khatla, Aizawl, Mizoram',
    status: 'active',
    attendance: { present: 54, total: 54, rate: 100.0 }
  }
];

export const DEMO_STAFF = [
  {
    id: 'demo-stf-001',
    name: 'Pu Samuel Lalrinfela',
    role: 'principal',
    designation: 'Principal & Chief Administrator',
    department: 'Executive Administration',
    email: 'principal@demo.mizoramschool.edu.in',
    phone: '+91 98623 00100',
    status: 'active',
    joiningDate: '2020-01-10',
    salary: 120000,
    qualification: 'M.Ed, M.Sc (Computer Science), Ph.D (Honorary)'
  },
  {
    id: 'demo-stf-002',
    name: 'Pi Jennifer Lalhmangaihi',
    role: 'vice_principal',
    designation: 'Vice Principal & Academic Dean',
    department: 'Academic Council',
    email: 'vp@demo.mizoramschool.edu.in',
    phone: '+91 98623 00101',
    status: 'active',
    joiningDate: '2020-03-15',
    salary: 98000,
    qualification: 'M.A (English), B.Ed, Diploma in Ed. Tech'
  },
  {
    id: 'demo-stf-003',
    name: 'Pu Zonunsanga Colney',
    role: 'teacher',
    designation: 'Senior Faculty (Mathematics)',
    department: 'Science & Mathematics',
    email: 'zonunsanga.math@demo.edu.in',
    phone: '+91 98623 00102',
    status: 'active',
    joiningDate: '2021-02-01',
    salary: 78000,
    qualification: 'M.Sc (Mathematics), B.Ed'
  },
  {
    id: 'demo-stf-004',
    name: 'Pi Mary Lalnunpuii',
    role: 'teacher',
    designation: 'Faculty (Social Science & History)',
    department: 'Social Sciences',
    email: 'mary.soc@demo.edu.in',
    phone: '+91 98623 00103',
    status: 'active',
    joiningDate: '2021-05-15',
    salary: 75000,
    qualification: 'M.A (History), B.Ed'
  },
  {
    id: 'demo-stf-005',
    name: 'Pi Cynthia Lalduhzuali',
    role: 'teacher',
    designation: 'Early Childhood Education Head',
    department: 'Primary & Kindergarten',
    email: 'cynthia.kg@demo.edu.in',
    phone: '+91 98623 00104',
    status: 'active',
    joiningDate: '2022-01-10',
    salary: 65000,
    qualification: 'B.Ed (Early Childhood), NTT Certified'
  },
  {
    id: 'demo-stf-006',
    name: 'Pu Robert Lalthansanga',
    role: 'teacher',
    designation: 'Primary Head Teacher',
    department: 'Primary Wing',
    email: 'robert.pri@demo.edu.in',
    phone: '+91 98623 00105',
    status: 'active',
    joiningDate: '2021-08-01',
    salary: 72000,
    qualification: 'B.Sc, B.Ed'
  },
  {
    id: 'demo-stf-007',
    name: 'Pu Dr. David Lalhruaitluanga',
    role: 'teacher',
    designation: 'PGT Physics & STEM Coordinator',
    department: 'Higher Secondary Science',
    email: 'david.phy@demo.edu.in',
    phone: '+91 98623 00106',
    status: 'active',
    joiningDate: '2020-07-01',
    salary: 86000,
    qualification: 'Ph.D (Physics), M.Sc, B.Ed'
  },
  {
    id: 'demo-stf-008',
    name: 'Pi Rebecca Lalbiakdiki',
    role: 'teacher',
    designation: 'PGT Political Science',
    department: 'Higher Secondary Arts',
    email: 'rebecca.pol@demo.edu.in',
    phone: '+91 98623 00107',
    status: 'active',
    joiningDate: '2021-04-12',
    salary: 82000,
    qualification: 'M.A (Political Science), NET, B.Ed'
  },
  {
    id: 'demo-stf-009',
    name: 'Pu Lalchhanhima Sailo',
    role: 'warden',
    designation: 'Boys Hostel Superintendent & Warden',
    department: 'Residential Hostels',
    email: 'warden.boys@demo.edu.in',
    phone: '+91 98623 00108',
    status: 'active',
    joiningDate: '2020-09-01',
    salary: 62000,
    qualification: 'B.A, Diploma in Youth Administration'
  }
];

export const DEMO_SYSTEM_CONFIG = {
  schoolName: 'Mizoram Model Demonstration Academy',
  motto: 'Inspiring Excellence & Innovation (Hlawhtlinna leh Hmasawnna)',
  establishedYear: '2020',
  affiliationNo: 'MBSE-MODEL-DEMO-00',
  address: 'Model Veng, Ramhlun North, Aizawl, Mizoram - 796012',
  contactPhone: '+91 98623 00100 / +91 94361 00200',
  contactEmail: 'demo.academy@mizoramschool.edu.in',
  primaryColor: '#6366f1',
  currency: 'INR',
  currencySymbol: '₹',
  academicSession: '2026 - 2027',
  enableOnlineAdmissions: true,
  enableUpiPayments: true,
  enableSmsNotifications: true,
  enableHostelModule: true,
  enableTransportModule: true,
  schoolAiAssistant: {
    enabled: true,
    assistantName: 'Demo AI Co-Pilot',
    allowedRoles: ['principal', 'vice_principal', 'admin'],
    language: 'both'
  }
};

export const DEMO_WEBSITE_CONFIG = {
  schoolName: 'Mizoram Model Demonstration Academy',
  tagline: 'MBSE Model Lab • Live Interactive Demo',
  motto: 'Inspiring Excellence & Innovation',
  affiliationBadge: 'MBSE Model Lab • Aizawl, Mizoram',
  contact: {
    address: 'Model Veng, Ramhlun North, Aizawl, Mizoram - 796012',
    phone: '+91 98623 00100',
    email: 'demo.academy@mizoramschool.edu.in',
    officeHours: 'Monday - Friday: 8:00 AM - 4:30 PM'
  },
  hero: {
    badge: '🚀 Live Interactive ERP Demonstration • All Modules Unlocked',
    headline: 'Experience Next-Generation Digital Schooling in Mizoram',
    subheadline: 'Mizoram Model Demonstration Academy serves as the live benchmark for contemporary education technology, seamlessly integrating MBSE grading, smart student analytics, live GPS transport, and residential hostels.',
    ctaPrimaryText: 'Explore Interactive Demo ERP',
    ctaPrimaryLink: 'dashboard',
    ctaSecondaryText: 'View Online Admissions',
    ctaSecondaryLink: 'admissions',
    heroImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80',
    stats: [
      { label: 'Active Students', value: '1,120+' },
      { label: 'MBSE Pass Rate', value: '100%' },
      { label: 'Smart Classrooms', value: '28' },
      { label: 'Live Bus Fleets', value: '6' }
    ]
  },
  principalMessage: {
    name: 'Pu Samuel Lalrinfela',
    designation: 'Principal, Mizoram Model Demonstration Academy',
    principalDesignation: 'Principal, Mizoram Model Demonstration Academy',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop&q=80',
    quote: 'Technology when thoughtfully applied transforms ordinary education into extraordinary life foundations.',
    fullMessage: 'Welcome to the official live interactive portal of Mizoram Model Demonstration Academy. This digital environment demonstrates how an integrated cloud ERP elevates school administration, empowers educators with continuous assessment tools, and connects parents with their children\'s daily progress.'
  },
  announcementBanner: {
    enabled: true,
    badgeText: 'LIVE DEMO HUB',
    text: '🎉 Welcome to the Live Demonstration School! You are free to test drive admissions, fee payments, attendance scanning, marks entry, and hostel allocations in realtime.'
  }
};
