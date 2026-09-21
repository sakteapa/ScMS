/**
 * Super Admin AI Co-Pilot & System Health Engine
 * Provides:
 * 1. Deep system health audit & anomaly detection across all collections.
 * 2. Automated 1-Click Repair generators for common issues.
 * 3. Live Telemetry ("Enge Thleng" & "Enge Tih Ngai") feed.
 * 4. Bilingual (Mizo & English) natural language command execution.
 */

export function runSystemDiagnostics({
  students = [],
  classes = [],
  fees = [],
  staff = [],
  admissions = [],
  leaves = [],
  notices = [],
  tasks = [],
  customScripts = {},
  plugins = [],
  systemConfig = {},
  websiteConfig = {},
  paymentConfig = {}
} = {}) {
  const issues = [];
  let scoreDeduction = 0;

  // 1. Admission Backlog Check
  const pendingAdmissions = admissions.filter(a => a.status === 'pending' || a.status === 'submitted');
  if (pendingAdmissions.length > 0) {
    issues.push({
      id: 'iss-adm-pending',
      title: `${pendingAdmissions.length} Online Admission Application(s) Pending Review`,
      category: 'admissions',
      severity: pendingAdmissions.length > 5 ? 'critical' : 'warning',
      description: `Admission approval nghak zirlai ${pendingAdmissions.length} an awm mek. Principal/Admin endik leh verify a ngai.`,
      actionTab: 'admissions',
      actionLabel: 'Review Admissions',
      canAutoFix: false
    });
    scoreDeduction += pendingAdmissions.length > 5 ? 12 : 5;
  }

  // 2. Student Data Integrity Check (Missing guardian phone / unassigned class)
  const studentsWithoutPhone = students.filter(s => !s.guardianPhone && !s.parentPhone && !s.phone);
  if (studentsWithoutPhone.length > 0) {
    issues.push({
      id: 'iss-stu-missing-phone',
      title: `${studentsWithoutPhone.length} Student(s) Missing Emergency/Guardian Contact`,
      category: 'students',
      severity: 'warning',
      description: `Zirlai ${studentsWithoutPhone.length} te guardian phone number a inziak lo. SMS leh Emergency Alert dawn theih loh phah thei.`,
      actionTab: 'students',
      actionLabel: 'Update Contacts',
      canAutoFix: true,
      autoFixType: 'FILL_DEFAULT_PHONE',
      fixSummary: 'Assign institutional fallback guardian contact number (+91 9862000000) for missing profiles.'
    });
    scoreDeduction += 6;
  }

  // 3. Roll Number Duplication / Inconsistency Check
  const classRollMap = {};
  const duplicateRolls = [];
  students.forEach(s => {
    const key = `${s.class || s.grade}-${s.section || 'A'}-${s.rollNumber || s.rollNo}`;
    if (classRollMap[key]) {
      duplicateRolls.push(s);
    } else {
      classRollMap[key] = s.id;
    }
  });

  if (duplicateRolls.length > 0) {
    issues.push({
      id: 'iss-stu-dup-roll',
      title: `Duplicate Roll Number Detected (${duplicateRolls.length} students)`,
      category: 'students',
      severity: 'critical',
      description: `Class leh Section khatah roll number inang zirlai ${duplicateRolls.length} ah a awm. Result leh attendance buai phah thei a ni.`,
      actionTab: 'students',
      actionLabel: 'Resolve Roll Duplicates',
      canAutoFix: true,
      autoFixType: 'RENUMBER_DUPLICATES',
      fixSummary: 'Auto-sequence duplicate roll numbers cleanly in sequence.'
    });
    scoreDeduction += 15;
  }

  // 4. Overdue Tasks Check
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr);
  if (overdueTasks.length > 0) {
    issues.push({
      id: 'iss-task-overdue',
      title: `${overdueTasks.length} Institutional Directive(s) Past Due Date`,
      category: 'tasks',
      severity: overdueTasks.length > 3 ? 'critical' : 'warning',
      description: `Staff leh administration directive ${overdueTasks.length} a hun liam tawh ah la zo lo an awm.`,
      actionTab: 'notices',
      actionLabel: 'View Overdue Directives',
      canAutoFix: false
    });
    scoreDeduction += overdueTasks.length > 3 ? 10 : 4;
  }

  // 5. Staff Leave Requests Pending Review
  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  if (pendingLeaves.length > 0) {
    issues.push({
      id: 'iss-leave-pending',
      title: `${pendingLeaves.length} Staff/Student Leave Application(s) Awaiting Decision`,
      category: 'leaves',
      severity: 'warning',
      description: `Leave approval nghak ${pendingLeaves.length} an awm. Substitute teacher ruat a ngai thei bawk.`,
      actionTab: 'leave_management',
      actionLabel: 'Review Leaves',
      canAutoFix: false
    });
    scoreDeduction += 5;
  }

  // 6. Custom Scripts & Code Health Check
  if (customScripts?.css && customScripts.css.includes('<script')) {
    issues.push({
      id: 'iss-code-css-syntax',
      title: 'Script Tag Detected Inside Custom CSS Rules',
      category: 'code',
      severity: 'critical',
      description: 'Custom CSS injection chhungah <script> tag hmuh a ni. Stylesheet-ah style rules chauh dah tur a ni.',
      actionTab: 'dev_studio',
      actionLabel: 'Edit Custom Scripts',
      canAutoFix: true,
      autoFixType: 'CLEAN_CSS_TAGS',
      fixSummary: 'Strip invalid HTML script wrapper tags from custom CSS.'
    });
    scoreDeduction += 15;
  }

  // 7. Payment Gateway Credentials Sanity
  if (!paymentConfig?.merchantId && !paymentConfig?.upiId && !paymentConfig?.razorpayKeyId) {
    issues.push({
      id: 'iss-payment-gateway',
      title: 'Online Payment Gateway Not Fully Configured',
      category: 'financials',
      severity: 'warning',
      description: 'Razorpay emaw UPI Gateway config a la kimlo. Online fee collection a tluang lo thei.',
      actionTab: 'financials',
      actionLabel: 'Setup Payment Gateway',
      canAutoFix: false
    });
    scoreDeduction += 8;
  }

  // 8. Website Public Notice & Banner Sanity
  if (!websiteConfig?.schoolName || websiteConfig.schoolName.trim().length === 0) {
    issues.push({
      id: 'iss-web-school-name',
      title: 'School Name Blank in Public Website Config',
      category: 'website',
      severity: 'critical',
      description: 'Public landing page-ah School Name a ruak mek. OHA Lunglawn, Lunglei dah tur a ni.',
      actionTab: 'public_website',
      actionLabel: 'Update Website Config',
      canAutoFix: true,
      autoFixType: 'SET_DEFAULT_SCHOOL_NAME',
      fixSummary: 'Apply "OHA (One Heart Academy)" and Lunglei metadata to website profile.'
    });
    scoreDeduction += 10;
  }

  const finalScore = Math.max(25, 100 - scoreDeduction);
  const healthStatus = finalScore >= 90 ? 'healthy' : finalScore >= 70 ? 'warning' : 'critical';

  return {
    healthScore: finalScore,
    status: healthStatus,
    scannedAt: new Date().toISOString(),
    metrics: {
      totalStudents: students.length,
      totalClasses: classes.length,
      totalStaff: staff.length,
      pendingAdmissions: pendingAdmissions.length,
      overdueTasks: overdueTasks.length,
      pendingLeaves: pendingLeaves.length,
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      autoFixableIssues: issues.filter(i => i.canAutoFix).length
    },
    issues
  };
}

