import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import RoleSwitcherModal from './components/RoleSwitcherModal';
import FirebaseConfigModal from './components/FirebaseConfigModal';
import ExportModal from './components/ExportModal';
import PrivateCallModal from './components/PrivateCallModal';
import MobileAppDownloadModal from './components/MobileAppDownloadModal';

import DashboardView from './views/DashboardView';
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
import WebsiteEditorModal from './components/WebsiteEditorModal';
import { PublicAdmissionPortalModal } from './components/admissions/PublicAdmissionPortalModal';

function SchoolAppContent() {
  const [currentTab, setCurrentTab] = useState('dashboard');
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
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView 
            setCurrentTab={setCurrentTab} 
            openRoleSwitcher={() => setIsRoleModalOpen(true)} 
          />
        );
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

  if (currentTab === 'public_website') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <PublicWebsiteView
          onEnterPortal={() => setCurrentTab('dashboard')}
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

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
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SchoolProvider>
        <SchoolAppContent />
      </SchoolProvider>
    </AuthProvider>
  );
}
