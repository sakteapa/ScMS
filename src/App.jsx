import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { ShieldAlert } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import RoleSwitcherModal from './components/RoleSwitcherModal';
import FirebaseConfigModal from './components/FirebaseConfigModal';
import ExportModal from './components/ExportModal';
import PrivateCallModal from './components/PrivateCallModal';
import MobileAppDownloadModal from './components/MobileAppDownloadModal';
import SuperAdminAiWidget from './components/SuperAdminAiWidget';
import SchoolAiAssistant from './components/SchoolAiAssistant';
import MobileBottomNav from './components/MobileBottomNav';

import DashboardView from './views/DashboardView';
import ClassAdminLiveView from './views/ClassAdminLiveView';
import AcademicsView from './views/AcademicsView';
import ReportCardView from './views/ReportCardView';
import CertificatesView from './views/CertificatesView';
import RoutineView from './views/RoutineView';
import AttendanceView from './views/AttendanceView';
import FinancialsView from './views/FinancialsView';
import StudentsView from './views/StudentsView';
import PortalView from './views/PortalView';
import LibraryView from './views/LibraryView';
import StaffPayrollView from './views/StaffPayrollView';
import AdmissionsView from './views/AdmissionsView';
import TransportHostelView from './views/TransportHostelView';
import HostelView from './views/HostelView';
import NoticesView from './views/NoticesView';
import DevStudioView from './views/DevStudioView';
import CalendarView from './views/CalendarView';
import LeaveManagementView from './views/LeaveManagementView';
import ClinicView from './views/ClinicView';
import VisitorsView from './views/VisitorsView';
import InventoryView from './views/InventoryView';
import AlumniView from './views/AlumniView';
import CanteenView from './views/CanteenView';
import GroupConferenceView from './views/GroupConferenceView';
import LiveBroadcastView from './views/LiveBroadcastView';
import StaffChatView from './views/StaffChatView';
import AnalyticsDashboardView from './views/AnalyticsDashboardView';
import PublicWebsiteView from './views/PublicWebsiteView';
import LoginView from './views/LoginView';
import WebsiteEditorModal from './components/WebsiteEditorModal';
import { PublicAdmissionPortalModal } from './components/admissions/PublicAdmissionPortalModal';

