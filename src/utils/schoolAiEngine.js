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

// ─── Main Query Processor ─────────────────────────────────────────────────────

export function processSchoolAiQuery(query = '', ctx = {}) {
  const q = query.trim();
  if (!q) return { text: 'Eng nge i zawt duh? School data zawng zawng ka hre chiang a. Fee, attendance, student, admission, staff te thawn zawt rawh.' };

  // Match patterns
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
    const stats = getSchoolQuickStats(ctx);
    return {
      text: `Chibai! Kei hi **Zoxs AI** — i school AI assistant ka ni e. 🎓\n\n**Ka thil hre theih:**\n• Fee arrear & collection status\n• Attendance report (ni tuk)\n• Admission pending count\n• Staff & payroll info\n• Leave applications\n• Notice & circulars\n• Library, hostel, transport\n• Tasks & events\n\nEngkim zawt theih a ni. Mizo ṭawng leh English-in zawt theih.`,
    };
  }

  // Fallback
  return {
    text: `"${q}" — chu ka hrethiam lo. Fee, attendance, admission, student, staff, notice, library, hostel, leave, tasks, calendar te zawt rawh. Eng nge i duh?`,
  };
}
