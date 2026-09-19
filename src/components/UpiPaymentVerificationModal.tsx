import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Printer,
  Sparkles,
  ArrowRight,
  Info,
  Clock,
  Send,
  Building2,
} from 'lucide-react';
import { FeeRecord, FirestoreStudent, FeeTransaction } from '../types';
import {
  prepareFeeUpiPaymentIntent,
  verifyAndRecordUpiPayment,
  validateUtrNumber,
  SupportedUpiApp,
  DEFAULT_UPI_CONFIG,
  UpiPaymentIntent,
} from '../lib/upiPaymentService';

interface UpiPaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeRecord: FeeRecord | null;
  student?: FirestoreStudent | null;
  allFeeRecords: FeeRecord[];
  allStudents: FirestoreStudent[];
  onPaymentSuccess?: (updatedFee: FeeRecord, transaction: FeeTransaction) => void;
  onOpenReceipt?: (fee: FeeRecord, transaction: FeeTransaction) => void;
}

type ModalTab = 'qr' | 'verify' | 'audit';

export const UpiPaymentVerificationModal: React.FC<UpiPaymentVerificationModalProps> = ({
  isOpen,
  onClose,
  feeRecord,
  student,
  allFeeRecords,
  allStudents,
  onPaymentSuccess,
  onOpenReceipt,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('qr');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [customVpa, setCustomVpa] = useState(DEFAULT_UPI_CONFIG.vpa);
  const [intent, setIntent] = useState<UpiPaymentIntent | null>(null);
  const [isLoadingQr, setIsLoadingQr] = useState(false);

  // Verification Form State
  const [utrNumber, setUtrNumber] = useState('');
  const [selectedApp, setSelectedApp] = useState<SupportedUpiApp>('Google Pay');
  const [verifyAmount, setVerifyAmount] = useState<number>(0);
  const [payerName, setPayerName] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [verifiedBy, setVerifiedBy] = useState('Accounts & Bursar Office');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<{
    fee: FeeRecord;
    transaction: FeeTransaction;
  } | null>(null);

  // Outstanding Balance
  const balanceDue = useMemo(() => {
    if (!feeRecord) return 0;
    return Math.max(
      0,
      feeRecord.balanceAmount !== undefined
        ? feeRecord.balanceAmount
        : feeRecord.totalAmount - feeRecord.paidAmount
    );
  }, [feeRecord]);

  // Initialize form when opened or feeRecord changes
  useEffect(() => {
    if (feeRecord && isOpen) {
      const defaultAmt = balanceDue > 0 ? balanceDue : feeRecord.totalAmount;
      setCustomAmount(defaultAmt);
      setVerifyAmount(defaultAmt);
      setPayerName(student?.name ? `Parent of ${student.name}` : '');
      setPayerPhone(student?.parentPhone || '');
      setNotes(`UPI payment for ${feeRecord.feeMonth} Tuition Fee (Roll #${feeRecord.rollNo})`);
      setValidationError(null);
      setSuccessReceipt(null);
      setUtrNumber('');
      setActiveTab('qr');
    }
  }, [feeRecord, isOpen, balanceDue, student]);

  // Generate / Regenerate dynamic UPI QR code
  useEffect(() => {
    if (!feeRecord || !isOpen) return;

    let isMounted = true;
    setIsLoadingQr(true);

    const targetAmount = customAmount > 0 ? customAmount : balanceDue;

    prepareFeeUpiPaymentIntent(feeRecord, targetAmount, customVpa)
      .then((generatedIntent) => {
        if (isMounted) {
          setIntent(generatedIntent);
          setIsLoadingQr(false);
        }
      })
      .catch((err) => {
        console.error('Error generating UPI QR code:', err);
        if (isMounted) setIsLoadingQr(false);
      });

    return () => {
      isMounted = false;
    };
  }, [feeRecord, isOpen, customAmount, customVpa, balanceDue]);

  if (!isOpen || !feeRecord) return null;

  // Handle Copy VPA
  const handleCopyVpa = () => {
    if (!intent) return;
    navigator.clipboard.writeText(intent.vpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  // Handle Copy URI
  const handleCopyUri = () => {
    if (!intent) return;
    navigator.clipboard.writeText(intent.upiUri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2000);
  };

  // Handle Download QR
  const handleDownloadQr = () => {
    if (!intent?.qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `UPI-QR-${feeRecord.studentName.replace(/\s+/g, '_')}-Roll${feeRecord.rollNo}.png`;
    link.href = intent.qrDataUrl;
    link.click();
  };

  // Generate Random Demo UTR for Quick Testing
  const handleGenerateDemoUtr = () => {
    const random12 = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setUtrNumber(random12);
    setValidationError(null);
  };

  // Handle Submit Verification
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const validation = validateUtrNumber(utrNumber);
    if (!validation.isValid) {
      setValidationError(validation.message || 'Invalid UTR format');
      return;
    }

    if (verifyAmount <= 0) {
      setValidationError('Please enter a valid payment amount greater than ₹0');
      return;
    }

    setIsSubmitting(true);

    try {
      const { updatedFee, transaction } = await verifyAndRecordUpiPayment({
        feeRecord,
        utrNumber,
        paidAmount: Number(verifyAmount),
        upiApp: selectedApp,
        payerName,
        payerPhone,
        verifiedBy,
        notes,
        allFeeRecords,
        allStudents,
      });

      setSuccessReceipt({ fee: updatedFee, transaction });
      if (onPaymentSuccess) {
        onPaymentSuccess(updatedFee, transaction);
      }
    } catch (err: any) {
      console.error('Failed to verify UPI payment:', err);
      setValidationError(err.message || 'Payment verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gray-900 border border-gray-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gray-800/90 border-b border-gray-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  UPI & Google Pay Payment Gateway
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono border border-emerald-500/30">
                  col: fee_records
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Instant UPI QR generation, UTR settlement & real-time fee clearance
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student & Fee Snapshot Bar */}
        <div className="px-5 py-3 bg-gray-850/60 border-b border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="text-gray-400 text-[11px]">Student Name</div>
            <div className="font-bold text-white truncate">{feeRecord.studentName}</div>
            <div className="text-[10px] text-indigo-400 font-mono">
              Roll #{feeRecord.rollNo} • {feeRecord.className}
            </div>
          </div>

          <div>
            <div className="text-gray-400 text-[11px]">Fee Period</div>
            <div className="font-semibold text-gray-200">{feeRecord.feeMonth}</div>
            <div className="text-[10px] text-gray-400">{feeRecord.feeType || 'Tuition'}</div>
          </div>

          <div>
            <div className="text-gray-400 text-[11px]">Total Billed</div>
            <div className="font-mono font-bold text-gray-200">
              ₹{feeRecord.totalAmount.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400">
              Paid: ₹{feeRecord.paidAmount.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-gray-400 text-[11px]">Outstanding Due</div>
            <div
              className={`font-mono font-bold text-sm ${
                balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              ₹{balanceDue.toLocaleString()}
            </div>
            <span
              className={`inline-flex px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                feeRecord.status === 'Paid'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : feeRecord.status === 'Overdue'
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {feeRecord.status}
            </span>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        {!successReceipt && (
          <div className="px-5 border-b border-gray-800 bg-gray-900/60 flex space-x-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('qr')}
              className={`py-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'qr'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              Dynamic UPI QR & Pay Links
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('verify')}
              className={`py-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'verify'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Verify UTR & Confirm Payment
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`py-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Payment History ({feeRecord.paymentHistory?.length || 0})
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 max-h-[72vh] overflow-y-auto">
          {/* ===================== SUCCESS SCREEN ===================== */}
          {successReceipt ? (
            <div className="text-center py-6 px-4 space-y-5">
              <div className="inline-flex p-3.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="w-12 h-12 animate-bounce" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-white">Payment Verified & Settled!</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                  Fee status shifted from{' '}
                  <span className="text-rose-400 font-semibold">{feeRecord.status}</span> to{' '}
                  <span className="text-emerald-400 font-semibold font-mono">Paid</span> in Firestore
                  collection <code className="text-indigo-300">fee_records</code>. Student profile
                  clearance has been updated.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="max-w-md mx-auto bg-gray-800/80 border border-gray-700 rounded-xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between pb-2 border-b border-gray-700">
                  <span className="text-gray-400">Official Receipt No</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {successReceipt.transaction.receiptNo}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Settlement Amount</span>
                  <span className="font-mono font-bold text-white">
                    ₹{successReceipt.transaction.amount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">UPI Transaction ID (UTR)</span>
                  <span className="font-mono font-bold text-purple-300">
                    {successReceipt.transaction.referenceNumber}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Payment App / Mode</span>
                  <span className="text-gray-200">{successReceipt.transaction.paymentMethod}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Remaining Balance</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ₹{(successReceipt.fee.balanceAmount || 0).toLocaleString()}{' '}
                    {successReceipt.fee.balanceAmount === 0 ? '(CLEARED)' : ''}
                  </span>
                </div>

                <div className="flex justify-between pt-1 border-t border-gray-700/60 text-[11px]">
                  <span className="text-gray-400">Verified By</span>
                  <span className="text-gray-300">{successReceipt.transaction.receivedBy}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {onOpenReceipt && (
                  <button
                    type="button"
                    onClick={() => onOpenReceipt(successReceipt.fee, successReceipt.transaction)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    Print Official Receipt Voucher
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSuccessReceipt(null);
                    setUtrNumber('');
                    setActiveTab('verify');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors cursor-pointer"
                >
                  Record Another Payment
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-700/80 hover:bg-gray-700 text-gray-300 transition-colors cursor-pointer"
                >
                  Close Gateway
                </button>
              </div>
            </div>
          ) : null}

          {/* ===================== TAB 1: DYNAMIC UPI QR & LINKS ===================== */}
          {!successReceipt && activeTab === 'qr' && (
            <div className="space-y-6">
              {/* Amount & VPA Quick Config */}
              <div className="bg-gray-800/60 border border-gray-700/80 rounded-xl p-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                      Payment Amount to Charge (₹)
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="1"
                          max={feeRecord.totalAmount}
                          value={customAmount}
                          onChange={(e) => setCustomAmount(Number(e.target.value))}
                          className="pl-7 pr-3 py-1.5 w-32 rounded-lg bg-gray-900 border border-gray-700 text-white font-mono text-sm font-bold focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      {balanceDue > 0 && customAmount !== balanceDue && (
                        <button
                          type="button"
                          onClick={() => setCustomAmount(balanceDue)}
                          className="px-2.5 py-1 rounded-md text-[11px] bg-gray-700 hover:bg-gray-600 text-purple-300 cursor-pointer"
                        >
                          Reset to Full Due (₹{balanceDue})
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                      Institutional UPI VPA (School ID)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={customVpa}
                        onChange={(e) => setCustomVpa(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-indigo-300 font-mono text-xs w-48 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={handleCopyVpa}
                        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors cursor-pointer"
                        title="Copy School UPI ID"
                      >
                        {copiedVpa ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code & Direct Payment App Links Section */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* QR Code Canvas */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-gray-800/80 rounded-2xl border border-gray-700 text-center relative shadow-lg">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold mb-2">
                    Official Bharat UPI QR
                  </div>

                  <div className="relative p-2.5 bg-white rounded-xl shadow-inner border border-gray-300">
                    {isLoadingQr ? (
                      <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      </div>
                    ) : intent?.qrDataUrl ? (
                      <img
                        src={intent.qrDataUrl}
                        alt="UPI Payment QR Code"
                        className="w-48 h-48 block mx-auto select-none"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center bg-gray-200 text-xs text-gray-500">
                        Generating QR...
                      </div>
                    )}

                    {/* Subtle centered GPay/UPI badge inside QR container */}
                    <div className="mt-1 text-[9px] font-bold text-slate-700 tracking-wider font-mono">
                      NPCI UPI • GOOGLE PAY • PHONEPE
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download QR
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyUri}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors cursor-pointer"
                      title="Copy raw UPI Payment Link"
                    >
                      {copiedUri ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      Copy Link
                    </button>
                  </div>
                </div>

                {/* Intent Launchers & Instructions */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      Direct App Launch (Mobile Devices)
                    </h4>
                    <p className="text-xs text-gray-400">
                      Click below to open UPI apps directly on mobile devices with the fee amount
                      pre-filled:
                    </p>
                  </div>

                  {/* App Buttons */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href={intent?.gpayUri || '#'}
                      className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-emerald-500/50 text-white font-semibold text-xs transition-all shadow-sm group"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                        G
                      </div>
                      <span>Google Pay</span>
                      <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-emerald-400 ml-auto" />
                    </a>

                    <a
                      href={intent?.phonepeUri || '#'}
                      className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-purple-500/50 text-white font-semibold text-xs transition-all shadow-sm group"
                    >
                      <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px]">
                        Pe
                      </div>
                      <span>PhonePe</span>
                      <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-purple-400 ml-auto" />
                    </a>

                    <a
                      href={intent?.paytmUri || '#'}
                      className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-sky-500/50 text-white font-semibold text-xs transition-all shadow-sm group"
                    >
                      <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px]">
                        PT
                      </div>
                      <span>Paytm</span>
                      <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-sky-400 ml-auto" />
                    </a>

                    <a
                      href={intent?.upiUri || '#'}
                      className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-amber-500/50 text-white font-semibold text-xs transition-all shadow-sm group"
                    >
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                        UPI
                      </div>
                      <span>Any UPI App</span>
                      <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-amber-400 ml-auto" />
                    </a>
                  </div>

                  {/* Step Instructions */}
                  <div className="p-3 bg-gray-800/40 rounded-xl border border-gray-700/60 text-xs space-y-1.5">
                    <div className="font-semibold text-gray-300 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-indigo-400" />
                      Payment Steps / Kalphung:
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-gray-400 text-[11px]">
                      <li>
                        A chunga QR Code hi Google Pay / PhonePe-ah scan rawh (emaw App click rawh).
                      </li>
                      <li>Pawisa ₹{customAmount.toLocaleString()} pe fel rawh.</li>
                      <li>
                        Payment hlawhtlin hnuah <strong>12-digit UTR Number</strong> (Transaction ID)
                        kha copy rawh.
                      </li>
                      <li>
                        A hnuaia <strong>'Verify UTR & Confirm'</strong> button click-in UTR dah lut
                        la, fee record a 'Paid' nghal ang!
                      </li>
                    </ol>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setVerifyAmount(customAmount);
                      setActiveTab('verify');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    <span>Already Paid? Verify UTR Number Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 2: VERIFY UTR & CONFIRM ===================== */}
          {!successReceipt && activeTab === 'verify' && (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-white">Payment Verification Interface</div>
                  <p className="text-emerald-300 text-[11px] mt-0.5">
                    Input the 12-digit UPI Transaction Reference ID (UTR) from your GPay, PhonePe, or
                    banking confirmation screen. Upon verification, the record status will
                    immediately shift to <strong className="text-white">'Paid'</strong> in Firestore
                    collection <code className="text-white">fee_records</code>.
                  </p>
                </div>
              </div>

              {validationError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* UTR Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-200">
                    UPI Transaction Reference ID (UTR / Txn ID) *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateDemoUtr}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-Fill Demo UTR
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 425612348912 or UPI/425612348912"
                    value={utrNumber}
                    onChange={(e) => {
                      setUtrNumber(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white font-mono text-sm tracking-wider uppercase placeholder:text-gray-500 placeholder:normal-case focus:outline-none focus:border-emerald-500"
                  />
                  {utrNumber && utrNumber.length >= 6 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-emerald-400 font-semibold">
                      {utrNumber.length} Chars
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Found on GPay / PhonePe / Paytm receipt screen as 'UPI transaction ID' or 'UTR'.
                </p>
              </div>

              {/* Row: App & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-200 block mb-1.5">
                    UPI App Used *
                  </label>
                  <select
                    value={selectedApp}
                    onChange={(e) => setSelectedApp(e.target.value as SupportedUpiApp)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Google Pay">Google Pay (GPay)</option>
                    <option value="PhonePe">PhonePe</option>
                    <option value="Paytm">Paytm Payments Bank</option>
                    <option value="BHIM SBI Pay">BHIM SBI Pay / Yono</option>
                    <option value="Amazon Pay">Amazon Pay UPI</option>
                    <option value="Other Bank UPI">Other Bank UPI / mPAY</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-200 block mb-1.5">
                    Amount Paid (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      max={feeRecord.totalAmount}
                      value={verifyAmount}
                      onChange={(e) => setVerifyAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white font-mono text-xs font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Row: Remitter & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-200 block mb-1.5">
                    Payer / Remitter Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lalthanzuala (Father)"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-200 block mb-1.5">
                    Payer Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9862123456"
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Verifier Officer & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-200 block mb-1.5">
                    Verified By
                  </label>
                  <input
                    type="text"
                    value={verifiedBy}
                    onChange={(e) => setVerifiedBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-200 block mb-1.5">
                    Transaction Remarks
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('qr')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors cursor-pointer"
                >
                  Back to QR Code
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying with Firestore...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Shift Status to 'Paid'</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ===================== TAB 3: AUDIT & PAYMENT LOGS ===================== */}
          {!successReceipt && activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Payment History & Audit Trail
                </h4>
                <span className="text-[11px] text-gray-400 font-mono">
                  {feeRecord.paymentHistory?.length || 0} Transactions
                </span>
              </div>

              {(!feeRecord.paymentHistory || feeRecord.paymentHistory.length === 0) &&
              feeRecord.paidAmount === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs">
                  A la pe lo / No payment recorded yet for this fee cycle.
                </div>
              ) : (
                <div className="divide-y divide-gray-800 text-xs">
                  {feeRecord.paymentHistory && feeRecord.paymentHistory.length > 0 ? (
                    feeRecord.paymentHistory.map((txn, idx) => (
                      <div key={txn.transactionId || idx} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
                              ₹{txn.amount.toLocaleString()}
                            </span>
                            <span className="px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-300 font-medium text-[10px]">
                              {txn.paymentMethod}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                            Receipt: {txn.receiptNo} • Ref: {txn.referenceNumber || 'N/A'}
                          </div>
                          {txn.notes && (
                            <div className="text-[10px] text-gray-400 italic mt-0.5">{txn.notes}</div>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-gray-300 font-mono text-[11px]">
                            {txn.paymentDate} {txn.paymentTime || ''}
                          </div>
                          <div className="text-[10px] text-gray-400">{txn.receivedBy}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">
                          ₹{feeRecord.paidAmount.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          Receipt: {feeRecord.receiptNo}
                        </div>
                      </div>
                      <div className="text-right text-gray-400 text-[11px]">
                        Legacy / Recorded
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-gray-850 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-gray-400" />
            <span>Mizoram School Education Department • ZOXS SMS</span>
          </div>

          <div className="font-mono text-[11px] text-purple-400">
            NPCI UPI Standard • 100% Encrypted
          </div>
        </div>
      </div>
    </div>
  );
};
