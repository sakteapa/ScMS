import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer, 
  Search, 
  Plus, 
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  Settings2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import PaymentGatewayConfigModal from '../components/PaymentGatewayConfigModal';
import OnlineCheckoutModal from '../components/OnlineCheckoutModal';
import FeeReceiptModal from '../components/FeeReceiptModal';

export default function FinancialsView({ openExportModal }) {
  const { students, fees, recordPayment, exportDataToCSV, hostelRooms, transportRoutes, paymentConfig } = useSchool();
  const { isPrincipal, isSuperAdmin } = useAuth();
  const canManageGateways = isPrincipal || isSuperAdmin;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'upi' | 'cash'
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isGatewayConfigOpen, setIsGatewayConfigOpen] = useState(false);
  const [testCheckoutStudent, setTestCheckoutStudent] = useState(null);
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState(null);

  // Dual Payment Form State
  const [paymentMode, setPaymentMode] = useState('upi'); // 'upi' | 'cash'
  const [formData, setFormData] = useState({
    studentId: students[0]?.id || '',
    amount: '18000',
    feeType: 'Tuition Fee (Term 2)',
    upiId: 'mizoramschool@oksbi',
    transactionUtr: '',
    cashierName: 'R. Laltluanga (Chief Cashier)',
    remarks: ''
  });

  const totalCollected = fees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const upiCollected = fees.filter(f => f.paymentMode === 'upi').reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const cashCollected = fees.filter(f => f.paymentMode === 'cash').reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

  const selectedStudent = students.find(s => s.id === formData.studentId) || students[0];
  const studentHostelRoom = hostelRooms?.find(r => r.id === selectedStudent?.hostelRoomId || r.enrolledStudents?.includes(selectedStudent?.id));
  const studentTransportRoute = transportRoutes?.find(r => r.id === selectedStudent?.transportRouteId || r.enrolledStudents?.includes(selectedStudent?.id));

  // Dynamic UPI Payment Intent String
  const upiIntentString = `upi://pay?pa=${formData.upiId}&pn=Mizoram%20School%20System&am=${formData.amount}&cu=INR&tn=FEE_${selectedStudent?.admissionNo || 'MZ'}`;

  const filteredFees = fees.filter(f => {
    const matchesMode = filterMode === 'all' || f.paymentMode === filterMode;
    const matchesSearch = !searchQuery || 
      f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.transactionUtr && f.transactionUtr.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesMode && matchesSearch;
  });

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) return;

    if (paymentMode === 'upi' && !formData.transactionUtr) {
      alert('Please provide the 12-digit UTR/Transaction reference number for UPI verification');
      return;
    }

    const newRecord = recordPayment({
      ...formData,
      paymentMode,
      studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
      admissionNo: selectedStudent.admissionNo,
      classId: selectedStudent.classId
    });

    // Fire celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {}

    setIsPaymentModalOpen(false);
    setSelectedReceiptForPrint(newRecord);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Metrics */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
              <span>Financials &amp; Dual Ledger</span>
            </h2>
            <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              UPI + Cash
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
            Real-time fee verification, dynamic UPI/GPay QR codes, and cashier counter receipts.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canManageGateways && (
            <button
              onClick={() => setIsGatewayConfigOpen(true)}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
              title="Configure Payment Gateways"
            >
              <Settings2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              <span>Gateways</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 uppercase font-mono font-bold border border-cyan-500/30">
                {paymentConfig?.activeGateway || 'UPI'}
              </span>
            </button>
          )}
          <button
            onClick={() => exportDataToCSV('financials')}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            <span className="hidden sm:inline">Export Financials</span>
            <span className="sm:hidden">Export</span>
          </button>
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] sm:text-xs text-slate-400 font-medium">Total Fees Collected</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
              ₹{totalCollected.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Across All Grade Levels (Nursery - 12)</span>
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium">UPI / GPay Settlements</span>
            <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              UTR Verified
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-cyan-300 font-['Outfit']">
              ₹{upiCollected.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-slate-400">({fees.filter(f => f.paymentMode === 'upi').length} payments)</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500">
            Automated bank reference matching
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium">Cash Desk Receipts</span>
            <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Cashier Certified
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-purple-300 font-['Outfit']">
              ₹{cashCollected.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-slate-400">({fees.filter(f => f.paymentMode === 'cash').length} receipts)</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500">
            Physical counter deposits with serial numbering
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="no-print p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterMode === 'all' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            All Modes
          </button>
          <button
            onClick={() => setFilterMode('upi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterMode === 'upi' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            UPI / GPay
          </button>
          <button
            onClick={() => setFilterMode('cash')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterMode === 'cash' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            Cash Receipts
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or receipt number..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Fee Records Table */}
      <div className="no-print rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">Receipt No</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Fee Item</th>
                <th className="py-3.5 px-4">Mode</th>
                <th className="py-3.5 px-4">Reference / Cashier</th>
                <th className="py-3.5 px-4 font-mono">Amount (INR)</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredFees.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                    {rec.receiptNo}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">{rec.studentName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{rec.admissionNo}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-300">
                    {rec.feeType}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      rec.paymentMode === 'upi'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {rec.paymentMode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {rec.paymentMode === 'upi' ? (
                      <span title={rec.transactionUtr}>{rec.transactionUtr || 'Auto QR'}</span>
                    ) : (
                      <span>{rec.cashierName}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    ₹{Number(rec.amount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {rec.paymentDate}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedReceiptForPrint(rec)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white transition"
                      title="View & Print Official Slip"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DUAL PAYMENT RECORDING MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#0e1626] border border-slate-700 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Record Student Fee Payment
                </h3>
                <p className="text-xs text-slate-400">Support for UPI/GPay Dynamic QR or Cash Counter Receipt</p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Mode Switcher */}
            <div className="flex border-b border-slate-800 bg-slate-950 p-2 gap-2">
              <button
                onClick={() => setPaymentMode('upi')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  paymentMode === 'upi' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>UPI / GPay / PhonePe Mode</span>
              </button>
              <button
                onClick={() => setPaymentMode('cash')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  paymentMode === 'cash' ? 'bg-purple-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Cash Counter Mode</span>
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-5 space-y-4 text-xs">
              {/* Student selector */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">Student</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} (Adm #{s.admissionNo} • {s.classId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Itemized Fee Breakdown Line Items */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 border-b border-slate-800 pb-1.5">
                  <span>Itemized Fee Assessment</span>
                  <span className="text-cyan-400">Integrated Campus Billing</span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>• Academic Tuition & Session:</span>
                    <span className="font-mono font-medium">₹12,000</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>• Residential Hostel & Mess:</span>
                    <span className="font-mono font-medium">
                      {studentHostelRoom ? `₹${studentHostelRoom.monthlyFee} (${studentHostelRoom.roomNumber})` : '₹0 (Day Scholar)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>• School Bus Fleet Route:</span>
                    <span className="font-mono font-medium">
                      {studentTransportRoute ? `₹${studentTransportRoute.monthlyFee} (${studentTransportRoute.routeName})` : '₹0 (Self Commute)'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Combined Term Dues:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-xs">
                      ₹{(12000 + (studentHostelRoom ? studentHostelRoom.monthlyFee : 0) + (studentTransportRoute ? studentTransportRoute.monthlyFee : 0)).toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const total = 12000 + (studentHostelRoom ? studentHostelRoom.monthlyFee : 0) + (studentTransportRoute ? studentTransportRoute.monthlyFee : 0);
                        setFormData(prev => ({ ...prev, amount: String(total), feeType: 'Combined Tuition + Hostel + Bus' }));
                      }}
                      className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 text-[10px] font-bold transition"
                    >
                      Use Amount
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Amount (INR)</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Fee Category</label>
                  <select
                    value={formData.feeType}
                    onChange={(e) => setFormData({ ...formData, feeType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="Tuition Fee (Term 1)">Tuition Fee (Term 1)</option>
                    <option value="Tuition Fee (Term 2)">Tuition Fee (Term 2)</option>
                    <option value="Laboratory & Exam Fee">Laboratory &amp; Exam Fee</option>
                    <option value="Hostel & Boarding Fee">Hostel &amp; Boarding Fee</option>
                    <option value="Transport Route Fee">Transport Route Fee</option>
                    <option value="Annual Comprehensive Clearance">Annual Comprehensive Clearance</option>
                  </select>
                </div>
              </div>

              {/* UPI Mode specifics */}
              {paymentMode === 'upi' ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-white shrink-0 shadow">
                      <QRCodeSVG
                        value={upiIntentString}
                        size={84}
                        level="M"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-cyan-400 block">Dynamic UPI Payment QR</span>
                      <p className="text-[11px] text-slate-300">
                        Scan with GPay, PhonePe, Paytm, or BHIM. Amount: <strong className="text-cyan-300 font-mono">₹{formData.amount}</strong>
                      </p>
                      <a
                        href={upiIntentString}
                        className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline pt-1"
                      >
                        <span>Open UPI App on Mobile</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      UTR / Bank Transaction Reference (12 Digits) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.transactionUtr}
                      onChange={(e) => setFormData({ ...formData, transactionUtr: e.target.value })}
                      placeholder="e.g. UTR492819028472"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>
              ) : (
                /* Cash Mode specifics */
                <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Authorizing Cashier</label>
                    <select
                      value={formData.cashierName}
                      onChange={(e) => setFormData({ ...formData, cashierName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    >
                      <option value="R. Laltluanga (Chief Cashier)">R. Laltluanga (Chief Cashier)</option>
                      <option value="Pi Zonunmawii (Accounts Desk 2)">Pi Zonunmawii (Accounts Desk 2)</option>
                      <option value="H. Laldinpuia (Office Supt.)">H. Laldinpuia (Office Supt.)</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    A formalized sequential receipt number (<code className="text-purple-300 font-mono">MSS-CSH-2026-XXXX</code>) will be generated and stamped upon confirmation.
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold shadow-lg shadow-cyan-500/20"
                >
                  Confirm &amp; Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL RECEIPT SLIP & THERMAL VOUCHER SUITE */}
      <FeeReceiptModal
        isOpen={!!selectedReceiptForPrint}
        onClose={() => setSelectedReceiptForPrint(null)}
        feeRecord={selectedReceiptForPrint}
      />

      {/* PAYMENT GATEWAY CONFIGURATION MODAL (PRINCIPAL / SUPERADMIN) */}
      <PaymentGatewayConfigModal
        isOpen={isGatewayConfigOpen}
        onClose={() => setIsGatewayConfigOpen(false)}
        onTestCheckout={(gwId) => {
          setIsGatewayConfigOpen(false);
          setTestCheckoutStudent(selectedStudent || students[0]);
        }}
      />

      {/* TEST CHECKOUT MODAL */}
      {testCheckoutStudent && (
        <OnlineCheckoutModal
          isOpen={!!testCheckoutStudent}
          onClose={() => setTestCheckoutStudent(null)}
          student={testCheckoutStudent}
          feeAmount={formData.amount || 18000}
          feeType="Annual Comprehensive Fee (Sandbox Test)"
          onPaymentSuccess={() => {
            setTestCheckoutStudent(null);
          }}
        />
      )}
    </div>
  );
}
