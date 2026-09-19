import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  AlertTriangle,
  Pin,
  FileText,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Sparkles,
  Clock,
  Plus,
} from 'lucide-react';
import { NoticeItem } from '../../types';
import { NoticeDetailModal } from './NoticeDetailModal';

interface DashboardNoticeBoardWidgetProps {
  notices: NoticeItem[];
  userRole: string;
  onNavigateToNotices?: () => void;
  onOpenCompose?: () => void;
}

export const DashboardNoticeBoardWidget: React.FC<DashboardNoticeBoardWidgetProps> = ({
  notices,
  userRole,
  onNavigateToNotices,
  onOpenCompose,
}) => {
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [audienceTab, setAudienceTab] = useState<'All' | 'MyAudience'>('MyAudience');

  // Filter for active notices only
  const activeNotices = notices.filter((n) => n.isActive);

  // Audience-aware filtering
  const relevantNotices = activeNotices.filter((n) => {
    if (audienceTab === 'All') return true;
    if (userRole === 'Teacher' || userRole === 'Principal') {
      return n.targetAudience === 'All' || n.targetAudience === 'Teachers & Staff';
    }
    // Student or Parent
    return n.targetAudience === 'All' || n.targetAudience === 'Parents & Students' || n.targetAudience === 'Class 10 Only';
  });

  // Sort: Pinned first, then by publishDate descending
  const sortedNotices = [...relevantNotices].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
  });

  // Pinned urgent notice for ticker
  const pinnedUrgent = sortedNotices.find((n) => n.isPinned);

  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden shadow-xl">
      {/* Widget Header */}
      <div className="p-5 border-b border-gray-800 bg-gray-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Institutional Notice Board & Circulars
              </h2>
              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live Updates
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Official circulars, holiday announcements, and MBSE exam routines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenCompose && (userRole === 'Principal' || userRole === 'Teacher') && (
            <button
              type="button"
              onClick={onOpenCompose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Post Notice
            </button>
          )}
          {onNavigateToNotices && (
            <button
              type="button"
              onClick={onNavigateToNotices}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Pinned Announcement Highlight Ticker */}
      {pinnedUrgent && (
        <div
          onClick={() => setSelectedNotice(pinnedUrgent)}
          className="px-5 py-3 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-gray-900 border-b border-indigo-500/30 flex items-center justify-between gap-3 cursor-pointer hover:bg-indigo-950/80 transition-colors"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
              <Pin className="w-3.5 h-3.5 rotate-45" />
            </span>
            <div className="truncate">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mr-2 font-mono">
                [Featured Circular]
              </span>
              <span className="text-xs font-bold text-white truncate">
                {pinnedUrgent.title}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-indigo-300 shrink-0 font-medium flex items-center gap-1">
            Read <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      )}

      {/* Notice List */}
      <div className="divide-y divide-gray-800/80 max-h-[380px] overflow-y-auto">
        {sortedNotices.length > 0 ? (
          sortedNotices.slice(0, 5).map((notice) => (
            <div
              key={notice.id}
              onClick={() => setSelectedNotice(notice)}
              className="p-4 sm:px-5 hover:bg-gray-800/50 transition-colors cursor-pointer flex items-start justify-between gap-3 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
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

                  {notice.priority === 'Urgent' && (
                    <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Urgent
                    </span>
                  )}

                  <span className="font-mono text-[10px] text-gray-500">
                    {notice.noticeNo}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                  {notice.title}
                </h4>

                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                  {notice.content}
                </p>

                <div className="flex items-center gap-3 text-[10px] text-gray-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {notice.publishDate}
                  </span>
                  <span>•</span>
                  <span>{notice.authorName} ({notice.authorDesignation})</span>
                  {notice.attachmentName && (
                    <>
                      <span>•</span>
                      <span className="text-indigo-400 font-mono flex items-center gap-0.5">
                        <FileText className="w-3 h-3" /> PDF
                      </span>
                    </>
                  )}
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors shrink-0 mt-2" />
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 text-xs">
            No active notices for this dashboard audience.
          </div>
        )}
      </div>

      {/* Widget Footer */}
      <div className="p-3 bg-gray-950/40 border-t border-gray-800 text-center">
        <span className="text-[11px] text-gray-500">
          Showing {Math.min(sortedNotices.length, 5)} of {sortedNotices.length} active announcements • Affiliated with MBSE
        </span>
      </div>

      {/* Modal Detail View */}
      <NoticeDetailModal
        isOpen={!!selectedNotice}
        onClose={() => setSelectedNotice(null)}
        notice={selectedNotice}
      />
    </div>
  );
};
