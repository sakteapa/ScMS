import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Smartphone,
  MessageSquare,
  Eye,
  ExternalLink,
  Trash2,
  Calendar,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  NotificationLog,
  NotificationStatus,
  NotificationChannel,
  NotificationCategory,
} from '../../types';
import {
  formatPhoneNumberDisplay,
  generateWhatsAppLink,
  generateSmsLink,
  retryNotificationLog,
  updateNotificationStatus,
} from '../../lib/notificationService';
import { deleteDocument } from '../../lib/firebase';
import { NotificationDetailModal } from './NotificationDetailModal';

interface NotificationLogsViewProps {
  notifications: NotificationLog[];
  onRefresh?: () => void;
}

export const NotificationLogsView: React.FC<NotificationLogsViewProps> = ({
  notifications,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | 'All'>('All');
  const [channelFilter, setChannelFilter] = useState<NotificationChannel | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategory | 'All'>('All');
  const [activeDetailLog, setActiveDetailLog] = useState<NotificationLog | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return notifications.filter((log) => {
      if (statusFilter !== 'All' && log.status !== statusFilter) return false;
      if (channelFilter !== 'All' && log.channel !== channelFilter) return false;
      if (categoryFilter !== 'All' && log.category !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = (log.studentName || '').toLowerCase().includes(query);
        const matchesPhone = (log.parentPhone || '').toLowerCase().includes(query);
        const matchesMsg = (log.message || '').toLowerCase().includes(query);
        const matchesRef = (log.gatewayRef || '').toLowerCase().includes(query);
        const matchesSubject = (log.subject || '').toLowerCase().includes(query);
        return matchesName || matchesPhone || matchesMsg || matchesRef || matchesSubject;
      }

      return true;
    });
  }, [notifications, statusFilter, channelFilter, categoryFilter, searchQuery]);

  // Statistics KPI calculations
  const totalCount = notifications.length;
  const deliveredCount = notifications.filter((n) => n.status === 'Delivered').length;
  const sentCount = notifications.filter((n) => n.status === 'Sent').length;
  const pendingCount = notifications.filter((n) => n.status === 'Pending').length;
  const failedCount = notifications.filter((n) => n.status === 'Failed').length;
  const deliveryRate = totalCount > 0 ? Math.round(((deliveredCount + sentCount) / totalCount) * 100) : 100;
  const waCount = notifications.filter((n) => n.channel === 'WhatsApp').length;
  const smsCount = notifications.filter((n) => n.channel === 'SMS').length;

  // Retry action
  const handleRetry = async (log: NotificationLog) => {
    setRetryingId(log.id);
    try {
      // Toggle to alternative channel or retry same
      const nextChannel = log.channel === 'SMS' ? 'WhatsApp' : 'SMS';
      await retryNotificationLog(log.id, nextChannel);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error('Error retrying log', e);
    } finally {
      setRetryingId(null);
    }
  };

  // Delete log entry
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this notification record from the administrative log?')) {
      await deleteDocument('notifications', id);
      if (onRefresh) onRefresh();
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'Log ID',
      'Timestamp',
      'Student Name',
      'Class',
      'Parent Phone',
      'Channel',
      'Category',
      'Subject',
      'Status',
      'Gateway Reference',
      'Dispatched By',
      'Failure Reason',
    ];

    const rows = filteredLogs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.studentName || ''}"`,
      `"${l.className || ''}"`,
      `"${l.parentPhone}"`,
      `"${l.channel}"`,
      `"${l.category}"`,
      `"${l.subject || ''}"`,
      `"${l.status}"`,
      `"${l.gatewayRef || ''}"`,
      `"${l.dispatchedBy}"`,
      `"${l.failureReason || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `zoxs_notifications_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Total Logged</span>
            <Send className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">{totalCount}</div>
          <div className="text-[11px] text-gray-400 mt-1">Audit trail records</div>
        </div>

        <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Delivery Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            {deliveryRate}%
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {deliveredCount + sentCount} succeeded
          </div>
        </div>

        <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Pending Queue</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
            {pendingCount}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Awaiting carrier receipt</div>
        </div>

        <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Failed / Bounced</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-rose-400">
            {failedCount}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">DND / route timeout</div>
        </div>

        <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-4 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Channel Share</span>
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-emerald-400">WA: {waCount}</span>
            <span className="text-gray-500">•</span>
            <span className="text-xs font-semibold text-indigo-400">SMS: {smsCount}</span>
          </div>
          <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden mt-2 flex">
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${totalCount ? (waCount / totalCount) * 100 : 50}%` }}
            />
            <div
              className="bg-indigo-500 h-full"
              style={{ width: `${totalCount ? (smsCount / totalCount) * 100 : 50}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-gray-800/60 border border-gray-700/70 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, roll number, phone (+91...), or gateway reference..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600/80 transition-colors cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-gray-400" />
            Export Audit Log (CSV)
          </button>
        </div>

        {/* Filter Badges Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-gray-900 p-0.5 rounded-lg border border-gray-750">
            {(['All', 'Delivered', 'Sent', 'Pending', 'Failed'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                  statusFilter === status
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Channel Filter */}
          <div className="flex items-center gap-1 bg-gray-900 p-0.5 rounded-lg border border-gray-750">
            {(['All', 'WhatsApp', 'SMS'] as const).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setChannelFilter(ch)}
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                  channelFilter === ch
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* Category Filter Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-gray-300 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Attendance Alert">Attendance Alerts</option>
            <option value="Fee Due Reminder">Fee Due Reminders</option>
            <option value="School Announcement">Announcements</option>
            <option value="Exam Notice">Exam Notices</option>
          </select>

          {(searchQuery || statusFilter !== 'All' || channelFilter !== 'All' || categoryFilter !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setChannelFilter('All');
                setCategoryFilter('All');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 underline ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Administrative Audit Log Table */}
      <div className="border border-gray-700/80 rounded-2xl bg-gray-900/80 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-200">
            <thead className="bg-gray-950/80 text-gray-400 uppercase text-[11px] border-b border-gray-700/70">
              <tr>
                <th scope="col" className="px-4 py-3.5 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">Date & Time</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">Student / Target</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">Parent Phone</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">Channel & Category</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">Message Preview</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">Gateway Ref</th>
                <th scope="col" className="px-4 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    No notification logs found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isDelivered = log.status === 'Delivered';
                  const isFailed = log.status === 'Failed';
                  const isPending = log.status === 'Pending';
                  const isWa = log.channel === 'WhatsApp';

                  return (
                    <tr key={log.id} className="hover:bg-gray-800/40 transition-colors">
                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isDelivered
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : isFailed
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : isPending
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          }`}
                        >
                          {isDelivered && <Check className="w-2.5 h-2.5" />}
                          {isFailed && <AlertTriangle className="w-2.5 h-2.5" />}
                          {isPending && <Clock className="w-2.5 h-2.5" />}
                          {log.status}
                        </span>
                        {isFailed && log.failureReason && (
                          <div className="text-[10px] text-rose-400 line-clamp-1 max-w-[140px] mt-0.5" title={log.failureReason}>
                            {log.failureReason}
                          </div>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="px-4 py-3.5 font-mono text-[11px] text-gray-300 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        <span className="text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Student / Target */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white">
                          {log.studentName || 'School Broadcast'}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {log.className || ''} {log.rollNo ? `• #${log.rollNo}` : ''}
                        </div>
                      </td>

                      {/* Parent Phone */}
                      <td className="px-4 py-3.5 font-mono text-emerald-400 whitespace-nowrap">
                        {formatPhoneNumberDisplay(log.parentPhone)}
                      </td>

                      {/* Channel & Category */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 mb-1">
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                              isWa
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-indigo-500/20 text-indigo-300'
                            }`}
                          >
                            {isWa ? <Smartphone className="w-2.5 h-2.5" /> : <MessageSquare className="w-2.5 h-2.5" />}
                            {log.channel}
                          </span>
                        </div>
                        <div className="text-[10px] text-amber-400/90 font-medium">
                          {log.category}
                        </div>
                      </td>

                      {/* Message Preview */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="text-gray-300 text-xs line-clamp-2 leading-relaxed">
                          {log.message}
                        </p>
                      </td>

                      {/* Gateway Ref */}
                      <td className="px-4 py-3.5 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                        <div>{log.gatewayRef || 'N/A'}</div>
                        <div className="text-[10px] text-gray-500">{log.dispatchedBy}</div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setActiveDetailLog(log)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                            title="View Audit Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {(isFailed || isPending) && (
                            <button
                              type="button"
                              disabled={retryingId === log.id}
                              onClick={() => handleRetry(log)}
                              className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
                              title={`Retry via ${log.channel === 'SMS' ? 'WhatsApp' : 'SMS'}`}
                            >
                              <RotateCcw className={`w-3.5 h-3.5 ${retryingId === log.id ? 'animate-spin' : ''}`} />
                            </button>
                          )}

                          {log.parentPhone && (
                            <a
                              href={generateWhatsAppLink(log.parentPhone, log.message)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-gray-800 transition-colors cursor-pointer"
                              title="Direct wa.me launch"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(log.id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-gray-800 transition-colors cursor-pointer"
                            title="Delete Log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Modal View */}
      <NotificationDetailModal
        isOpen={Boolean(activeDetailLog)}
        onClose={() => setActiveDetailLog(null)}
        notification={activeDetailLog}
        onStatusUpdated={onRefresh}
      />
    </div>
  );
};
