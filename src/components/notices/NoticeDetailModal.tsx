import React from 'react';
import {
  X,
  Printer,
  Calendar,
  User,
  School,
  Share2,
  FileText,
  AlertTriangle,
  Pin,
  Clock,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { NoticeItem } from '../../types';

interface NoticeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  notice: NoticeItem | null;
}

export const NoticeDetailModal: React.FC<NoticeDetailModalProps> = ({
  isOpen,
  onClose,
  notice,
}) => {
  if (!isOpen || !notice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: notice.title,
          text: `${notice.title} - ${notice.content.slice(0, 100)}...`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(`${notice.title}\n\n${notice.content}`);
      alert('Notice details copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-800 bg-gray-950/70 print:hidden">
          <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Official Institutional Circular</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              title="Share Announcement"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-white transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Circular Document Letterhead Body */}
        <div className="p-6 sm:p-8 text-gray-100 bg-gray-900 print:bg-white print:text-black print:p-8 space-y-6">
          {/* Header */}
          <div className="text-center border-b border-gray-800 print:border-black pb-4 space-y-1">
            <div className="flex items-center justify-center gap-2">
              <School className="w-6 h-6 text-indigo-400 print:text-black" />
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white print:text-black">
                MIZORAM SCHOOL SYSTEM (ZOXS-SMS)
              </h2>
            </div>
            <p className="text-[11px] text-gray-400 print:text-gray-600 uppercase tracking-wider">
              Aizawl District, Mizoram • Affiliated to MBSE
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-gray-400 print:text-gray-600 border-t border-gray-800/60 print:border-gray-300">
              <span className="font-mono text-indigo-300 print:text-black font-semibold">
                Ref: {notice.noticeNo}
              </span>
              <span>Date of Issue: {notice.publishDate}</span>
            </div>
          </div>

          {/* Badges & Meta */}
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                notice.category === 'Holiday'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : notice.category === 'Exam'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : notice.category === 'Urgent'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              {notice.category}
            </span>

            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-800 text-gray-300 border border-gray-700">
              Audience: {notice.targetAudience}
            </span>

            {notice.priority === 'Urgent' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 flex items-center gap-1 border border-rose-500/30">
                <AlertTriangle className="w-3 h-3" />
                Urgent Priority
              </span>
            )}

            {notice.isPinned && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 flex items-center gap-1 border border-indigo-500/30">
                <Pin className="w-3 h-3 rotate-45" />
                Featured Notice
              </span>
            )}
          </div>

          {/* Title */}
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white print:text-black leading-snug">
              {notice.title}
            </h1>
          </div>

          {/* Content Body */}
          <div className="text-xs sm:text-sm text-gray-300 print:text-black leading-relaxed whitespace-pre-line space-y-3 font-normal">
            {notice.content}
          </div>

          {/* Expiration Note */}
          {notice.expiryDate && (
            <div className="p-3 rounded-xl bg-gray-800/50 border border-gray-700/60 text-xs text-gray-400 print:bg-gray-50 print:border-gray-200">
              <span className="font-semibold text-gray-300 print:text-black">Effective Period: </span>
              Valid through {notice.expiryDate}.
            </div>
          )}

          {/* Attachment Download Callout */}
          {notice.attachmentName && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 print:border-gray-300 text-xs">
              <div className="flex items-center gap-2 text-indigo-300 print:text-black font-medium">
                <FileText className="w-4 h-4 text-indigo-400 print:text-black" />
                <span>{notice.attachmentName}</span>
              </div>
              <a
                href={notice.attachmentUrl || '#'}
                onClick={(e) => {
                  if (!notice.attachmentUrl) {
                    e.preventDefault();
                    alert(`Official file: ${notice.attachmentName} is available at the school administrative desk.`);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </a>
            </div>
          )}

          {/* Signature Block */}
          <div className="border-t border-gray-800 print:border-black pt-6 flex justify-between items-end">
            <div className="text-[11px] text-gray-500 print:text-gray-600">
              Circulated via Mizoram School System (zoxs-sms)
            </div>
            <div className="text-right space-y-0.5">
              <div className="h-8"></div>
              <span className="text-xs font-bold text-white print:text-black block">
                {notice.authorName}
              </span>
              <span className="text-[11px] text-indigo-400 print:text-gray-700 block">
                {notice.authorDesignation}
              </span>
              <span className="text-[10px] text-gray-500 print:text-gray-600 block">
                Mizoram School System
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
