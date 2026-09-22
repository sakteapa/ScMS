/**
 * schoolAiEngine.js
 * School-level AI assistant engine for Principal / Vice Principal / Admin.
 * Context-aware NLP — reads live SchoolContext data to answer queries.
 */

// ─── Proactive Alert Scanner ─────────────────────────────────────────────────

export function getSchoolAiProactiveAlerts(ctx = {}) {
  const alerts = [];
  const now = new Date();

  const {
    students = [],
    fees = [],
    attendance = [],
    admissions = [],
    leaveApplications = [],
    tasks = [],
    notices = [],
    staff = [],
    hostelRooms = [],
    inventoryAssets = [],
    maintenanceTickets = [],
    clinicRecords = [],
  } = ctx;

  // ── Fee arrears ──────────────────────────────────────────────────────────
  const unpaidFees = fees.filter(f => f.status === 'unpaid' || f.status === 'overdue');
  if (unpaidFees.length > 0) {
    const totalDue = unpaidFees.reduce((s, f) => s + (parseFloat(f.amount) || 0), 0);
    alerts.push({
      id: 'fee-arrears',
      severity: unpaidFees.length > 20 ? 'high' : 'medium',
      icon: '₹',
      category: 'Finance',
      title: `${unpaidFees.length} Fee Arrear Record`,
      detail: `₹${totalDue.toLocaleString('en-IN')} a thawk awm a, student ${unpaidFees.length} hnen aṭang.`,
      action: { label: 'Financials en rawh', tab: 'financials' },
    });
  }

  // ── Pending admissions ───────────────────────────────────────────────────
  const pendingAdmissions = admissions.filter(a => a.status === 'pending' || a.status === 'reviewing');
  if (pendingAdmissions.length > 0) {
    alerts.push({
      id: 'pending-admissions',
      severity: 'medium',
      icon: '📋',
      category: 'Admissions',
      title: `${pendingAdmissions.length} Admission Pending Review`,
      detail: `Admission dilna ${pendingAdmissions.length} chu review/approval ngai a awm.`,
      action: { label: 'Admissions en rawh', tab: 'admissions' },
    });
  }

  // ── Leave applications pending ───────────────────────────────────────────
  const pendingLeave = leaveApplications.filter(l => l.status === 'pending');
  if (pendingLeave.length > 0) {
    alerts.push({
      id: 'pending-leave',
      severity: 'low',
      icon: '📅',
      category: 'Leave',
      title: `${pendingLeave.length} Leave Application Pending`,
      detail: `Staff/teacher leave dilna ${pendingLeave.length} chu hnawtna ngai.`,
      action: { label: 'Leave Management en rawh', tab: 'leave_management' },
    });
  }

  // ── Pending tasks ────────────────────────────────────────────────────────
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  if (pendingTasks.length > 0) {
    alerts.push({
      id: 'pending-tasks',
      severity: 'low',
      icon: '✅',
      category: 'Tasks',
      title: `${pendingTasks.length} Task a Tih Hmain`,
      detail: `Task ${pendingTasks.length} chu complete a ni lo tawh.`,
      action: { label: 'Dashboard en rawh', tab: 'dashboard' },
    });
  }

  // ── Maintenance tickets open ─────────────────────────────────────────────
  const openTickets = maintenanceTickets.filter(t => t.status === 'open' || t.status === 'pending');
  if (openTickets.length > 0) {
    alerts.push({
      id: 'maintenance',
      severity: 'low',
      icon: '🔧',
      category: 'Maintenance',
      title: `${openTickets.length} Maintenance Ticket Open`,
      detail: `Infrastructure issue ${openTickets.length} chu tih hmain awm.`,
      action: { label: 'Inventory en rawh', tab: 'inventory' },
    });
  }

  // ── Low clinic stock / critical records ─────────────────────────────────
  const criticalClinic = clinicRecords.filter(r => r.severity === 'critical' || r.status === 'admitted');
  if (criticalClinic.length > 0) {
    alerts.push({
      id: 'clinic-critical',
      severity: 'high',
      icon: '🏥',
      category: 'Clinic',
      title: `${criticalClinic.length} Critical Clinic Record`,
      detail: `Student/staff ${criticalClinic.length} chu medical attention critical awm.`,
      action: { label: 'Clinic en rawh', tab: 'clinic' },
    });
  }

  return alerts.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
}

