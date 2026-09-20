import React, { useEffect, useRef } from 'react';
import { X, Printer, BookOpen, CheckCircle2, ShieldCheck, Download, Calendar, User, BookCheck } from 'lucide-react';
import { BookIssue, LibraryBook } from '../types';

interface PrintableLibrarySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: BookIssue;
  book?: LibraryBook;
}

export const PrintableLibrarySlipModal: React.FC<PrintableLibrarySlipModalProps> = ({
  isOpen,
  onClose,
  issue,
  book,
}) => {
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate neat stylized verification QR grid
    const size = 96;
    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#0f172a';

    const matrixSize = 16;
    const cellSize = size / matrixSize;

    // Corner finder patterns
    const drawCorner = (startX: number, startY: number) => {
      ctx.fillRect(startX * cellSize, startY * cellSize, 4 * cellSize, 4 * cellSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((startX + 1) * cellSize, (startY + 1) * cellSize, 2 * cellSize, 2 * cellSize);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect((startX + 1.5) * cellSize, (startY + 1.5) * cellSize, cellSize, cellSize);
    };

    drawCorner(1, 1);
    drawCorner(11, 1);
    drawCorner(1, 11);

    // Pseudorandom internal cells based on issue ID
    const seed = issue.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (
          (r <= 5 && c <= 5) ||
          (r <= 5 && c >= 10) ||
          (r >= 10 && c <= 5)
        ) {
          continue;
        }
        if (((r * 7 + c * 13 + seed) % 5) === 0 || ((r * 11 + c * 3 + seed) % 7) === 0) {
          ctx.fillRect(c * cellSize, r * cellSize, cellSize - 0.5, cellSize - 0.5);
        }
      }
    }
  }, [isOpen, issue.id]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isOverdue = issue.status === 'Overdue';
  const isReturned = issue.status === 'Returned';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Top Modal Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/90 print:hidden">
          <div className="flex items-center gap-2 text-indigo-400">
            <BookCheck className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-wide text-gray-200">
              Library Loan Voucher & Receipt
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Slip
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 md:p-8 bg-white text-gray-900 font-sans print:p-0 print:m-0">
          {/* Header */}
          <div className="border-b-2 border-gray-900 pb-4 mb-5 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded">
                  Government of Mizoram
                </span>
                <span className="text-xs text-gray-600">School Education Dept.</span>
              </div>
              <h1 className="text-xl font-black tracking-tight text-gray-950 uppercase">
                Mizoram School Library System
              </h1>
              <p className="text-xs text-gray-600">
                Central Library & Resource Centre • Chaltlang, Aizawl - 796012
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded bg-gray-100 text-gray-800 border border-gray-300">
                Loan Voucher
              </span>
              <p className="text-xs font-mono font-bold text-gray-700 mt-1">#{issue.id}</p>
            </div>
          </div>

          {/* Issue & Status Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 mb-5 text-xs">
            <div>
              <span className="block text-gray-500 font-medium">Issue Date</span>
              <span className="font-bold text-gray-900">{issue.issueDate}</span>
            </div>
            <div>
              <span className="block text-gray-500 font-medium">Due Date</span>
              <span className={`font-bold ${isOverdue ? 'text-rose-600' : 'text-gray-900'}`}>
                {issue.dueDate}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 font-medium">Loan Status</span>
              <span
                className={`font-bold inline-block px-1.5 py-0.5 rounded text-[11px] ${
                  isReturned
                    ? 'bg-emerald-100 text-emerald-800'
                    : isOverdue
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {issue.status}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 font-medium">Late Fine</span>
              <span className="font-bold text-gray-900">
                {issue.fineAmount > 0 ? `₹${issue.fineAmount}` : 'Nil (₹0)'}
              </span>
            </div>
          </div>

          {/* Book Details */}
          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Book Information (Lehkhabu Hming)
            </h3>
            <div className="p-3.5 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-gray-950">{issue.bookTitle}</h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Author: <span className="font-semibold text-gray-800">{book?.author || 'N/A'}</span>
                  </p>
                </div>
                <div className="text-right text-xs">
                  <span className="text-gray-500">Accession / ISBN:</span>
                  <p className="font-mono font-bold text-gray-800">{issue.bookIsbn || book?.isbn || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-700">
                <div>
                  <span className="text-gray-400">Category:</span>{' '}
                  <span className="font-semibold">{book?.category || 'General'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Shelf Rack:</span>{' '}
                  <span className="font-semibold">{book?.shelfLocation || 'Main Stack'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Language:</span>{' '}
                  <span className="font-semibold">{book?.language || 'Mizo/Eng'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Borrower Information */}
          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Borrower Details (Hawhtu Zirlai)
            </h3>
            <div className="p-3.5 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between text-xs">
              <div>
                <p className="text-sm font-bold text-gray-900">{issue.studentName}</p>
                <p className="text-gray-600 mt-0.5">
                  Class: <span className="font-semibold text-gray-800">{issue.className}</span> | Roll No:{' '}
                  <span className="font-semibold text-gray-800">{issue.rollNo}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-gray-500">Student ID:</span>
                <p className="font-mono font-bold text-gray-800">{issue.studentId}</p>
              </div>
            </div>
          </div>

          {/* QR Verification & Library Policy */}
          <div className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg bg-white mb-6">
            <canvas ref={qrCanvasRef} className="w-20 h-20 border border-gray-200 rounded p-1 bg-white shrink-0" />
            <div className="text-[11px] text-gray-600 leading-tight">
              <p className="font-bold text-gray-900 mb-1">Library Rules & Care Instructions:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Return or renew on or before the due date ({issue.dueDate}).</li>
                <li>Overdue fee is charged at ₹5 per calendar day.</li>
                <li>Please do not dog-ear, mark, or soil library pages.</li>
                <li>Report lost or damaged copies immediately to the librarian.</li>
              </ul>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-300 text-xs">
            <div>
              <p className="text-gray-500">Issued By:</p>
              <p className="font-bold text-gray-900 mt-0.5">{issue.issuedBy}</p>
              <div className="w-32 border-b border-gray-400 mt-4" />
              <span className="text-[10px] text-gray-400 block mt-1">Librarian Signature</span>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Student / Borrower:</p>
              <p className="font-bold text-gray-900 mt-0.5">{issue.studentName}</p>
              <div className="w-32 border-b border-gray-400 mt-4 ml-auto" />
              <span className="text-[10px] text-gray-400 block mt-1">Borrower Signature</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-gray-800 bg-gray-900 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
