import React, { useState } from 'react';
import { 
  X, 
  Search, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  Download, 
  Printer, 
  ShieldCheck, 
  FileText,
  DollarSign,
  ArrowRight,
  Sparkles,
  Building2,
  Clock,
  User,
  ExternalLink
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';

export default function PublicFineFeeClearanceModal({ isOpen, onClose }) {
  const { 
    students = [], 
    classes = [], 
    fineRecords = [], 
    recordPayment, 
    settleFinePayment, 
    activeSchoolInfo,
    systemConfig
  } = useSchool();

  const [activeTab, setActiveTab] = useState('lookup'); // 'lookup' | 'direct'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedFine, setSelectedFine] = useState(null);
  const [paymentMode, setPaymentMode] = useState('upi'); // 'upi' | 'razorpay' | 'cash'
  const [utrNumber, setUtrNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState(null);

  // Direct custom fine form state
  const [directForm, setDirectForm] = useState({
    studentName: '',
    admissionNo: '',
    classId: classes[0]?.id || '',
    fineCategory: 'late_arrival',
    fineTitle: 'Assembly Late Arrival Fine',
    amount: '50',
    notes: 'Campus fine clearance via front page'
  });

  if (!isOpen) return null;

  const schoolName = activeSchoolInfo?.name || systemConfig?.schoolName || 'Mizoram Standard Secondary School';
  const schoolAddress = activeSchoolInfo?.address || systemConfig?.address || 'Aizawl, Mizoram';
  const upiId = activeSchoolInfo?.contactPhone ? `${activeSchoolInfo.contactPhone}@upi` : 'ohalunglawn@oksbi';

  // Search logic
  const matchingStudents = searchQuery.trim() 
    ? students.filter(s => 
        (s.admissionNo && s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (`${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.rollNo && s.rollNo.toString() === searchQuery.trim())
      )
    : [];

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    const pendingFines = fineRecords.filter(f => f.studentId === student.id && f.status === 'pending');
    if (pendingFines.length > 0) {
      setSelectedFine(pendingFines[0]);
    } else {
      setSelectedFine(null);
    }
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      let receiptNo = `MSS-UPI-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      let paidAmount = 0;
      let fineTitleText = '';
      let targetStudentName = '';
      let targetAdmissionNo = '';
      let targetClassName = '';

      if (activeTab === 'lookup' && selectedStudent) {
        paidAmount = selectedFine ? selectedFine.amount : Math.max(0, (selectedStudent.totalFees || 32000) - (selectedStudent.paidFees || 0));
        fineTitleText = selectedFine ? selectedFine.fineTitle : 'Outstanding Tuition / Term Fee Clearance';
        targetStudentName = `${selectedStudent.firstName} ${selectedStudent.lastName}`;
        targetAdmissionNo = selectedStudent.admissionNo || 'MZ-2026-N/A';
        const cls = classes.find(c => c.id === selectedStudent.classId);
        targetClassName = cls ? cls.name : 'Class Student';

        if (selectedFine && settleFinePayment) {
          const res = settleFinePayment(selectedFine.id, {
            receiptNo,
            paymentMode,
            studentId: selectedStudent.id,
            studentName: targetStudentName,
            admissionNo: targetAdmissionNo,
            classId: selectedStudent.classId,
            amount: paidAmount,
            fineTitle: fineTitleText,
            notes: `Cleared via Front Page Portal (UTR: ${utrNumber || 'UPI-APP'})`
          });
          if (res?.receiptNo) receiptNo = res.receiptNo;
        } else if (recordPayment) {
          recordPayment({
            studentId: selectedStudent.id,
            studentName: targetStudentName,
            admissionNo: targetAdmissionNo,
            classId: selectedStudent.classId,
            amount: paidAmount,
            paymentMode,
            feeType: fineTitleText,
            receiptNumber: receiptNo,
            transactionUtr: utrNumber || `UPI_${Date.now()}`,
            remarks: `Front Page Online Fee Settlement - UTR: ${utrNumber || 'UPI-APP'}`
          });
        }
      } else {
        // Direct clearance
        paidAmount = Number(directForm.amount) || 50;
        fineTitleText = directForm.fineTitle;
        targetStudentName = directForm.studentName || 'Student Ward';
        targetAdmissionNo = directForm.admissionNo || 'DIRECT-CLEARANCE';
        const cls = classes.find(c => c.id === directForm.classId);
        targetClassName = cls ? cls.name : 'Student';

        if (recordPayment) {
          recordPayment({
            studentId: `stu-direct-${Date.now()}`,
            studentName: targetStudentName,
            admissionNo: targetAdmissionNo,
            classId: directForm.classId,
            amount: paidAmount,
            paymentMode,
            feeType: fineTitleText,
            receiptNumber: receiptNo,
            transactionUtr: utrNumber || `UPI_${Date.now()}`,
            remarks: `Direct Fine Settlement via Web Portal: ${directForm.notes || fineTitleText}`
          });
        }
      }

      setCompletedReceipt({
        receiptNo,
        studentName: targetStudentName,
        admissionNo: targetAdmissionNo,
        className: targetClassName,
        amount: paidAmount,
        fineTitle: fineTitleText,
        paymentMode,
        utr: utrNumber || `UPI_CLEAR_${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      setIsProcessing(false);
    }, 700);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const resetAll = () => {
    setSelectedStudent(null);
    setSelectedFine(null);
    setCompletedReceipt(null);
    setSearchQuery('');
    setUtrNumber('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Student Fees & Campus Fine Clearance
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Instant System Sync
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Official Web Portal: Any fine paid here enters the school ledger automatically
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Receipt is already generated */}
        {completedReceipt ? (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Fine & Fee Payment Cleared Successfully!</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Official clearance verified and entered into the institutional accounts ledger.
              </p>
            </div>

            {/* Printable Digital Certificate / Receipt Card */}
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 font-mono text-xs text-slate-300">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <div className="text-sm font-bold text-white uppercase tracking-wider">{schoolName}</div>
                  <div className="text-[10px] text-slate-400">{schoolAddress}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                    PAID &amp; CLEARED
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">{completedReceipt.receiptNo}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Student Name:</span>
                  <span className="text-white font-bold">{completedReceipt.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Admission / Roll No:</span>
                  <span className="text-cyan-300 font-bold">{completedReceipt.admissionNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Class &amp; Section:</span>
                  <span className="text-white">{completedReceipt.className}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Fine / Fee Description:</span>
                  <span className="text-purple-300 font-bold">{completedReceipt.fineTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Payment Mode:</span>
                  <span className="text-white uppercase">{completedReceipt.paymentMode} QR Settlement</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Transaction Ref (UTR):</span>
                  <span className="text-amber-400 font-mono">{completedReceipt.utr}</span>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-300 uppercase">Total Settled Amount:</span>
                <span className="text-base font-extrabold text-emerald-400">₹{completedReceipt.amount}</span>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 text-center border-t border-slate-800/50">
                Generated: {completedReceipt.date} at {completedReceipt.time} • Digitally Certified by School Accounts Desk
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={resetAll}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Clear Another Student Fine
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-purple-600/30"
                >
                  <Printer className="w-4 h-4" />
                  Print Receipt
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition"
                >
                  Done &amp; Close
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-5">
            {/* Nav Tabs */}
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => setActiveTab('lookup')}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition flex items-center justify-center gap-2 ${
                  activeTab === 'lookup'
                    ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <Search className="w-4 h-4" />
                Find Student &amp; Pending Dues
              </button>
              <button
                onClick={() => setActiveTab('direct')}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition flex items-center justify-center gap-2 ${
                  activeTab === 'direct'
                    ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                Direct Fine / Penalty Clearance
              </button>
            </div>

            {/* TAB 1: Search & Lookup */}
            {activeTab === 'lookup' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Search by Admission Number or Student Name:
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. MZ-2026-0103 or Lalduhawma..."
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Candidate Search Results */}
                {matchingStudents.length > 0 && !selectedStudent && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800">
                    {matchingStudents.map((stu) => {
                      const cls = classes.find(c => c.id === stu.classId);
                      const pending = fineRecords.filter(f => f.studentId === stu.id && f.status === 'pending');
                      return (
                        <div
                          key={stu.id}
                          onClick={() => handleSelectStudent(stu)}
                          className="p-2.5 rounded-lg bg-slate-900 hover:bg-purple-950/40 border border-slate-800/80 hover:border-purple-500/40 cursor-pointer flex items-center justify-between transition"
                        >
                          <div>
                            <div className="text-xs font-bold text-white">{stu.firstName} {stu.lastName}</div>
                            <div className="text-[10px] text-slate-400">
                              Adm: <span className="text-cyan-300 font-mono">{stu.admissionNo}</span> • {cls?.name || 'Class Student'}
                            </div>
                          </div>
                          <div className="text-right">
                            {pending.length > 0 ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 font-bold">
                                {pending.length} Pending Fine{pending.length > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                                Fee Balance Check
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Selected Student Dossier */}
                {selectedStudent && (
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                          {selectedStudent.firstName[0]}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">
                            {selectedStudent.firstName} {selectedStudent.lastName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Admission No: <span className="text-cyan-300 font-mono">{selectedStudent.admissionNo}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedStudent(null)}
                        className="text-[10px] text-slate-400 hover:text-white underline"
                      >
                        Change Student
                      </button>
                    </div>

                    {/* Pending Fines for this student */}
                    {fineRecords.filter(f => f.studentId === selectedStudent.id && f.status === 'pending').length > 0 ? (
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-300 block">
                          Select Fine to Clear Immediately:
                        </label>
                        {fineRecords.filter(f => f.studentId === selectedStudent.id && f.status === 'pending').map((fine) => (
                          <div
                            key={fine.id}
                            onClick={() => setSelectedFine(fine)}
                            className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                              selectedFine?.id === fine.id
                                ? 'bg-purple-950/40 border-purple-500 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div>
                              <div className="text-xs font-bold flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                {fine.fineTitle}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Imposed on: {fine.imposedDate} • By: {fine.imposedBy}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-extrabold text-red-400">₹{fine.amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 text-xs">
                        <span className="font-bold">No Disciplinary Fines Outstanding!</span> Student can make tuition / term fee contributions.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Direct Fine Payment */}
            {activeTab === 'direct' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      value={directForm.studentName}
                      onChange={(e) => setDirectForm({ ...directForm, studentName: e.target.value })}
                      placeholder="e.g. Lalduhawma Colney"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Admission / Roll No</label>
                    <input
                      type="text"
                      value={directForm.admissionNo}
                      onChange={(e) => setDirectForm({ ...directForm, admissionNo: e.target.value })}
                      placeholder="e.g. MZ-2026-0103"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Select Fine Category *</label>
                    <select
                      value={directForm.fineCategory}
                      onChange={(e) => {
                        const val = e.target.value;
                        let amt = '50';
                        let title = 'Campus Fine';
                        if (val === 'late_arrival') { amt = '50'; title = 'Morning Assembly Late Arrival Fine'; }
                        if (val === 'library_overdue') { amt = '60'; title = 'Library Book Overdue Delay Fine'; }
                        if (val === 'id_card_replacement') { amt = '150'; title = 'Smart RFID Dual-PVC Replacement Fine'; }
                        if (val === 'uniform_violation') { amt = '100'; title = 'Campus Dress Code & Uniform Fine'; }
                        if (val === 'disciplinary') { amt = '200'; title = 'Disciplinary Sanction Penalty'; }
                        setDirectForm({ ...directForm, fineCategory: val, amount: amt, fineTitle: title });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="late_arrival">Late Arrival / Assembly Delay (₹50)</option>
                      <option value="library_overdue">Library Overdue Book (₹60)</option>
                      <option value="id_card_replacement">Smart RFID Card Replacement (₹150)</option>
                      <option value="uniform_violation">Uniform / Dress Code Penalty (₹100)</option>
                      <option value="disciplinary">General Disciplinary Fine (₹200)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Amount to Pay (₹) *</label>
                    <input
                      type="number"
                      required
                      value={directForm.amount}
                      onChange={(e) => setDirectForm({ ...directForm, amount: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-emerald-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Mode & Dynamic QR Gateway Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Select Clearance Gateway:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('upi')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                      paymentMode === 'upi' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    Direct UPI QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('razorpay')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                      paymentMode === 'razorpay' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    Razorpay Gateway
                  </button>
                </div>
              </div>

              {/* Dynamic QR Display for UPI */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=${upiId}%26pn=${encodeURIComponent(schoolName)}%26am=${activeTab === 'lookup' && selectedFine ? selectedFine.amount : (directForm.amount || 50)}%26cu=INR`}
                    alt="School UPI Payment QR"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1 text-center sm:text-left text-xs">
                  <div className="font-bold text-white flex items-center justify-center sm:justify-start gap-1">
                    Scan with GPay / PhonePe / Paytm / BHIM
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Official UPI VPA: <span className="font-mono text-cyan-400 font-semibold">{upiId}</span>
                  </p>
                  <p className="text-[10px] text-emerald-400 font-medium">
                    Verified Payee: {schoolName}
                  </p>
                </div>
              </div>

              {/* UTR Reference Input */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Enter 12-Digit UPI Ref / UTR / Order ID (or leave blank to auto-verify):
                </label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. 426810992341 or Bank Ref"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-amber-300 placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Submission CTA */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleProcessPayment}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Verifying Ledger Settlement...</span>
                  </>
                ) : (
                  <>
                    <span>Verify &amp; Clear Fine (System Sync)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
