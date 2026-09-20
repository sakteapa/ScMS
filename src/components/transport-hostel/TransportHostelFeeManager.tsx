import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Bus,
  Home,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Printer,
  Sparkles,
  Calendar,
  X,
  FileText,
  Search,
} from 'lucide-react';
import {
  FeeRecord,
  TransportRoute,
  HostelRoom,
  FirestoreStudent,
} from '../../types';
import {
  bulkGenerateTransportFees,
  bulkGenerateHostelFees,
  settleTransportOrHostelFee,
  postTransportFeeToStudentLedger,
  postHostelFeeToStudentLedger,
} from '../../lib/transportHostelFeeService';

interface TransportHostelFeeManagerProps {
  fees: FeeRecord[];
  students: FirestoreStudent[];
  routes: TransportRoute[];
  rooms: HostelRoom[];
  cashierName?: string;
}

export const TransportHostelFeeManager: React.FC<TransportHostelFeeManagerProps> = ({
  fees,
  students,
  routes,
  rooms,
  cashierName = 'Principal / Administrative Officer',
}) => {
  const [activeFeeFilter, setActiveFeeFilter] = useState<'All' | 'Transport' | 'Hostel'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [dueDate, setDueDate] = useState('2026-09-30');
  const [isBulkRunning, setIsBulkRunning] = useState(false);
  const [bulkFeedback, setBulkFeedback] = useState<string | null>(null);

  // Quick Payment Modal State
  const [paymentFeeRecord, setPaymentFeeRecord] = useState<FeeRecord | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('UPI');
  const [payReference, setPayReference] = useState('');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  // Voucher / Receipt Print Modal
  const [receiptRecord, setReceiptRecord] = useState<FeeRecord | null>(null);

  // Filter transport and hostel fee records from general fee collection
  const transportHostelFees = useMemo(() => {
    return fees.filter((f) => f.feeType === 'Transport' || f.feeType === 'Hostel');
  }, [fees]);

  const filteredFees = useMemo(() => {
    return transportHostelFees.filter((f) => {
      const matchesType = activeFeeFilter === 'All' || f.feeType === activeFeeFilter;
      const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
      const matchesSearch =
        f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.rollNo.toString().includes(searchQuery) ||
        f.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.receiptNo && f.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [transportHostelFees, activeFeeFilter, statusFilter, searchQuery]);

  // Aggregate Metrics
  const transportTotal = useMemo(() => {
    return transportHostelFees
      .filter((f) => f.feeType === 'Transport')
      .reduce((sum, f) => sum + f.totalAmount, 0);
  }, [transportHostelFees]);

  const transportPaid = useMemo(() => {
    return transportHostelFees
      .filter((f) => f.feeType === 'Transport')
      .reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  }, [transportHostelFees]);

  const hostelTotal = useMemo(() => {
    return transportHostelFees
      .filter((f) => f.feeType === 'Hostel')
      .reduce((sum, f) => sum + f.totalAmount, 0);
  }, [transportHostelFees]);

  const hostelPaid = useMemo(() => {
    return transportHostelFees
      .filter((f) => f.feeType === 'Hostel')
      .reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  }, [transportHostelFees]);

  const totalPendingDues = useMemo(() => {
    return transportHostelFees
      .filter((f) => f.status === 'Pending' || f.status === 'Overdue')
      .reduce(
        (sum, f) =>
          sum + (f.balanceAmount !== undefined ? f.balanceAmount : f.totalAmount - f.paidAmount),
        0
      );
  }, [transportHostelFees]);

  // Handle Bulk Generation
  const handleGenerateTransportBulk = async () => {
    try {
      setIsBulkRunning(true);
      setBulkFeedback(null);
      const res = await bulkGenerateTransportFees({
        routes,
        feeMonth: selectedMonth,
        dueDate,
        allFees: fees,
        allStudents: students,
      });
      setBulkFeedback(
        `Generated ${res.totalGenerated} Transport fee invoices (₹${res.totalAmount.toLocaleString()}) for ${selectedMonth}. Skipped ${res.totalSkipped} existing.`
      );
    } catch (err) {
      console.error(err);
      alert('Failed to generate bulk transport fees.');
    } finally {
      setIsBulkRunning(false);
    }
  };

  const handleGenerateHostelBulk = async () => {
    try {
      setIsBulkRunning(true);
      setBulkFeedback(null);
      const res = await bulkGenerateHostelFees({
        rooms,
        feeMonth: selectedMonth,
        dueDate,
        allFees: fees,
        allStudents: students,
      });
      setBulkFeedback(
        `Generated ${res.totalGenerated} Hostel boarding fee invoices (₹${res.totalAmount.toLocaleString()}) for ${selectedMonth}. Skipped ${res.totalSkipped} existing.`
      );
    } catch (err) {
      console.error(err);
      alert('Failed to generate bulk hostel fees.');
    } finally {
      setIsBulkRunning(false);
    }
  };

  // Open Payment Modal
  const handleOpenPayment = (fee: FeeRecord) => {
    const due = fee.balanceAmount !== undefined ? fee.balanceAmount : fee.totalAmount - fee.paidAmount;
    setPaymentFeeRecord(fee);
    setPayAmount(due);
    setPayReference(`UPI-${Date.now().toString().slice(-6)}`);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentFeeRecord || payAmount <= 0) return;

    try {
      setIsSubmittingPay(true);
      const res = await settleTransportOrHostelFee({
        feeRecord: paymentFeeRecord,
        paymentAmount: payAmount,
        paymentMethod: payMethod,
        referenceNumber: payReference,
        cashierName,
        allFees: fees,
        allStudents: students,
        routes,
        rooms,
      });

      alert(`Payment of ₹${payAmount.toLocaleString()} recorded successfully! Receipt #${res.receiptNo}`);
      setPaymentFeeRecord(null);
    } catch (err) {
      console.error(err);
      alert('Failed to record payment.');
    } finally {
      setIsSubmittingPay(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Transport Collections</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            ₹{transportPaid.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-400 flex items-center justify-between">
            <span>Total Invoiced: ₹{transportTotal.toLocaleString()}</span>
            <span className="text-amber-400 font-semibold">
              {transportTotal > 0 ? Math.round((transportPaid / transportTotal) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Hostel Boarding Dues</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            ₹{hostelPaid.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-400 flex items-center justify-between">
            <span>Total Invoiced: ₹{hostelTotal.toLocaleString()}</span>
            <span className="text-indigo-400 font-semibold">
              {hostelTotal > 0 ? Math.round((hostelPaid / hostelTotal) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Unsettled Balances</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-400">
            ₹{totalPendingDues.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Across active bus routes & hostel rooms
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Enrolled Boarders & Riders</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            {routes.reduce((acc, r) => acc + r.assignedStudents.length, 0) +
              rooms.reduce(
                (acc, rm) => acc + rm.residents.filter((res) => res.status === 'Active').length,
                0
              )}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Directly synced to student ledgers
          </div>
        </div>
      </div>

      {/* Bulk Fee Generation Control Deck */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Automated Ledger Billing & Month Invoicing
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Apply monthly transport fares and hostel boarding dues directly to student fee accounts in 1 click
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Month:</span>
              <input
                type="text"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                placeholder="September 2026"
                className="bg-transparent text-white font-semibold focus:outline-none w-28"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Due Date:</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-transparent text-white focus:outline-none"
              />
            </div>

            <button
              onClick={handleGenerateTransportBulk}
              disabled={isBulkRunning}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition disabled:opacity-50"
            >
              <Bus className="w-3.5 h-3.5" />
              Generate Transport Fees
            </button>

            <button
              onClick={handleGenerateHostelBulk}
              disabled={isBulkRunning}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition disabled:opacity-50"
            >
              <Home className="w-3.5 h-3.5" />
              Generate Hostel Fees
            </button>
          </div>
        </div>

        {bulkFeedback && (
          <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
            <span>{bulkFeedback}</span>
            <button onClick={() => setBulkFeedback(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setActiveFeeFilter('All')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                activeFeeFilter === 'All'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Invoices ({transportHostelFees.length})
            </button>
            <button
              onClick={() => setActiveFeeFilter('Transport')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition ${
                activeFeeFilter === 'Transport'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bus className="w-3 h-3" /> Transport
            </button>
            <button
              onClick={() => setActiveFeeFilter('Hostel')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition ${
                activeFeeFilter === 'Hostel'
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home className="w-3 h-3" /> Hostel
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid / Cleared</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or receipt..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Fee Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Student & Class</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Billing Month</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Paid / Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No matching transport or hostel fee records found. Use the Bulk Generator above or check in students to invoice.
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => {
                  const balance =
                    fee.balanceAmount !== undefined ? fee.balanceAmount : fee.totalAmount - fee.paidAmount;
                  const isPaid = fee.status === 'Paid' || fee.isFeeCleared;
                  return (
                    <tr key={fee.id} className="hover:bg-slate-850/60 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{fee.studentName}</div>
                        <div className="text-[11px] text-slate-400">
                          {fee.className} • Roll #{fee.rollNo}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {fee.feeType === 'Transport' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Bus className="w-3 h-3" /> Bus Route
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <Home className="w-3 h-3" /> Boarding Room
                          </span>
                        )}
                        <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 max-w-xs">
                          {fee.remarks || 'Standard Monthly Fee'}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200">{fee.feeMonth}</td>
                      <td className="py-3 px-4 font-bold text-white">₹{fee.totalAmount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="text-emerald-400 font-medium">₹{fee.paidAmount.toLocaleString()}</div>
                        {balance > 0 && (
                          <div className="text-rose-400 text-[11px]">Due: ₹{balance.toLocaleString()}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Cleared
                          </span>
                        ) : fee.status === 'Overdue' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <AlertCircle className="w-3 h-3" /> Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{fee.dueDate || '—'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isPaid ? (
                            <button
                              onClick={() => handleOpenPayment(fee)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow transition flex items-center gap-1"
                            >
                              <DollarSign className="w-3.5 h-3.5" /> Settle
                            </button>
                          ) : (
                            <button
                              onClick={() => setReceiptRecord(fee)}
                              className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition flex items-center gap-1"
                            >
                              <Printer className="w-3.5 h-3.5" /> Receipt
                            </button>
                          )}
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

      {/* Quick Settlement Modal */}
      {paymentFeeRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Record Fee Settlement</h3>
                  <p className="text-xs text-slate-400">
                    {paymentFeeRecord.feeType} Fee • {paymentFeeRecord.feeMonth}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentFeeRecord(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="font-semibold text-white">{paymentFeeRecord.studentName}</div>
                <div className="text-xs text-slate-400">
                  {paymentFeeRecord.className} • Roll #{paymentFeeRecord.rollNo}
                </div>
                <div className="text-xs text-slate-400">{paymentFeeRecord.remarks}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Settlement Amount (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={paymentFeeRecord.totalAmount - paymentFeeRecord.paidAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-base font-bold text-emerald-400 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Cash', 'Bank Transfer'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition ${
                        payMethod === m
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-850'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Transaction / UTR Reference
                </label>
                <input
                  type="text"
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  placeholder="e.g. UPI-984210"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPaymentFeeRecord(null)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPay}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSubmittingPay ? 'Processing...' : 'Confirm Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Voucher / Receipt Print Modal */}
      {receiptRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Payment Receipt Voucher</h3>
              </div>
              <button
                onClick={() => setReceiptRecord(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 my-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 font-mono text-xs">
              <div className="text-center border-b border-slate-800 pb-2">
                <div className="font-bold text-sm text-white">GOVERNMENT OF MIZORAM</div>
                <div className="text-slate-400">School Education Department • zoxs-sms</div>
                <div className="text-emerald-400 text-[11px] mt-0.5">
                  Official {receiptRecord.feeType} Fee Clearance Voucher
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Receipt No:</span>{' '}
                  <span className="text-white font-bold">{receiptRecord.receiptNo || receiptRecord.id}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Date:</span>{' '}
                  <span className="text-white">{new Date().toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-slate-500">Student:</span>{' '}
                  <span className="text-white font-bold">{receiptRecord.studentName}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Roll:</span>{' '}
                  <span className="text-white">#{receiptRecord.rollNo}</span>
                </div>
                <div>
                  <span className="text-slate-500">Class:</span>{' '}
                  <span className="text-white">{receiptRecord.className}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Month:</span>{' '}
                  <span className="text-white">{receiptRecord.feeMonth}</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-2">
                <div className="flex justify-between font-bold text-white text-sm">
                  <span>Amount Paid:</span>
                  <span className="text-emerald-400">₹{receiptRecord.paidAmount.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Method: {receiptRecord.paymentMethod} • Status: {receiptRecord.status}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{receiptRecord.remarks}</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setReceiptRecord(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" /> Print Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
