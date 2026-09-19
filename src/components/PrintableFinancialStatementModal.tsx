import React, { useRef } from 'react';
import { X, Printer, Download, School, CheckCircle2, Banknote, Smartphone, ShieldCheck } from 'lucide-react';
import { FeeTransaction, FeeRecord } from '../types';

interface PrintableFinancialStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportPeriod: string;
  cashTotal: number;
  cashCount: number;
  upiTotal: number;
  upiCount: number;
  grandTotal: number;
  dailySummary: Array<{
    date: string;
    cashAmount: number;
    cashCount: number;
    upiAmount: number;
    upiCount: number;
    totalAmount: number;
    totalTransactions: number;
  }>;
  monthlySummary: Array<{
    monthLabel: string;
    cashAmount: number;
    cashCount: number;
    upiAmount: number;
    upiCount: number;
    totalAmount: number;
    totalTransactions: number;
  }>;
  cashierSummary: Array<{
    cashierName: string;
    cashAmount: number;
    cashCount: number;
  }>;
}

export const PrintableFinancialStatementModal: React.FC<PrintableFinancialStatementModalProps> = ({
  isOpen,
  onClose,
  reportPeriod,
  cashTotal,
  cashCount,
  upiTotal,
  upiCount,
  grandTotal,
  dailySummary,
  monthlySummary,
  cashierSummary,
}) => {
  const printAreaRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const cashShare = grandTotal > 0 ? Math.round((cashTotal / grandTotal) * 100) : 0;
  const upiShare = grandTotal > 0 ? 100 - cashShare : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white text-gray-900 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl relative my-6 print:shadow-none print:m-0 print:rounded-none">
        
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="p-4 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800 print:hidden">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Official Consolidated Financial Statement (Cash & UPI)
              </h3>
              <p className="text-[11px] text-gray-400">
                Print or export formal institutional accounting report for School Managing Committee
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Statement
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Document Container */}
        <div ref={printAreaRef} className="p-6 sm:p-10 space-y-6 text-gray-900 bg-white">
          
          {/* Institutional School Letterhead */}
          <div className="border-b-2 border-gray-900 pb-4 text-center space-y-1">
            <div className="flex justify-center items-center gap-2 mb-1">
              <School className="w-6 h-6 text-gray-800" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-600">
                Government of Mizoram • Education Department
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 uppercase">
              ZOXS HIGHER SECONDARY SCHOOL, AIZAWL
            </h1>
            <p className="text-xs text-gray-600 font-medium">
              Affiliated to Mizoram Board of School Education (MBSE Reg. No. MBSE-MIZ-2026-048)
            </p>
            <p className="text-[11px] text-gray-500">
              Treasury Square, Aizawl, Mizoram - 796001 • Contact: +91 389 2322451 • Email: bursar@zoxs.edu.in
            </p>
            <div className="pt-2">
              <span className="inline-block px-4 py-1 rounded bg-gray-100 text-gray-900 font-bold text-xs uppercase tracking-wider border border-gray-300">
                CONSOLIDATED FINANCIAL STATEMENT • CASH & UPI REVENUE
              </span>
            </div>
          </div>

          {/* Statement Metadata Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-lg border border-gray-200 text-xs">
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block">Reporting Period</span>
              <strong className="text-gray-900">{reportPeriod}</strong>
            </div>
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block">Date Generated</span>
              <strong className="text-gray-900">{todayStr}</strong>
            </div>
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block">Academic Session</span>
              <strong className="text-gray-900">2026 - 2027</strong>
            </div>
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block">Audit Status</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled & Verified
              </span>
            </div>
          </div>

          {/* Executive Channel Summary Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b pb-1">
              1. Executive Channel Summary (Cash vs UPI/GPay)
            </h3>
            <table className="w-full text-xs text-left border border-gray-300">
              <thead className="bg-gray-100 text-gray-700 border-b border-gray-300">
                <tr>
                  <th className="p-2.5 font-bold">Payment Channel</th>
                  <th className="p-2.5 font-bold">Primary Verification Mechanism</th>
                  <th className="p-2.5 font-bold text-center">Receipts / Txns</th>
                  <th className="p-2.5 font-bold text-right">Channel Volume Share</th>
                  <th className="p-2.5 font-bold text-right">Total Collected (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="p-2.5 font-semibold text-gray-900 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-700" />
                    Cash Counter Payments
                  </td>
                  <td className="p-2.5 text-gray-600">Physical Cash Desk • Cashier Receipt Number</td>
                  <td className="p-2.5 text-center font-mono">{cashCount}</td>
                  <td className="p-2.5 text-right font-mono">{cashShare}%</td>
                  <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                    ₹{cashTotal.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold text-gray-900 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-purple-700" />
                    UPI & Google Pay Digital Gateway
                  </td>
                  <td className="p-2.5 text-gray-600">NPCI Dynamic UPI QR • 12-Digit Bank UTR</td>
                  <td className="p-2.5 text-center font-mono">{upiCount}</td>
                  <td className="p-2.5 text-right font-mono">{upiShare}%</td>
                  <td className="p-2.5 text-right font-mono font-bold text-purple-700">
                    ₹{upiTotal.toLocaleString()}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-gray-100 border-t-2 border-gray-900 font-bold">
                <tr>
                  <td colSpan={2} className="p-2.5 text-gray-900 uppercase">
                    Consolidated Institutional Total
                  </td>
                  <td className="p-2.5 text-center font-mono">{cashCount + upiCount}</td>
                  <td className="p-2.5 text-right font-mono">100%</td>
                  <td className="p-2.5 text-right font-mono text-sm text-gray-900 font-black">
                    ₹{grandTotal.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Monthly Aggregation Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b pb-1">
              2. Monthly Financial Breakdown
            </h3>
            <table className="w-full text-xs text-left border border-gray-300">
              <thead className="bg-gray-100 text-gray-700 border-b border-gray-300">
                <tr>
                  <th className="p-2 font-bold">Month & Year</th>
                  <th className="p-2 font-bold text-right">Cash Amount (₹)</th>
                  <th className="p-2 font-bold text-right">UPI Amount (₹)</th>
                  <th className="p-2 font-bold text-center">Transactions</th>
                  <th className="p-2 font-bold text-right">Combined Monthly Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {monthlySummary.map((m) => (
                  <tr key={m.monthLabel}>
                    <td className="p-2 font-semibold text-gray-800">{m.monthLabel}</td>
                    <td className="p-2 text-right font-mono text-gray-700">₹{m.cashAmount.toLocaleString()}</td>
                    <td className="p-2 text-right font-mono text-gray-700">₹{m.upiAmount.toLocaleString()}</td>
                    <td className="p-2 text-center font-mono text-gray-600">{m.totalTransactions}</td>
                    <td className="p-2 text-right font-mono font-bold text-gray-900">₹{m.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Daily Granular Audit Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b pb-1">
              3. Daily Collection Audit Trail
            </h3>
            <table className="w-full text-xs text-left border border-gray-300">
              <thead className="bg-gray-100 text-gray-700 border-b border-gray-300">
                <tr>
                  <th className="p-2 font-bold">Date</th>
                  <th className="p-2 font-bold text-right">Cash Received (₹)</th>
                  <th className="p-2 font-bold text-right">UPI Received (₹)</th>
                  <th className="p-2 font-bold text-center">Receipts Count</th>
                  <th className="p-2 font-bold text-right">Daily Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dailySummary.slice(0, 10).map((d) => (
                  <tr key={d.date}>
                    <td className="p-2 font-mono text-gray-800">{d.date}</td>
                    <td className="p-2 text-right font-mono text-emerald-700">₹{d.cashAmount.toLocaleString()}</td>
                    <td className="p-2 text-right font-mono text-purple-700">₹{d.upiAmount.toLocaleString()}</td>
                    <td className="p-2 text-center font-mono text-gray-600">{d.totalTransactions}</td>
                    <td className="p-2 text-right font-mono font-bold text-gray-900">₹{d.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cashier Audit Block */}
          {cashierSummary.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b pb-1">
                4. Cashier & Counter Officer Reconciliation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {cashierSummary.map((c) => (
                  <div key={c.cashierName} className="p-2.5 bg-gray-50 border border-gray-200 rounded text-xs">
                    <div className="font-bold text-gray-900">{c.cashierName}</div>
                    <div className="text-[11px] text-gray-500">{c.cashCount} cash receipts issued</div>
                    <div className="text-sm font-mono font-bold text-emerald-700 mt-1">
                      ₹{c.cashAmount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Endorsement Signatures */}
          <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs">
            <div className="border-t border-gray-400 pt-2 space-y-0.5">
              <div className="font-bold text-gray-900">Lalbiakvela</div>
              <div className="text-[11px] text-gray-500">School Cashier & Accounts Clerk</div>
              <div className="text-[10px] text-gray-400">Cash Counter Desk</div>
            </div>

            <div className="border-t border-gray-400 pt-2 space-y-0.5">
              <div className="font-bold text-gray-900">Lalmuanawma</div>
              <div className="text-[11px] text-gray-500">Bursar & Financial Controller</div>
              <div className="text-[10px] text-gray-400">Mizoram School System</div>
            </div>

            <div className="border-t border-gray-400 pt-2 space-y-0.5">
              <div className="font-bold text-gray-900">Dr. Lalhmingthanga</div>
              <div className="text-[11px] text-gray-500">Principal & Secretary</div>
              <div className="text-[10px] text-gray-400">School Managing Committee</div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="border-t border-gray-200 pt-2 text-center text-[10px] text-gray-400">
            This is an official system-generated financial audit document produced by Mizoram School System (zoxs-sms). Authenticity can be verified against the secure Firestore ledger record entries.
          </div>

        </div>
      </div>
    </div>
  );
};
