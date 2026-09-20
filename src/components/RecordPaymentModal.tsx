import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Save,
  IndianRupee,
  Calculator,
  CheckCircle,
  Clock,
  AlertTriangle,
  Printer,
  QrCode,
  Smartphone,
  Copy,
  Check,
  Sparkles,
  Banknote,
  Coins,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  ExternalLink,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { FeeRecord, FeeStatus, FirestoreStudent, FeeComponentBreakdown, FeeType } from '../types';
import { recordFeeTransaction, createStudentFeeRecord, STANDARD_FEE_PRESETS } from '../lib/feeService';
import {
  DEFAULT_UPI_CONFIG,
  buildUpiPaymentUri,
  generateUpiQrDataUrl,
} from '../lib/upiPaymentService';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: FirestoreStudent[];
  fees: FeeRecord[];
  initialFee?: FeeRecord | null;
  onTransactionComplete?: (updatedFee: FeeRecord, receiptNumber: string) => void;
}

export type PaymentChannelType = 'Cash' | 'UPI';

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  students,
  fees,
  initialFee,
  onTransactionComplete,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [feeType, setFeeType] = useState<FeeType>('Tuition');
  const [feeMonth, setFeeMonth] = useState('September 2026');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [dueDate, setDueDate] = useState('2026-09-15');

  // Fee Structure Itemization
  const [tuitionFee, setTuitionFee] = useState<number>(1400);
  const [examFee, setExamFee] = useState<number>(300);
  const [computerLabFee, setComputerLabFee] = useState<number>(250);
  const [developmentFund, setDevelopmentFund] = useState<number>(150);
  const [libraryFee, setLibraryFee] = useState<number>(50);
  const [sportsActivityFee, setSportsActivityFee] = useState<number>(50);
  const [lateFine, setLateFine] = useState<number>(0);
  const [concessionDiscount, setConcessionDiscount] = useState<number>(0);

  // Dual Payment Method Selection State: 'Cash' vs 'UPI'
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannelType>('Cash');

  // Cash Payments Specific Fields
  const [cashierName, setCashierName] = useState('Lalbiakvela (School Cashier)');
  const [cashReceiptNo, setCashReceiptNo] = useState(`RCP-CSH-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [cashTendered, setCashTendered] = useState<number>(2200);

  // UPI / GPay Specific Fields
  const [upiSubMethod, setUpiSubMethod] = useState<'UPI (GPay)' | 'UPI (PhonePe)' | 'UPI (Paytm)' | 'UPI (BHIM)'>('UPI (GPay)');
  const [upiUtr, setUpiUtr] = useState('');
  const [upiReceiptNo, setUpiReceiptNo] = useState(`RCP-UPI-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [upiPayerName, setUpiPayerName] = useState('');
  const [upiPayerPhone, setUpiPayerPhone] = useState('');
  const [showUpiQr, setShowUpiQr] = useState(true);
  const [upiQrUrl, setUpiQrUrl] = useState<string>('');
  const [copiedVpa, setCopiedVpa] = useState(false);

  // Common Payment Execution
  const [paymentAmount, setPaymentAmount] = useState<number>(2200);
  const [receivedBy, setReceivedBy] = useState('Accounts & Bursar Office');
  const [notes, setNotes] = useState('Fee received and verified at accounts counter');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculated total obligation
  const totalPayable = Math.max(
    0,
    tuitionFee +
      examFee +
      computerLabFee +
      developmentFund +
      libraryFee +
      sportsActivityFee +
      lateFine -
      concessionDiscount
  );

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // Generate random receipt numbers
  const generateNewReceiptNo = (channel: PaymentChannelType) => {
    const code = Math.floor(1000 + Math.random() * 9000);
    if (channel === 'Cash') {
      const num = `RCP-CSH-2026-${code}`;
      setCashReceiptNo(num);
      return num;
    } else {
      const num = `RCP-UPI-2026-${code}`;
      setUpiReceiptNo(num);
      return num;
    }
  };

  // Dynamic QR Code generation for UPI payment mode
  useEffect(() => {
    if (paymentChannel === 'UPI' && paymentAmount > 0 && selectedStudent) {
      const note = `Fee ${feeMonth} R#${selectedStudent.rollNo} ${selectedStudent.name.slice(0, 15)}`;
      const { standardUri } = buildUpiPaymentUri({
        vpa: DEFAULT_UPI_CONFIG.vpa,
        payeeName: DEFAULT_UPI_CONFIG.payeeName,
        amount: Number(paymentAmount),
        transactionNote: note,
        referenceId: `ZOXS-${Date.now().toString().slice(-6)}`,
      });

      generateUpiQrDataUrl(standardUri, { width: 180, margin: 1 })
        .then((url) => setUpiQrUrl(url))
        .catch((e) => console.error('Error generating modal UPI QR:', e));
    }
  }, [paymentChannel, paymentAmount, selectedStudent, feeMonth]);

  // Synchronize cash tendered with payment amount default
  useEffect(() => {
    if (cashTendered < paymentAmount) {
      setCashTendered(paymentAmount);
    }
  }, [paymentAmount]);

  // Initialize or reset form values
  useEffect(() => {
    if (initialFee) {
      setSelectedStudentId(initialFee.studentId);
      setFeeType(initialFee.feeType || 'Tuition');
      setFeeMonth(initialFee.feeMonth);
      setAcademicYear(initialFee.academicYear || '2026-2027');
      setDueDate(initialFee.dueDate);

      const struct = initialFee.feeStructure;
      if (struct) {
        setTuitionFee(struct.tuitionFee || 0);
        setExamFee(struct.examFee || 0);
        setComputerLabFee(struct.computerLabFee || 0);
        setDevelopmentFund(struct.developmentFund || 0);
        setLibraryFee(struct.libraryFee || 0);
        setSportsActivityFee(struct.sportsActivityFee || 0);
        setLateFine(struct.lateFine || 0);
        setConcessionDiscount(struct.concessionDiscount || 0);
      } else {
        setTuitionFee(Math.round(initialFee.totalAmount * 0.65));
        setExamFee(Math.round(initialFee.totalAmount * 0.15));
        setComputerLabFee(Math.round(initialFee.totalAmount * 0.1));
        setDevelopmentFund(Math.round(initialFee.totalAmount * 0.1));
      }

      const balance = Math.max(
        0,
        initialFee.balanceAmount !== undefined
          ? initialFee.balanceAmount
          : initialFee.totalAmount - initialFee.paidAmount
      );
      const amt = balance > 0 ? balance : initialFee.totalAmount;
      setPaymentAmount(amt);
      setCashTendered(amt);

      const method = initialFee.paymentMethod || '';
      if (method.toLowerCase().includes('cash')) {
        setPaymentChannel('Cash');
      } else if (method.toLowerCase().includes('upi') || method.toLowerCase().includes('gpay')) {
        setPaymentChannel('UPI');
        if (method.includes('PhonePe')) setUpiSubMethod('UPI (PhonePe)');
        else if (method.includes('Paytm')) setUpiSubMethod('UPI (Paytm)');
        else if (method.includes('BHIM')) setUpiSubMethod('UPI (BHIM)');
        else setUpiSubMethod('UPI (GPay)');
      }
      setUpiUtr(`4256${Math.floor(10000000 + Math.random() * 90000000)}`);
      generateNewReceiptNo('Cash');
      generateNewReceiptNo('UPI');
    } else {
      if (students.length > 0 && !selectedStudentId) {
        setSelectedStudentId(students[0].id);
      }
      setFeeType('Tuition');
      setFeeMonth('September 2026');
      setAcademicYear('2026-2027');
      setDueDate('2026-09-15');
      setTuitionFee(1400);
      setExamFee(300);
      setComputerLabFee(250);
      setDevelopmentFund(150);
      setLibraryFee(50);
      setSportsActivityFee(50);
      setLateFine(0);
      setConcessionDiscount(0);
      setPaymentAmount(2200);
      setCashTendered(2200);
      setUpiUtr(`4256${Math.floor(10000000 + Math.random() * 90000000)}`);
      generateNewReceiptNo('Cash');
      generateNewReceiptNo('UPI');
    }
  }, [initialFee, isOpen, students]);

  // Apply preset when student class changes
  const handleApplyPreset = (classGradeKey: string) => {
    const preset = STANDARD_FEE_PRESETS[classGradeKey];
    if (preset) {
      setTuitionFee(preset.breakdown.tuitionFee);
      setExamFee(preset.breakdown.examFee);
      setComputerLabFee(preset.breakdown.computerLabFee);
      setDevelopmentFund(preset.breakdown.developmentFund);
      setLibraryFee(preset.breakdown.libraryFee);
      setSportsActivityFee(preset.breakdown.sportsActivityFee);
      setPaymentAmount(preset.monthlyFee);
      setCashTendered(preset.monthlyFee);
    }
  };

  if (!isOpen) return null;

  const currentPaidSoFar = initialFee?.paidAmount || 0;
  const simulatedTotalPaid = currentPaidSoFar + Number(paymentAmount || 0);
  const simulatedBalance = Math.max(0, totalPayable - simulatedTotalPaid);

  // Cash change calculation
  const cashChangeToReturn = Math.max(0, cashTendered - paymentAmount);
  const cashShortfall = Math.max(0, paymentAmount - cashTendered);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setIsSubmitting(true);

    try {
      const breakdown: FeeComponentBreakdown = {
        tuitionFee: Number(tuitionFee),
        examFee: Number(examFee),
        computerLabFee: Number(computerLabFee),
        developmentFund: Number(developmentFund),
        libraryFee: Number(libraryFee),
        sportsActivityFee: Number(sportsActivityFee),
        lateFine: Number(lateFine),
        concessionDiscount: Number(concessionDiscount),
      };

      const finalMethod = paymentChannel === 'Cash' ? 'Cash Counter' : upiSubMethod;
      const finalReceiptNo = paymentChannel === 'Cash' ? cashReceiptNo : upiReceiptNo;
      const finalRefNo = paymentChannel === 'Cash' ? cashReceiptNo : upiUtr;
      const finalOfficer = paymentChannel === 'Cash' ? cashierName : receivedBy;

      const finalNotes =
        paymentChannel === 'Cash'
          ? `Cash collected by ${cashierName} (Tendered: ₹${cashTendered}, Change: ₹${cashChangeToReturn}). ${notes}`
          : `UPI / GPay payment verified (UTR: ${upiUtr}, Remitter: ${upiPayerName || selectedStudent.name}). ${notes}`;

      if (initialFee) {
        // Record payment against existing fee record
        const { updatedFee, transaction } = await recordFeeTransaction({
          feeRecordId: initialFee.id,
          studentId: selectedStudent.id,
          studentName: selectedStudent.name,
          paymentAmount: Number(paymentAmount),
          paymentMethod: finalMethod,
          paymentChannel,
          receiptNo: finalReceiptNo,
          cashierName: paymentChannel === 'Cash' ? cashierName : undefined,
          cashTendered: paymentChannel === 'Cash' ? cashTendered : undefined,
          changeGiven: paymentChannel === 'Cash' ? cashChangeToReturn : undefined,
          referenceNumber: finalRefNo,
          receivedBy: finalOfficer,
          notes: finalNotes,
          currentFeeRecord: {
            ...initialFee,
            totalAmount: totalPayable,
            feeStructure: breakdown,
          },
          allFeeRecords: fees,
          allStudents: students,
        });

        if (onTransactionComplete) {
          onTransactionComplete(updatedFee, transaction.receiptNo);
        }
      } else {
        // Create new fee record and record initial transaction
        const newFee = await createStudentFeeRecord({
          student: selectedStudent,
          feeMonth,
          academicYear,
          feeType,
          breakdown,
          dueDate,
          remarks: finalNotes,
          allFeeRecords: fees,
          allStudents: students,
        });

        if (paymentAmount > 0) {
          const { updatedFee, transaction } = await recordFeeTransaction({
            feeRecordId: newFee.id,
            studentId: selectedStudent.id,
            studentName: selectedStudent.name,
            paymentAmount: Number(paymentAmount),
            paymentMethod: finalMethod,
            paymentChannel,
            receiptNo: finalReceiptNo,
            cashierName: paymentChannel === 'Cash' ? cashierName : undefined,
            cashTendered: paymentChannel === 'Cash' ? cashTendered : undefined,
            changeGiven: paymentChannel === 'Cash' ? cashChangeToReturn : undefined,
            referenceNumber: finalRefNo,
            receivedBy: finalOfficer,
            notes: finalNotes,
            currentFeeRecord: newFee,
            allFeeRecords: [...fees, newFee],
            allStudents: students,
          });

          if (onTransactionComplete) {
            onTransactionComplete(updatedFee, transaction.receiptNo);
          }
        }
      }

      onClose();
    } catch (err) {
      console.error('Error saving fee transaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full p-6 text-gray-100 shadow-2xl relative my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialFee ? 'Record Fee Payment Transaction' : 'Create & Collect Fee Transaction'}
              </h3>
              <p className="text-xs text-gray-400">
                Mizoram School System • Dual Cash & UPI/GPay Payment Terminal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Target Student Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-medium mb-1">
                Select Student *
              </label>
              {initialFee ? (
                <div className="p-2.5 rounded-lg bg-gray-800 border border-gray-700 font-semibold text-white">
                  {initialFee.studentName} (Roll #{initialFee.rollNo} • {initialFee.className})
                </div>
              ) : (
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    const sid = e.target.value;
                    setSelectedStudentId(sid);
                    const s = students.find((item) => item.id === sid);
                    if (s) handleApplyPreset(s.className);
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Roll #{s.rollNo} - {s.className})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Fee Category</label>
                <select
                  value={feeType}
                  onChange={(e) => setFeeType(e.target.value as FeeType)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Tuition">Tuition Fee</option>
                  <option value="Admission">Admission Fee</option>
                  <option value="Examination">Examination Fee</option>
                  <option value="Laboratory">Laboratory Fee</option>
                  <option value="Hostel">Hostel Fee</option>
                  <option value="Transport">Transport Fee</option>
                  <option value="Comprehensive">Comprehensive</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 font-medium mb-1">Fee Cycle / Month</label>
                <input
                  type="text"
                  value={feeMonth}
                  onChange={(e) => setFeeMonth(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Itemized Fee Breakdown Accordion */}
          <div className="bg-gray-800/60 border border-gray-700/80 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-200 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                MBSE Itemized Fee Structure
              </span>
              <span className="text-[11px] text-gray-400 font-mono">
                Total Obligation: <strong className="text-white text-xs">₹{totalPayable.toLocaleString()}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-gray-400 text-[11px] mb-0.5">Tuition (₹)</label>
                <input
                  type="number"
                  value={tuitionFee}
                  onChange={(e) => setTuitionFee(Number(e.target.value) || 0)}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-[11px] mb-0.5">Exam Fee (₹)</label>
                <input
                  type="number"
                  value={examFee}
                  onChange={(e) => setExamFee(Number(e.target.value) || 0)}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-[11px] mb-0.5">Computer Lab (₹)</label>
                <input
                  type="number"
                  value={computerLabFee}
                  onChange={(e) => setComputerLabFee(Number(e.target.value) || 0)}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-[11px] mb-0.5">Dev. Fund (₹)</label>
                <input
                  type="number"
                  value={developmentFund}
                  onChange={(e) => setDevelopmentFund(Number(e.target.value) || 0)}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-[11px] mb-0.5">Library (₹)</label>
                <input
                  type="number"
                  value={libraryFee}
                  onChange={(e) => setLibraryFee(Number(e.target.value) || 0)}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-[11px] mb-0.5">Sports/Activities (₹)</label>
                <input
                  type="number"
                  value={sportsActivityFee}
                  onChange={(e) => setSportsActivityFee(Number(e.target.value) || 0)}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-[11px] mb-0.5">Late Fine (₹)</label>
                <input
                  type="number"
                  value={lateFine}
                  onChange={(e) => setLateFine(Number(e.target.value) || 0)}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-amber-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-[11px] mb-0.5">Concession / Discount (₹)</label>
                <input
                  type="number"
                  value={concessionDiscount}
                  onChange={(e) => setConcessionDiscount(Number(e.target.value) || 0)}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-emerald-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* ==================== DUAL PAYMENT METHOD SELECTION INTERFACE ==================== */}
          <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Payment Collection & Channel Selection
              </span>
              {simulatedBalance === 0 ? (
                <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Full Settlement (Cleared)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] bg-amber-500/20 text-amber-300 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Partial Balance: ₹{simulatedBalance.toLocaleString()}
                </span>
              )}
            </div>

            {/* Tactile Dual Channel Selector */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-950/80 rounded-2xl border border-gray-800">
              <button
                type="button"
                onClick={() => setPaymentChannel('Cash')}
                className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  paymentChannel === 'Cash'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50 border border-emerald-400/40'
                    : 'bg-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-900 border border-transparent'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-200" />
                <div className="text-left">
                  <div className="leading-tight">Cash Received</div>
                  <div className="text-[10px] font-normal opacity-80">Counter & Bursar</div>
                </div>
                {paymentChannel === 'Cash' && <Check className="w-4 h-4 text-emerald-200 ml-auto" />}
              </button>

              <button
                type="button"
                onClick={() => setPaymentChannel('UPI')}
                className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  paymentChannel === 'UPI'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50 border border-purple-400/40'
                    : 'bg-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-900 border border-transparent'
                }`}
              >
                <Smartphone className="w-4 h-4 text-purple-200" />
                <div className="text-left">
                  <div className="leading-tight">UPI / Google Pay</div>
                  <div className="text-[10px] font-normal opacity-80">Instant QR & UTR</div>
                </div>
                {paymentChannel === 'UPI' && <Check className="w-4 h-4 text-purple-200 ml-auto" />}
              </button>
            </div>

            {/* Amount to Collect */}
            <div className="bg-gray-900/90 border border-gray-700/80 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <label className="block text-gray-300 font-semibold mb-0.5">
                  Amount to Collect (₹) *
                </label>
                <span className="text-[11px] text-gray-400">
                  Due fee balance: ₹{totalPayable.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="number"
                  required
                  min={1}
                  value={paymentAmount}
                  onChange={(e) => {
                    const amt = Number(e.target.value) || 0;
                    setPaymentAmount(amt);
                  }}
                  className="w-full sm:w-44 bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono font-bold text-base focus:outline-none focus:border-amber-500 text-right"
                />
                <button
                  type="button"
                  onClick={() => setPaymentAmount(totalPayable)}
                  className="px-2.5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-[11px] text-amber-300 font-medium whitespace-nowrap cursor-pointer"
                  title="Set to full due amount"
                >
                  Full Due
                </button>
              </div>
            </div>

            {/* -------------------- FOR CASH PAYMENTS -------------------- */}
            {paymentChannel === 'Cash' && (
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Cash Counter Details & Receipt Voucher</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40">
                    Physical Cash Desk
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Field 1: Cashier Name */}
                  <div>
                    <label className="block text-gray-300 font-medium mb-1 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Cashier Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={cashierName}
                      onChange={(e) => setCashierName(e.target.value)}
                      placeholder="e.g. Lalbiakvela (School Cashier)"
                      className="w-full bg-gray-900 border border-emerald-500/40 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                    />
                    <div className="flex gap-1.5 mt-1">
                      <button
                        type="button"
                        onClick={() => setCashierName('Lalbiakvela (School Cashier)')}
                        className="text-[10px] text-gray-400 hover:text-emerald-300 cursor-pointer underline"
                      >
                        Lalbiakvela
                      </button>
                      <span className="text-gray-600">•</span>
                      <button
                        type="button"
                        onClick={() => setCashierName('Zonunmawia (Bursar / Counter 1)')}
                        className="text-[10px] text-gray-400 hover:text-emerald-300 cursor-pointer underline"
                      >
                        Zonunmawia
                      </button>
                      <span className="text-gray-600">•</span>
                      <button
                        type="button"
                        onClick={() => setCashierName('Mary Lalremruati (Accounts Desk)')}
                        className="text-[10px] text-gray-400 hover:text-emerald-300 cursor-pointer underline"
                      >
                        Mary L.
                      </button>
                    </div>
                  </div>

                  {/* Field 2: Generated Receipt Number */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-gray-300 font-medium flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                        Generated Cash Receipt No *
                      </label>
                      <button
                        type="button"
                        onClick={() => generateNewReceiptNo('Cash')}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                        title="Generate new receipt serial"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Regenerate
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={cashReceiptNo}
                        onChange={(e) => setCashReceiptNo(e.target.value)}
                        className="w-full bg-gray-900 border border-emerald-500/40 rounded-lg px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 block">
                      Official printed cash voucher sequence logged in <code className="text-gray-400">fee_records</code>
                    </span>
                  </div>
                </div>

                {/* Cash Tendered & Change Returnable Calculator */}
                <div className="p-3 bg-gray-900/90 rounded-xl border border-gray-700/80 space-y-2">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        Cash Tendered & Change Returnable
                      </span>
                      <p className="text-[11px] text-gray-400">
                        Amount handed by parent / student at cash desk
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">Tendered: ₹</span>
                      <input
                        type="number"
                        min={0}
                        value={cashTendered}
                        onChange={(e) => setCashTendered(Number(e.target.value) || 0)}
                        className="w-28 bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold text-sm text-right focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  {/* Change or Shortfall Display */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-800">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 text-[11px]">Quick Tender:</span>
                      <button
                        type="button"
                        onClick={() => setCashTendered(paymentAmount)}
                        className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] cursor-pointer"
                      >
                        Exact ₹{paymentAmount}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCashTendered(Math.ceil(paymentAmount / 500) * 500)}
                        className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] cursor-pointer"
                      >
                        Round ₹{Math.ceil(paymentAmount / 500) * 500}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCashTendered(paymentAmount + 500)}
                        className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] cursor-pointer"
                      >
                        +₹500
                      </button>
                    </div>

                    <div>
                      {cashShortfall > 0 ? (
                        <span className="text-amber-400 text-xs font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Shortfall: ₹{cashShortfall.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Change to Return: <strong>₹{cashChangeToReturn.toLocaleString()}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- FOR UPI / GPAY PAYMENTS -------------------- */}
            {paymentChannel === 'UPI' && (
              <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white">UPI / Google Pay Digital Gateway & UTR Verification</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/40">
                    NPCI Standard
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* UPI App Selection */}
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      UPI App / Service Mode *
                    </label>
                    <select
                      value={upiSubMethod}
                      onChange={(e) => setUpiSubMethod(e.target.value as any)}
                      className="w-full bg-gray-900 border border-purple-500/40 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="UPI (GPay)">Google Pay (GPay)</option>
                      <option value="UPI (PhonePe)">PhonePe</option>
                      <option value="UPI (Paytm)">Paytm UPI</option>
                      <option value="UPI (BHIM)">BHIM / Bank UPI App</option>
                    </select>
                  </div>

                  {/* UTR / Transaction ID */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-gray-300 font-medium flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        12-Digit UPI UTR / Ref No *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const demoUtr = `4256${Math.floor(10000000 + Math.random() * 90000000)}`;
                          setUpiUtr(demoUtr);
                        }}
                        className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                        title="Auto-fill sample 12-digit bank UTR"
                      >
                        <Sparkles className="w-3 h-3" />
                        Auto-Fill UTR
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={upiUtr}
                      onChange={(e) => setUpiUtr(e.target.value)}
                      placeholder="e.g. 425612348912"
                      className="w-full bg-gray-900 border border-purple-500/40 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-400"
                    />
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                      <span className={upiUtr.length === 12 ? 'text-emerald-400 flex items-center gap-1' : 'text-gray-400'}>
                        {upiUtr.length === 12 ? '✓ Valid 12-digit bank reference' : `${upiUtr.length}/12 digits`}
                      </span>
                      <span className="text-gray-500">From parent's GPay/PhonePe</span>
                    </div>
                  </div>
                </div>

                {/* Additional UPI Metadata & Payer Remitter Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Remitter / Parent Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={upiPayerName}
                      onChange={(e) => setUpiPayerName(e.target.value)}
                      placeholder={selectedStudent ? `Parent of ${selectedStudent.name}` : 'e.g. Lalhmingliana'}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Generated UPI Voucher Receipt No *
                    </label>
                    <input
                      type="text"
                      required
                      value={upiReceiptNo}
                      onChange={(e) => setUpiReceiptNo(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-purple-300 font-mono font-bold focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Live Dynamic UPI QR Code & VPA preview */}
                <div className="p-3 bg-gray-900/90 border border-gray-700/80 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-white">Dynamic Student Payment QR Intent</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUpiQr(!showUpiQr)}
                      className="text-[11px] text-purple-300 hover:underline cursor-pointer"
                    >
                      {showUpiQr ? 'Hide QR' : 'Show QR'}
                    </button>
                  </div>

                  {showUpiQr && (
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                      {upiQrUrl ? (
                        <div className="p-2 bg-white rounded-lg border border-gray-300 shrink-0">
                          <img src={upiQrUrl} alt="UPI QR Code" className="w-28 h-28" />
                        </div>
                      ) : (
                        <div className="w-28 h-28 bg-gray-800 animate-pulse rounded-lg shrink-0 flex items-center justify-center text-[10px] text-gray-500">
                          Generating...
                        </div>
                      )}

                      <div className="text-xs space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">School VPA:</span>
                          <code className="bg-gray-950 px-2 py-0.5 rounded text-indigo-300 font-mono font-bold text-[11px] border border-gray-700">
                            {DEFAULT_UPI_CONFIG.vpa}
                          </code>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(DEFAULT_UPI_CONFIG.vpa);
                              setCopiedVpa(true);
                              setTimeout(() => setCopiedVpa(false), 2000);
                            }}
                            className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 cursor-pointer"
                            title="Copy VPA"
                          >
                            {copiedVpa ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>

                        <div className="text-gray-400 text-[11px]">
                          Payable Amount: <strong className="text-white font-mono">₹{paymentAmount.toLocaleString()}</strong>
                        </div>

                        <div className="text-[10px] text-gray-400 leading-relaxed">
                          Scan with Google Pay, PhonePe, Paytm, or BHIM. Enter the confirmed 12-digit UTR above to clear the record in <code className="text-indigo-300 font-mono">fee_records</code>.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* General Staff & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-[11px] mb-1">
                  Verifying Officer / Accounts Staff
                </label>
                <input
                  type="text"
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-[11px] mb-1">
                  Internal Ledger Note
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
            </div>
          </div>

          {/* Submission and Print notice */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-800">
            <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Instant logging to <code className="text-gray-300 font-mono">fee_records</code> with status sync
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50 ${
                  paymentChannel === 'Cash'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-purple-600 hover:bg-purple-500'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                {isSubmitting
                  ? 'Logging Transaction...'
                  : paymentChannel === 'Cash'
                  ? 'Confirm Cash Payment & Issue Receipt'
                  : 'Verify UPI UTR & Record Payment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