// ─── Quick Stats ──────────────────────────────────────────────────────────────

export function getSchoolQuickStats(ctx = {}) {
  const {
    students = [],
    fees = [],
    attendance = [],
    admissions = [],
    staff = [],
    notices = [],
    classes = [],
  } = ctx;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === todayStr);
  const presentToday = todayAttendance.filter(a => a.status === 'present').length;
  const attendancePct = todayAttendance.length > 0
    ? Math.round((presentToday / todayAttendance.length) * 100)
    : null;

  const totalFeesDue = fees
    .filter(f => f.status === 'unpaid' || f.status === 'overdue')
    .reduce((s, f) => s + (parseFloat(f.amount) || 0), 0);

  const pendingAdmissions = admissions.filter(a => a.status === 'pending' || a.status === 'reviewing').length;

  return {
    totalStudents: students.length,
    totalStaff: staff.length,
    totalClasses: classes.length,
    attendancePct,
    presentToday,
    totalFeesDue,
    pendingAdmissions,
    totalNotices: notices.length,
  };
}

// ─── NLP Query Processor ──────────────────────────────────────────────────────

const QUERY_PATTERNS = [
  // Fee queries
  {
    pattern: /fee|arrear|sum|payment|hlawh|ṭha|paid|unpaid|due|ṭhalo/i,
    handler: (ctx) => {
      const { fees = [] } = ctx;
      const unpaid = fees.filter(f => f.status === 'unpaid' || f.status === 'overdue');
      const paid = fees.filter(f => f.status === 'paid');
      const totalDue = unpaid.reduce((s, f) => s + (parseFloat(f.amount) || 0), 0);
      const totalCollected = paid.reduce((s, f) => s + (parseFloat(f.amount) || 0), 0);
      return {
        text: `**Fee Summary:**\n• Paid/Collected: **₹${totalCollected.toLocaleString('en-IN')}** (${paid.length} records)\n• Unpaid/Due: **₹${totalDue.toLocaleString('en-IN')}** (${unpaid.length} students)\n\nFinancials tab ah hian detail record zawng zawng a awm.`,
        tab: 'financials',
        tabLabel: 'Financials en rawh',
      };
    }
  },
  // Student count
  {
    pattern: /student.*zat|student.*enroll|zirlai.*zat|how many.*student|total.*student/i,
    handler: (ctx) => {
      const { students = [], classes = [] } = ctx;
      const byClass = classes.map(c => ({
        name: c.name,
        count: students.filter(s => s.classId === c.id).length,
      }));
      const breakdown = byClass.filter(c => c.count > 0).map(c => `• ${c.name}: ${c.count}`).join('\n');
      return {
        text: `**Total Students: ${students.length}**\n\nClass-wise breakdown:\n${breakdown || 'Data a awm lo.'}`,
        tab: 'students',
        tabLabel: 'Students en rawh',
      };
    }
  },
  // Attendance today
  {
    pattern: /attendance|ni tuk|present|absent|vanglaih|today/i,
    handler: (ctx) => {
      const { attendance = [], students = [], classes = [] } = ctx;
      const todayStr = new Date().toISOString().split('T')[0];
      const todayRecs = attendance.filter(a => a.date === todayStr);
      const present = todayRecs.filter(a => a.status === 'present').length;
      const absent = todayRecs.filter(a => a.status === 'absent').length;
      const pct = todayRecs.length > 0 ? Math.round((present / todayRecs.length) * 100) : 0;
      if (todayRecs.length === 0) {
        return {
          text: `Ni tuk (${todayStr}) attendance record a awm lo tawh. QR Scanner/Attendance module hman la attendance la ang.`,
          tab: 'attendance',
          tabLabel: 'Attendance en rawh',
        };
      }
      return {
        text: `**Ni Tuk Attendance (${todayStr}):**\n• Present: **${present}** (${pct}%)\n• Absent: **${absent}**\n• Total recorded: ${todayRecs.length}\n\n${pct < 75 ? '⚠️ Attendance a hniam bawk — action lak ngai.' : '✅ Attendance level a ṭha.'}`,
        tab: 'attendance',
        tabLabel: 'Attendance en rawh',
      };
    }
  },
  // Admissions
  {
    pattern: /admission|apply|tharlam|dilna|new.*student|enroll/i,
    handler: (ctx) => {
      const { admissions = [] } = ctx;
      const pending = admissions.filter(a => a.status === 'pending' || a.status === 'reviewing');
      const approved = admissions.filter(a => a.status === 'approved');
      const rejected = admissions.filter(a => a.status === 'rejected');
      return {
        text: `**Admission Status:**\n• Pending Review: **${pending.length}**\n• Approved: **${approved.length}**\n• Rejected: **${rejected.length}**\n• Total Applications: ${admissions.length}\n\n${pending.length > 0 ? `⚡ ${pending.length} dilna chu review ngai a awm.` : '✅ Pending admission a awm lo.'}`,
        tab: 'admissions',
        tabLabel: 'Admissions en rawh',
      };
    }
  },
  // Staff / Payroll
  {
    pattern: /staff|teacher|zirtirtu|payroll|hlawh|salary/i,
    handler: (ctx) => {
      const { staff = [], payroll = [] } = ctx;
      const depts = [...new Set(staff.map(s => s.department).filter(Boolean))];
      return {
        text: `**Staff Overview:**\n• Total Staff: **${staff.length}**\n• Departments: ${depts.join(', ') || 'N/A'}\n• Payroll Records: ${payroll.length}\n\nStaff module ah hian detail a awm.`,
        tab: 'staff_payroll',
        tabLabel: 'Staff & Payroll en rawh',
      };
    }
  },
  // Notices / Circulars
  {
    pattern: /notice|circular|hriattirna|announcement|post|broadcast/i,
    handler: (ctx) => {
      const { notices = [] } = ctx;
      const recent = [...notices].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)).slice(0, 3);
      const recentList = recent.map(n => `• ${n.title || 'Untitled'} (${n.type || 'general'})`).join('\n');
      return {
        text: `**Notices & Circulars:**\n• Total: **${notices.length}**\n\nRecent notices:\n${recentList || 'Notice a awm lo.'}\n\nNotices tab ah post/edit theih.`,
        tab: 'notices',
        tabLabel: 'Notices en rawh',
      };
    }
  },
  // Library
  {
    pattern: /library|lehkhabu|book|borrow|issue/i,
    handler: (ctx) => {
      const { libraryBooks = [] } = ctx;
      const issued = libraryBooks.filter(b => b.status === 'issued' || b.available === false);
      return {
        text: `**Library:**\n• Total Books: **${libraryBooks.length}**\n• Currently Issued: **${issued.length}**\n• Available: ${libraryBooks.length - issued.length}`,
        tab: 'library',
        tabLabel: 'Library en rawh',
      };
    }
  },
  // Hostel
  {
    pattern: /hostel|boarding|warden|room|dormitory/i,
    handler: (ctx) => {
      const { hostelRooms = [] } = ctx;
      const occupied = hostelRooms.filter(r => r.occupants && r.occupants.length > 0);
      return {
        text: `**Hostel:**\n• Total Rooms: **${hostelRooms.length}**\n• Occupied: **${occupied.length}**\n• Available: ${hostelRooms.length - occupied.length}`,
        tab: 'hostel',
        tabLabel: 'Hostel en rawh',
      };
    }
  },
  // Transport
  {
    pattern: /transport|bus|route|vehicle|fleet/i,
    handler: (ctx) => {
      const { transportRoutes = [] } = ctx;
      return {
        text: `**Transport:**\n• Routes: **${transportRoutes.length}**\n\nTransport module ah detail route, bus schedule, GPS a awm.`,
        tab: 'transport',
        tabLabel: 'Transport en rawh',
      };
    }
  },
  // Leave
  {
    pattern: /leave|chawlh|chhiat|absence|request|annual/i,
    handler: (ctx) => {
      const { leaveApplications = [] } = ctx;
      const pending = leaveApplications.filter(l => l.status === 'pending');
      const approved = leaveApplications.filter(l => l.status === 'approved');
      return {
        text: `**Leave Applications:**\n• Pending Approval: **${pending.length}**\n• Approved: **${approved.length}**\n• Total: ${leaveApplications.length}\n\n${pending.length > 0 ? '⚡ Leave dilna pending chu hnawtna ngai.' : '✅ Leave application pending a awm lo.'}`,
        tab: 'leave_management',
        tabLabel: 'Leave Management en rawh',
      };
    }
  },
  // Tasks
  {
    pattern: /task|tih tur|pending task|todo|thil tih/i,
    handler: (ctx) => {
      const { tasks = [] } = ctx;
      const pending = tasks.filter(t => t.status !== 'completed');
      const high = pending.filter(t => t.priority === 'high' || t.priority === 'urgent');
      return {
        text: `**Tasks:**\n• Pending: **${pending.length}**\n• High Priority: **${high.length}**\n• Completed: ${tasks.length - pending.length}\n\n${high.length > 0 ? `⚠️ High priority task ${high.length} a awm — tih hmasak ngai.` : ''}`,
        tab: 'dashboard',
        tabLabel: 'Dashboard en rawh',
      };
    }
  },
  // Calendar / Events
  {
    pattern: /calendar|event|holiday|chawlh hun|academic|schedule/i,
    handler: (ctx) => {
      const { academicEvents = [] } = ctx;
      const upcoming = academicEvents.filter(e => new Date(e.date) >= new Date()).slice(0, 5);
      const upcomingList = upcoming.map(e => `• ${e.title} — ${e.date}`).join('\n');
      return {
        text: `**Upcoming Academic Events:**\n${upcomingList || 'Event a awm lo/a tawp tawh.'}\n\nCalendar tab ah full schedule a awm.`,
        tab: 'calendar',
        tabLabel: 'Calendar en rawh',
      };
    }
  },
];

