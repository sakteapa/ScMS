import React, { useState, useEffect, useRef } from 'react';
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
  LogOut,
  MessageSquare,
  Laptop,
  UploadCloud,
  QrCode,
  Sliders,
  Sparkles,
  X,
  Code2,
  Headphones
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import NotificationDrawer from './NotificationDrawer';
import ProfileSettingsModal from './ProfileSettingsModal';
import DeveloperSupportModal from './DeveloperSupportModal';

export default function Navbar({ 
  currentTab, 
  setCurrentTab,
  setIsMobileOpen, 
  openRoleSwitcher, 
  openFirebaseModal, 
  openExportModal,
  openMobileAppModal,
  openWebsiteEditor,
  openSmsHubModal,
  openSchoolRulesModal,
  openCloudStorageModal,
  openQrScannerModal,
  onViewWebsite
}) {
  const { currentUser, logout, isPrincipal, isVicePrincipal, isSuperAdmin } = useAuth();
  const { 
    isOfflinePersistenceActive, 
    lastSyncTime, 
    notices = [], 
    tasks = [], 
    language, 
    toggleLanguage, 
    changeLanguage,
    SUPPORTED_LANGUAGES,
    t,
    activeSchoolId,
    activeSchoolInfo,
    registeredSchools = [],
    switchSchool,
    websiteConfig
  } = useSchool();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isSchoolMenuOpen, setIsSchoolMenuOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDevSupportModalOpen, setIsDevSupportModalOpen] = useState(false);
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
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const toolsMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target)) {
        setIsToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    if (setCurrentTab) setCurrentTab('login');
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
        case 'id_card_studio': return 'Smart ID & RFID Studio';
        case 'dev_studio': return 'Control Center & Module Enkawlna';
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
      case 'id_card_studio': return 'Smart ID Card & RFID Studio';
      case 'financials': return 'Financial Ledger & Dual Payment Gateway';
      case 'students': return 'Student Directory & Identity Management';
      case 'portal': return 'Student & Parent Portal';
      case 'library': return 'Central Library Inventory & Tracking';
      case 'staff_payroll': return 'Staff Governance & Responsibility Administration';
      case 'admissions': return 'Online Admissions & Approval Council';
      case 'hostel': return 'Hostel Boarding & Residential Suite';
      case 'transport': return 'Transport Fleet & Bus Routes';
      case 'transport_hostel': return 'Transport Fleet & Hostel Management';
      case 'notices': return 'Notice Broadcast Board';
      case 'dev_studio': return 'Control Center & Module Studio';
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
        return { label: 'Principal', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: ShieldCheck };
    }
  };

  const badge = getRoleBadge(currentUser?.role);
  const RoleIcon = badge.icon;

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 lg:h-20 bg-[#090d16]/90 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger & Active Page Title */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1 mr-2 sm:mr-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base lg:text-xl font-bold text-white font-['Outfit'] tracking-tight truncate max-w-[200px] xs:max-w-[260px] sm:max-w-none">
              {getTabLabel(currentTab)}
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 hidden md:block truncate whitespace-nowrap">
            Mizoram School System • Academic Year 2026-2027
          </p>
        </div>
      </div>

      {/* Right: Actions, Sync Status, Role Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Offline / Firestore Persistence Status Pill */}
        <div 
          onClick={openFirebaseModal}
          className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition text-xs group shrink-0"
          title="Click to view Firebase v10.8.0 offline persistence & credentials"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-medium">Firestore v10.8</span>
          <span className="text-[10px] font-mono text-cyan-400 border-l border-slate-700 pl-2">
            Persistent Cache
          </span>
        </div>

        {/* Multi-Tenant School Selector: SuperAdmin only can switch; everyone else sees dedicated School Badge */}
        {isSuperAdmin && registeredSchools.length > 1 ? (
          <div className="relative hidden sm:block">
            <button
              onClick={() => setIsSchoolMenuOpen(!isSchoolMenuOpen)}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-indigo-500/40 hover:border-indigo-400 text-white transition flex items-center gap-2 text-xs font-bold shadow-md shadow-indigo-950/30"
              title="Switch Active School Tenant (Platform Master Admin Only)"
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
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Platform Multi-Tenant Switcher</span>
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
        ) : (
          <div 
            className="hidden sm:flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/80 border border-indigo-500/30 text-white text-xs font-bold shadow-sm"
            title={`${activeSchoolInfo?.name} (Locked School Session)`}
          >
            <School className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="hidden md:inline max-w-[160px] truncate text-slate-200">
              {activeSchoolInfo?.shortName || activeSchoolInfo?.name || 'School'}
            </span>
          </div>
        )}

        {/* Global Multi-Language Localization Selector */}
        <div className="relative">
          <button
            onClick={() => setIsLangMenuOpen(prev => !prev)}
            className="p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold shadow-sm"
            title="Switch Language (India Multi-Language Suite)"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-cyan-400 font-extrabold">
              {language ? language.toUpperCase() : 'EN'}
            </span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isLangMenuOpen && (
            <div 
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setIsLangMenuOpen(false)}
            >
              <div className="px-3 py-1.5 border-b border-slate-800/80 mb-1 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Ṭawng Thlanna (Language)</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono font-semibold">India</span>
              </div>
              <div className="space-y-0.5 max-h-64 overflow-y-auto">
                {(SUPPORTED_LANGUAGES || []).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                      language === lang.code
                        ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-100">{lang.native}</div>
                      <div className="text-[10px] text-slate-400">{lang.name} • {lang.region}</div>
                    </div>
                    {language === lang.code && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Large Screen Shortcuts (Visible only on 2xl+ to avoid horizontal overflow on standard laptops) */}
        <button
          onClick={onViewWebsite}
          className="hidden 2xl:flex p-1.5 px-2.5 py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/40 hover:border-purple-500 text-purple-300 hover:text-white transition items-center gap-1.5 text-xs font-semibold shadow-md shadow-purple-950/30 shrink-0 cursor-pointer"
          title="View Public School Website & Landing Page"
        >
          <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>Public Web</span>
        </button>

        {!isAlreadyInstalled && (
          <button
            onClick={openMobileAppModal}
            className="hidden 2xl:flex px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-700/40 hover:border-indigo-500 text-slate-200 hover:text-white transition items-center gap-2 text-xs font-semibold shadow-md shadow-indigo-950/40 shrink-0 cursor-pointer"
            title="Download & Install PC Desktop Software & Mobile App"
          >
            <Laptop className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>PC &amp; App</span>
            {isInstallable && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>
        )}

        {(isPrincipal || isVicePrincipal || isSuperAdmin || currentUser?.role === 'teacher') && (
          <button
            onClick={openSmsHubModal}
            className="hidden 2xl:flex p-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950/70 to-teal-950/70 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 hover:text-white transition items-center gap-1.5 text-xs font-semibold shadow-md shadow-emerald-950/30 shrink-0 cursor-pointer"
            title="SMS & WhatsApp Parent Notification Studio"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>SMS &amp; WA</span>
          </button>
        )}

        {/* Direct Developer & Tech Support Hotline Button */}
        {websiteConfig?.developerCredits?.showInPortalHelp !== false && (
          <button
            type="button"
            onClick={() => setIsDevSupportModalOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 hover:border-purple-400 text-purple-200 hover:text-white transition flex items-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer shadow-sm"
            title="Official Developer Identity & 24/7 Tech Support Hotline"
          >
            <Code2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="hidden md:inline">Dev Support</span>
          </button>
        )}

        {/* Universal Quick Tools Dropdown Menu (Guarantees no overflow on any screen size) */}
        <div className="relative shrink-0" ref={toolsMenuRef}>
          <button
            type="button"
            onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
            className={`p-1.5 sm:px-2.5 sm:py-2 rounded-xl transition flex items-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer ${
              isToolsMenuOpen 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/40' 
                : 'bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Quick Action Tools & Institutional Utility Launchers"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="hidden sm:inline">Quick Tools</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isToolsMenuOpen ? 'rotate-180 text-cyan-400' : ''}`} />
          </button>

          {isToolsMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 space-y-2">
              <div className="px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">System Utilities</span>
                  <span className="text-xs text-white font-bold">Quick Action Launchers</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsToolsMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Group 1: Apps & Portals */}
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-slate-400 px-2.5 uppercase tracking-wider">Web &amp; Devices</p>
                <button
                  type="button"
                  onClick={() => { setIsToolsMenuOpen(false); onViewWebsite(); }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-purple-950/40 border border-transparent hover:border-purple-800/40 text-left transition group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white group-hover:text-purple-300 transition">Public School Website</div>
                    <div className="text-[10px] text-slate-400 truncate">Official public landing page &amp; admissions</div>
                  </div>
                </button>

                {!isAlreadyInstalled && (
                  <button
                    type="button"
                    onClick={() => { setIsToolsMenuOpen(false); openMobileAppModal(); }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-indigo-950/40 border border-transparent hover:border-indigo-800/40 text-left transition group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition flex items-center gap-1.5">
                        <span>PC &amp; Phone App Installer</span>
                        {isInstallable && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">Install standalone app on Android &amp; Windows</div>
                    </div>
                  </button>
                )}
              </div>

              {/* Group 2: Communication & Verification */}
              {(isPrincipal || isVicePrincipal || isSuperAdmin || currentUser?.role === 'teacher' || currentUser?.role === 'admin') && (
                <div className="space-y-1 pt-1 border-t border-slate-800/80">
                  <p className="text-[10px] font-semibold text-slate-400 px-2.5 uppercase tracking-wider">Communication &amp; QR</p>
                  
                  <button
                    type="button"
                    onClick={() => { setIsToolsMenuOpen(false); openSmsHubModal(); }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-emerald-950/40 border border-transparent hover:border-emerald-800/40 text-left transition group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition">SMS &amp; WhatsApp Studio</div>
                      <div className="text-[10px] text-slate-400 truncate">Broadcast fee dues, marks &amp; absences</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setIsToolsMenuOpen(false); openCloudStorageModal(); }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-cyan-950/40 border border-transparent hover:border-cyan-800/40 text-left transition group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition">Cloud Photos &amp; Media</div>
                      <div className="text-[10px] text-slate-400 truncate">Student ID photos &amp; certificates</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setIsToolsMenuOpen(false); openQrScannerModal(); }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-sky-950/40 border border-transparent hover:border-sky-800/40 text-left transition group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-sky-300 transition">Live QR Camera Scanner</div>
                      <div className="text-[10px] text-slate-400 truncate">Instant gate pass &amp; student verification</div>
                    </div>
                  </button>
                </div>
              )}

              {/* Group 3: Institutional Data & Rules */}
              <div className="space-y-1 pt-1 border-t border-slate-800/80">
                <p className="text-[10px] font-semibold text-slate-400 px-2.5 uppercase tracking-wider">Governance &amp; Settings</p>
                
                <button
                  type="button"
                  onClick={() => { setIsToolsMenuOpen(false); openSchoolRulesModal(); }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-amber-950/40 border border-transparent hover:border-amber-800/40 text-left transition group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white group-hover:text-amber-300 transition">Dan &amp; Hrai (Rules &amp; Code)</div>
                    <div className="text-[10px] text-slate-400 truncate">School constitution &amp; disciplinary rules</div>
                  </div>
                </button>

                {(isPrincipal || isVicePrincipal || isSuperAdmin) && (
                  <button
                    type="button"
                    onClick={() => { setIsToolsMenuOpen(false); openExportModal(); }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-800 border border-transparent text-left transition group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-cyan-400 flex items-center justify-center shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition">Export Data Center</div>
                      <div className="text-[10px] text-slate-400 truncate">Download Excel, CSV &amp; student registers</div>
                    </div>
                  </button>
                )}

                {(isPrincipal || isSuperAdmin) && (
                  <button
                    type="button"
                    onClick={() => { setIsToolsMenuOpen(false); openFirebaseModal(); }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-800 border border-transparent text-left transition group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0">
                      <Database className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition">Database &amp; Cloud Config</div>
                      <div className="text-[10px] text-slate-400 truncate">Firebase v10.8 keys &amp; sync diagnostic</div>
                    </div>
                  </button>
                )}
              </div>

              {/* Group: Developer & Tech Support Hotline */}
              {websiteConfig?.developerCredits?.showInPortalHelp !== false && (
                <div className="pt-1 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => { setIsToolsMenuOpen(false); setIsDevSupportModalOpen(true); }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-purple-950/40 border border-transparent hover:border-purple-800/40 text-left transition group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-purple-300 transition flex items-center gap-1.5">
                        <span>Developer &amp; Tech Support</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">WhatsApp chat, hotline &amp; feature desk</div>
                    </div>
                  </button>
                </div>
              )}

              {/* Group 4: Logout inside menu for mobile/compact */}
              <div className="pt-1 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => { setIsToolsMenuOpen(false); handleLogout(); }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 text-left transition group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-rose-300 group-hover:text-rose-200 transition">Logout Session</div>
                    <div className="text-[10px] text-slate-400 truncate">Sign out safely and return to portal</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications & Private Alerts Bell Trigger (Pinned - Always Visible) */}
        <button
          onClick={() => setIsNotificationDrawerOpen(true)}
          className="relative p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition text-xs shrink-0 cursor-pointer"
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

        {/* Unified User Profile & Role Trigger — Pinned - Always Visible */}
        <button
          type="button"
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-2 sm:pr-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-slate-900 to-[#0f172a] border border-slate-800 hover:border-violet-500/60 cursor-pointer transition shadow-sm group shrink-0"
          title="Open Profile Settings & Switch Roles"
        >
          <div className="relative shrink-0">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={currentUser?.displayName || 'Principal'}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover ring-1 ring-violet-400/40"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
          </div>

          <div className="hidden sm:flex flex-col text-left leading-tight shrink-0">
            <span className="text-xs font-bold text-white group-hover:text-violet-300 transition truncate max-w-[130px]">
              {currentUser?.displayName || 'Rev. Dr. L. H. Rohmingliana'}
            </span>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border w-fit mt-0.5 ${badge.color}`}>
              {badge.label}
            </span>
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-300 transition shrink-0 ml-0.5 hidden sm:block" />
        </button>

        {/* Logout Action Button (Desktop 2xl only, smaller screens have it inside Quick Tools & Profile) */}
        <button
          onClick={handleLogout}
          className="hidden 2xl:flex p-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 transition items-center gap-1.5 text-xs font-bold shrink-0 shadow-sm cursor-pointer"
          title="Log out and return to Public Website"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Logout</span>
        </button>
      </div>

      {/* Interactive Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        setCurrentTab={setCurrentTab}
      />

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Developer & Technical Support Modal */}
      <DeveloperSupportModal
        isOpen={isDevSupportModalOpen}
        onClose={() => setIsDevSupportModalOpen(false)}
      />
    </header>
  );
}
