import React, { useState, useRef } from 'react';
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
  Hash
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';

export default function StudentIdCardModal({ 
  isOpen, 
  onClose, 
  initialStudent = null,
  selectedClassId = null
}) {
  const { students, classes, systemConfig } = useSchool();

  const [activeMode, setActiveMode] = useState('id_card'); // 'id_card', 'admit_card', 'config'
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudent?.id || students[0]?.id);
  const [selectedClass, setSelectedClass] = useState(selectedClassId || initialStudent?.classId || classes[0]?.id);
  const [cardTheme, setCardTheme] = useState('indigo'); // 'indigo', 'cyan', 'cyber', 'emerald'
  const [isBulkPrint, setIsBulkPrint] = useState(false);

  // Admit Card Exam Details
  const [examName, setExamName] = useState('Annual Board Examination 2026');
  const [examCenter, setExamCenter] = useState('OHA Campus, Lunglawn, Lunglei');

  // ID Card & Admit Card Custom Configuration State
  const [cardConfig, setCardConfig] = useState({
    schoolName: systemConfig?.schoolName || 'OHA (Oxford Higher Academy)',
    schoolMotto: systemConfig?.motto || 'Knowledge is Light',
    affiliationNo: systemConfig?.affiliationNo || 'MBSE-HSS-LGL-0421',
    validThru: 'March 2027',
    showQrCode: true,
    showBarcode: true,
    showPrincipalSignature: true,
    showWatermark: true,
    emergencyPhone: systemConfig?.contactPhone || '+91 389 2322451',
    instructions: '1. This card is non-transferable and must be worn inside campus.\n2. In case of loss, report immediately to the Administrative Office.\n3. Found cards must be returned to Khatla South, Aizawl.'
  });

  const printAreaRef = useRef(null);

  if (!isOpen) return null;

  const currentStudent = students.find(s => s.id === selectedStudentId) || initialStudent || students[0];
  const targetClassStudents = students.filter(s => s.classId === selectedClass);
  const targetClassObj = classes.find(c => c.id === (isBulkPrint ? selectedClass : currentStudent?.classId)) || classes[0];

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

  // Single ID Card Render
  const renderSingleIdCard = (student) => {
    const studentClass = classes.find(c => c.id === student.classId);
    return (
      <div 
        key={student.id} 
        className="w-[340px] h-[520px] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 flex flex-col relative print:border-slate-400 print:shadow-none print:m-3 print:break-inside-avoid shrink-0"
      >
        {/* Card Header */}
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
        <div className="p-4 flex-1 flex flex-col items-center justify-between relative bg-slate-900 text-white">
          {/* Subtle Crest Watermark */}
          {cardConfig.showWatermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <ShieldCheck className="w-48 h-48 text-white" />
            </div>
          )}

          {/* Photo */}
          <div className="relative mt-1">
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
          <div className="text-center mt-2 space-y-0.5">
            <h4 className="font-extrabold text-base text-white tracking-tight">
              {student.firstName} {student.lastName}
            </h4>
            <p className="text-xs font-semibold text-cyan-400">
              Class {studentClass?.name || 'Class 12 Science'} • Sec {student.section || 'A'}
            </p>
          </div>

          {/* Info Grid */}
          <div className="w-full grid grid-cols-2 gap-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] mt-2">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-mono">Roll Number</span>
              <span className="font-bold text-slate-200">#{student.rollNumber || '14'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-mono">Blood Group</span>
              <span className="font-bold text-rose-400">{student.bloodGroup || 'O+'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-mono">Student ID</span>
              <span className="font-mono text-slate-300 font-semibold">{student.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-mono">Emergency</span>
              <span className="font-mono text-slate-300 text-[10px]">{student.guardianPhone || cardConfig.emergencyPhone}</span>
            </div>
          </div>

          {/* Barcode & QR Block */}
          <div className="w-full flex items-center justify-between pt-2 border-t border-slate-800 mt-2 px-1">
            {cardConfig.showBarcode && (
              <div className="space-y-0.5 text-left">
                {/* Simulated High-Res Code128 Barcode */}
                <div className="h-6 flex items-center gap-[2px] bg-white p-1 rounded">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-full bg-slate-950 ${i % 3 === 0 ? 'w-[3px]' : i % 2 === 0 ? 'w-[1.5px]' : 'w-[1px]'}`} 
                    />
                  ))}
                </div>
                <div className="text-[8px] font-mono text-slate-400">ID: {student.id}</div>
              </div>
            )}

            {cardConfig.showPrincipalSignature && (
              <div className="text-right">
                <div className="font-serif italic text-cyan-300 text-xs font-bold leading-none">
                  Lalthansanga
                </div>
                <span className="text-[8px] text-slate-500 uppercase font-mono block">Principal</span>
              </div>
            )}
          </div>
        </div>

        {/* Card Footer Bar */}
        <div className="p-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-500 px-3">
          <span>Valid Thru: <strong className="text-slate-300">{cardConfig.validThru}</strong></span>
          <span>Aizawl, Mizoram</span>
        </div>
      </div>
    );
  };

  // Exam Admit Card Render
  const renderSingleAdmitCard = (student) => {
    const studentClass = classes.find(c => c.id === student.classId);
    return (
      <div 
        key={student.id} 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl relative print:border-slate-400 print:shadow-none print:m-4 print:break-inside-avoid print:bg-white print:text-black"
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
            {student.status === 'suspended' || student.restrictionType === 'exam_hold' ? (
              <span className="px-3 py-1 rounded-full bg-rose-600/30 text-rose-200 border border-rose-500 text-xs font-bold font-mono animate-pulse">
                WITHHELD: SUSPENDED
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold font-mono">
                OFFICIAL ADMIT CARD
              </span>
            )}
            <div className="text-[10px] text-slate-400 font-mono mt-1">Academic Session: 2026-2027</div>
          </div>
        </div>

        {/* Candidate Details & Photo */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4 border-b border-slate-800">
          <div className="md:col-span-9 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Candidate Name</span>
              <strong className="text-white text-sm">{student.firstName} {student.lastName}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Exam Roll Number</span>
              <strong className="text-cyan-400 text-sm font-mono">MZ-2026-{student.rollNumber?.toString().padStart(3, '0') || '014'}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Class &amp; Stream</span>
              <span className="text-slate-200">{studentClass?.name || 'Class 12'} (Section {student.section || 'A'})</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Student ID / Reg No</span>
              <span className="font-mono text-slate-300">{student.id}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Father / Guardian</span>
              <span className="text-slate-200">{student.fatherName || 'Lalremsanga'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Assigned Hall &amp; Room</span>
              <span className="text-emerald-400 font-bold">Hall B - Desk #{student.rollNumber || '14'}</span>
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col items-center justify-center">
            <img 
              src={student.photoUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`} 
              alt="" 
              className="w-20 h-24 object-cover rounded-xl border border-slate-700 shadow"
            />
            <span className="text-[9px] text-slate-400 mt-1 font-mono">Attested Photo</span>
          </div>
        </div>

        {/* Timetable / Subjects Schedule Table */}
        <div className="py-4 space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Scheduled Exam Papers &amp; Dates</h4>
          <div className="rounded-xl overflow-hidden border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Time</th>
                  <th className="p-2.5">Subject Paper</th>
                  <th className="p-2.5 text-center">Invigilator Initial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {examRoutine.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-2.5 font-mono text-cyan-300">{item.date}</td>
                    <td className="p-2.5 text-slate-400">{item.time}</td>
                    <td className="p-2.5 font-semibold text-white">{item.subject}</td>
                    <td className="p-2.5 text-center text-slate-600 font-mono">_______________</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Candidate Instructions & Signatures */}
        <div className="pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="text-[10px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 uppercase block font-mono">Candidate Instructions:</span>
            <p>1. Candidates must arrive at the examination hall 15 minutes before commencement.</p>
            <p>2. Electronic gadgets, smartwatches, and study notes are strictly prohibited.</p>
            <p>3. This admit card must be presented along with the Student ID Card.</p>
          </div>

          <div className="flex items-end justify-between px-2 pt-4">
            <div className="text-center">
              <div className="border-t border-slate-700 w-28 pt-1 text-[9px] font-mono text-slate-400">
                Candidate Signature
              </div>
            </div>

            <div className="text-center">
              <div className="font-serif italic text-cyan-300 text-xs font-bold leading-none mb-1">
                Lalthansanga
              </div>
              <div className="border-t border-slate-700 w-28 pt-1 text-[9px] font-mono text-slate-400">
                Principal / Controller
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-5xl h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header Bar */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base font-['Outfit']">
                Student Identity Cards &amp; Exam Admit Card Generator
              </h3>
              <p className="text-xs text-slate-400">
                Standard CR80 PVC Student ID Cards and MBSE Term Examination Hall Tickets with printable bulk export.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Control Bar: Modes & Filters */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveMode('id_card')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeMode === 'id_card' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Student ID Card</span>
            </button>

            <button
              onClick={() => setActiveMode('admit_card')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeMode === 'admit_card' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Exam Admit Card (Hall Ticket)</span>
            </button>

            <button
              onClick={() => setActiveMode('config')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeMode === 'config' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Card Config</span>
            </button>
          </div>

          {/* Student / Class Filter */}
          {activeMode !== 'config' && (
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-semibold">
                <input
                  type="checkbox"
                  checked={isBulkPrint}
                  onChange={(e) => setIsBulkPrint(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-500"
                />
                <span>Bulk Class Print ({targetClassStudents.length} Students)</span>
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
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
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
                <div className="flex items-center gap-1 ml-2">
                  {['indigo', 'cyan', 'emerald', 'cyber'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCardTheme(t)}
                      className={`w-5 h-5 rounded-full border-2 transition ${
                        cardTheme === t ? 'border-white scale-110 shadow' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: t === 'indigo' ? '#6366f1' : t === 'cyan' ? '#06b6d4' : t === 'emerald' ? '#10b981' : '#ec4899'
                      }}
                      title={`${t} theme`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Body Area */}
        <div ref={printAreaRef} className="flex-1 p-6 overflow-y-auto bg-slate-950/50 flex items-center justify-center">
          
          {/* 1. STUDENT ID CARD VIEW */}
          {activeMode === 'id_card' && (
            <div className="w-full flex flex-wrap items-center justify-center gap-6">
              {isBulkPrint ? (
                targetClassStudents.map(student => renderSingleIdCard(student))
              ) : (
                renderSingleIdCard(currentStudent)
              )}
            </div>
          )}

          {/* 2. EXAM ADMIT CARD VIEW */}
          {activeMode === 'admit_card' && (
            <div className="w-full flex flex-col items-center justify-center space-y-6">
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
                  <span className="text-slate-200">Print Code128 Barcode</span>
                  <input
                    type="checkbox"
                    checked={cardConfig.showBarcode}
                    onChange={(e) => setCardConfig({ ...cardConfig, showBarcode: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-500"
                  />
                </label>

                <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                  <span className="text-slate-200">Include Principal Signature</span>
                  <input
                    type="checkbox"
                    checked={cardConfig.showPrincipalSignature}
                    onChange={(e) => setCardConfig({ ...cardConfig, showPrincipalSignature: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-500"
                  />
                </label>

                <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                  <span className="text-slate-200">Emboss Crest Watermark</span>
                  <input
                    type="checkbox"
                    checked={cardConfig.showWatermark}
                    onChange={(e) => setCardConfig({ ...cardConfig, showWatermark: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-500"
                  />
                </label>

                <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                  <span className="text-slate-200">Enable Smart QR Code</span>
                  <input
                    type="checkbox"
                    checked={cardConfig.showQrCode}
                    onChange={(e) => setCardConfig({ ...cardConfig, showQrCode: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-500"
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center gap-1.5"
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
