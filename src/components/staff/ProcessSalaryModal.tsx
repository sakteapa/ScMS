import React, { useState, useEffect } from 'react';
import { PayrollRecord, PayrollPaymentMethod, PayrollPaymentStatus } from '../../types';
import { X, CheckCircle2, DollarSign, Calendar, FileText, Building2 } from 'lucide-react';
import { formatINR } from '../../lib/payrollService';

interface ProcessSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  payroll: PayrollRecord | null;
  onProcess: (payrollId: string, updates: Partial<PayrollRecord>) => Promise<void>;
}

export const ProcessSalaryModal: React.FC<ProcessSalaryModalProps> = ({
  isOpen,
  onClose,
  payroll,
  onProcess,
}) => {
  const [status, setStatus] = useState<PayrollPaymentStatus>('Paid');
  const [paymentMethod, setPaymentMethod] = useState<PayrollPaymentMethod>('Bank Transfer');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionRef, setTransactionRef] = useState('');
  const [disbursedBy, setDisbursedBy] = useState('Pi Lalrinsangi (Head Bursar)');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (payroll) {
      setStatus(payroll.paymentStatus === 'Pending' ? 'Paid' : payroll.paymentStatus);
      setPaymentMethod(payroll.paymentMethod || 'Bank Transfer');
      setPaymentDate(payroll.paymentDate || new Date().toISOString().split('T')[0]);
      setTransactionRef(
        payroll.transactionRef ||
          (payroll.paymentMethod === 'Cash'
            ? `CASH-VOUCH-${payroll.month.replace('-', '')}-${Math.floor(10 + Math.random() * 90)}`
            : `SBI-NEFT-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`)
      );
      setDisbursedBy(payroll.disbursedBy || 'Pi Lalrinsangi (Head Bursar)');
      setNotes(payroll.notes || `Salary disbursed for ${payroll.month}`);
    }
  }, [payroll, isOpen]);

  if (!isOpen || !payroll) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onProcess(payroll.id, {
        paymentStatus: status,
        paymentMethod,
        paymentDate: status === 'Paid' ? paymentDate : null,
        transactionRef: status === 'Paid' ? transactionRef : '',
        disbursedBy,
        notes,
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      console.error('Failed to disburse salary:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Process Salary Payout
              </h2>
              <p className="text-xs text-slate-400">
                Payslip #{payroll.payslipNumber} • Month: {payroll.month}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Staff & Amount Summary Card */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">{payroll.staffName}</h3>
              <p className="text-xs text-slate-400">
                {payroll.employeeId} • {payroll.designation}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Dept: {payroll.department}</p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase tracking-wider text-slate-400 block">
                Net Disbursable
              </span>
              <span className="text-xl font-bold text-emerald-400">
                {formatINR(payroll.netSalary)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Base Basic</span>
              <span className="text-slate-200 font-semibold">{formatINR(payroll.baseSalary)}</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Allowances</span>
              <span className="text-emerald-400 font-semibold">
                +{formatINR(payroll.totalEarnings - payroll.baseSalary)}
              </span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Deductions</span>
              <span className="text-rose-400 font-semibold">
                -{formatINR(payroll.totalDeductions)}
              </span>
            </div>
          </div>
        </div>

        {/* Disbursement Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Disbursement Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PayrollPaymentStatus)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Paid">Mark as Paid</option>
                <option value="Processing">Processing (In Bank Batch)</option>
                <option value="Pending">Pending Sanction</option>
                <option value="Held">Hold Payment (Discrepancy)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PayrollPaymentMethod)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                <option value="UPI">UPI Direct VPA Transfer</option>
                <option value="Cash">Cash (Counter Voucher)</option>
                <option value="Cheque">Account Payee Cheque</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Disbursement Date
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                UTR / Ref / Voucher No.
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. SBI-NEFT-928192"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Authorizing Officer / Disbursed By
            </label>
            <input
              type="text"
              value={disbursedBy}
              onChange={(e) => setDisbursedBy(e.target.value)}
              placeholder="e.g. Pi Lalrinsangi (Head Bursar)"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Disbursement Notes / Audit Memo
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared via September salary master batch."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Recording...' : 'Confirm Disbursement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
