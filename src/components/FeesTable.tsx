import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Receipt,
  Download,
  IndianRupee,
  Phone,
  Send,
  Printer,
  ShieldCheck,
  RefreshCw,
  Award,
  Wallet,
  Building,
  Filter,
  Check,
  Calendar,
  Layers,
  FileSpreadsheet,
  Smartphone,
  QrCode,
  ExternalLink,
  Sparkles,
  Copy,
  BarChart3,
  Banknote,
  Coins,
  TrendingUp,
} from 'lucide-react';
import { FeeRecord, FeeStatus, SchoolClass, FirestoreStudent, FeeTransaction, PayrollRecord } from '../types';
import { updateDocument } from '../lib/firebase';
import { syncAllStudentsFeeClearance, syncStudentFeeClearance } from '../lib/feeService';
import { PrintableFeeReceiptModal } from './PrintableFeeReceiptModal';
import { FeeClearanceCertificateModal } from './FeeClearanceCertificateModal';
import { FeeReminderModal } from './FeeReminderModal';
import { UpiPaymentVerificationModal } from './UpiPaymentVerificationModal';
import { DEFAULT_UPI_CONFIG } from '../lib/upiPaymentService';
import { ConsolidatedFinancialReportView } from './ConsolidatedFinancialReportView';
import { exportFeeLedgerData } from '../lib/exportUtils';

interface FeesTableProps {
  fees: FeeRecord[];
  classes: SchoolClass[];
  students: FirestoreStudent[];
  onOpenRecordPayment: (fee?: FeeRecord) => void;
  payrollRecords?: PayrollRecord[];
}

type FeeTab = 'ledger' | 'dues' | 'upi' | 'reports' | 'transactions' | 'slabs';

