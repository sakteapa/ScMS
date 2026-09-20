import { NotificationTemplate, NotificationLog } from '../types';

export const DEFAULT_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  // Attendance Absent Alerts
  {
    id: 'tmpl-att-mizo',
    name: 'Absent Alert (Mizo)',
    category: 'Attendance Alert',
    language: 'Mizo',
    description: 'Direct Mizo notice to parents informing of student absence today.',
    subject: 'Zirlai Sikul Kal Lo Hriattirna (Absent Alert)',
    content: `Nu leh Pa Chibai,
Vawiin ni {{date}} hian i fa {{student_name}} (Roll No: {{roll_no}}, {{class_name}}) chu ZOXS Higher Secondary School, Aizawl-ah a rawn kal lo (ABSENT) tih kan inhriattir a che. Chhan hriat lawk loh anih chuan rang takin class teacher ({{teacher_name}}) bia ang che.
- Principal, ZOXS School`,
    defaultChannel: 'WhatsApp',
  },
  {
    id: 'tmpl-att-eng',
    name: 'Absent Alert (English)',
    category: 'Attendance Alert',
    language: 'English',
    description: 'Standard English notification for unplanned student absence.',
    subject: 'Student Attendance Alert: Absence Recorded',
    content: `Dear Parent/Guardian,
Please be informed that {{student_name}} (Roll No: {{roll_no}}, Class: {{class_name}}) is marked ABSENT today ({{date}}) at ZOXS Higher Secondary School, Aizawl. If this absence is unplanned or emergency, please contact the class teacher immediately.
- Principal Office, ZOXS HSS`,
    defaultChannel: 'WhatsApp',
  },
  {
    id: 'tmpl-att-bilingual',
    name: 'Absent Alert (Bilingual)',
    category: 'Attendance Alert',
    language: 'Bilingual',
    description: 'Combined English & Mizo notice for rapid parental acknowledgment.',
    subject: 'Attendance Alert / Sikul Kal Lo Hriattirna',
    content: `ATTENDANCE ALERT / SIKUL KAL LO:
{{student_name}} (Roll No: {{roll_no}}, {{class_name}}) is marked ABSENT today ({{date}}) at ZOXS HSS Aizawl.
Vawiin hian sikul a rawn kal lo a, chhan hriat loh a nih chuan class teacher zawtfiah ang che.
Phone: +91 98621 00000 | ZOXS School Aizawl`,
    defaultChannel: 'SMS',
  },

  // Fee Due Reminders
  {
    id: 'tmpl-fee-mizo',
    name: 'Fee Due Notice (Mizo)',
    category: 'Fee Due Reminder',
    language: 'Mizo',
    description: 'Formal reminder in Mizo with pending amount and UPI/Counter instructions.',
    subject: 'School Fee Ba Pek Tura Hriattirna',
    content: `Nu leh Pa zahawm takte,
ZOXS Higher Secondary School, Aizawl atangin hriattirna:
{{student_name}} (Roll No: {{roll_no}}, {{class_name}}) school fee ba zawng zawng ₹{{amount_due}} hi ni {{due_date}} hma a pe fel turin kan ngen a che.
School Accounts Counter-ah emaw UPI ID: mizo-highschool@sbi hmangin i pe thei e.
Receipt print theih a ni. - Bursar & Accounts Desk`,
    defaultChannel: 'WhatsApp',
  },
  {
    id: 'tmpl-fee-eng',
    name: 'Fee Due Notice (English)',
    category: 'Fee Due Reminder',
    language: 'English',
    description: 'Professional English reminder with due date and payment channels.',
    subject: 'Institutional Fee Payment Reminder - ZOXS HSS',
    content: `Dear Parent/Guardian,
This is a gentle reminder from ZOXS Higher Secondary School that the school fee balance of ₹{{amount_due}} for {{student_name}} (Roll No: {{roll_no}}, {{class_name}}) is pending for payment by {{due_date}}.
Payments can be completed at the School Accounts Desk (Cash/Card) or via Official UPI: mizo-highschool@sbi.
- Accounts & Finance Section, ZOXS School`,
    defaultChannel: 'WhatsApp',
  },
  {
    id: 'tmpl-fee-bilingual',
    name: 'Fee Due Reminder (Bilingual)',
    category: 'Fee Due Reminder',
    language: 'Bilingual',
    description: 'Compact bilingual reminder ideal for both SMS & WhatsApp.',
    subject: 'Fee Due Alert / Fee Pek Tura Hriattirna',
    content: `FEE REMINDER / FEE PEK HRIATTIRNA:
Pending fee balance for {{student_name}} ({{class_name}}) is ₹{{amount_due}}, due by {{due_date}}.
Khawngaihin school counter-ah emaw UPI (mizo-highschool@sbi) hmangin pe fel hram ang che.
ZOXS HSS Aizawl. Info: 0389-232244`,
    defaultChannel: 'SMS',
  },

  // School Announcements & Notices
  {
    id: 'tmpl-ann-holiday',
    name: 'Holiday Announcement (Chapchar Kut / State)',
    category: 'School Announcement',
    language: 'Bilingual',
    description: 'School closure notice for local Mizoram festivals or state holidays.',
    subject: 'School Holiday Notice / Chawlh Hriattirna',
    content: `SCHOOL HOLIDAY NOTICE / CHAWLH HRIATTIRNA:
ZOXS Higher Secondary School, Aizawl will remain closed on {{date}} on account of state festival/holiday. Classes will resume normally on the next working day as per routine timetable.
Zirlai zawng zawngte chawlh hman nuam vek u le!
- Headmaster / Principal, ZOXS HSS`,
    defaultChannel: 'WhatsApp',
  },
  {
    id: 'tmpl-ann-weather',
    name: 'Rain / Landslide Advisory (Disaster Advisory)',
    category: 'School Announcement',
    language: 'Bilingual',
    description: 'Emergency weather announcement for heavy monsoon rains in Aizawl.',
    subject: 'Emergency Weather & Class Advisory (Ruahsur Vang)',
    content: `URGENT SCHOOL ADVISORY / RUANHSUR LEH LEI MIN VANG:
Due to continuous heavy rainfall and Aizawl District Disaster Management advisory, school timing for today ({{date}}) is suspended/adjusted for student safety.
Zirlai leh nu leh pate fimkhur tura ngen in ni e.
- Disaster Safety Committee, ZOXS School`,
    defaultChannel: 'SMS',
  },
  {
    id: 'tmpl-ann-ptm',
    name: 'Parents-Teachers Meeting (PTM)',
    category: 'School Announcement',
    language: 'Bilingual',
    description: 'Invitation for academic assessment review and report card distribution.',
    subject: 'Parents-Teachers Meeting (PTM) Invitation',
    content: `PARENTS-TEACHERS MEETING (PTM) INVITATION:
Dear Parents of {{class_name}}, you are cordially invited to attend the Academic Review & PTM on {{date}} at 10:30 AM in the School Auditorium.
Zirlai zirla buatsaih dan leh Term exam result sawiho a ni ang a, nu leh pate lo kal ngei tura beisei in ni e.
- Principal, ZOXS School`,
    defaultChannel: 'WhatsApp',
  },
  {
    id: 'tmpl-ann-exam',
    name: 'MBSE Exam Schedule Notice',
    category: 'Exam Notice',
    language: 'English',
    description: 'Notice regarding upcoming MBSE examination routines and admit cards.',
    subject: 'MBSE High School Examination 2026 Routine Notice',
    content: `MBSE EXAMINATION NOTICE:
Dear Parents, the official routine for Term Examination has been published on the school noticeboard. Please ensure {{student_name}} ({{class_name}}) has cleared all fee dues to collect the Examination Admit Card by {{due_date}}.
- Examination Controller, ZOXS HSS Aizawl`,
    defaultChannel: 'WhatsApp',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationLog[] = [
  {
    id: 'notif-101',
    studentId: 'std-3',
    studentName: 'Lalrinhlua',
    rollNo: 3,
    classId: 'class_10_a',
    className: 'Class 10 - Section A',
    parentName: 'Pu K. Lalthanzama',
    parentPhone: '+91 98625 67890',
    channel: 'WhatsApp',
    category: 'Attendance Alert',
    templateId: 'tmpl-att-mizo',
    subject: 'Zirlai Sikul Kal Lo Hriattirna (Absent Alert)',
    message: 'Nu leh Pa Chibai, Vawiin ni 2026-09-18 hian i fa Lalrinhlua (Roll No: 3, Class 10 - Section A) chu ZOXS Higher Secondary School, Aizawl-ah a rawn kal lo (ABSENT) tih kan inhriattir a che. Chhan hriat lawk loh anih chuan rang takin class teacher (Sir Lalbiakzuala Ralte) bia ang che. - Principal, ZOXS School',
    status: 'Delivered',
    timestamp: '2026-09-18T09:15:00Z',
    sentAt: '2026-09-18T09:15:05Z',
    deliveredAt: '2026-09-18T09:15:18Z',
    gatewayRef: 'WA-MSG-9862567890-8841',
    dispatchedBy: 'Class Teacher (Sir Lalbiakzuala)',
  },
  {
    id: 'notif-102',
    studentId: 'std-7',
    studentName: 'Laltlanhlua',
    rollNo: 5,
    classId: 'class_9_b',
    className: 'Class 9 - Section B',
    parentName: 'Pu T. Vanlalhruaia',
    parentPhone: '+91 98629 01234',
    channel: 'SMS',
    category: 'Attendance Alert',
    templateId: 'tmpl-att-bilingual',
    subject: 'Attendance Alert / Sikul Kal Lo',
    message: 'ATTENDANCE ALERT / SIKUL KAL LO: Laltlanhlua (Roll No: 5, Class 9 - Section B) is marked ABSENT today (2026-09-18) at ZOXS HSS Aizawl. Vawiin hian sikul a rawn kal lo e. Info: +91 98621 00000',
    status: 'Sent',
    timestamp: '2026-09-18T09:20:00Z',
    sentAt: '2026-09-18T09:20:10Z',
    gatewayRef: 'SMS-NIC-DLT-892104',
    dispatchedBy: 'Attendance Officer',
  },
  {
    id: 'notif-103',
    studentId: 'std-5',
    studentName: 'Lalhmingmawii',
    rollNo: 5,
    classId: 'class_10_a',
    className: 'Class 10 - Section A',
    parentName: 'Pi Zodingliani',
    parentPhone: '+91 98627 89012',
    channel: 'WhatsApp',
    category: 'Fee Due Reminder',
    templateId: 'tmpl-fee-mizo',
    subject: 'School Fee Ba Pek Tura Hriattirna',
    message: 'Nu leh Pa zahawm takte, ZOXS Higher Secondary School atangin hriattirna: Lalhmingmawii (Roll No: 5, Class 10 - Section A) school fee ba zawng zawng ₹2,200 hi ni 2026-09-25 hma a pe fel turin kan ngen a che. UPI ID: mizo-highschool@sbi. - Bursar',
    status: 'Delivered',
    timestamp: '2026-09-17T11:30:00Z',
    sentAt: '2026-09-17T11:30:05Z',
    deliveredAt: '2026-09-17T11:30:22Z',
    gatewayRef: 'WA-MSG-9862789012-7712',
    dispatchedBy: 'Accounts Counter Desk',
  },
  {
    id: 'notif-104',
    studentId: 'std-6',
    studentName: 'C. Lalhmangaiha',
    rollNo: 2,
    classId: 'class_9_b',
    className: 'Class 9 - Section B',
    parentName: 'Pu C. Rokunga',
    parentPhone: '+91 98628 90123',
    channel: 'SMS',
    category: 'Fee Due Reminder',
    templateId: 'tmpl-fee-bilingual',
    subject: 'Fee Due Alert / Fee Pek Tura Hriattirna',
    message: 'FEE REMINDER: Pending fee balance for C. Lalhmangaiha (Class 9 - Section B) is ₹2,200, due by 2026-09-25. Khawngaihin school counter-ah emaw UPI mizo-highschool@sbi hmangin pe fel hram ang che. ZOXS HSS.',
    status: 'Failed',
    timestamp: '2026-09-17T11:35:00Z',
    sentAt: '2026-09-17T11:35:04Z',
    failureReason: 'Telecom Carrier DND active or destination unreachable (+91 98628 90123)',
    gatewayRef: 'SMS-FAIL-DLT-9921',
    dispatchedBy: 'Accounts Counter Desk',
  },
  {
    id: 'notif-105',
    studentId: undefined,
    studentName: 'All Students (General Notice)',
    classId: undefined,
    className: 'All Classes (School-Wide)',
    parentName: 'All Parents & Guardians',
    parentPhone: 'Bulk Broadcast (180 Recipients)',
    channel: 'WhatsApp',
    category: 'School Announcement',
    templateId: 'tmpl-ann-ptm',
    subject: 'Parents-Teachers Meeting (PTM) Invitation',
    message: 'PARENTS-TEACHERS MEETING (PTM) INVITATION: Dear Parents, you are cordially invited to attend the Academic Review & PTM on Saturday, 2026-09-26 at 10:30 AM in the School Auditorium. Zirlai result sawiho a ni ang. - Principal, ZOXS School',
    status: 'Delivered',
    timestamp: '2026-09-16T14:00:00Z',
    sentAt: '2026-09-16T14:00:15Z',
    deliveredAt: '2026-09-16T14:01:00Z',
    gatewayRef: 'WA-BROADCAST-20260916',
    dispatchedBy: 'Principal Office',
  },
  {
    id: 'notif-106',
    studentId: 'std-8',
    studentName: 'Vanlalpeka',
    rollNo: 8,
    classId: 'class_8_a',
    className: 'Class 8 - Section A',
    parentName: 'Pi Lalmuankimi',
    parentPhone: '+91 98620 12345',
    channel: 'SMS',
    category: 'Attendance Alert',
    templateId: 'tmpl-att-bilingual',
    subject: 'Attendance Alert / Sikul Kal Lo',
    message: 'ATTENDANCE ALERT: Vanlalpeka (Roll No: 8, Class 8 - Section A) is marked ABSENT today (2026-09-18) at ZOXS HSS Aizawl. Contact school office: 0389-232244',
    status: 'Pending',
    timestamp: '2026-09-18T09:40:00Z',
    sentAt: undefined,
    gatewayRef: 'SMS-QUEUE-10023',
    dispatchedBy: 'Class Teacher (Sir R. Lalthansanga)',
  },
];
