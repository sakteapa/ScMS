import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Search,
  Pin,
  Calendar,
  AlertTriangle,
  FileText,
  Trash2,
  Edit2,
  CheckCircle2,
  Eye,
  Filter,
  Sparkles,
  School,
  Share2,
  ExternalLink,
  XCircle,
} from 'lucide-react';
import { NoticeItem, NoticeCategory, NoticeAudience, NoticePriority } from '../../types';
import { addDocument, updateDocument, deleteDocument } from '../../lib/firebase';
import { NoticeDetailModal } from './NoticeDetailModal';

interface NoticeBoardManagerProps {
  notices: NoticeItem[];
  userRole: string;
  userName: string;
}

export const NoticeBoardManager: React.FC<NoticeBoardManagerProps> = ({
  notices,
  userRole,
  userName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [audienceFilter, setAudienceFilter] = useState<string>('All');

  // Modal States
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('Circular');
  const [targetAudience, setTargetAudience] = useState<NoticeAudience>('All');
  const [priority, setPriority] = useState<NoticePriority>('Normal');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [authorName, setAuthorName] = useState(userName || 'Dr. Lalthanzuala Colney');
  const [authorDesignation, setAuthorDesignation] = useState(
    userRole === 'Principal' ? 'Principal & Academic Head' : 'Senior Faculty & Notice Convener'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Filtering
  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.noticeNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.authorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || notice.category === categoryFilter;
    const matchesAudience = audienceFilter === 'All' || notice.targetAudience === audienceFilter;

    return matchesSearch && matchesCategory && matchesAudience;
  });

  // Sort: Pinned first, then by publishDate descending
  const sortedNotices = [...filteredNotices].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
  });

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Notice title is required.');
      return;
    }
    if (!content.trim()) {
      setErrorMessage('Notice content body is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const nextNum = notices.length + 1;
      const refNo = `CIR/MBSE/2026/09-${String(nextNum).padStart(2, '0')}`;

      const newNotice: NoticeItem = {
        id: `notice-${Date.now()}`,
        noticeNo: refNo,
        title: title.trim(),
        content: content.trim(),
        category,
        targetAudience,
        priority,
        publishDate,
        expiryDate: expiryDate.trim() || undefined,
        isActive: true,
        isPinned,
        authorName: authorName.trim(),
        authorDesignation: authorDesignation.trim(),
        attachmentName: attachmentName.trim() || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDocument('notices', newNotice);
      setIsComposeOpen(false);
      // Reset
      setTitle('');
      setContent('');
      setAttachmentName('');
      setIsPinned(false);
    } catch (err) {
      console.error('Failed to create notice', err);
      setErrorMessage('Could not publish notice. Please verify details and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePin = async (notice: NoticeItem) => {
    try {
      await updateDocument('notices', notice.id, {
        isPinned: !notice.isPinned,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to toggle pin', err);
    }
  };

  const handleToggleActive = async (notice: NoticeItem) => {
    try {
      await updateDocument('notices', notice.id, {
        isActive: !notice.isActive,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to toggle active status', err);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this circular?')) {
      try {
        await deleteDocument('notices', id);
      } catch (err) {
        console.error('Failed to delete notice', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-900 to-indigo-950/40 border border-gray-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Bell className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Institutional Notice Board & Circulars
            </h1>
          </div>
          <p className="text-xs text-gray-400">
            Publish official announcements, MBSE exam schedules, holiday declarations, and emergency circulars in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsComposeOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Notice</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-gray-900/70 border border-gray-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search circular title, content, reference number, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-gray-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Circular">Circular</option>
            <option value="Holiday">Holiday</option>
            <option value="Exam">Exam Routine</option>
            <option value="General">General</option>
            <option value="Event">Event</option>
            <option value="Urgent">Urgent Alert</option>
          </select>

          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="All">All Audiences</option>
            <option value="Parents & Students">Parents & Students</option>
            <option value="Teachers & Staff">Teachers & Staff</option>
            <option value="Class 10 Only">Class 10 Only</option>
          </select>
        </div>
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedNotices.length > 0 ? (
          sortedNotices.map((notice) => (
            <div
              key={notice.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative ${
                notice.isPinned
                  ? 'bg-gradient-to-b from-indigo-950/30 to-gray-900 border-indigo-500/40 shadow-lg shadow-indigo-950/20'
                  : 'bg-gray-900/90 border-gray-800 hover:border-gray-700'
              } ${!notice.isActive ? 'opacity-60' : ''}`}
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
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

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleTogglePin(notice)}
                      title={notice.isPinned ? 'Unpin from Top' : 'Pin to Top'}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        notice.isPinned
                          ? 'text-indigo-400 bg-indigo-500/20'
                          : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <Pin className={`w-3.5 h-3.5 ${notice.isPinned ? 'rotate-45' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(notice)}
                      title={notice.isActive ? 'Deactivate notice' : 'Activate notice'}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                        notice.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-800 text-gray-500'
                      }`}
                    >
                      {notice.isActive ? 'Active' : 'Archived'}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="font-mono text-[10px] text-gray-400 block mb-0.5">
                    {notice.noticeNo}
                  </span>
                  <h3
                    onClick={() => setSelectedNotice(notice)}
                    className="text-sm font-bold text-white hover:text-indigo-400 transition-colors cursor-pointer line-clamp-2 leading-snug"
                  >
                    {notice.title}
                  </h3>
                </div>

                <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                  {notice.content}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-4 border-t border-gray-800/80 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    {notice.publishDate}
                  </span>
                  <span className="truncate max-w-[120px]" title={notice.targetAudience}>
                    {notice.targetAudience}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-indigo-300 font-medium truncate max-w-[150px]">
                    {notice.authorName}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedNotice(notice)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                    {(userRole === 'Principal' || userRole === 'Teacher') && (
                      <button
                        type="button"
                        onClick={() => handleDeleteNotice(notice.id)}
                        className="p-1 text-gray-500 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center rounded-2xl bg-gray-900 border border-gray-800 space-y-3">
            <Bell className="w-10 h-10 text-gray-600 mx-auto" />
            <p className="text-sm font-semibold text-gray-300">No circulars found</p>
            <p className="text-xs text-gray-500">
              Try adjusting your category or audience filter, or post a new institutional announcement.
            </p>
          </div>
        )}
      </div>

      {/* Compose Notice Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-gray-800 bg-gray-950 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Publish Institutional Circular</span>
              </div>
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="p-6 space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Notice Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Circular">Circular (Administrative)</option>
                    <option value="Holiday">Holiday Announcement</option>
                    <option value="Exam">Exam Routine / Schedule</option>
                    <option value="General">General Notice</option>
                    <option value="Event">Event / Celebration</option>
                    <option value="Urgent">Urgent Circular</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Target Audience *</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="All">All School (Staff, Parents, Students)</option>
                    <option value="Parents & Students">Parents & Students</option>
                    <option value="Teachers & Staff">Teachers & Staff Only</option>
                    <option value="Class 10 Only">Class 10 Candidates Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent / Action Required</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">Notice Title / Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Declaration of Holiday on Account of Chapchar Kût 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Publication Date</label>
                  <input
                    type="date"
                    required
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Expiry / Event Date (Optional)</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">Circular Content & Directives *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Enter official directives, schedules, timings, or instructions..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Author Name</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Author Designation</label>
                  <input
                    type="text"
                    value={authorDesignation}
                    onChange={(e) => setAuthorDesignation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">Attachment Label (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. MBSE_HSLC_Routine_2026.pdf"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/60 border border-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-gray-900 border-gray-700"
                  />
                  <div>
                    <span className="font-semibold text-white block">Pin Notice to Dashboard Ticker</span>
                    <span className="text-[11px] text-gray-400 block">
                      Featured notices appear at the very top of parent, student, and teacher dashboards.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Circular'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notice Detail Modal */}
      <NoticeDetailModal
        isOpen={!!selectedNotice}
        onClose={() => setSelectedNotice(null)}
        notice={selectedNotice}
      />
    </div>
  );
};