/**
 * Returns synthesized institutional telemetry ("Enge Thleng" & "Enge Tih Ngai")
 */
export function getLiveTelemetry({
  admissions = [],
  fees = [],
  notices = [],
  tasks = [],
  leaves = [],
  students = []
} = {}) {
  const events = [];

  // Recent admissions
  admissions.slice(0, 4).forEach(a => {
    events.push({
      id: `ev-adm-${a.id}`,
      type: 'admission',
      title: `Admission Application: ${a.studentName || 'New Applicant'}`,
      description: `Class: ${a.classApplying || a.gradeApplying || 'N/A'} • Status: ${a.status?.toUpperCase() || 'SUBMITTED'}`,
      timestamp: a.submittedAt || a.createdAt || new Date().toISOString(),
      badgeColor: a.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
    });
  });

  // Recent fee payments
  fees.slice(0, 4).forEach(f => {
    events.push({
      id: `ev-fee-${f.id}`,
      type: 'fee',
      title: `Fee Transaction Recorded: ₹${(f.paidAmount || f.amount || 0).toLocaleString('en-IN')}`,
      description: `${f.studentName || 'Student'} • ${f.term || f.month || 'Tuition Fee'} (${f.status || 'Paid'})`,
      timestamp: f.date || f.paidAt || new Date().toISOString(),
      badgeColor: 'bg-cyan-500/20 text-cyan-300'
    });
  });

  // Recent notices
  notices.slice(0, 3).forEach(n => {
    events.push({
      id: `ev-not-${n.id}`,
      type: 'notice',
      title: `Notice Dispatched: ${n.title}`,
      description: `By ${n.publishedBy || 'Administration'} • Scope: ${n.scope || 'General'}`,
      timestamp: n.publishedAt || new Date().toISOString(),
      badgeColor: 'bg-purple-500/20 text-purple-300'
    });
  });

  // Sort events newest first
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Priority Actions ("Enge Tih Ngai")
  const actions = [];

  const pendingAdm = admissions.filter(a => a.status === 'pending' || a.status === 'submitted');
  if (pendingAdm.length > 0) {
    actions.push({
      id: 'act-adm',
      priority: 'high',
      title: `${pendingAdm.length} Admission Approval Nghak`,
      description: 'Zirlai dilna thar verify leh approve a ngai.',
      actionTab: 'admissions',
      actionLabel: 'Open Admissions'
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const overdueTasks = pendingTasks.filter(t => t.dueDate && t.dueDate < todayStr);
  if (overdueTasks.length > 0) {
    actions.push({
      id: 'act-tasks',
      priority: 'urgent',
      title: `${overdueTasks.length} Institutional Tasks Overdue`,
      description: 'Directives leh staff task deadline pelh tawh an awm.',
      actionTab: 'notices',
      actionLabel: 'View Directives'
    });
  }

  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  if (pendingLeaves.length > 0) {
    actions.push({
      id: 'act-leaves',
      priority: 'medium',
      title: `${pendingLeaves.length} Staff/Student Leave Application`,
      description: 'Chawlh dilna endik leh approval pek ngai.',
      actionTab: 'leave_management',
      actionLabel: 'Review Leaves'
    });
  }

  return {
    recentEvents: events.slice(0, 8),
    priorityActions: actions
  };
}

/**
 * Natural language intent parser for Super Admin commands (Mizo & English)
 */
export function processSuperAdminAiCommand(query, {
  students = [],
  classes = [],
  fees = [],
  admissions = [],
  tasks = [],
  notices = [],
  setCurrentTab,
  onRunDiagnostics,
  initializeCleanSchool,
  initializeCleanOhaAcademy, // backward-compat alias
  activeSchoolInfo = {}
} = {}) {
  const doCleanLaunch = initializeCleanSchool || initializeCleanOhaAcademy;
  const schoolName = activeSchoolInfo?.name || 'School';
  const q = (query || '').trim().toLowerCase();

  if (!q) {
    return {
      message: 'Engtin nge ka puih theih ang che? (Entirnan: "System scan nei rawh", "Admission pending en rawh", "Class 10 zirlai zat", "Fee ba zat")',
      type: 'info'
    };
  }

  // 0. Clean school data purge & fresh portal launch (works for any school)
  if (
    (q.includes('mock data') || q.includes('academy thar') || q.includes('clean') || q.includes('wipe') || q.includes('thian') || q.includes('hawng') || q.includes('fresh') || q.includes('purge')) &&
    (q.includes('school') || q.includes('data') || q.includes('portal') || q.includes('launch') || q.includes('buatsaih') || q.includes('thar'))
  ) {
    if (doCleanLaunch) {
      doCleanLaunch();
    }
    return {
      message: `${schoolName} portal chu tluang takin academy thar atan hawn a ni e! Dummy mock data (fake student, fees, grades) zawng zawng thianfai a ni a, zirlai thar admission lak leh Principal/Admin in an khawih chhunzawm theih turin portal hi a inpeih fel ta e.`,
      type: 'success',
      suggestedAction: 'SCHOOL_INITIALIZED'
    };
  }

  // 1. System Scan / Health Check
  if (
    q.includes('scan') || 
    q.includes('check') || 
    q.includes('en fel') || 
    q.includes('health') || 
    q.includes('audit') ||
    q.includes('status')
  ) {
    if (onRunDiagnostics) onRunDiagnostics();
    return {
      message: 'System Health Diagnostic tluang takin a in scan fel e! Database, custom code, leh pending workflow zawng zawng enfiah a ni.',
      type: 'success',
      suggestedAction: 'VIEW_DIAGNOSTICS'
    };
  }

  // 2. Admissions
  if (q.includes('admission') || q.includes('dilna') || q.includes('lut thar')) {
    const pending = admissions.filter(a => a.status === 'pending' || a.status === 'submitted').length;
    if (setCurrentTab) setCurrentTab('admissions');
    return {
      message: `Online Admission ah hian application ${admissions.length} a awm a, approval nghak mek ${pending} an awm. Admissions portal-ah ka hruai nghal che e.`,
      type: 'action',
      navigatedTab: 'admissions'
    };
  }

  // 3. Fees & Financials
  if (q.includes('fee') || q.includes('pawisa') || q.includes('financial') || q.includes('balance') || q.includes('arrear')) {
    const totalCollected = fees.reduce((sum, f) => sum + (f.paidAmount || f.amount || 0), 0);
    if (setCurrentTab) setCurrentTab('fees');
    return {
      message: `Fees & Accounts-ah vawiina fee chhinchhiah zat chu ₹${totalCollected.toLocaleString('en-IN')} a ni. Financials ledger-ah ka hruai che e.`,
      type: 'action',
      navigatedTab: 'fees'
    };
  }

  // 4. Students & Classes
  if (q.includes('student') || q.includes('zirlai') || q.includes('class') || q.includes('roll')) {
    if (setCurrentTab) setCurrentTab('students');
    return {
      message: `School-ah hian active student ${students.length} leh class master ${classes.length} an awm mek. Students Directory-ah ka hruai che e.`,
      type: 'action',
      navigatedTab: 'students'
    };
  }

  // 5. Code & Developer Studio
  if (q.includes('code') || q.includes('dev') || q.includes('studio') || q.includes('script') || q.includes('css') || q.includes('terminal')) {
    if (setCurrentTab) setCurrentTab('dev_studio');
    return {
      message: 'Developer Studio & In-App IDE-ah ka hruai che e. Custom CSS, JS, Database Editor leh AI Co-Pilot i hmang thei.',
      type: 'action',
      navigatedTab: 'dev_studio'
    };
  }

  // 6. Directives & Tasks
  if (q.includes('task') || q.includes('directive') || q.includes('notice') || q.includes('thil tih tur') || q.includes('hriattirna')) {
    const pending = tasks.filter(t => t.status !== 'completed').length;
    if (setCurrentTab) setCurrentTab('notices');
    return {
      message: `Action tasks pending ${pending} a awm a, Notices & Directives Board-ah ka hruai che e.`,
      type: 'action',
      navigatedTab: 'notices'
    };
  }

  // 7. General Fallback with Contextual Help
  return {
    message: `"${query}" tih hi ka lo dawng e. Super Admin Co-Pilot hian i software leh code a lo vil reng a, zirlai ${students.length}, admission pending, leh system configuration zawng zawng a enkawl pui thei che.`,
    type: 'info',
    quickActions: [
      { label: 'Run Health Scan', prompt: 'system scan nei rawh' },
      { label: 'Check Admissions', prompt: 'admission pending en rawh' },
      { label: 'Open Dev Studio', prompt: 'dev studio code en rawh' },
      { label: 'Check Fee Arrears', prompt: 'fees leh financial status en rawh' }
    ]
  };
}