export const FeesTable: React.FC<FeesTableProps> = ({
  fees,
  classes,
  students,
  onOpenRecordPayment,
  payrollRecords,
}) => {
  const [activeTab, setActiveTab] = useState<FeeTab>('ledger');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');

  // Modals state
  const [activeReceiptFee, setActiveReceiptFee] = useState<FeeRecord | null>(null);
  const [activeReceiptTransaction, setActiveReceiptTransaction] = useState<FeeTransaction | null>(null);
  const [activeClearanceStudent, setActiveClearanceStudent] = useState<FirestoreStudent | null>(null);
  const [activeReminderStudent, setActiveReminderStudent] = useState<{ student: FirestoreStudent; fee?: FeeRecord } | null>(null);
  const [activeUpiFee, setActiveUpiFee] = useState<FeeRecord | null>(null);

  // Quick UPI verification on tab
  const [upiSelectedStudentId, setUpiSelectedStudentId] = useState<string>('');
  const [upiLookupUtr, setUpiLookupUtr] = useState('');
  const [copiedSchoolVpa, setCopiedSchoolVpa] = useState(false);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Derive unique months
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    fees.forEach((f) => set.add(f.feeMonth));
    return Array.from(set);
  }, [fees]);

  // Financial KPIs Calculations
  const stats = useMemo(() => {
    const totalBilled = fees.reduce((acc, f) => acc + (f.totalAmount || 0), 0);
    const totalCollected = fees.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
    const totalDue = fees.reduce(
      (acc, f) =>
        acc +
        Math.max(
          0,
          f.balanceAmount !== undefined ? f.balanceAmount : f.totalAmount - f.paidAmount
        ),
      0
    );

    const paidCount = fees.filter((f) => f.status === 'Paid').length;
    const partialCount = fees.filter((f) => f.status === 'Partial').length;
    const pendingCount = fees.filter((f) => f.status === 'Pending').length;
    const overdueCount = fees.filter((f) => f.status === 'Overdue').length;

    const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;
    const clearanceRate = fees.length > 0 ? Math.round((paidCount / fees.length) * 100) : 0;

    return {
      totalBilled,
      totalCollected,
      totalDue,
      paidCount,
      partialCount,
      pendingCount,
      overdueCount,
      collectionRate,
      clearanceRate,
    };
  }, [fees]);

  // Filtered Fee Records for Ledger
  const filteredFees = useMemo(() => {
    return fees.filter((f) => {
      const q = search.toLowerCase();
      const matchesSearch =
        f.studentName.toLowerCase().includes(q) ||
        f.rollNo.toString().includes(q) ||
        f.receiptNo.toLowerCase().includes(q) ||
        (f.className && f.className.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
      const matchesClass = classFilter === 'All' || f.classId === classFilter;
      const matchesMonth = monthFilter === 'All' || f.feeMonth === monthFilter;

      return matchesSearch && matchesStatus && matchesClass && matchesMonth;
    });
  }, [fees, search, statusFilter, classFilter, monthFilter]);

  // Defaulters List (Dues Tab)
  const defaulterFees = useMemo(() => {
    return fees
      .filter((f) => f.status === 'Overdue' || f.status === 'Pending' || f.status === 'Partial')
      .map((f) => {
        const student = students.find((s) => s.id === f.studentId);
        const balance = Math.max(
          0,
          f.balanceAmount !== undefined ? f.balanceAmount : f.totalAmount - f.paidAmount
        );
        return {
          fee: f,
          student,
          balance,
        };
      })
      .filter((item) => item.balance > 0);
  }, [fees, students]);

  // Aggregate All Transactions for Cashbook Tab
  const allTransactions = useMemo(() => {
    const list: Array<{
      transaction: FeeTransaction;
      feeRecord: FeeRecord;
      studentName: string;
      className: string;
      rollNo: number;
    }> = [];

    fees.forEach((f) => {
      if (f.paymentHistory && f.paymentHistory.length > 0) {
        f.paymentHistory.forEach((t) => {
          list.push({
            transaction: t,
            feeRecord: f,
            studentName: f.studentName,
            className: f.className,
            rollNo: f.rollNo,
          });
        });
      } else if (f.paidAmount > 0) {
        list.push({
          transaction: {
            transactionId: `TXN-${f.id.slice(0, 8)}`,
            receiptNo: f.receiptNo !== '—' ? f.receiptNo : 'RCP-2026-LEGACY',
            amount: f.paidAmount,
            paymentDate: f.updatedAt ? f.updatedAt.split('T')[0] : '2026-09-18',
            paymentMethod: f.paymentMethod,
            receivedBy: 'Cashier / Bursar',
            notes: 'Tuition collection',
          },
          feeRecord: f,
          studentName: f.studentName,
          className: f.className,
          rollNo: f.rollNo,
        });
      }
    });

    // Sort newest first
    return list.sort((a, b) => b.transaction.paymentDate.localeCompare(a.transaction.paymentDate));
  }, [fees]);

  // Aggregate UPI / GPay Transactions
  const upiTransactions = useMemo(() => {
    return allTransactions.filter((item) => {
      const method = (item.transaction.paymentMethod || '').toLowerCase();
      const ref = (item.transaction.referenceNumber || '').toLowerCase();
      return (
        method.includes('upi') ||
        method.includes('gpay') ||
        method.includes('google pay') ||
        method.includes('phonepe') ||
        method.includes('paytm') ||
        ref.includes('utr')
      );
    });
  }, [allTransactions]);

  const upiTotalCollected = useMemo(() => {
    return upiTransactions.reduce((acc, t) => acc + (t.transaction.amount || 0), 0);
  }, [upiTransactions]);

  // Quick One-Click Full Settlement
  const handleQuickMarkPaid = async (fee: FeeRecord) => {
    const receiptNo = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();
    const balanceToPay = Math.max(
      0,
      fee.balanceAmount !== undefined ? fee.balanceAmount : fee.totalAmount - fee.paidAmount
    );

    const newTxn: FeeTransaction = {
      transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      receiptNo,
      amount: balanceToPay,
      paymentDate: nowIso.split('T')[0],
      paymentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: 'UPI (GPay)',
      paymentChannel: 'UPI',
      referenceNumber: `UTR-${Math.floor(10000000 + Math.random() * 90000000)}`,
      receivedBy: 'Accounts Counter',
      notes: 'Quick clearance marked paid via UPI GPay',
    };

    const history = fee.paymentHistory ? [...fee.paymentHistory, newTxn] : [newTxn];

    const updatedRecord: Partial<FeeRecord> = {
      paidAmount: fee.totalAmount,
      balanceAmount: 0,
      status: 'Paid',
      paymentMethod: 'UPI (GPay)',
      receiptNo,
      paymentHistory: history,
      isFeeCleared: true,
      clearedAt: nowIso,
      updatedAt: nowIso,
    };

    // Update in both 'fee_records' and 'fees' Firestore collections
    await updateDocument('fee_records', fee.id, updatedRecord);
    await updateDocument('fees', fee.id, updatedRecord);

    // Sync to student profile immediately
    const targetStudent = students.find((s) => s.id === fee.studentId);
    if (targetStudent) {
      await syncStudentFeeClearance(targetStudent.id, fees, students);
    }
  };

  // Sync All Student Profiles Action
  const handleSyncAllProfiles = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const count = await syncAllStudentsFeeClearance(fees, students);
      setSyncMessage(`Successfully synchronized fee clearance across ${count} student profiles!`);
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (e) {
      console.error('Error syncing student fee clearance:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Roll No', 'Student Name', 'Class', 'Fee Month', 'Total Obligation', 'Paid Amount', 'Balance Due', 'Status', 'Payment Method', 'Receipt No', 'Due Date'];
    const rows = filteredFees.map((f) => [
      f.rollNo,
      `"${f.studentName}"`,
      `"${f.className}"`,
      `"${f.feeMonth}"`,
      f.totalAmount,
      f.paidAmount,
      f.balanceAmount !== undefined ? f.balanceAmount : f.totalAmount - f.paidAmount,
      f.status,
      `"${f.paymentMethod}"`,
      `"${f.receiptNo}"`,
      f.dueDate,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MSS_Fee_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Financial Accounting Overview & KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Total Billed */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Total Billed / Revenue</span>
            <Building className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            ₹{stats.totalBilled.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-gray-400 flex items-center justify-between">
            <span>Enrolled Students:</span>
            <span className="text-gray-200 font-semibold">{fees.length} billing accounts</span>
          </div>
        </div>

        {/* KPI 2: Total Collected */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Fees Collected</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            ₹{stats.totalCollected.toLocaleString()}
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, stats.collectionRate)}%` }}
              ></div>
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-gray-400">
              <span>Collection Rate: {stats.collectionRate}%</span>
              <span className="text-emerald-300 font-medium">{stats.paidCount} fully paid</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Outstanding Dues */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Outstanding Dues</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-400">
            ₹{stats.totalDue.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-gray-400 flex items-center justify-between">
            <span>Pending & Overdue:</span>
            <span className="text-rose-300 font-semibold">{defaulterFees.length} students</span>
          </div>
        </div>

        {/* KPI 4: Fee Clearance Rate */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Fee Clearance Rate</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-300">
            {stats.clearanceRate}%
          </div>
          <div className="mt-1 text-xs text-gray-400 flex items-center justify-between">
            <span>MBSE Exam Ready:</span>
            <span className="text-emerald-400 font-semibold">{stats.paidCount} students cleared</span>
          </div>
        </div>
      </div>

      {/* Sync Message Alert if active */}
      {syncMessage && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{syncMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncMessage(null)}
            className="text-emerald-400 hover:text-emerald-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Ledger Card */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-md">
        
        {/* Module Header Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-700/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-850">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Fee Management & Financial Accounting
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono border border-amber-500/30">
                col: fee_records
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono border border-emerald-500/30">
                auto-clearance synced
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Comprehensive student fee collection, dues tracking, printable receipts, and automated student profile fee clearance
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSyncAllProfiles}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors cursor-pointer border border-gray-600"
              title="Ensure all student profiles reflect latest fee clearance status in real-time"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
              {isSyncing ? 'Syncing Profiles...' : 'Sync Student Clearances'}
            </button>

            <button
              type="button"
              onClick={() => exportFeeLedgerData(filteredFees, students, 'excel')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-700/80 hover:bg-emerald-600 text-white transition-colors cursor-pointer border border-emerald-500/40"
              title="Export ledger as formatted Excel spreadsheet (.xls)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
              Export Excel
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors cursor-pointer border border-gray-600"
              title="Export ledger as CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              Export CSV
            </button>

            <button
              type="button"
              onClick={() => {
                const firstPending = fees.find((f) => f.status !== 'Paid') || fees[0];
                if (firstPending) {
                  setActiveUpiFee(firstPending);
                } else {
                  setActiveTab('upi');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition-colors cursor-pointer"
              title="Open Dynamic UPI / Google Pay QR and UTR Verification Gateway"
            >
              <Smartphone className="w-3.5 h-3.5" />
              UPI / GPay Gateway
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-700/80 hover:bg-emerald-600 text-white transition-colors cursor-pointer border border-emerald-500/40 shadow-sm"
              title="Consolidated Cash & UPI Financial Reporting View (Daily & Monthly Totals)"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-300" />
              Cash & UPI Reports
            </button>

            <button
              type="button"
              onClick={() => onOpenRecordPayment()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Record Fee Payment
            </button>
          </div>
        </div>

        {/* Tab Switcher Navigation */}
        <div className="px-4 border-b border-gray-700/80 bg-gray-900/40 flex overflow-x-auto space-x-6 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`py-3 font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'ledger'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Fee Ledger & Records ({fees.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dues')}
            className={`py-3 font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'dues'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Pending Dues & Defaulters ({defaulterFees.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upi')}
            className={`py-3 font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'upi'
                ? 'border-purple-500 text-purple-300 font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            UPI & GPay Gateway ({upiTransactions.length})
            <span className="px-1.5 py-0.2 text-[10px] bg-purple-500/20 text-purple-300 rounded-full font-mono border border-purple-500/30">
              Live
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`py-3 font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'border-emerald-500 text-emerald-300 font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            Consolidated Reports (Cash & UPI)
            <span className="px-1.5 py-0.2 text-[10px] bg-emerald-500/20 text-emerald-300 rounded-full font-mono border border-emerald-500/30">
              Daily / Monthly
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`py-3 font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'transactions'
                ? 'border-amber-500 text-amber-300 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 text-amber-400" />
            Cashbook & Transactions Audit ({allTransactions.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('slabs')}
            className={`py-3 font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'slabs'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            MBSE Fee Structure Slabs
          </button>
        </div>

        {/* ===================== TAB 1: LEDGER ===================== */}
        {activeTab === 'ledger' && (
          <div>
            {/* Filter Bar */}
            <div className="p-3.5 bg-gray-900/60 border-b border-gray-700/60 grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by student, roll #, or receipt #..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-md pl-8 pr-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="All">All Status (Paid, Partial, Pending, Overdue)</option>
                  <option value="Paid">Paid / Cleared</option>
                  <option value="Partial">Partial Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="All">All Classes (Zawng zawng)</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="All">All Billing Months</option>
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-200">
                <thead className="bg-gray-900/70 text-gray-400 uppercase tracking-wider text-[11px] border-b border-gray-700/60">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Roll No</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Student Name</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Class</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Month</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Fee Breakdown</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Amount & Due</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Payment Method & Receipt</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {filteredFees.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                        No fee records found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredFees.map((fee) => {
                      const balance = Math.max(
                        0,
                        fee.balanceAmount !== undefined
                          ? fee.balanceAmount
                          : fee.totalAmount - fee.paidAmount
                      );
                      const matchingStudent = students.find((s) => s.id === fee.studentId);

                      return (
                        <tr key={fee.id} className="hover:bg-gray-700/30 transition-colors">
                          <td className="px-4 py-3.5 font-mono font-bold text-indigo-400">
                            #{fee.rollNo}
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-white">
                            <div>{fee.studentName}</div>
                            {matchingStudent && (
                              <div className="text-[10px] text-gray-400 font-normal flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5" />
                                {matchingStudent.parentPhone}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-gray-300">
                            <span className="px-2 py-0.5 rounded bg-gray-700/70 text-[11px]">
                              {fee.className}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-gray-400 font-medium">
                            {fee.feeMonth}
                          </td>
                          <td className="px-4 py-3.5 text-[11px] text-gray-400">
                            {fee.feeStructure ? (
                              <div className="space-y-0.5">
                                <div>Tuition: ₹{fee.feeStructure.tuitionFee}</div>
                                <div>Exam: ₹{fee.feeStructure.examFee} | Lab: ₹{fee.feeStructure.computerLabFee}</div>
                              </div>
                            ) : (
                              <div>Standard MBSE slab</div>
                            )}
                          </td>
                          <td className="px-4 py-3.5 font-mono">
                            <div className="text-white font-bold">
                              ₹{fee.paidAmount.toLocaleString()} / ₹{fee.totalAmount.toLocaleString()}
                            </div>
                            {balance > 0 ? (
                              <div className="text-[11px] font-semibold text-rose-400">
                                Due: ₹{balance.toLocaleString()}
                              </div>
                            ) : (
                              <div className="text-[10px] text-emerald-400 font-medium">
                                Cleared (₹0)
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                fee.status === 'Paid'
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                  : fee.status === 'Overdue'
                                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                  : fee.status === 'Partial'
                                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                  : 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30'
                              }`}
                            >
                              {fee.status === 'Paid' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                              {fee.status === 'Overdue' && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                              {fee.status === 'Partial' && <Clock className="w-3 h-3 text-amber-400" />}
                              {fee.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-gray-300 text-[11px]">
                            <div className="font-medium text-gray-200">{fee.paymentMethod}</div>
                            <div className="font-mono text-[10px] text-gray-400">
                              {fee.receiptNo !== '—' ? fee.receiptNo : 'Pending collection'}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick Collect if unpaid */}
                              {fee.status !== 'Paid' ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setActiveUpiFee(fee)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-purple-600/90 hover:bg-purple-500 text-white shadow-xs transition-colors cursor-pointer"
                                    title="Generate Dynamic UPI QR Code & Verify UTR"
                                  >
                                    <Smartphone className="w-3 h-3 text-purple-200" />
                                    UPI / GPay
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleQuickMarkPaid(fee)}
                                    className="px-2 py-1 rounded text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                                    title="Record quick full payment"
                                  >
                                    Quick Paid
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveReceiptFee(fee);
                                    setActiveReceiptTransaction(null);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-gray-700 hover:bg-gray-600 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
                                  title="View and print official fee receipt voucher"
                                >
                                  <Receipt className="w-3 h-3" />
                                  Receipt
                                </button>
                              )}

                              {/* WhatsApp/SMS reminder if unpaid */}
                              {balance > 0 && matchingStudent && (
                                <button
                                  type="button"
                                  onClick={() => setActiveReminderStudent({ student: matchingStudent, fee })}
                                  className="p-1 rounded text-amber-400 hover:bg-gray-700 transition-colors cursor-pointer"
                                  title="Generate Parent WhatsApp/SMS Fee Reminder Notice"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* No-Dues Certificate if fully cleared */}
                              {fee.status === 'Paid' && matchingStudent && (
                                <button
                                  type="button"
                                  onClick={() => setActiveClearanceStudent(matchingStudent)}
                                  className="p-1 rounded text-indigo-300 hover:bg-gray-700 transition-colors cursor-pointer"
                                  title="Generate No-Dues Fee Clearance Certificate"
                                >
                                  <Award className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Edit or record payment modal */}
                              <button
                                type="button"
                                onClick={() => onOpenRecordPayment(fee)}
                                className="px-2 py-1 rounded text-[11px] text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer"
                              >
                                Edit / Pay
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
        )}

        {/* ===================== TAB 2: PENDING DUES & DEFAULTERS ===================== */}
        {activeTab === 'dues' && (
          <div className="p-4 space-y-4">
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Outstanding Fee Dues & Defaulters Radar
                  </h4>
                  <p className="text-[11px] text-rose-300">
                    Showing students with unpaid or partial tuition fee obligations. Total balance due: <strong>₹{stats.totalDue.toLocaleString()}</strong>
                  </p>
                </div>
              </div>
              <div className="text-right font-mono font-bold text-rose-400 text-sm">
                {defaulterFees.length} Pending Accounts
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-700 rounded-lg">
              <table className="w-full text-left text-xs text-gray-200">
                <thead className="bg-gray-900/80 text-gray-400 uppercase tracking-wider text-[11px] border-b border-gray-700/60">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Roll No</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Student Name</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Class</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Month</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Due Date</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Outstanding Balance</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Parent Contact</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {defaulterFees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-emerald-400 font-semibold">
                        ✓ All students have completely cleared their fees! No outstanding dues.
                      </td>
                    </tr>
                  ) : (
                    defaulterFees.map(({ fee, student, balance }) => (
                      <tr key={fee.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-rose-400">
                          #{fee.rollNo}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-white">
                          {fee.studentName}
                        </td>
                        <td className="px-4 py-3.5 text-gray-300">
                          {fee.className}
                        </td>
                        <td className="px-4 py-3.5 text-gray-400">
                          {fee.feeMonth}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-gray-300">
                          {fee.dueDate}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-rose-400 font-bold text-sm">
                          ₹{balance.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-gray-300 text-[11px]">
                          {student?.parentPhone || '—'}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {student && (
                              <button
                                type="button"
                                onClick={() => setActiveReminderStudent({ student, fee })}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600/30 transition-colors cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                Send Notice
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setActiveUpiFee(fee)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-xs transition-colors cursor-pointer"
                              title="Dynamic UPI QR & Pay for Defaulter"
                            >
                              <Smartphone className="w-3 h-3 text-purple-200" />
                              UPI / GPay
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenRecordPayment(fee)}
                              className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                            >
                              Collect Fee
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
        )}

        {/* ===================== TAB 3: FINANCIAL CASHBOOK & AUDIT ===================== */}
        {activeTab === 'transactions' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Financial Cashbook & Payment Transactions</h4>
                <p className="text-xs text-gray-400">Audit trail of all receipts generated and payment methods recorded</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                Total Logs: {allTransactions.length} receipts
              </span>
            </div>

            <div className="overflow-x-auto border border-gray-700 rounded-lg">
              <table className="w-full text-left text-xs text-gray-200">
                <thead className="bg-gray-900/80 text-gray-400 uppercase tracking-wider text-[11px] border-b border-gray-700/60">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Receipt No</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Date & Time</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Student Name</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Class</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Amount Paid</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Payment Mode</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Received By</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-right">Voucher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {allTransactions.map(({ transaction, feeRecord, studentName, className, rollNo }) => (
                    <tr key={transaction.transactionId} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-400">
                        {transaction.receiptNo}
                      </td>
                      <td className="px-4 py-3.5 text-gray-300 font-mono text-[11px]">
                        {transaction.paymentDate} {transaction.paymentTime || ''}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-white">
                        {studentName} <span className="font-mono text-gray-400 text-[10px]">#{rollNo}</span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-300">
                        {className}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-emerald-400 font-bold text-sm">
                        ₹{transaction.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-gray-300 text-[11px]">
                        <div>{transaction.paymentMethod}</div>
                        {transaction.referenceNumber && (
                          <div className="font-mono text-[10px] text-gray-500">{transaction.referenceNumber}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-gray-400 text-[11px]">
                        {transaction.receivedBy || 'Bursar'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReceiptFee(feeRecord);
                            setActiveReceiptTransaction(transaction);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-gray-700 hover:bg-gray-600 text-indigo-300 transition-colors cursor-pointer"
                        >
                          <Receipt className="w-3 h-3" />
                          View Voucher
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== TAB: UPI & GPAY GATEWAY ===================== */}
        {activeTab === 'upi' && (
          <div className="p-5 space-y-6">
            {/* Top Institutional Gateway Banner */}
            <div className="bg-gradient-to-r from-purple-950/40 via-gray-900 to-indigo-950/40 border border-purple-500/30 rounded-2xl p-5 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                        Institutional UPI & Google Pay Gateway
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/40">
                          NPCI Standard • INR
                        </span>
                      </h3>
                      <p className="text-xs text-gray-400">
                        Dynamic QR generation for student dues in <code className="text-indigo-300 font-mono">fee_records</code> & instant UTR verification
                      </p>
                    </div>
                  </div>
                </div>

                {/* Live Stats Pill Cards */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-gray-800/80 border border-gray-700/80 rounded-xl px-3.5 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-gray-400">UPI Collected</div>
                    <div className="text-base font-bold font-mono text-purple-300">
                      ₹{upiTotalCollected.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-gray-800/80 border border-gray-700/80 rounded-xl px-3.5 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-gray-400">Settled Receipts</div>
                    <div className="text-base font-bold font-mono text-emerald-400">
                      {upiTransactions.length}
                    </div>
                  </div>

                  <div className="bg-gray-800/80 border border-gray-700/80 rounded-xl px-3.5 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-gray-400">Pending Dues</div>
                    <div className="text-base font-bold font-mono text-rose-400">
                      {defaulterFees.length} accounts
                    </div>
                  </div>
                </div>
              </div>

              {/* VPA Info Bar */}
              <div className="mt-4 pt-3.5 border-t border-gray-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500">School VPA / UPI ID:</span>
                    <code className="font-mono font-bold text-white bg-purple-900/40 px-2 py-0.5 rounded border border-purple-500/40">
                      {DEFAULT_UPI_CONFIG.vpa}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(DEFAULT_UPI_CONFIG.vpa);
                        setCopiedSchoolVpa(true);
                        setTimeout(() => setCopiedSchoolVpa(false), 2000);
                      }}
                      className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 cursor-pointer"
                      title="Copy VPA"
                    >
                      {copiedSchoolVpa ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div>
                    <span className="text-gray-500">Payee Name:</span>{' '}
                    <span className="font-semibold text-white">{DEFAULT_UPI_CONFIG.payeeName}</span>
                  </div>

                  <div>
                    <span className="text-gray-500">MCC:</span>{' '}
                    <span className="font-mono text-gray-300">{DEFAULT_UPI_CONFIG.merchantCode} (Schools)</span>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  GPay, PhonePe, Paytm, BHIM & Netbanking supported
                </div>
              </div>
            </div>

            {/* Interactive Grid: Quick QR Generator & Quick UTR Lookup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: Generate QR for Any Student */}
              <div className="bg-gray-850/80 border border-gray-700/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Generate Dynamic Student UPI QR</h4>
                    <p className="text-[11px] text-gray-400">
                      Pick any student fee record to generate an instant dynamic payment QR
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">
                      Select Student Account / Due Cycle
                    </label>
                    <select
                      value={upiSelectedStudentId}
                      onChange={(e) => setUpiSelectedStudentId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs focus:outline-none focus:border-purple-500"
                    >
                      <option value="">-- Choose student fee record --</option>
                      {fees.map((f) => {
                        const bal = Math.max(0, f.balanceAmount !== undefined ? f.balanceAmount : f.totalAmount - f.paidAmount);
                        return (
                          <option key={f.id} value={f.id}>
                            Roll #{f.rollNo} • {f.studentName} ({f.className}) — {f.feeMonth} [Due: ₹{bal.toLocaleString()} - {f.status}]
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {upiSelectedStudentId ? (
                    (() => {
                      const selectedFee = fees.find((f) => f.id === upiSelectedStudentId);
                      if (!selectedFee) return null;
                      const bal = Math.max(0, selectedFee.balanceAmount !== undefined ? selectedFee.balanceAmount : selectedFee.totalAmount - selectedFee.paidAmount);
                      return (
                        <div className="p-3 bg-gray-900/90 rounded-xl border border-gray-700 space-y-3 text-xs">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-bold text-white">{selectedFee.studentName}</div>
                              <div className="text-[11px] text-gray-400">
                                Roll #{selectedFee.rollNo} • {selectedFee.className} • {selectedFee.feeMonth}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] text-gray-400">Due Balance</div>
                              <div className="font-mono font-bold text-rose-400 text-sm">
                                ₹{bal.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setActiveUpiFee(selectedFee)}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
                          >
                            <QrCode className="w-4 h-4" />
                            Open Dynamic QR & UPI Pay Links
                          </button>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-gray-700 text-center text-xs text-gray-500">
                      Select a student fee record above to preview dynamic QR code and launch payment links
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Quick UTR Verifier & Status Shift */}
              <div className="bg-gray-850/80 border border-gray-700/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Quick UTR Verification Tool</h4>
                    <p className="text-[11px] text-gray-400">
                      Instantly verify any 12-digit UTR from parent bank receipts and clear status
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">
                      Parent's 12-digit UPI UTR / Transaction ID
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 425612348912"
                        value={upiLookupUtr}
                        onChange={(e) => setUpiLookupUtr(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const demo = Math.floor(100000000000 + Math.random() * 900000000000).toString();
                          setUpiLookupUtr(demo);
                        }}
                        className="px-2.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-[11px] text-purple-300 border border-gray-700 cursor-pointer whitespace-nowrap"
                        title="Auto-fill sample 12-digit UTR"
                      >
                        Sample UTR
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Clicking verify will open the verification terminal pre-configured with this UTR code to immediately shift the selected student's fee record from <span className="text-rose-400 font-semibold">'Pending'</span> to <span className="text-emerald-400 font-semibold">'Paid'</span> and issue an official receipt voucher.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      const target = (upiSelectedStudentId && fees.find((f) => f.id === upiSelectedStudentId)) || defaulterFees[0]?.fee || fees[0];
                      if (target) {
                        setActiveUpiFee(target);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Open Verification Terminal
                  </button>
                </div>
              </div>
            </div>

            {/* Table of Settled UPI Transactions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Settled UPI & Google Pay Transactions Audit</h4>
                <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30">
                  {upiTransactions.length} Verified Payments
                </span>
              </div>

              <div className="overflow-x-auto border border-gray-700 rounded-xl">
                <table className="w-full text-left text-xs text-gray-200">
                  <thead className="bg-gray-900/90 text-gray-400 uppercase tracking-wider text-[11px] border-b border-gray-700/60">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">Receipt No</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Date & Time</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Student Name</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Class</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Amount Paid</th>
                      <th scope="col" className="px-4 py-3 font-semibold">UPI Mode / App</th>
                      <th scope="col" className="px-4 py-3 font-semibold">UTR Reference</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-right">Receipt Voucher</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {upiTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                          A la awm lo / No UPI transactions recorded yet. Use the "UPI / GPay" action button in the ledger to record instant UPI settlements!
                        </td>
                      </tr>
                    ) : (
                      upiTransactions.map(({ transaction, feeRecord, studentName, className, rollNo }) => (
                        <tr key={transaction.transactionId} className="hover:bg-gray-700/30 transition-colors">
                          <td className="px-4 py-3.5 font-mono font-bold text-emerald-400">
                            {transaction.receiptNo}
                          </td>
                          <td className="px-4 py-3.5 text-gray-300 font-mono text-[11px]">
                            {transaction.paymentDate} {transaction.paymentTime || ''}
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-white">
                            {studentName} <span className="font-mono text-gray-400 text-[10px]">#{rollNo}</span>
                          </td>
                          <td className="px-4 py-3.5 text-gray-300">
                            {className}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-emerald-400 font-bold text-sm">
                            ₹{transaction.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-purple-300 text-[11px] font-medium">
                            {transaction.paymentMethod}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-gray-300 text-[11px]">
                            <span className="bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                              {transaction.referenceNumber || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveReceiptFee(feeRecord);
                                setActiveReceiptTransaction(transaction);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-gray-700 hover:bg-gray-600 text-purple-300 border border-purple-500/30 transition-colors cursor-pointer"
                            >
                              <Receipt className="w-3 h-3" />
                              View Voucher
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 4: CONSOLIDATED FINANCIAL REPORTS ===================== */}
        {activeTab === 'reports' && (
          <ConsolidatedFinancialReportView
            fees={fees}
            allTransactions={allTransactions}
            payrollRecords={payrollRecords}
            onOpenReceipt={(fee, txn) => {
              setActiveReceiptFee(fee);
              setActiveReceiptTransaction(txn);
            }}
            onOpenRecordPayment={onOpenRecordPayment}
          />
        )}

        {/* ===================== TAB 5: CASHBOOK & TRANSACTIONS AUDIT ===================== */}
        {activeTab === 'transactions' && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  Institutional Cashbook & Transaction Audit Log
                </h4>
                <p className="text-xs text-gray-400">
                  Real-time audit log of all fee collections across Cash Counter Desk and UPI/GPay Gateways
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('reports')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/80 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  View Daily & Monthly Reports
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-700 rounded-xl bg-gray-900/60">
              <table className="w-full text-left text-xs text-gray-200">
                <thead className="bg-gray-900/90 text-gray-400 uppercase tracking-wider text-[11px] border-b border-gray-700/60">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Receipt No</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Date & Time</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Student Name</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Class</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-right">Amount Paid</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Channel & Method</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Cashier / Officer</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Ref / UTR / Cash Handling</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-right">Voucher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {allTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                        No transactions recorded yet in the ledger.
                      </td>
                    </tr>
                  ) : (
                    allTransactions.map(({ transaction, feeRecord, studentName, className, rollNo }) => {
                      const isCash =
                        transaction.paymentChannel === 'Cash' ||
                        (transaction.paymentMethod || '').toLowerCase().includes('cash');

                      return (
                        <tr key={transaction.transactionId} className="hover:bg-gray-700/30 transition-colors">
                          <td className="px-4 py-3.5 font-mono font-bold text-emerald-400">
                            {transaction.receiptNo}
                          </td>
                          <td className="px-4 py-3.5 text-gray-300 font-mono text-[11px]">
                            {transaction.paymentDate} {transaction.paymentTime || ''}
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-white">
                            {studentName} <span className="font-mono text-gray-400 text-[10px]">#{rollNo}</span>
                          </td>
                          <td className="px-4 py-3.5 text-gray-300">
                            {className}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-emerald-400 font-bold text-sm text-right">
                            ₹{transaction.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5">
                            {isCash ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <Banknote className="w-3 h-3" /> Cash Desk
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                <Smartphone className="w-3 h-3" /> UPI / Digital
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-gray-300 text-[11px]">
                            {transaction.cashierName || transaction.receivedBy || 'Bursar'}
                          </td>
                          <td className="px-4 py-3.5 text-gray-300 text-[11px] font-mono">
                            {isCash ? (
                              transaction.cashTendered ? (
                                <span className="text-[10px] text-gray-400">
                                  Tendered: ₹{transaction.cashTendered} | Chg: ₹{transaction.changeGiven || 0}
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400">Cash Counter Receipt</span>
                              )
                            ) : (
                              <span className="bg-gray-800 px-2 py-0.5 rounded border border-gray-700 text-[10px]">
                                {transaction.referenceNumber || 'N/A'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveReceiptFee(feeRecord);
                                setActiveReceiptTransaction(transaction);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-gray-700 hover:bg-gray-600 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                            >
                              <Receipt className="w-3 h-3" />
                              View Voucher
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== TAB 6: MBSE FEE STRUCTURE SLABS ===================== */}
        {activeTab === 'slabs' && (
          <div className="p-5 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-white">Approved MBSE & School Fee Slabs (Session 2026-2027)</h4>
              <p className="text-xs text-gray-400">Institutional fee matrix approved by the School Managing Committee (SMC)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Class 10 */}
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                  <span className="text-sm font-bold text-white">Class 10 (Matriculation)</span>
                  <span className="font-mono text-emerald-400 font-bold text-base">₹2,200/mo</span>
                </div>
                <div className="space-y-1.5 text-gray-300">
                  <div className="flex justify-between"><span>Tuition Fee:</span><span className="font-mono">₹1,400</span></div>
                  <div className="flex justify-between"><span>Board Examination:</span><span className="font-mono">₹300</span></div>
                  <div className="flex justify-between"><span>Computer & Science Lab:</span><span className="font-mono">₹250</span></div>
                  <div className="flex justify-between"><span>School Development:</span><span className="font-mono">₹150</span></div>
                  <div className="flex justify-between"><span>Library & Sports:</span><span className="font-mono">₹100</span></div>
                </div>
              </div>

              {/* Class 9 */}
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                  <span className="text-sm font-bold text-white">Class 9 (High School)</span>
                  <span className="font-mono text-emerald-400 font-bold text-base">₹2,000/mo</span>
                </div>
                <div className="space-y-1.5 text-gray-300">
                  <div className="flex justify-between"><span>Tuition Fee:</span><span className="font-mono">₹1,300</span></div>
                  <div className="flex justify-between"><span>Term Examination:</span><span className="font-mono">₹250</span></div>
                  <div className="flex justify-between"><span>Computer Lab:</span><span className="font-mono">₹200</span></div>
                  <div className="flex justify-between"><span>School Development:</span><span className="font-mono">₹150</span></div>
                  <div className="flex justify-between"><span>Library & Sports:</span><span className="font-mono">₹100</span></div>
                </div>
              </div>

              {/* Class 8 */}
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                  <span className="text-sm font-bold text-white">Class 8 (Middle School)</span>
                  <span className="font-mono text-emerald-400 font-bold text-base">₹1,800/mo</span>
                </div>
                <div className="space-y-1.5 text-gray-300">
                  <div className="flex justify-between"><span>Tuition Fee:</span><span className="font-mono">₹1,150</span></div>
                  <div className="flex justify-between"><span>Term Examination:</span><span className="font-mono">₹200</span></div>
                  <div className="flex justify-between"><span>Computer Lab:</span><span className="font-mono">₹200</span></div>
                  <div className="flex justify-between"><span>School Development:</span><span className="font-mono">₹150</span></div>
                  <div className="flex justify-between"><span>Library & Sports:</span><span className="font-mono">₹100</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modal: Official Printable Fee Receipt Voucher */}
      {activeReceiptFee && (
        <PrintableFeeReceiptModal
          isOpen={Boolean(activeReceiptFee)}
          onClose={() => {
            setActiveReceiptFee(null);
            setActiveReceiptTransaction(null);
          }}
          feeRecord={activeReceiptFee}
          transaction={activeReceiptTransaction}
        />
      )}

      {/* Modal: Student Fee Clearance Certificate */}
      {activeClearanceStudent && (
        <FeeClearanceCertificateModal
          isOpen={Boolean(activeClearanceStudent)}
          onClose={() => setActiveClearanceStudent(null)}
          student={activeClearanceStudent}
          studentFeeRecords={fees.filter((f) => f.studentId === activeClearanceStudent.id)}
        />
      )}

      {/* Modal: UPI / Google Pay Payment & Verification Gateway */}
      {activeUpiFee && (
        <UpiPaymentVerificationModal
          isOpen={Boolean(activeUpiFee)}
          onClose={() => setActiveUpiFee(null)}
          feeRecord={activeUpiFee}
          student={students.find((s) => s.id === activeUpiFee.studentId)}
          allFeeRecords={fees}
          allStudents={students}
          onOpenReceipt={(fee, transaction) => {
            setActiveReceiptFee(fee);
            setActiveReceiptTransaction(transaction);
            setActiveUpiFee(null);
          }}
        />
      )}

      {/* Modal: Parent Fee Reminder Alert */}
      {activeReminderStudent && (
        <FeeReminderModal
          isOpen={Boolean(activeReminderStudent)}
          onClose={() => setActiveReminderStudent(null)}
          student={activeReminderStudent.student}
          feeRecord={activeReminderStudent.fee}
        />
      )}

    </div>
  );
};
