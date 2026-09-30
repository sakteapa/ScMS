import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, 
  Printer, 
  Download, 
  Search, 
  Filter, 
  Sparkles, 
  Check, 
  RefreshCw, 
  Radio, 
  Sliders, 
  FileText, 
  ShieldCheck, 
  Users, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  Hash, 
  CheckCircle2, 
  AlertCircle, 
  RotateCw, 
  Cpu, 
  Layers, 
  Share2, 
  Eye, 
  Save,
  QrCode,
  Zap,
  ArrowRight,
  FileSpreadsheet
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { buildStudentQrPayload, serializeStudentQr } from '../lib/qrCodeService';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export default function IdCardStudioView() {
  const { students = [], classes = [], systemConfig, activeSchoolInfo, activeSchoolId, updateStudent } = useSchool();
  const { currentUser, isPrincipal, isVicePrincipal, isTeacher } = useAuth();

  // Primary Sub-tabs
  const [activeTab, setActiveTab] = useState('single_studio'); // 'single_studio' | 'batch_print' | 'rfid_hub' | 'admit_cards' | 'template_config'
  
  // Selection States
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || 'all');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [rfidFilter, setRfidFilter] = useState('all'); // 'all' | 'linked' | 'unlinked'

  // Batch Print Selection
  const [selectedStudentIds, setSelectedStudentIds] = useState(() => students.map(s => s.id));
  const [printLayout, setPrintLayout] = useState('cr80'); // 'cr80' (Direct PVC) | 'a4_grid' (8 per sheet) | 'a4_folded'
  const [cardSide, setCardSide] = useState('both'); // 'front' | 'back' | 'both'
  const [cardTheme, setCardTheme] = useState('indigo'); // 'indigo' | 'cyan' | 'emerald' | 'cyber' | 'crimson'

  // RFID Card Pairing
  const [rfidInput, setRfidInput] = useState('');
  const [usbTapListener, setUsbTapListener] = useState('');
  const [pairingToast, setPairingToast] = useState(null);

  // Admit Card State
  const [examName, setExamName] = useState('Annual Board Examination 2026');
  const [examCenter, setExamCenter] = useState(() => `${activeSchoolInfo?.name || 'School'} Main Campus, Aizawl`);

  // Template Designer Configuration
  const [cardConfig, setCardConfig] = useState(() => ({
    schoolName: activeSchoolInfo?.name || systemConfig?.schoolName || 'Govt. Mizo Higher Secondary School',
    schoolMotto: activeSchoolInfo?.motto || systemConfig?.motto || 'Knowledge is Light',
    affiliationNo: activeSchoolInfo?.affiliationBadge || systemConfig?.affiliationNo || 'MBSE / SCMS Reg. 2026',
    validThru: 'March 2027',
    showQrCode: true,
    showRfidBadge: true,
    rfidFrequency: '13.56 MHz (Mifare / NFC)',
    showPrincipalSignature: true,
    principalName: 'Lalthansanga',
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
        emergencyPhone: activeSchoolInfo?.contactPhone || systemConfig?.contactPhone || prev.emergencyPhone
      }));
      setExamCenter(`${activeSchoolInfo?.name || 'School'} Main Campus, Aizawl`);
    }
  }, [activeSchoolInfo, systemConfig]);

  // Filtered Students
  const filteredStudents = students.filter(s => {
    const matchesClass = selectedClassId === 'all' || s.classId === selectedClassId;
    const matchesQuery = !searchQuery.trim() || 
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.rollNumber && s.rollNumber.toString().includes(searchQuery)) ||
      (s.rollNo && s.rollNo.toString().includes(searchQuery)) ||
      (s.id && s.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.rfidCardUid && s.rfidCardUid.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRfid = rfidFilter === 'all' || 
      (rfidFilter === 'linked' && !!s.rfidCardUid) || 
      (rfidFilter === 'unlinked' && !s.rfidCardUid);
    return matchesClass && matchesQuery && matchesRfid;
  });

  const currentStudent = students.find(s => s.id === selectedStudentId) || filteredStudents[0] || students[0];

  useEffect(() => {
    if (currentStudent) {
      setRfidInput(currentStudent.rfidCardUid || '');
    }
  }, [currentStudent?.id]);

  // Audio Beep for Hardware Tap
  const playHardwareBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  };

  // Pair Single Student RFID
  const handleSaveRfid = (studentId, uidToSave) => {
    if (!studentId || !uidToSave) return;
    const clean = uidToSave.trim();
    if (updateStudent) {
      updateStudent(studentId, { rfidCardUid: clean });
    }
    playHardwareBeep();
    setPairingToast(`⚡ Linked RFID UID [${clean}] to student!`);
    setTimeout(() => setPairingToast(null), 3500);
  };

  // Auto Generate UID for single student
  const generateAutoUid = (student) => {
    const rawNumber = (student?.rollNumber || student?.rollNo || '1').toString().padStart(2, '0');
    const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
    const newUid = `00${rawNumber}${randomSuffix}`;
    setRfidInput(newUid);
    handleSaveRfid(student.id, newUid);
  };

  // Bulk Auto-assign UIDs for all unlinked
  const handleBulkAutoAssignRfid = () => {
    const unlinked = students.filter(s => !s.rfidCardUid);
    if (unlinked.length === 0) {
      alert('All students already have RFID card UIDs assigned!');
      return;
    }
    unlinked.forEach((st, idx) => {
      const rollStr = (st.rollNumber || st.rollNo || (idx + 1)).toString().padStart(2, '0');
      const suffix = Math.floor(100000 + Math.random() * 900000).toString();
      const newUid = `00${rollStr}${suffix}`;
      if (updateStudent) {
        updateStudent(st.id, { rfidCardUid: newUid });
      }
    });
    playHardwareBeep();
    setPairingToast(`✅ Successfully auto-assigned 13.56MHz RFID UIDs to ${unlinked.length} students!`);
    setTimeout(() => setPairingToast(null), 4000);
  };

  // Handle USB Desktop Tap Listener
  const handleUsbTapSubmit = (e) => {
    e.preventDefault();
    if (!usbTapListener.trim()) return;
    const scannedUid = usbTapListener.trim();
    if (currentStudent) {
      handleSaveRfid(currentStudent.id, scannedUid);
      setUsbTapListener('');
    }
  };

  // Export CSV of RFID Mappings
  const handleExportRfidCsv = () => {
    const header = ['Student ID', 'First Name', 'Last Name', 'Class', 'Roll Number', 'RFID Card UID', 'Guardian Phone'];
    const rows = students.map(s => [
      s.id,
      s.firstName,
      s.lastName,
      s.classId,
      s.rollNumber || s.rollNo || '',
      s.rfidCardUid || 'UNASSIGNED',
      s.guardianPhone || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RFID_Smart_Card_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Theme Colors
  const themeStyles = {
    indigo: {
      headerBg: 'bg-gradient-to-r from-indigo-900 via-indigo-700 to-indigo-900',
      accentColor: 'text-indigo-400',
      borderAccent: 'border-indigo-500/40',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      name: 'Royal Indigo'
    },
    cyan: {
      headerBg: 'bg-gradient-to-r from-cyan-950 via-cyan-800 to-cyan-950',
      accentColor: 'text-cyan-400',
      borderAccent: 'border-cyan-500/40',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      name: 'Cyber Cyan'
    },
    emerald: {
      headerBg: 'bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-950',
      accentColor: 'text-emerald-400',
      borderAccent: 'border-emerald-500/40',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      name: 'Emerald Crest'
    },
    crimson: {
      headerBg: 'bg-gradient-to-r from-rose-950 via-rose-800 to-rose-950',
      accentColor: 'text-rose-400',
      borderAccent: 'border-rose-500/40',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      name: 'Crimson Gold'
    },
    cyber: {
      headerBg: 'bg-gradient-to-r from-purple-950 via-pink-900 to-slate-950',
      accentColor: 'text-pink-400',
      borderAccent: 'border-pink-500/40',
      badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
      name: 'Neon Violet'
    }
  };

  const activeTheme = themeStyles[cardTheme] || themeStyles.indigo;

  // Optical Barcode Pattern Helper
  const renderBarcodePattern = (codeStr = '0014829102') => {
    const clean = String(codeStr || '00123456');
    const bars = [];
    for (let i = 0; i < clean.length; i++) {
      const val = (clean.charCodeAt(i) % 3) + 1;
      bars.push(val);
      bars.push(1);
    }
    return (
      <div className="flex items-center justify-center gap-[1.5px] h-7 px-2 bg-white rounded shadow-inner">
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
    const rfidDisplayUid = student.rfidCardUid || `00${(student.rollNumber || student.rollNo || '01').toString().padStart(2, '0')}${student.id.replace(/\D/g, '').padEnd(6, '7')}`;

    return (
      <div 
        key={`front-${student.id}`} 
        className="w-[330px] h-[510px] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 flex flex-col relative print:border-slate-400 print:shadow-none print:m-2 print:break-inside-avoid shrink-0 select-none text-white"
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
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-rose-500 text-white text-[9px] font-bold uppercase tracking-wider shadow">
                Suspended
              </span>
            ) : (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-wider shadow flex items-center gap-1">
                <Check className="w-2.5 h-2.5" /> ACTIVE
              </span>
            )}
          </div>

          {/* Name & Class */}
          <div className="text-center mt-1.5 space-y-0.5">
            <h4 className="font-extrabold text-base text-white tracking-tight">
              {student.firstName} {student.lastName}
            </h4>
            <p className={`text-xs font-semibold ${activeTheme.accentColor}`}>
              Class {studentClass?.name || 'Class 12'} &bull; Sec {student.section || 'A'}
            </p>
          </div>

          {/* Info Grid */}
          <div className="w-full grid grid-cols-2 gap-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] mt-1.5">
            <div>
              <span className="text-slate-500 block text-[8px] uppercase font-mono">Roll Number</span>
              <span className="font-bold text-slate-200">#{student.rollNumber || student.rollNo || '14'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[8px] uppercase font-mono">Blood Group</span>
              <span className="font-bold text-rose-400">{student.bloodGroup || 'O+'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[8px] uppercase font-mono">Student ID</span>
              <span className="font-mono text-slate-300 font-semibold text-[10px]">{student.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[8px] uppercase font-mono">Emergency</span>
              <span className="font-mono text-slate-300 text-[10px]">{student.guardianPhone || cardConfig.emergencyPhone}</span>
            </div>
          </div>

          {/* RFID Smart Chip Badge Banner */}
          {cardConfig.showRfidBadge && (
            <div className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border ${activeTheme.borderAccent} text-[10px] mt-1.5`}>
              <div className={`flex items-center gap-1.5 ${activeTheme.accentColor}`}>
                <Radio className="w-3.5 h-3.5 animate-pulse" />
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
                  <span className={`text-[8px] font-bold ${activeTheme.accentColor} block font-mono leading-none`}>STUDENT QR</span>
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
                  {cardConfig.principalName}
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
    const rfidDisplayUid = student.rfidCardUid || `00${(student.rollNumber || student.rollNo || '01').toString().padStart(2, '0')}${student.id.replace(/\D/g, '').padEnd(6, '7')}`;

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
              <span className={`text-[9px] uppercase font-mono ${activeTheme.accentColor} font-bold tracking-wider flex items-center gap-1.5`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cardholder Terms &amp; Rules</span>
              </span>
              <span className="text-[8px] font-mono text-slate-400">MBSE / SCMS Standard</span>
            </div>

            {/* Instruction Bullet Points */}
            <div className="space-y-1.5 text-[8.5px] text-slate-300 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <div className="flex items-start gap-1.5">
                <span className={`${activeTheme.accentColor} font-bold`}>1.</span>
                <span>Card hi school premises chhungah pai reng tur a ni a, entry/exit biometric terminal-ah tap tur a ni.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className={`${activeTheme.accentColor} font-bold`}>2.</span>
                <span>Contactless RFID Chip (13.56MHz) leh QR code a in-thlunzawm vek a, midang hman tir phal a ni lo.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className={`${activeTheme.accentColor} font-bold`}>3.</span>
                <span>Card bo emaw chhia a awm chuan Admin Office-ah hriattir vat tur a ni.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className={`${activeTheme.accentColor} font-bold`}>4.</span>
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

  // Exam Admit Card Routine
  const examRoutine = [
    { date: '2026-05-18', time: '09:30 AM - 12:30 PM', subject: 'English & Literature', room: 'Hall A - Seat 12' },
    { date: '2026-05-19', time: '09:30 AM - 12:30 PM', subject: 'Mizo (MIL)', room: 'Hall A - Seat 12' },
    { date: '2026-05-20', time: '09:30 AM - 12:30 PM', subject: 'Mathematics / Logic', room: 'Hall A - Seat 12' },
    { date: '2026-05-21', time: '09:30 AM - 12:30 PM', subject: 'Science / Physics / Pol Sci', room: 'Hall A - Seat 12' },
    { date: '2026-05-22', time: '09:30 AM - 12:30 PM', subject: 'Social Studies / Biology', room: 'Hall A - Seat 12' }
  ];

  // Single Admit Card Render
  const renderSingleAdmitCard = (student) => {
    const studentClass = classes.find(c => c.id === student.classId);
    return (
      <div 
        key={`admit-${student.id}`} 
        className="w-[620px] bg-white text-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-2xl relative print:border-slate-400 print:shadow-none print:m-4 print:break-inside-avoid select-none shrink-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              MZS
            </div>
            <div>
              <h3 className="font-extrabold text-base uppercase tracking-tight text-slate-900">
                {cardConfig.schoolName}
              </h3>
              <p className="text-xs text-slate-600 font-semibold">{examName}</p>
              <p className="text-[10px] text-slate-500 font-mono">Academic Session 2026-2027 &bull; Hall Ticket</p>
            </div>
          </div>

          <div className="text-right">
            <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-mono text-[10px] font-bold block">
              ADMIT CARD
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">Roll: #{student.rollNumber || student.rollNo || '01'}</span>
          </div>
        </div>

        {/* Student Meta Details & Photo */}
        <div className="grid grid-cols-4 gap-4 py-4 border-b border-slate-200">
          <div className="col-span-3 grid grid-cols-2 gap-y-2 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-mono block">Candidate Name</span>
              <strong className="text-sm text-slate-900">{student.firstName} {student.lastName}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-mono block">Class &amp; Section</span>
              <strong className="text-slate-800">Class {studentClass?.name || '12'} ({student.section || 'A'})</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-mono block">Examination Roll No</span>
              <strong className="font-mono text-cyan-800 text-sm font-bold">EXAM-2026-{(student.rollNumber || student.rollNo || '01').toString().padStart(3, '0')}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-mono block">Student APAAR / ID</span>
              <strong className="font-mono text-slate-700">{student.id}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 text-[10px] uppercase font-mono block">Exam Center &amp; Address</span>
              <strong className="text-slate-800 text-xs">{examCenter}</strong>
            </div>
          </div>

          <div className="col-span-1 flex flex-col items-center justify-center">
            <img 
              src={student.photoUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`} 
              alt={student.firstName}
              className="w-20 h-24 object-cover rounded-lg border border-slate-300 shadow-sm"
            />
            <span className="text-[8px] text-slate-400 mt-1 uppercase font-mono">Attested</span>
          </div>
        </div>

        {/* Routine Table */}
        <div className="py-3">
          <span className="text-[10px] font-bold uppercase font-mono text-slate-700 block mb-1.5">
            Subject Schedule &amp; Allocated Rooms
          </span>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 text-[10px] font-bold text-slate-700">
              <tr>
                <th className="p-1.5 border border-slate-200">Date</th>
                <th className="p-1.5 border border-slate-200">Time</th>
                <th className="p-1.5 border border-slate-200">Subject Paper</th>
                <th className="p-1.5 border border-slate-200">Room / Seat</th>
                <th className="p-1.5 border border-slate-200 text-center">Invigilator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[11px]">
              {examRoutine.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-1.5 font-mono text-[10px]">{r.date}</td>
                  <td className="p-1.5 text-[10px] text-slate-600">{r.time}</td>
                  <td className="p-1.5 font-bold text-slate-800">{r.subject}</td>
                  <td className="p-1.5 font-mono text-[10px]">{r.room}</td>
                  <td className="p-1.5 text-center text-slate-300">__________</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Instructions & Signatures */}
        <div className="pt-2 border-t border-slate-200 flex items-end justify-between">
          <div className="text-[9px] text-slate-500 max-w-sm space-y-0.5">
            <p>1. Candidates must arrive at examination hall 15 minutes prior to commencement.</p>
            <p>2. Electronic gadgets, smart watches, and unauthorized material strictly prohibited.</p>
            <p>3. This admit card must be produced on demand at each examination paper.</p>
          </div>

          <div className="flex items-center gap-6 text-center">
            <div>
              <div className="w-24 border-b border-slate-400 mb-1"></div>
              <span className="text-[8px] font-mono text-slate-500 uppercase block">Candidate Sign</span>
            </div>
            <div>
              <div className="font-serif italic text-sm font-bold text-slate-800">{cardConfig.principalName}</div>
              <span className="text-[8px] font-mono text-slate-500 uppercase block">Controller / Principal</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Calculations for Stats
  const totalStudentsCount = students.length;
  const pairedRfidCount = students.filter(s => !!s.rfidCardUid).length;
  const unlinkedRfidCount = totalStudentsCount - pairedRfidCount;

  return (
    <div className="space-y-6 pb-20">
      {/* Print Style Tag */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #id-studio-print-zone, #id-studio-print-zone * {
            visibility: visible !important;
          }
          #id-studio-print-zone {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            display: flex !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
            gap: 12px !important;
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

      {/* Module Header Bar */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white font-['Outfit'] flex items-center gap-2">
                <span>Smart ID &amp; RFID Studio</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  Dual-Side PVC
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Official PVC Student ID Cards, contactless 13.56MHz RFID pairing, QR authentication &amp; MBSE Admit Cards.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Current ({activeTab === 'batch_print' ? `${selectedStudentIds.length} Cards` : 'Card'})</span>
          </button>

          <button
            onClick={handleExportRfidCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export RFID CSV</span>
          </button>
        </div>
      </div>

      {/* Studio Quick Stats */}
      <div className="no-print grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Total Students</span>
            <span className="text-xl font-extrabold text-white font-['Outfit']">{totalStudentsCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">RFID Card Paired</span>
            <span className="text-xl font-extrabold text-emerald-400 font-['Outfit']">{pairedRfidCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Unlinked Cards</span>
            <span className="text-xl font-extrabold text-amber-400 font-['Outfit']">{unlinkedRfidCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Card Format</span>
            <span className="text-sm font-extrabold text-cyan-300 font-mono">CR80 (85.6&times;54mm)</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="inline-flex p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('single_studio')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'single_studio' 
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Interactive 3D Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('batch_print')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'batch_print' 
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Batch PVC &amp; A4 Sheet Print</span>
          </button>

          <button
            onClick={() => setActiveTab('rfid_hub')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'rfid_hub' 
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>⚡ RFID Pairing Station</span>
          </button>

          <button
            onClick={() => setActiveTab('admit_cards')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'admit_cards' 
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Exam Admit Cards</span>
          </button>

          <button
            onClick={() => setActiveTab('template_config')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'template_config' 
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Template Designer</span>
          </button>
        </div>

        {pairingToast && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-fadeIn flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{pairingToast}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INTERACTIVE 3D CARD STUDIO */}
      {/* ========================================================================= */}
      {activeTab === 'single_studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Student Selector, Theme, RFID Input */}
          <div className="no-print lg:col-span-5 space-y-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white font-['Outfit'] border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>Select Student &amp; Controls</span>
                <span className="text-xs text-cyan-400 font-mono">1 Student Live</span>
              </h3>

              {/* Class Filter */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Class</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    const firstInClass = students.find(s => e.target.value === 'all' || s.classId === e.target.value);
                    if (firstInClass) setSelectedStudentId(firstInClass.id);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="all">-- All Classes ({students.length}) --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.stream || c.stage})</option>
                  ))}
                </select>
              </div>

              {/* Student Search & Picker */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Choose Student</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name, roll #, or UID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 mb-1.5 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  {filteredStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} (Roll #{s.rollNumber || s.rollNo || '1'} &bull; {s.classId}{s.rfidCardUid ? ' &bull; 🪪 RFID' : ''})
                    </option>
                  ))}
                </select>
              </div>

              {/* RFID Contactless Pairing Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-slate-950 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>⚡ RFID Card Pairing Station</span>
                  </span>
                  <span className="text-[10px] text-cyan-400/80 font-mono">13.56 MHz Mifare</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rfidInput}
                    onChange={(e) => setRfidInput(e.target.value)}
                    placeholder="Tap physical card or enter UID..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-200 text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={() => handleSaveRfid(currentStudent?.id, rfidInput)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shadow"
                  >
                    Pair Card
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Don't have a physical reader?</span>
                  <button
                    onClick={() => currentStudent && generateAutoUid(currentStudent)}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Generate UID</span>
                  </button>
                </div>
              </div>

              {/* Theme Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-400 block">Card Palette &amp; Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(themeStyles).map(([key, style]) => (
                    <button
                      key={key}
                      onClick={() => setCardTheme(key)}
                      className={`p-2 rounded-xl border text-xs font-bold text-left transition flex items-center justify-between cursor-pointer ${
                        cardTheme === key ? `${style.borderAccent} bg-slate-800 text-white shadow` : 'border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate">{style.name}</span>
                      {cardTheme === key && <Check className="w-3 h-3 text-cyan-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Side Toggle */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-400 block">Preview Viewport</label>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <button
                    onClick={() => setCardSide('both')}
                    className={`py-1.5 rounded-lg font-bold transition cursor-pointer ${cardSide === 'both' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                  >
                    Dual-Side
                  </button>
                  <button
                    onClick={() => setCardSide('front')}
                    className={`py-1.5 rounded-lg font-bold transition cursor-pointer ${cardSide === 'front' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                  >
                    Front Only
                  </button>
                  <button
                    onClick={() => setCardSide('back')}
                    className={`py-1.5 rounded-lg font-bold transition cursor-pointer ${cardSide === 'back' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                  >
                    Back Only
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Card Canvas & Preview */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-inner min-h-[560px]">
            {currentStudent ? (
              <div id="id-studio-print-zone" className="flex flex-wrap items-center justify-center gap-6">
                {(cardSide === 'front' || cardSide === 'both') && renderCardFront(currentStudent)}
                {(cardSide === 'back' || cardSide === 'both') && renderCardBack(currentStudent)}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12">
                <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No student selected. Choose a student from the left panel.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BATCH PVC & A4 GRID PRINT */}
      {/* ========================================================================= */}
      {activeTab === 'batch_print' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="no-print p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Target Class</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    const list = e.target.value === 'all' 
                      ? students.map(s => s.id) 
                      : students.filter(s => s.classId === e.target.value).map(s => s.id);
                    setSelectedStudentIds(list);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="all">All Classes ({students.length})</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Print Target</label>
                <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <button
                    onClick={() => setCardSide('both')}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${cardSide === 'both' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    Both Sides
                  </button>
                  <button
                    onClick={() => setCardSide('front')}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${cardSide === 'front' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    Fronts Only
                  </button>
                  <button
                    onClick={() => setCardSide('back')}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${cardSide === 'back' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    Backs Only
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Palette Theme</label>
                <select
                  value={cardTheme}
                  onChange={(e) => setCardTheme(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  {Object.entries(themeStyles).map(([k, v]) => (
                    <option key={k} value={k}>{v.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">
                Selected: <strong className="text-cyan-400">{selectedStudentIds.length}</strong> students
              </span>
              <button
                onClick={() => {
                  const targetList = filteredStudents.map(s => s.id);
                  setSelectedStudentIds(selectedStudentIds.length === targetList.length ? [] : targetList);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer border border-slate-700"
              >
                {selectedStudentIds.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Batch Grid</span>
              </button>
            </div>
          </div>

          {/* Cards Grid Preview Area */}
          <div id="id-studio-print-zone" className="flex flex-wrap items-center justify-center gap-6 p-6 rounded-3xl bg-slate-950/60 border border-slate-800">
            {students
              .filter(s => selectedStudentIds.includes(s.id))
              .map(student => (
                <React.Fragment key={student.id}>
                  {(cardSide === 'front' || cardSide === 'both') && renderCardFront(student)}
                  {(cardSide === 'back' || cardSide === 'both') && renderCardBack(student)}
                </React.Fragment>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RFID HARDWARE PAIRING STATION & DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'rfid_hub' && (
        <div className="space-y-6">
          {/* Hardware Listener & Auto-assign Bar */}
          <div className="no-print grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Live USB Reader Tap Station */}
            <div className="md:col-span-7 p-5 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-blue-950/20 to-slate-900 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>Plug &amp; Play USB RFID Desktop Listener</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  Hardware Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect your ₹500–₹800 USB desktop RFID reader (HID Keyboard Mode). Focus this input and tap any blank card to instantly pair with the selected student.
              </p>

              <form onSubmit={handleUsbTapSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={usbTapListener}
                  onChange={(e) => setUsbTapListener(e.target.value)}
                  placeholder="Focus here & tap card on USB reader..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-cyan-500/50 text-cyan-200 text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  Pair UID
                </button>
              </form>
            </div>

            {/* Quick Auto-UID Generator */}
            <div className="md:col-span-5 p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Batch Auto-Assign Missing Cards</span>
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Assign unique 10-digit 13.56MHz Mifare UIDs to all {unlinkedRfidCount} currently unlinked students with one click.
                </p>
              </div>

              <button
                onClick={handleBulkAutoAssignRfid}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                ⚡ Auto-Assign All {unlinkedRfidCount} Unlinked Cards
              </button>
            </div>
          </div>

          {/* Search & Filter Directory Table */}
          <div className="no-print p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name, roll #, or UID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 w-64 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <select
                  value={rfidFilter}
                  onChange={(e) => setRfidFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="all">All Status ({students.length})</option>
                  <option value="linked">Linked Cards ({pairedRfidCount})</option>
                  <option value="unlinked">Unlinked Cards ({unlinkedRfidCount})</option>
                </select>
              </div>

              <button
                onClick={handleExportRfidCsv}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Roll &bull; Name</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Student ID</th>
                    <th className="p-3">RFID Card UID</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredStudents.map(st => {
                    const isLinked = !!st.rfidCardUid;
                    return (
                      <tr key={st.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-3 flex items-center gap-2">
                          <img 
                            src={st.photoUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100`} 
                            alt={st.firstName}
                            className="w-7 h-7 rounded-lg object-cover border border-slate-700 shrink-0" 
                          />
                          <div>
                            <span className="font-bold text-white block">{st.firstName} {st.lastName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">Roll #{st.rollNumber || st.rollNo || '1'}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-400">{st.classId}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-400">{st.id}</td>
                        <td className="p-3">
                          {isLinked ? (
                            <span className="font-mono text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                              {st.rfidCardUid}
                            </span>
                          ) : (
                            <span className="text-slate-600 italic">None</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isLinked ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Linked
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1 w-max">
                              <AlertCircle className="w-2.5 h-2.5" /> Missing
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => generateAutoUid(st)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold cursor-pointer transition mr-2"
                          >
                            Auto-UID
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStudentId(st.id);
                              setActiveTab('single_studio');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold cursor-pointer transition"
                          >
                            View Card
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: EXAM ADMIT CARDS & HALL TICKETS */}
      {/* ========================================================================= */}
      {activeTab === 'admit_cards' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="no-print p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Target Class</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="all">All Classes</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Exam Title</label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white w-64"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Center</label>
                <input
                  type="text"
                  value={examCenter}
                  onChange={(e) => setExamCenter(e.target.value)}
                  className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white w-56"
                />
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print All Admit Cards</span>
            </button>
          </div>

          {/* Admit Cards List Preview */}
          <div id="id-studio-print-zone" className="flex flex-col items-center gap-8 p-6 rounded-3xl bg-slate-950/60 border border-slate-800">
            {filteredStudents.map(student => renderSingleAdmitCard(student))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: TEMPLATE DESIGNER & SCHOOL BRANDING */}
      {/* ========================================================================= */}
      {activeTab === 'template_config' && (
        <div className="no-print max-w-4xl mx-auto p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">ID Card Template &amp; Institutional Branding</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize the school name, motto, affiliation, emergency phone numbers, and back-of-card regulatory rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">School Name (Header Line 1)</label>
              <input
                type="text"
                value={cardConfig.schoolName}
                onChange={(e) => setCardConfig({ ...cardConfig, schoolName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">School Motto (Header Line 2)</label>
              <input
                type="text"
                value={cardConfig.schoolMotto}
                onChange={(e) => setCardConfig({ ...cardConfig, schoolMotto: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Affiliation / Registration Badge</label>
              <input
                type="text"
                value={cardConfig.affiliationNo}
                onChange={(e) => setCardConfig({ ...cardConfig, affiliationNo: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Validity Period</label>
              <input
                type="text"
                value={cardConfig.validThru}
                onChange={(e) => setCardConfig({ ...cardConfig, validThru: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Principal Name (Signatory)</label>
              <input
                type="text"
                value={cardConfig.principalName}
                onChange={(e) => setCardConfig({ ...cardConfig, principalName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Emergency Hospital / School Phone</label>
              <input
                type="text"
                value={cardConfig.emergencyPhone}
                onChange={(e) => setCardConfig({ ...cardConfig, emergencyPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-bold text-white block">Cryptographic Student QR Code</span>
                <span className="text-[10px] text-slate-400">Scannable by in-app camera or universal scanner</span>
              </div>
              <input
                type="checkbox"
                checked={cardConfig.showQrCode}
                onChange={(e) => setCardConfig({ ...cardConfig, showQrCode: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-500"
              />
            </label>

            <label className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-bold text-white block">RFID Contactless Pass Wave</span>
                <span className="text-[10px] text-slate-400">Shows 13.56MHz chip indicator and UID string</span>
              </div>
              <input
                type="checkbox"
                checked={cardConfig.showRfidBadge}
                onChange={(e) => setCardConfig({ ...cardConfig, showRfidBadge: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-500"
              />
            </label>

            <label className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-bold text-white block">Principal Signature Stamp</span>
                <span className="text-[10px] text-slate-400">Renders official script signature on card front</span>
              </div>
              <input
                type="checkbox"
                checked={cardConfig.showPrincipalSignature}
                onChange={(e) => setCardConfig({ ...cardConfig, showPrincipalSignature: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-500"
              />
            </label>

            <label className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-bold text-white block">Anti-Counterfeit Crest Watermark</span>
                <span className="text-[10px] text-slate-400">Subtle background crest emblem watermark</span>
              </div>
              <input
                type="checkbox"
                checked={cardConfig.showWatermark}
                onChange={(e) => setCardConfig({ ...cardConfig, showWatermark: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-500"
              />
            </label>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                setActiveTab('single_studio');
                setPairingToast('Template configuration saved!');
                setTimeout(() => setPairingToast(null), 3000);
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
            >
              <Check className="w-4 h-4" />
              <span>Save &amp; Open Live Studio</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
