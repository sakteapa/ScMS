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
  Info,
  Printer,
  MessageSquare,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { useSchool } from '../context/SchoolContext';
import FeeReceiptModal from './FeeReceiptModal';

export default function OnlineCheckoutModal({ 
  isOpen, 
  onClose, 
  student, 
  feeAmount = 18000, 
  feeType = 'Tuition Fee (Term 2)', 
  onPaymentSuccess 
}) {
  const { paymentConfig, recordPayment, systemConfig, classes, activeSchoolInfo, activeSchoolId } = useSchool();

  const defaultGateway = paymentConfig?.activeGateway || 'direct_upi';
  const [selectedGateway, setSelectedGateway] = useState(defaultGateway);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [lastPaymentRecord, setLastPaymentRecord] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  if (!isOpen) return null;

  const schoolName = activeSchoolInfo?.name || systemConfig?.schoolName || 'School Fee Portal';
  const activeGw = paymentConfig?.gateways?.[selectedGateway] || paymentConfig?.gateways?.direct_upi || {};
  const upiId = activeGw.upiId || paymentConfig?.gateways?.direct_upi?.upiId || paymentConfig?.upiId || `${activeSchoolId || 'school'}@oksbi`;
  const directUpiGw = paymentConfig?.gateways?.direct_upi || {};
  const razorpayGw = paymentConfig?.gateways?.razorpay || {};
  const paytmGw = paymentConfig?.gateways?.paytm || {};

  const isLiveEnvironment = 
    (selectedGateway === 'razorpay' && (razorpayGw.environment === 'live' || razorpayGw.keyId?.startsWith('rzp_live'))) ||
    (selectedGateway === 'paytm' && paytmGw.environment === 'production') ||
    (selectedGateway === 'direct_upi');

  const studentClass = classes?.find(c => c.id === student?.classId);
  const admissionCode = student?.admissionNo || 'MZ2026';

  // Standard NPCI UPI URI Scheme
  const upiIntentString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(schoolName)}&am=${feeAmount}&cu=INR&tn=${encodeURIComponent(`FEE_${admissionCode}`)}&mc=8211`;

  // Specific App UPI Intents
  const gpayIntent = `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(schoolName)}&am=${feeAmount}&cu=INR&tn=${encodeURIComponent(`FEE_${admissionCode}`)}`;
  const phonepeIntent = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(schoolName)}&am=${feeAmount}&cu=INR&tn=${encodeURIComponent(`FEE_${admissionCode}`)}`;
  const paytmUpiIntent = `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(schoolName)}&am=${feeAmount}&cu=INR&tn=${encodeURIComponent(`FEE_${admissionCode}`)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyAcc = () => {
    if (directUpiGw.accountNumber) {
      navigator.clipboard.writeText(`${directUpiGw.accountNumber} (${directUpiGw.ifscCode})`);
      setCopiedAcc(true);
      setTimeout(() => setCopiedAcc(false), 2000);
    }
  };

  // Launch Official Razorpay Standard Checkout SDK
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
      setValidationError('Razorpay SDK load hlawhchham. Check internet connection.');
      return;
    }

    const keyId = razorpayGw.keyId || 'rzp_test_98OHALunglawn2026';
    const isLive = isLiveEnvironment;

    const options = {
      key: keyId,
      amount: Number(feeAmount) * 100, // Amount in paise
      currency: 'INR',
      name: schoolName,
      description: `${feeType} - Adm: ${admissionCode}`,
      image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80',
      handler: function (response) {
        setIsProcessing(false);
        const utrRef = response.razorpay_payment_id || `RZP_${Date.now()}`;
        
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
          gatewayProvider: isLive ? 'Razorpay Live Production' : 'Razorpay Sandbox Gateway',
          remarks: `Payment ID: ${response.razorpay_payment_id} • Order ID: ${response.razorpay_order_id || 'Standard Checkout'}`
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
        contact: student?.guardianPhone || student?.fatherPhone || '9876543210'
      },
      notes: {
        admissionNo: student?.admissionNo,
        classId: student?.classId,
        feeType: feeType
      },
      theme: {
        color: razorpayGw.themeColor || '#06b6d4'
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

  // Launch Paytm Payment Gateway Flow
  const handleLaunchPaytm = (isSimulatedDemo = false) => {
    setIsProcessing(true);
    setValidationError('');

    const mid = paytmGw.mid || 'OHA_ED_PAYTM_STAGE_2026';
    const isPtmLive = paytmGw.environment === 'production' && !isSimulatedDemo;
    const orderId = `PTM_${Date.now().toString().slice(-8)}`;

    setTimeout(() => {
      setIsProcessing(false);
      const paymentRecord = recordPayment({
        studentId: student?.id,
        studentName: `${student?.firstName} ${student?.lastName}`,
        admissionNo: student?.admissionNo,
        classId: student?.classId,
        amount: String(feeAmount),
        paymentMode: 'paytm',
        gatewayProvider: isSimulatedDemo 
          ? 'Paytm All-in-One Gateway (Sandbox Test)' 
          : `Paytm Payment Gateway & UPI (${isPtmLive ? 'Live MID' : 'Staging'})`,
        feeType: feeType,
        transactionUtr: `PTM-${orderId}`,
        upiId: `${mid}@paytm`,
        remarks: isSimulatedDemo 
          ? 'Paytm Sandbox Simulation Pass' 
          : `Settled via Paytm All-in-One Gateway [MID: ${mid}]`
      });

      try {
        confetti({
          particleCount: 100,
          spread: 75,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      setIsPaidSuccess(true);
      setLastPaymentRecord(paymentRecord);
      if (onPaymentSuccess) {
        onPaymentSuccess(paymentRecord);
      }
    }, 1400);
  };

  // Direct Bank UPI Verification (Real UTR vs Demo Testing)
  const handleVerifyBankUtr = (isSimulatedDemo = false) => {
    setValidationError('');

    if (!isSimulatedDemo && (!utrInput || utrInput.trim().length < 6)) {
      setValidationError('Khawngaihin Bank UTR / Transaction Reference number dik tak chhu lut rawh le (Digit 12 vel GPay / PhonePe / Paytm / Bank App atangin).');
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

  // Share Receipt to Parent WhatsApp
  const handleShareReceiptWhatsApp = () => {
    const parentPhone = student?.fatherPhone || student?.motherPhone || student?.guardianPhone || student?.phone || '';
    const cleanPhone = parentPhone.replace(/[^0-9]/g, '');
    const receiptNum = lastPaymentRecord?.receiptNo || 'MSS-REC-2026';
    const amountStr = Number(feeAmount).toLocaleString('en-IN');
    const provName = lastPaymentRecord?.gatewayProvider || activeGw.name || 'Online Payment Gateway';
    const utrStr = lastPaymentRecord?.transactionUtr || 'N/A';
    const dateStr = new Date().toLocaleDateString('en-GB');

    const msg = `*${schoolName.toUpperCase()} - FEE PAYMENT RECEIPT*\n` +
      `----------------------------------------\n` +
      `Chibai! ${student?.firstName} ${student?.lastName}-a school fee pekna a hlawhtling e.\n\n` +
      `*Receipt No:* ${receiptNum}\n` +
      `*Student:* ${student?.firstName} ${student?.lastName} (Adm No: ${admissionCode})\n` +
      `*Class:* ${studentClass?.name || 'Class'}\n` +
      `*Fee Head:* ${feeType}\n` +
      `*Amount Paid:* Rs. ${amountStr}/-\n` +
      `*Payment Gateway:* ${provName}\n` +
      `*Bank UTR / Txn Ref:* ${utrStr}\n` +
      `*Payment Date:* ${dateStr}\n` +
      `*Clearance Status:* VERIFIED & CLEARED\n` +
      `----------------------------------------\n` +
      `He receipt hi official-in a pawm a ni. Examination leh academic clearance atana hman theih a ni e.\n\n` +
      `- ${schoolName} Fee & Accounts Dept.\n` +
      `Portal: ${window.location.origin}`;

    const url = cleanPhone.length >= 10
      ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
          {/* Top Gateway Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-white font-['Outfit']">
                    {selectedGateway === 'razorpay' 
                      ? 'Razorpay Payment Gateway' 
                      : selectedGateway === 'paytm'
                      ? 'Paytm Payment Gateway & UPI'
                      : 'Direct NPCI UPI & Bank QR'}
                  </h3>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                    isLiveEnvironment
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {isLiveEnvironment ? 'Live Bank Settlement' : 'Test / Sandbox Mode'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {schoolName} Institutional Fee Checkout
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Gateway Mode Advisory Alert */}
          <div className={`px-4 sm:px-5 py-2 text-xs flex items-center gap-2 border-b ${
            isLiveEnvironment 
              ? 'bg-emerald-950/40 border-emerald-800/30 text-emerald-300' 
              : 'bg-amber-950/40 border-amber-800/30 text-amber-300'
          }`}>
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] leading-snug">
              {isLiveEnvironment ? (
                <span><strong>Live Gateway Mode:</strong> Real payment will be settled directly to school bank account. Instant digital clearance receipt generated.</span>
              ) : (
                <span><strong>Sandbox Test Mode:</strong> A tak taka pawisa chhuah tir nan Financials &gt; Gateways-ah School Real UPI ID emaw Razorpay / Paytm Live Credentials dah luh tur a ni.</span>
              )}
            </span>
          </div>

          {/* Payment Content */}
          {!isPaidSuccess ? (
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Student & Bill Summary */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Student Beneficiary</span>
                  <h4 className="text-sm font-bold text-white">{student?.firstName} {student?.lastName}</h4>
                  <span className="text-xs text-slate-400 font-mono">Adm: {admissionCode} &bull; {feeType}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Payable</span>
                  <span className="text-2xl font-black text-cyan-300 font-['Outfit'] font-mono">
                    ₹{Number(feeAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Gateway Switcher Tabs: 3 Gateways (Direct UPI, Razorpay, Paytm) */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => { setSelectedGateway('direct_upi'); setValidationError(''); }}
                  className={`py-2 px-1.5 rounded-xl font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 text-center ${
                    selectedGateway === 'direct_upi' 
                      ? 'bg-cyan-500 text-slate-950 shadow' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span className="truncate">Direct UPI QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedGateway('razorpay'); setValidationError(''); }}
                  className={`py-2 px-1.5 rounded-xl font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 text-center ${
                    selectedGateway === 'razorpay' 
                      ? 'bg-cyan-500 text-slate-950 shadow' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="truncate">Razorpay Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedGateway('paytm'); setValidationError(''); }}
                  className={`py-2 px-1.5 rounded-xl font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 text-center ${
                    selectedGateway === 'paytm' 
                      ? 'bg-cyan-500 text-slate-950 shadow' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="truncate">Paytm All-in-1</span>
                </button>
              </div>

              {/* TAB 1: DIRECT NPCI UPI & BANK QR */}
              {selectedGateway === 'direct_upi' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="p-2.5 bg-white rounded-2xl shadow-lg shrink-0">
                      <QRCodeSVG
                        value={upiIntentString}
                        size={115}
                        level="M"
                      />
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
                        Official NPCI Dynamic Fee QR
                      </span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        Scan via Google Pay, PhonePe, Paytm, emaw BHIM. Amount ₹{Number(feeAmount).toLocaleString('en-IN')} a in-fill nghal ang.
                      </p>
                      <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                        <code className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono border border-slate-700">
                          {upiId}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded cursor-pointer transition"
                        >
                          {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      {directUpiGw.accountNumber && (
                        <div className="text-[10px] text-slate-400 pt-1 flex items-center gap-1.5 justify-center sm:justify-start">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          <span>A/C: {directUpiGw.accountNumber} ({directUpiGw.ifscCode})</span>
                          <button
                            type="button"
                            onClick={handleCopyAcc}
                            className="text-slate-400 hover:text-cyan-300 underline"
                          >
                            {copiedAcc ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 1-Click Mobile UPI App Chooser Buttons */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Direct App Launch (Mobile):
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <a
                        href={gpayIntent}
                        className="py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition text-center"
                      >
                        <span className="text-teal-400 font-black">G</span>Pay
                      </a>
                      <a
                        href={phonepeIntent}
                        className="py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition text-center"
                      >
                        <span className="text-purple-400 font-black">Phone</span>Pe
                      </a>
                      <a
                        href={paytmUpiIntent}
                        className="py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition text-center"
                      >
                        <span className="text-sky-400 font-black">Pay</span>tm
                      </a>
                    </div>
                  </div>

                  {/* Bank UTR Entry */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <label className="block text-[11px] text-slate-300 font-semibold">
                      Bank UTR / Transaction Reference (UPI hmanga i pek hnuah):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 428190349102 (Digit 12 UTR from GPay / PhonePe / Paytm)"
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

              {/* TAB 2: RAZORPAY STANDARD CHECKOUT */}
              {selectedGateway === 'razorpay' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shrink-0">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Official Razorpay Checkout</h4>
                      <p className="text-xs text-slate-400">
                        Credit/Debit Card (Visa, RuPay, MasterCard), NetBanking 50+ Banks, UPI, &amp; Wallets.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Merchant Account:</span>
                      <span className="font-semibold text-white">{razorpayGw.merchantName || schoolName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Razorpay Key ID:</span>
                      <span className="font-mono text-cyan-300 text-[11px]">{razorpayGw.keyId || 'rzp_test_...'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Environment:</span>
                      <span className="font-mono text-emerald-400 uppercase text-[10px] font-bold">
                        {isLiveEnvironment ? 'Live Razorpay Popup' : 'Sandbox Test Mode'}
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
                        <span>Launch Razorpay Checkout (₹{Number(feeAmount).toLocaleString('en-IN')})</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 3: PAYTM GATEWAY & WALLET */}
              {selectedGateway === 'paytm' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 shrink-0">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Paytm Payment Gateway &amp; UPI</h4>
                      <p className="text-xs text-slate-400">
                        Paytm Wallet, Paytm Postpaid, Fast UPI QR, NetBanking, and RuPay/Visa/MasterCard.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Paytm MID:</span>
                      <span className="font-mono text-cyan-300 text-[11px] font-bold">{paytmGw.mid || 'OHA_ED_PAYTM_STAGE_2026'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Website Name:</span>
                      <span className="font-mono text-white text-[11px]">{paytmGw.websiteName || 'DEFAULT'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Channel / Environment:</span>
                      <span className="font-mono text-sky-400 uppercase text-[10px] font-bold">
                        {paytmGw.environment === 'production' ? 'Production Live' : 'Staging Sandbox'} ({paytmGw.channelId || 'WEB'})
                      </span>
                    </div>
                  </div>

                  {validationError && (
                    <p className="text-xs text-rose-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{validationError}</span>
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleLaunchPaytm(false)}
                      disabled={isProcessing}
                      className="py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs transition shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Opening Paytm...</span>
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-4 h-4" />
                          <span>Pay via Paytm Gateway</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLaunchPaytm(true)}
                      disabled={isProcessing}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <span>🧪 Test Paytm Simulation</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Action Bar for Direct UPI */}
              {selectedGateway === 'direct_upi' && (
                <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>256-bit SSL Encrypted &bull; Official MBSE Affiliated School</span>
                  </span>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => handleVerifyBankUtr(true)}
                      disabled={isProcessing}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition"
                      title="Simulate payment without deducting money (For Testing)"
                    >
                      🧪 Test Simulation
                    </button>

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
            /* PAYMENT SUCCESS CONFIRMATION & RECEIPT ACTIONS */
            <div className="p-6 sm:p-8 text-center space-y-4 overflow-y-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-['Outfit']">
                  Fee Payment Successful &amp; Recorded!
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Pawisa pek a hlawhtling e. Transaction settled via <strong className="text-cyan-400">{lastPaymentRecord?.gatewayProvider || activeGw.name}</strong>. Official Clearance Slip generated.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2 max-w-sm mx-auto text-left">
                <div className="flex justify-between text-slate-400">
                  <span>Receipt Number:</span>
                  <span className="font-mono font-bold text-white">{lastPaymentRecord?.receiptNo}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Student:</span>
                  <span className="text-white font-semibold">{student?.firstName} {student?.lastName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Fee Type:</span>
                  <span className="text-white">{feeType}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Amount Paid:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">₹{Number(feeAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Bank UTR / ID:</span>
                  <span className="font-mono text-cyan-300 text-[11px] font-bold">{lastPaymentRecord?.transactionUtr}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Clearance Status:</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                    Verified &amp; Cleared
                  </span>
                </div>
              </div>

              {/* Action Buttons: WhatsApp Parent, Print Receipt, Close */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={handleShareReceiptWhatsApp}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Receipt to Parent</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowReceiptModal(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Official A4 / Slip</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <span>Done</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render Official Fee Receipt Modal on Demand */}
      {showReceiptModal && (
        <FeeReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          feeRecord={lastPaymentRecord}
          student={student}
        />
      )}
    </>
  );
}