// ─── Main Query Processor with Read & Write Execution ────────────────────────

export function processSchoolAiQuery(query = '', ctx = {}) {
  const rawQ = query.trim();
  const q = rawQ.toLowerCase();
  const activeSchoolName = ctx.activeSchoolInfo?.name || 'School';
  const schoolId = ctx.activeSchoolId || 'oha';

  if (!q) {
    return { 
      text: `Eng nge i zawt duh? **${activeSchoolName}** data zawng zawng ka hre chiang a. Zirlai thar add, fee record, attendance, admission approve, leh notice thar siam te prompt hmangin ka execute thei bawk e.` 
    };
  }

  // ─── 0. STRICT SECURITY BOUNDARY GUARD ─────────────────────────────────────────
  // Principal/Admin cannot access system root code, dev studio, terminal, or other schools' data.
  const isAskingRootCode = 
    q.includes('dev studio') || 
    q.includes('terminal') || 
    q.includes('root code') || 
    q.includes('software code') || 
    q.includes('source code') ||
    q.includes('system script') ||
    q.includes('database partition');

  const isAskingOtherSchool = 
    (q.includes('school dang') || q.includes('other school') || q.includes('school zawng zawng')) &&
    (q.includes('data') || q.includes('student') || q.includes('fee'));

  if (isAskingRootCode) {
    return {
      text: `⚠️ **Permission Denied (Super Admin Only):**\nPrincipal/Admin i nih angin i school (**${activeSchoolName}**) enkawlna atan chauh thuneihna i nei a. Software root code, Developer Studio, leh server scripts te chu Super Admin chauhvin an khawih thei e.`,
      tab: 'dashboard'
    };
  }

  if (isAskingOtherSchool) {
    return {
      text: `🔒 **School Data Isolation Notice:**\nI account hi **${activeSchoolName}** pual bik liau liau a ni a, school dang data chu zirlai privacy leh security vawn nan access theih a ni lo.`,
      tab: 'dashboard'
    };
  }

  // ─── 1. WRITE: ADD NEW STUDENT TO ACTIVE SCHOOL ──────────────────────────────
  // e.g. "Zirlai thar Lalmuanpuia Roll 12 Class 10A dah lut rawh"
  // e.g. "Add student: Samuel Lalrinfela Roll 15 Class 9"
  if (
    q.includes('student thar') || 
    q.includes('zirlai thar') || 
    q.startsWith('add student') || 
    q.startsWith('new student') ||
    (q.includes('dah lut') && (q.includes('student') || q.includes('zirlai') || q.includes('roll')))
  ) {
    // Extract roll number
    const rollMatch = rawQ.match(/roll\s*(?:no\.?|number|#)?\s*[:=]?\s*(\d+)/i) || rawQ.match(/\b(\d+)\s*(?:roll|ah)\b/i);
    const existingStudents = ctx.students || [];
    const rollNumber = rollMatch ? parseInt(rollMatch[1], 10) : (existingStudents.length > 0 ? Math.max(...existingStudents.map(s => s.rollNumber || 0)) + 1 : 1);

    // Extract class and section
    let studentClass = 'Class 10';
    let section = 'A';
    const classMatch = rawQ.match(/class\s*(\d+[A-Za-z]?)/i);
    if (classMatch) {
      const clsVal = classMatch[1];
      const secChar = clsVal.slice(-1);
      if (/[A-Za-z]/.test(secChar)) {
        studentClass = `Class ${clsVal.slice(0, -1)}`;
        section = secChar.toUpperCase();
      } else {
        studentClass = `Class ${clsVal}`;
      }
    }

    // Extract name
    let namePart = rawQ
      .replace(/^(?:please\s+)?(?:add\s+student|new\s+student|student\s+thar|zirlai\s+thar)\s*[:\s]*/i, '')
      .replace(/\s*roll\s*(?:no\.?|number|#)?\s*[:=]?\s*\d+/i, '')
      .replace(/\s*class\s*\d+[A-Za-z]?/i, '')
      .replace(/\s*(?:dah\s+lut\s+rawh|dah\s+lut\s+teh|dah\s+rawh|add\s+it|please|lut)\s*$/i, '')
      .trim();

    if (!namePart || namePart.length < 2) {
      namePart = `Student #${rollNumber}`;
    }

    const newStudentObj = {
      id: `stu-${Date.now()}`,
      name: namePart,
      rollNumber,
      class: studentClass,
      section,
      gender: 'Male',
      attendance: 'Present',
      marks: 80,
      guardianPhone: '+91 9862' + Math.floor(100000 + Math.random() * 900000),
      remarks: 'Added via School AI Assistant',
      schoolId: schoolId,
      schoolName: activeSchoolName,
      enrollmentDate: new Date().toISOString().split('T')[0]
    };

    if (ctx.addCollectionRecord) {
      ctx.addCollectionRecord('students', newStudentObj);
    }

    return {
      text: `✅ **Zirlai Thar Dah Luh A Ni E!**\n\n• Hming: **${namePart}**\n• Roll Number: **${rollNumber}**\n• Class: **${studentClass}-${section}**\n• School: **${activeSchoolName}**\n\nDatabase-ah tluang takin a in-save nghal e.`,
      tab: 'students',
      tabLabel: 'Students Directory en rawh'
    };
  }

  // ─── 2. WRITE: RECORD ATTENDANCE VIA PROMPT ──────────────────────────────────
  // e.g. "Roll 12 leh 15 absent dah rawh"
  // e.g. "Mark roll 5 as present"
  if (
    (q.includes('absent') || q.includes('present')) && 
    (q.includes('roll') || q.includes('dah rawh') || q.includes('mark') || q.includes('attendance'))
  ) {
    const rollMatches = [...rawQ.matchAll(/\b(?:roll\s*(?:no\.?)?\s*)?(\d+)\b/gi)].map(m => parseInt(m[1], 10));
    const isAbsent = q.includes('absent');
    const status = isAbsent ? 'absent' : 'present';
    const statusText = isAbsent ? 'Absent' : 'Present';
    const todayStr = new Date().toISOString().split('T')[0];

    const affectedStudents = (ctx.students || []).filter(s => rollMatches.includes(s.rollNumber));

    if (ctx.recordAttendance && affectedStudents.length > 0) {
      affectedStudents.forEach(stu => {
        ctx.recordAttendance({
          studentId: stu.id,
          studentName: stu.name,
          rollNumber: stu.rollNumber,
          class: stu.class,
          section: stu.section,
          date: todayStr,
          status: status,
          remark: 'Marked via School AI Assistant'
        });
      });

      const namesList = affectedStudents.map(s => `Roll ${s.rollNumber} (${s.name})`).join(', ');
      return {
        text: `📋 **Attendance Update Fel A Ni E!**\n\n• Ni: **${todayStr}**\n• Status: **${statusText}**\n• Zirlai te: **${namesList}**\n• School: **${activeSchoolName}**`,
        tab: 'attendance',
        tabLabel: 'Attendance Register en rawh'
      };
    } else if (rollMatches.length > 0) {
      return {
        text: `📋 Roll ${rollMatches.join(', ')} te chu vawiin atan **${statusText}** angin attendance-ah chhinchhiah an ni e.`,
        tab: 'attendance',
        tabLabel: 'Attendance en rawh'
      };
    }
  }

  // ─── 3. WRITE: RECORD FEE PAYMENT VIA PROMPT ─────────────────────────────────
  // e.g. "Roll 5 fee ₹2000 a pe e" or "Roll 8 fee cheng 1500 dah rawh"
  if (
    q.includes('fee') && 
    (q.includes('pe e') || q.includes('pe tawh') || q.includes('paid') || q.includes('dah rawh') || q.includes('payment'))
  ) {
    const amountMatch = rawQ.match(/(?:[₹rs.]\s*|cheng\s*)(\d+)/i) || rawQ.match(/\b(\d{3,6})\b/);
    const rollMatch = rawQ.match(/roll\s*(?:no\.?)?\s*(\d+)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 1500;
    const rollNo = rollMatch ? parseInt(rollMatch[1], 10) : null;

    const student = rollNo ? (ctx.students || []).find(s => s.rollNumber === rollNo) : null;
    const studentName = student ? student.name : (rollNo ? `Roll ${rollNo}` : 'Student');

    if (ctx.recordPayment) {
      ctx.recordPayment({
        studentId: student?.id || `stu-${rollNo || 'auto'}`,
        studentName: studentName,
        rollNumber: rollNo || 1,
        amount: amount,
        paidAmount: amount,
        status: 'paid',
        paymentDate: new Date().toISOString().split('T')[0],
        mode: 'Cash / Counter',
        receiptNo: `RCP-${Date.now().toString().slice(-5)}`,
        schoolId: schoolId
      });
    }

    return {
      text: `💳 **Fee Payment Chhinchhiah A Ni E!**\n\n• Zirlai: **${studentName}**\n• Pawisa Zat: **₹${amount.toLocaleString('en-IN')}**\n• Status: **Paid (Tluang taka dawn a ni)**\n• School: **${activeSchoolName}**\n\nOfficial fee ledger-ah a in-update nghal e.`,
      tab: 'financials',
      tabLabel: 'Fees & Accounts en rawh'
    };
  }

  // ─── 4. WRITE: PUBLISH OFFICIAL SCHOOL NOTICE VIA PROMPT ────────────────────
  // e.g. "Notice siam rawh: Naktukah Class 10 te chawlh a ni ang"
  // e.g. "Publish notice: Annual Sports Meet 2026 announcement"
  if (
    (q.includes('notice siam') || q.includes('notice tichhuak') || q.startsWith('publish notice:') || q.startsWith('notice:')) &&
    (ctx.publishNotice || ctx.addCollectionRecord)
  ) {
    const noticeMatch = rawQ.match(/(?:notice(?:\s+siam\s+rawh)?[:\s]+)([\s\S]+)/i);
    const noticeContent = noticeMatch ? noticeMatch[1].trim() : 'Official Institutional Circular from Principal Office.';
    const noticeTitle = noticeContent.split('\n')[0].slice(0, 80);

    const noticePayload = {
      title: noticeTitle,
      content: noticeContent,
      targetRole: 'All',
      publishedBy: `${activeSchoolName} Principal Office`,
      publishedAt: new Date().toISOString(),
      priority: 'high',
      schoolId: schoolId,
      schoolName: activeSchoolName
    };

    if (ctx.publishNotice) {
      ctx.publishNotice(noticePayload);
    } else if (ctx.addCollectionRecord) {
      ctx.addCollectionRecord('notices', noticePayload);
    }

    return {
      text: `📢 **School Notice Tichhuah Fel A Ni E!**\n\n• Thupui: **${noticeTitle}**\n• School: **${activeSchoolName}**\n• Target: Zirlai, Nu leh pa, leh Zirtirtute zawng zawng\n\nNotice board leh Parent portal-ah a lang nghal ang.`,
      tab: 'notices',
      tabLabel: 'Notices Board en rawh'
    };
  }

  // ─── 5. WRITE: APPROVE PENDING ADMISSION VIA PROMPT ──────────────────────────
  // e.g. "Admission approve rawh" or "Dilna approve rawh"
  if (
    (q.includes('admission') || q.includes('dilna')) && 
    (q.includes('approve') || q.includes('pawm') || q.includes('remti'))
  ) {
    const pendingAdm = (ctx.admissions || []).find(a => a.status === 'pending' || a.status === 'reviewing');
    if (pendingAdm && ctx.reviewAdmission) {
      ctx.reviewAdmission(pendingAdm.id, 'approved', 'Approved via School AI Assistant');
      return {
        text: `✅ **Admission Approval Fel A Ni E!**\n\nZirlai **${pendingAdm.studentName || pendingAdm.name || 'Applicant'}** (Class ${pendingAdm.applyingForClass || pendingAdm.class || '10'}) dilna chu tluang takin **Approved** a ni ta e.\nAdmission letter leh roll sequence a in-generate thei ang.`,
        tab: 'admissions',
        tabLabel: 'Admissions Desk en rawh'
      };
    } else {
      return {
        text: `Admissions portal-ah review ngai dilna pending a awm rih lo e. Dilna thar a awm rualin min hrilh thei ang.`,
        tab: 'admissions'
      };
    }
  }

  // ─── 6. WRITE: APPROVE STAFF LEAVE VIA PROMPT ────────────────────────────────
  // e.g. "Leave approve rawh" or "Staff chawlh dilna pawm rawh"
  if (
    (q.includes('leave') || q.includes('chawlh')) && 
    (q.includes('approve') || q.includes('pawm'))
  ) {
    const pendingLeave = (ctx.leaveApplications || []).find(l => l.status === 'pending');
    if (pendingLeave && ctx.reviewLeaveApplication) {
      ctx.reviewLeaveApplication(pendingLeave.id, 'approved', 'Approved by Principal via AI');
      return {
        text: `✅ Staff leave application chu **Approved** a ni e! Staff hming: **${pendingLeave.applicantName || 'Staff Member'}** (${pendingLeave.days || 1} days).`,
        tab: 'leave_management',
        tabLabel: 'Leave Management en rawh'
      };
    }
  }

  // ─── 7. WRITE: CREATE ADMINISTRATIVE TASK VIA PROMPT ────────────────────────
  // e.g. "Task siam rawh: Check Class 10 exam marks"
  if (
    (q.includes('task siam') || q.startsWith('task:')) &&
    ctx.createTask
  ) {
    const taskMatch = rawQ.match(/(?:task(?:\s+siam\s+rawh)?[:\s]+)([\s\S]+)/i);
    const taskTitle = taskMatch ? taskMatch[1].trim() : 'Review administrative duties';
    ctx.createTask({
      title: taskTitle,
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      assignedTo: 'Administration'
    });
    return {
      text: `✅ Task thar: **"${taskTitle}"** chu administration board-ah tluang takin dah luh a ni e!`,
      tab: 'dashboard'
    };
  }

  // ─── 8. READ PATTERNS (Existing Pattern Matching) ───────────────────────────
  for (const { pattern, handler } of QUERY_PATTERNS) {
    if (pattern.test(q)) {
      try {
        return handler(ctx);
      } catch (e) {
        return { text: `Query process a thlak thei lo: ${e.message}` };
      }
    }
  }

  // Help / greeting
  if (/hello|chibai|help|hi|hei|mamawh|thil tih theih/i.test(q)) {
    return {
      text: `Chibai! Kei hi **${activeSchoolName} AI Assistant** ka ni e. 🎓\n\n**Hna ka thawh theih te:**\n• **Zirlai thar dah lut:** *"Zirlai thar Lalrintluanga Roll 15 Class 10A dah lut rawh"*\n• **Attendance lak:** *"Roll 4 leh 7 absent dah rawh"*\n• **Fee chhinchhiah:** *"Roll 5 fee ₹2000 a pe e"*\n• **School notice siam:** *"Notice siam rawh: Naktukah assembly dar 8:30-ah"*\n• **Admission approve:** *"Admission approve rawh"*\n• **Fee & Attendance Report en:** *"Fee arrear zat?", "Ni tuk attendance"*\n\nEng thupek nge ka execute ang?`,
    };
  }

  // Fallback
  return {
    text: `"${rawQ}" — **${activeSchoolName}** pualin zirlai add, attendance, fee payment, notice tichhuah, leh report enfiah ka execute thei e. I duh zawng chiang takin min hrilh la ka lo ti nghal ang!`,
  };
}
