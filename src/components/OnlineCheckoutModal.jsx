import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  X,
  Lock,
  ArrowUpRight,
  Sparkles,
  Smartphone,
  Building2,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { useSchool } from '../context/SchoolContext';

export default function OnlineCheckoutModal({ isOpen, onClose, student, feeAmount = 18000, feeType = 'Tuition Fee (Term 2)', onPaymentSuccess }) {
  const { paymentConfig, recordPayment, systemConfig } = useSchool();

  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [lastPaymentRecord, setLastPaymentRecord] = useState(null);

  // Card Inputs state (for Razorpay / Cashfree simulation)
  const [cardDetails, setCardDetails] = useState({
    number: '4242 •••• •••• 4242',
    name: student ? `${student.firstName} ${student.lastName}` : 'Student Payer',
    expiry: '08/28',
    cvv: '•••'
  });

  if (!isOpen) return null;

  const schoolName = systemConfig?.schoolName || 'OHA (One Heart Academy)';
  const activeGwKey = paymentConfig?.activeGateway || 'direct_upi';
  const activeGw = paymentConfig?.gateways?.[activeGwKey] || {};
  const upiId = activeGw.upiId || 'ohalunglawn@oksbi';

  const upiIntentString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(schoolName)}&am=${feeAmount}&cu=INR&tn=FEE_${student?.admissionNo || 'MZ2026'}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCompleteOnlinePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const utrRef = utrInput || `TXN${Date.now().toString().slice(-8)}`;

      const paymentRecord = recordPayment({
        studentId: student?.id,
        studentName: `${student?.firstName} ${student?.lastName}`,
        admissionNo: student?.admissionNo,
        classId: student?.classId,
        amount: String(feeAmount),
        feeType: feeType,
        paymentMode: 'upi',
        transactionUtr: utrRef,
        upiId: upiId,
        gatewayProvider: activeGw.name || 'Direct UPI',
        remarks: `Online Payment verified via ${activeGw.name || 'Gateway'}`
      });

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      setIsPaidSuccess(true);
      setLastPaymentRecord(paymentRecord);
      if (onPaymentSuccess) {
        onPaymentSuccess(paymentRecord);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Top Gateway Banner */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-['Outfit']">
                  {activeGw.name || 'Secure Payment Gateway'}
                </h3>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase border border-emerald-500/30">
                  {activeGw.environment === 'live' ? 'Live Secured' : 'Instant Checkout'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {schoolName} Institutional Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Payment Content */}
        {!isPaidSuccess ? (
          <div className="p-6 space-y-5">
            {/* Student & Bill Summary */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Student Beneficiary</span>
                <h4 className="text-sm font-bold text-white">{student?.firstName} {student?.lastName}</h4>
                <span className="text-xs text-slate-400 font-mono">Adm: {student?.admissionNo} • {feeType}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Payable</span>
                <span className="text-2xl font-black text-cyan-300 font-['Outfit'] font-mono">
                  ₹{Number(feeAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* If Razorpay / Cashfree is active, show Method Switcher Tabs */}
            {(activeGwKey === 'razorpay' || activeGwKey === 'cashfree') && (
              <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'upi' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'card' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'netbanking' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Net Banking</span>
                </button>
              </div>
            )}

            {/* METHOD 1: UPI SCAN & PAY (All Gateways support this) */}
            {paymentMethod === 'upi' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
                    <QRCodeSVG
                      value={upiIntentString}
                      size={96}
                      level="M"
                    />
                  </div>
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
                      Instant NPCI Dynamic QR
                    </span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Scan using Google Pay, PhonePe, Paytm, or BHIM. Amount: <strong className="text-white font-mono">₹{Number(feeAmount).toLocaleString('en-IN')}</strong>
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <code className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono border border-slate-700">
                        {upiId}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <a
                    href={upiIntentString}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-700"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Open in Mobile UPI App (GPay / PhonePe)</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-medium mb-1">
                    Bank UTR / Transaction Reference (Optional if simulating)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 629183049102"
                    value={utrInput}
                    onChange={(e) => setUtrInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            )}

            {/* METHOD 2: CARDS (Razorpay / Cashfree) */}
            {paymentMethod === 'card' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            )}

            {/* METHOD 3: NETBANKING (Razorpay / Cashfree) */}
            {paymentMethod === 'netbanking' && (
              <div className="space-y-3 text-xs">
                <span className="text-slate-400 block">Popular Indian Banks:</span>
                <div className="grid grid-cols-2 gap-2">
                  {['State Bank of India (SBI)', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Mizoram Rural Bank', 'Punjab National Bank'].map(bank => (
                    <button
                      key={bank}
                      type="button"
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-left text-slate-300 hover:text-white transition flex items-center gap-2"
                    >
                      <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="truncate text-[11px]">{bank}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>256-bit SSL Encrypted</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCompleteOnlinePayment}
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying Payment...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Pay ₹{Number(feeAmount).toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Payment Success Confirmation View */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white font-['Outfit']">
                Fee Payment Successful &amp; Recorded!
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Transaction settled via <strong className="text-cyan-400">{activeGw.name}</strong>. Official Clearance Slip generated.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2 max-w-sm mx-auto text-left">
              <div className="flex justify-between text-slate-400">
                <span>Receipt Number:</span>
                <span className="font-mono font-bold text-white">{lastPaymentRecord?.receiptNo}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Student:</span>
                <span className="text-white">{student?.firstName} {student?.lastName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Amount Paid:</span>
                <span className="font-mono font-bold text-emerald-400">₹{Number(feeAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Bank UTR:</span>
                <span className="font-mono text-cyan-300 text-[11px]">{lastPaymentRecord?.transactionUtr}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20"
              >
                Done &amp; Return to Portal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
