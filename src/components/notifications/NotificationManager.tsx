import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Smartphone,
  Sparkles,
  Users,
  FileText,
  Sliders,
  Send,
  CalendarCheck,
  CreditCard,
  PlusCircle,
  BellRing,
} from 'lucide-react';
import {
  FirestoreStudent,
  SchoolClass,
  FeeRecord,
  AttendanceRecord,
  NotificationLog,
  NotificationCategory,
} from '../../types';
import { TemplateComposerView } from './TemplateComposerView';
import { QuickBatchAlertsView } from './QuickBatchAlertsView';
import { NotificationLogsView } from './NotificationLogsView';
import { GatewaySettingsView } from './GatewaySettingsView';
import { subscribeToCollection } from '../../lib/firebase';

interface NotificationManagerProps {
  students: FirestoreStudent[];
  classes: SchoolClass[];
  fees: FeeRecord[];
  attendance: AttendanceRecord[];
}

export type NotificationSubTab = 'composer' | 'batch' | 'logs' | 'settings';

export const NotificationManager: React.FC<NotificationManagerProps> = ({
  students,
  classes,
  fees,
  attendance,
}) => {
  const [activeTab, setActiveTab] = useState<NotificationSubTab>('composer');
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);

  // Preselected context for composer
  const [composerStudentId, setComposerStudentId] = useState<string | undefined>(undefined);
  const [composerCategory, setComposerCategory] = useState<NotificationCategory | undefined>(undefined);

  // Subscribe to real-time notifications collection
  useEffect(() => {
    const unsubscribe = subscribeToCollection<NotificationLog>('notifications', (data) => {
      // Sort newest first
      const sorted = [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setNotifications(sorted);
    });

    return () => unsubscribe();
  }, []);

  const totalLogs = notifications.length;
  const failedCount = notifications.filter((n) => n.status === 'Failed').length;
  const deliveredCount = notifications.filter((n) => n.status === 'Delivered' || n.status === 'Sent').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-gray-850 border border-gray-750 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-400 shrink-0">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  SMS & WhatsApp Notification Hub
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Bilingual Mizo / English
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  wa.me & DLT API
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
                Automated attendance alerts (absent roll-call notices), fee due reminders, and school broadcasts with direct WhatsApp API integration and administrative delivery audit trails.
              </p>
            </div>
          </div>

          {/* Quick Header Metric Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-gray-800/80 border border-gray-700 text-right">
              <div className="text-[10px] text-gray-400 uppercase font-semibold">Total Dispatched</div>
              <div className="text-base sm:text-lg font-mono font-bold text-white">{totalLogs}</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-gray-800/80 border border-gray-700 text-right">
              <div className="text-[10px] text-gray-400 uppercase font-semibold">Delivered</div>
              <div className="text-base sm:text-lg font-mono font-bold text-emerald-400">{deliveredCount}</div>
            </div>
            {failedCount > 0 && (
              <div className="px-3.5 py-2 rounded-xl bg-rose-950/40 border border-rose-500/40 text-right">
                <div className="text-[10px] text-rose-300 uppercase font-semibold">Bounced / Failed</div>
                <div className="text-base sm:text-lg font-mono font-bold text-rose-400">{failedCount}</div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-gray-750">
          <button
            type="button"
            onClick={() => setActiveTab('composer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
              activeTab === 'composer'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-800/70 text-gray-400 hover:text-white hover:bg-gray-750'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Message Composer & Templates
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('batch')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
              activeTab === 'batch'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-800/70 text-gray-400 hover:text-white hover:bg-gray-750'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Quick Batch Alerts
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-800/70 text-gray-400 hover:text-white hover:bg-gray-750'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Administrative Logs & Audit
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                failedCount > 0 ? 'bg-rose-500/30 text-rose-300' : 'bg-gray-700 text-gray-300'
              }`}
            >
              {totalLogs}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 ml-auto ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-800/70 text-gray-400 hover:text-white hover:bg-gray-750'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Gateway & Carrier Config
          </button>
        </div>
      </div>

      {/* Active Sub-Tab Views */}
      <div>
        {activeTab === 'composer' && (
          <TemplateComposerView
            students={students}
            classes={classes}
            fees={fees}
            attendance={attendance}
            preselectedStudentId={composerStudentId}
            preselectedCategory={composerCategory}
            onNotificationDispatched={() => {
              // Can stay or switch to logs if desired
            }}
          />
        )}

        {activeTab === 'batch' && (
          <QuickBatchAlertsView
            students={students}
            classes={classes}
            fees={fees}
            attendance={attendance}
            onBatchDispatched={() => {
              // stay or view logs
            }}
          />
        )}

        {activeTab === 'logs' && (
          <NotificationLogsView
            notifications={notifications}
            onRefresh={() => {}}
          />
        )}

        {activeTab === 'settings' && (
          <GatewaySettingsView
            onSettingsUpdated={() => {}}
          />
        )}
      </div>
    </div>
  );
};
