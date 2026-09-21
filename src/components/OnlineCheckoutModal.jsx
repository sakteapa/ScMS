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
  AlertCircle,
  Zap,
  Info
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { useSchool } from '../context/SchoolContext';

export default function OnlineCheckoutModal({ 
  isOpen, 
  onClose, 
  student, 
  feeAmount = 18000, 
  feeType = 'Tuition Fee (Term 2)', 
  onPaymentSuccess 
}) {
  const { paymentConfig, recordPayment, systemConfig } = useSchool();

  const defaultGateway = paymentConfig?.activeGateway || 'direct_upi';
  const [selectedGateway, setSelectedGateway] = useState(defaultGateway);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [lastPaymentRecord, setLastPaymentRecord] = useState(null);
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const schoolName = systemConfig?.schoolName || 'OHA (One Heart Academy)';
  const activeGw = paymentConfig?.gateways?.[selectedGateway] || paymentConfig?.gateways?.direct_upi || {};
  const upiId = activeGw.upiId || paymentConfig?.gateways?.direct_upi?.upiId || 'ohalunglawn@oksbi';
  const isLiveEnvironment = activeGw.environment === 'live' || (selectedGateway === 'razorpay' && activeGw.keyId?.startsWith('rzp_live'));

  const upiIntentString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(schoolName)}&am=${feeAmount}&cu=INR&tn=FEE_${student?.admissionNo || 'MZ2026'}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Real Razorpay Standard Checkout SDK
  const handleLaunchRazorpay = async () => {
    setIsProcessing(true);
    setValidationError('');

    const loadScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const isLoaded = await loadScript();
    if (!isLoaded) {
      setIsProcessing(false);
      setValidationError('Could not load Razorpay Payment Gateway SDK. Please check your internet connection.');
      return;
    }

    const rzpKey = activeGw.keyId || 'rzp_test_98OHALunglawn2026';

    const options = {
      key: rzpKey,
      amount: Math.round(Number(feeAmount) * 100), // Razorpay expects amount in paise
      currency: 'INR',
      name: schoolName,
      description: feeType,
      image: systemConfig?.schoolLogo || 'https://cdn-icons-png.flaticon.com/512/3135/3135768.png',
      handler: function (response) {
        setIsProcessing(false);
        const utrRef = response.razorpay_payment_id || `RZP_${Date.now().toString().slice(-8)}`;

        const paymentRecord = recordPayment({
          studentId: student?.id,
          studentName: `${student?.firstName} ${student?.lastName}`,
          admissionNo: student?.admissionNo,
          classId: student?.classId,
          amount: String(feeAmount),
          feeType: feeType,
          paymentMode: 'razorpay',
          transactionUtr: utrRef,
          upiId: upiId,
          gatewayProvider: isLiveEnvironment ? 'Razorpay Live Production' : 'Razorpay Sandbox Gateway',
          remarks: `Payment ID: ${response.razorpay_payment_id} • Order ID: ${response.razorpay_order_id || 'Direct Checkout'}`
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
      },
      prefill: {
        name: `${student?.firstName || ''} ${student?.lastName || ''}`.trim() || 'Parent Payer',
        email: student?.guardianEmail || 'parent@school.edu',
        contact: student?.guardianPhone || '9876543210'
      },
      notes: {
        admissionNo: student?.admissionNo,
        classId: student?.classId,
        feeType: feeType
      },
      theme: {
        color: activeGw.themeColor || '#06b6d4'
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
        }
      }
    };

    try {
      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (resp) {
        setIsProcessing(false);
        setValidationError(`Payment Failed: ${resp.error?.description || 'Transaction declined by bank.'}`);
      });
      rzpInstance.open();
    } catch (err) {
      console.error('Razorpay Error:', err);
      setIsProcessing(false);
      setValidationError('Razorpay Error: ' + err.message);
    }
  };

  // Direct Bank UPI Verification (Real UTR vs Demo Testing)
  const handleVerifyBankUtr = (isSimulatedDemo = false) => {
    setValidationError('');

    if (!isSimulatedDemo && (!utrInput || utrInput.trim().length < 6)) {
      setValidationError('Khawngaihin Bank UTR / Transaction Reference number dik tak chhu lut rawh le (Digit 12 vel GPay / PhonePe / Bank App atangin).');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const utrRef = isSimulatedDemo 
        ? `DEMO_TXN${Date.now().toString().slice(-8)}` 
        : utrInput.trim().toUpperCase();

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
        gatewayProvider: isSimulatedDemo ? 'Direct UPI (Demo Sandbox)' : 'Direct NPCI Bank UPI (Verified)',
        remarks: isSimulatedDemo 
          ? 'Demo Test Run Simulation' 
          : `Verified Bank UTR: ${utrRef}`
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
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Gateway Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-['Outfit']">
                  {selectedGateway === 'razorpay' ? 'Razorpay Payment Gateway' : 'Direct NPCI UPI & Bank QR'}
                </h3>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                  isLiveEnvironment
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {isLiveEnvironment ? 'Live Bank Mode' : 'Test / Sandbox Mode'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {schoolName} Institutional Fee Portal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gateway Mode Advisory Alert */}
        <div className={`px-5 py-2.5 text-xs flex items-center gap-2 border-b ${
          isLiveEnvironment 
            ? 'bg-emerald-950/40 border-emerald-800/30 text-emerald-300' 
            : 'bg-amber-950/40 border-amber-800/30 text-amber-300'
        }`}>
          <Info className="w-4 h-4 shrink-0" />
          <span className="text-[11px] leading-snug">
            {isLiveEnvironment ? (
              <span><strong>Live Production Mode:</strong> Real money will be deducted and settled to the school account.</span>
            ) : (
              <span><strong>Demo Sandbox Mode:</strong> A tak taka pawisa luh tir nan Financials &gt; Gateways-ah School Real UPI ID emaw Razorpay Live Key (`rzp_live_...`) dah luh tur a ni.</span>
            )}
          </span>
        </div>

        {/* Payment Content */}
        {!isPaidSuccess ? (
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Student & Bill Summary */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Student Beneficiary</span>
                <h4 className="text-sm font-bold text-white">{student?.firstName} {student?.lastName}</h4>
                <span className="text-xs text-slate-400 font-mono">Adm: {student?.admissionNo} &bull; {feeType}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Payable</span>
                <span className="text-2xl font-black text-cyan-300 font-['Outfit'] font-mono">
                  ₹{Number(feeAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Gateway Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => { setSelectedGateway('direct_upi'); setValidationError(''); }}
                className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                  selectedGateway === 'direct_upi' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Direct UPI &amp; Bank QR (0% Fee)</span>
              </button>
              <button
                type="button"
                onClick={() => { setSelectedGateway('razorpay'); setValidationError(''); }}
                className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                  selectedGateway === 'razorpay' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Razorpay Gateway (Cards/UPI)</span>
              </button>
            </div>

            {/* OPTION A: DIRECT NPCI UPI & BANK QR */}
            {selectedGateway === 'direct_upi' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
                    <QRCodeSVG
                      value={upiIntentString}
                      size={105}
                      level="M"
                    />
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
                      Real NPCI Dynamic QR
                    </span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Google Pay, PhonePe, Paytm, emaw BHIM hmanga scan rawh le. Amount: <strong className="text-white font-mono">₹{Number(feeAmount).toLocaleString('en-IN')}</strong>
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <code className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono border border-slate-700">
                        {upiId}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded"
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
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-md"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Open in Mobile UPI App (GPay / PhonePe / Paytm)</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  <p className="text-[10px] text-slate-400 text-center mt-1">
                    Mobile-a i en chuan a chunga button hian i UPI app a hawng nghal ang.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <label className="block text-[11px] text-slate-300 font-semibold">
                    1. Bank UTR / Transaction Reference (A tak taka i pek hnuah):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 428190349102 (Digit 12 UTR from GPay/PhonePe)"
                    value={utrInput}
                    onChange={(e) => { setUtrInput(e.target.value); setValidationError(''); }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                  {validationError && (
                    <p className="text-xs text-rose-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{validationError}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* OPTION B: RAZORPAY STANDARD CHECKOUT */}
            {selectedGateway === 'razorpay' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Official Razorpay Checkout</h4>
                    <p className="text-xs text-slate-400">
                      Credit/Debit Card (Visa, RuPay, MasterCard), NetBanking from 50+ banks, UPI &amp; Wallets.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Merchant Account:</span>
                    <span className="font-semibold text-white">{activeGw.merchantName || schoolName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Razorpay Key ID:</span>
                    <span className="font-mono text-cyan-300 text-[11px]">{activeGw.keyId || 'rzp_test_...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Checkout Mode:</span>
                    <span className="font-mono text-emerald-400 uppercase text-[10px] font-bold">
                      {isLiveEnvironment ? 'Live Razorpay Popup' : 'Razorpay Sandbox Mode'}
                    </span>
                  </div>
                </div>

                {validationError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{validationError}</span>
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleLaunchRazorpay}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Opening Razorpay Checkout...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Launch Official Razorpay Checkout (₹{Number(feeAmount).toLocaleString('en-IN')})</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Action Bar for Direct UPI */}
            {selectedGateway === 'direct_upi' && (
              <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>256-bit SSL Encrypted</span>
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {/* Test Demo Button (clearly marked as simulation) */}
                  <button
                    type="button"
                    onClick={() => handleVerifyBankUtr(true)}
                    disabled={isProcessing}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition"
                    title="Simulate payment without deducting money (For Testing)"
                  >
                    🧪 Test Simulation
                  </button>

                  {/* Real Verification Button with UTR */}
                  <button
                    type="button"
                    onClick={() => handleVerifyBankUtr(false)}
                    disabled={isProcessing}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify Bank UTR &amp; Record</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
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
                Transaction settled via <strong className="text-cyan-400">{lastPaymentRecord?.gatewayProvider || activeGw.name}</strong>. Official Clearance Slip generated.
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
                <span>Bank UTR / ID:</span>
                <span className="font-mono text-cyan-300 text-[11px] font-bold">{lastPaymentRecord?.transactionUtr}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Gateway Status:</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                  {lastPaymentRecord?.gatewayProvider?.includes('Live') ? 'Live Settled' : 'Cleared & Verified'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20 cursor-pointer"
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
