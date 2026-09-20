import React, { useRef, useEffect } from 'react';
import { X, Printer, Award, School, CheckCircle2, ShieldCheck } from 'lucide-react';
import { FirestoreStudent, FeeRecord } from '../types';

interface FeeClearanceCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: FirestoreStudent;
  studentFeeRecords: FeeRecord[];
}

export const FeeClearanceCertificateModal: React.FC<FeeClearanceCertificateModalProps> = ({
  isOpen,
  onClose,
  student,
  studentFeeRecords,
}) => {
  const qrRef = useRef<HTMLCanvasElement | null>(null);

  const totalPaid = studentFeeRecords.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
  const totalDue = studentFeeRecords.reduce((acc, f) => acc + Math.max(0, f.balanceAmount !== undefined ? f.balanceAmount : f.totalAmount - f.paidAmount), 0);
  const certNo = `MSS-CLR-${student.rollNo}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  useEffect(() => {
    if (!isOpen) return;
    const canvas = qrRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 90;
    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = '#065f46';
    const gridSize = 9;
    const cellSize = size / gridSize;

    const drawFinder = (x: number, y: number) => {
      ctx.fillRect(x * cellSize, y * cellSize, 2.5 * cellSize, 2.5 * cellSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((x + 0.5) * cellSize, (y + 0.5) * cellSize, 1.5 * cellSize, 1.5 * cellSize);
      ctx.fillStyle = '#065f46';
      ctx.fillRect((x + 0.75) * cellSize, (y + 0.75) * cellSize, 1 * cellSize, 1 * cellSize);
    };

    drawFinder(0.5, 0.5);
    drawFinder(5.5, 0.5);
    drawFinder(0.5, 5.5);

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if ((r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3)) continue;
        if ((r * 13 + c * 29 + student.rollNo) % 2 === 0) {
          ctx.fillRect(c * cellSize, r * cellSize, cellSize - 0.5, cellSize - 0.5);
        }
      }
    }
  }, [isOpen, student]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="bg-gray-900 border border-gray-700 print:border-none rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none text-gray-900 print:bg-white">
        
        {/* Modal Bar */}
        <div className="print:hidden p-4 bg-gray-850 border-b border-gray-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Student Fee Clearance Certificate</h3>
              <p className="text-[11px] text-gray-400">Fee Pek Kimna Hriattirna (No Dues Certificate)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Certificate
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Paper */}
        <div className="p-8 sm:p-10 bg-white text-gray-900 font-serif border-8 border-double border-emerald-800 m-2 rounded-sm print:m-0 print:border-8">
          
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-emerald-800">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-900 text-amber-300 flex items-center justify-center font-bold text-xl">
                <School className="w-7 h-7" />
              </div>
              <div className="text-center font-sans">
                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                  Govt. of Mizoram • MBSE Affiliated Institution
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none uppercase">
                  Zoxs Higher Secondary School
                </h1>
                <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                  Aizawl, Mizoram — 796001 • Registration No: MZ/EDN/2026/418
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h2 className="text-base font-bold text-emerald-900 uppercase tracking-wider font-sans bg-emerald-50 py-1 px-4 inline-block border border-emerald-300 rounded">
                Official Fee Clearance Certificate / Fee Pek Kimna Hriattirna
              </h2>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="mt-6 text-sm text-slate-800 leading-relaxed space-y-4">
            <div className="flex justify-between text-xs font-sans text-slate-500">
              <span>Certificate No: <strong className="text-slate-800 font-mono">{certNo}</strong></span>
              <span>Date: <strong className="text-slate-800">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
            </div>

            <p className="indent-6 text-justify">
              This is to certify that <strong>{student.name}</strong>, bearing Student Roll Number <strong className="font-mono">#{student.rollNo}</strong>, enrolled in <strong>{student.className}</strong> (Academic Session: 2026-2027), has successfully settled and paid all prescribed school tuition fees, laboratory charges, and institutional dues.
            </p>

            <p className="indent-6 text-justify">
              He lehkha hi hriattirna atan siam a ni a, zirlai <strong>{student.name}</strong> hian school fee ba reng reng a nei tawh lo a, Board Examination admit card lak chhuah nan leh admission tih thar lehna atan he No-Dues Clearance hi a hmang thei ang.
            </p>

            {/* Clearance Summary Box */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-4 font-sans text-xs grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-slate-500">Total Fees Settled</div>
                <div className="text-base font-bold text-emerald-800 font-mono">₹{totalPaid.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-500">Outstanding Balance Due</div>
                <div className="text-base font-bold text-slate-800 font-mono">₹{totalDue.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-500">Clearance Status</div>
                <div className="text-base font-bold text-emerald-700 uppercase flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  CLEARED (NO DUES)
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-8 pt-6 border-t border-slate-300 font-sans flex items-end justify-between text-xs">
            <div className="flex items-center gap-3">
              <canvas ref={qrRef} className="w-16 h-16 border border-emerald-300 rounded p-1 bg-white" />
              <div className="text-[10px] text-slate-500">
                <div className="font-bold text-emerald-900 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Digital Verification
                </div>
                <div>Issued by Accounts Dept.</div>
                <div className="font-mono text-slate-400">MZ-SMS-2026</div>
              </div>
            </div>

            <div className="text-center">
              <div className="w-32 border-b border-slate-400 mb-1"></div>
              <div className="font-bold text-slate-900 uppercase">Cashier / Bursar</div>
              <div className="text-[10px] text-slate-500">Accounts Section</div>
            </div>

            <div className="text-center">
              <div className="w-36 border-b border-slate-400 mb-1"></div>
              <div className="font-bold text-slate-900 uppercase">Principal / Headmaster</div>
              <div className="text-[10px] text-slate-500">Zoxs Higher Sec. School</div>
            </div>
          </div>

        </div>

        {/* Modal Bottom */}
        <div className="print:hidden p-4 bg-gray-850 border-t border-gray-700/80 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Clearance Certificate
          </button>
        </div>

      </div>
    </div>
  );
};
