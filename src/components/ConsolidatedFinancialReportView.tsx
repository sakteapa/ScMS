import React, { useState, useMemo } from 'react';
import {
  Banknote,
  Smartphone,
  CreditCard,
  Calendar,
  Filter,
  Printer,
  Download,
  Receipt,
  UserCheck,
  TrendingUp,
  BarChart3,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowUpRight,
  ShieldCheck,
  Coins,
  Building,
  Briefcase,
  Layers,
} from 'lucide-react';
import { FeeRecord, FeeTransaction, FirestoreStudent, PayrollRecord } from '../types';
import { PrintableFinancialStatementModal } from './PrintableFinancialStatementModal';

interface ConsolidatedFinancialReportViewProps {
  fees: FeeRecord[];
  allTransactions: Array<{
    transaction: FeeTransaction;
    feeRecord: FeeRecord;
    studentName: string;
    className: string;
    rollNo: number;
  }>;
  payrollRecords?: PayrollRecord[];
  onOpenReceipt: (fee: FeeRecord, transaction: FeeTransaction) => void;
  onOpenRecordPayment: (fee?: FeeRecord) => void;
}

type ReportViewTab = 'daily' | 'monthly' | 'payroll' | 'cashiers' | 'allTxns';

export const ConsolidatedFinancialReportView: React.FC<ConsolidatedFinancialReportViewProps> = ({
  fees,
  allTransactions,
  payrollRecords = [],
  onOpenReceipt,
  onOpenRecordPayment,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ReportViewTab>('daily');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('All');
  const [channelFilter, setChannelFilter] = useState<'All' | 'Cash' | 'UPI'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Staff Payroll Financial Aggregates
  const totalPayrollDisbursed = useMemo(() => {
    return payrollRecords
      .filter((p) => p.paymentStatus === 'Paid')
      .reduce((acc, p) => acc + (p.netSalary || 0), 0);
  }, [payrollRecords]);

  const totalPayrollPending = useMemo(() => {
    return payrollRecords
      .filter((p) => p.paymentStatus !== 'Paid')
      .reduce((acc, p) => acc + (p.netSalary || 0), 0);
  }, [payrollRecords]);

  const totalEpfWithheld = useMemo(() => {
    return payrollRecords.reduce((acc, p) => acc + (p.deductions?.epf || 0), 0);
  }, [payrollRecords]);

  const totalProfTaxWithheld = useMemo(() => {
    return payrollRecords.reduce((acc, p) => acc + (p.deductions?.profTax || 0), 0);
  }, [payrollRecords]);

  // Helper functions to identify payment channels
  const isCashTxn = (t: FeeTransaction) => {
    if (t.paymentChannel === 'Cash') return true;
    const method = (t.paymentMethod || '').toLowerCase();
    return method.includes('cash');
  };

  const isUpiTxn = (t: FeeTransaction) => {
    if (t.paymentChannel === 'UPI') return true;
    const method = (t.paymentMethod || '').toLowerCase();
    const ref = (t.referenceNumber || '').toLowerCase();
    return (
      method.includes('upi') ||
      method.includes('gpay') ||
      method.includes('google pay') ||
      method.includes('phonepe') ||
      method.includes('paytm') ||
      ref.includes('utr')
    );
  };

  // Cash and UPI collections
  const cashTransactions = useMemo(() => {
    return allTransactions.filter((item) => isCashTxn(item.transaction));
  }, [allTransactions]);

  const upiTransactions = useMemo(() => {
    return allTransactions.filter((item) => isUpiTxn(item.transaction));
  }, [allTransactions]);

  const cashTotalCollected = useMemo(() => {
    return cashTransactions.reduce((acc, t) => acc + (t.transaction.amount || 0), 0);
  }, [cashTransactions]);

  const upiTotalCollected = useMemo(() => {
    return upiTransactions.reduce((acc, t) => acc + (t.transaction.amount || 0), 0);
  }, [upiTransactions]);

  const grandTotalCollected = useMemo(() => {
    return allTransactions.reduce((acc, t) => acc + (t.transaction.amount || 0), 0);
  }, [allTransactions]);

  // Today's collections
  const todayStr = '2026-09-18';
  const todayTransactions = useMemo(() => {
    return allTransactions.filter((item) => {
      const date = item.transaction.paymentDate || '';
      return date.startsWith(todayStr);
    });
  }, [allTransactions, todayStr]);

  const todayCashTotal = useMemo(() => {
    return todayTransactions
      .filter((i) => isCashTxn(i.transaction))
      .reduce((acc, i) => acc + (i.transaction.amount || 0), 0);
  }, [todayTransactions]);

  const todayUpiTotal = useMemo(() => {
    return todayTransactions
      .filter((i) => isUpiTxn(i.transaction))
      .reduce((acc, i) => acc + (i.transaction.amount || 0), 0);
  }, [todayTransactions]);

  const todayGrandTotal = todayCashTotal + todayUpiTotal;

  // Monthly Aggregation
  const monthlySummary = useMemo(() => {
    const map = new Map<
      string,
      {
        monthKey: string;
        monthLabel: string;
        cashAmount: number;
        cashCount: number;
        upiAmount: number;
        upiCount: number;
        otherAmount: number;
        otherCount: number;
        totalAmount: number;
        totalTransactions: number;
      }
    >();

    allTransactions.forEach((item) => {
      const t = item.transaction;
      const dateStr = t.paymentDate || '2026-09-18';
      const key = dateStr.slice(0, 7); // e.g. "2026-09"

      let label = key;
      try {
        const [y, m] = key.split('-');
        const dateObj = new Date(Number(y), Number(m) - 1, 1);
        label = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      } catch (e) {
        label = key;
      }

      if (!map.has(key)) {
        map.set(key, {
          monthKey: key,
          monthLabel: label,
          cashAmount: 0,
          cashCount: 0,
          upiAmount: 0,
          upiCount: 0,
          otherAmount: 0,
          otherCount: 0,
          totalAmount: 0,
          totalTransactions: 0,
        });
      }

      const rec = map.get(key)!;
      const amt = t.amount || 0;
      rec.totalAmount += amt;
      rec.totalTransactions += 1;

      if (isCashTxn(t)) {
        rec.cashAmount += amt;
        rec.cashCount += 1;
      } else if (isUpiTxn(t)) {
        rec.upiAmount += amt;
        rec.upiCount += 1;
      } else {
        rec.otherAmount += amt;
        rec.otherCount += 1;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [allTransactions]);

  // Daily Aggregation
  const dailySummary = useMemo(() => {
    const map = new Map<
      string,
      {
        date: string;
        cashAmount: number;
        cashCount: number;
        upiAmount: number;
        upiCount: number;
        otherAmount: number;
        otherCount: number;
        totalAmount: number;
        totalTransactions: number;
      }
    >();

    allTransactions.forEach((item) => {
      const t = item.transaction;
      const date = t.paymentDate || '2026-09-18';

      // Month filter if active
      if (selectedMonthFilter !== 'All' && !date.startsWith(selectedMonthFilter)) {
        return;
      }

      if (!map.has(date)) {
        map.set(date, {
          date,
          cashAmount: 0,
          cashCount: 0,
          upiAmount: 0,
          upiCount: 0,
          otherAmount: 0,
          otherCount: 0,
          totalAmount: 0,
          totalTransactions: 0,
        });
      }

      const rec = map.get(date)!;
      const amt = t.amount || 0;
      rec.totalAmount += amt;
      rec.totalTransactions += 1;

      if (isCashTxn(t)) {
        rec.cashAmount += amt;
        rec.cashCount += 1;
      } else if (isUpiTxn(t)) {
        rec.upiAmount += amt;
        rec.upiCount += 1;
      } else {
        rec.otherAmount += amt;
        rec.otherCount += 1;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [allTransactions, selectedMonthFilter]);

  // Cashier Breakdown
  const cashierSummary = useMemo(() => {
    const map = new Map<
      string,
      {
        cashierName: string;
        cashAmount: number;
        cashCount: number;
        lastActive: string;
      }
    >();

    cashTransactions.forEach((item) => {
      const t = item.transaction;
      const name = t.cashierName || t.receivedBy || 'General Cashier Desk';

      if (!map.has(name)) {
        map.set(name, {
          cashierName: name,
          cashAmount: 0,
          cashCount: 0,
          lastActive: t.paymentDate,
        });
      }

      const rec = map.get(name)!;
      rec.cashAmount += t.amount || 0;
      rec.cashCount += 1;
      if (t.paymentDate > rec.lastActive) {
        rec.lastActive = t.paymentDate;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.cashAmount - a.cashAmount);
  }, [cashTransactions]);

  // Filtered granular transactions list
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((item) => {
      const t = item.transaction;
      const isCash = isCashTxn(t);
      const isUpi = isUpiTxn(t);

      // Channel Filter
      if (channelFilter === 'Cash' && !isCash) return false;
      if (channelFilter === 'UPI' && !isUpi) return false;

      // Month Filter
      if (selectedMonthFilter !== 'All' && !t.paymentDate.startsWith(selectedMonthFilter)) {
        return false;
      }

      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesStudent = item.studentName.toLowerCase().includes(q);
        const matchesReceipt = (t.receiptNo || '').toLowerCase().includes(q);
        const matchesRef = (t.referenceNumber || '').toLowerCase().includes(q);
        const matchesCashier = (t.cashierName || t.receivedBy || '').toLowerCase().includes(q);
        return matchesStudent || matchesReceipt || matchesRef || matchesCashier;
      }

      return true;
    });
  }, [allTransactions, channelFilter, selectedMonthFilter, searchQuery]);

  // Percentages for high-level progress bar
  const cashSharePercent = grandTotalCollected > 0 ? Math.round((cashTotalCollected / grandTotalCollected) * 100) : 0;
  const upiSharePercent = grandTotalCollected > 0 ? 100 - cashSharePercent : 0;

  // CSV Export for Consolidated Reports
  const handleExportCSV = () => {
    const headers = ['Receipt No', 'Date', 'Student Name', 'Class', 'Roll No', 'Amount (INR)', 'Payment Channel', 'Method', 'Reference / UTR', 'Cashier / Officer'];
    const rows = filteredTransactions.map((item) => {
      const t = item.transaction;
      const channel = isCashTxn(t) ? 'Cash' : isUpiTxn(t) ? 'UPI / Digital' : 'Bank';
      return [
        t.receiptNo,
        t.paymentDate,
        `"${item.studentName}"`,
        item.className,
        item.rollNo,
        t.amount,
        channel,
        `"${t.paymentMethod}"`,
        `"${t.referenceNumber || ''}"`,
        `"${t.cashierName || t.receivedBy || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zoxs_consolidated_financial_report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 p-5 rounded-2xl border border-gray-700/80 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Consolidated Financial Reporting Terminal
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  Cash & UPI Reconciled
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Daily and monthly revenue aggregation across Cash Counter Desk & Digital UPI/GPay Gateways
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors cursor-pointer border border-gray-700"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export Statement CSV
          </button>

          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Institutional Statement
          </button>
        </div>
      </div>

      {/* KPI Cards Grid: Cash vs UPI Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cash Collections */}
        <div className="bg-gray-900/90 border border-emerald-500/30 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Banknote className="w-4 h-4" />
              Cash Received (Counter)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              {cashSharePercent}% of total
            </span>
          </div>
          <div className="mt-3 text-2xl font-black font-mono text-white">
            ₹{cashTotalCollected.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-gray-400 flex items-center justify-between border-t border-gray-800 pt-2">
            <span>{cashTransactions.length} cash vouchers issued</span>
            <span className="text-emerald-400 font-mono font-medium">Desk Audited</span>
          </div>
        </div>

        {/* Card 2: UPI / GPay Collections */}
        <div className="bg-gray-900/90 border border-purple-500/30 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              UPI & Google Pay
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
              {upiSharePercent}% of total
            </span>
          </div>
          <div className="mt-3 text-2xl font-black font-mono text-white">
            ₹{upiTotalCollected.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-gray-400 flex items-center justify-between border-t border-gray-800 pt-2">
            <span>{upiTransactions.length} digital UTR receipts</span>
            <span className="text-purple-400 font-mono font-medium">NPCI Verified</span>
          </div>
        </div>

        {/* Card 3: Combined Total Revenue */}
        <div className="bg-gray-900/90 border border-amber-500/30 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-4 h-4" />
              Consolidated Revenue
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
              100% Realized
            </span>
          </div>
          <div className="mt-3 text-2xl font-black font-mono text-amber-300">
            ₹{grandTotalCollected.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-gray-400 flex items-center justify-between border-t border-gray-800 pt-2">
            <span>{allTransactions.length} total receipts verified</span>
            <span className="text-gray-300 font-mono font-medium">In Ledger</span>
          </div>
        </div>

        {/* Card 4: Today's Velocity (2026-09-18) */}
        <div className="bg-gray-900/90 border border-indigo-500/30 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Today's Intake (Sep 18)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
              Live Day
            </span>
          </div>
          <div className="mt-3 text-2xl font-black font-mono text-indigo-300">
            ₹{todayGrandTotal.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-gray-400 flex items-center justify-between border-t border-gray-800 pt-2">
            <span className="text-emerald-400">Cash: ₹{todayCashTotal.toLocaleString()}</span>
            <span className="text-purple-400">UPI: ₹{todayUpiTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Proportional Channel Bar Visualizer */}
      <div className="p-4 bg-gray-900/80 rounded-2xl border border-gray-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
          <span className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Institutional Channel Distribution Matrix
          </span>
          <span className="font-mono text-gray-400">
            Cash: <strong className="text-emerald-400">{cashSharePercent}%</strong> • UPI: <strong className="text-purple-400">{upiSharePercent}%</strong>
          </span>
        </div>
        <div className="w-full h-3.5 bg-gray-800 rounded-full overflow-hidden flex border border-gray-700/80">
          <div
            style={{ width: `${cashSharePercent}%` }}
            className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-500"
            title={`Cash: ₹${cashTotalCollected.toLocaleString()} (${cashSharePercent}%)`}
          />
          <div
            style={{ width: `${upiSharePercent}%` }}
            className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500"
            title={`UPI: ₹${upiTotalCollected.toLocaleString()} (${upiSharePercent}%)`}
          />
        </div>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-gray-800">
        <div className="flex items-center space-x-1 bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveSubTab('daily')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'daily'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Daily Breakdown ({dailySummary.length} days)
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('monthly')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'monthly'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Monthly Breakdown ({monthlySummary.length} months)
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('payroll')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'payroll'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
            Staff Payroll & Operating Margin ({payrollRecords.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('cashiers')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'cashiers'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Cashier Desk Audit
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('allTxns')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'allTxns'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Granular Ledger Logs ({filteredTransactions.length})
          </button>
        </div>

        {/* Channel & Month Selector */}
        <div className="flex items-center gap-2 text-xs">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as any)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Channels (Cash + UPI)</option>
            <option value="Cash">Cash Payments Only</option>
            <option value="UPI">UPI / GPay Only</option>
          </select>

          <select
            value={selectedMonthFilter}
            onChange={(e) => setSelectedMonthFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Months (Year 2026)</option>
            <option value="2026-09">September 2026</option>
            <option value="2026-08">August 2026</option>
            <option value="2026-07">July 2026</option>
          </select>
        </div>
      </div>

      {/* ===================== VIEW 1: DAILY BREAKDOWN ===================== */}
      {activeSubTab === 'daily' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div>
              <h4 className="font-bold text-white text-sm">Daily Cash vs UPI Collections Audit</h4>
              <p className="text-gray-400">Day-by-day fee collections showing exact totals collected via Cash Counter and UPI channels</p>
            </div>
            <span className="font-mono text-gray-400 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
              Aggregated: {dailySummary.length} days
            </span>
          </div>

          <div className="overflow-x-auto border border-gray-800 rounded-xl bg-gray-900/60">
            <table className="w-full text-left text-xs text-gray-200">
              <thead className="bg-gray-900 text-gray-400 uppercase tracking-wider text-[11px] border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Cash Received (₹)</th>
                  <th className="px-4 py-3 font-semibold text-right">UPI Received (₹)</th>
                  <th className="px-4 py-3 font-semibold text-right">Day Total (₹)</th>
                  <th className="px-4 py-3 font-semibold text-center">Receipts</th>
                  <th className="px-4 py-3 font-semibold">Channel Share (% Cash vs % UPI)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {dailySummary.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No collections logged for the selected period.
                    </td>
                  </tr>
                ) : (
                  dailySummary.map((d) => {
                    const cashPct = d.totalAmount > 0 ? Math.round((d.cashAmount / d.totalAmount) * 100) : 0;
                    const upiPct = d.totalAmount > 0 ? 100 - cashPct : 0;
                    const isToday = d.date === todayStr;

                    return (
                      <tr key={d.date} className={`hover:bg-gray-800/40 transition-colors ${isToday ? 'bg-indigo-950/20' : ''}`}>
                        <td className="px-4 py-3.5 font-mono font-bold text-white flex items-center gap-2">
                          <span>{d.date}</span>
                          {isToday && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-sans border border-indigo-500/30">
                              Today
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-right text-emerald-400 font-bold">
                          ₹{d.cashAmount.toLocaleString()}
                          <div className="text-[10px] font-normal text-gray-500">{d.cashCount} cash bills</div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-right text-purple-400 font-bold">
                          ₹{d.upiAmount.toLocaleString()}
                          <div className="text-[10px] font-normal text-gray-500">{d.upiCount} UTRs</div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-right font-bold text-white text-sm">
                          ₹{d.totalAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono text-gray-300">
                          <span className="px-2 py-0.5 rounded-full bg-gray-800 text-[11px] border border-gray-700">
                            {d.totalTransactions}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 min-w-[180px]">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-gray-400">
                              <span className="text-emerald-400">{cashPct}% Cash</span>
                              <span className="text-purple-400">{upiPct}% UPI</span>
                            </div>
                            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden flex border border-gray-700">
                              <div style={{ width: `${cashPct}%` }} className="h-full bg-emerald-500" />
                              <div style={{ width: `${upiPct}%` }} className="h-full bg-purple-500" />
                            </div>
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

      {/* ===================== VIEW 2: MONTHLY BREAKDOWN ===================== */}
      {activeSubTab === 'monthly' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div>
              <h4 className="font-bold text-white text-sm">Monthly Consolidated Revenue</h4>
              <p className="text-gray-400">Month-on-month analysis of fee intake through Cash vs UPI/GPay</p>
            </div>
            <span className="font-mono text-gray-400 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
              {monthlySummary.length} billing months
            </span>
          </div>

          <div className="overflow-x-auto border border-gray-800 rounded-xl bg-gray-900/60">
            <table className="w-full text-left text-xs text-gray-200">
              <thead className="bg-gray-900 text-gray-400 uppercase tracking-wider text-[11px] border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Billing Month</th>
                  <th className="px-4 py-3 font-semibold text-right">Cash Intake (₹)</th>
                  <th className="px-4 py-3 font-semibold text-right">UPI Intake (₹)</th>
                  <th className="px-4 py-3 font-semibold text-right">Total Realized (₹)</th>
                  <th className="px-4 py-3 font-semibold text-center">Receipts</th>
                  <th className="px-4 py-3 font-semibold">Digital Adoption Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {monthlySummary.map((m) => {
                  const cashPct = m.totalAmount > 0 ? Math.round((m.cashAmount / m.totalAmount) * 100) : 0;
                  const upiPct = m.totalAmount > 0 ? 100 - cashPct : 0;

                  return (
                    <tr key={m.monthKey} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-white">
                        {m.monthLabel}
                        <div className="text-[10px] font-mono text-gray-500">{m.monthKey}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-right text-emerald-400 font-bold">
                        ₹{m.cashAmount.toLocaleString()}
                        <div className="text-[10px] font-normal text-gray-500">{m.cashCount} cash bills</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-right text-purple-400 font-bold">
                        ₹{m.upiAmount.toLocaleString()}
                        <div className="text-[10px] font-normal text-gray-500">{m.upiCount} UPI receipts</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-right font-bold text-amber-300 text-sm">
                        ₹{m.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono text-gray-300">
                        <span className="px-2.5 py-0.5 rounded-full bg-gray-800 text-[11px] border border-gray-700">
                          {m.totalTransactions}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 min-w-[200px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-gray-400">
                            <span className="text-emerald-400">{cashPct}% Cash Desk</span>
                            <span className="text-purple-400">{upiPct}% UPI Gateway</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden flex border border-gray-700">
                            <div style={{ width: `${cashPct}%` }} className="h-full bg-emerald-500" />
                            <div style={{ width: `${upiPct}%` }} className="h-full bg-purple-500" />
                          </div>
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

      {/* ===================== VIEW 2.5: STAFF PAYROLL & INSTITUTIONAL OPERATING MARGIN ===================== */}
      {activeSubTab === 'payroll' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-900/90 border border-gray-700/80 p-5 rounded-2xl">
            <div>
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                Staff Payroll Outflows & Institutional Operating Margin
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Consolidated balance between Student Tuition Collections (Inflow) and Faculty/Staff Salaries (Outflow).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {payrollRecords.length} Payroll Records Audited
              </span>
            </div>
          </div>

          {/* Master Operating Reserves KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900/90 border border-emerald-500/30 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Total Student Fee Revenue
              </span>
              <div className="mt-2 text-2xl font-black font-mono text-white">
                ₹{grandTotalCollected.toLocaleString()}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Cash & UPI verified fees</p>
            </div>

            <div className="bg-gray-900/90 border border-rose-500/30 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                Staff Payroll Disbursed
              </span>
              <div className="mt-2 text-2xl font-black font-mono text-rose-400">
                -₹{totalPayrollDisbursed.toLocaleString()}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Settled salaries to faculty & staff
              </p>
            </div>

            <div className="bg-gray-900/90 border border-amber-500/30 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Statutory Withholdings
              </span>
              <div className="mt-2 text-2xl font-black font-mono text-amber-300">
                ₹{(totalEpfWithheld + totalProfTaxWithheld).toLocaleString()}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                EPF 12% (₹{totalEpfWithheld.toLocaleString()}) + PT (₹{totalProfTaxWithheld.toLocaleString()})
              </p>
            </div>

            <div className="bg-gray-900/90 border border-indigo-500/30 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                Net Institutional Operating Balance
              </span>
              <div
                className={`mt-2 text-2xl font-black font-mono ${
                  grandTotalCollected - totalPayrollDisbursed >= 0 ? 'text-indigo-300' : 'text-rose-400'
                }`}
              >
                ₹{(grandTotalCollected - totalPayrollDisbursed).toLocaleString()}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                {grandTotalCollected - totalPayrollDisbursed >= 0 ? 'Operating Surplus' : 'Operating Deficit'}
              </p>
            </div>
          </div>

          {/* Payroll Records Ledger */}
          <div className="overflow-x-auto border border-gray-700/80 rounded-2xl bg-gray-900/90 shadow-md">
            <table className="w-full text-left text-xs text-gray-200">
              <thead className="bg-gray-950/80 text-gray-400 uppercase tracking-wider text-[11px] border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3.5 font-semibold">Staff Member</th>
                  <th className="px-4 py-3.5 font-semibold">Designation & Dept</th>
                  <th className="px-4 py-3.5 font-semibold">Month</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Base Salary</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Deductions</th>
                  <th className="px-4 py-3.5 font-semibold text-right text-white">Net Payout</th>
                  <th className="px-4 py-3.5 font-semibold">Payment Status</th>
                  <th className="px-4 py-3.5 font-semibold">Disbursement Ref / UTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {payrollRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-500">
                      No staff payroll records generated yet.
                    </td>
                  </tr>
                ) : (
                  payrollRecords.map((pay) => (
                    <tr key={pay.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-white">
                        {pay.staffName}
                        <div className="text-[10px] font-mono text-indigo-400">
                          {pay.employeeId} • {pay.payslipNumber}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-300">
                        {pay.designation}
                        <div className="text-[10px] text-gray-500">{pay.department}</div>
                      </td>

                      <td className="px-4 py-3 font-mono font-medium text-gray-300">
                        {pay.month}
                      </td>

                      <td className="px-4 py-3 text-right font-mono text-gray-300">
                        ₹{pay.baseSalary.toLocaleString()}
                      </td>

                      <td className="px-4 py-3 text-right font-mono text-rose-400">
                        -₹{pay.totalDeductions.toLocaleString()}
                        <div className="text-[9px] text-gray-500">
                          EPF: ₹{pay.deductions?.epf || 0}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400 text-sm">
                        ₹{pay.netSalary.toLocaleString()}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            pay.paymentStatus === 'Paid'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {pay.paymentStatus}
                        </span>
                        {pay.paymentDate && (
                          <div className="text-[10px] text-gray-500 mt-0.5">{pay.paymentDate}</div>
                        )}
                      </td>

                      <td className="px-4 py-3 font-mono text-xs text-gray-300">
                        <div>{pay.paymentMethod || 'Bank Transfer'}</div>
                        <div className="text-[10px] text-gray-500">{pay.transactionRef || 'Pending Batch'}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== VIEW 3: CASHIER DESK AUDIT ===================== */}
      {activeSubTab === 'cashiers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div>
              <h4 className="font-bold text-white text-sm">Cashier & Counter Reconciliation Matrix</h4>
              <p className="text-gray-400">Audit report of cash handled per bursar and cashier desk clerk</p>
            </div>
            <span className="font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              Total Cash Desk: ₹{cashTotalCollected.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cashierSummary.map((c) => (
              <div key={c.cashierName} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-xs">{c.cashierName}</h5>
                      <span className="text-[10px] text-gray-400">Authorized Accounts Staff</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-1">
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">Total Cash Handled</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    ₹{c.cashAmount.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-800">
                  <span>Receipts Issued: <strong className="text-white">{c.cashCount}</strong></span>
                  <span>Last Active: <strong className="font-mono text-gray-300">{c.lastActive}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== VIEW 4: GRANULAR LEDGER LOGS ===================== */}
      {activeSubTab === 'allTxns' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student, receipt #, cashier, or UTR..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>
            <span className="text-gray-400 font-mono">
              Showing {filteredTransactions.length} matching transactions
            </span>
          </div>

          <div className="overflow-x-auto border border-gray-800 rounded-xl bg-gray-900/60">
            <table className="w-full text-left text-xs text-gray-200">
              <thead className="bg-gray-900 text-gray-400 uppercase tracking-wider text-[11px] border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Receipt No</th>
                  <th className="px-4 py-3 font-semibold">Date & Time</th>
                  <th className="px-4 py-3 font-semibold">Student Name</th>
                  <th className="px-4 py-3 font-semibold">Class</th>
                  <th className="px-4 py-3 font-semibold text-right">Amount (₹)</th>
                  <th className="px-4 py-3 font-semibold">Channel & Mode</th>
                  <th className="px-4 py-3 font-semibold">Cashier / Verifier</th>
                  <th className="px-4 py-3 font-semibold text-right">Voucher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredTransactions.map(({ transaction, feeRecord, studentName, className, rollNo }) => {
                  const isCash = isCashTxn(transaction);

                  return (
                    <tr key={transaction.transactionId} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-white">
                        {transaction.receiptNo}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-gray-400 text-[11px]">
                        {transaction.paymentDate} {transaction.paymentTime || ''}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-white">
                        {studentName} <span className="font-mono text-gray-400 text-[10px]">#{rollNo}</span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-300">
                        {className}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-right font-bold text-sm text-emerald-400">
                        ₹{transaction.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {isCash ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <Banknote className="w-3 h-3" /> Cash Desk
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                              <Smartphone className="w-3 h-3" /> UPI / Digital
                            </span>
                          )}
                          <span className="text-[11px] text-gray-400 font-mono">
                            {transaction.referenceNumber || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-300 text-[11px]">
                        {transaction.cashierName || transaction.receivedBy || 'Bursar'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => onOpenReceipt(feeRecord, transaction)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-gray-800 hover:bg-gray-700 text-indigo-300 border border-indigo-500/30 transition-colors cursor-pointer"
                        >
                          <Receipt className="w-3 h-3" />
                          Voucher
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Printable Financial Statement Modal */}
      <PrintableFinancialStatementModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        reportPeriod={selectedMonthFilter === 'All' ? 'Annual Session 2026-2027 (All Months)' : `Month of ${selectedMonthFilter}`}
        cashTotal={cashTotalCollected}
        cashCount={cashTransactions.length}
        upiTotal={upiTotalCollected}
        upiCount={upiTransactions.length}
        grandTotal={grandTotalCollected}
        dailySummary={dailySummary}
        monthlySummary={monthlySummary}
        cashierSummary={cashierSummary}
      />
    </div>
  );
};
