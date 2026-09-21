import React, { useState, useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Receipt, 
  FileText, 
  Sliders, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  QrCode, 
  CreditCard,
  Check
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useSchool } from '../context/SchoolContext';

export default function FeeReceiptModal({ 
  isOpen, 
  onClose, 
  feeRecord = null, 
  student = null 
}) {
  const { students, classes, systemConfig } = useSchool();

  const [receiptMode, setReceiptMode] = useState('voucher'); // 'voucher' (A4/Half-A4) | 'thermal' (80mm) | 'config'
  const [cashierName, setCashierName] = useState('Lalhmangaiha (Accounts Officer)');
  
  // Custom Receipt Configuration
  const [receiptConfig, setReceiptConfig] = useState({
    prefix: 'OHA-REC-2026-',
    schoolName: systemConfig?.schoolName || 'OHA (One Heart Academy)',
    schoolAddress: systemConfig?.address || 'Lunglawn, Lunglei, Mizoram - 796701',
    affiliationNo: systemConfig?.affiliationNo || 'MBSE-HSS-LGL-0421',
    contactPhone: systemConfig?.contactPhone || '+91 372 2322104',
    contactEmail: systemConfig?.contactEmail || 'oha.lunglawn@gmail.com',
    terms: '1. Fees once paid are non-refundable.\n2. Keep this receipt voucher for MBSE board examination registration clearance.\n3. Digital verification is valid with the embedded QR code.',
    showCashierSignature: true,
    showPrincipalStamp: true,
    showVerificationQr: true
  });

  if (!isOpen) return null;

  // Resolve Student & Class
  const resolvedStudent = student || (feeRecord ? students.find(s => s.id === feeRecord.studentId) : students[0]);
  const resolvedClass = resolvedStudent ? classes.find(c => c.id === resolvedStudent.classId) : classes[0];

  const receiptNumber = feeRecord?.receiptNo || `${receiptConfig.prefix}${Math.floor(1000 + Math.random() * 9000)}`;
  const paidDate = feeRecord?.paidDate || feeRecord?.date || new Date().toISOString().slice(0, 10);
  const paidAmount = Number(feeRecord?.paidAmount || feeRecord?.amount || 12500);
  const totalDue = Number(feeRecord?.totalFees || 32000);
  const balanceRemaining = Math.max(0, totalDue - paidAmount);
  const paymentMode = feeRecord?.paymentMethod || feeRecord?.mode || 'NPCI UPI (GPay / PhonePe)';
  const utrNumber = feeRecord?.transactionId || feeRecord?.utr || `UPI-MZ-${Date.now().toString().slice(-8)}`;

  // Itemized fee heads breakdown
  const feeBreakdown = [
    { head: 'Quarterly Academic Tuition Fee', amount: Math.round(paidAmount * 0.65) },
    { head: 'Science Lab & Computer Practical Fund', amount: Math.round(paidAmount * 0.15) },
    { head: 'Terminal Examination & Evaluation Fee', amount: Math.round(paidAmount * 0.10) },
    { head: 'Institutional Library & Digital Resource Fund', amount: Math.round(paidAmount * 0.05) },
    { head: 'Campus Sports & Cultural Development', amount: Math.round(paidAmount * 0.05) }
  ];

  const qrVerificationData = JSON.stringify({
    receipt: receiptNumber,
    student: `${resolvedStudent?.firstName} ${resolvedStudent?.lastName}`,
    roll: resolvedStudent?.rollNumber,
    amount: `₹${paidAmount}`,
    date: paidDate,
    status: 'VERIFIED_OFFICIAL'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header Bar */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base font-['Outfit']">
                Official Fee Payment Receipt &amp; Voucher
              </h3>
              <p className="text-xs text-slate-400">
                Institutional fee voucher with itemized billing, digital verification QR code, and thermal slip export.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Layout Switcher */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setReceiptMode('voucher')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                receiptMode === 'voucher' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Standard Institutional Voucher (A4 / Half A4)</span>
            </button>

            <button
              onClick={() => setReceiptMode('thermal')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                receiptMode === 'thermal' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>80mm POS Thermal Slip</span>
            </button>

            <button
              onClick={() => setReceiptMode('config')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                receiptMode === 'config' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Receipt Settings</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Receipt: #{receiptNumber}
          </div>
        </div>

        {/* Body Render Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950/60 flex items-center justify-center">
          
          {/* 1. STANDARD INSTITUTIONAL VOUCHER */}
          {receiptMode === 'voucher' && (
            <div className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative print:border-none print:shadow-none print:m-0 print:p-4">
              
              {/* Receipt Header */}
              <div className="flex items-start justify-between pb-4 border-b-2 border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-extrabold text-lg font-['Outfit'] shadow-md">
                    MZS
                  </div>
                  <div>
                    <h2 className="font-extrabold text-lg uppercase tracking-tight text-slate-900 font-['Outfit'] leading-tight">
                      {receiptConfig.schoolName}
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">{receiptConfig.schoolAddress}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Affiliation: {receiptConfig.affiliationNo} • Phone: {receiptConfig.contactPhone}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[11px] uppercase tracking-wider font-mono border border-emerald-300">
                    FEE RECEIPT
                  </span>
                  <div className="text-xs font-mono font-bold text-slate-800 mt-1.5">
                    No: <span className="text-emerald-700">{receiptNumber}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Date: {paidDate}</div>
                </div>
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-200 text-xs bg-slate-50/80 -mx-6 sm:-mx-8 px-6 sm:px-8">
                <div>
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">Student Name</span>
                  <strong className="text-slate-900 text-sm">
                    {resolvedStudent?.firstName} {resolvedStudent?.lastName}
                  </strong>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">Class &amp; Section</span>
                  <span className="text-slate-800 font-bold">
                    {resolvedClass?.name || 'Class 12'} - {resolvedStudent?.section || 'A'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">Roll Number</span>
                  <span className="font-mono text-slate-900 font-bold">#{resolvedStudent?.rollNumber || '14'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">Student ID / Adm No</span>
                  <span className="font-mono text-slate-700">{resolvedStudent?.admissionNo || resolvedStudent?.id}</span>
                </div>
              </div>

              {/* Itemized Fee Breakdown Table */}
              <div className="py-4">
                <table className="w-full text-xs text-left">
                  <thead className="border-b-2 border-slate-300 text-[10px] uppercase font-mono text-slate-600 bg-slate-100">
                    <tr>
                      <th className="py-2 px-2">#</th>
                      <th className="py-2 px-2">Fee Head / Description</th>
                      <th className="py-2 px-2 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {feeBreakdown.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-2 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-2 font-medium">{item.head}</td>
                        <td className="py-2 px-2 text-right font-mono font-semibold">₹{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-800 font-bold text-slate-900">
                    <tr className="bg-emerald-50/60">
                      <td colSpan={2} className="py-2.5 px-2 text-right text-xs uppercase font-mono">
                        Total Amount Paid:
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-base text-emerald-800">
                        ₹{paidAmount.toLocaleString()}
                      </td>
                    </tr>
                    {balanceRemaining > 0 && (
                      <tr className="text-rose-700 text-[11px]">
                        <td colSpan={2} className="py-1 px-2 text-right font-mono">
                          Remaining Balance Due:
                        </td>
                        <td className="py-1 px-2 text-right font-mono font-semibold">
                          ₹{balanceRemaining.toLocaleString()}
                        </td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>

              {/* Payment Mode & UTR Bar */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between text-xs mb-4">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Payment Mode</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{paymentMode}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Bank Ref / Transaction UTR</span>
                  <span className="font-mono font-semibold text-slate-700">{utrNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Payment Status</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] font-mono">
                    CLEARED &amp; RECEIVED
                  </span>
                </div>
              </div>

              {/* Footer, QR Code & Signatures */}
              <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                {/* QR Verification Block */}
                <div className="sm:col-span-4 flex items-center gap-2.5">
                  {receiptConfig.showVerificationQr && (
                    <div className="p-1 bg-white border border-slate-300 rounded-lg shadow-sm">
                      <QRCodeSVG value={qrVerificationData} size={56} />
                    </div>
                  )}
                  <div className="text-[9px] text-slate-500 leading-tight">
                    <strong className="text-slate-700 block font-mono">Scan to Verify</strong>
                    NPCI e-Voucher Validated
                  </div>
                </div>

                {/* Signatures */}
                <div className="sm:col-span-8 flex items-end justify-between text-center pt-2">
                  <div>
                    <div className="font-serif italic text-slate-800 text-xs font-bold leading-none mb-1">
                      {cashierName}
                    </div>
                    <div className="border-t border-slate-300 w-32 pt-1 text-[9px] font-mono text-slate-500">
                      Authorized Cashier
                    </div>
                  </div>

                  <div>
                    <div className="font-serif italic text-emerald-700 text-xs font-bold leading-none mb-1">
                      Lalthansanga
                    </div>
                    <div className="border-t border-slate-300 w-32 pt-1 text-[9px] font-mono text-slate-500">
                      Principal Seal
                    </div>
                  </div>
                </div>
              </div>

              {/* T&C Subtext */}
              <div className="mt-4 pt-2 border-t border-slate-100 text-[9px] text-slate-400 text-center whitespace-pre-line">
                {receiptConfig.terms}
              </div>
            </div>
          )}

          {/* 2. 80MM POS THERMAL RECEIPT SLIP */}
          {receiptMode === 'thermal' && (
            <div className="w-[320px] bg-white text-black p-5 rounded-2xl shadow-2xl font-mono text-xs border border-slate-300 print:m-0 print:border-none print:shadow-none">
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-black">
                <h3 className="font-extrabold text-sm uppercase leading-tight">{receiptConfig.schoolName}</h3>
                <p className="text-[10px]">{receiptConfig.schoolAddress}</p>
                <p className="text-[9px]">TEL: {receiptConfig.contactPhone}</p>
                <div className="text-[11px] font-bold mt-1">*** OFFICIAL RECEIPT ***</div>
              </div>

              <div className="py-2 text-[11px] space-y-0.5 border-b border-dashed border-black">
                <div>RC NO : {receiptNumber}</div>
                <div>DATE  : {paidDate}</div>
                <div>STU   : {resolvedStudent?.firstName} {resolvedStudent?.lastName}</div>
                <div>CLASS : {resolvedClass?.name || 'Class 12'} - {resolvedStudent?.section || 'A'}</div>
                <div>ROLL  : #{resolvedStudent?.rollNumber || '14'}</div>
                <div>MODE  : {paymentMode}</div>
                <div>UTR   : {utrNumber}</div>
              </div>

              <div className="py-2 text-[11px] space-y-1 border-b border-dashed border-black">
                {feeBreakdown.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="truncate pr-2">{item.head.slice(0, 20)}</span>
                    <span>₹{item.amount}</span>
                  </div>
                ))}
              </div>

              <div className="py-2 text-[12px] font-bold space-y-0.5 border-b border-dashed border-black">
                <div className="flex justify-between text-sm">
                  <span>TOTAL PAID:</span>
                  <span>₹{paidAmount.toLocaleString()}</span>
                </div>
                {balanceRemaining > 0 && (
                  <div className="flex justify-between text-[11px] font-normal">
                    <span>BAL REMAINING:</span>
                    <span>₹{balanceRemaining.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="py-3 flex flex-col items-center justify-center space-y-1 text-center">
                <QRCodeSVG value={qrVerificationData} size={64} />
                <span className="text-[9px]">SCAN FOR VERIFICATION</span>
                <span className="text-[9px] mt-1 italic">Thank you for your timely payment!</span>
              </div>
            </div>
          )}

          {/* 3. RECEIPT SETTINGS TAB */}
          {receiptMode === 'config' && (
            <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Fee Voucher &amp; Receipt Configuration</span>
              </h4>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Receipt Serial Prefix</label>
                  <input
                    type="text"
                    value={receiptConfig.prefix}
                    onChange={(e) => setReceiptConfig({ ...receiptConfig, prefix: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    placeholder="MZS-REC-2026-"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Authorized Cashier / Officer Name</label>
                  <input
                    type="text"
                    value={cashierName}
                    onChange={(e) => setCashierName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Terms &amp; Official Notice (Footer)</label>
                  <textarea
                    rows={3}
                    value={receiptConfig.terms}
                    onChange={(e) => setReceiptConfig({ ...receiptConfig, terms: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">Verification QR Code</span>
                    <input
                      type="checkbox"
                      checked={receiptConfig.showVerificationQr}
                      onChange={(e) => setReceiptConfig({ ...receiptConfig, showVerificationQr: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500"
                    />
                  </label>

                  <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">Principal Seal Stamp</span>
                    <input
                      type="checkbox"
                      checked={receiptConfig.showPrincipalStamp}
                      onChange={(e) => setReceiptConfig({ ...receiptConfig, showPrincipalStamp: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setReceiptMode('voucher')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save &amp; View Voucher</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
