import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Check, 
  Lock, 
  Sparkles, 
  Volume2, 
  VolumeX,
  AlertTriangle, 
  ExternalLink, 
  MessageSquare, 
  Radio, 
  Calendar, 
  Layers, 
  ArrowRight,
  ListTodo,
  CheckCircle2,
  Clock,
  Plus,
  AlertCircle,
  Filter,
  ShieldAlert,
  Flame,
  User,
  Users,
  ChevronRight,
  Eye
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export default function NotificationDrawer({ isOpen, onClose, setCurrentTab }) {
  const { 
    notices = [], 
    tasks = [], 
    updateTaskStatus, 
    createTask,
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = useSchool();

  const { 
    currentUser, 
    isStudent, 
    isParent, 
    isTeacher, 
    isPrincipal, 
    isVicePrincipal, 
    isWarden, 
    isSuperAdmin 
  } = useAuth();

  // Active Sub-Tab: 'tasks' | 'private' | 'broadcast'
  const [activeSubTab, setActiveSubTab] = useState('tasks');
  const [taskFilter, setTaskFilter] = useState('pending'); // 'all' | 'pending' | 'completed'
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'principal' | 'vice_principal' | 'teacher' | 'warden' | 'parent' | 'student'
  
  // Quick Task Assignment Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    assignedToRole: 'teacher',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    priority: 'high',
    category: 'academic',
    actionLinkTab: 'academics'
  });

  // Sound Mute / Active State with persistence
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem('zoxs_sound_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  const [markedReadFeedback, setMarkedReadFeedback] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentUserId = isStudent 
    ? currentUser?.studentId 
    : isParent 
    ? currentUser?.wardStudentId 
    : currentUser?.id;

  const userRole = currentUser?.role || 'student';

  // 1. Filter Tasks for the current user & active role
  const userTasks = tasks.filter(t => {
    // If specific role filter selected by user
    if (roleFilter !== 'all') {
      if (t.assignedToRole !== roleFilter && t.assignedToRole !== 'all') return false;
    } else {
      // Principal & Superadmin have institutional oversight to see all tasks
      if (!isPrincipal && !isSuperAdmin) {
        if (t.assignedToRole === 'all') return true;
        if (t.assignedToRole === userRole) return true;
        if (t.assignedToUserId === currentUser?.id || t.assignedToUserId === currentUserId) return true;
        if (isVicePrincipal && t.assignedToRole === 'vice_principal') return true;
        if (isWarden && t.assignedToRole === 'warden') return true;
        if (isTeacher && t.assignedToRole === 'teacher') return true;
        if (isParent && t.assignedToRole === 'parent') return true;
        if (isStudent && t.assignedToRole === 'student') return true;
        return false;
      }
    }
    return true;
  });

  const pendingTasks = userTasks.filter(t => t.status !== 'completed');
  const completedTasks = userTasks.filter(t => t.status === 'completed');
  const displayedTasks = taskFilter === 'all' 
    ? userTasks 
    : taskFilter === 'pending' 
    ? pendingTasks 
    : completedTasks;

  // 2. Filter Notices for current user
  const userNotices = notices.filter(n => {
    if (roleFilter !== 'all') {
      if (n.recipientRole && n.recipientRole !== roleFilter) return false;
    }

    if (n.scope === 'private') {
      if (n.targetUserId === currentUserId) return true;
      if (n.targetUserId === currentUser?.id) return true;
      if (isParent && n.targetUserId === currentUser?.wardStudentId) return true;
      if (isTeacher && n.recipientRole === 'teacher') return true;
      if (isWarden && n.recipientRole === 'warden') return true;
      if (isVicePrincipal && n.recipientRole === 'vice_principal') return true;
      if (n.senderId === currentUserId || n.senderId === currentUser?.id) return true;
      if (currentUser?.role === 'superadmin' || isPrincipal) return true;
      return false;
    } else {
      if (n.targetAudience === 'all') return true;
      if (isStudent && n.targetAudience === 'students') return true;
      if (isParent && n.targetAudience === 'parents') return true;
      if ((isTeacher || isPrincipal || isVicePrincipal) && n.targetAudience === 'teachers') return true;
      if (isWarden && (n.targetAudience === 'staff' || n.category === 'hostel')) return true;
      return true;
    }
  });

  const privateNotices = userNotices.filter(n => n.scope === 'private');
  const broadcastNotices = userNotices.filter(n => n.scope !== 'private');

  // Counts
  const unreadNoticesCount = userNotices.filter(n => !(n.readBy || []).includes(currentUserId)).length;
  const privateUnreadCount = privateNotices.filter(n => !(n.readBy || []).includes(currentUserId)).length;

  const handlePlayChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      };

      if (ctx.state === 'suspended') {
        ctx.resume().then(playTone).catch(() => {});
      } else {
        playTone();
      }
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    try {
      localStorage.setItem('zoxs_sound_enabled', String(nextState));
    } catch (e) {}
    if (nextState) {
      handlePlayChime();
    }
  };

  const handleMarkAllRead = () => {
    if (markAllNotificationsAsRead) {
      markAllNotificationsAsRead(currentUserId);
    }
    setMarkedReadFeedback(true);
    if (soundEnabled) {
      handlePlayChime();
    }
    setTimeout(() => setMarkedReadFeedback(false), 3000);
  };

  const handleToggleTaskStatus = (t) => {
    const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
    updateTaskStatus(t.id, nextStatus, currentUser?.displayName || 'Active User');
    if (soundEnabled) handlePlayChime();
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    createTask({
      ...newTaskForm,
      assignedBy: `${currentUser?.displayName || 'Office'} (${currentUser?.role || 'Admin'})`,
      notifyAssignee: true
    });
    setShowAssignModal(false);
    setNewTaskForm({
      title: '',
      description: '',
      assignedToRole: 'teacher',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      priority: 'high',
      category: 'academic',
      actionLinkTab: 'academics'
    });
    if (soundEnabled) handlePlayChime();
  };

  const canAssignTasks = isPrincipal || isVicePrincipal || isTeacher || isWarden || isSuperAdmin;

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-lg bg-[#0c121e] border-l border-slate-800/80 shadow-2xl h-full flex flex-col z-10 font-sans">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center gap-3">
            {/* Interactive Bell Icon & Badge - Click to open Notice Board */}
            <button
              type="button"
              onClick={() => {
                if (setCurrentTab) {
                  setCurrentTab('notices');
                  onClose();
                }
              }}
              className="relative p-2.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 shadow-inner transition cursor-pointer group"
              title="Click to open Notice Board & View All Directives"
            >
              <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {(unreadNoticesCount > 0 || pendingTasks.length > 0) && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center font-mono animate-pulse shadow-lg">
                  {unreadNoticesCount + pendingTasks.length}
                </span>
              )}
            </button>
            <div 
              onClick={() => {
                if (setCurrentTab) {
                  setCurrentTab('notices');
                  onClose();
                }
              }}
              className="cursor-pointer group/header"
              title="Click to open full Notice Board & Directives"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white font-['Outfit'] group-hover/header:text-cyan-300 transition flex items-center gap-1.5">
                  <span>Directives &amp; Alerts</span>
                  <ExternalLink className="w-3 h-3 text-cyan-400 opacity-60 group-hover/header:opacity-100 transition" />
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono capitalize border border-slate-700">
                  {currentUser?.role || 'Guest'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 group-hover/header:text-slate-300 transition">
                Role-tailored tasks, direct private notices &amp; broadcasts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mark All Read Button */}
            {unreadNoticesCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark Read</span>
              </button>
            )}

            {/* Sound Toggle (Mute / Active) with Chime Feedback */}
            <button
              type="button"
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                soundEnabled 
                  ? 'bg-slate-800/90 hover:bg-slate-700 text-cyan-400 border-slate-700 shadow-sm' 
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-500 border-slate-800'
              }`}
              title={soundEnabled ? 'Notification chime active (Click to mute)' : 'Notification chime muted (Click to unmute)'}
              aria-label={soundEnabled ? 'Mute notification sound' : 'Unmute notification sound'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="Close Drawer"
              aria-label="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback Toast Banner when marked read */}
        {markedReadFeedback && (
          <div className="px-4 py-2 bg-emerald-950/90 border-b border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>All notifications marked as read!</span>
            </span>
            <button 
              type="button" 
              onClick={() => setMarkedReadFeedback(false)} 
              className="text-emerald-400 hover:text-white text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Role Quick Filter Chips */}
        <div className="px-4 py-2 border-b border-slate-800/60 bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
          <span className="text-slate-500 font-semibold flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" />
            <span>Role:</span>
          </span>
          {[
            { id: 'all', label: 'All Roles' },
            { id: 'principal', label: 'Admin / Principal' },
            { id: 'vice_principal', label: 'Vice Principal' },
            { id: 'teacher', label: 'Teacher' },
            { id: 'warden', label: 'Warden' },
            { id: 'parent', label: 'Parent' },
            { id: 'student', label: 'Student' }
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setRoleFilter(r.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 whitespace-nowrap ${
                roleFilter === r.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Sub-Tab Switcher & Quick Actions */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-950 flex items-center justify-between gap-2 text-xs">
          <div className="inline-flex p-1 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveSubTab('tasks')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'tasks' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Action Tasks</span>
              {pendingTasks.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeSubTab === 'tasks' ? 'bg-black/25 text-slate-950' : 'bg-rose-500 text-white'
                }`}>
                  {pendingTasks.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSubTab('private')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'private' 
                  ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-md shadow-rose-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Direct Alerts</span>
              {privateUnreadCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-white font-mono font-bold">
                  {privateUnreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSubTab('broadcast')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'broadcast' 
                  ? 'bg-cyan-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Broadcasts</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {canAssignTasks && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold transition flex items-center gap-1 text-[11px]"
                title="Assign Directive to Staff or Students"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Assign Task</span>
              </button>
            )}
            {activeSubTab !== 'tasks' && unreadNoticesCount > 0 && (
              <button
                onClick={() => markAllNotificationsAsRead(currentUserId)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* TAB 1: ACTIONABLE TASKS */}
          {activeSubTab === 'tasks' && (
            <div className="space-y-3">
              {/* Task Status Filters */}
              <div className="flex items-center justify-between text-xs pb-1">
                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'pending', label: 'Pending', count: pendingTasks.length },
                    { id: 'completed', label: 'Done', count: completedTasks.length },
                    { id: 'all', label: 'All', count: userTasks.length }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setTaskFilter(f.id)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition text-[11px] ${
                        taskFilter === f.id
                          ? 'bg-slate-800 text-white border border-slate-700 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {f.label} ({f.count})
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-500">Click checkbox to complete</span>
              </div>

              {displayedTasks.length > 0 ? (
                displayedTasks.map((t) => {
                  const isDone = t.status === 'completed';
                  const isOverdue = !isDone && new Date(t.dueDate) < new Date(new Date().setHours(0,0,0,0));

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTask(t)}
                      className={`p-4 rounded-2xl border transition relative group flex flex-col gap-2.5 cursor-pointer hover:border-cyan-500/50 hover:shadow-lg ${
                        isDone 
                          ? 'bg-slate-950/50 border-slate-800/60 opacity-75' 
                          : t.priority === 'urgent'
                          ? 'bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border-rose-500/40 shadow-lg shadow-rose-950/20'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Custom Completion Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleTaskStatus(t);
                          }}
                          className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition shrink-0 cursor-pointer ${
                            isDone 
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30' 
                              : 'border-2 border-slate-700 hover:border-cyan-400 bg-slate-950'
                          }`}
                          title={isDone ? 'Mark as Pending' : 'Mark as Completed'}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        {/* Task Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase font-mono ${
                              t.priority === 'urgent'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : t.priority === 'high'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}>
                              {t.priority}
                            </span>

                            <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase font-semibold">
                              To: {t.assignedToRole}
                            </span>

                            {isOverdue && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold flex items-center gap-0.5">
                                <AlertCircle className="w-2.5 h-2.5" /> Overdue
                              </span>
                            )}

                            <span className="text-[10px] text-slate-400 font-mono ml-auto flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span>{t.dueDate}</span>
                            </span>
                          </div>

                          <h4 className={`text-xs font-bold text-white leading-snug group-hover:text-cyan-300 transition ${isDone ? 'line-through text-slate-400' : ''}`}>
                            {t.title}
                          </h4>

                          <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                            {t.description}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Directive Footer & Action Button */}
                      <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="truncate max-w-[170px]">
                          Directive by: <strong className="text-slate-300">{t.assignedBy}</strong>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTask(t);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold transition flex items-center gap-1 text-[11px] cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Details</span>
                          </button>

                          {t.actionLinkTab && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (setCurrentTab) setCurrentTab(t.actionLinkTab);
                                onClose();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              <span>{t.actionLabel || 'Go to Action'}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/50" />
                  <h4 className="text-xs font-bold text-slate-300">All Directives Complete!</h4>
                  <p className="text-[11px]">No pending tasks found for the current role selection.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DIRECT PRIVATE ALERTS */}
          {activeSubTab === 'private' && (
            <div className="space-y-3">
              {privateNotices.length > 0 ? (
                privateNotices.map((n) => {
                  const isRead = (n.readBy || []).includes(currentUserId);

                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id, currentUserId);
                        setSelectedNotice(n);
                      }}
                      className={`p-4 rounded-2xl border transition relative cursor-pointer group hover:border-cyan-500/50 hover:shadow-lg ${
                        !isRead 
                          ? 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-rose-500/40 shadow-md' 
                          : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      {!isRead && (
                        <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      )}

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>{n.recipientRole ? `${n.recipientRole.toUpperCase()} ALERT` : 'DIRECT ALERT'}</span>
                          </span>

                          {n.priority === 'urgent' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                              URGENT
                            </span>
                          )}

                          <span className="text-[10px] text-slate-500 font-mono ml-auto">
                            {new Date(n.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                          {n.title}
                        </h4>

                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {n.content}
                        </p>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                          <span>From: <strong className="text-slate-200">{n.publishedBy}</strong></span>
                          <span className="text-cyan-400 font-bold flex items-center gap-1 group-hover:underline">
                            <Eye className="w-3 h-3" />
                            <span>View Details</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <Lock className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs">No private direct alerts matching this filter.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CAMPUS BROADCASTS */}
          {activeSubTab === 'broadcast' && (
            <div className="space-y-3">
              {broadcastNotices.length > 0 ? (
                broadcastNotices.map((n) => {
                  const isRead = (n.readBy || []).includes(currentUserId);

                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id, currentUserId);
                        setSelectedNotice(n);
                      }}
                      className={`p-4 rounded-2xl border transition relative cursor-pointer group hover:border-cyan-500/50 hover:shadow-lg ${
                        !isRead 
                          ? 'bg-slate-900 border-cyan-500/40 shadow-md' 
                          : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      {!isRead && (
                        <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      )}

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase font-mono">
                            {n.category}
                          </span>

                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            Target: {n.targetAudience}
                          </span>

                          <span className="text-[10px] text-slate-500 font-mono ml-auto">
                            {new Date(n.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                          {n.title}
                        </h4>

                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {n.content}
                        </p>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                          <span>By: {n.publishedBy}</span>
                          <span className="text-cyan-400 font-bold flex items-center gap-1 group-hover:underline">
                            <Eye className="w-3 h-3" />
                            <span>View Details</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <Radio className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs">No broadcast notices found.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (setCurrentTab) setCurrentTab('notices');
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 text-xs font-bold transition flex items-center justify-center gap-2 shadow"
          >
            <span>Notice Board &amp; Task Directives</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* QUICK ASSIGN TASK MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 text-white text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="font-bold text-white text-sm font-['Outfit'] flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-cyan-400" />
                <span>Assign Institutional Task Directive</span>
              </h4>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scrutinize MBSE Practical Records"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Specific requirements or guidelines..."
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Assign To Role *</label>
                  <select
                    value={newTaskForm.assignedToRole}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, assignedToRole: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="principal">Admin / Principal</option>
                    <option value="vice_principal">Vice Principal</option>
                    <option value="teacher">Teaching Faculty</option>
                    <option value="warden">Hostel Warden</option>
                    <option value="parent">Parents / Guardians</option>
                    <option value="student">Students</option>
                    <option value="all">All Campus Roles</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Priority</label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={newTaskForm.dueDate}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Direct Link View</label>
                  <select
                    value={newTaskForm.actionLinkTab}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, actionLinkTab: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="academics">Academics / Exams</option>
                    <option value="admissions">Admissions</option>
                    <option value="hostel">Hostel &amp; Boarding</option>
                    <option value="students">Students &amp; Leaves</option>
                    <option value="fees">Fees Ledger</option>
                    <option value="attendance">Attendance</option>
                    <option value="portal">Student/Parent Portal</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition shadow"
                >
                  Dispatch Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: NOTICE & DIRECT ALERT DETAIL VIEW */}
      {selectedNotice && (
        <div 
          className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedNotice(null)}
        >
          <div 
            className="relative w-full max-w-lg bg-[#0c1322] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl shrink-0 ${
                  selectedNotice.scope === 'private' 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}>
                  {selectedNotice.scope === 'private' ? <Lock className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase font-mono ${
                      selectedNotice.priority === 'urgent'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : selectedNotice.priority === 'high'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {selectedNotice.priority || 'Normal'} Priority
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase font-mono font-semibold">
                      {selectedNotice.category || 'General'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 uppercase font-mono">
                      {selectedNotice.scope === 'private' ? 'Confidential Private' : 'Campus Broadcast'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1.5 leading-snug font-['Outfit']">
                    {selectedNotice.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition shrink-0 cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Strip */}
            <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Published By</span>
                <span className="font-semibold text-slate-200 truncate block">{selectedNotice.publishedBy || 'School Office'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Audience / Recipient</span>
                <span className="font-semibold text-slate-200 truncate block">
                  {selectedNotice.targetUserName || selectedNotice.targetAudience || selectedNotice.recipientRole || 'All School'}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Date & Time</span>
                <span className="font-mono text-slate-300 block">
                  {new Date(selectedNotice.publishedAt || Date.now()).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })} {new Date(selectedNotice.publishedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Notice Message:</span>
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans shadow-inner">
                  {selectedNotice.content}
                </div>
              </div>

              {/* Delivery Channels Tags */}
              {selectedNotice.channels && (
                <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400 pt-1">
                  <span className="font-bold text-slate-500 text-[10px] uppercase">Delivery Channels:</span>
                  {Object.entries(selectedNotice.channels).filter(([_, v]) => v).map(([channel]) => (
                    <span key={channel} className="px-2 py-0.5 rounded-md bg-slate-800/90 text-cyan-300 border border-slate-700 uppercase font-mono text-[10px]">
                      ✓ {channel}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (setCurrentTab) setCurrentTab('notices');
                  setSelectedNotice(null);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Notice Board</span>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TASK DIRECTIVE DETAIL VIEW */}
      {selectedTask && (
        <div 
          className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedTask(null)}
        >
          <div 
            className="relative w-full max-w-lg bg-[#0c1322] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl shrink-0 ${
                  selectedTask.priority === 'urgent'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}>
                  <ListTodo className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase font-mono ${
                      selectedTask.priority === 'urgent'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : selectedTask.priority === 'high'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      {selectedTask.priority} Priority
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase font-mono font-semibold">
                      {selectedTask.category || 'General'}
                    </span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase ${
                      selectedTask.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      Status: {selectedTask.status}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1.5 leading-snug font-['Outfit']">
                    {selectedTask.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition shrink-0 cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Strip */}
            <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Directive By</span>
                <span className="font-semibold text-slate-200 truncate block">{selectedTask.assignedBy || 'Administration'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Assigned To Role</span>
                <span className="font-semibold text-cyan-300 truncate block uppercase">{selectedTask.assignedToRole}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Due Date</span>
                <span className="font-mono text-amber-300 font-bold block">{selectedTask.dueDate}</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Instructions &amp; Objective:</h5>
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans shadow-inner">
                  {selectedTask.description}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
              {/* Status Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  handleToggleTaskStatus(selectedTask);
                  setSelectedTask(prev => prev ? ({ ...prev, status: prev.status === 'completed' ? 'pending' : 'completed' }) : null);
                }}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                  selectedTask.status === 'completed'
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{selectedTask.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedTask.actionLinkTab && (
                  <button
                    type="button"
                    onClick={() => {
                      if (setCurrentTab) setCurrentTab(selectedTask.actionLinkTab);
                      setSelectedTask(null);
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
                  >
                    <span>{selectedTask.actionLabel || 'Go to Action Module'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
