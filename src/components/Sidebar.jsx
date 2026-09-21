import React from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  FileText, 
  QrCode, 
  CreditCard, 
  Users, 
  UserCheck, 
  BookOpen, 
  DollarSign, 
  UserPlus, 
  Bus, 
  Bell, 
  Building2, 
  ShieldCheck,
  ChevronRight,
  Sparkles,
  CalendarDays,
  Calendar,
  Code2,
  FileCheck,
  Clock,
  HeartPulse,
  Package,
  UtensilsCrossed,
  Award,
  Video,
  Radio,
  MessageSquare,
  BarChart3,
  Globe,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';

export default function Sidebar({ currentTab, setCurrentTab, isMobileOpen, setIsMobileOpen }) {
  const { currentUser, isPrincipal, isTeacher, isStudent, isParent, logout } = useAuth();
  const { admissions, notices, leaveApplications = [], systemConfig, t } = useSchool();

  const pendingAdmissionsCount = admissions.filter(a => a.status === 'pending').length;
  const pendingLeavesCount = leaveApplications.filter(l => l.status === 'pending_class_master' || l.status === 'pending_principal').length;

  const navItems = [
    {
      id: 'public_website',
      label: 'School Public Website',
      icon: Globe,
      roles: ['principal', 'vice_principal', 'warden', 'teacher', 'student', 'parent'],
      badge: 'Public Web',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['principal', 'vice_principal', 'warden', 'teacher', 'student', 'parent'],
      badge: null
    },
    {
      id: 'academics',
      label: 'Academics & Exams',
      icon: GraduationCap,
      roles: ['principal', 'vice_principal', 'teacher'],
      badge: 'Strict Split'
    },
    {
      id: 'report_cards',
      label: 'Report Card Generator',
      icon: FileText,
      roles: ['principal', 'vice_principal', 'teacher', 'student', 'parent'],
      badge: null
    },
    {
      id: 'certificates',
      label: 'Certificates & TC',
      icon: FileCheck,
      roles: ['principal', 'vice_principal', 'teacher', 'student', 'parent'],
      badge: 'MBSE TC',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'routine',
      label: 'Class Routine & Time Table',
      icon: CalendarDays,
      roles: ['principal', 'vice_principal', 'teacher', 'student', 'parent'],
      badge: 'Wall PDF'
    },
    {
      id: 'calendar',
      label: 'Calendar & Vacations',
      icon: Calendar,
      roles: ['principal', 'vice_principal', 'warden', 'teacher', 'student', 'parent'],
      badge: 'Vacations Hub',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'attendance',
      label: 'QR Scanner & Attendance',
      icon: QrCode,
      roles: ['principal', 'vice_principal', 'teacher'],
      badge: 'Live Cam'
    },
    {
      id: 'leave_management',
      label: 'Leave Applications',
      icon: Clock,
      roles: ['principal', 'vice_principal', 'teacher', 'student', 'parent'],
      badge: pendingLeavesCount > 0 ? `${pendingLeavesCount} Pending` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      id: 'hostel',
      label: 'Hostel Management Suite',
      icon: Building2,
      roles: ['principal', 'vice_principal', 'warden', 'teacher', 'parent', 'student'],
      badge: 'Dorm Suite',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    {
      id: 'financials',
      label: 'Financials & Fees',
      icon: CreditCard,
      roles: ['principal'],
      badge: 'UPI + Cash'
    },
    {
      id: 'students',
      label: 'Students Directory',
      icon: Users,
      roles: ['principal', 'vice_principal', 'teacher', 'warden'],
      badge: null
    },
    {
      id: 'portal',
      label: isParent ? 'Ward Portal' : 'Student Portal',
      icon: UserCheck,
      roles: ['student', 'parent', 'principal', 'vice_principal'],
      badge: isStudent || isParent ? 'My Hub' : null
    },
    {
      id: 'library',
      label: 'Library Management',
      icon: BookOpen,
      roles: ['principal', 'vice_principal', 'teacher', 'student'],
      badge: null
    },
    {
      id: 'staff_payroll',
      label: 'Staff & Governance',
      icon: DollarSign,
      roles: ['principal', 'vice_principal'],
      badge: 'Duties & Pay'
    },
    {
      id: 'admissions',
      label: 'Online Admissions',
      icon: UserPlus,
      roles: ['principal', 'vice_principal', 'teacher'],
      badge: pendingAdmissionsCount > 0 ? `${pendingAdmissionsCount} new` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'transport',
      label: 'Transport & Bus Fleet',
      icon: Bus,
      roles: ['principal', 'vice_principal', 'teacher', 'parent', 'student'],
      badge: null
    },
    {
      id: 'notices',
      label: 'Notice Board',
      icon: Bell,
      roles: ['principal', 'vice_principal', 'warden', 'teacher', 'student', 'parent'],
      badge: null
    },
    {
      id: 'clinic',
      label: 'Clinic & Sick Bay',
      icon: HeartPulse,
      roles: ['principal', 'vice_principal', 'warden', 'teacher', 'student', 'parent'],
      badge: 'Sick Bay',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      id: 'visitors',
      label: 'Gate Pass & Visitors',
      icon: ShieldCheck,
      roles: ['principal', 'vice_principal', 'warden', 'teacher'],
      badge: 'Gate Log'
    },
    {
      id: 'inventory',
      label: 'Inventory & Lab Assets',
      icon: Package,
      roles: ['principal', 'vice_principal', 'teacher'],
      badge: 'Labs & Stocks'
    },
    {
      id: 'canteen',
      label: 'Canteen & Smart Meal',
      icon: UtensilsCrossed,
      roles: ['principal', 'vice_principal', 'warden', 'teacher', 'student', 'parent'],
      badge: 'Smart Card',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'alumni',
      label: 'Alumni Network',
      icon: Award,
      roles: ['principal', 'vice_principal', 'teacher', 'student', 'parent'],
      badge: 'Network'
    },
    {
      id: 'group_conference',
      label: 'Group Conference',
      icon: Video,
      roles: ['principal', 'vice_principal', 'teacher'],
      badge: 'Video Rooms',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    },
    {
      id: 'live_broadcast',
      label: 'Live Broadcast Studio',
      icon: Radio,
      roles: ['principal', 'vice_principal', 'teacher'],
      badge: 'LIVE',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      id: 'staff_chat',
      label: 'Staff Messaging Hub',
      icon: MessageSquare,
      roles: ['principal', 'vice_principal', 'warden', 'teacher'],
      badge: 'Internal Chat',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    {
      id: 'analytics',
      label: 'Analytics Dashboard',
      icon: BarChart3,
      roles: ['principal', 'vice_principal'],
      badge: 'Insights',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'dev_studio',
      label: 'Developer Studio',
      icon: Code2,
      roles: ['superadmin'],
      badge: 'In-App IDE',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    }
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    const role = currentUser?.role || 'principal';
    if (role === 'superadmin') return true;
    return item.roles.includes(role);
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 w-72 bg-[#0c121e] border-r border-slate-800/80 z-50 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center gap-3.5 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-wide text-white font-['Outfit']">
              MIZORAM SCHOOL
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-cyan-400 font-mono tracking-wider">zoxs-sms</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] text-slate-400">Nursery - 12</span>
            </div>
          </div>
        </div>

        {/* Current Active Role Badge */}
        <div className="px-5 py-3 border-b border-slate-800/60 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Logged in as:</span>
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentUser?.role || 'Guest'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>v10.8.0</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-transparent text-cyan-300 border-l-4 border-cyan-400 shadow-sm font-semibold' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className="truncate">{t(item.id, item.label)}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info & School Emblem */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/40 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 truncate max-w-[140px]">{systemConfig?.schoolName || 'OHA (Oxford Higher Academy)'}</span>
            <span className="font-mono text-cyan-400/80 text-[10px] shrink-0">MBSE Affiliated</span>
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {systemConfig?.address || 'Lunglawn, Lunglei, Mizoram - 796701'}
          </div>

          <button
            onClick={async () => {
              if (logout) await logout();
              if (setCurrentTab) setCurrentTab('public_website');
            }}
            className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 flex items-center justify-center gap-2 text-xs font-bold transition shadow-sm"
            title="Log out and return to Public Website"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Logout / Exit ERP</span>
          </button>
        </div>
      </aside>
    </>
  );
}
