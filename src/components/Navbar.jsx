import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  Database, 
  Download, 
  UserCircle2, 
  ShieldCheck, 
  GraduationCap, 
  UserCheck, 
  HeartHandshake, 
  Wifi,
  ChevronDown,
  Building2,
  Award,
  Smartphone,
  Globe,
  School,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import NotificationDrawer from './NotificationDrawer';

export default function Navbar({ 
  currentTab, 
  setCurrentTab,
  setIsMobileOpen, 
  openRoleSwitcher, 
  openFirebaseModal, 
  openExportModal,
  openMobileAppModal,
  openWebsiteEditor,
  onViewWebsite
}) {
  const { currentUser, logout } = useAuth();
  const { 
    isOfflinePersistenceActive, 
    lastSyncTime, 
    notices = [], 
    tasks = [], 
    language, 
    toggleLanguage, 
    t,
    activeSchoolId,
    activeSchoolInfo,
    registeredSchools = [],
    switchSchool
  } = useSchool();
  const [isSchoolMenuOpen, setIsSchoolMenuOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isAlreadyInstalled, setIsAlreadyInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    );
  });

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // When user installs the app, hide installer trigger immediately
    const installedHandler = () => {
      setIsAlreadyInstalled(true);
      setIsInstallable(false);
    };
    window.addEventListener('appinstalled', installedHandler);

    // Watch for standalone display mode changes
    const mq = window.matchMedia('(display-mode: standalone)');
    const mqHandler = (e) => {
      if (e.matches) {
        setIsAlreadyInstalled(true);
      }
    };
    if (mq.addEventListener) {
      mq.addEventListener('change', mqHandler);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
      if (mq.removeEventListener) {
        mq.removeEventListener('change', mqHandler);
      }
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleLogout = async () => {
    if (logout) await logout();
    if (setCurrentTab) setCurrentTab('public_website');
  };

  const getTabLabel = (id) => {
    if (language === 'mizo') {
      switch (id) {
        case 'dashboard': return 'Pualpui (Dashboard Overview)';
        case 'academics': return 'Zirlaibuk & MBSE Marksheet Enkawlna';
        case 'report_cards': return 'MBSE Standard Report Card Buatsaihna';
        case 'certificates': return 'Institutional Certificates & TC Lakna';
        case 'routine': return 'Class Routine & Zirna Hunbi';
        case 'calendar': return 'Mizoram Calendar & Chawlh Hun';
        case 'attendance': return 'QR Scanner & Attendance Enna';
        case 'financials': return 'School Sum & Fee Khawnna';
        case 'students': return 'Zirlai Hming Ziahna (Directory)';
        case 'portal': return 'Zirlai & Nu/Pa Pual Portal';
        case 'library': return 'Lehkhabu In (Library Circulation)';
        case 'staff_payroll': return 'Zirtirtu & Hlawh Enkawlna';
        case 'admissions': return 'Admission Tharlam Dilna';
        case 'hostel': return 'Hostel Boarding & Residential Suite';
        case 'transport': return 'School Bus & Live GPS Fleet';
        case 'transport_hostel': return 'Transport Fleet & Hostel Management';
        case 'notices': return 'Hriattirna Broadcast Board';
        case 'dev_studio': return 'In-App Developer Studio & IDE';
        default: return 'School Management System';
      }
    }
    switch (id) {
      case 'dashboard': return 'Dashboard Overview';
      case 'academics': return 'Academic Management & Gradebook';
      case 'report_cards': return 'MBSE Standard Report Card Generator';
      case 'certificates': return 'Institutional Certificates & TC Generator';
      case 'routine': return 'Class Routine & Academic Time Table';
      case 'calendar': return 'Mizoram Academic Calendar & Events';
      case 'attendance': return 'QR Scanner & Real-Time Attendance';
      case 'financials': return 'Financial Ledger & Dual Payment Gateway';
      case 'students': return 'Student Directory & Identity Management';
      case 'portal': return 'Student & Parent Portal';
      case 'library': return 'Central Library Inventory & Tracking';
      case 'staff_payroll': return 'Staff Governance & Responsibility Administration';
      case 'admissions': return 'Online Admissions & Approval Council';
      case 'hostel': return 'Hostel Boarding & Residential Suite';
      case 'transport': return 'Transport Fleet & Bus Routes';
      case 'transport_hostel': return 'Transport Fleet & Hostel Management';
      case 'notices': return 'Circulars & Notice Broadcast Board';
      case 'dev_studio': return 'In-App Developer Studio & IDE';
      default: return 'School Management System';
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'superadmin':
        return { label: 'Super Admin', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30', icon: ShieldCheck };
      case 'principal':
        return { label: 'Principal', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: ShieldCheck };
      case 'vice_principal':
        return { label: 'Vice Principal', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: Award };
      case 'warden':
        return { label: 'Hostel Warden', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: Building2 };
      case 'teacher':
        return { label: 'Teacher', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', icon: GraduationCap };
      case 'student':
        return { label: 'Student', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: UserCheck };
      case 'parent':
        return { label: 'Parent', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: HeartHandshake };
      default:
        return { label: 'User', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', icon: UserCircle2 };
    }
  };

  const badge = getRoleBadge(currentUser?.role);
  const RoleIcon = badge.icon;

  return (
    <header className="sticky top-0 z-30 h-20 bg-[#090d16]/85 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger & Active Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-white font-['Outfit'] tracking-tight">
              {getTabLabel(currentTab)}
            </h1>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Mizoram School System • Academic Year 2026-2027
          </p>
        </div>
      </div>

      {/* Right: Actions, Sync Status, Role Switcher */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Offline / Firestore Persistence Status Pill */}
        <div 
          onClick={openFirebaseModal}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition text-xs group"
          title="Click to view Firebase v10.8.0 offline persistence & credentials"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-medium">Firestore v10.8</span>
          <span className="text-[10px] font-mono text-cyan-400 border-l border-slate-700 pl-2">
            Persistent Cache
          </span>
        </div>

        {/* Multi-Tenant School Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSchoolMenuOpen(!isSchoolMenuOpen)}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-indigo-500/40 hover:border-indigo-400 text-white transition flex items-center gap-2 text-xs font-bold shadow-md shadow-indigo-950/30"
            title="Switch Active School Tenant (Subdomain)"
          >
            <School className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="hidden md:inline max-w-[150px] truncate text-slate-200">
              {activeSchoolInfo?.shortName || activeSchoolInfo?.name || 'School'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {isSchoolMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active School Tenant</span>
                <span className="text-xs text-indigo-300 font-semibold">{activeSchoolInfo?.name}</span>
              </div>
              <div className="space-y-1">
                {registeredSchools.map((sch) => (
                  <button
                    key={sch.id}
                    onClick={() => {
                      setIsSchoolMenuOpen(false);
                      switchSchool(sch.id);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                      activeSchoolId === sch.id
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{sch.shortName || sch.name}</p>
                      <p className={`text-[10px] ${activeSchoolId === sch.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {sch.subdomain}.zoxs.in
                      </p>
                    </div>
                    {activeSchoolId === sch.id && (
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Active</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Global Language Localization Switcher Toggle */}
        <button
          onClick={toggleLanguage}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
          title={language === 'en' ? 'Thlak rawh: Mizo Ṭawng' : 'Switch to: English Language'}
        >
          <span className="text-sm">{language === 'en' ? '🇬🇧' : '🇲🇿'}</span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-400">
            {language === 'en' ? 'EN' : 'MIZO'}
          </span>
        </button>

        {/* Public Website Switcher */}
        <button
          onClick={onViewWebsite}
          className="p-1.5 sm:px-2.5 sm:py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 hover:border-purple-500 text-purple-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold shadow-md shadow-purple-950/30"
          title="View Public School Website & Landing Page"
        >
          <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="hidden xl:inline">Public Web</span>
        </button>

        {/* Mobile Application Download & PWA Install Trigger (hidden if already installed) */}
        {!isAlreadyInstalled && (
          <button
            onClick={openMobileAppModal}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-700/40 hover:border-indigo-500 text-slate-200 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold shadow-md shadow-indigo-950/40"
            title="Download & Install Mobile Application (Android, iOS & Standalone APK)"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Mobile App</span>
            {isInstallable && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>
        )}

        <button
          onClick={openExportModal}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-2 text-xs font-medium"
          title="Export Excel / CSV Data Center"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Export Data</span>
        </button>

        {/* Firebase Config Modal Trigger */}
        <button
          onClick={openFirebaseModal}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition text-xs"
          title="Firebase Web SDK v10.8.0 Settings"
        >
          <Database className="w-4 h-4 text-indigo-400" />
        </button>

        {/* Notifications & Private Alerts Bell Trigger */}
        <button
          onClick={() => setIsNotificationDrawerOpen(true)}
          className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition text-xs"
          title="Notifications, Circulars & Private Direct Alerts"
        >
          <Bell className="w-4 h-4 text-cyan-400" />
          {(() => {
            const currentUserId = currentUser?.role === 'student'
              ? currentUser?.studentId
              : currentUser?.role === 'parent'
              ? currentUser?.wardStudentId
              : currentUser?.id;

            const unreadCount = notices.filter(n => {
              if (n.scope === 'private') {
                if (n.targetUserId === currentUserId || n.targetUserId === currentUser?.id) {
                  return !(n.readBy || []).includes(currentUserId);
                }
                return false;
              }
              return !(n.readBy || []).includes(currentUserId);
            }).length;

            const pendingTaskCount = tasks.filter(t => {
              if (t.status === 'completed') return false;
              if (currentUser?.role === 'principal' || currentUser?.role === 'superadmin') return true;
              if (t.assignedToRole === 'all') return true;
              if (t.assignedToRole === currentUser?.role) return true;
              if (t.assignedToUserId === currentUser?.id || t.assignedToUserId === currentUserId) return true;
              return false;
            }).length;

            const totalAlerts = unreadCount + pendingTaskCount;

            return totalAlerts > 0 ? (
              <span 
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center font-mono shadow animate-pulse"
                title={`${unreadCount} notices • ${pendingTaskCount} pending tasks`}
              >
                {totalAlerts}
              </span>
            ) : null;
          })()}
        </button>

        {/* User / Fast Role Switcher Dropdown Trigger */}
        <div
          onClick={openRoleSwitcher}
          className="flex items-center gap-2.5 pl-2 sm:pl-3 pr-2.5 py-1.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition shadow-md group"
        >
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt="User avatar"
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-cyan-400/40"
          />
          <div className="hidden sm:flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition truncate max-w-[130px]">
                {currentUser?.displayName || 'Rev. Dr. Rohmingliana'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition" />
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded border w-fit ${badge.color}`}>
              {badge.label}
            </span>
          </div>
        </div>

        {/* Logout Action Button */}
        <button
          onClick={handleLogout}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 transition flex items-center gap-1.5 text-xs font-bold shrink-0 shadow-sm"
          title="Log out and return to Public Website"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span className="hidden xl:inline">Logout</span>
        </button>
      </div>

      {/* Interactive Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        setCurrentTab={setCurrentTab}
      />
    </header>
  );
}
