import React, { useState, useMemo } from 'react';
import {
  StaffMember,
  PayrollRecord,
  StaffLeave,
  FeeRecord,
  StaffDepartment,
  StaffStatus,
  PayrollPaymentStatus,
} from '../../types';
import {
  Users,
  CreditCard,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  UserCheck,
  Eye,
  Edit2,
  Trash2,
  Printer,
  Sparkles,
  PieChart,
  Layers,
} from 'lucide-react';
import { formatINR, generateStaffPayroll } from '../../lib/payrollService';
import { StaffModal } from './StaffModal';
import { StaffDetailsDrawer } from './StaffDetailsDrawer';
import { ProcessSalaryModal } from './ProcessSalaryModal';
import { ApplyLeaveModal } from './ApplyLeaveModal';
import { PrintablePayslipModal } from './PrintablePayslipModal';
import { addDocument, updateDocument, deleteDocument } from '../../lib/firebase';

interface StaffPayrollManagerProps {
  staffList: StaffMember[];
  payrollList: PayrollRecord[];
  leavesList: StaffLeave[];
  feeRecords: FeeRecord[];
  onNavigateToFees?: () => void;
}

export const StaffPayrollManager: React.FC<StaffPayrollManagerProps> = ({
  staffList,
  payrollList,
  leavesList,
  feeRecords,
  onNavigateToFees,
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'payroll' | 'leaves' | 'finance'>('payroll');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPayrollStatus, setSelectedPayrollStatus] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Modals state
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [viewingStaff, setViewingStaff] = useState<StaffMember | null>(null);

  const [isProcessSalaryOpen, setIsProcessSalaryOpen] = useState(false);
  const [processingPayroll, setProcessingPayroll] = useState<PayrollRecord | null>(null);

  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);
  const [leaveStaffId, setLeaveStaffId] = useState<string | undefined>(undefined);

  const [isPayslipOpen, setIsPayslipOpen] = useState(false);
  const [viewingPayslip, setViewingPayslip] = useState<PayrollRecord | null>(null);

  // Available unique months in payroll
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    months.add('2026-09');
    months.add('2026-08');
    payrollList.forEach((p) => months.add(p.month));
    return Array.from(months).sort().reverse();
  }, [payrollList]);

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      const matchesSearch =
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.phone.includes(searchQuery);
      const matchesDept = selectedDept === 'all' || staff.department === selectedDept;
      const matchesStatus = selectedStatus === 'all' || staff.status === selectedStatus;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [staffList, searchQuery, selectedDept, selectedStatus]);

  // Current month payroll records
  const monthPayrolls = useMemo(() => {
    return payrollList.filter((p) => p.month === selectedMonth);
  }, [payrollList, selectedMonth]);

  // Filtered month payrolls
  const filteredPayrolls = useMemo(() => {
    return monthPayrolls.filter((pay) => {
      const matchesSearch =
        pay.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pay.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pay.payslipNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        selectedPayrollStatus === 'all' || pay.paymentStatus === selectedPayrollStatus;
      return matchesSearch && matchesStatus;
    });
  }, [monthPayrolls, searchQuery, selectedPayrollStatus]);

  // Financial Stats
  const activeStaffCount = staffList.filter((s) => s.status === 'Active').length;
  const onLeaveStaffCount = staffList.filter((s) => s.status === 'On Leave').length;

  const totalPayrollCommitment = useMemo(() => {
    return monthPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
  }, [monthPayrolls]);

  const totalDisbursedThisMonth = useMemo(() => {
    return monthPayrolls
      .filter((p) => p.paymentStatus === 'Paid')
      .reduce((sum, p) => sum + p.netSalary, 0);
  }, [monthPayrolls]);

  const totalPendingThisMonth = useMemo(() => {
    return monthPayrolls
      .filter((p) => p.paymentStatus === 'Pending' || p.paymentStatus === 'Processing')
      .reduce((sum, p) => sum + p.netSalary, 0);
  }, [monthPayrolls]);

  const totalStudentFeesCollected = useMemo(() => {
    return feeRecords.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  }, [feeRecords]);

  // All-time payroll payouts disbursed
  const allTimePayrollDisbursed = useMemo(() => {
    return payrollList
      .filter((p) => p.paymentStatus === 'Paid')
      .reduce((sum, p) => sum + p.netSalary, 0);
  }, [payrollList]);

  // Net Operational Cashflow
  const netInstitutionalReserves = totalStudentFeesCollected - allTimePayrollDisbursed;

  // Handler: Save / Update Staff
  const handleSaveStaff = async (
    staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => {
    const now = new Date().toISOString();
    if (id) {
      await updateDocument('staff', id, {
        ...staffData,
        updatedAt: now,
      });
    } else {
      const newId = `stf-${Date.now()}`;
      await addDocument('staff', {
        id: newId,
        ...staffData,
        createdAt: now,
        updatedAt: now,
      });
    }
  };

  // Handler: Delete Staff
  const handleDeleteStaff = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete staff record for "${name}"?`)) {
      await deleteDocument('staff', id);
    }
  };

  // Handler: Generate Batch Payroll for Month
  const handleGenerateMonthlyPayroll = async () => {
    const confirmed = window.confirm(
      `Generate or update monthly payroll for all ${activeStaffCount} active staff members for ${selectedMonth}?`
    );
    if (!confirmed) return;

    for (const staff of staffList) {
      if (staff.status === 'Resigned' || staff.status === 'Retired') continue;

      // Check if already exists
      const existing = monthPayrolls.find((p) => p.staffId === staff.id);
      if (!existing) {
        const generated = generateStaffPayroll(staff, selectedMonth, leavesList);
        await addDocument('payroll', generated);
      }
    }
  };

  // Handler: Process Salary Payout
  const handleProcessPayroll = async (payrollId: string, updates: Partial<PayrollRecord>) => {
    await updateDocument('payroll', payrollId, updates);
  };

  // Handler: Quick Batch Disburse All Pending
  const handleBatchDisburse = async () => {
    const pendingList = monthPayrolls.filter(
      (p) => p.paymentStatus === 'Pending' || p.paymentStatus === 'Processing'
    );
    if (pendingList.length === 0) {
      alert('No pending payroll records found for this month.');
      return;
    }

    const confirmed = window.confirm(
      `Disburse salary for ${pendingList.length} staff members (${formatINR(
        totalPendingThisMonth
      )}) via Bank Transfer?`
    );
    if (!confirmed) return;

    const today = new Date().toISOString().split('T')[0];
    const batchRef = `BATCH-NEFT-${today.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    for (const p of pendingList) {
      await updateDocument('payroll', p.id, {
        paymentStatus: 'Paid',
        paymentDate: today,
        paymentMethod: p.paymentMethod || 'Bank Transfer',
        transactionRef: batchRef,
        disbursedBy: 'Pi Lalrinsangi (Head Bursar)',
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Handler: Apply Leave
  const handleApplyLeave = async (
    leaveData: Omit<StaffLeave, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newId = `lv-${Date.now()}`;
    const now = new Date().toISOString();
    await addDocument('staff_leaves', {
      id: newId,
      ...leaveData,
      createdAt: now,
      updatedAt: now,
    });
  };

  // Handler: Update Leave Status (Approve / Reject)
  const handleUpdateLeaveStatus = async (
    leaveId: string,
    status: 'Approved' | 'Rejected',
    remarks?: string
  ) => {
    await updateDocument('staff_leaves', leaveId, {
      status,
      remarks: remarks || `Leave ${status.toLowerCase()} by Principal Office.`,
      reviewedBy: 'Pu K. Lalthantluanga (Principal)',
      reviewedDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Building className="w-4 h-4" />
            Institutional Administration & Accounts
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Staff & Payroll Management
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Mizoram School System Faculty Roster, Monthly Salary Disbursals & Leave Processing
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => {
              setEditingStaff(null);
              setIsStaffModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Add Staff Member
          </button>
          <button
            onClick={() => {
              setLeaveStaffId(undefined);
              setIsApplyLeaveOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-medium transition-colors"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            Apply Leave
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staff */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Faculty & Staff
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{staffList.length}</span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
              <UserCheck className="w-3.5 h-3.5" />
              {activeStaffCount} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {onLeaveStaffCount > 0 ? `${onLeaveStaffCount} currently on leave` : 'Full attendance today'}
          </p>
        </div>

        {/* Monthly Payroll Commitment */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Monthly Commitment ({selectedMonth})
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {formatINR(totalPayrollCommitment)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {monthPayrolls.length} payslips generated for month
          </p>
        </div>

        {/* Disbursed Amount */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Disbursed ({selectedMonth})
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">
              {formatINR(totalDisbursedThisMonth)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Settled via Direct Bank / Cash / UPI
          </p>
        </div>

        {/* Pending Payout */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Pending Disbursal
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">
              {formatINR(totalPendingThisMonth)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {monthPayrolls.filter((p) => p.paymentStatus !== 'Paid').length} staff records awaiting settlement
          </p>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4 rounded-xl">
        <div className="flex gap-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab('payroll')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'payroll'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Monthly Payroll
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {monthPayrolls.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'directory'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Staff Directory
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {staffList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('leaves')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'leaves'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Leave Management
            {leavesList.filter((l) => l.status === 'Pending').length > 0 && (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {leavesList.filter((l) => l.status === 'Pending').length} Pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'finance'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Financial Reconciliation
          </button>
        </div>

        {/* Global Search inside active tab */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff, code, slips..."
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-3 py-1.5 rounded-lg w-48 focus:w-64 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: MONTHLY PAYROLL PROCESSING
          ========================================================================= */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center flex-wrap gap-3">
              {/* Month Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Payroll Month:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-sm text-slate-200 px-3 py-1.5 rounded-lg font-semibold focus:outline-none focus:border-indigo-500"
                >
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Status:</span>
                <select
                  value={selectedPayrollStatus}
                  onChange={(e) => setSelectedPayrollStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Processing">Processing</option>
                  <option value="Pending">Pending</option>
                  <option value="Held">Held</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateMonthlyPayroll}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/30 rounded-lg transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Generate / Refresh {selectedMonth} Batch
              </button>

              {totalPendingThisMonth > 0 && (
                <button
                  onClick={handleBatchDisburse}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Disburse All Pending ({formatINR(totalPendingThisMonth)})
                </button>
              )}
            </div>
          </div>

          {/* Payroll Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5">Payslip / Staff</th>
                    <th className="px-4 py-3.5">Designation & Dept</th>
                    <th className="px-4 py-3.5">Base Basic</th>
                    <th className="px-4 py-3.5">Allowances</th>
                    <th className="px-4 py-3.5">Deductions (EPF/PT)</th>
                    <th className="px-4 py-3.5 font-bold text-white">Net Salary</th>
                    <th className="px-4 py-3.5">Payment Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredPayrolls.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <CreditCard className="w-8 h-8 text-slate-600" />
                          <p className="text-sm font-medium">No payroll records found for {selectedMonth}.</p>
                          <button
                            onClick={handleGenerateMonthlyPayroll}
                            className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium"
                          >
                            Click to Generate Payroll Batch for {selectedMonth}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPayrolls.map((pay) => {
                      const staffObj = staffList.find((s) => s.id === pay.staffId);
                      return (
                        <tr
                          key={pay.id}
                          className="hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="font-semibold text-white text-sm">{pay.staffName}</div>
                            <div className="text-[11px] text-indigo-400 font-mono">
                              {pay.payslipNumber} • {pay.employeeId}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="text-slate-200">{pay.designation}</div>
                            <div className="text-[11px] text-slate-500">{pay.department}</div>
                          </td>

                          <td className="px-4 py-3 text-slate-300 font-medium">
                            {formatINR(pay.baseSalary)}
                          </td>

                          <td className="px-4 py-3 text-emerald-400 font-medium">
                            +{formatINR(pay.totalEarnings - pay.baseSalary)}
                          </td>

                          <td className="px-4 py-3 text-rose-400 font-medium">
                            -{formatINR(pay.totalDeductions)}
                            <span className="block text-[10px] text-slate-500">
                              EPF: ₹{pay.deductions?.epf || 0}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="text-sm font-bold text-emerald-400">
                              {formatINR(pay.netSalary)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {pay.workingDays}d worked • {pay.unpaidLeaveDays} LWP
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                pay.paymentStatus === 'Paid'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : pay.paymentStatus === 'Processing'
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : pay.paymentStatus === 'Held'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {pay.paymentStatus === 'Paid' && <CheckCircle2 className="w-3 h-3" />}
                              {pay.paymentStatus}
                            </span>
                            {pay.paymentDate && (
                              <span className="block text-[10px] text-slate-500 mt-0.5">
                                {pay.paymentDate} via {pay.paymentMethod}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setViewingPayslip(pay);
                                  setIsPayslipOpen(true);
                                }}
                                title="View & Print Official Payslip"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setProcessingPayroll(pay);
                                  setIsProcessSalaryOpen(true);
                                }}
                                title="Disburse or Update Payout"
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                                  pay.paymentStatus === 'Paid'
                                    ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                                }`}
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                {pay.paymentStatus === 'Paid' ? 'Edit' : 'Disburse'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: STAFF DIRECTORY
          ========================================================================= */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center flex-wrap gap-3">
              {/* Department Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Department:</span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Departments</option>
                  <option value="Administration">Administration</option>
                  <option value="Teaching">Teaching</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science & Labs">Science & Labs</option>
                  <option value="Humanities">Humanities</option>
                  <option value="Languages">Languages</option>
                  <option value="Physical Education">Physical Education</option>
                  <option value="Library">Library</option>
                  <option value="Support Staff">Support Staff</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Resigned">Resigned</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors border border-slate-700"
              >
                Switch to {viewMode === 'table' ? 'Card Grid' : 'Table View'}
              </button>
            </div>
          </div>

          {/* Directory Content */}
          {viewMode === 'table' ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[11px]">
                    <tr>
                      <th className="px-4 py-3.5">Staff Member</th>
                      <th className="px-4 py-3.5">Designation & Department</th>
                      <th className="px-4 py-3.5">Contact Info</th>
                      <th className="px-4 py-3.5">Base Salary</th>
                      <th className="px-4 py-3.5">Joining Date</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredStaff.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-slate-500">
                          No staff members found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredStaff.map((st) => (
                        <tr
                          key={st.id}
                          className="hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="font-semibold text-white text-sm">{st.name}</div>
                            <div className="text-[11px] text-indigo-400 font-mono">
                              {st.employeeId} • {st.gender}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="text-slate-200">{st.designation}</div>
                            <div className="text-[11px] text-slate-500">{st.department}</div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="text-slate-300">{st.phone}</div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                              {st.email}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-semibold text-white">{formatINR(st.baseSalary)}</div>
                            <div className="text-[10px] text-slate-400">
                              Gross: ₹{(st.baseSalary + (st.allowances?.hra || 0) + (st.allowances?.da || 0) + (st.allowances?.medical || 0)).toLocaleString('en-IN')}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-slate-300">{st.joiningDate}</td>

                          <td className="px-4 py-3">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                st.status === 'Active'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : st.status === 'On Leave'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {st.status}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setViewingStaff(st);
                                  setIsDetailsDrawerOpen(true);
                                }}
                                title="View Full Profile & Payslips"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingStaff(st);
                                  setIsStaffModalOpen(true);
                                }}
                                title="Edit Staff Record"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteStaff(st.id, st.name)}
                                title="Delete Staff"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaff.map((st) => (
                <div
                  key={st.id}
                  className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg hover:border-slate-700 transition-colors space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
                        {st.name.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{st.name}</h3>
                        <p className="text-xs text-indigo-400 font-medium">{st.designation}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        st.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {st.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="flex justify-between">
                      <span>Department:</span>
                      <span className="text-slate-200 font-medium">{st.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Salary:</span>
                      <span className="text-emerald-400 font-bold">{formatINR(st.baseSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Employee ID:</span>
                      <span className="font-mono text-slate-300">{st.employeeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span className="text-slate-300">{st.phone}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setViewingStaff(st);
                        setIsDetailsDrawerOpen(true);
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      View Profile <ArrowUpRight className="w-3 h-3" />
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingStaff(st);
                          setIsStaffModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(st.id, st.name)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: LEAVE MANAGEMENT & ABSENCE WORKFLOW
          ========================================================================= */}
      {activeTab === 'leaves' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-white">Staff Leave Applications & Tracking</h2>
              <p className="text-xs text-slate-400">
                Review absence requests and automatically track impact on monthly payroll deductions.
              </p>
            </div>
            <button
              onClick={() => {
                setLeaveStaffId(undefined);
                setIsApplyLeaveOpen(true);
              }}
              className="px-3.5 py-1.5 text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              Apply Staff Leave
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leavesList.map((lv) => (
              <div
                key={lv.id}
                className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3 relative"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{lv.staffName}</h3>
                    <p className="text-xs text-slate-400">
                      {lv.employeeId} • {lv.designation} ({lv.department})
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      lv.status === 'Approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : lv.status === 'Pending'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {lv.status}
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Leave Type:</span>
                    <span className="text-white font-medium">{lv.leaveType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration:</span>
                    <span className="text-slate-200">
                      {lv.startDate} to {lv.endDate} ({lv.totalDays} {lv.totalDays === 1 ? 'day' : 'days'})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">LWP Deduction:</span>
                    <span className={lv.isLwp ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {lv.isLwp ? 'Yes (Deducted from salary)' : 'No (Paid Leave)'}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-800 text-slate-300 italic">
                    "{lv.reason}"
                  </div>
                </div>

                {lv.remarks && (
                  <p className="text-[11px] text-slate-400">
                    <strong className="text-slate-300">Remarks:</strong> {lv.remarks}
                  </p>
                )}

                {/* Review Actions */}
                {lv.status === 'Pending' && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleUpdateLeaveStatus(lv.id, 'Rejected')}
                      className="px-3 py-1 text-xs bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleUpdateLeaveStatus(lv.id, 'Approved')}
                      className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium shadow-sm"
                    >
                      Approve Leave
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: FINANCIAL RECONCILIATION (INTEGRATED WITH OVERALL SCHOOL ACCOUNTS)
          ========================================================================= */}
      {activeTab === 'finance' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white">
                  Institutional Financial Reconciliation
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time link between Student Tuition Revenue and Staff Salary Expenditure.
                </p>
              </div>

              {onNavigateToFees && (
                <button
                  onClick={onNavigateToFees}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-indigo-500/30 rounded-lg transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  View Fees & Student Accounts
                </button>
              )}
            </div>

            {/* Financial Balance Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 uppercase tracking-wider block">
                  Total Student Fees Revenue
                </span>
                <span className="text-2xl font-black text-emerald-400 mt-2 block">
                  {formatINR(totalStudentFeesCollected)}
                </span>
                <span className="text-[11px] text-slate-500">
                  Collected tuition, admission & lab fees
                </span>
              </div>

              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 uppercase tracking-wider block">
                  Staff Payroll Outflows (Disbursed)
                </span>
                <span className="text-2xl font-black text-rose-400 mt-2 block">
                  -{formatINR(allTimePayrollDisbursed)}
                </span>
                <span className="text-[11px] text-slate-500">
                  Direct salary payouts to faculty & staff
                </span>
              </div>

              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 uppercase tracking-wider block">
                  Net Operating Cash Reserves
                </span>
                <span
                  className={`text-2xl font-black mt-2 block ${
                    netInstitutionalReserves >= 0 ? 'text-indigo-400' : 'text-rose-500'
                  }`}
                >
                  {formatINR(netInstitutionalReserves)}
                </span>
                <span className="text-[11px] text-slate-500">
                  Net surplus available in school treasury
                </span>
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Monthly Staff Salary Expenditure By Department
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  'Teaching',
                  'Administration',
                  'Science & Labs',
                  'Mathematics',
                  'Humanities',
                  'Languages',
                  'Physical Education',
                  'Support Staff',
                ].map((dept) => {
                  const deptStaff = staffList.filter((s) => s.department === dept);
                  const deptPayroll = deptStaff.reduce((sum, s) => sum + s.baseSalary, 0);
                  if (deptStaff.length === 0) return null;
                  return (
                    <div
                      key={dept}
                      className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/80 text-xs"
                    >
                      <span className="text-slate-400 block truncate">{dept}</span>
                      <span className="text-sm font-bold text-white block mt-1">
                        {formatINR(deptPayroll)}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {deptStaff.length} {deptStaff.length === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Modal (Add / Edit) */}
      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => {
          setIsStaffModalOpen(false);
          setEditingStaff(null);
        }}
        onSave={handleSaveStaff}
        initialStaff={editingStaff}
      />

      {/* Staff Details Drawer */}
      <StaffDetailsDrawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => {
          setIsDetailsDrawerOpen(false);
          setViewingStaff(null);
        }}
        staff={viewingStaff}
        payrollList={payrollList}
        leavesList={leavesList}
        onEdit={(st) => {
          setIsDetailsDrawerOpen(false);
          setEditingStaff(st);
          setIsStaffModalOpen(true);
        }}
        onViewPayslip={(pay) => {
          setIsDetailsDrawerOpen(false);
          setViewingPayslip(pay);
          setIsPayslipOpen(true);
        }}
        onApplyLeave={(staffId) => {
          setIsDetailsDrawerOpen(false);
          setLeaveStaffId(staffId);
          setIsApplyLeaveOpen(true);
        }}
      />

      {/* Process Salary Payout Modal */}
      <ProcessSalaryModal
        isOpen={isProcessSalaryOpen}
        onClose={() => {
          setIsProcessSalaryOpen(false);
          setProcessingPayroll(null);
        }}
        payroll={processingPayroll}
        onProcess={handleProcessPayroll}
      />

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyLeaveOpen}
        onClose={() => {
          setIsApplyLeaveOpen(false);
          setLeaveStaffId(undefined);
        }}
        staffList={staffList}
        onApplyLeave={handleApplyLeave}
        preselectedStaffId={leaveStaffId}
      />

      {/* Printable Payslip Modal */}
      <PrintablePayslipModal
        isOpen={isPayslipOpen}
        onClose={() => {
          setIsPayslipOpen(false);
          setViewingPayslip(null);
        }}
        payroll={viewingPayslip}
        staff={staffList.find((s) => s.id === viewingPayslip?.staffId)}
      />
    </div>
  );
};