function SchoolAppContent() {
  const { center_id } = useParams();
  const { currentUser, isPrincipal, isVicePrincipal, isTeacher, isWarden, isStudent, isParent, isSuperAdmin } = useAuth();
  const { staff = [], showcaseNotice, activeSchoolId, switchSchool } = useSchool();
  const userRole = currentUser?.role || 'principal';

  // Automatically sync academic center if specified in URL route (e.g. /:center_id)
  useEffect(() => {
    if (center_id && center_id.toLowerCase() !== (activeSchoolId || '').toLowerCase() && typeof switchSchool === 'function') {
      switchSchool(center_id);
    }
  }, [center_id]);

  const isAllowedTab = (tab, role) => {
    if (role === 'superadmin') return true;

    // Check if staff member was granted designated Office Staff module access by Admin/VP
    const staffRecord = staff.find(s => 
      s.id === currentUser?.staffId || 
      s.email?.toLowerCase() === currentUser?.email?.toLowerCase() ||
      s.name?.toLowerCase() === currentUser?.displayName?.toLowerCase()
    );
    if (staffRecord?.isOfficeStaff && staffRecord?.assignedModuleAccess?.includes(tab)) {
      return true;
    }

    switch (tab) {
      case 'public_website':
        return true;
      case 'dashboard':
        return ['principal', 'vice_principal', 'warden', 'teacher'].includes(role);
      case 'portal':
        return ['principal', 'vice_principal', 'student', 'parent'].includes(role);
      case 'academics':
      case 'class_admin_live':
      case 'report_cards':
      case 'attendance':
      case 'inventory':
      case 'group_conference':
      case 'live_broadcast':
        return ['principal', 'vice_principal', 'teacher'].includes(role);
      case 'certificates':
      case 'staff_payroll':
      case 'admissions':
      case 'analytics':
        return ['principal', 'vice_principal'].includes(role);
      case 'routine':
      case 'calendar':
      case 'notices':
      case 'alumni':
        return true;
      case 'leave_management':
      case 'leave':
        return ['principal', 'vice_principal', 'warden', 'teacher'].includes(role);
      case 'hostel':
        return ['principal', 'vice_principal', 'warden'].includes(role);
      case 'financials':
        return ['principal'].includes(role);
      case 'students':
      case 'clinic':
      case 'visitors':
      case 'canteen':
      case 'staff_chat':
        return ['principal', 'vice_principal', 'warden', 'teacher'].includes(role);
      case 'library':
      case 'transport':
      case 'transport_hostel':
        return ['principal', 'vice_principal', 'teacher'].includes(role);
      case 'dev_studio':
        return role === 'superadmin';
      default:
        return false;
    }
  };

  // Default landing page: Public Front Website for visitors; Portal/Dashboard for logged-in users
  const defaultTab = currentUser ? ((userRole === 'student' || userRole === 'parent') ? 'portal' : 'dashboard') : 'public_website';
  const [currentTab, setCurrentTab] = useState(defaultTab);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMobileAppModalOpen, setIsMobileAppModalOpen] = useState(false);
  const [isWebsiteEditorOpen, setIsWebsiteEditorOpen] = useState(false);
  const [isPublicAdmissionModalOpen, setIsPublicAdmissionModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState(null);
  
  const { 
    activePrivateCall, 
    endPrivateCall, 
    admissions = [], 
    submitOnlineAdmission,
    classes = [],
    onlineAdmissionConfig
  } = useSchool();

  // If user role changes (e.g. from role switcher or session switch), redirect if current tab is forbidden
  useEffect(() => {
    if (currentUser) {
      if (currentTab === 'login' || !isAllowedTab(currentTab, userRole)) {
        setCurrentTab((userRole === 'student' || userRole === 'parent') ? 'portal' : 'dashboard');
      }
    } else {
      if (currentTab !== 'public_website' && currentTab !== 'login') {
        setCurrentTab('public_website');
      }
    }
  }, [currentUser, userRole]);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleDirectInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const renderActiveView = () => {
    if (!isAllowedTab(currentTab, userRole)) {
      return (
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-rose-500/30 text-center space-y-4 max-w-lg mx-auto my-12 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white font-['Outfit']">Access Restricted / A Lut Thei Lo</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            He hmun ({currentTab}) hi i role ({currentUser?.displayName || 'User'} - {userRole.toUpperCase()}) tan en theih a ni lo. I pual bika siam ah let leh rawh le.
          </p>
          <button
            onClick={() => setCurrentTab((isStudent || isParent) ? 'portal' : 'dashboard')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            {(isStudent || isParent) ? 'Portal-ah Let Rawh' : 'Dashboard-ah Let Rawh'}
          </button>
        </div>
      );
    }

    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView 
            setCurrentTab={setCurrentTab} 
            openRoleSwitcher={() => setIsRoleModalOpen(true)} 
          />
        );
      case 'class_admin_live':
        return <ClassAdminLiveView setCurrentTab={setCurrentTab} />;
      case 'academics':
        return (
          <AcademicsView 
            setCurrentTab={setCurrentTab} 
            setSelectedStudentForReport={setSelectedStudentForReport} 
          />
        );
      case 'report_cards':
        return (
          <ReportCardView 
            selectedStudentForReport={selectedStudentForReport} 
          />
        );
      case 'certificates':
        return <CertificatesView />;
      case 'routine':
        return <RoutineView />;
      case 'calendar':
        return <CalendarView />;
      case 'attendance':
        return <AttendanceView setCurrentTab={setCurrentTab} />;
      case 'leave_management':
      case 'leave':
        return <LeaveManagementView />;
      case 'financials':
        return (
          <FinancialsView 
            openExportModal={() => setIsExportModalOpen(true)} 
          />
        );
      case 'students':
        return (
          <StudentsView 
            setCurrentTab={setCurrentTab} 
            setSelectedStudentForReport={setSelectedStudentForReport} 
          />
        );
      case 'portal':
        return (
          <PortalView 
            setCurrentTab={setCurrentTab} 
            setSelectedStudentForReport={setSelectedStudentForReport} 
          />
        );
      case 'library':
        return <LibraryView />;
      case 'staff_payroll':
        return <StaffPayrollView />;
      case 'admissions':
        return <AdmissionsView setCurrentTab={setCurrentTab} />;
      case 'hostel':
        return <HostelView />;
      case 'transport':
      case 'transport_hostel':
        return <TransportHostelView />;
      case 'notices':
        return <NoticesView setCurrentTab={setCurrentTab} />;
      case 'clinic':
        return <ClinicView />;
      case 'visitors':
        return <VisitorsView />;
      case 'inventory':
        return <InventoryView />;
      case 'alumni':
        return <AlumniView />;
      case 'canteen':
        return <CanteenView />;
      case 'group_conference':
        return <GroupConferenceView />;
      case 'live_broadcast':
        return <LiveBroadcastView />;
      case 'staff_chat':
        return <StaffChatView />;
      case 'analytics':
        return <AnalyticsDashboardView />;
      case 'dev_studio':
        return <DevStudioView />;
      default:
        return (
          <DashboardView 
            setCurrentTab={setCurrentTab} 
            openRoleSwitcher={() => setIsRoleModalOpen(true)} 
          />
        );
    }
  };

  // If not logged in, show Login Panel or Public Website
  if (!currentUser) {
    if (currentTab === 'public_website') {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
          <PublicWebsiteView
            onEnterPortal={() => setCurrentTab('login')}
            onOpenAdmissions={() => setIsPublicAdmissionModalOpen(true)}
            onOpenEditor={() => setIsWebsiteEditorOpen(true)}
            onOpenMobileApp={() => setIsMobileAppModalOpen(true)}
          />

          {/* Dedicated Public Online Admission Application Portal */}
          <PublicAdmissionPortalModal
            isOpen={isPublicAdmissionModalOpen}
            onClose={() => setIsPublicAdmissionModalOpen(false)}
            applications={admissions || []}
            admissionConfig={onlineAdmissionConfig}
            schoolClasses={classes}
            onApplicationSubmitted={(newApp) => {
              if (submitOnlineAdmission) {
                submitOnlineAdmission(newApp);
              }
            }}
          />

          <WebsiteEditorModal
            isOpen={isWebsiteEditorOpen}
            onClose={() => setIsWebsiteEditorOpen(false)}
            onViewWebsite={() => setCurrentTab('public_website')}
          />

          <MobileAppDownloadModal
            isOpen={isMobileAppModalOpen}
            onClose={() => setIsMobileAppModalOpen(false)}
            deferredPrompt={deferredPrompt}
            onDirectInstall={handleDirectInstall}
          />
        </div>
      );
    }

    return (
      <LoginView
        onLoginSuccess={(loggedInUser) => {
          const role = loggedInUser?.role || 'principal';
          setCurrentTab((role === 'student' || role === 'parent') ? 'portal' : 'dashboard');
        }}
        onViewWebsite={() => setCurrentTab('public_website')}
      />
    );
  }

  if (currentTab === 'public_website') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <PublicWebsiteView
          onEnterPortal={() => setCurrentTab((isStudent || isParent) ? 'portal' : 'dashboard')}
          onOpenAdmissions={() => setIsPublicAdmissionModalOpen(true)}
          onOpenEditor={() => setIsWebsiteEditorOpen(true)}
          onOpenMobileApp={() => setIsMobileAppModalOpen(true)}
        />

        {/* Dedicated Public Online Admission Application Portal */}
        <PublicAdmissionPortalModal
          isOpen={isPublicAdmissionModalOpen}
          onClose={() => setIsPublicAdmissionModalOpen(false)}
          applications={admissions || []}
          admissionConfig={onlineAdmissionConfig}
          schoolClasses={classes}
          onApplicationSubmitted={(newApp) => {
            if (submitOnlineAdmission) {
              submitOnlineAdmission(newApp);
            }
          }}
        />

        <WebsiteEditorModal
          isOpen={isWebsiteEditorOpen}
          onClose={() => setIsWebsiteEditorOpen(false)}
          onViewWebsite={() => setCurrentTab('public_website')}
        />

        <MobileAppDownloadModal
          isOpen={isMobileAppModalOpen}
          onClose={() => setIsMobileAppModalOpen(false)}
          deferredPrompt={deferredPrompt}
          onDirectInstall={handleDirectInstall}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Institutional Mode Status Indicator */}
        {isSuperAdmin ? (
          <div className="bg-gradient-to-r from-violet-950/70 via-slate-900/90 to-indigo-950/70 border-b border-violet-500/30 px-3.5 sm:px-6 py-1.5 text-xs flex items-center justify-between z-30">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40 text-[10px] font-bold tracking-wider flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                👑 MASTER LIVE
              </span>
              <span className="text-slate-300 text-[11px] truncate hidden sm:inline">
                Authenticated as <strong className="text-white">{currentUser?.displayName || 'Super Admin'}</strong>. Full database write & cloud sync active.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 text-[11px]">
              <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Database Write Active ✓
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-950/50 via-slate-900/90 to-amber-950/50 border-b border-amber-500/30 px-3.5 sm:px-6 py-1.5 text-xs flex items-center justify-between z-30">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold tracking-wider flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                SHOWCASE DEMO
              </span>
              <span className="text-slate-300 text-[11px] truncate hidden md:inline">
                Signed in as <strong className="text-white">{currentUser?.displayName}</strong> ({currentUser?.role}). Read-only protected against accidental data loss.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 text-[11px]">
              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="text-amber-400 hover:text-amber-300 font-semibold underline text-[11px] cursor-pointer"
              >
                Switch Demo Role
              </button>
            </div>
          </div>
        )}

        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          setIsMobileOpen={setIsMobileOpen}
          openRoleSwitcher={() => setIsRoleModalOpen(true)}
          openFirebaseModal={() => setIsFirebaseModalOpen(true)}
          openExportModal={() => setIsExportModalOpen(true)}
          openMobileAppModal={() => setIsMobileAppModalOpen(true)}
          openWebsiteEditor={() => setIsWebsiteEditorOpen(true)}
          onViewWebsite={() => setCurrentTab('public_website')}
        />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 sm:pb-28 lg:pb-8 max-w-7xl w-full mx-auto min-w-0">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Phone & Tablet) */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Interactive Global Modals */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />

      <FirebaseConfigModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <WebsiteEditorModal
        isOpen={isWebsiteEditorOpen}
        onClose={() => setIsWebsiteEditorOpen(false)}
        onViewWebsite={() => setCurrentTab('public_website')}
      />

      <MobileAppDownloadModal
        isOpen={isMobileAppModalOpen}
        onClose={() => setIsMobileAppModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onDirectInstall={handleDirectInstall}
      />

      {/* Global 1-on-1 Private Call Modal */}
      {activePrivateCall && (
        <PrivateCallModal
          isOpen={!!activePrivateCall}
          onClose={endPrivateCall}
          targetUser={activePrivateCall.user}
          initialType={activePrivateCall.type || 'video'}
        />
      )}

      {/* Global Super Admin AI Co-Pilot Widget (Super Admin only - Full Code & Data Read/Write) */}
      {isSuperAdmin && (
        <SuperAdminAiWidget setCurrentTab={setCurrentTab} />
      )}

      {/* School-Level AI Assistant for Principal / Vice Principal / School Admin (Ama School Bik Chauh) */}
      {!isSuperAdmin && (isPrincipal || isVicePrincipal || currentUser?.role === 'admin') && (
        <SchoolAiAssistant setCurrentTab={setCurrentTab} />
      )}

      {/* Floating Showcase Mode Toast Alert */}
      {showcaseNotice && (
        <div className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-50 max-w-sm p-4 rounded-2xl bg-amber-950/95 border border-amber-500/60 shadow-2xl backdrop-blur-xl text-amber-200 flex items-start gap-3 animate-bounce">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="font-bold text-white flex items-center justify-between gap-2">
              <span>Showcase Demo Protection</span>
              <span className="text-[10px] text-amber-400/80 uppercase tracking-wider font-mono">Protected</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {showcaseNotice.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SchoolProvider>
          <Routes>
            <Route path="/" element={<SchoolAppContent />} />
            <Route path="/:center_id/*" element={<SchoolAppContent />} />
          </Routes>
        </SchoolProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
