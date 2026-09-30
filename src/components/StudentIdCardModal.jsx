import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CreditCard, 
  FileText, 
  Sliders, 
  QrCode, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  Check, 
  RefreshCw, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  Hash,
  Radio,
  Wifi,
  Cpu,
  Save,
  Layers,
  RotateCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { buildStudentQrPayload, serializeStudentQr } from '../lib/qrCodeService';
import { useSchool } from '../context/SchoolContext';

export default function StudentIdCardModal({ 
  isOpen, 
  onClose, 
  initialStudent = null,
  selectedClassId = null
}) {
  const { students, classes, systemConfig, activeSchoolInfo, activeSchoolId, updateStudent } = useSchool();

  const [activeMode, setActiveMode] = useState('id_card'); // 'id_card', 'admit_card', 'config'
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudent?.id || students[0]?.id);
  const [selectedClass, setSelectedClass] = useState(selectedClassId || initialStudent?.classId || classes[0]?.id);
  const [cardTheme, setCardTheme] = useState('indigo'); // 'indigo', 'cyan', 'cyber', 'emerald'
  const [isBulkPrint, setIsBulkPrint] = useState(false);
  const [cardSide, setCardSide] = useState('both'); // 'front', 'back', 'both'

  // RFID Card Pairing State
  const [rfidInput, setRfidInput] = useState('');
  const [rfidPairingSuccess, setRfidPairingSuccess] = useState(false);
  const [rfidPairingMsg, setRfidPairingMsg] = useState('');

  // Admit Card Exam Details
  const [examName, setExamName] = useState('Annual Board Examination 2026');
  const [examCenter, setExamCenter] = useState(() => `${activeSchoolInfo?.name || 'School'} Campus, ${activeSchoolInfo?.address || 'Main Campus'}`);

  // ID Card & Admit Card Custom Configuration State
  const [cardConfig, setCardConfig] = useState(() => ({
    schoolName: activeSchoolInfo?.name || systemConfig?.schoolName || 'Our School',
    schoolMotto: activeSchoolInfo?.motto || systemConfig?.motto || 'Knowledge is Light',
    affiliationNo: activeSchoolInfo?.affiliationBadge || systemConfig?.affiliationNo || 'MBSE Affiliated',
    validThru: 'March 2027',
    showQrCode: true,
    showRfidBadge: true,
    rfidFrequency: '13.56 MHz (Mifare/NFC)',
    showPrincipalSignature: true,
    showWatermark: true,
    emergencyPhone: activeSchoolInfo?.contactPhone || systemConfig?.contactPhone || '+91 98623 00000',
    instructions: `1. This Smart ID Card contains a contactless RFID chip & verification QR.\n2. Must be carried and tapped at school biometric gate terminals.\n3. Non-transferable. Report loss immediately to Administrative Office.\n4. Found cards must be returned to School Office, Aizawl.`
  }));

  useEffect(() => {
    if (activeSchoolInfo || systemConfig) {
      setCardConfig(prev => ({
        ...prev,
        schoolName: activeSchoolInfo?.name || systemConfig?.schoolName || prev.schoolName,
        schoolMotto: activeSchoolInfo?.motto || systemConfig?.motto || prev.schoolMotto,
        affiliationNo: activeSchoolInfo?.affiliationBadge || systemConfig?.affiliationNo || prev.affiliationNo,
        emergencyPhone: activeSchoolInfo?.contactPhone || systemConfig?.contactPhone || prev.emergencyPhone,
        instructions: `1. This Smart ID Card contains a contactless RFID chip & verification QR.\n2. Must be carried and tapped at school biometric gate terminals.\n3. Non-transferable. Report loss immediately to Administrative Office.\n4. Found cards must be returned to ${activeSchoolInfo?.address || 'School Office'}.`
      }));
      setExamCenter(`${activeSchoolInfo?.name || 'School'} Campus, ${activeSchoolInfo?.address || 'Main Campus'}`);
    }
  }, [activeSchoolInfo, activeSchoolId, systemConfig, isOpen]);

  const currentStudent = students.find(s => s.id === selectedStudentId) || initialStudent || students[0];
  const targetClassStudents = students.filter(s => s.classId === selectedClass);
  const targetClassObj = classes.find(c => c.id === (isBulkPrint ? selectedClass : currentStudent?.classId)) || classes[0];

  // Sync RFID input when currentStudent changes
  useEffect(() => {
    if (currentStudent) {
      setRfidInput(currentStudent.rfidCardUid || '');
      setRfidPairingSuccess(false);
      setRfidPairingMsg('');
    }
  }, [currentStudent?.id]);

  if (!isOpen) return null;

  // Handle saving RFID Card UID
  const handleSaveRfidUid = (e) => {
    if (e) e.preventDefault();
    if (!currentStudent) return;
    const cleanUid = rfidInput.trim();
    if (cleanUid) {
      if (updateStudent) {
        updateStudent(currentStudent.id, { rfidCardUid: cleanUid });
      }
      setRfidPairingSuccess(true);
      setRfidPairingMsg(`Card UID [${cleanUid}] assigned to ${currentStudent.firstName}!`);
      setTimeout(() => {
        setRfidPairingSuccess(false);
      }, 3500);
    }
  };

  // Auto-generate standard 10-digit RFID UID
  const handleGenerateRandomRfid = () => {
    const rawNumber = (currentStudent?.rollNumber || '1').toString().padStart(2, '0');
    const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
    const newUid = `00${rawNumber}${randomSuffix}`;
    setRfidInput(newUid);
    if (currentStudent && updateStudent) {
      updateStudent(currentStudent.id, { rfidCardUid: newUid });
      setRfidPairingSuccess(true);
      setRfidPairingMsg(`Generated & Linked RFID UID: ${newUid}`);
      setTimeout(() => setRfidPairingSuccess(false), 3500);
    }
  };

  // Default Exam Schedule Routine
  const examRoutine = [
    { date: '2026-05-18', time: '09:30 AM - 12:30 PM', subject: 'English & Literature', room: 'Hall A - Seat 12' },
    { date: '2026-05-19', time: '09:30 AM - 12:30 PM', subject: 'Mizo (MIL)', room: 'Hall A - Seat 12' },
    { date: '2026-05-20', time: '09:30 AM - 12:30 PM', subject: 'Mathematics / Logic', room: 'Hall A - Seat 12' },
    { date: '2026-05-21', time: '09:30 AM - 12:30 PM', subject: 'Science / Physics / Pol Sci', room: 'Hall A - Seat 12' },
    { date: '2026-05-22', time: '09:30 AM - 12:30 PM', subject: 'Social Studies / Biology', room: 'Hall A - Seat 12' }
  ];

  // Handle Browser Native Print
  const handlePrint = () => {
    window.print();
  };

  // Theme Styles
  const themeStyles = {
    indigo: {
      headerBg: 'bg-gradient-to-r from-indigo-900 via-indigo-700 to-indigo-900',
      accentColor: 'text-indigo-600',
      borderColor: 'border-indigo-500/30',
      cardBg: 'bg-slate-900 text-white',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
    },
    cyan: {
      headerBg: 'bg-gradient-to-r from-cyan-900 via-cyan-700 to-cyan-900',
      accentColor: 'text-cyan-500',
      borderColor: 'border-cyan-500/30',
      cardBg: 'bg-slate-950 text-white',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
    },
    emerald: {
      headerBg: 'bg-gradient-to-r from-emerald-900 via-emerald-700 to-emerald-900',
      accentColor: 'text-emerald-500',
      borderColor: 'border-emerald-500/30',
      cardBg: 'bg-slate-900 text-white',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
    },
    cyber: {
      headerBg: 'bg-gradient-to-r from-purple-950 via-pink-900 to-slate-950',
      accentColor: 'text-pink-500',
      borderColor: 'border-pink-500/40',
      cardBg: 'bg-black text-white',
      badgeBg: 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
    }
  };

  const activeTheme = themeStyles[cardTheme] || themeStyles.indigo;

  // Render optical barcode pattern for RFID UID
  const renderBarcodePattern = (codeStr = '0014829102') => {
    const clean = String(codeStr || '00123456');
    const bars = [];
    for (let i = 0; i < clean.length; i++) {
      const val = (clean.charCodeAt(i) % 3) + 1;
      bars.push(val);
      bars.push(1);
    }
    return (
      <div className="flex items-center justify-center gap-[1.5px] h-8 px-2 bg-white rounded shadow-inner">
        {bars.map((w, idx) => (
          <div 
            key={idx} 
            className={`h-full ${idx % 2 === 0 ? 'bg-slate-950' : 'bg-transparent'}`}
            style={{ width: `${Math.max(1, w)}px` }}
          />
        ))}
      </div>
    );
  };

  // CARD FRONT RENDER
  const renderCardFront = (student) => {
    const studentClass = classes.find(c => c.id === student.classId);
    const rfidDisplayUid = student.rfidCardUid || `00${(student.rollNumber || '01').toString().padStart(2, '0')}${student.id.replace(/\D/g, '').padEnd(6, '7')}`;

    return (
      <div 
        key={`front-${student.id}`} 
        className="w-[330px] h-[510px] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 flex flex-col relative print:border-slate-400 print:shadow-none print:m-2 print:break-inside-avoid shrink-0 select-none"
      >
        {/* Front Header */}
        <div className={`p-4 text-center ${activeTheme.headerBg} text-white relative`}>
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md mx-auto mb-1 flex items-center justify-center font-bold font-['Outfit'] text-xs border border-white/30">
            MZS
          </div>
          <h3 className="font-extrabold text-sm tracking-wide uppercase font-['Outfit'] leading-tight">
            {cardConfig.schoolName}
          </h3>
          <p className="text-[10px] text-white/80 italic mt-0.5">{cardConfig.schoolMotto}</p>
          <div className="text-[9px] text-white/60 font-mono mt-0.5">Affiliation: {cardConfig.affiliationNo}</div>
        </div>

        {/* Student Photo & Identity */}
        <div className="p-3.5 flex-1 flex flex-col items-center justify-between relative bg-slate-900 text-white">
          {/* Subtle Crest Watermark */}
          {cardConfig.showWatermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <ShieldCheck className="w-48 h-48 text-white" />
            </div>
          )}

          {/* Photo */}
          <div className="relative mt-0.5">
            <img 
              src={student.photoUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`} 
              alt={student.firstName}
              className="w-24 h-28 object-cover rounded-xl border-2 border-slate-700 shadow-md" 
            />
            {student.status === 'suspended' ? (
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold text-[9px] uppercase tracking-wider shadow animate-pulse">
                SUSPENDED
              </span>
            ) : (
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-cyan-500 text-slate-950 font-bold text-[9px] uppercase tracking-wider shadow">
                STUDENT
              </span>
            )}
          </div>

          {/* Name & Class */}
          <div className="text-center mt-1.5 space-y-0.5">
            <h4 className="font-extrabold text-base text-white tracking-tight">
              {student.firstName} {student.lastName}
            </h4>
            <p className="text-xs font-semibold text-cyan-400">
              Class {studentClass?.name || 'Class 12 Science'} • Sec {student.section || 'A'}
            </p>
          </div>

          {/* Info Grid */}
          <div className="w-full grid grid-cols-2 gap-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] mt-1.5">
            <div>
              <span className="text-slate-500 block text-[8px] uppercase font-mono">Roll Number</span>
              <span className="font-bold text-slate-200">#{student.rollNumber || '14'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[8px] uppercase font-mono">Blood Group</span>
              <span className="font-bold text-rose-400">{student.bloodGroup || 'O+'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[8px] uppercase font-mono">Student ID</span>
              <span className="font-mono text-slate-300 font-semibold">{student.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[8px] uppercase font-mono">Emergency</span>
              <span className="font-mono text-slate-300 text-[10px]">{student.guardianPhone || cardConfig.emergencyPhone}</span>
            </div>
          </div>

          {/* RFID Smart Chip Badge Banner */}
          {cardConfig.showRfidBadge && (
            <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-slate-950 border border-cyan-500/30 text-[10px] mt-1.5">
              <div className="flex items-center gap-1.5 text-cyan-300">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="font-bold tracking-wider uppercase font-mono text-[8px]">RFID TAP PASS</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-slate-300 text-[8px]">
                <span className="text-slate-500">UID:</span>
                <span className="font-bold text-cyan-200">{rfidDisplayUid}</span>
              </div>
            </div>
          )}

          {/* Official Cryptographic Student QR Code & Signature Block */}
          <div className="w-full flex items-center justify-between pt-2 border-t border-slate-800 mt-1 px-1">
            {cardConfig.showQrCode && (
              <div className="flex items-center gap-2">
                <div className="p-1 bg-white rounded-lg shadow-sm border border-slate-300 shrink-0">
                  <QRCodeSVG 
                    value={serializeStudentQr(buildStudentQrPayload({
                      id: student.id,
                      name: `${student.firstName} ${student.lastName}`,
                      rollNo: student.rollNo || student.rollNumber || 1,
                      classId: student.classId,
                      className: studentClass?.name || 'Class 12',
                      stage: studentClass?.stage || 'higher_secondary',
                      stream: studentClass?.stream || 'science',
                      parentPhone: student.guardianPhone || student.parentPhone || '',
                      bloodGroup: student.bloodGroup || 'O+'
                    }))} 
                    size={42} 
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <div className="text-left space-y-0.5">
                  <span className="text-[8px] font-bold text-cyan-400 block font-mono leading-none">STUDENT QR</span>
                  <div className="text-[8px] font-mono text-slate-300 font-semibold">{student.id}</div>
                  <div className="text-[7px] text-emerald-400 font-semibold flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" /> In-App Scannable
                  </div>
                </div>
              </div>
            )}

            {cardConfig.showPrincipalSignature && (
              <div className="text-right">
                <div className="font-serif italic text-cyan-300 text-xs font-bold leading-none">
                  Lalthansanga
                </div>
                <span className="text-[7px] text-slate-500 uppercase font-mono block">Principal</span>
              </div>
            )}
          </div>
        </div>

        {/* Card Front Footer Bar */}
        <div className="p-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[8px] text-slate-500 px-3">
          <span>Valid Thru: <strong className="text-slate-300">{cardConfig.validThru}</strong></span>
          <span>Aizawl, Mizoram</span>
        </div>
      </div>
    );
  };

  // CARD BACK RENDER
  const renderCardBack = (student) => {
    const rfidDisplayUid = student.rfidCardUid || `00${(student.rollNumber || '01').toString().padStart(2, '0')}${student.id.replace(/\D/g, '').padEnd(6, '7')}`;

    return (
      <div 
        key={`back-${student.id}`} 
        className="w-[330px] h-[510px] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 flex flex-col justify-between relative print:border-slate-400 print:shadow-none print:m-2 print:break-inside-avoid shrink-0 select-none text-white"
      >
        <div>
          {/* Magnetic Stripe Simulator */}
          <div className="w-full h-10 bg-slate-950 border-b border-slate-800 mt-3 relative flex items-center px-4">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent opacity-60"></div>
          </div>

          {/* Back Content Header */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[9px] uppercase font-mono text-cyan-400 font-bold tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cardholder Terms &amp; Rules</span>
              </span>
              <span className="text-[8px] font-mono text-slate-400">MBSE / SCMS Standard</span>
            </div>

            {/* Instruction Bullet Points */}
            <div className="space-y-1.5 text-[8.5px] text-slate-300 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <div className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">1.</span>
                <span>Card hi school premises chhungah pai reng tur a ni a, entry/exit biometric terminal-ah tap tur a ni.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">2.</span>
                <span>Contactless RFID Chip (13.56MHz) leh QR code a in-thlunzawm vek a, midang hman tir phal a ni lo.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">3.</span>
                <span>Card bo emaw chhia a awm chuan Admin Office-ah hriattir vat tur a ni.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">4.</span>
                <span>A chhar tute chuan a hnuaia School Office Address-ah hian khawngaihin pek kir tur a ni e.</span>
              </div>
            </div>

            {/* Emergency & Medical Box */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-rose-950/20 via-slate-950 to-slate-950 border border-rose-500/20 text-[9px] space-y-1">
              <div className="font-bold text-rose-300 flex items-center gap-1 text-[8px] uppercase font-mono">
                <Phone className="w-2.5 h-2.5" /> Emergency Contacts
              </div>
              <div className="grid grid-cols-2 gap-1 text-[8px] text-slate-300">
                <div>
                  <span className="text-slate-500 block">School Office:</span>
                  <span className="font-mono font-bold">{cardConfig.emergencyPhone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Nearest Hospital:</span>
                  <span className="font-semibold text-rose-300">Civil Hospital Aizawl</span>
                </div>
              </div>
            </div>

            {/* Optical Barcode of RFID UID */}
            <div className="pt-1 text-center space-y-1">
              {renderBarcodePattern(rfidDisplayUid)}
              <div className="font-mono text-[8px] tracking-widest text-slate-400">
                *{rfidDisplayUid}*
              </div>
            </div>
          </div>
        </div>

        {/* Back Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[8px] text-slate-400 flex items-center justify-between">
          <div className="space-y-0.5 text-left">
            <span className="font-bold text-white block">{cardConfig.schoolName}</span>
            <span className="text-slate-500">{activeSchoolInfo?.address || 'Aizawl, Mizoram'}</span>
          </div>
          <div className="text-right">
            <span className="text-[7px] text-slate-500 uppercase block font-mono">Official Seal</span>
            <span className="font-serif italic text-cyan-400 font-bold">Authorized Signatory</span>
          </div>
        </div>
      </div>
    );
  };

  // Single ID Card Render (Front, Back, or Both)
  const renderSingleIdCard = (student) => {
    if (cardSide === 'front') return renderCardFront(student);
    if (cardSide === 'back') return renderCardBack(student);
    return (
      <div key={`both-${student.id}`} className="flex flex-wrap items-center justify-center gap-4">
        {renderCardFront(student)}
        {renderCardBack(student)}
      </div>
    );
  };

  // Exam Admit Card Render
  const renderSingleAdmitCard = (student) => {
    const studentClass = classes.find(c => c.id === student.classId);
    return (
      <div 
        key={student.id} 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl relative print:border-slate-400 print:shadow-none print:m-4 print:break-inside-avoid print:bg-white print:text-black select-none"
      >
        {/* Admit Card Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-lg font-['Outfit']">
              MZS
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base font-['Outfit'] uppercase">
                {cardConfig.schoolName}
              </h3>
              <p className="text-xs text-cyan-400 font-semibold">{examName}</p>
              <span className="text-[10px] text-slate-400 font-mono">Examination Center: {examCenter}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold font-mono">
              OFFICIAL HALL TICKET
            </span>
          </div>
        </div>

        {/* Candidate Detail Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b border-slate-800 items-center">
          <div className="flex items-center gap-3">
            <img 
              src={student.photoUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`} 
              alt={student.firstName} 
              className="w-16 h-20 object-cover rounded-xl border border-slate-700 shadow"
            />
            <div>
              <h4 className="font-bold text-sm text-white">{student.firstName} {student.lastName}</h4>
              <p className="text-xs text-slate-400">Roll No: <strong className="text-cyan-400">#{student.rollNumber || '1'}</strong></p>
              <p className="text-[10px] text-slate-500 font-mono">ID: {student.id}</p>
              <p className="text-[10px] text-cyan-300 font-mono">RFID: {student.rfidCardUid || 'Unassigned'}</p>
            </div>
          </div>

          <div className="space-y-1 text-xs text-slate-300">
            <div>Class / Stream: <strong>{studentClass?.name || 'Class 12'}</strong></div>
            <div>Section: <strong>{student.section || 'A'}</strong></div>
            <div>Blood Group: <strong className="text-rose-400">{student.bloodGroup || 'O+'}</strong></div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <div className="p-1.5 bg-white rounded-xl shadow shrink-0">
              <QRCodeSVG 
                value={serializeStudentQr(buildStudentQrPayload({
                  id: student.id,
                  name: `${student.firstName} ${student.lastName}`,
                  rollNo: student.rollNo || student.rollNumber || 1,
                  classId: student.classId,
                  className: studentClass?.name || 'Class 12',
                  stage: studentClass?.stage || 'higher_secondary',
                  stream: studentClass?.stream || 'science',
                  parentPhone: student.guardianPhone || '',
                  bloodGroup: student.bloodGroup || 'O+'
                }))} 
                size={60} 
              />
            </div>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="py-4">
          <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Subject Examination Routine</h5>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Time</th>
                  <th className="p-2.5">Subject</th>
                  <th className="p-2.5">Room / Desk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {examRoutine.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-2.5 font-mono text-[11px] text-cyan-300">{item.date}</td>
                    <td className="p-2.5 text-slate-300">{item.time}</td>
                    <td className="p-2.5 font-semibold text-white">{item.subject}</td>
                    <td className="p-2.5 text-slate-400">{item.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            <div className="h-8"></div>
            <span className="block border-t border-slate-700 pt-1 text-[10px] font-mono">Candidate Signature</span>
          </div>
          <div className="text-right">
            <div className="font-serif italic text-cyan-300 text-sm font-bold">Lalthansanga</div>
            <span className="block border-t border-slate-700 pt-1 text-[10px] font-mono uppercase">Principal &amp; Controller</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Print-specific style tag */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #id-print-zone, #id-print-zone * {
            visibility: visible;
          }
          #id-print-zone {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: auto;
            margin: 8mm;
          }
        }
      `}</style>

      <div className="relative w-full max-w-5xl h-[92vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="no-print p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                <span>Smart ID Card &amp; RFID Pass Studio</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  CR80 PVC / A4 Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Official PVC Student ID Cards with RFID Chip, QR Code, and instant Tap-to-Pair reader.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Control Bar: Modes, Filters, Card Side & Themes */}
        <div className="no-print p-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveMode('id_card')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'id_card' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Student Smart ID</span>
            </button>

            <button
              onClick={() => setActiveMode('admit_card')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'admit_card' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Exam Admit Card</span>
            </button>

            <button
              onClick={() => setActiveMode('config')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'config' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Card Config</span>
            </button>
          </div>

          {/* Student / Class Filter & Card Side Switcher */}
          {activeMode !== 'config' && (
            <div className="flex items-center flex-wrap gap-2.5">
              {/* Card Side Toggle for ID Card */}
              {activeMode === 'id_card' && (
                <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800">
                  <button
                    onClick={() => setCardSide('front')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      cardSide === 'front' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Front
                  </button>
                  <button
                    onClick={() => setCardSide('back')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      cardSide === 'back' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCardSide('both')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      cardSide === 'both' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Dual-Side
                  </button>
                </div>
              )}

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-semibold">
                <input
                  type="checkbox"
                  checked={isBulkPrint}
                  onChange={(e) => setIsBulkPrint(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-500"
                />
                <span>Bulk Class ({targetClassStudents.length})</span>
              </label>

              {isBulkPrint ? (
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 max-w-[200px]"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} (Roll #{s.rollNumber || '0'})
                    </option>
                  ))}
                </select>
              )}

              {/* Theme Selector for ID Card */}
              {activeMode === 'id_card' && (
                <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                  {['indigo', 'cyan', 'emerald', 'cyber'].map(t => (
                    <button
                      key={t}
                      onClick={() => setCardTheme(t)}
                      className={`w-5 h-5 rounded-full border-2 transition ${
                        cardTheme === t ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-60'
                      } ${
                        t === 'indigo' ? 'bg-indigo-600' :
                        t === 'cyan' ? 'bg-cyan-500' :
                        t === 'emerald' ? 'bg-emerald-500' : 'bg-pink-600'
                      }`}
                      title={`${t} theme`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RFID Card Quick-Pair Station Bar (Only visible in single ID card mode) */}
        {activeMode === 'id_card' && !isBulkPrint && currentStudent && (
          <div className="no-print px-4 py-2.5 bg-gradient-to-r from-slate-950 via-cyan-950/30 to-slate-950 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>RFID Card Pairing Station</span>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    ({currentStudent.firstName} {currentStudent.lastName})
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Tap card on USB Reader or enter 10-digit UID to link attendance &amp; gate access.
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveRfidUid} className="flex items-center gap-2">
              <input
                type="text"
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                placeholder="Tap RFID card or type UID..."
                className="px-3 py-1 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-200 text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 w-48 sm:w-56"
              />
              <button
                type="submit"
                className="px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={handleGenerateRandomRfid}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                title="Generate new 10-digit UID"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Auto-UID</span>
              </button>
            </form>

            {rfidPairingSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/30 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{rfidPairingMsg || 'RFID Card paired successfully!'}</span>
              </span>
            )}
          </div>
        )}

        {/* Body Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-950/50 flex items-center justify-center">
          
          {/* 1. STUDENT ID CARD VIEW */}
          {activeMode === 'id_card' && (
            <div id="id-print-zone" className="w-full flex flex-wrap items-center justify-center gap-6">
              {isBulkPrint ? (
                targetClassStudents.map(student => renderSingleIdCard(student))
              ) : (
                renderSingleIdCard(currentStudent)
              )}
            </div>
          )}

          {/* 2. EXAM ADMIT CARD VIEW */}
          {activeMode === 'admit_card' && (
            <div id="id-print-zone" className="w-full flex flex-col items-center justify-center space-y-6">
              {isBulkPrint ? (
                targetClassStudents.map(student => renderSingleAdmitCard(student))
              ) : (
                renderSingleAdmitCard(currentStudent)
              )}
            </div>
          )}

          {/* 3. CARD CONFIGURATION TAB */}
          {activeMode === 'config' && (
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Identity Card &amp; Admit Card Format Configuration</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Printed Institution Name</label>
                  <input
                    type="text"
                    value={cardConfig.schoolName}
                    onChange={(e) => setCardConfig({ ...cardConfig, schoolName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Institution Motto</label>
                  <input
                    type="text"
                    value={cardConfig.schoolMotto}
                    onChange={(e) => setCardConfig({ ...cardConfig, schoolMotto: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Card Validity Period</label>
                  <input
                    type="text"
                    value={cardConfig.validThru}
                    onChange={(e) => setCardConfig({ ...cardConfig, validThru: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    placeholder="e.g. March 2027"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Emergency Telephone Number</label>
                  <input
                    type="text"
                    value={cardConfig.emergencyPhone}
                    onChange={(e) => setCardConfig({ ...cardConfig, emergencyPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-slate-200 text-xs font-bold block flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-cyan-400" /> RFID Chip Badge
                    </span>
                    <span className="text-[10px] text-slate-400">Prints Contactless wave logo &amp; UID on card front</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={cardConfig.showRfidBadge}
                    onChange={(e) => setCardConfig({ ...cardConfig, showRfidBadge: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-500 cursor-pointer"
                  />
                </label>

                <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-slate-200 text-xs font-bold block flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-cyan-400" /> Smart Student QR Code
                    </span>
                    <span className="text-[10px] text-slate-400">Encodes student profile for in-app live camera scanner</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={cardConfig.showQrCode}
                    onChange={(e) => setCardConfig({ ...cardConfig, showQrCode: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-500 cursor-pointer"
                  />
                </label>

                <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-slate-200 text-xs font-bold block">Principal Signature</span>
                    <span className="text-[10px] text-slate-400">Official digital seal &amp; controller endorsement</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={cardConfig.showPrincipalSignature}
                    onChange={(e) => setCardConfig({ ...cardConfig, showPrincipalSignature: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-500 cursor-pointer"
                  />
                </label>

                <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-slate-200 text-xs font-bold block">Emboss Crest Watermark</span>
                    <span className="text-[10px] text-slate-400">Anti-counterfeit institutional background emblem</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={cardConfig.showWatermark}
                    onChange={(e) => setCardConfig({ ...cardConfig, showWatermark: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-500 cursor-pointer"
                  />
                </label>
              </div>

              <div className="pt-2">
                <label className="font-bold text-slate-300">Exam Name / Term</label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveMode('id_card')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save &amp; View Preview</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
