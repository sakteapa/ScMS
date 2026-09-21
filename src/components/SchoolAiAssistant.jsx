import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bot, Sparkles, X, Send, Activity, AlertTriangle, CheckCircle2,
  ChevronDown, ArrowRight, Zap, TrendingUp, Users, DollarSign,
  CalendarDays, FileText, MessageCircle, Volume2, VolumeX, Minimize2,
  Maximize2, RefreshCw, School, GripVertical, RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import {
  processSchoolAiQuery,
  getSchoolAiProactiveAlerts,
  getSchoolQuickStats,
} from '../utils/schoolAiEngine';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEVERITY_STYLE = {
  high:   { ring: 'border-rose-500/40',   dot: 'bg-rose-500',    text: 'text-rose-300',   badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  medium: { ring: 'border-amber-500/40',  dot: 'bg-amber-400',   text: 'text-amber-300',  badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  low:    { ring: 'border-blue-500/30',   dot: 'bg-blue-400',    text: 'text-blue-300',   badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
};

/** Renders markdown-like bold text (**text**) */
function RichText({ text }) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={i} className="text-white font-bold">{p.slice(2, -2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SchoolAiAssistant({ setCurrentTab }) {
  const { currentUser } = useAuth();
  const schoolCtx = useSchool();
  const { systemConfig, activeSchoolInfo } = schoolCtx;

  // Gate: only show to allowed roles when enabled
  const aiConfig = systemConfig?.schoolAiAssistant || {};
  const allowedRoles = aiConfig.allowedRoles || ['principal', 'vice_principal', 'admin'];
  const isEnabled = aiConfig.enabled !== false;
  const isAllowed = currentUser && allowedRoles.includes(currentUser.role);

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('alerts'); // 'alerts' | 'chat' | 'stats'
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({});
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: 'init',
      sender: 'ai',
      text: `Chibai! Kei hi **${aiConfig.assistantName || 'Zoxs AI'}** — i school AI assistant ka ni e. 🎓\n\nFee arrear, attendance, admission, staff, notice te thawn zawt rawh. School data live-in ka en a, a tul dan angin hna ka thawk ang.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const chatEndRef = useRef(null);

  // ── Draggable FAB Position State ───────────────────────────────────────────
  const [fabPosition, setFabPosition] = useState(() => {
    try {
      const saved = localStorage.getItem('zoxs_ai_fab_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
          return parsed;
        }
      }
    } catch {}
    return null; // Initialized on mount to safe bottom-right
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
    hasMoved: false,
  });
  const fabElementRef = useRef(null);

  // Initialize position to bottom-right if not set (keeps safe clearance from sidebar)
  useEffect(() => {
    if (!fabPosition && typeof window !== 'undefined') {
      const initX = Math.max(16, window.innerWidth - 180);
      const initY = Math.max(16, window.innerHeight - 80);
      setFabPosition({ x: initX, y: initY });
    }
  }, [fabPosition]);

  // Keep inside viewport on window resize
  useEffect(() => {
    const handleResize = () => {
      setFabPosition(prev => {
        if (!prev) return prev;
        const maxX = Math.max(10, window.innerWidth - 160);
        const maxY = Math.max(10, window.innerHeight - 70);
        return {
          x: Math.max(10, Math.min(maxX, prev.x)),
          y: Math.max(10, Math.min(maxY, prev.y)),
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e) => {
    if (e.button && e.button !== 0) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const currentX = fabPosition?.x ?? (window.innerWidth - 180);
    const currentY = fabPosition?.y ?? (window.innerHeight - 80);

    dragRef.current = {
      startX: clientX,
      startY: clientY,
      startPosX: currentX,
      startPosY: currentY,
      hasMoved: false,
    };

    const handlePointerMove = (moveEvt) => {
      const curX = moveEvt.touches ? moveEvt.touches[0].clientX : moveEvt.clientX;
      const curY = moveEvt.touches ? moveEvt.touches[0].clientY : moveEvt.clientY;
      const dx = curX - dragRef.current.startX;
      const dy = curY - dragRef.current.startY;

      if (!dragRef.current.hasMoved && Math.hypot(dx, dy) > 4) {
        dragRef.current.hasMoved = true;
        setIsDragging(true);
      }

      if (dragRef.current.hasMoved) {
        const btnW = fabElementRef.current?.offsetWidth || 150;
        const btnH = fabElementRef.current?.offsetHeight || 52;
        const maxX = Math.max(10, window.innerWidth - btnW - 10);
        const maxY = Math.max(10, window.innerHeight - btnH - 10);
        const nextX = Math.max(10, Math.min(maxX, dragRef.current.startPosX + dx));
        const nextY = Math.max(10, Math.min(maxY, dragRef.current.startPosY + dy));
        setFabPosition({ x: nextX, y: nextY });
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);

      if (dragRef.current.hasMoved) {
        setTimeout(() => setIsDragging(false), 50);
        setFabPosition(finalPos => {
          if (finalPos) {
            try {
              localStorage.setItem('zoxs_ai_fab_pos', JSON.stringify(finalPos));
            } catch {}
          }
          return finalPos;
        });
      } else {
        setIsDragging(false);
        setIsOpen(true);
      }
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);
  };

  const resetFabPosition = () => {
    const initX = Math.max(16, window.innerWidth - 180);
    const initY = Math.max(16, window.innerHeight - 80);
    const newPos = { x: initX, y: initY };
    setFabPosition(newPos);
    try {
      localStorage.setItem('zoxs_ai_fab_pos', JSON.stringify(newPos));
    } catch {}
  };

  // ── Audio feedback ─────────────────────────────────────────────────────────
  const playChime = useCallback(() => {
    if (!soundOn) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.30);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.30);
    } catch {}
  }, [soundOn]);

  // ── Scan / refresh alerts ──────────────────────────────────────────────────
  const runScan = useCallback(() => {
    setIsScanning(true);
    setTimeout(() => {
      setAlerts(getSchoolAiProactiveAlerts(schoolCtx));
      setStats(getSchoolQuickStats(schoolCtx));
      setLastScan(new Date());
      setIsScanning(false);
    }, 800);
  }, [schoolCtx]);

  useEffect(() => {
    if (isOpen && isEnabled && isAllowed) {
      runScan();
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isEnabled || !isAllowed) return null;

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = () => {
    const text = chatInput.trim();
    if (!text) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = processSchoolAiQuery(text, schoolCtx);
      const aiMsg = {
        id: `a-${Date.now()}`,
        sender: 'ai',
        text: response.text,
        tab: response.tab,
        tabLabel: response.tabLabel,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      playChime();
    }, 900 + Math.random() * 600);
  };

  const navigateTo = (tab) => {
    if (setCurrentTab && tab) setCurrentTab(tab);
    setIsOpen(false);
  };

  // ── Quick prompt chips ─────────────────────────────────────────────────────
  const QUICK_PROMPTS = [
    { label: 'Fee arrear zat?', icon: '₹' },
    { label: 'Ni tuk attendance', icon: '📊' },
    { label: 'Admission pending', icon: '📋' },
    { label: 'Staff zat', icon: '👥' },
    { label: 'Leave pending', icon: '📅' },
    { label: 'Task tih tur', icon: '✅' },
  ];

  // ── FAB (Floating Action Button) ───────────────────────────────────────────
  const alertCount = alerts.filter(a => a.severity === 'high' || a.severity === 'medium').length;

  return (
    <>
      {/* Draggable FAB */}
      {!isOpen && (
        <div
          ref={fabElementRef}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          style={fabPosition ? {
            left: `${fabPosition.x}px`,
            top: `${fabPosition.y}px`,
            touchAction: 'none'
          } : {
            touchAction: 'none'
          }}
          className={`fixed z-[9990] select-none group flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-2xl shadow-indigo-900/60 border border-indigo-400/30 ${
            !fabPosition ? 'bottom-20 sm:bottom-6 right-3 sm:right-6' : ''
          } ${
            isDragging 
              ? 'cursor-grabbing scale-105 shadow-indigo-500/50 ring-2 ring-indigo-400' 
              : 'cursor-grab hover:scale-105 transition-transform duration-200'
          }`}
          title="Zoxs AI (Hnuk sawn kual theih a ni / Drag anywhere to reposition)"
        >
          {/* Visual Grip Handle */}
          <GripVertical className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-200/70 group-hover:text-white transition shrink-0" />

          <div className="relative shrink-0">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-wide">Zoxs AI</span>
          {alertCount > 0 && (
            <span className="min-w-[16px] sm:min-w-[18px] h-4 sm:h-4.5 px-1 rounded-full bg-rose-500 text-[9px] sm:text-[10px] font-bold text-white flex items-center justify-center shadow-md shadow-rose-900/50">
              {alertCount}
            </span>
          )}
        </div>
      )}

      {/* Panel */}
      {isOpen && (
        <div className={`fixed bottom-20 sm:bottom-6 right-2 sm:right-6 left-2 sm:left-auto z-[9990] flex flex-col bg-[#0c1220] border border-slate-800 rounded-3xl shadow-2xl shadow-black/70 transition-all duration-300 ${isMinimized ? 'w-auto sm:w-72 h-14' : 'w-auto sm:w-[420px] max-w-[calc(100vw-1rem)] h-[540px] sm:h-[600px] max-h-[75vh] sm:max-h-[85vh]'}`}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-950/80 to-violet-950/80 rounded-t-3xl border-b border-slate-800/60 shrink-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0c1220] animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {aiConfig.assistantName || 'Zoxs AI'}
              </p>
              <p className="text-[10px] text-indigo-300 truncate">
                {activeSchoolInfo?.shortName || activeSchoolInfo?.name || 'School'} • AI Assistant
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={resetFabPosition} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-700 transition" 
                title="Button Position Reset Rawh"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setSoundOn(s => !s)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition" title={soundOn ? 'Mute' : 'Unmute'}>
                {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setIsMinimized(m => !m)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition">
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Tabs */}
              <div className="flex border-b border-slate-800/60 shrink-0 bg-slate-950/40">
                {[
                  { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: alertCount },
                  { id: 'chat', label: 'Chat', icon: MessageCircle },
                  { id: 'stats', label: 'Stats', icon: TrendingUp },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold transition border-b-2 ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-300 bg-indigo-500/8'
                        : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                    {tab.badge > 0 && (
                      <span className="absolute top-1.5 right-3 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-hidden flex flex-col">

                {/* ===== ALERTS TAB ===== */}
                {activeTab === 'alerts' && (
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {/* Scan header */}
                    <div className="flex items-center justify-between px-1 mb-1">
                      <span className="text-[10px] text-slate-500">
                        {lastScan ? `Last scan: ${lastScan.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not scanned yet'}
                      </span>
                      <button
                        onClick={runScan}
                        disabled={isScanning}
                        className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 transition"
                      >
                        <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                        {isScanning ? 'Scanning...' : 'Refresh'}
                      </button>
                    </div>

                    {isScanning && (
                      <div className="flex flex-col items-center gap-3 py-8 text-slate-500">
                        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/40 border-t-indigo-500 animate-spin" />
                        <p className="text-xs">School data a en mek...</p>
                      </div>
                    )}

                    {!isScanning && alerts.length === 0 && (
                      <div className="flex flex-col items-center gap-3 py-10 text-slate-500">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500/60" />
                        <p className="text-sm font-semibold text-emerald-400">Issue a awm lo!</p>
                        <p className="text-xs text-center text-slate-500">School data a ṭha ngăi ngăi. Alert a awm leh chuan hei-ah ka tarlang ang.</p>
                      </div>
                    )}

                    {!isScanning && alerts.map(alert => {
                      const s = SEVERITY_STYLE[alert.severity] || SEVERITY_STYLE.low;
                      return (
                        <div
                          key={alert.id}
                          className={`p-3 rounded-xl border bg-slate-900/60 ${s.ring} hover:bg-slate-900 transition group`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="text-lg shrink-0 mt-0.5">{alert.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${s.badge}`}>
                                  {alert.severity}
                                </span>
                                <span className="text-[10px] text-slate-500">{alert.category}</span>
                              </div>
                              <p className="text-xs font-semibold text-white">{alert.title}</p>
                              <p className={`text-[11px] mt-0.5 ${s.text}`}>{alert.detail}</p>
                              {alert.action && (
                                <button
                                  onClick={() => navigateTo(alert.action.tab)}
                                  className="mt-2 flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                  {alert.action.label}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ===== CHAT TAB ===== */}
                {activeTab === 'chat' && (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                      {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {msg.sender === 'ai' && (
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                              <Bot className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                          <div className={`max-w-[80%] ${msg.sender === 'user'
                            ? 'bg-indigo-600 rounded-2xl rounded-tr-sm px-3 py-2'
                            : 'bg-slate-800/80 rounded-2xl rounded-tl-sm px-3 py-2.5'}`}
                          >
                            <p className={`text-xs leading-relaxed whitespace-pre-wrap ${msg.sender === 'user' ? 'text-white' : 'text-slate-200'}`}>
                              <RichText text={msg.text} />
                            </p>
                            {msg.tab && msg.tabLabel && (
                              <button
                                onClick={() => navigateTo(msg.tab)}
                                className="mt-2 flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition"
                              >
                                <ArrowRight className="w-3 h-3" />
                                {msg.tabLabel}
                              </button>
                            )}
                            <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-500'}`}>{msg.time}</p>
                          </div>
                        </div>
                      ))}

                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                            <Bot className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div className="bg-slate-800/80 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                            {[0, 1, 2].map(i => (
                              <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Quick prompts */}
                    <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide shrink-0">
                      {QUICK_PROMPTS.map(p => (
                        <button
                          key={p.label}
                          onClick={() => { setChatInput(p.label); }}
                          className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-indigo-900/50 border border-slate-700 hover:border-indigo-500/50 text-[11px] text-slate-300 hover:text-white transition"
                        >
                          <span>{p.icon}</span>
                          <span>{p.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-slate-800/60 shrink-0">
                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-indigo-500 transition">
                        <input
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                          placeholder="Zawt rawh... (Mizo / English)"
                          className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                        />
                        <button
                          onClick={handleSend}
                          disabled={!chatInput.trim() || isTyping}
                          className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== STATS TAB ===== */}
                {activeTab === 'stats' && (
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    <div className="flex items-center justify-between px-1 mb-1">
                      <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Live School Snapshot</p>
                      <button onClick={runScan} disabled={isScanning} className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 transition">
                        <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                        Refresh
                      </button>
                    </div>

                    {[
                      { label: 'Total Students', value: stats.totalStudents ?? '—', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
                      { label: 'Total Staff', value: stats.totalStaff ?? '—', icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
                      { label: 'Classes', value: stats.totalClasses ?? '—', icon: School, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
                      {
                        label: "Today's Attendance",
                        value: stats.attendancePct != null ? `${stats.attendancePct}%` : 'N/A',
                        sub: stats.attendancePct != null ? `${stats.presentToday} present` : 'No data',
                        icon: CalendarDays,
                        color: stats.attendancePct != null && stats.attendancePct < 75 ? 'text-rose-400' : 'text-emerald-400',
                        bg: stats.attendancePct != null && stats.attendancePct < 75 ? 'bg-rose-500/10' : 'bg-emerald-500/10',
                        border: stats.attendancePct != null && stats.attendancePct < 75 ? 'border-rose-500/20' : 'border-emerald-500/20',
                      },
                      {
                        label: 'Outstanding Fees',
                        value: stats.totalFeesDue > 0 ? `₹${stats.totalFeesDue.toLocaleString('en-IN')}` : '₹0',
                        icon: DollarSign,
                        color: stats.totalFeesDue > 0 ? 'text-amber-400' : 'text-emerald-400',
                        bg: stats.totalFeesDue > 0 ? 'bg-amber-500/10' : 'bg-emerald-500/10',
                        border: stats.totalFeesDue > 0 ? 'border-amber-500/20' : 'border-emerald-500/20',
                      },
                      { label: 'Pending Admissions', value: stats.pendingAdmissions ?? 0, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                    ].map(item => (
                      <div key={item.label} className={`flex items-center gap-3 p-3 rounded-xl border ${item.bg} ${item.border}`}>
                        <div className={`w-9 h-9 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center shrink-0`}>
                          <item.icon className={`w-4.5 h-4.5 ${item.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-400 font-medium">{item.label}</p>
                          <p className={`text-base font-bold ${item.color}`}>{item.value}</p>
                          {item.sub && <p className="text-[10px] text-slate-500">{item.sub}</p>}
                        </div>
                      </div>
                    ))}

                    {/* Quick action nav buttons */}
                    <div className="pt-2 grid grid-cols-2 gap-2">
                      {[
                        { label: 'Financials', tab: 'financials', icon: '₹' },
                        { label: 'Attendance', tab: 'attendance', icon: '📊' },
                        { label: 'Admissions', tab: 'admissions', icon: '📋' },
                        { label: 'Notices', tab: 'notices', icon: '📢' },
                      ].map(item => (
                        <button
                          key={item.tab}
                          onClick={() => navigateTo(item.tab)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-indigo-900/40 border border-slate-700 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white transition"
                        >
                          <span>{item.icon}</span>
                          {item.label}
                          <ArrowRight className="w-3 h-3 ml-auto text-slate-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-slate-800/60 flex items-center justify-between bg-slate-950/30 rounded-b-3xl shrink-0">
                <span className="text-[10px] text-slate-600">Zoxs AI • {currentUser?.role === 'principal' ? 'Principal Access' : currentUser?.role === 'vice_principal' ? 'Vice Principal Access' : 'Admin Access'}</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-medium">Live</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
