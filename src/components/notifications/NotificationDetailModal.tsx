import React from 'react';
import {
  X,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import { NotificationLog, NotificationChannel } from '../../types';
import {
  formatPhoneNumberDisplay,
  generateWhatsAppLink,
  generateSmsLink,
  retryNotificationLog,
} from '../../lib/notificationService';

interface NotificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: NotificationLog | null;
  onStatusUpdated?: () => void;
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  isOpen,
  onClose,
  notification,
  onStatusUpdated,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [retrying, setRetrying] = React.useState(false);

  if (!isOpen || !notification) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(notification.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRetry = async (targetChannel?: NotificationChannel) => {
    setRetrying(true);
    try {
      await retryNotificationLog(notification.id, targetChannel);
      if (onStatusUpdated) onStatusUpdated();
    } catch (e) {
      console.error('Error retrying notification', e);
    } finally {
      setRetrying(false);
    }
  };

  const isFailed = notification.status === 'Failed';
  const isPending = notification.status === 'Pending';
  const isDelivered = notification.status === 'Delivered';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full p-6 text-gray-100 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                notification.channel === 'WhatsApp'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
              }`}
            >
              {notification.channel === 'WhatsApp' ? (
                <Smartphone className="w-5 h-5" />
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Notification Audit Details</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    isDelivered
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : isFailed
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : isPending
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}
                >
                  {notification.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                Log ID: {notification.id} • {notification.channel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-gray-800/70 rounded-xl border border-gray-700/60">
            <span className="text-gray-400 block text-[11px]">Recipient Student</span>
            <span className="text-white font-semibold text-sm">
              {notification.studentName || 'School-Wide Broadcast'}
            </span>
            {notification.className && (
              <span className="text-gray-400 block text-[11px] mt-0.5">
                {notification.className} {notification.rollNo ? `• Roll #${notification.rollNo}` : ''}
              </span>
            )}
          </div>

          <div className="p-3 bg-gray-800/70 rounded-xl border border-gray-700/60">
            <span className="text-gray-400 block text-[11px]">Parent Contact Number</span>
            <span className="text-emerald-400 font-mono font-bold text-sm block">
              {formatPhoneNumberDisplay(notification.parentPhone)}
            </span>
            <span className="text-gray-400 block text-[11px] mt-0.5">
              {notification.parentName || 'Parent / Guardian'}
            </span>
          </div>

          <div className="p-3 bg-gray-800/70 rounded-xl border border-gray-700/60">
            <span className="text-gray-400 block text-[11px]">Category</span>
            <span className="text-amber-300 font-semibold">{notification.category}</span>
            <span className="text-gray-400 block text-[11px] mt-0.5">
              By: {notification.dispatchedBy}
            </span>
          </div>

          <div className="p-3 bg-gray-800/70 rounded-xl border border-gray-700/60">
            <span className="text-gray-400 block text-[11px]">Gateway Reference</span>
            <span className="text-gray-200 font-mono text-[11px] break-all">
              {notification.gatewayRef || 'N/A'}
            </span>
            <span className="text-gray-400 block text-[10px] mt-0.5">
              {new Date(notification.timestamp).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Failure Reason Banner if Failed */}
        {isFailed && notification.failureReason && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-rose-300">Carrier / Delivery Failure:</span>
              <p className="text-[11px] text-rose-200/90 mt-0.5">{notification.failureReason}</p>
            </div>
          </div>
        )}

        {/* Message Content Box */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
            <span className="font-semibold text-gray-300">Dispatched Notification Text</span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied to Clipboard' : 'Copy Text'}
            </button>
          </div>
          <div className="p-3.5 bg-gray-950 border border-gray-800 rounded-xl text-xs font-mono text-gray-200 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
            {notification.message}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-800">
          <div className="flex items-center gap-2">
            {notification.parentPhone && (
              <>
                <a
                  href={generateWhatsAppLink(notification.parentPhone, notification.message)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700/80 hover:bg-emerald-600 text-white transition-colors cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Open in WhatsApp (wa.me)
                </a>
                <a
                  href={generateSmsLink(notification.parentPhone, notification.message)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-700/80 hover:bg-indigo-600 text-white transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Open Native SMS
                </a>
              </>
            )}
          </div>

          {(isFailed || isPending) && (
            <button
              type="button"
              disabled={retrying}
              onClick={() => handleRetry(notification.channel === 'SMS' ? 'WhatsApp' : 'SMS')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
              Retry via {notification.channel === 'SMS' ? 'WhatsApp' : 'SMS'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
