import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  Building2,
  Sparkles,
  School,
  X,
  Database,
  QrCode,
  GraduationCap,
  CalendarDays,
  BookOpen,
  MessageSquare,
  Briefcase,
  UserPlus,
  Bell,
  ShieldCheck,
  Download,
  Bus,
} from 'lucide-react';
import { NavTab } from '../types';
import { isLiveFirebaseConfigured } from '../lib/firebase';
import { PWAInstallButton } from './pwa/PWAInstallButton';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  counts: {
    students: number;
    absentToday: number;
    pendingFees: number;
    overdueBooks?: number;
    activeLoans?: number;
    pendingAlerts?: number;
    staffCount?: number;
    pendingPayroll?: number;
    pendingAdmissions?: number;
    activeNotices?: number;
    totalRoutes?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  counts,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      sublabel: 'Overview & AI',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'students' as NavTab,
      label: 'Students',
      sublabel: 'Zirlai List & Records',
      icon: Users,
      badge: counts.students.toString(),
    },
    {
      id: 'attendance' as NavTab,
      label: 'Attendance',
      sublabel: 'Roll Call & Daily Log',
      icon: CalendarCheck,
      badge: counts.absentToday > 0 ? `${counts.absentToday} Absent` : null,
      badgeColor: counts.absentToday > 0 ? 'bg-rose-500/20 text-rose-300' : undefined,
    },
    {
      id: 'qr-attendance' as NavTab,
      label: 'QR Attendance',
      sublabel: 'Live Scanner & Badges',
      icon: QrCode,
      badge: 'Scanner',
      badgeColor: 'bg-indigo-500/20 text-indigo-300',
    },
    {
      id: 'gradebook' as NavTab,
      label: 'Gradebook',
      sublabel: 'Exams & Report Cards',
      icon: GraduationCap,
      badge: 'MBSE',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      id: 'timetable' as NavTab,
      label: 'Timetable',
      sublabel: 'Class Routines & Slots',
      icon: CalendarDays,
      badge: 'Live',
      badgeColor: 'bg-cyan-500/20 text-cyan-300',
    },
    {
      id: 'library' as NavTab,
      label: 'Library',
      sublabel: 'Books & Circulation',
      icon: BookOpen,
      badge: counts.overdueBooks && counts.overdueBooks > 0 ? `${counts.overdueBooks} Overdue` : 'Catalog',
      badgeColor: counts.overdueBooks && counts.overdueBooks > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-purple-500/20 text-purple-300',
    },
    {
      id: 'transport-hostel' as NavTab,
      label: 'Transport & Hostel',
      sublabel: 'Buses, Routes & Boarding',
      icon: Bus,
      badge: counts.totalRoutes && counts.totalRoutes > 0 ? `${counts.totalRoutes} Routes` : 'Transit',
      badgeColor: 'bg-amber-500/20 text-amber-300',
    },
    {
      id: 'fees' as NavTab,
      label: 'Fees & Payments',
      sublabel: 'Collection & Receipts',
      icon: CreditCard,
      badge: counts.pendingFees > 0 ? `${counts.pendingFees} Due` : null,
      badgeColor: counts.pendingFees > 0 ? 'bg-amber-500/20 text-amber-300' : undefined,
    },
    {
      id: 'portal' as NavTab,
      label: 'Parent & Student Portal',
      sublabel: 'Grades, Attendance & UPI',
      icon: ShieldCheck,
      badge: 'Parent/Zirlai',
      badgeColor: 'bg-indigo-500/20 text-indigo-300',
    },
    {
      id: 'admissions' as NavTab,
      label: 'Online Admission',
      sublabel: 'Web Form & Scrutiny',
      icon: UserPlus,
      badge: counts.pendingAdmissions && counts.pendingAdmissions > 0 ? `${counts.pendingAdmissions} New` : '2026-27',
      badgeColor: counts.pendingAdmissions && counts.pendingAdmissions > 0 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-gray-800 text-gray-400',
    },
    {
      id: 'notices' as NavTab,
      label: 'Notice Board',
      sublabel: 'Circulars & MBSE Updates',
      icon: Bell,
      badge: counts.activeNotices && counts.activeNotices > 0 ? `${counts.activeNotices} Live` : 'Circulars',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      id: 'staff' as NavTab,
      label: 'Staff & Payroll',
      sublabel: 'Faculty, Salary & Leaves',
      icon: Briefcase,
      badge: counts.pendingPayroll && counts.pendingPayroll > 0 ? `${counts.pendingPayroll} Due` : (counts.staffCount ? `${counts.staffCount}` : null),
      badgeColor: counts.pendingPayroll && counts.pendingPayroll > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300',
    },
    {
      id: 'notifications' as NavTab,
      label: 'SMS & WhatsApp',
      sublabel: 'Parent Alerts & Logs',
      icon: MessageSquare,
      badge: counts.pendingAlerts && counts.pendingAlerts > 0 ? `${counts.pendingAlerts} New` : 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      id: 'exports' as NavTab,
      label: 'Data Export & Reports',
      sublabel: 'Excel, CSV & JSON',
      icon: Download,
      badge: 'MBSE',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
    },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white tracking-tight">zoxs-sms</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 font-mono">
                  v1.2
                </span>
              </div>
              <p className="text-[11px] text-gray-400 truncate">Mizoram School System</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Main Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-400'
                    }`}
                  />
                  <div className="text-left">
                    <div className="font-semibold leading-tight">{item.label}</div>
                    <div
                      className={`text-[10px] leading-tight ${
                        isActive ? 'text-indigo-100' : 'text-gray-400'
                      }`}
                    >
                      {item.sublabel}
                    </div>
                  </div>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-gray-800/80">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Firestore Collections
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between px-3 py-1.5 text-gray-400 font-mono text-[11px]">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  col: students
                </span>
                <span className="text-gray-300 font-semibold">{counts.students}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 text-gray-400 font-mono text-[11px]">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  col: classes
                </span>
                <span className="text-gray-300 font-semibold">5</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 text-gray-400 font-mono text-[11px]">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  col: attendance
                </span>
                <span className="text-gray-300 font-semibold">Live</span>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 text-gray-400 font-mono text-[11px]">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                  col: fees
                </span>
                <span className="text-gray-300 font-semibold">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* PWA Install & App Status */}
        <div className="px-3 pb-3">
          <PWAInstallButton variant="sidebar" />
        </div>

        {/* Footer Database Status */}
        <div className="p-3.5 border-t border-gray-800 bg-gray-950/70">
          <div className="flex items-center gap-2 text-xs">
            <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-[11px] truncate flex items-center gap-1.5">
                Firebase Web SDK v10.8.0
              </div>
              <p className="text-[10px] text-gray-400">
                {isLiveFirebaseConfigured ? 'Live Cloud Firestore' : 'Reactive Firestore Bridge'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
