import React, { useState } from 'react';
import { 
  DollarSign, 
  Users, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Printer, 
  Search, 
  Sparkles,
  Building2,
  Receipt,
  IdCard,
  ShieldCheck,
  Award,
  Phone,
  Droplet,
  Calendar,
  Eye,
  Filter,
  Briefcase,
  Edit3,
  Trash2,
  X,
  Check,
  BookOpen,
  AlertCircle,
  UserCheck,
  ShieldAlert,
  Layers,
  GraduationCap,
  Lock,
  TrendingUp,
  Settings,
  Sliders,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Percent,
  AlertTriangle,
  Shield,
  Crown,
  Star
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import ClassLeaderModal from '../components/ClassLeaderModal';
import OfficeStaffTab from '../components/OfficeStaffTab';

const STANDARD_COMMITTEES = [
  'Examination Cell & Assessment Board',
  'Discipline & Anti-Ragging Committee',
  'Hostel Boarding & Student Welfare Committee',
  'Admission Scrutiny Council',
  'Literary, Cultural & Debating Society',
  'Sports & Physical Education Council',
  'Finance, Purchase & Audit Committee',
  'Library & Educational Resource Advisory',
  'Science & Innovation Club'
];

const COMMON_SUBJECTS = [
  'Physics', 'Chemistry', 'Mathematics', 'Biology', 
  'English', 'Mizo', 'Political Science', 'History', 
  'Economics', 'Accountancy', 'Business Studies', 
  'Computer Science', 'Environmental Studies', 'Physical Education'
];

export default function StaffPayrollView() {
  const { 
    staff, 
    addStaff, 
    updateStaff, 
    deleteStaff, 
    payroll, 
    processPayroll, 
    classes,
    payScales = [],
    updatePayScale,
    addPayScale,
    adjustStaffSalary,
    assignClassMaster,
    assignOfficeStaffDuties,
    systemConfig
  } = useSchool();
  const { currentUser, isPrincipal, isVicePrincipal } = useAuth();

  // Strict Admin Authority for Pay Scales and Salary Adjustments
  const isAdmin = isPrincipal || currentUser?.role === 'superadmin';
  const isGovernanceUser = isPrincipal || isVicePrincipal || currentUser?.role === 'superadmin';
  // Vice Principal and Principal specific authority for Class Master assignment
  const canManageClassMaster = isPrincipal || isVicePrincipal || currentUser?.role === 'superadmin';
  const assignerDesignation = isPrincipal 
    ? 'Principal (Dr. Lalthanzuala)' 
    : isVicePrincipal 
      ? 'Vice Principal (Dr. C. Lalremruata)' 
      : 'Executive Super Admin Council';

  // Active Tab: 'duties' | 'staff_directory' | 'payroll_runs' | 'pay_scales' | 'id_cards'
  const [activeTab, setActiveTab] = useState('duties');

  // Class Master Governance Filter & Search States
  const [classMasterSearch, setClassMasterSearch] = useState('');
  const [classMasterLevelFilter, setClassMasterLevelFilter] = useState('All');
  const [modalTeacherSearch, setModalTeacherSearch] = useState('');
  const [assignmentToast, setAssignmentToast] = useState(null);
  const [leaderModalTarget, setLeaderModalTarget] = useState(null);

  // Pay Scales & Salary Revision States (Strict Admin Only)
  const [payScaleSearch, setPayScaleSearch] = useState('');
  const [scaleCategoryFilter, setScaleCategoryFilter] = useState('All');
  const [editingScale, setEditingScale] = useState(null);
  const [isAddScaleModalOpen, setIsAddScaleModalOpen] = useState(false);
  const [adjustingSalaryStaff, setAdjustingSalaryStaff] = useState(null);
  const [salaryRevisionForm, setSalaryRevisionForm] = useState({
    scaleId: '',
    scaleLevel: '',
    baseSalary: 0,
    daAllowance: 0,
    hraAllowance: 0,
    medicalAllowance: 0,
    specialAllowance: 0,
    arrearsBonus: 0,
    npsDeduction: 0,
    profTaxDeduction: 0,
    otherDeductions: 0,
    reason: 'Annual Increment 2026',
    effectiveMonth: 'September 2026',
    notes: '',
    notifyStaff: true
  });
  const [newScaleForm, setNewScaleForm] = useState({
    level: 'Level 9',
    title: 'Senior Faculty Specialist',
    designations: 'Senior Lecturer, HOD',
    minBase: 40000,
    maxBase: 65000,
    currentBase: 45000,
    daRatePercent: 38,
    hraRatePercent: 16,
    medicalAllowance: 1200,
    specialAllowance: 1500,
    epfNpsPercent: 10,
    profTax: 150,
    description: 'Higher secondary department faculty and specialized heads.'
  });

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Payroll specific states
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // ID Cards Filters
  const [idSearch, setIdSearch] = useState('');
  const [singlePrintCard, setSinglePrintCard] = useState(null);

  // Modals
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [editTab, setEditTab] = useState('duties'); // 'duties' | 'profile' | 'salary'
  const [deletingStaffId, setDeletingStaffId] = useState(null);
  const [quickClassAssignTarget, setQuickClassAssignTarget] = useState(null); // { classId, className }

  // Form State for Add Staff
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    designation: 'PGT Teacher',
    department: 'Science Department',
    qualification: 'M.Sc., B.Ed.',
    phone: '',
    emergencyContact: '',
    email: '',
    bloodGroup: 'O+',
    baseSalary: 45000,
    allowances: 7000,
    deductions: 4000,
    bankAccount: 'SBI 30000000000',
    classTeacherOf: '',
    subjectsTaught: ['English'],
    committees: ['Examination Cell & Assessment Board'],
    weeklyPeriods: 20,
    specialDuty: '',
    status: 'active'
  });

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const departments = ['All', ...new Set(staff.map(s => s.department).filter(Boolean))];

  // Filtered Staff for Directory & Duties
  const filteredStaff = staff.filter(stf => {
    const matchesSearch = 
      stf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (stf.employeeId && stf.employeeId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      stf.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (stf.specialDuty && stf.specialDuty.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDept = deptFilter === 'All' || stf.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || (stf.status || 'active') === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Filtered Payroll
  const filteredPayroll = payroll.filter(p => p.month === selectedMonth && p.year === Number(selectedYear));
  const totalPayrollAmount = filteredPayroll.reduce((acc, curr) => acc + curr.netSalary, 0);

  const handleRunPayrollForStaff = (stf) => {
    processPayroll(stf.id, selectedMonth, selectedYear);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered staff for ID Cards
  const filteredStaffForCards = staff.filter(stf => {
    const matchesSearch = stf.name.toLowerCase().includes(idSearch.toLowerCase()) ||
      (stf.employeeId && stf.employeeId.toLowerCase().includes(idSearch.toLowerCase())) ||
      stf.designation.toLowerCase().includes(idSearch.toLowerCase());
    const matchesDept = deptFilter === 'All' || stf.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  // Handle Add Staff Submit
  const handleAddStaffSubmit = (e) => {
    e.preventDefault();
    if (!newStaffForm.name.trim()) return;

    addStaff({
      ...newStaffForm,
      classTeacherOf: newStaffForm.classTeacherOf || null,
      baseSalary: Number(newStaffForm.baseSalary) || 0,
      allowances: Number(newStaffForm.allowances) || 0,
      deductions: Number(newStaffForm.deductions) || 0,
      weeklyPeriods: Number(newStaffForm.weeklyPeriods) || 0
    });

    setIsAddStaffModalOpen(false);
    setNewStaffForm({
      name: '',
      designation: 'PGT Teacher',
      department: 'Science Department',
      qualification: 'M.Sc., B.Ed.',
      phone: '',
      emergencyContact: '',
      email: '',
      bloodGroup: 'O+',
      baseSalary: 45000,
      allowances: 7000,
      deductions: 4000,
      bankAccount: 'SBI 30000000000',
      classTeacherOf: '',
      subjectsTaught: ['English'],
      committees: ['Examination Cell & Assessment Board'],
      weeklyPeriods: 20,
      specialDuty: '',
      status: 'active'
    });
  };

  // Handle Edit Staff Submit
  const handleEditStaffSubmit = (e) => {
    e.preventDefault();
    if (!editingStaff) return;

    updateStaff(editingStaff.id, {
      ...editingStaff,
      classTeacherOf: editingStaff.classTeacherOf || null,
      baseSalary: Number(editingStaff.baseSalary) || 0,
      allowances: Number(editingStaff.allowances) || 0,
      deductions: Number(editingStaff.deductions) || 0,
      weeklyPeriods: Number(editingStaff.weeklyPeriods) || 0
    });

    setEditingStaff(null);
  };

  // Quick Class Master Reassign (Vice Principal & Principal Executive Authority)
  const handleQuickAssignClassTeacher = (classId, teacherId) => {
    if (!canManageClassMaster) {
      alert('Thuneihna: Vice Principal leh Principal chauhvin Class Master an siamrem thei.');
      return;
    }
    const targetCls = classes.find(c => c.id === classId);
    const targetStf = teacherId ? staff.find(s => s.id === teacherId) : null;

    // Call context function which handles 100% distinctness, classes & staff 2-way sync, and private notifications
    assignClassMaster(classId, teacherId, assignerDesignation);

    setAssignmentToast({
      className: targetCls?.name || 'Class',
      teacherName: targetStf ? targetStf.name : 'Unassigned',
      isUnassigned: !teacherId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setTimeout(() => setAssignmentToast(null), 5000);

    setQuickClassAssignTarget(null);
    setModalTeacherSearch('');
  };

  // Quick Committee Toggle in Edit Form
  const toggleCommitteeInEdit = (commName) => {
    const current = editingStaff.committees || [];
    const next = current.includes(commName)
      ? current.filter(c => c !== commName)
      : [...current, commName];
    setEditingStaff({ ...editingStaff, committees: next });
  };

  // Quick Subject Toggle in Edit Form
  const toggleSubjectInEdit = (subj) => {
    const current = editingStaff.subjectsTaught || [];
    const next = current.includes(subj)
      ? current.filter(s => s !== subj)
      : [...current, subj];
    setEditingStaff({ ...editingStaff, subjectsTaught: next });
  };

  // Salary Revision Handlers (Strict Admin Only)
  const handleOpenSalaryAdjust = (stf) => {
    const matchingScale = payScales.find(sc => 
      sc.id === stf.payScaleId || 
      (sc.designations && sc.designations.some(d => d.toLowerCase() === (stf.designation || '').toLowerCase()))
    );

    const base = Number(stf.baseSalary) || 40000;
    const da = matchingScale ? Math.round(base * (matchingScale.daRatePercent / 100)) : Math.round(base * 0.38);
    const hra = matchingScale ? Math.round(base * (matchingScale.hraRatePercent / 100)) : Math.round(base * 0.16);
    const med = matchingScale ? matchingScale.medicalAllowance : 1000;
    const special = matchingScale ? matchingScale.specialAllowance : Math.max(0, (stf.allowances || 0) - da - hra - med);
    const nps = matchingScale ? Math.round((base + da) * (matchingScale.epfNpsPercent / 100)) : Math.round((base + da) * 0.10);
    const ptax = matchingScale ? matchingScale.profTax : 150;
    const otherDed = Math.max(0, (stf.deductions || 0) - nps - ptax);

    setSalaryRevisionForm({
      scaleId: matchingScale ? matchingScale.id : '',
      scaleLevel: matchingScale ? matchingScale.level : '',
      baseSalary: base,
      daAllowance: da,
      hraAllowance: hra,
      medicalAllowance: med,
      specialAllowance: special,
      arrearsBonus: 0,
      npsDeduction: nps,
      profTaxDeduction: ptax,
      otherDeductions: otherDed,
      reason: 'Regular Incremental & Grade Pay Revision',
      effectiveMonth: `${selectedMonth} ${selectedYear}`,
      notes: '',
      notifyStaff: true
    });
    setAdjustingSalaryStaff(stf);
  };

  const handleApplyScalePresetToForm = (scaleId) => {
    const sc = payScales.find(s => s.id === scaleId);
    if (!sc) return;
    const base = Number(sc.currentBase) || 35000;
    const da = Math.round(base * (Number(sc.daRatePercent) / 100));
    const hra = Math.round(base * (Number(sc.hraRatePercent) / 100));
    const med = Number(sc.medicalAllowance) || 0;
    const spec = Number(sc.specialAllowance) || 0;
    const nps = Math.round((base + da) * (Number(sc.epfNpsPercent) / 100));
    const ptax = Number(sc.profTax) || 150;

    setSalaryRevisionForm(prev => ({
      ...prev,
      scaleId: sc.id,
      scaleLevel: sc.level,
      baseSalary: base,
      daAllowance: da,
      hraAllowance: hra,
      medicalAllowance: med,
      specialAllowance: spec,
      npsDeduction: nps,
      profTaxDeduction: ptax,
      reason: `Adoption of ${sc.level} (${sc.title}) Pay Matrix`
    }));
  };

  const handleSaveSalaryAdjustment = (e) => {
    e.preventDefault();
    if (!adjustingSalaryStaff) return;

    const totAllowances = 
      Number(salaryRevisionForm.daAllowance || 0) + 
      Number(salaryRevisionForm.hraAllowance || 0) + 
      Number(salaryRevisionForm.medicalAllowance || 0) + 
      Number(salaryRevisionForm.specialAllowance || 0) + 
      Number(salaryRevisionForm.arrearsBonus || 0);

    const totDeductions = 
      Number(salaryRevisionForm.npsDeduction || 0) + 
      Number(salaryRevisionForm.profTaxDeduction || 0) + 
      Number(salaryRevisionForm.otherDeductions || 0);

    adjustStaffSalary(adjustingSalaryStaff.id, {
      baseSalary: Number(salaryRevisionForm.baseSalary) || 0,
      allowances: totAllowances,
      deductions: totDeductions,
      scaleId: salaryRevisionForm.scaleId || null,
      scaleLevel: salaryRevisionForm.scaleLevel || null,
      reason: salaryRevisionForm.reason,
      effectiveMonth: salaryRevisionForm.effectiveMonth,
      revisedBy: currentUser?.displayName || (isPrincipal ? 'Rev. Dr. L. H. Rohmingliana (Principal)' : 'School Administrator'),
      notes: salaryRevisionForm.notes,
      notifyStaff: salaryRevisionForm.notifyStaff
    });

    setAdjustingSalaryStaff(null);
  };

  const handleSaveScaleEdit = (e) => {
    e.preventDefault();
    if (!editingScale) return;
    updatePayScale(editingScale.id, {
      ...editingScale,
      minBase: Number(editingScale.minBase) || 0,
      maxBase: Number(editingScale.maxBase) || 0,
      currentBase: Number(editingScale.currentBase) || 0,
      daRatePercent: Number(editingScale.daRatePercent) || 0,
      hraRatePercent: Number(editingScale.hraRatePercent) || 0,
      medicalAllowance: Number(editingScale.medicalAllowance) || 0,
      specialAllowance: Number(editingScale.specialAllowance) || 0,
      epfNpsPercent: Number(editingScale.epfNpsPercent) || 0,
      profTax: Number(editingScale.profTax) || 0
    });
    setEditingScale(null);
  };

  const handleCreateScale = (e) => {
    e.preventDefault();
    if (!newScaleForm.title.trim()) return;
    addPayScale({
      ...newScaleForm,
      designations: typeof newScaleForm.designations === 'string' 
        ? newScaleForm.designations.split(',').map(d => d.trim()).filter(Boolean)
        : newScaleForm.designations
    });
    setIsAddScaleModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Navigation */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
            <span>Staff Governance &amp; Faculty Administration</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
              Institutional Suite
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mawhphurhna semzaina (Duty allocation), Class Teacher assignment, Committees, Staff Directory, leh Payroll disbursal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isGovernanceUser && (
            <button
              onClick={() => setIsAddStaffModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Staff</span>
            </button>
          )}

          <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab('duties')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'duties' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Duty Allocation</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950/40 text-current font-mono">
                Portfolios
              </span>
            </button>
            <button
              onClick={() => setActiveTab('staff_directory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'staff_directory' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Staff Directory</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950/40 text-current font-mono">
                {staff.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('payroll_runs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'payroll_runs' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Payroll Disbursal</span>
            </button>
            <button
              onClick={() => setActiveTab('pay_scales')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'pay_scales' ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Pay Scales &amp; Siamremna</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${isAdmin ? 'bg-amber-950/60 text-amber-200' : 'bg-slate-800 text-slate-400'}`}>
                {isAdmin ? 'Admin' : '🔒'}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('office_staff')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'office_staff' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Office Staff &amp; Access</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-200 font-mono">
                {staff.filter(s => s.isOfficeStaff).length} Ruat
              </span>
            </button>
            <button
              onClick={() => setActiveTab('id_cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'id_cards' ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <IdCard className="w-3.5 h-3.5" />
              <span>ID Badges</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 0: OFFICE STAFF & MODULE ACCESS GOVERNANCE               */}
      {/* ============================================================ */}
      {activeTab === 'office_staff' && (
        <OfficeStaffTab
          staff={staff}
          assignOfficeStaffDuties={assignOfficeStaffDuties}
          canManage={isGovernanceUser}
          assignerDesignation={assignerDesignation}
        />
      )}

      {/* ============================================================ */}
      {/* TAB 1: MAWHPHURHNA SEMZAINA / DUTY & PORTFOLIO ALLOCATION */}
      {/* ============================================================ */}
      {activeTab === 'duties' && (
        <div className="space-y-6">
          {/* Institutional Governance KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                Class Teachers Assigned
              </span>
              <div className="text-2xl font-black text-white font-['Outfit'] flex items-baseline gap-2">
                <span>{staff.filter(s => s.classTeacherOf).length}</span>
                <span className="text-xs text-slate-400 font-normal">/ {classes.length} classes</span>
              </div>
              <p className="text-[10px] text-slate-500">
                {classes.length - staff.filter(s => s.classTeacherOf).length === 0 
                  ? 'All classes covered' 
                  : `${classes.length - staff.filter(s => s.classTeacherOf).length} class(es) unassigned`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Active Committees
              </span>
              <div className="text-2xl font-black text-white font-['Outfit']">
                {STANDARD_COMMITTEES.length}
              </div>
              <p className="text-[10px] text-slate-500">
                Institutional bodies &amp; review councils
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Avg. Weekly Workload
              </span>
              <div className="text-2xl font-black text-white font-['Outfit']">
                {Math.round(staff.reduce((acc, s) => acc + (s.weeklyPeriods || 0), 0) / (staff.filter(s => (s.weeklyPeriods || 0) > 0).length || 1))}
                <span className="text-xs text-slate-400 font-normal ml-1">Periods / Wk</span>
              </div>
              <p className="text-[10px] text-slate-500">Teaching faculty distribution</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Special Portfolios
              </span>
              <div className="text-2xl font-black text-white font-['Outfit']">
                {staff.filter(s => s.specialDuty && s.specialDuty.trim().length > 0).length}
              </div>
              <p className="text-[10px] text-slate-500">Superintendent, Dean &amp; In-Charges</p>
            </div>
          </div>

          {/* SECTION 1: DISTINCT CLASS MASTER GOVERNANCE BOARD (VICE PRINCIPAL & PRINCIPAL AUTHORITY) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
            {/* Notification Toast for Class Master Assignment */}
            {assignmentToast && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/90 to-cyan-950/80 border border-emerald-500/50 text-white flex items-center justify-between shadow-xl animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-emerald-300 font-['Outfit'] text-sm">
                        Class Master Siamremna Hlawhtling
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        {assignmentToast.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      <strong>{assignmentToast.className}</strong> atan{' '}
                      <span className="text-cyan-300 font-bold">{assignmentToast.teacherName}</span> ruat a ni ta. 
                      Class tin hian Class Master a hran theuh an nei zui zel e. Private notification thawn nghal bawk a ni.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setAssignmentToast(null)} 
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Header & Authority Banner */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-lg font-black text-white font-['Outfit'] flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-cyan-400" />
                    <span>Class Master (In-Charge) Governance Board</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[11px] font-bold">
                    A Hran Theuh (Distinct Active)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Class tin hian Class Master a hran theuh an nei tur a ni a, hei hi <strong>Vice Principal leh Principal</strong> chauhvin an siamremin an thlak thei ang.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {canManageClassMaster ? (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      {isPrincipal ? 'Principal Authority' : isVicePrincipal ? 'Vice Principal Authority' : 'Executive Council'}: Siamrem Theihna A Inhawng
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-400 text-xs">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Vice Principal &amp; Principal Authority Bik (View Only)</span>
                  </div>
                )}
                <span className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 font-mono">
                  Session 2026-2027
                </span>
              </div>
            </div>

            {/* Distinctness Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90">
                <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  Total Classes
                </span>
                <div className="text-2xl font-black text-white font-['Outfit'] mt-0.5">
                  {classes.length}
                </div>
                <p className="text-[10px] text-slate-500">Nursery to Class 12</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90">
                <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                  Assigned Masters
                </span>
                <div className="text-2xl font-black text-emerald-400 font-['Outfit'] mt-0.5">
                  {classes.filter(c => staff.some(s => s.classTeacherOf === c.id)).length}
                </div>
                <p className="text-[10px] text-emerald-500/80">Active section in-charges</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90">
                <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Distinct Educators
                </span>
                <div className="text-2xl font-black text-purple-300 font-['Outfit'] mt-0.5">
                  {new Set(classes.map(c => staff.find(s => s.classTeacherOf === c.id)?.id).filter(Boolean)).size} / {classes.length}
                </div>
                <p className="text-[10px] text-purple-400 font-medium">100% Unique (A hran theuh)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90">
                <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3 text-amber-400" />
                  Reallocation Authority
                </span>
                <div className="text-sm font-bold text-amber-300 font-['Outfit'] mt-1 truncate">
                  Vice &amp; Principal
                </div>
                <p className="text-[10px] text-slate-500">Exclusive governance</p>
              </div>
            </div>

            {/* Filter Pills and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {['All', 'Pre-Primary', 'Primary School', 'Middle School', 'High School', 'Higher Secondary'].map(cat => {
                  const isActive = classMasterLevelFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setClassMasterLevelFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                          : 'bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search class or teacher..."
                  value={classMasterSearch}
                  onChange={(e) => setClassMasterSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            {/* Class Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes
                .filter(cls => {
                  const n = (cls.name || '').toLowerCase();
                  let cat = 'General';
                  if (n.includes('nursery') || n.includes('lkg') || n.includes('ukg')) cat = 'Pre-Primary';
                  else if (n.includes('class 11') || n.includes('class 12')) cat = 'Higher Secondary';
                  else if (n.includes('class 9') || n.includes('class 10')) cat = 'High School';
                  else if (n.includes('class 6') || n.includes('class 7') || n.includes('class 8')) cat = 'Middle School';
                  else if (n.includes('class 1') || n.includes('class 2') || n.includes('class 3') || n.includes('class 4') || n.includes('class 5')) cat = 'Primary School';

                  const matchesCat = classMasterLevelFilter === 'All' || cat === classMasterLevelFilter;
                  const assignedTeacher = staff.find(s => s.classTeacherOf === cls.id);
                  const q = classMasterSearch.toLowerCase().trim();
                  const matchesSearch = !q ||
                    cls.name.toLowerCase().includes(q) ||
                    (cls.stream && cls.stream.toLowerCase().includes(q)) ||
                    (cls.roomNumber && cls.roomNumber.toLowerCase().includes(q)) ||
                    (assignedTeacher && assignedTeacher.name.toLowerCase().includes(q)) ||
                    (assignedTeacher && assignedTeacher.designation.toLowerCase().includes(q));
                  return matchesCat && matchesSearch;
                })
                .map(cls => {
                  const assignedTeacher = staff.find(s => s.classTeacherOf === cls.id);

                  return (
                    <div 
                      key={cls.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        assignedTeacher 
                          ? 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 shadow-md' 
                          : 'bg-amber-950/20 border-amber-500/40'
                      }`}
                    >
                      <div>
                        {/* Class Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-black text-white font-['Outfit']">
                                {cls.name}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/90 text-cyan-300 font-mono border border-slate-700">
                                Room {cls.roomNumber || 'R-01'}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {cls.stream ? `Stream: ${cls.stream.toUpperCase()}` : 'General Stream'} • Section {cls.section || 'A'}
                            </span>
                          </div>

                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                            Distinct
                          </span>
                        </div>

                        {/* Assigned Teacher Cardlet */}
                        <div className="mt-3.5 pt-3.5 border-t border-slate-800/80">
                          {assignedTeacher ? (
                            <div className="space-y-2.5">
                              <div className="flex items-start gap-3">
                                <img
                                  src={assignedTeacher.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                  alt={assignedTeacher.name}
                                  className="w-11 h-11 rounded-xl object-cover ring-2 ring-emerald-500/40 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-white truncate">
                                      {assignedTeacher.name}
                                    </span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                                  </div>
                                  <p className="text-[11px] text-cyan-400 truncate font-medium">
                                    {assignedTeacher.designation}
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {assignedTeacher.qualification || assignedTeacher.department}
                                  </p>
                                  <p className="text-[10px] text-slate-500 font-mono">
                                    📞 {assignedTeacher.phone}
                                  </p>
                                </div>
                              </div>

                              {/* Duty Responsibilities Pill */}
                              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] text-slate-300 flex items-center justify-between">
                                <span className="flex items-center gap-1 text-slate-400">
                                  <FileText className="w-3 h-3 text-cyan-400" />
                                  Class Master Duties:
                                </span>
                                <span className="text-cyan-300 font-semibold">Leaves &amp; Attendance</span>
                              </div>

                              {/* Class Leadership Roster (Class Master Ruat) */}
                              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-1.5">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                                    <Crown className="w-3 h-3 text-amber-400" />
                                    Class Leaders (Class Master Ruat):
                                  </span>
                                  <button
                                    onClick={() => setLeaderModalTarget(cls)}
                                    className="text-amber-300 hover:text-amber-200 font-bold underline text-[10px]"
                                  >
                                    Siamrem
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                  <div className="bg-slate-950/70 p-1.5 rounded-lg border border-amber-500/20 truncate">
                                    <span className="text-amber-400/80 block text-[9px] font-semibold">👑 Leader</span>
                                    <span className="text-white font-medium truncate block">
                                      {cls.classLeaderName || 'Ruat a la ni lo'}
                                    </span>
                                  </div>
                                  <div className="bg-slate-950/70 p-1.5 rounded-lg border border-cyan-500/20 truncate">
                                    <span className="text-cyan-400/80 block text-[9px] font-semibold">⭐ Assistant</span>
                                    <span className="text-white font-medium truncate block">
                                      {cls.asstClassLeaderName || 'Ruat a la ni lo'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2 py-2">
                              <div className="flex items-center gap-1.5 text-xs text-amber-400">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>Class Master ruat a la ni lo</span>
                              </div>
                              <p className="text-[10px] text-slate-500">
                                He class hian Class Master a la mamawh e.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons: Class Master Reassign & Leaders Appointment */}
                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                        {canManageClassMaster ? (
                          <button
                            onClick={() => {
                              setQuickClassAssignTarget({ classId: cls.id, className: cls.name });
                              setModalTeacherSearch('');
                            }}
                            className="flex-1 py-1.5 px-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-xs font-semibold flex items-center justify-center gap-1 transition truncate"
                            title="Siamrem Class Master"
                          >
                            <Edit3 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{assignedTeacher ? 'Siamrem Master' : 'Ruat Master'}</span>
                          </button>
                        ) : (
                          <div className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900 border border-slate-800/80 text-slate-500 text-[10px] text-center flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">VP/Principal Authority</span>
                          </div>
                        )}

                        <button
                          onClick={() => setLeaderModalTarget(cls)}
                          className="py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-semibold flex items-center justify-center gap-1 transition shrink-0"
                          title="Class Leader leh Assistant Ruatna"
                        >
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          <span>Leaders</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* SECTION 2: INSTITUTIONAL COMMITTEES & COUNCILS */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Institutional Committees &amp; Operational Councils</span>
                </h3>
                <p className="text-xs text-slate-400">
                  School enkawlna tura Committee hrang hranga zirtirtu leh staff mawhphurhna nei te.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STANDARD_COMMITTEES.map((committeeName, idx) => {
                const members = staff.filter(s => (s.committees || []).includes(committeeName));

                return (
                  <div 
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-white font-['Outfit'] flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{committeeName}</span>
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
                          {members.length} Member{members.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Official board quorum &amp; compliance
                      </p>
                    </div>

                    {/* Member Avatars & Details */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      {members.length > 0 ? (
                        <div className="space-y-1.5">
                          {members.map(mem => (
                            <div key={mem.id} className="flex items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <img
                                  src={mem.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                  alt={mem.name}
                                  className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700"
                                />
                                <span className="text-slate-200 text-xs truncate">
                                  {mem.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-cyan-400 font-medium truncate">
                                {mem.designation.split(' ')[0]}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic py-1">
                          Member la ruat an awm lo
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: TEACHING WORKLOAD & SPECIAL PORTFOLIOS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workload Distribution */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>Faculty Weekly Teaching Load (Periods / Week)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Zirtirtu tina kar khata class neih zat leh zirtir dan tlangpui.
                </p>
              </div>

              <div className="space-y-3">
                {staff
                  .filter(s => (s.weeklyPeriods || 0) > 0 || (s.subjectsTaught && s.subjectsTaught.length > 0))
                  .map(stf => {
                    const periods = stf.weeklyPeriods || 0;
                    const maxStandard = 30;
                    const percentage = Math.min(100, Math.round((periods / maxStandard) * 100));

                    return (
                      <div key={stf.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{stf.name}</span>
                            <span className="text-[10px] text-slate-400">({stf.designation})</span>
                          </div>
                          <span className="font-mono font-bold text-cyan-300">
                            {periods} Periods / Wk
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              periods >= 24 ? 'bg-amber-500' : periods >= 18 ? 'bg-emerald-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                          <span>
                            Subjects: {(stf.subjectsTaught || []).join(', ') || 'General'}
                          </span>
                          <span className="font-mono text-slate-500">
                            {periods >= 24 ? 'Heavy Load' : periods >= 18 ? 'Standard Load' : 'Executive Load'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Special Duty & Institutional In-Charges */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Special Institutional Portfolios &amp; Custodians</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Lab, Hostel, Library, Magazine leh Financial duties bik vawntute.
                </p>
              </div>

              <div className="space-y-2.5">
                {staff
                  .filter(s => s.specialDuty && s.specialDuty.trim().length > 0)
                  .map(stf => (
                    <div 
                      key={stf.id}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={stf.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={stf.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-cyan-500/40"
                        />
                        <div>
                          <span className="font-bold text-white block">{stf.name}</span>
                          <span className="text-[11px] text-cyan-300 font-semibold block">
                            {stf.specialDuty}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {stf.designation} • {stf.department}
                          </span>
                        </div>
                      </div>

                      {isGovernanceUser && (
                        <button
                          onClick={() => {
                            setEditingStaff({ ...stf });
                            setEditTab('duties');
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Edit portfolio"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: STAFF DIRECTORY & PROFILES (WITH ADD & EDIT SUITE) */}
      {/* ============================================================ */}
      {activeTab === 'staff_directory' && (
        <div className="space-y-6">
          {/* Controls & Search Toolbar */}
          <div className="no-print p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search faculty name, ID, or duty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-60"
                />
              </div>

              {/* Department Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-700 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="bg-transparent text-white focus:outline-none text-xs"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept} className="bg-slate-900 text-white">{dept}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-700 text-xs">
                <span className="text-slate-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-white focus:outline-none text-xs"
                >
                  <option value="All" className="bg-slate-900 text-white">All Statuses</option>
                  <option value="active" className="bg-slate-900 text-white">Active</option>
                  <option value="on_leave" className="bg-slate-900 text-white">On Leave</option>
                  <option value="deputation" className="bg-slate-900 text-white">Deputation</option>
                  <option value="retired" className="bg-slate-900 text-white">Retired / Resigned</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                Showing <strong className="text-white">{filteredStaff.length}</strong> of {staff.length} staff
              </span>
              {isGovernanceUser && (
                <button
                  onClick={() => setIsAddStaffModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Staff Member</span>
                </button>
              )}
            </div>
          </div>

          {/* Staff Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStaff.map((stf) => {
              const assignedClassObj = classes.find(c => c.id === stf.classTeacherOf);

              return (
                <div 
                  key={stf.id} 
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header Photo & Identity */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <img 
                            src={stf.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                            alt={stf.name}
                            className="w-13 h-13 rounded-2xl object-cover ring-2 ring-cyan-500/40 shadow"
                          />
                          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded bg-rose-600 text-white font-black text-[9px] font-mono shadow">
                            {stf.bloodGroup || 'O+'}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-white font-['Outfit'] truncate">{stf.name}</h3>
                          <p className="text-xs text-cyan-400 font-semibold">{stf.designation}</p>
                          <span className="text-[11px] text-slate-400 block">{stf.department}</span>
                          <span className="text-[10px] text-slate-500 font-mono block">{stf.qualification}</span>
                        </div>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        (stf.status || 'active') === 'active' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : (stf.status || 'active') === 'on_leave'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {stf.status || 'active'}
                      </span>
                    </div>

                    {/* Mawhphurhna / Responsibility Highlights */}
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
                      {/* Class Teacher Badge */}
                      {assignedClassObj ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>Class Teacher: <strong>{assignedClassObj.name}</strong></span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500">
                          Class Teacher: <em>None assigned</em>
                        </div>
                      )}

                      {/* Subjects */}
                      {stf.subjectsTaught && stf.subjectsTaught.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 text-[10px]">
                          <span className="text-slate-400">Subjects:</span>
                          {stf.subjectsTaught.map((sub, sIdx) => (
                            <span key={sIdx} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200">
                              {sub}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Special Duty */}
                      {stf.specialDuty && (
                        <div className="text-[11px] text-cyan-300 flex items-center gap-1">
                          <Award className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                          <span className="truncate">{stf.specialDuty}</span>
                        </div>
                      )}

                      {/* Committees */}
                      {stf.committees && stf.committees.length > 0 && (
                        <div className="text-[10px] text-slate-400">
                          Committees: <strong className="text-slate-300">{stf.committees.length} councils</strong>
                        </div>
                      )}
                    </div>

                    {/* Salary Overview */}
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Base Salary:</span>
                        <span className="font-mono font-bold text-white">₹{stf.baseSalary?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-1 border-t border-slate-800">
                        <span className="text-slate-300">Net Take-Home:</span>
                        <span className="font-mono text-cyan-300">
                          ₹{((stf.baseSalary || 0) + (stf.allowances || 0) - (stf.deductions || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <div>Emp ID: <span className="text-slate-200 font-mono font-semibold">{stf.employeeId || 'EMP-GEN-000'}</span></div>
                      <div>Contact: <span className="font-mono text-slate-300">{stf.phone}</span></div>
                      <div className="truncate">Email: {stf.email}</div>
                    </div>
                  </div>

                  {/* Actions Strip */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSinglePrintCard(stf)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center gap-1"
                      >
                        <IdCard className="w-3.5 h-3.5" />
                        <span>ID Card</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleOpenSalaryAdjust(stf)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition flex items-center gap-1"
                          title="Admin: Siamrem Staff Hlawh"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Siamrem Hlawh</span>
                        </button>
                      )}
                    </div>

                    {isGovernanceUser && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingStaff({ ...stf });
                            setEditTab('duties');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit &amp; Assign Duties</span>
                        </button>
                        <button
                          onClick={() => setDeletingStaffId(stf.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                          title="Remove Staff"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: PAYROLL DISBURSAL */}
      {/* ============================================================ */}
      {activeTab === 'payroll_runs' && (
        <div className="space-y-6">
          <div className="no-print p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Payroll Period:</span>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Disbursed Total</span>
                <span className="text-lg font-black text-cyan-300 font-mono">₹{totalPayrollAmount.toLocaleString()}</span>
              </div>
              <button 
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Disbursal Sheet</span>
              </button>
            </div>
          </div>

          {/* Payroll Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Faculty / Staff Member</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4 text-right">Base Salary</th>
                  <th className="py-3 px-4 text-right">Allowances</th>
                  <th className="py-3 px-4 text-right">Deductions</th>
                  <th className="py-3 px-4 text-right">Net Payable</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {staff.map((stf) => {
                  const payRec = filteredPayroll.find(p => p.staffId === stf.id);
                  const isPaid = !!payRec;
                  const netPay = (stf.baseSalary || 0) + (stf.allowances || 0) - (stf.deductions || 0);

                  return (
                    <tr key={stf.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={stf.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                            alt={stf.name}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                          />
                          <div>
                            <div className="font-bold text-white">{stf.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{stf.employeeId || 'EMP-GEN-000'} • {stf.bankAccount}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div>{stf.designation}</div>
                        <div className="text-[10px] text-slate-500">{stf.department}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-200">₹{stf.baseSalary?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-400">+₹{stf.allowances?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-rose-400">-₹{stf.deductions?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-cyan-300">₹{netPay.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-center">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Disbursed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isAdmin && (
                            <button
                              onClick={() => handleOpenSalaryAdjust(stf)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition inline-flex items-center gap-1"
                              title="Admin: Siamremna (Salary Adjustment)"
                            >
                              <Settings className="w-3 h-3" />
                              <span>Siamrem</span>
                            </button>
                          )}
                          {isPaid ? (
                            <button
                              onClick={() => setSelectedPayslip(payRec)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold transition inline-flex items-center gap-1"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>Payslip</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRunPayrollForStaff(stf)}
                              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-sm"
                            >
                              Disburse
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: PAY SCALES & SALARY REVISION (STRICT ADMIN ONLY) */}
      {/* ============================================================ */}
      {activeTab === 'pay_scales' && (
        <div className="space-y-6">
          {!isAdmin ? (
            <div className="p-8 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-center space-y-4 max-w-xl mx-auto my-12 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-white font-['Outfit']">Admin Kut Chauh A Awm Tur A Ni</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  School institutional pay scales, grade pay allowances (DA, HRA, Medical), deductions leh staff hlawh siamremna (payroll revision) hi <strong>School Principal leh Super Admin</strong> kut a awm tura ruahman a ni.
                </p>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-amber-300 flex items-center justify-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>I login role ({currentUser?.role || 'Staff / Faculty'}) hian pay scale leh salary adjustment khawih theihna authority a nei lo.</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pay Scales Header & Summary Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-black text-white font-['Outfit']">
                      Institutional Pay Scale &amp; Salary Matrix
                    </h3>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                      Admin Master Console
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-2xl">
                    Mizoram School 7th Pay Commission Matrix, Grade Pay bands, allowances (DA 38%, HRA 16%, Medical, Special), statutory deductions leh faculty tinte hlawh siamremna (Salary Revision Suite).
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAddScaleModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 text-xs font-black transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Scale Band</span>
                  </button>
                </div>
              </div>

              {/* Pay Scale Matrix Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    Active Pay Bands
                  </span>
                  <div className="text-2xl font-black text-white font-['Outfit']">{payScales.length} Levels</div>
                  <p className="text-[10px] text-slate-500">Level 4 to Level 14 Tiers</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-emerald-400" />
                    Dearness Allowance (DA)
                  </span>
                  <div className="text-2xl font-black text-emerald-400 font-['Outfit']">38%</div>
                  <p className="text-[10px] text-slate-500">State standardized rate</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    House Rent Allowance (HRA)
                  </span>
                  <div className="text-2xl font-black text-cyan-400 font-['Outfit']">16%</div>
                  <p className="text-[10px] text-slate-500">Class Y (Aizawl Urban Area)</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                    NPS / EPF Deduction
                  </span>
                  <div className="text-2xl font-black text-rose-400 font-['Outfit']">10%</div>
                  <p className="text-[10px] text-slate-500">Basic + DA mandatory cut</p>
                </div>
              </div>

              {/* Pay Scales Cards Grid */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white font-['Outfit']">Institutional Scale Tiers</h4>
                    <span className="text-xs text-slate-400">({payScales.length} configured bands)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search scales or roles..."
                        value={payScaleSearch}
                        onChange={(e) => setPayScaleSearch(e.target.value)}
                        className="pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 w-52"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {payScales
                    .filter(sc => {
                      if (!payScaleSearch) return true;
                      const q = payScaleSearch.toLowerCase();
                      return sc.level?.toLowerCase().includes(q) || 
                             sc.title?.toLowerCase().includes(q) || 
                             sc.description?.toLowerCase().includes(q) ||
                             (sc.designations && sc.designations.some(d => d.toLowerCase().includes(q)));
                    })
                    .map(scale => {
                      const base = Number(scale.currentBase) || 30000;
                      const da = Math.round(base * ((Number(scale.daRatePercent) || 38) / 100));
                      const hra = Math.round(base * ((Number(scale.hraRatePercent) || 16) / 100));
                      const med = Number(scale.medicalAllowance) || 0;
                      const spec = Number(scale.specialAllowance) || 0;
                      const gross = base + da + hra + med + spec;
                      const nps = Math.round((base + da) * ((Number(scale.epfNpsPercent) || 10) / 100));
                      const ptax = Number(scale.profTax) || 150;
                      const estNet = gross - nps - ptax;

                      const matchingStaff = staff.filter(s => 
                        s.payScaleId === scale.id || 
                        (scale.designations && scale.designations.some(d => d.toLowerCase() === (s.designation || '').toLowerCase()))
                      );

                      return (
                        <div key={scale.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between space-y-4 shadow-lg">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black font-mono uppercase">
                                  {scale.level}
                                </span>
                                <h4 className="text-sm font-bold text-white font-['Outfit'] mt-1 leading-snug">
                                  {scale.title}
                                </h4>
                              </div>
                              <button
                                onClick={() => setEditingScale({ ...scale })}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                title="Edit Scale Band"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <p className="text-[11px] text-slate-400 line-clamp-2">
                              {scale.description}
                            </p>

                            {/* Base Pay Range */}
                            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Pay Band Range:</span>
                                <span className="font-mono font-bold text-white">
                                  ₹{scale.minBase?.toLocaleString()} - ₹{scale.maxBase?.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Standard Base:</span>
                                <span className="font-mono font-bold text-amber-300">
                                  ₹{scale.currentBase?.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Allowance & Deduction Breakdown Chips */}
                            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                              <div className="p-1.5 rounded bg-slate-950 border border-slate-800/60">
                                <span className="text-slate-400 block">DA ({scale.daRatePercent}%):</span>
                                <span className="font-mono text-emerald-400 font-semibold">+₹{da.toLocaleString()}</span>
                              </div>
                              <div className="p-1.5 rounded bg-slate-950 border border-slate-800/60">
                                <span className="text-slate-400 block">HRA ({scale.hraRatePercent}%):</span>
                                <span className="font-mono text-emerald-400 font-semibold">+₹{hra.toLocaleString()}</span>
                              </div>
                              <div className="p-1.5 rounded bg-slate-950 border border-slate-800/60">
                                <span className="text-slate-400 block">Med + Special:</span>
                                <span className="font-mono text-emerald-400 font-semibold">+₹{(med + spec).toLocaleString()}</span>
                              </div>
                              <div className="p-1.5 rounded bg-slate-950 border border-slate-800/60">
                                <span className="text-slate-400 block">NPS &amp; Tax:</span>
                                <span className="font-mono text-rose-400 font-semibold">-₹{(nps + ptax).toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Estimated Net Calculation */}
                            <div className="p-2.5 rounded-xl bg-gradient-to-r from-slate-950 to-amber-950/30 border border-amber-500/20 flex items-center justify-between text-xs">
                              <span className="text-slate-300 font-medium">Est. Net Take-Home:</span>
                              <span className="font-mono font-black text-amber-300 text-sm">₹{estNet.toLocaleString()}</span>
                            </div>

                            {/* Eligible Roles */}
                            {scale.designations && scale.designations.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {scale.designations.map((d, dIdx) => (
                                  <span key={dIdx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300">
                                    {d}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-slate-400 text-[11px]">
                              Faculty covered: <strong className="text-white">{matchingStaff.length}</strong>
                            </span>
                            <button
                              onClick={() => {
                                if (matchingStaff.length > 0) {
                                  handleOpenSalaryAdjust(matchingStaff[0]);
                                }
                              }}
                              disabled={matchingStaff.length === 0}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition disabled:opacity-40"
                            >
                              Siamrem Faculty
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Staff Salary Revision Matrix & Adjustment Table */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden space-y-3 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                      <span>Staff Salary Master Register &amp; Siamremna Records</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {staff.length} staff
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Staff tinte hlawh, basic pay, allowance leh deductions siamrem theihna table. Admin chauhvin a siamrem thei.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                      <tr>
                        <th className="py-3 px-4">Faculty Member</th>
                        <th className="py-3 px-4">Designation</th>
                        <th className="py-3 px-4">Pay Band Level</th>
                        <th className="py-3 px-4 text-right">Base Salary</th>
                        <th className="py-3 px-4 text-right">Allowances</th>
                        <th className="py-3 px-4 text-right">Deductions</th>
                        <th className="py-3 px-4 text-right">Net Payable</th>
                        <th className="py-3 px-4">Last Revision</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {staff.map((stf) => {
                        const netPay = (stf.baseSalary || 0) + (stf.allowances || 0) - (stf.deductions || 0);
                        const matchingScale = payScales.find(sc => 
                          sc.id === stf.payScaleId || 
                          (sc.designations && sc.designations.some(d => d.toLowerCase() === (stf.designation || '').toLowerCase()))
                        );
                        const lastRev = stf.salaryRevisionHistory && stf.salaryRevisionHistory[0];

                        return (
                          <tr key={stf.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={stf.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                  alt={stf.name}
                                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
                                />
                                <div>
                                  <div className="font-bold text-white">{stf.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{stf.employeeId || 'EMP-000'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-300">
                              <div>{stf.designation}</div>
                              <div className="text-[10px] text-slate-500">{stf.department}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold font-mono">
                                {stf.payScaleLevel || matchingScale?.level || 'Custom Scale'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-slate-200">
                              ₹{stf.baseSalary?.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-emerald-400">
                              +₹{stf.allowances?.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-rose-400">
                              -₹{stf.deductions?.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-cyan-300">
                              ₹{netPay.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-[11px]">
                              {lastRev ? (
                                <div>
                                  <span className="text-white font-medium block">{lastRev.effectiveMonth}</span>
                                  <span className="text-[10px] text-slate-500 truncate block max-w-xs">{lastRev.reason}</span>
                                </div>
                              ) : (
                                <span className="text-slate-500 italic">Initial Setup</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleOpenSalaryAdjust(stf)}
                                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 ml-auto shadow-sm"
                                title="Admin: Siamrem Hlawh"
                              >
                                <Settings className="w-3.5 h-3.5" />
                                <span>Siamrem Hlawh</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: INSTITUTIONAL FACULTY ID CARDS */}
      {/* ============================================================ */}
      {activeTab === 'id_cards' && (
        <div className="space-y-6">
          <div className="no-print p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search faculty or ID..."
                  value={idSearch}
                  onChange={(e) => setIdSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-52"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-700 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="bg-transparent text-white focus:outline-none text-xs"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept} className="bg-slate-900 text-white">{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                Showing <strong className="text-white">{filteredStaffForCards.length}</strong> faculty members
              </span>
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Batch Print All ID Cards ({filteredStaffForCards.length})</span>
              </button>
            </div>
          </div>

          {/* Cards Matrix */}
          <div className="printable-staff-cards grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStaffForCards.map((stf) => (
              <div
                key={stf.id}
                className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-gradient-to-b from-slate-900 via-slate-900/90 to-indigo-950/40 shadow-xl print:shadow-none print:border-2 print:border-slate-800 print:break-inside-avoid print:bg-white print:text-slate-900 text-white"
              >
                <div className="bg-gradient-to-r from-indigo-700 via-cyan-700 to-blue-700 print:bg-slate-900 px-4 py-3 text-white text-center relative">
                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-300 print:text-white" />
                    <h4 className="font-black text-xs uppercase tracking-wider font-['Outfit']">
                      {systemConfig?.schoolName || 'OHA (One Heart Academy)'}
                    </h4>
                  </div>
                  <p className="text-[9px] uppercase tracking-widest text-cyan-200/90 print:text-slate-200 font-semibold mt-0.5">
                    Affiliated to {systemConfig?.affiliationNo || 'MBSE'} • {systemConfig?.address?.split(',')[0] || 'Lunglawn, Lunglei'}
                  </p>
                  <span className="absolute top-2 right-2 text-[8px] px-1.5 py-0.5 rounded bg-black/40 text-cyan-300 font-mono font-bold uppercase">
                    STAFF
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={stf.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                        alt={stf.name}
                        className="w-20 h-24 rounded-xl object-cover ring-2 ring-cyan-400/50 print:ring-1 print:ring-slate-800 shadow-md"
                      />
                      <span className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded bg-rose-600 text-white font-black text-[9px] font-mono shadow">
                        {stf.bloodGroup || 'O+'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="font-bold text-sm text-white print:text-slate-900 font-['Outfit'] leading-tight">
                        {stf.name}
                      </h3>
                      <p className="text-xs text-cyan-300 print:text-indigo-700 font-semibold">
                        {stf.designation}
                      </p>
                      <div className="text-[11px] text-slate-300 print:text-slate-600">
                        {stf.department}
                      </div>
                      <div className="text-[10px] text-slate-400 print:text-slate-500 font-mono">
                        {stf.qualification}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/60 print:bg-slate-100 border border-slate-800/80 print:border-slate-300 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold block">Employee ID</span>
                      <span className="font-mono font-bold text-cyan-400 print:text-slate-900">
                        {stf.employeeId || 'EMP-GEN-000'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold block">Joining Date</span>
                      <span className="font-mono text-slate-300 print:text-slate-800">
                        {stf.joiningDate || '2020-01-01'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold block">Emergency Contact</span>
                      <span className="font-mono text-slate-300 print:text-slate-800 text-[10px]">
                        {stf.emergencyContact || stf.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold block">Card Validity</span>
                      <span className="font-mono font-bold text-emerald-400 print:text-emerald-700 text-[10px]">
                        MAY 2028
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 print:border-slate-300">
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-white rounded-lg shadow-sm">
                        <QRCodeSVG
                          value={JSON.stringify({
                            id: stf.id,
                            empId: stf.employeeId,
                            name: stf.name,
                            designation: stf.designation,
                            school: "Aizawl Model HSS",
                            verified: true
                          })}
                          size={52}
                          level="M"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] uppercase tracking-wider text-slate-400 block">Security Verification</span>
                        <span className="text-[9px] font-bold text-white print:text-slate-900 block font-mono">
                          SEC-{stf.id?.toUpperCase()}-2026
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="w-16 h-7 border-b border-dashed border-slate-500/70 mx-auto"></div>
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 print:text-slate-600 block mt-0.5">
                        Principal Auth.
                      </span>
                    </div>
                  </div>

                  <div className="no-print pt-2 flex items-center justify-end">
                    <button
                      onClick={() => setSinglePrintCard(stf)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect &amp; Print Card</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: EDIT STAFF & ASSIGN DUTIES */}
      {/* ============================================================ */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 text-white shadow-2xl p-6 font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Edit Staff &amp; Assign Responsibilities
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingStaff.name} ({editingStaff.employeeId || 'EMP-GEN-000'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingStaff(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Internal Tabs */}
            <div className="flex items-center gap-2 mt-4 pb-2 border-b border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setEditTab('duties')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  editTab === 'duties' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-950'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Mawhphurhna (Duties)</span>
              </button>
              <button
                type="button"
                onClick={() => setEditTab('profile')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  editTab === 'profile' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-950'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Profile &amp; Contact</span>
              </button>
              <button
                type="button"
                onClick={() => setEditTab('salary')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  editTab === 'salary' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-950'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Remuneration &amp; Bank</span>
              </button>
            </div>

            <form onSubmit={handleEditStaffSubmit} className="mt-4 space-y-4">
              {/* TAB 1: DUTIES & RESPONSIBILITIES */}
              {editTab === 'duties' && (
                <div className="space-y-4 text-xs">
                  {/* Class Teacher Assignment */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-slate-300 font-bold flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      <span>Class Teacher Duty (Class enkawltu tur ruatna):</span>
                    </label>
                    <select
                      value={editingStaff.classTeacherOf || ''}
                      onChange={(e) => setEditingStaff({ ...editingStaff, classTeacherOf: e.target.value || null })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="">-- No Class Teacher Duty (Unassigned) --</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} (Room {c.roomNumber || 'R-01'})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500">
                      He teacher hi class teacher-ah i ruat chuan attendance leh report card sign-tu a ni ang.
                    </p>
                  </div>

                  {/* Special Institutional Role */}
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      Special Institutional Role / Duty (Mawhphurhna bik):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Science Lab Superintendent, Boys Hostel Warden, Magazine Editor..."
                      value={editingStaff.specialDuty || ''}
                      onChange={(e) => setEditingStaff({ ...editingStaff, specialDuty: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Weekly Teaching Load & Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-bold block mb-1">
                        Weekly Periods (Kar khata class neih zat):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={editingStaff.weeklyPeriods || 0}
                        onChange={(e) => setEditingStaff({ ...editingStaff, weeklyPeriods: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 font-bold block mb-1">
                        Employment Status:
                      </label>
                      <select
                        value={editingStaff.status || 'active'}
                        onChange={(e) => setEditingStaff({ ...editingStaff, status: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="active">Active (Thawk mek)</option>
                        <option value="on_leave">On Leave (Chawlh la mek)</option>
                        <option value="deputation">Deputation (Hmun danga awm)</option>
                        <option value="retired">Retired / Resigned (Bâng tawh)</option>
                      </select>
                    </div>
                  </div>

                  {/* Subjects Taught Checkboxes */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <label className="text-slate-300 font-bold block">
                      Subjects Taught (Subject zirtir tur te):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 max-h-36 overflow-y-auto">
                      {COMMON_SUBJECTS.map(subj => {
                        const isChecked = (editingStaff.subjectsTaught || []).includes(subj);
                        return (
                          <label key={subj} className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSubjectInEdit(subj)}
                              className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                            />
                            <span className="text-[11px] truncate">{subj}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Committee Roles Checkboxes */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <label className="text-slate-300 font-bold block">
                      Institutional Committees &amp; Portfolios:
                    </label>
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 max-h-40 overflow-y-auto">
                      {STANDARD_COMMITTEES.map(comm => {
                        const isMember = (editingStaff.committees || []).includes(comm);
                        return (
                          <label key={comm} className="flex items-center gap-2.5 cursor-pointer text-slate-300 hover:text-white">
                            <input
                              type="checkbox"
                              checked={isMember}
                              onChange={() => toggleCommitteeInEdit(comm)}
                              className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                            />
                            <span className="text-xs">{comm}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PROFILE & CONTACT */}
              {editTab === 'profile' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Full Name:</label>
                      <input
                        type="text"
                        required
                        value={editingStaff.name || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Designation:</label>
                      <input
                        type="text"
                        required
                        value={editingStaff.designation || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, designation: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Department:</label>
                      <input
                        type="text"
                        value={editingStaff.department || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, department: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Educational Qualification:</label>
                      <input
                        type="text"
                        value={editingStaff.qualification || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, qualification: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Phone Number:</label>
                      <input
                        type="text"
                        value={editingStaff.phone || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Emergency Phone:</label>
                      <input
                        type="text"
                        value={editingStaff.emergencyContact || ''}
                        onChange={(e) => setEditingStaff({ ...editingStaff, emergencyContact: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Blood Group:</label>
                      <select
                        value={editingStaff.bloodGroup || 'O+'}
                        onChange={(e) => setEditingStaff({ ...editingStaff, bloodGroup: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-bold"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Institutional Email:</label>
                    <input
                      type="email"
                      value={editingStaff.email || ''}
                      onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Profile Photo URL:</label>
                    <input
                      type="text"
                      value={editingStaff.photoUrl || ''}
                      onChange={(e) => setEditingStaff({ ...editingStaff, photoUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: SALARY & BANK */}
              {editTab === 'salary' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Base Salary (₹):</label>
                      <input
                        type="number"
                        value={editingStaff.baseSalary || 0}
                        onChange={(e) => setEditingStaff({ ...editingStaff, baseSalary: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Allowances (HRA/TA ₹):</label>
                      <input
                        type="number"
                        value={editingStaff.allowances || 0}
                        onChange={(e) => setEditingStaff({ ...editingStaff, allowances: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 focus:outline-none focus:border-cyan-400 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Deductions (PF/Tax ₹):</label>
                      <input
                        type="number"
                        value={editingStaff.deductions || 0}
                        onChange={(e) => setEditingStaff({ ...editingStaff, deductions: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-rose-400 focus:outline-none focus:border-cyan-400 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-cyan-300 font-bold block">Net Monthly Take-Home</span>
                      <span className="text-[10px] text-slate-400">Calculated after statutory deductions</span>
                    </div>
                    <span className="text-lg font-black text-white font-mono">
                      ₹{((Number(editingStaff.baseSalary) || 0) + (Number(editingStaff.allowances) || 0) - (Number(editingStaff.deductions) || 0)).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Bank Account &amp; Branch:</label>
                    <input
                      type="text"
                      placeholder="e.g. SBI 30291827461 (Aizawl Main Branch)"
                      value={editingStaff.bankAccount || ''}
                      onChange={(e) => setEditingStaff({ ...editingStaff, bankAccount: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes &amp; Assign</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: ADD NEW STAFF MEMBER */}
      {/* ============================================================ */}
      {isAddStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 text-white shadow-2xl p-6 font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Add New Faculty or Staff Member
                  </h3>
                  <p className="text-xs text-slate-400">
                    School employee thar lakluhna leh profile siamna.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddStaffModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lalnunmawii Ralte"
                    value={newStaffForm.name}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PGT Mathematics Teacher"
                    value={newStaffForm.designation}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Science Department"
                    value={newStaffForm.department}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. M.Sc., B.Ed."
                    value={newStaffForm.qualification}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, qualification: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98620 00000"
                    value={newStaffForm.phone}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Blood Group</label>
                  <select
                    value={newStaffForm.bloodGroup}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Base Salary (₹)</label>
                  <input
                    type="number"
                    value={newStaffForm.baseSalary}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, baseSalary: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Institutional Email</label>
                <input
                  type="email"
                  placeholder="teacher@mizoramschool.edu"
                  value={newStaffForm.email}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Class Teacher assignment option */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Assign Class Teacher Role (Optional):
                </label>
                <select
                  value={newStaffForm.classTeacherOf}
                  onChange={(e) => setNewStaffForm({ ...newStaffForm, classTeacherOf: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="">-- No Class Teacher Role --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddStaffModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Faculty Roster</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: CLASS MASTER SIAMREMNA & REALLOCATION (VICE PRINCIPAL & PRINCIPAL AUTHORITY) */}
      {/* ============================================================ */}
      {quickClassAssignTarget && (() => {
        const targetCls = classes.find(c => c.id === quickClassAssignTarget.classId);
        const currentMaster = staff.find(s => s.classTeacherOf === quickClassAssignTarget.classId);
        const filteredModalStaff = staff.filter(stf => {
          if (!modalTeacherSearch.trim()) return true;
          const q = modalTeacherSearch.toLowerCase();
          return stf.name.toLowerCase().includes(q) ||
            stf.designation.toLowerCase().includes(q) ||
            (stf.department && stf.department.toLowerCase().includes(q)) ||
            (stf.employeeId && stf.employeeId.toLowerCase().includes(q));
        });

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 text-white shadow-2xl p-6 font-sans space-y-4 max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-['Outfit']">
                        Class Master Siamremna &amp; Ruat Thar
                      </h3>
                      <p className="text-[11px] text-cyan-300">
                        {quickClassAssignTarget.className} (Room {targetCls?.roomNumber || 'R-01'})
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setQuickClassAssignTarget(null);
                    setModalTeacherSearch('');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Authority & Policy Banner */}
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{assignerDesignation}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Zirtirtu pakhat chu <strong>class khatah chauh</strong> Class Master a ni thei ang (A hran theuh dan). Zirtirtu dang i thlan chuan a class hmasa zawk ațangin a in-relieve nghal ang.
                </p>
              </div>

              {/* Current Status Card */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Currently Assigned:</span>
                {currentMaster ? (
                  <div className="flex items-center gap-2">
                    <img 
                      src={currentMaster.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                      alt="" 
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-500"
                    />
                    <span className="font-bold text-emerald-300">{currentMaster.name}</span>
                    <span className="text-[10px] text-slate-500">({currentMaster.designation})</span>
                  </div>
                ) : (
                  <span className="text-amber-400 font-medium">Unassigned / Ruat a la ni lo</span>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search faculty by name or department..."
                  value={modalTeacherSearch}
                  onChange={(e) => setModalTeacherSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition"
                  autoFocus
                />
              </div>

              {/* Faculty List */}
              <div className="space-y-2 overflow-y-auto flex-1 pr-1 max-h-72">
                {/* Unassign option */}
                <button
                  onClick={() => handleQuickAssignClassTeacher(quickClassAssignTarget.classId, null)}
                  className="w-full p-2.5 rounded-xl bg-slate-950/70 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-500/40 text-left text-slate-400 hover:text-rose-300 transition flex items-center justify-between text-xs group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-rose-900/40 flex items-center justify-center text-slate-400 group-hover:text-rose-300">
                      <X className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold">Unassign / No Class Master</div>
                      <div className="text-[10px] text-slate-500">Class Master awm lo tura siamna</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">Clear</span>
                </button>

                {filteredModalStaff.map(stf => {
                  const isCurrent = stf.classTeacherOf === quickClassAssignTarget.classId;
                  const otherClass = stf.classTeacherOf && !isCurrent 
                    ? classes.find(c => c.id === stf.classTeacherOf) 
                    : null;

                  return (
                    <button
                      key={stf.id}
                      onClick={() => handleQuickAssignClassTeacher(quickClassAssignTarget.classId, stf.id)}
                      className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between gap-3 text-xs ${
                        isCurrent 
                          ? 'bg-emerald-950/40 border-emerald-500/60 text-white ring-1 ring-emerald-500/30' 
                          : otherClass
                            ? 'bg-slate-950 hover:bg-amber-950/20 border-slate-800 hover:border-amber-500/40 text-slate-200'
                            : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={stf.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={stf.name}
                          className="w-9 h-9 rounded-xl object-cover shrink-0 ring-1 ring-slate-700"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                            <span>{stf.name}</span>
                            {isCurrent && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            )}
                          </div>
                          <div className="text-[11px] text-cyan-400 truncate">{stf.designation}</div>
                          <div className="text-[10px] text-slate-500 truncate">{stf.department} • 📞 {stf.phone}</div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="shrink-0 flex items-center">
                        {isCurrent ? (
                          <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 text-[10px] flex items-center gap-1">
                            <Check className="w-3 h-3" /> Current
                          </span>
                        ) : otherClass ? (
                          <span className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30 text-[10px] flex items-center gap-1 max-w-[130px] truncate" title={`Assigned to ${otherClass.name}. Click will transfer.`}>
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span className="truncate">{otherClass.name}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20 text-[10px] flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Available
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Total Faculty: {staff.length} educators
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setQuickClassAssignTarget(null);
                    setModalTeacherSearch('');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ============================================================ */}
      {/* MODAL 4: DELETE CONFIRMATION */}
      {/* ============================================================ */}
      {deletingStaffId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 text-white shadow-2xl p-6 font-sans text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">Remove Staff Record?</h3>
              <p className="text-xs text-slate-400 mt-1">
                He staff member hi roster ațanga paih i duh takzet em? An data leh records a bo nghal ang.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingStaffId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteStaff(deletingStaffId);
                  setDeletingStaffId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/30"
              >
                Yes, Delete Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 5: INDIVIDUAL CARD PRINT PREVIEW */}
      {/* ============================================================ */}
      {singlePrintCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-white text-slate-950 shadow-2xl p-6 font-sans">
            <div className="no-print flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
              <span className="text-xs font-bold uppercase text-slate-500">Official Faculty ID Card</span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print ID Card</span>
                </button>
                <button
                  onClick={() => setSinglePrintCard(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="printable-area border-2 border-slate-900 rounded-2xl overflow-hidden shadow-md">
              <div className="bg-slate-900 px-4 py-3 text-white text-center">
                <div className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-black text-xs uppercase tracking-wider font-['Outfit']">
                    {systemConfig?.schoolName || 'OHA (One Heart Academy)'}
                  </h4>
                </div>
                <p className="text-[9px] uppercase tracking-widest text-slate-300 font-semibold mt-0.5">
                  Affiliated to {systemConfig?.affiliationNo || 'MBSE'} • {systemConfig?.address?.split(',')[0] || 'Lunglawn, Lunglei'}
                </p>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={singlePrintCard.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                      alt={singlePrintCard.name}
                      className="w-20 h-24 rounded-xl object-cover ring-2 ring-slate-800 shadow"
                    />
                    <span className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded bg-rose-600 text-white font-black text-[9px] font-mono shadow">
                      {singlePrintCard.bloodGroup || 'O+'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-bold text-sm text-slate-900 font-['Outfit'] leading-tight">
                      {singlePrintCard.name}
                    </h3>
                    <p className="text-xs text-indigo-700 font-bold">
                      {singlePrintCard.designation}
                    </p>
                    <div className="text-[11px] text-slate-600 font-medium">
                      {singlePrintCard.department}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {singlePrintCard.qualification}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-100 border border-slate-300 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-semibold block">Employee ID</span>
                    <span className="font-mono font-bold text-slate-900">
                      {singlePrintCard.employeeId || 'EMP-GEN-000'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-semibold block">Joining Date</span>
                    <span className="font-mono text-slate-800">
                      {singlePrintCard.joiningDate || '2020-01-01'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-semibold block">Emergency Contact</span>
                    <span className="font-mono text-slate-800 text-[10px]">
                      {singlePrintCard.emergencyContact || singlePrintCard.phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-semibold block">Validity</span>
                    <span className="font-mono font-bold text-emerald-700 text-[10px]">
                      MAY 2028
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-white rounded-lg border border-slate-200 shadow-sm">
                      <QRCodeSVG
                        value={JSON.stringify({
                          id: singlePrintCard.id,
                          empId: singlePrintCard.employeeId,
                          name: singlePrintCard.name,
                          designation: singlePrintCard.designation,
                          school: systemConfig?.schoolName || "OHA (One Heart Academy)",
                          verified: true
                        })}
                        size={54}
                        level="M"
                      />
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-slate-500 block">Security Key</span>
                      <span className="text-[9px] font-bold text-slate-900 block font-mono">
                        SEC-{singlePrintCard.id?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="w-20 h-8 border-b border-dashed border-slate-400 mx-auto"></div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-600 block mt-1 font-semibold">
                      Principal Signature
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 6: OFFICIAL PAYSLIP MODAL */}
      {/* ============================================================ */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-white text-slate-950 shadow-2xl p-6 sm:p-8 font-sans">
            <div className="no-print flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
              <span className="text-xs font-bold uppercase text-slate-500">Official Monthly Payslip</span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Payslip</span>
                </button>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="printable-area border-2 border-slate-900 rounded-xl p-6 space-y-4">
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <h3 className="font-black text-lg uppercase tracking-tight font-['Outfit']">
                  {systemConfig?.schoolName || 'OHA (One Heart Academy)'}
                </h3>
                <p className="text-[11px] text-slate-600 uppercase tracking-wider font-semibold">
                  Institutional Salary Voucher &amp; Remuneration Slip • {systemConfig?.address?.split(',')[0] || 'Lunglawn, Lunglei'}
                </p>
                <div className="mt-1">
                  <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white uppercase font-mono">
                    Payslip for {selectedPayslip.month} {selectedPayslip.year}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Employee Name</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedPayslip.staffName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Designation</span>
                  <span className="font-medium text-slate-800">{selectedPayslip.designation}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">NEFT Transaction Ref</span>
                  <span className="font-mono font-bold text-slate-900">{selectedPayslip.transactionRef}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Disbursal Date</span>
                  <span className="font-mono text-slate-800">{selectedPayslip.paymentDate}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Basic Pay:</span>
                  <span className="font-mono font-bold">₹{selectedPayslip.baseSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Special Allowances (HRA + DA):</span>
                  <span className="font-mono font-bold text-emerald-700">+₹{selectedPayslip.allowances.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Deductions (Statutory PF &amp; Tax):</span>
                  <span className="font-mono font-bold text-rose-700">-₹{selectedPayslip.deductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-slate-900 font-bold text-sm">
                  <span className="uppercase text-slate-900">Net Salary Credited:</span>
                  <span className="font-mono text-slate-950 font-black text-base">
                    ₹{selectedPayslip.netSalary.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-6 flex justify-between items-end text-[10px] text-slate-600">
                <div className="text-center">
                  <div className="w-20 h-10 border-b border-dashed border-slate-400"></div>
                  <span className="block mt-1">Employee Signature</span>
                </div>
                <div className="text-center">
                  <div className="w-20 h-10 border-b border-dashed border-slate-400"></div>
                  <span className="block mt-1">Accounts Officer / Principal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: STAFF SALARY REVISION / PAYROLL SIAMREMNA (ADMIN) */}
      {/* ============================================================ */}
      {adjustingSalaryStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-amber-500/40 shadow-2xl p-6 text-white my-8 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white font-['Outfit']">
                      Staff Payroll Siamremna &amp; Salary Adjustment
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold uppercase">
                      Admin Authority
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hlawh thar siamremna, allowance/deduction ennawnna leh Pay Scale kaihhruaina.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAdjustingSalaryStaff(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Staff Profile Info Card */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={adjustingSalaryStaff.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={adjustingSalaryStaff.name}
                  className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-700"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">{adjustingSalaryStaff.name}</h4>
                  <div className="text-xs text-cyan-400 font-medium">{adjustingSalaryStaff.designation} • {adjustingSalaryStaff.department}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    ID: {adjustingSalaryStaff.employeeId || 'EMP-000'} | Bank: {adjustingSalaryStaff.bankAccount}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Current Net</span>
                <span className="text-sm font-black font-mono text-cyan-300">
                  ₹{((adjustingSalaryStaff.baseSalary || 0) + (adjustingSalaryStaff.allowances || 0) - (adjustingSalaryStaff.deductions || 0)).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Quick Auto-fill from Standard Pay Scales Preset */}
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Quick Apply Standard Pay Scale Preset
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={salaryRevisionForm.scaleId || ''}
                  onChange={(e) => handleApplyScalePresetToForm(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">Select standard scale band to auto-calculate rates...</option>
                  {payScales.map(sc => (
                    <option key={sc.id} value={sc.id}>
                      {sc.level} - {sc.title} (Base: ₹{sc.currentBase?.toLocaleString()} | DA {sc.daRatePercent}% | HRA {sc.hraRatePercent}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveSalaryAdjustment} className="mt-4 space-y-4">
              {/* Earnings & Deductions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1: Earnings (Allowances + Base) */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Earnings &amp; Allowances (+)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-300 font-bold">
                      Gross: ₹{(
                        Number(salaryRevisionForm.baseSalary || 0) +
                        Number(salaryRevisionForm.daAllowance || 0) +
                        Number(salaryRevisionForm.hraAllowance || 0) +
                        Number(salaryRevisionForm.medicalAllowance || 0) +
                        Number(salaryRevisionForm.specialAllowance || 0) +
                        Number(salaryRevisionForm.arrearsBonus || 0)
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Basic Pay (₹)</label>
                      <input
                        type="number"
                        value={salaryRevisionForm.baseSalary}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setSalaryRevisionForm(prev => ({
                            ...prev,
                            baseSalary: val,
                            daAllowance: Math.round(val * 0.38),
                            hraAllowance: Math.round(val * 0.16),
                            npsDeduction: Math.round((val + Math.round(val * 0.38)) * 0.10)
                          }));
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">Dearness (DA ₹)</label>
                        <input
                          type="number"
                          value={salaryRevisionForm.daAllowance}
                          onChange={(e) => setSalaryRevisionForm({ ...salaryRevisionForm, daAllowance: Number(e.target.value) || 0 })}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-emerald-300 font-mono focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">House Rent (HRA ₹)</label>
                        <input
                          type="number"
                          value={salaryRevisionForm.hraAllowance}
                          onChange={(e) => setSalaryRevisionForm({ ...salaryRevisionForm, hraAllowance: Number(e.target.value) || 0 })}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-emerald-300 font-mono focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">Medical Allowance (₹)</label>
                        <input
                          type="number"
                          value={salaryRevisionForm.medicalAllowance}
                          onChange={(e) => setSalaryRevisionForm({ ...salaryRevisionForm, medicalAllowance: Number(e.target.value) || 0 })}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-emerald-300 font-mono focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">Special / Grade Duty (₹)</label>
                        <input
                          type="number"
                          value={salaryRevisionForm.specialAllowance}
                          onChange={(e) => setSalaryRevisionForm({ ...salaryRevisionForm, specialAllowance: Number(e.target.value) || 0 })}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-emerald-300 font-mono focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Arrears / Increment / Bonus (₹)</label>
                      <input
                        type="number"
                        value={salaryRevisionForm.arrearsBonus}
                        onChange={(e) => setSalaryRevisionForm({ ...salaryRevisionForm, arrearsBonus: Number(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-emerald-300 font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Column 2: Deductions */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                      Statutory &amp; Deductions (-)
                    </span>
                    <span className="text-[10px] font-mono text-rose-300 font-bold">
                      Total: ₹{(
                        Number(salaryRevisionForm.npsDeduction || 0) +
                        Number(salaryRevisionForm.profTaxDeduction || 0) +
                        Number(salaryRevisionForm.otherDeductions || 0)
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">NPS / EPF Deduction (10% Base+DA)</label>
                      <input
                        type="number"
                        value={salaryRevisionForm.npsDeduction}
                        onChange={(e) => setSalaryRevisionForm({ ...salaryRevisionForm, npsDeduction: Number(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Mizoram Professional Tax (₹)</label>
                      <input
                        type="number"
                        value={salaryRevisionForm.profTaxDeduction}
                        onChange={(e) => setSalaryRevisionForm({ ...salaryRevisionForm, profTaxDeduction: Number(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Loan / Advance / Staff Welfare (₹)</label>
                      <input
                        type="number"
                        value={salaryRevisionForm.otherDeductions}
                        onChange={(e) => setSalaryRevisionForm({ ...salaryRevisionForm, otherDeductions: Number(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Net Salary Comparison Strip */}
              {(() => {
                const prevNet = (adjustingSalaryStaff.baseSalary || 0) + (adjustingSalaryStaff.allowances || 0) - (adjustingSalaryStaff.deductions || 0);
                const revisedGross = 
                  Number(salaryRevisionForm.baseSalary || 0) +
                  Number(salaryRevisionForm.daAllowance || 0) +
                  Number(salaryRevisionForm.hraAllowance || 0) +
                  Number(salaryRevisionForm.medicalAllowance || 0) +
                  Number(salaryRevisionForm.specialAllowance || 0) +
                  Number(salaryRevisionForm.arrearsBonus || 0);
                const revisedDed = 
                  Number(salaryRevisionForm.npsDeduction || 0) +
                  Number(salaryRevisionForm.profTaxDeduction || 0) +
                  Number(salaryRevisionForm.otherDeductions || 0);
                const revisedNet = revisedGross - revisedDed;
                const netDiff = revisedNet - prevNet;

                return (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/30 grid grid-cols-3 gap-3 text-center">
                    <div className="border-r border-slate-800 pr-2">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Hlawh Hmasa (Previous)</span>
                      <span className="text-base font-black font-mono text-slate-300">₹{prevNet.toLocaleString()}</span>
                    </div>
                    <div className="border-r border-slate-800 px-2">
                      <span className="text-[10px] text-amber-300 uppercase tracking-wider block font-bold">Hlawh Thar (Revised)</span>
                      <span className="text-lg font-black font-mono text-cyan-300">₹{revisedNet.toLocaleString()}</span>
                    </div>
                    <div className="pl-2">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Danglamna (Difference)</span>
                      <span className={`text-base font-black font-mono flex items-center justify-center gap-1 ${
                        netDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {netDiff >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {netDiff >= 0 ? '+' : ''}₹{netDiff.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Administrative Reason & Audit Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Reason for Revision (Chhan) *</label>
                  <input
                    type="text"
                    value={salaryRevisionForm.reason}
                    onChange={(e) => setSalaryRevisionForm({ ...salaryRevisionForm, reason: e.target.value })}
                    placeholder="e.g. Annual Increment 2026, Level 10 Matrix Revision, Promotion"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Effective Month / Period</label>
                  <input
                    type="text"
                    value={salaryRevisionForm.effectiveMonth}
                    onChange={(e) => setSalaryRevisionForm({ ...salaryRevisionForm, effectiveMonth: e.target.value })}
                    placeholder="e.g. September 2026"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Notification Toggle */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="notifyStaffCheckbox"
                    checked={salaryRevisionForm.notifyStaff}
                    onChange={(e) => setSalaryRevisionForm({ ...salaryRevisionForm, notifyStaff: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                  <label htmlFor="notifyStaffCheckbox" className="text-xs text-slate-300 cursor-pointer font-medium">
                    Staff hnena confidential Private Notification thawn nghal rawh (In-App, WhatsApp, SMS)
                  </label>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  Confidential
                </span>
              </div>

              {/* Past Revision History if any */}
              {adjustingSalaryStaff.salaryRevisionHistory && adjustingSalaryStaff.salaryRevisionHistory.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-amber-400" />
                    Past Salary Revision History ({adjustingSalaryStaff.salaryRevisionHistory.length})
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {adjustingSalaryStaff.salaryRevisionHistory.map((rev, rIdx) => (
                      <div key={rIdx} className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 text-[11px] flex items-center justify-between">
                        <div>
                          <span className="text-white font-bold block">{rev.reason}</span>
                          <span className="text-slate-500 text-[10px]">{rev.revisionDate} • by {rev.revisedBy}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-cyan-300 font-mono font-bold block">₹{rev.revisedSalary?.netSalary?.toLocaleString()}</span>
                          <span className={`text-[10px] font-mono ${rev.netDifference >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {rev.netDifference >= 0 ? '+' : ''}₹{rev.netDifference?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustingSalaryStaff(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save &amp; Apply Salary Revision</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: EDIT PAY SCALE BAND (ADMIN ONLY) */}
      {/* ============================================================ */}
      {editingScale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-amber-500/40 shadow-2xl p-6 text-white my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                  {editingScale.level}
                </span>
                <h3 className="text-base font-bold text-white font-['Outfit']">Edit Pay Scale Band</h3>
              </div>
              <button
                onClick={() => setEditingScale(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveScaleEdit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Scale Title</label>
                <input
                  type="text"
                  value={editingScale.title}
                  onChange={(e) => setEditingScale({ ...editingScale, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Min Base (₹)</label>
                  <input
                    type="number"
                    value={editingScale.minBase}
                    onChange={(e) => setEditingScale({ ...editingScale, minBase: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Standard Base (₹)</label>
                  <input
                    type="number"
                    value={editingScale.currentBase}
                    onChange={(e) => setEditingScale({ ...editingScale, currentBase: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Max Base (₹)</label>
                  <input
                    type="number"
                    value={editingScale.maxBase}
                    onChange={(e) => setEditingScale({ ...editingScale, maxBase: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">DA Rate (%)</label>
                  <input
                    type="number"
                    value={editingScale.daRatePercent}
                    onChange={(e) => setEditingScale({ ...editingScale, daRatePercent: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">HRA Rate (%)</label>
                  <input
                    type="number"
                    value={editingScale.hraRatePercent}
                    onChange={(e) => setEditingScale({ ...editingScale, hraRatePercent: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Medical (₹)</label>
                  <input
                    type="number"
                    value={editingScale.medicalAllowance}
                    onChange={(e) => setEditingScale({ ...editingScale, medicalAllowance: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Special (₹)</label>
                  <input
                    type="number"
                    value={editingScale.specialAllowance}
                    onChange={(e) => setEditingScale({ ...editingScale, specialAllowance: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">NPS/EPF (%)</label>
                  <input
                    type="number"
                    value={editingScale.epfNpsPercent}
                    onChange={(e) => setEditingScale({ ...editingScale, epfNpsPercent: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-rose-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Prof Tax (₹)</label>
                  <input
                    type="number"
                    value={editingScale.profTax}
                    onChange={(e) => setEditingScale({ ...editingScale, profTax: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-rose-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Scale Description</label>
                <textarea
                  value={editingScale.description || ''}
                  onChange={(e) => setEditingScale({ ...editingScale, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingScale(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Scale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD NEW PAY SCALE BAND (ADMIN ONLY) */}
      {/* ============================================================ */}
      {isAddScaleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-amber-500/40 shadow-2xl p-6 text-white my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-['Outfit']">Add New Institutional Pay Scale Band</h3>
              <button
                onClick={() => setIsAddScaleModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateScale} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Level Code (e.g. Level 11)</label>
                  <input
                    type="text"
                    value={newScaleForm.level}
                    onChange={(e) => setNewScaleForm({ ...newScaleForm, level: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Scale Title</label>
                  <input
                    type="text"
                    value={newScaleForm.title}
                    onChange={(e) => setNewScaleForm({ ...newScaleForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Min Base (₹)</label>
                  <input
                    type="number"
                    value={newScaleForm.minBase}
                    onChange={(e) => setNewScaleForm({ ...newScaleForm, minBase: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Current Base (₹)</label>
                  <input
                    type="number"
                    value={newScaleForm.currentBase}
                    onChange={(e) => setNewScaleForm({ ...newScaleForm, currentBase: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Max Base (₹)</label>
                  <input
                    type="number"
                    value={newScaleForm.maxBase}
                    onChange={(e) => setNewScaleForm({ ...newScaleForm, maxBase: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">DA (%)</label>
                  <input
                    type="number"
                    value={newScaleForm.daRatePercent}
                    onChange={(e) => setNewScaleForm({ ...newScaleForm, daRatePercent: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">HRA (%)</label>
                  <input
                    type="number"
                    value={newScaleForm.hraRatePercent}
                    onChange={(e) => setNewScaleForm({ ...newScaleForm, hraRatePercent: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Med (₹)</label>
                  <input
                    type="number"
                    value={newScaleForm.medicalAllowance}
                    onChange={(e) => setNewScaleForm({ ...newScaleForm, medicalAllowance: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Special (₹)</label>
                  <input
                    type="number"
                    value={newScaleForm.specialAllowance}
                    onChange={(e) => setNewScaleForm({ ...newScaleForm, specialAllowance: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Applicable Roles / Designations (comma separated)</label>
                <input
                  type="text"
                  value={newScaleForm.designations}
                  onChange={(e) => setNewScaleForm({ ...newScaleForm, designations: e.target.value })}
                  placeholder="e.g. Senior Lecturer, Vice Dean, Special Educator"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Description</label>
                <textarea
                  value={newScaleForm.description}
                  onChange={(e) => setNewScaleForm({ ...newScaleForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddScaleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Add Scale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLASS LEADER & ASSISTANT APPOINTMENT MODAL */}
      <ClassLeaderModal
        isOpen={Boolean(leaderModalTarget)}
        onClose={() => setLeaderModalTarget(null)}
        targetClass={leaderModalTarget}
      />
    </div>
  );
}
