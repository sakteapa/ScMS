import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  X, 
  ChevronDown, 
  Send, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  ArrowRight, 
  ShieldAlert, 
  Zap, 
  Clock, 
  RotateCcw, 
  Code2, 
  Radio, 
  DollarSign, 
  Users, 
  FileText,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSchool } from '../context/SchoolContext';
import { 
  runSystemDiagnostics, 
  getLiveTelemetry, 
  processSuperAdminAiCommand 
} from '../utils/superAdminAiEngine';

export default function SuperAdminAiWidget({ setCurrentTab }) {
  const { currentUser, isSuperAdmin } = useAuth();
  const schoolContext = useSchool();

  const [isOpen, setIsOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('actions'); // 'actions' | 'telemetry' | 'chat'
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'msg-init',
      sender: 'ai',
      text: 'Chibai Super Admin! Kei hi i AI System Co-Pilot ka ni e. Software leh code en fel, enge thleng a, enge tih ngai tih te ka lo monitor reng ang che. Eng thil nge kan en fel hmasak ang?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanReport, setScanReport] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const chatEndRef = useRef(null);

  // Play subtle feedback chime
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  // Run initial diagnostic scan
  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const report = runSystemDiagnostics(schoolContext);
      setScanReport(report);
      setIsScanning(false);
      playChime();
    }, 600);
  };

  useEffect(() => {
    if (isSuperAdmin && !scanReport) {
      handleRunScan();
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (activeSubTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeSubTab]);

  // If not superadmin, do not render widget
  if (!isSuperAdmin) return null;

  const telemetry = getLiveTelemetry(schoolContext);
  const criticalCount = scanReport?.metrics?.criticalIssues || 0;
  const pendingActionsCount = telemetry.priorityActions.length;

  const handleSendMessage = (textToSend) => {
    const query = (textToSend || chatInput).trim();
    if (!query) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Process through Super Admin AI engine
    setTimeout(() => {
      const result = processSuperAdminAiCommand(query, {
        ...schoolContext,
        setCurrentTab,
        onRunDiagnostics: handleRunScan
      });

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: result.message,
        type: result.type,
        quickActions: result.quickActions,
        navigatedTab: result.navigatedTab,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, aiMsg]);
      playChime();
    }, 400);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 font-sans">
      {/* 1. EXPANDED AI DOCK */}
      {isOpen && (
        <div className="w-[calc(100vw-1.5rem)] sm:w-[420px] max-w-[420px] h-[520px] sm:h-[580px] max-h-[75vh] sm:max-h-[85vh] bg-[#0c1322] border border-cyan-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-5">
          {/* Top Dock Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-slate-950 shadow-md shadow-cyan-500/30">
                <Bot className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse border-2 border-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white font-['Outfit']">
                    Super Admin AI Co-Pilot
                  </h3>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Health: <strong className={scanReport?.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}>
                    {scanReport ? `${scanReport.healthScore}%` : 'Scanning...'}
                  </strong> • Code &amp; System Monitor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleRunScan}
                disabled={isScanning}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition cursor-pointer"
                title="Re-run System Diagnostics"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-cyan-300' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                title={soundEnabled ? 'Mute AI Audio' : 'Unmute AI Audio'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                title="Minimize Dock"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-Tab Navigation Bar */}
          <div className="p-2 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between gap-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('actions')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                activeSubTab === 'actions'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Enge Tih Ngai</span>
              {pendingActionsCount > 0 && (
                <span className={`text-[10px] px-1.5 rounded-full font-mono font-bold ${
                  activeSubTab === 'actions' ? 'bg-black/30 text-slate-950' : 'bg-rose-500 text-white'
                }`}>
                  {pendingActionsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('telemetry')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                activeSubTab === 'telemetry'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Enge Thleng</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('chat')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                activeSubTab === 'chat'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Chat</span>
            </button>
          </div>

          {/* Content Views */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* VIEW 1: ENGE TIH NGAI (PRIORITY ACTIONS & ANOMALIES) */}
            {activeSubTab === 'actions' && (
              <div className="space-y-3 animate-in fade-in">
                {/* Health Overview Strip */}
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${
                      scanReport?.healthScore >= 90 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">System Health Score: {scanReport?.healthScore || 95}%</span>
                      <span className="text-[10px] text-slate-400">
                        {scanReport?.issues?.length || 0} anomaly flagged • {scanReport?.metrics?.autoFixableIssues || 0} auto-fixable
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (setCurrentTab) setCurrentTab('dev_studio');
                      setIsOpen(false);
                    }}
                    className="px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-[11px] font-bold transition flex items-center gap-1"
                  >
                    <span>IDE Hub</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Priority Action Cards */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Action Required Right Now:</span>
                  </h4>

                  {telemetry.priorityActions.length > 0 ? (
                    telemetry.priorityActions.map(act => (
                      <div 
                        key={act.id} 
                        className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/50 transition flex items-start justify-between gap-3 group"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                            act.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {act.priority}
                          </span>
                          <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition truncate">
                            {act.title}
                          </h5>
                          <p className="text-[11px] text-slate-400">
                            {act.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (setCurrentTab) setCurrentTab(act.actionTab);
                            setIsOpen(false);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1"
                        >
                          <span>Go</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-500 space-y-1">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400/60" />
                      <p className="text-xs text-slate-300 font-bold">All Priority Tasks Clear!</p>
                      <p className="text-[11px]">No critical directives or backlogs pending.</p>
                    </div>
                  )}
                </div>

                {/* Scanned System Issues */}
                {scanReport?.issues?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Code &amp; Database Diagnostics:</span>
                    </h4>
                    {scanReport.issues.map(iss => (
                      <div key={iss.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-200">{iss.title}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                            iss.severity === 'critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {iss.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{iss.description}</p>
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 capitalize">Module: {iss.category}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (setCurrentTab) setCurrentTab(iss.actionTab);
                              setIsOpen(false);
                            }}
                            className="text-cyan-400 hover:text-cyan-300 font-bold text-[11px] flex items-center gap-1"
                          >
                            <span>{iss.actionLabel}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: ENGE THLENG (LIVE TELEMETRY FEED) */}
            {activeSubTab === 'telemetry' && (
              <div className="space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="font-bold uppercase tracking-wider">Live Event Stream:</span>
                  <span className="text-cyan-400 font-mono">Real-time sync</span>
                </div>

                {telemetry.recentEvents.length > 0 ? (
                  telemetry.recentEvents.map(ev => (
                    <div key={ev.id} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${ev.badgeColor}`}>
                          {ev.type}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-200">{ev.title}</h5>
                      <p className="text-[11px] text-slate-400">{ev.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-500">
                    <Activity className="w-8 h-8 mx-auto text-slate-600 mb-1" />
                    <p className="text-xs">No recent events captured yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3: AI CHAT & COMMAND BOX */}
            {activeSubTab === 'chat' && (
              <div className="space-y-3 animate-in fade-in">
                {chatMessages.map(m => (
                  <div 
                    key={m.id} 
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      m.sender === 'user' 
                        ? 'bg-cyan-500 text-slate-950 font-medium rounded-br-none shadow' 
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow'
                    }`}>
                      {m.text}

                      {/* Optional quick action prompt chips */}
                      {m.quickActions && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                          {m.quickActions.map((qa, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleSendMessage(qa.prompt)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold transition cursor-pointer"
                            >
                              {qa.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 font-mono">{m.time}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Quick Suggestion Chips (Visible on Chat tab) */}
          {activeSubTab === 'chat' && (
            <div className="px-3 py-1.5 bg-slate-950/90 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
              {[
                { label: '🔍 System Scan', prompt: 'System health scan nei rawh' },
                { label: '📝 Admissions', prompt: 'Admission pending zat leh dinhmun' },
                { label: '💰 Fee Arrears', prompt: 'Fee ba leh collection status' },
                { label: '⚡ Dev Studio', prompt: 'Dev Studio code editor hawng rawh' }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip.prompt)}
                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition whitespace-nowrap shrink-0"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {/* Dock Bottom Command Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask AI or give command (Mizo / English)..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!chatInput.trim()}
              className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. FLOATING TRIGGER BUTTON (PULSING ORB) */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          playChime();
        }}
        className={`relative p-3.5 sm:p-4 rounded-2xl shadow-2xl transition-all duration-300 flex items-center justify-center cursor-pointer group ${
          isOpen
            ? 'bg-slate-800 text-cyan-400 border border-slate-700'
            : 'bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 text-slate-950 hover:scale-105 shadow-cyan-500/25'
        }`}
        title="Super Admin AI System Co-Pilot (Click to toggle)"
      >
        <Bot className="w-6 h-6 transition-transform group-hover:rotate-12" />
        
        {/* Unread Critical Alert Badge */}
        {(criticalCount > 0 || pendingActionsCount > 0) && !isOpen && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white font-mono font-bold text-[10px] flex items-center justify-center shadow-lg animate-pulse border-2 border-slate-950">
            {criticalCount + pendingActionsCount}
          </span>
        )}

        {/* Pulse Aura */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-2xl bg-cyan-400 opacity-20 animate-ping pointer-events-none" />
        )}
      </button>
    </div>
  );
}
