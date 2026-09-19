import React from 'react';
import { PayrollRecord, StaffMember } from '../../types';
import { X, Printer, Download, CheckCircle2, Building, ShieldCheck } from 'lucide-react';
import { formatINR, numberToWordsIndian } from '../../lib/payrollService';

interface PrintablePayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payroll: PayrollRecord | null;
  staff?: StaffMember | null;
}

export const PrintablePayslipModal: React.FC<PrintablePayslipModalProps> = ({
  isOpen,
  onClose,
  payroll,
  staff,
}) => {
  if (!isOpen || !payroll) return null;

  const handlePrint = () => {
    window.print();
  };

  const netInWords = numberToWordsIndian(payroll.netSalary);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden my-6 text-slate-100 flex flex-col">
        {/* Top Modal Controls */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-950 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official Salary Payslip Preview • {payroll.payslipNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Payslip Document (White canvas for authentic official school paper feel) */}
        <div
          id="printable-payslip-canvas"
          className="p-8 bg-white text-slate-900 text-sm overflow-y-auto"
        >
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <div className="inline-block px-3 py-1 bg-slate-900 text-white text-[11px] font-bold tracking-widest uppercase rounded mb-2">
              Government Recognized • Affiliated to MBSE
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              MIZORAM SCHOOL SYSTEM (ZOXS-SMS)
            </h1>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Chanmari West, Aizawl - 796007, Mizoram • Email: office@zoxsschool.edu.in • Tel: (0389) 2341928
            </p>
            <div className="mt-3 inline-block border-y border-slate-300 py-1 px-8 text-xs font-bold uppercase tracking-wider text-slate-800">
              SALARY PAYSLIP FOR THE MONTH OF {payroll.month}
            </div>
          </div>

          {/* Reference Meta Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 py-4 text-xs border-b border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Payslip Number:</span>
              <span className="font-mono font-bold text-slate-900">{payroll.payslipNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Payment Status:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                  payroll.paymentStatus === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {payroll.paymentStatus.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Employee Name:</span>
              <span className="font-bold text-slate-900">{payroll.staffName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Payment Date:</span>
              <span className="text-slate-800">{payroll.paymentDate || 'Pending Settlement'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Employee Code:</span>
              <span className="font-mono font-semibold text-slate-800">{payroll.employeeId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Payment Method:</span>
              <span className="text-slate-800">{payroll.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Designation:</span>
              <span className="text-slate-800">{payroll.designation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Transaction UTR / Voucher:</span>
              <span className="font-mono text-slate-800 text-[11px]">{payroll.transactionRef || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Department:</span>
              <span className="text-slate-800">{payroll.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Bank Account:</span>
              <span className="font-mono text-slate-800">
                {staff?.bankDetails?.accountNumber
                  ? `•••• ${staff.bankDetails.accountNumber.slice(-4)} (${staff.bankDetails.bankName.split(' ')[0]})`
                  : 'Cash Payment'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Working Days / Present:</span>
              <span className="text-slate-800">
                {payroll.workingDays} days / {payroll.presentDays} attended
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">EPF / UAN Ref:</span>
              <span className="font-mono text-slate-800">{staff?.epfNumber || 'MZ/AIZ/0019283'}</span>
            </div>
          </div>

          {/* Earnings & Deductions Comparison Table */}
          <div className="mt-4 border border-slate-300 rounded overflow-hidden">
            <div className="grid grid-cols-2 bg-slate-100 text-xs font-bold border-b border-slate-300 text-slate-800 uppercase tracking-wider">
              <div className="p-2.5 border-r border-slate-300 flex justify-between">
                <span>Earnings (Income)</span>
                <span>Amount (₹)</span>
              </div>
              <div className="p-2.5 flex justify-between">
                <span>Deductions</span>
                <span>Amount (₹)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 text-xs divide-x divide-slate-200">
              {/* Earnings column */}
              <div className="p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-700">Basic Base Salary</span>
                  <span className="font-semibold text-slate-900">{formatINR(payroll.baseSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700">House Rent Allowance (HRA)</span>
                  <span className="text-slate-800">{formatINR(payroll.allowances?.hra || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700">Dearness Allowance (DA)</span>
                  <span className="text-slate-800">{formatINR(payroll.allowances?.da || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700">Medical Allowance</span>
                  <span className="text-slate-800">{formatINR(payroll.allowances?.medical || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700">Conveyance Allowance</span>
                  <span className="text-slate-800">{formatINR(payroll.allowances?.conveyance || 0)}</span>
                </div>
                {(payroll.allowances?.bonus || 0) > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Performance Bonus / Honorarium</span>
                    <span>+{formatINR(payroll.allowances.bonus)}</span>
                  </div>
                )}
                {(payroll.allowances?.other || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-700">Special Duty Allowance</span>
                    <span className="text-slate-800">{formatINR(payroll.allowances.other)}</span>
                  </div>
                )}
              </div>

              {/* Deductions column */}
              <div className="p-3 space-y-1.5 bg-slate-50/50">
                <div className="flex justify-between">
                  <span className="text-slate-700">EPF Contribution (12%)</span>
                  <span className="text-slate-900 font-medium">{formatINR(payroll.deductions?.epf || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700">Mizoram Professional Tax</span>
                  <span className="text-slate-900 font-medium">{formatINR(payroll.deductions?.profTax || 0)}</span>
                </div>
                {(payroll.deductions?.leaveWithoutPay || 0) > 0 && (
                  <div className="flex justify-between text-rose-700">
                    <span>Leave Without Pay (LWP)</span>
                    <span className="font-semibold">-{formatINR(payroll.deductions.leaveWithoutPay)}</span>
                  </div>
                )}
                {(payroll.deductions?.tds || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-700">Income Tax (TDS)</span>
                    <span className="text-slate-900">{formatINR(payroll.deductions.tds)}</span>
                  </div>
                )}
                {(payroll.deductions?.advanceRecovery || 0) > 0 && (
                  <div className="flex justify-between text-amber-800">
                    <span>Salary Advance Recovery</span>
                    <span>-{formatINR(payroll.deductions.advanceRecovery)}</span>
                  </div>
                )}
                {(payroll.deductions?.other || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-700">Other Deductions</span>
                    <span className="text-slate-900">{formatINR(payroll.deductions.other)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Totals Row */}
            <div className="grid grid-cols-2 bg-slate-100 text-xs font-bold border-t border-slate-300 text-slate-900">
              <div className="p-2.5 border-r border-slate-300 flex justify-between">
                <span>GROSS EARNINGS</span>
                <span className="text-slate-900">{formatINR(payroll.totalEarnings)}</span>
              </div>
              <div className="p-2.5 flex justify-between text-rose-800">
                <span>TOTAL DEDUCTIONS</span>
                <span>-{formatINR(payroll.totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* Net Salary Highlight Box */}
          <div className="mt-4 p-4 rounded-lg bg-emerald-50 border-2 border-emerald-300 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 block">
                NET SALARY PAYABLE
              </span>
              <span className="text-xs text-emerald-800 font-medium italic">
                {netInWords}
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-800">
              {formatINR(payroll.netSalary)}
            </div>
          </div>

          {/* Notes / Memos */}
          {payroll.notes && (
            <div className="mt-3 text-[11px] text-slate-600 italic bg-slate-50 p-2.5 rounded border border-slate-200">
              <strong>Remarks:</strong> {payroll.notes}
            </div>
          )}

          {/* Signatures & Seal */}
          <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs text-slate-600">
            <div>
              <div className="h-10"></div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                Pi Lalrinsangi
              </div>
              <div className="text-[10px] text-slate-500">Head Bursar / Accountant</div>
            </div>

            <div>
              <div className="h-10 flex items-center justify-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 border border-dashed border-slate-300 px-3 py-1 rounded">
                  [ Institutional Seal ]
                </span>
              </div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                Pu K. Lalthantluanga
              </div>
              <div className="text-[10px] text-slate-500">Principal & Administrator</div>
            </div>

            <div>
              <div className="h-10"></div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                {payroll.staffName}
              </div>
              <div className="text-[10px] text-slate-500">Employee Signature</div>
            </div>
          </div>

          <div className="mt-6 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-2">
            This is a computer-generated institutional payroll document generated on {new Date().toLocaleDateString('en-GB')}.
          </div>
        </div>
      </div>
    </div>
  );
};
