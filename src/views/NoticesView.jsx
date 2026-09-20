import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Pin, 
  Calendar, 
  UserCheck, 
  Sparkles, 
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Megaphone,
  Radio,
  Send,
  ShieldAlert,
  User,
  Users,
  Smartphone,
  Volume2,
  Trash2,
  CheckCheck,
  Globe,
  Sliders,
  AlertTriangle,
  Info,
  ExternalLink,
  MessageSquare,
  ListTodo,
  Check,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckSquare,
  Video
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import PluginConfigModal from '../components/PluginConfigModal';

export default function NoticesView({ setCurrentTab }) {
  const { 
    notices = [], 
    tasks = [],
    createTask,
    updateTaskStatus,
    deleteTask,
    publishNotice, 
    sendPrivateNotification,
    markNotificationAsRead,
    deleteNotice,
    students = [],
    staff = [],
    plugins = [],
    togglePlugin,
    updatePlugin,
    deletePlugin,
    resetPluginConfig
  } = useSchool();
  const { 
    currentUser, 
    isPrincipal, 
    isVicePrincipal, 
    isTeacher, 
    isWarden, 
    isParent, 
    isStudent, 
    isSuperAdmin 
  } = useAuth();

  // Active view tab: 'broadcasts' | 'private' | 'tasks' | 'compose' | 'plugins'
  const [activeTab, setActiveTab] = useState('tasks');

  // Broadcast filtering
  const [filterAudience, setFilterAudience] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Private filtering
  const [pvtPriorityFilter, setPvtPriorityFilter] = useState('all');
  const [pvtSearchQuery, setPvtSearchQuery] = useState('');
  const [selectedPluginForConfig, setSelectedPluginForConfig] = useState(null);

  // Tasks filtering & form state
  const [taskRoleFilter, setTaskRoleFilter] = useState('all');
  const [taskStatusFilter, setTaskStatusFilter] = useState('all');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('all');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    assignedToRole: 'teacher',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    priority: 'high',
    category: 'academic',
    actionLinkTab: 'academics'
  });

  // Composer Form State
  const [composeMode, setComposeMode] = useState('broadcast'); // 'broadcast' | 'private'
  const [composeData, setComposeData] = useState({
    title: '',
    content: '',
    category: 'general',
    targetAudience: 'all',
    isPinned: false,
    priority: 'normal',
    // Private specific
    recipientType: 'student', // 'student' | 'staff'
    targetUserId: '',
    targetUserName: '',
    recipientRole: 'student',
    // Channels
    channels: {
      inApp: true,
      whatsapp: true,
      push: true,
      sms: false,
      campusBell: false
    }
  });

  const [notificationStatusMsg, setNotificationStatusMsg] = useState(null);

  // Audio Chime trigger
  const handlePlayChime = () => {
    try {
      if (window.campusBellEngine && typeof window.campusBellEngine.playChime === 'function') {
        window.campusBellEngine.playChime();
        return;
      }
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.35); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.55);
      }
    } catch (err) {
      console.warn('Audio chime error:', err);
    }
  };

  // Broadcasts list
  const broadcastList = notices.filter(n => n.scope !== 'private');
  const filteredBroadcasts = broadcastList.filter(n => {
    const matchesAudience = filterAudience === 'all' || n.targetAudience === 'all' || n.targetAudience === filterAudience;
    const matchesCategory = filterCategory === 'all' || n.category === filterCategory;
    const matchesSearch = !searchQuery || 
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAudience && matchesCategory && matchesSearch;
  });

  // Private notices list
  const currentUserId = currentUser?.studentId || currentUser?.id;
  const isManagement = isPrincipal || isSuperAdmin;
  
  const privateList = notices.filter(n => {
    if (n.scope !== 'private') return false;
    // Admins see all for monitoring & auditing
    if (isManagement) return true;
    // Student
    if (currentUser?.studentId && n.targetUserId === currentUser.studentId) return true;
    // Parent
    if (currentUser?.wardStudentId && n.targetUserId === currentUser.wardStudentId) return true;
    // Staff/Teacher
    if (n.targetUserId === currentUser?.id || (isTeacher && n.recipientRole === 'teacher')) return true;
    return false;
  });

  const filteredPrivate = privateList.filter(n => {
    const matchesPriority = pvtPriorityFilter === 'all' || n.priority === pvtPriorityFilter;
    const matchesSearch = !pvtSearchQuery ||
      n.title?.toLowerCase().includes(pvtSearchQuery.toLowerCase()) ||
      n.content?.toLowerCase().includes(pvtSearchQuery.toLowerCase()) ||
      n.targetUserName?.toLowerCase().includes(pvtSearchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  // Handle composer submission
  const handleDispatch = (e) => {
    e.preventDefault();
    if (!composeData.title.trim() || !composeData.content.trim()) {
      alert('Khawngaihin a thupui (title) leh a thu (content) ziak rawh le.');
      return;
    }

    if (composeMode === 'private' && !composeData.targetUserId) {
      alert('Khawngaihin mimal hnen a thawn tur (recipient) thlang rawh le.');
      return;
    }

    if (composeMode === 'private') {
      sendPrivateNotification({
        title: composeData.title,
        content: composeData.content,
        category: composeData.category,
        priority: composeData.priority,
        targetUserId: composeData.targetUserId,
        targetUserName: composeData.targetUserName,
        recipientRole: composeData.recipientRole,
        senderId: currentUser?.id,
        publishedBy: currentUser?.displayName || 'School Administration',
        channels: composeData.channels
      });
      setNotificationStatusMsg(`Private Notification thawn fel a ni e: ${composeData.targetUserName}!`);
    } else {
      publishNotice({
        title: composeData.title,
        content: composeData.content,
        category: composeData.category,
        targetAudience: composeData.targetAudience,
        isPinned: composeData.isPinned,
        priority: composeData.priority,
        publishedBy: currentUser?.displayName || 'School Administration',
        channels: composeData.channels
      });
      setNotificationStatusMsg(`Institutional Broadcast tlangzarh a ni e!`);
    }

    if (composeData.channels.campusBell || composeData.priority === 'urgent') {
      handlePlayChime();
    }

    // Reset form
    setComposeData({
      title: '',
      content: '',
      category: 'general',
      targetAudience: 'all',
      isPinned: false,
      priority: 'normal',
      recipientType: 'student',
      targetUserId: '',
      targetUserName: '',
      recipientRole: 'student',
      channels: {
        inApp: true,
        whatsapp: true,
        push: true,
        sms: false,
        campusBell: false
      }
    });

    setTimeout(() => {
      setNotificationStatusMsg(null);
      setActiveTab(composeMode === 'private' ? 'private' : 'broadcasts');
    }, 1400);
  };

  // Recipient selection helper for private mode
  const handleSelectRecipient = (userId) => {
    if (composeData.recipientType === 'student') {
      const st = students.find(s => s.id === userId);
      if (st) {
        setComposeData(prev => ({
          ...prev,
          targetUserId: st.id,
          targetUserName: `${st.name} (Roll ${st.rollNumber} - Class ${st.class})`,
          recipientRole: 'student'
        }));
      }
    } else {
      const sf = staff.find(s => s.id === userId);
      if (sf) {
        setComposeData(prev => ({
          ...prev,
          targetUserId: sf.id,
          targetUserName: `${sf.name} (${sf.designation || sf.role})`,
          recipientRole: sf.role || 'teacher'
        }));
      }
    }
  };

  const unreadPrivateCount = privateList.filter(n => !(n.readBy || []).includes(currentUserId)).length;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-[#0e1628] to-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-cyan-500/10 via-indigo-500/5 to-transparent pointer-events-none"></div>
        
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] tracking-tight">
              Broadcast &amp; Notification Center
            </h2>
            <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              Multi-Channel Engine
            </span>
            <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <Lock className="w-3 h-3 text-purple-400" />
              Pvt Confidential Alert
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Broadcast institutional circulars to all students, parents, and teachers, or dispatch 1-to-1 private alerts with WhatsApp, Web Push, and audio chimes.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2.5 relative z-10">
          <button
            onClick={handlePlayChime}
            title="Test Campus Audio Bell"
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition active:scale-95"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Audio Chime</span>
          </button>
          
          {(isPrincipal || isTeacher || isSuperAdmin) && (
            <button
              onClick={() => {
                setComposeMode('broadcast');
                setActiveTab('compose');
              }}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Compose / Dispatch</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('broadcasts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'broadcasts'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>School Broadcasts ({broadcastList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('private')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap relative ${
            activeTab === 'private'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Private Alerts</span>
          {unreadPrivateCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
              {unreadPrivateCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap relative ${
            activeTab === 'tasks'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5" />
          <span>Tasks &amp; Directives ({tasks.length})</span>
          {tasks.filter(t => t.status !== 'completed').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
              {tasks.filter(t => t.status !== 'completed').length}
            </span>
          )}
        </button>

        {(isPrincipal || isTeacher || isSuperAdmin) && (
          <button
            onClick={() => setActiveTab('compose')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'compose'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatcher Studio</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('plugins')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'plugins'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Notification Plugins</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950/60 text-slate-300 font-mono">
            {plugins.filter(p => p.category?.toLowerCase().includes('comm') || p.category?.toLowerCase().includes('audio') || p.id?.includes('push') || p.id?.includes('whatsapp') || p.id?.includes('bell') || p.id?.includes('telegram')).length} Active
          </span>
        </button>
      </div>

      {/* Status toast if message dispatched */}
      {notificationStatusMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{notificationStatusMsg}</span>
        </div>
      )}

      {/* TAB 0: INSTITUTIONAL TASKS & DIRECTIVES */}
      {activeTab === 'tasks' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                <ListTodo className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Directives</span>
                <span className="text-xl font-black text-white font-mono">{tasks.length}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pending Action</span>
                <span className="text-xl font-black text-amber-300 font-mono">
                  {tasks.filter(t => t.status !== 'completed').length}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Completed</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {tasks.filter(t => t.status === 'completed').length}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Urgent Action</span>
                <span className="text-xl font-black text-rose-400 font-mono">
                  {tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length}
                </span>
              </div>
            </div>
          </div>

          {/* Filters & Actions Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            {/* Top row: Role filter chips */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
                <span className="text-slate-500 text-[11px] font-semibold flex items-center gap-1 shrink-0">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Target Role:</span>
                </span>
                {[
                  { id: 'all', label: 'All Roles' },
                  { id: 'principal', label: 'Principal' },
                  { id: 'vice_principal', label: 'Vice Principal' },
                  { id: 'teacher', label: 'Teacher' },
                  { id: 'warden', label: 'Warden' },
                  { id: 'parent', label: 'Parent' },
                  { id: 'student', label: 'Student' }
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setTaskRoleFilter(r.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
                      taskRoleFilter === r.id
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {(isPrincipal || isVicePrincipal || isTeacher || isWarden || isSuperAdmin) && (
                <button
                  onClick={() => setShowCreateTaskModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Directive</span>
                </button>
              )}
            </div>

            {/* Bottom row: Search & Status / Priority filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search directive title or description..."
                  value={taskSearchQuery}
                  onChange={(e) => setTaskSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={taskStatusFilter}
                  onChange={(e) => setTaskStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={taskPriorityFilter}
                  onChange={(e) => setTaskPriorityFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tasks Cards Grid */}
          {(() => {
            const filtered = tasks.filter(t => {
              if (taskRoleFilter !== 'all' && t.assignedToRole !== taskRoleFilter && t.assignedToRole !== 'all') return false;
              if (taskStatusFilter === 'pending' && t.status === 'completed') return false;
              if (taskStatusFilter === 'completed' && t.status !== 'completed') return false;
              if (taskPriorityFilter !== 'all' && t.priority !== taskPriorityFilter) return false;
              if (taskSearchQuery) {
                const q = taskSearchQuery.toLowerCase();
                const match = t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
                if (!match) return false;
              }
              return true;
            });

            if (filtered.length === 0) {
              return (
                <div className="py-16 text-center text-slate-500 space-y-3 bg-slate-900/40 rounded-3xl border border-slate-800">
                  <ListTodo className="w-12 h-12 mx-auto text-slate-600" />
                  <h4 className="text-sm font-bold text-slate-300">No Directives Found</h4>
                  <p className="text-xs text-slate-400">Try adjusting your filters or search query.</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map(t => {
                  const isDone = t.status === 'completed';
                  const isOverdue = !isDone && new Date(t.dueDate) < new Date(new Date().setHours(0,0,0,0));

                  return (
                    <div
                      key={t.id}
                      className={`p-5 rounded-3xl border transition flex flex-col justify-between gap-4 group ${
                        isDone 
                          ? 'bg-slate-950/60 border-slate-800/80 opacity-75' 
                          : t.priority === 'urgent'
                          ? 'bg-gradient-to-br from-slate-900 via-rose-950/20 to-slate-900 border-rose-500/40 shadow-lg'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase font-mono ${
                              t.priority === 'urgent'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : t.priority === 'high'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}>
                              {t.priority}
                            </span>

                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 uppercase font-semibold">
                              Target: {t.assignedToRole}
                            </span>

                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 capitalize">
                              {t.category}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const nextStatus = isDone ? 'pending' : 'completed';
                              updateTaskStatus(t.id, nextStatus, currentUser?.displayName || 'Active User');
                              handlePlayChime();
                            }}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition shrink-0 ${
                              isDone 
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30' 
                                : 'border-2 border-slate-700 hover:border-cyan-400 bg-slate-950 text-transparent hover:text-cyan-400'
                            }`}
                            title={isDone ? 'Mark as Pending' : 'Mark as Completed'}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>

                        <h3 className={`font-bold text-sm text-white font-['Outfit'] leading-snug ${isDone ? 'line-through text-slate-400' : ''}`}>
                          {t.title}
                        </h3>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {t.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex items-center gap-1 font-mono text-slate-300 shrink-0">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>Due: {t.dueDate}</span>
                            {isOverdue && (
                              <span className="text-rose-400 font-bold ml-1 flex items-center gap-0.5 text-[10px]">
                                <AlertCircle className="w-3 h-3" /> Overdue
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {t.actionLinkTab && (
                            <button
                              onClick={() => {
                                if (setCurrentTab) setCurrentTab(t.actionLinkTab);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 text-xs font-bold transition flex items-center gap-1 shadow"
                            >
                              <span>{t.actionLabel || 'Go to Action'}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {(isPrincipal || isSuperAdmin) && (
                            <button
                              onClick={() => deleteTask(t.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                              title="Delete Task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Create Directive Modal */}
          {showCreateTaskModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
              <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 text-white text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-white text-sm font-['Outfit'] flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-cyan-400" />
                    <span>Create New Institutional Task Directive</span>
                  </h4>
                  <button 
                    onClick={() => setShowCreateTaskModal(false)}
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    createTask({
                      ...newTaskForm,
                      assignedBy: `${currentUser?.displayName || 'Office'} (${currentUser?.role || 'Admin'})`,
                      notifyAssignee: true
                    });
                    setShowCreateTaskModal(false);
                    setNewTaskForm({
                      title: '',
                      description: '',
                      assignedToRole: 'teacher',
                      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                      priority: 'high',
                      category: 'academic',
                      actionLinkTab: 'academics'
                    });
                    handlePlayChime();
                  }} 
                  className="space-y-3.5"
                >
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Task Directive Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Scrutinize MBSE Practical Records"
                      value={newTaskForm.title}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Description / Instructions</label>
                    <textarea
                      rows={3}
                      placeholder="Detailed directives, instructions, or meeting agenda..."
                      value={newTaskForm.description}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Assign To Role *</label>
                      <select
                        value={newTaskForm.assignedToRole}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, assignedToRole: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-xs"
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
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-xs"
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
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Direct Link View</label>
                      <select
                        value={newTaskForm.actionLinkTab}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, actionLinkTab: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-xs"
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

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowCreateTaskModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition shadow shadow-cyan-500/20"
                    >
                      Dispatch Directive
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: SCHOOL BROADCASTS */}
      {activeTab === 'broadcasts' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Filters & Search */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {['all', 'general', 'exam', 'holiday', 'sports'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                    filterCategory === cat ? 'bg-cyan-500 text-slate-950 shadow' : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Audience:</span>
                <select
                  value={filterAudience}
                  onChange={(e) => setFilterAudience(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="all">Everyone (All)</option>
                  <option value="students">Students</option>
                  <option value="parents">Parents</option>
                  <option value="teachers">Teachers</option>
                </select>
              </div>

              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search circulars..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Broadcasts Stream */}
          <div className="space-y-4">
            {filteredBroadcasts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-500">
                <Megaphone className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-medium">No broadcast notices found matching filter.</p>
              </div>
            ) : (
              filteredBroadcasts.map((n) => (
                <div
                  key={n.id}
                  className={`p-6 rounded-2xl border transition-all space-y-3.5 shadow-lg relative ${
                    n.isPinned
                      ? 'bg-gradient-to-r from-slate-900 via-[#10192e] to-slate-900 border-amber-500/40 ring-1 ring-amber-500/20'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {n.isPinned && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                          <Pin className="w-3 h-3" />
                          Pinned
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 uppercase tracking-wider border border-slate-700">
                        {n.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        Target: <strong className="text-slate-200 capitalize">{n.targetAudience}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(n.publishedAt).toLocaleDateString()}</span>
                      </div>
                      {(isPrincipal || isSuperAdmin) && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove circular: "${n.title}"?`)) {
                              deleteNotice(n.id);
                            }
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                    {n.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {n.content}
                  </p>

                  {/* Channel dispatch metadata footer */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                    <div className="flex items-center gap-3">
                      <span>Published By: <strong className="text-slate-300">{n.publishedBy}</strong></span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          In-App Portal
                        </span>
                        {n.channels?.whatsapp && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                            <Smartphone className="w-2.5 h-2.5" /> WhatsApp Synced
                          </span>
                        )}
                        {n.channels?.push && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-400 border border-indigo-800/60 flex items-center gap-1">
                            <Bell className="w-2.5 h-2.5" /> Web Push
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-cyan-400 font-mono text-[10px]">Official School Circular</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRIVATE ALERTS */}
      {activeTab === 'private' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Info card */}
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 flex items-start gap-3 text-xs text-purple-200">
            <Lock className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-white flex items-center gap-2">
                <span>Direct Confidential Notification Channel (Pvt Notification)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Role-Restricted
                </span>
              </div>
              <p className="text-purple-300/80 leading-relaxed">
                Private notifications are strictly visible only to the specific student, parent, or designated staff member (e.g. fee reminder, academic intervention, boarding gate pass decision). School management maintains oversight for verification.
              </p>
            </div>
          </div>

          {/* Filters & Actions */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Priority:</span>
              {['all', 'urgent', 'confidential', 'normal'].map((prio) => (
                <button
                  key={prio}
                  onClick={() => setPvtPriorityFilter(prio)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                    pvtPriorityFilter === prio
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {prio}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={pvtSearchQuery}
                  onChange={(e) => setPvtSearchQuery(e.target.value)}
                  placeholder="Search private alerts, recipients..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                />
              </div>

              {(isPrincipal || isTeacher || isSuperAdmin) && (
                <button
                  onClick={() => {
                    setComposeMode('private');
                    setActiveTab('compose');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md shadow-purple-600/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Send Pvt Alert</span>
                </button>
              )}
            </div>
          </div>

          {/* Private Alerts List */}
          <div className="space-y-3">
            {filteredPrivate.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-500">
                <Lock className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-medium">No private notifications for this criteria.</p>
              </div>
            ) : (
              filteredPrivate.map((n) => {
                const isUnread = !(n.readBy || []).includes(currentUserId);
                return (
                  <div
                    key={n.id}
                    className={`p-5 rounded-2xl border transition-all space-y-3 ${
                      n.priority === 'urgent'
                        ? 'bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border-rose-500/40 ring-1 ring-rose-500/20'
                        : n.priority === 'confidential'
                        ? 'bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 border-purple-500/40 ring-1 ring-purple-500/20'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Priority Badge */}
                        {n.priority === 'urgent' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider">
                            <ShieldAlert className="w-3 h-3 text-rose-400 animate-pulse" />
                            Urgent Notice
                          </span>
                        )}
                        {n.priority === 'confidential' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider">
                            <Lock className="w-3 h-3 text-purple-400" />
                            Confidential
                          </span>
                        )}
                        {n.priority === 'normal' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
                            Direct Alert
                          </span>
                        )}

                        <span className="text-xs text-purple-300 font-semibold flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          To: <strong className="text-white">{n.targetUserName || n.targetUserId || 'Recipient'}</strong>
                        </span>

                        {isUnread && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                            Unread
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">
                          {new Date(n.publishedAt).toLocaleString()}
                        </span>
                        
                        {isUnread && (
                          <button
                            onClick={() => markNotificationAsRead(n.id, currentUserId)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center gap-1 transition"
                          >
                            <CheckCheck className="w-3 h-3 text-emerald-400" />
                            <span>Mark Read</span>
                          </button>
                        )}

                        {(isPrincipal || isSuperAdmin) && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete private notice to ${n.targetUserName}?`)) {
                                deleteNotice(n.id);
                              }
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition"
                            title="Delete Private Notice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-white font-['Outfit']">
                      {n.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {n.content}
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                      <span>Sender: <strong className="text-slate-400">{n.publishedBy}</strong></span>
                      <div className="flex items-center gap-2 text-[10px]">
                        {n.channels?.whatsapp && (
                          <span className="text-emerald-400">WhatsApp Alert Active</span>
                        )}
                        {n.channels?.push && (
                          <span className="text-indigo-400">Push Delivered</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DISPATCHER STUDIO (COMPOSE) */}
      {activeTab === 'compose' && (isPrincipal || isTeacher || isSuperAdmin) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Main Form */}
          <div className="lg:col-span-2 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-6 shadow-xl">
            {/* Mode Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                1. Select Dispatch Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setComposeMode('broadcast');
                    setComposeData(prev => ({ ...prev, targetAudience: 'all' }));
                  }}
                  className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                    composeMode === 'broadcast'
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Megaphone className={`w-5 h-5 shrink-0 mt-0.5 ${composeMode === 'broadcast' ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="font-bold text-white text-sm">Institutional Broadcast</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Public notice circular for students, parents, staff, or everyone.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setComposeMode('private');
                    setComposeData(prev => ({ ...prev, targetAudience: 'individual' }));
                  }}
                  className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                    composeMode === 'private'
                      ? 'bg-purple-600/10 border-purple-500 text-purple-300 shadow-lg shadow-purple-600/10 ring-1 ring-purple-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Lock className={`w-5 h-5 shrink-0 mt-0.5 ${composeMode === 'private' ? 'text-purple-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="font-bold text-white text-sm">Private Confidential Alert</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Direct 1-to-1 alert sent strictly to a designated student or staff.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleDispatch} className="space-y-5 text-xs">
              {/* Audience / Recipient Target */}
              {composeMode === 'broadcast' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">Target Audience</label>
                    <select
                      value={composeData.targetAudience}
                      onChange={(e) => setComposeData({ ...composeData, targetAudience: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="all">Everyone (School-Wide)</option>
                      <option value="students">Students Only</option>
                      <option value="parents">Parents Only</option>
                      <option value="teachers">Teachers &amp; Staff</option>
                      <option value="hostel">Hostel Residents</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">Category</label>
                    <select
                      value={composeData.category}
                      onChange={(e) => setComposeData({ ...composeData, category: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="general">General Circular</option>
                      <option value="exam">Examination &amp; Board</option>
                      <option value="holiday">Holiday &amp; Festival</option>
                      <option value="sports">Sports &amp; Culture</option>
                    </select>
                  </div>
                </div>
              ) : (
                /* Private recipient selection */
                <div className="p-4 rounded-2xl bg-slate-950 border border-purple-900/40 space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-slate-300 font-bold">Recipient Type:</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                        <input
                          type="radio"
                          name="recipientType"
                          checked={composeData.recipientType === 'student'}
                          onChange={() => {
                            setComposeData(prev => ({
                              ...prev,
                              recipientType: 'student',
                              targetUserId: '',
                              targetUserName: '',
                              recipientRole: 'student'
                            }));
                          }}
                          className="text-purple-500 focus:ring-0"
                        />
                        <span>Student / Ward</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                        <input
                          type="radio"
                          name="recipientType"
                          checked={composeData.recipientType === 'staff'}
                          onChange={() => {
                            setComposeData(prev => ({
                              ...prev,
                              recipientType: 'staff',
                              targetUserId: '',
                              targetUserName: '',
                              recipientRole: 'teacher'
                            }));
                          }}
                          className="text-purple-500 focus:ring-0"
                        />
                        <span>Teacher / Staff Member</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">
                      Select {composeData.recipientType === 'student' ? 'Student' : 'Staff Member'} *
                    </label>
                    <select
                      value={composeData.targetUserId}
                      onChange={(e) => handleSelectRecipient(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-800/60 text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="">-- Choose recipient --</option>
                      {composeData.recipientType === 'student' ? (
                        students.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name} ({st.id} - Roll {st.rollNumber} - Class {st.class})
                          </option>
                        ))
                      ) : (
                        staff.map((sf) => (
                          <option key={sf.id} value={sf.id}>
                            {sf.name} ({sf.designation || sf.role} - {sf.id})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              )}

              {/* Title & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1.5">Notification Title *</label>
                  <input
                    type="text"
                    required
                    value={composeData.title}
                    onChange={(e) => setComposeData({ ...composeData, title: e.target.value })}
                    placeholder={composeMode === 'private' ? 'e.g. Urgent Fee Reminder / Academic Review' : 'e.g. Higher Secondary Board Exam Routine'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Priority Level</label>
                  <select
                    value={composeData.priority}
                    onChange={(e) => setComposeData({ ...composeData, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent (Triggers Chime)</option>
                    <option value="confidential">Confidential</option>
                  </select>
                </div>
              </div>

              {/* Detailed Content */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Notice / Message Content *</label>
                <textarea
                  rows="4"
                  required
                  value={composeData.content}
                  onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                  placeholder="Detailed instructions or alert text..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none leading-relaxed"
                ></textarea>
              </div>

              {/* Multi-Channel Dispatch Toggles (Plugins) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    Multi-Channel Plugin Dispatch
                  </span>
                  <span className="text-[10px] text-slate-500">Live Gateway Sync</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 select-none hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={composeData.channels.inApp}
                      disabled
                      className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                    />
                    <div>
                      <div className="font-bold text-white text-[11px]">In-App</div>
                      <div className="text-[9px] text-emerald-400">Active</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 select-none hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={composeData.channels.whatsapp}
                      onChange={(e) => setComposeData({
                        ...composeData,
                        channels: { ...composeData.channels, whatsapp: e.target.checked }
                      })}
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0"
                    />
                    <div>
                      <div className="font-bold text-white text-[11px]">WhatsApp</div>
                      <div className="text-[9px] text-slate-400">Meta API</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 select-none hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={composeData.channels.push}
                      onChange={(e) => setComposeData({
                        ...composeData,
                        channels: { ...composeData.channels, push: e.target.checked }
                      })}
                      className="rounded bg-slate-950 border-slate-700 text-indigo-500 focus:ring-0"
                    />
                    <div>
                      <div className="font-bold text-white text-[11px]">Web Push</div>
                      <div className="text-[9px] text-slate-400">Desktop / Mobile</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 select-none hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={composeData.channels.campusBell}
                      onChange={(e) => setComposeData({
                        ...composeData,
                        channels: { ...composeData.channels, campusBell: e.target.checked }
                      })}
                      className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                    />
                    <div>
                      <div className="font-bold text-white text-[11px]">Campus Bell</div>
                      <div className="text-[9px] text-amber-400">Audio Chime</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Pin notice checkbox (Broadcast only) */}
              {composeMode === 'broadcast' && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pin-check-composer"
                    checked={composeData.isPinned}
                    onChange={(e) => setComposeData({ ...composeData, isPinned: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <label htmlFor="pin-check-composer" className="text-slate-300 select-none cursor-pointer">
                    Pin this circular to top of notice board and dashboard
                  </label>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('broadcasts')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition active:scale-95 ${
                    composeMode === 'private'
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/25'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>{composeMode === 'private' ? 'Dispatch Private Alert' : 'Publish Broadcast Circular'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Col: Live Notice Preview Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Live Preview
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                {composeMode.toUpperCase()}
              </span>
            </div>

            <div className={`p-5 rounded-2xl border transition-all space-y-3 ${
              composeMode === 'private'
                ? 'bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-900 border-purple-800/60 shadow-xl'
                : 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800 shadow-xl'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    composeMode === 'private' ? 'bg-purple-600 text-white' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {composeMode === 'private' ? 'Pvt Notice' : composeData.category}
                  </span>
                  {composeData.priority === 'urgent' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                      Urgent
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500">Just Now</span>
              </div>

              {composeMode === 'private' && (
                <div className="text-xs text-purple-300 font-semibold">
                  Recipient: <span className="text-white">{composeData.targetUserName || '(Select recipient)'}</span>
                </div>
              )}

              <h4 className="text-base font-bold text-white font-['Outfit']">
                {composeData.title || 'Notice Title Preview'}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed min-h-[60px] whitespace-pre-wrap">
                {composeData.content || 'Notice body and detailed instructions will appear here in real-time as you compose...'}
              </p>

              <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
                <span>By: {currentUser?.displayName || 'School Administration'}</span>
                <span className="text-cyan-400 font-mono">Mizoram SMS</span>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Notice Guidelines</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li>Private alerts are confidential to the target student or teacher.</li>
                <li>Marking priority as <strong>Urgent</strong> triggers audio alerts for recipients.</li>
                <li>WhatsApp and Push plugins sync dispatched alerts immediately.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NOTIFICATION PLUGINS ENGINE */}
      {activeTab === 'plugins' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Communication &amp; Notification Plugins Engine
                </h3>
              </div>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                Connect external delivery gateways including WhatsApp Meta Cloud API, Browser Web Push, synthesized Web Audio chimes, Telegram public channel, and Mizoram Telecom SMS.
              </p>
            </div>
            
            <button
              onClick={handlePlayChime}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md shadow-amber-500/20 transition active:scale-95"
            >
              <Volume2 className="w-4 h-4" />
              <span>Test Audio Chime</span>
            </button>
          </div>

          {/* Plugins Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. WhatsApp Institutional Broadcast */}
            {(() => {
              const waPlugin = plugins.find(p => p.id === 'plugin-whatsapp-broadcast') || {
                id: 'plugin-whatsapp-broadcast',
                name: 'WhatsApp Institutional Broadcast & Webhook',
                version: '2.4.0',
                enabled: true,
                config: { metaPhoneNumberId: '109823485719200', verifiedSenderNumber: '+91 94361 22000', defaultTemplateName: 'school_circular_alert' }
              };
              return (
                <div className={`p-5 rounded-2xl border space-y-3 transition ${
                  waPlugin.enabled ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg' : 'bg-slate-900/40 border-slate-800 opacity-70'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-['Outfit']">WhatsApp Cloud Gateway</h4>
                        <div className="text-[10px] text-slate-400">Official Meta Cloud API • v{waPlugin.version || '2.4.0'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPluginForConfig(waPlugin)}
                        className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                        title="Configure WhatsApp API credentials and templates"
                      >
                        <Sliders className="w-3 h-3 text-emerald-400" />
                        <span>Configure</span>
                      </button>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={waPlugin.enabled}
                          onChange={() => togglePlugin(waPlugin.id)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Delivers institutional circulars and confidential fee reminders directly to student and parent registered WhatsApp mobile numbers (+91 Mizoram prefix).
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Sender: {waPlugin.config?.verifiedSenderNumber || '+91 94361 22000'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Phone ID: {waPlugin.config?.metaPhoneNumberId ? '••••' + String(waPlugin.config.metaPhoneNumberId).slice(-4) : 'Configured'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Template: {waPlugin.config?.defaultTemplateName || 'school_circular_alert'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Status: {waPlugin.enabled ? '🟢 Connected' : '⚪ Standby'}</span>
                    <span className="text-emerald-400 font-mono">Meta Cloud API v18.0</span>
                  </div>
                </div>
              );
            })()}

            {/* 2. Web Push & Desktop Notifications */}
            {(() => {
              const pushPlugin = plugins.find(p => p.id === 'plugin-browser-push') || {
                id: 'plugin-browser-push',
                name: 'Web Push & Desktop Notification Engine',
                version: '1.8.0',
                enabled: true,
                config: { vapidPublicKey: 'BEl62iUYg_Mizoram_School...', autoPromptPermission: true }
              };
              return (
                <div className={`p-5 rounded-2xl border space-y-3 transition ${
                  pushPlugin.enabled ? 'bg-slate-900/90 border-indigo-500/40 shadow-lg' : 'bg-slate-900/40 border-slate-800 opacity-70'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-['Outfit']">Web Push &amp; Desktop Engine</h4>
                        <div className="text-[10px] text-slate-400">W3C Push API • v{pushPlugin.version || '1.8.0'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPluginForConfig(pushPlugin)}
                        className="px-2.5 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                        title="Configure Web Push VAPID keys and icons"
                      >
                        <Sliders className="w-3 h-3 text-indigo-400" />
                        <span>Configure</span>
                      </button>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pushPlugin.enabled}
                          onChange={() => togglePlugin(pushPlugin.id)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sends browser desktop and mobile notifications in real-time even when the school management system tab is inactive or minimized.
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      VAPID Key: {pushPlugin.config?.vapidPublicKey ? 'Configured (256-bit)' : 'Default'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Auto-Prompt: {pushPlugin.config?.autoPromptPermission !== false ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Status: {pushPlugin.enabled ? '🟢 ServiceWorker Active' : '⚪ Disabled'}</span>
                    <span className="text-indigo-400 font-mono">PushManager Ready</span>
                  </div>
                </div>
              );
            })()}

            {/* 3. Campus Audio Bell & Chime Broadcast */}
            {(() => {
              const bellPlugin = plugins.find(p => p.id === 'plugin-campus-bell') || {
                id: 'plugin-campus-bell',
                name: 'Campus Audio Bell & Chime Broadcast',
                version: '1.2.0',
                enabled: true,
                config: { baseFrequency: 587.33, topFrequency: 880, volumePercent: 85, durationSeconds: 0.8, chimeType: 'dual_tone_harmonic' }
              };
              return (
                <div className={`p-5 rounded-2xl border space-y-3 transition ${
                  bellPlugin.enabled ? 'bg-slate-900/90 border-amber-500/40 shadow-lg' : 'bg-slate-900/40 border-slate-800 opacity-70'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <Volume2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-['Outfit']">Campus Audio Bell &amp; Chime</h4>
                        <div className="text-[10px] text-slate-400">Web Audio API • v{bellPlugin.version || '1.2.0'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPluginForConfig(bellPlugin)}
                        className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                        title="Configure Chime frequencies, volume, and wave type"
                      >
                        <Sliders className="w-3 h-3 text-amber-400" />
                        <span>Configure</span>
                      </button>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bellPlugin.enabled}
                          onChange={() => togglePlugin(bellPlugin.id)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Synthesizes institutional acoustic chimes (D5 to A5) for emergency notifications, urgent broadcast dispatches, and period transitions.
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Freq: {bellPlugin.config?.baseFrequency || 587.33}Hz - {bellPlugin.config?.topFrequency || 880}Hz
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Vol: {bellPlugin.config?.volumePercent || 85}%
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Duration: {bellPlugin.config?.durationSeconds || 0.8}s
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <button
                      onClick={handlePlayChime}
                      className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 text-xs"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Play Test Chime</span>
                    </button>
                    <span className="text-amber-400 font-mono">Instant Audio</span>
                  </div>
                </div>
              );
            })()}

            {/* 4. Telegram Channel Broadcast */}
            {(() => {
              const tgPlugin = plugins.find(p => p.id === 'plugin-telegram-broadcast') || {
                id: 'plugin-telegram-broadcast',
                name: 'Telegram Channel Broadcast & Sync',
                version: '1.1.5',
                enabled: true,
                config: { botToken: '7189201948:AAEk_bot...', channelUsername: '@mizoram_school_official', autoSyncNotices: true }
              };
              return (
                <div className={`p-5 rounded-2xl border space-y-3 transition ${
                  tgPlugin.enabled ? 'bg-slate-900/90 border-sky-500/40 shadow-lg' : 'bg-slate-900/40 border-slate-800 opacity-70'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                        <Radio className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-['Outfit']">Telegram Channel Broadcast</h4>
                        <div className="text-[10px] text-slate-400">Bot API Sync • v{tgPlugin.version || '1.1.5'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPluginForConfig(tgPlugin)}
                        className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                        title="Configure Telegram Bot Token & Channel"
                      >
                        <Sliders className="w-3 h-3 text-sky-400" />
                        <span>Configure</span>
                      </button>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tgPlugin.enabled}
                          onChange={() => togglePlugin(tgPlugin.id)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
                      </label>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Automatically formats and mirrors published institutional circulars into the official school Telegram subscriber channel for community outreach.
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Channel: {tgPlugin.config?.channelUsername || '@mizoram_school_official'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Bot Token: {tgPlugin.config?.botToken ? '••••' + String(tgPlugin.config.botToken).slice(-6) : 'Configured'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Target: <code className="text-slate-400">{tgPlugin.config?.channelUsername || '@mizoram_school_official'}</code></span>
                    <span className="text-sky-400 font-mono">Sync Enabled</span>
                  </div>
                </div>
              );
            })()}

            {/* 6. Live Video Broadcast & RTMP/HLS Streaming Engine */}
            {(() => {
              const livePlugin = plugins.find(p => p.id === 'plugin-live-broadcast-streaming') || {
                id: 'plugin-live-broadcast-streaming',
                name: 'Live Video Broadcast & RTMP/HLS Streaming Engine',
                version: '3.2.0',
                enabled: true,
                config: { rtmpIngestUrl: 'rtmps://live.mizoramschool.edu.in:443/live', streamKey: 'live_mzs_stream_key_9988', latencyMode: 'low-latency', dvrRecordingEnabled: true }
              };
              return (
                <div className={`p-5 rounded-2xl border space-y-3 transition ${
                  livePlugin.enabled ? 'bg-slate-900/90 border-rose-500/40 shadow-lg' : 'bg-slate-900/40 border-slate-800 opacity-70'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                        <Radio className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-['Outfit']">Live Video Broadcast &amp; RTMP</h4>
                        <div className="text-[10px] text-slate-400">HLS / RTMP Ingest • v{livePlugin.version || '3.2.0'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPluginForConfig(livePlugin)}
                        className="px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                        title="Configure RTMP ingest, stream key, and cloud DVR"
                      >
                        <Sliders className="w-3 h-3 text-rose-400" />
                        <span>Configure</span>
                      </button>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={livePlugin.enabled}
                          onChange={() => togglePlugin(livePlugin.id)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                      </label>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Broadcasts high-definition live classroom lectures and institutional morning devotions to students, web portals, and mobile devices.
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      RTMP: {livePlugin.config?.rtmpIngestUrl ? 'Configured (SSL)' : 'Default'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Key: ••••••••••
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Latency: {livePlugin.config?.latencyMode || 'low-latency'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>DVR Cloud Archiving: {livePlugin.config?.dvrRecordingEnabled ? 'Active' : 'Off'}</span>
                    <span className="text-rose-400 font-mono">1080p Broadcast</span>
                  </div>
                </div>
              );
            })()}

            {/* 7. WebRTC Multi-Party Video Conference & Voice Call Gateway */}
            {(() => {
              const rtcPlugin = plugins.find(p => p.id === 'plugin-webrtc-video-conference') || {
                id: 'plugin-webrtc-video-conference',
                name: 'WebRTC Multi-Party Video Conference & Voice Call Gateway',
                version: '2.5.0',
                enabled: true,
                config: { activeProvider: 'webrtc_mesh', opusBitrateKbps: 128, audioNoiseSuppression: true, defaultVideoQuality: '720p' }
              };
              return (
                <div className={`p-5 rounded-2xl border space-y-3 transition ${
                  rtcPlugin.enabled ? 'bg-slate-900/90 border-cyan-500/40 shadow-lg' : 'bg-slate-900/40 border-slate-800 opacity-70'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-['Outfit']">Video Conference &amp; Voice Gateway</h4>
                        <div className="text-[10px] text-slate-400">WebRTC Mesh / SFU • v{rtcPlugin.version || '2.5.0'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPluginForConfig(rtcPlugin)}
                        className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                        title="Configure STUN/TURN servers, Agora credentials, and audio bitrates"
                      >
                        <Sliders className="w-3 h-3 text-cyan-400" />
                        <span>Configure</span>
                      </button>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rtcPlugin.enabled}
                          onChange={() => togglePlugin(rtcPlugin.id)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                      </label>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Interactive two-way video calls, parent-teacher conferences, and remote voice lecturing with AI echo cancellation and STUN/TURN NAT traversal.
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Engine: {rtcPlugin.config?.activeProvider || 'webrtc_mesh'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Audio: {rtcPlugin.config?.opusBitrateKbps || 128} kbps Opus
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Noise Filter: {rtcPlugin.config?.audioNoiseSuppression ? 'ON' : 'OFF'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Quality: {rtcPlugin.config?.defaultVideoQuality || '720p HD'}</span>
                    <span className="text-cyan-400 font-mono">Peer-to-Peer Ready</span>
                  </div>
                </div>
              );
            })()}

            {/* 8. Real-Time Classroom Live Chat & Moderation Socket */}
            {(() => {
              const chatPlugin = plugins.find(p => p.id === 'plugin-realtime-classroom-chat') || {
                id: 'plugin-realtime-classroom-chat',
                name: 'Real-Time Classroom Live Chat & Moderation Socket',
                version: '2.0.1',
                enabled: true,
                config: { socketEndpoint: 'wss://chat.mizoramschool.edu.in/ws', slowModeSeconds: 3, profanityFilter: true }
              };
              return (
                <div className={`p-5 rounded-2xl border space-y-3 transition ${
                  chatPlugin.enabled ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg' : 'bg-slate-900/40 border-slate-800 opacity-70'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-['Outfit']">Real-Time Chat &amp; Socket</h4>
                        <div className="text-[10px] text-slate-400">WebSocket / Firebase • v{chatPlugin.version || '2.0.1'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPluginForConfig(chatPlugin)}
                        className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                        title="Configure chat slow mode, profanity filtering, and transcript export"
                      >
                        <Sliders className="w-3 h-3 text-emerald-400" />
                        <span>Configure</span>
                      </button>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={chatPlugin.enabled}
                          onChange={() => togglePlugin(chatPlugin.id)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Live student Q&amp;A stream with automated profanity suppression, slow-mode rate limiting, and instant session transcript backups.
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Slow Mode: {chatPlugin.config?.slowModeSeconds || 3}s
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Profanity Filter: {chatPlugin.config?.profanityFilter ? 'Active' : 'Off'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Auto-Archive: ON
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Endpoint: <code className="text-slate-400 font-mono">wss://chat.mzs.edu/ws</code></span>
                    <span className="text-emerald-400 font-mono">Connected</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Interactive Plugin & CDN Configuration Suite Modal */}
      <PluginConfigModal
        isOpen={!!selectedPluginForConfig}
        plugin={selectedPluginForConfig}
        onClose={() => setSelectedPluginForConfig(null)}
        onSave={updatePlugin}
        onDelete={deletePlugin}
        onReset={resetPluginConfig}
      />
    </div>
  );
}
