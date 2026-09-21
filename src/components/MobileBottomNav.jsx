import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  QrCode, 
  CreditCard, 
  GraduationCap, 
  UserCheck, 
  Menu, 
  CalendarDays, 
  Bell, 
  MessageSquare,
  Building2,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';

export default function MobileBottomNav({ currentTab, setCurrentTab, setIsMobileOpen }) {
  const { currentUser, isPrincipal, isVicePrincipal, isSuperAdmin, isTeacher, isWarden, isStudent, isParent } = useAuth();
  const { notices = [], leaveApplications = [], liveSessionRequests = [] } = useSchool();

  const currentUserId = isStudent
    ? currentUser?.studentId
    : isParent
    ? currentUser?.wardStudentId
    : currentUser?.id;

  const unreadNoticesCount = notices.filter(n => {
    if (n.scope === 'private') {
      if (n.targetUserId === currentUserId || n.targetUserId === currentUser?.id) {
        return !(n.readBy || []).includes(currentUserId);
      }
      return false;
    }
    return !(n.readBy || []).includes(currentUserId);
  }).length;

  const pendingLeavesCount = leaveApplications.filter(l => 
    l.status === 'pending_class_master' || l.status === 'pending_principal'
  ).length;

  // Build role-specific quick tabs
  let navButtons = [];

  if (isStudent || isParent) {
    navButtons = [
      { id: 'portal', label: 'Portal', icon: UserCheck },
      { id: 'routine', label: 'Routine', icon: CalendarDays },
      { id: 'notices', label: 'Notices', icon: Bell, badge: unreadNoticesCount },
      { id: 'staff_chat', label: 'Chat', icon: MessageSquare },
    ];
  } else if (isTeacher) {
    navButtons = [
      { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
      { id: 'attendance', label: 'Attendance', icon: QrCode },
      { id: 'academics', label: 'Academics', icon: GraduationCap },
      { id: 'staff_chat', label: 'Chat', icon: MessageSquare },
    ];
  } else if (isWarden) {
    navButtons = [
      { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
      { id: 'hostel', label: 'Hostel', icon: Building2 },
      { id: 'leave_management', label: 'Leaves', icon: FileCheck, badge: pendingLeavesCount },
      { id: 'staff_chat', label: 'Chat', icon: MessageSquare },
    ];
  } else {
    // Principal / Vice Principal / Super Admin / Default
    navButtons = [
      { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
      { id: 'students', label: 'Students', icon: Users },
      { id: 'attendance', label: 'Attendance', icon: QrCode },
      { id: 'financials', label: 'Fees', icon: CreditCard },
    ];
  }

  const totalBadges = unreadNoticesCount + (isPrincipal || isVicePrincipal || isSuperAdmin ? pendingLeavesCount : 0);

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#0c121e]/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-4px_25px_rgba(0,0,0,0.6)] px-2 py-1 flex items-center justify-around safe-area-pb"
    >
      {navButtons.map((btn) => {
        const Icon = btn.icon;
        const isActive = currentTab === btn.id;
        return (
          <button
            key={btn.id}
            onClick={() => setCurrentTab(btn.id)}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-150 relative group ${
              isActive 
                ? 'text-cyan-400 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {/* Active glow pill */}
            {isActive && (
              <span className="absolute top-0 w-8 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            )}

            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110 text-cyan-400' : 'group-hover:scale-105'}`} />
              {btn.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center font-mono shadow">
                  {btn.badge > 99 ? '99+' : btn.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] mt-1 leading-none tracking-tight truncate max-w-[58px] ${isActive ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>
              {btn.label}
            </span>
          </button>
        );
      })}

      {/* Menu / Drawer trigger button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-400 hover:text-cyan-300 transition-all duration-150 relative group"
        title="Open all ERP modules menu"
      >
        <div className="relative">
          <Menu className="w-5 h-5 group-hover:scale-105 transition-transform" />
          {totalBadges > 0 && (
            <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 border border-[#0c121e] animate-pulse" />
          )}
        </div>
        <span className="text-[10px] mt-1 leading-none tracking-tight text-slate-400 group-hover:text-cyan-300">
          Menu
        </span>
      </button>
    </nav>
  );
}
