import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Scan, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Volume2, 
  RotateCcw, 
  UserCheck, 
  Sparkles,
  Check,
  RefreshCw,
  QrCode
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';

export default function LibraryScannerModal({ 
  isOpen, 
  onClose 
}) {
  const { libraryBooks, students, issueBook, returnBook } = useSchool();

  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'config'
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [scannedBook, setScannedBook] = useState(null);
  const [scanStatus, setScanStatus] = useState('ready'); // 'ready' | 'detected' | 'processed'
  const [toast, setToast] = useState(null);

  // Scanner Configuration State
  const [scannerConfig, setScannerConfig] = useState({
    audioBeep: true,
    continuousMode: true,
    defaultLoanDays: 14,
    finePerDay: 5,
    autoMatchStudentId: true
  });

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Synthesize Barcode Beep using Web Audio API
  const playBeep = () => {
    if (!scannerConfig.audioBeep) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  // Start Webcam
  useEffect(() => {
    let activeStream = null;
    const startCam = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        activeStream = s;
        streamRef.current = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        console.warn('Library webcam scanner note:', err);
      }
    };

    if (isOpen && activeTab === 'scanner') {
      startCam();
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Handle Quick Scan Simulation or detection
  const handleSimulateScan = (book) => {
    playBeep();
    setScannedBook(book);
    setScanStatus('detected');
    setToast(`ISBN Recognized: ${book.title}`);
    setTimeout(() => setToast(null), 2500);
  };

  // 1-Click Issue
  const handleInstantIssue = () => {
    if (!scannedBook || !selectedStudentId) return;
    const st = students.find(s => s.id === selectedStudentId);
    issueBook(scannedBook.id, st.id, `${st.firstName} ${st.lastName}`);
    playBeep();
    setToast(`Book successfully issued to ${st.firstName} ${st.lastName} (Due in ${scannerConfig.defaultLoanDays} days)!`);
    setScanStatus('processed');
    setTimeout(() => {
      setToast(null);
      if (scannerConfig.continuousMode) {
        setScannedBook(null);
        setScanStatus('ready');
      }
    }, 2500);
  };

  // 1-Click Return
  const handleInstantReturn = (issueRecord) => {
    if (!scannedBook) return;
    returnBook(scannedBook.id, issueRecord.studentId);
    playBeep();
    setToast(`Book successfully returned & inventory restocked!`);
    setScanStatus('processed');
    setTimeout(() => {
      setToast(null);
      if (scannerConfig.continuousMode) {
        setScannedBook(null);
        setScanStatus('ready');
      }
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base font-['Outfit']">
                Library Barcode &amp; ISBN Camera Scanner
              </h3>
              <p className="text-xs text-slate-400">
                Aim device camera at book barcode/ISBN for instant checkout and automated circulation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'scanner' ? 'config' : 'scanner')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>{activeTab === 'scanner' ? 'Scanner Config' : 'Viewfinder'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Toast */}
        {toast && (
          <div className="bg-cyan-500/20 text-cyan-300 border-b border-cyan-500/30 text-xs font-bold py-2 text-center flex items-center justify-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{toast}</span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-5 min-h-0 overflow-y-auto">
          
          {/* Left Column: Live Camera Viewfinder (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            {activeTab === 'scanner' ? (
              <div className="relative flex-1 min-h-[320px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Animated Scanning Box Target Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-44 rounded-2xl border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.4)] relative flex items-center justify-center overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scanLine" />
                    <span className="text-[10px] font-mono text-cyan-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-md">
                      Align Barcode / ISBN Here
                    </span>
                  </div>
                </div>

                {/* Status Watermark */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 pointer-events-none">
                  <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Camera Live (Auto-Focus)</span>
                  </span>
                  {scannerConfig.audioBeep && (
                    <span className="px-2 py-0.5 rounded-lg bg-black/70 text-[9px] font-mono text-cyan-300 border border-white/10">
                      Audio Beep ON
                    </span>
                  )}
                </div>
              </div>
            ) : (
              /* CONFIGURATION PANEL */
              <div className="flex-1 rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-4 text-xs">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Scanner &amp; Circulation Configuration</span>
                </h4>

                <div className="space-y-3 pt-2">
                  <label className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-200">Audio Beep on Scan</div>
                      <p className="text-[11px] text-slate-400">Emits a crisp synthesized chime when an ISBN is recognized.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={scannerConfig.audioBeep}
                      onChange={(e) => setScannerConfig({ ...scannerConfig, audioBeep: e.target.checked })}
                      className="w-4 h-4 rounded text-cyan-500"
                    />
                  </label>

                  <label className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-200">Continuous Scan Mode</div>
                      <p className="text-[11px] text-slate-400">Immediately stands by for the next book after issuing/returning.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={scannerConfig.continuousMode}
                      onChange={(e) => setScannerConfig({ ...scannerConfig, continuousMode: e.target.checked })}
                      className="w-4 h-4 rounded text-cyan-500"
                    />
                  </label>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <label className="font-bold text-slate-200 block">Default Loan Period</label>
                    <div className="flex gap-2">
                      {[7, 14, 21, 30].map(days => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setScannerConfig({ ...scannerConfig, defaultLoanDays: days })}
                          className={`flex-1 py-1.5 rounded-lg font-bold border transition ${
                            scannerConfig.defaultLoanDays === days
                              ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                              : 'bg-slate-950 text-slate-300 border-slate-700'
                          }`}
                        >
                          {days} Days
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <label className="font-bold text-slate-200 block">Overdue Late Fine (INR / Day)</label>
                    <input
                      type="number"
                      value={scannerConfig.finePerDay}
                      onChange={(e) => setScannerConfig({ ...scannerConfig, finePerDay: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab('scanner')}
                    className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold transition flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save &amp; Return to Scanner</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Simulate Barcode Buttons */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                Simulate Optical Barcode Scan (Click to test):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {libraryBooks.slice(0, 4).map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSimulateScan(b)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-mono transition flex items-center gap-1"
                  >
                    <QrCode className="w-3 h-3 text-cyan-400" />
                    <span>{b.isbn.slice(0, 10)}... ({b.title.slice(0, 16)}...)</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Detected Book & Instant Action (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-3">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Detected Book Intelligence</span>
                </h4>

                {scannedBook ? (
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-3 shadow-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-16 rounded-xl bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-cyan-300 font-bold shrink-0">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                          {scannedBook.category}
                        </span>
                        <h4 className="font-bold text-white text-sm truncate">{scannedBook.title}</h4>
                        <p className="text-xs text-slate-400 truncate">Author: {scannedBook.author}</p>
                        <span className="text-[10px] text-slate-500 font-mono block">ISBN: {scannedBook.isbn}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                      <div className="p-2 rounded-xl bg-slate-950 text-center">
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Available</span>
                        <span className="font-bold font-mono text-emerald-400 text-sm">
                          {scannedBook.availableCopies || 0} / {scannedBook.totalCopies || 1}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 text-center">
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Shelf Rack</span>
                        <span className="font-bold font-mono text-slate-200 text-sm">{scannedBook.shelfRack || 'Rack B-4'}</span>
                      </div>
                    </div>

                    {/* Active Borrowers list */}
                    {(scannedBook.issuedTo || []).filter(i => !i.returned).length > 0 && (
                      <div className="pt-2 border-t border-slate-800 space-y-1.5">
                        <span className="text-[10px] uppercase font-mono text-amber-400 font-bold block">
                          Currently Borrowed By:
                        </span>
                        {(scannedBook.issuedTo || []).filter(i => !i.returned).map((iss, idx) => (
                          <div key={idx} className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                            <div>
                              <strong className="text-white block">{iss.studentName}</strong>
                              <span className="text-[10px] text-slate-500 font-mono">Issued: {iss.issueDate}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleInstantReturn(iss)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Return Book</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
                    <Scan className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                    <p className="text-xs text-slate-400 font-semibold">No Book Barcode Scanned Yet</p>
                    <p className="text-[11px] text-slate-500">
                      Hold an educational textbook or novel in front of the camera, or click a demo button below.
                    </p>
                  </div>
                )}
              </div>

              {/* Student Checkout Action */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                <label className="text-xs font-bold text-slate-300 block">Issue To Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} (Roll #{s.rollNumber || '0'} • {s.classId})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  disabled={!scannedBook || (scannedBook.availableCopies || 0) <= 0}
                  onClick={handleInstantIssue}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Instant Issue Book (1-Click)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
