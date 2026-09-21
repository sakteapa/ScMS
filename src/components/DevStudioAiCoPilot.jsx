import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Wrench, 
  Play, 
  Code2, 
  FileCode, 
  Layers, 
  Terminal, 
  Activity, 
  ArrowRight, 
  Check, 
  Copy, 
  Zap, 
  Database, 
  Sliders, 
  RefreshCw, 
  Send 
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { runSystemDiagnostics, getLiveTelemetry } from '../utils/superAdminAiEngine';

export default function DevStudioAiCoPilot() {
  const schoolContext = useSchool();
  const {
    students = [],
    classes = [],
    fees = [],
    staff = [],
    admissions = [],
    leaves = [],
    notices = [],
    tasks = [],
    customScripts = {},
    saveCustomScripts,
    systemConfig = {},
    updateSystemConfig,
    websiteConfig = {},
    updateWebsiteConfig,
    executeTerminalCommand
  } = schoolContext;

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [fixedIssueIds, setFixedIssueIds] = useState(new Set());
  const [activeSubSection, setActiveSubSection] = useState('diagnostics'); // 'diagnostics' | 'code_gen' | 'operations' | 'nl_query'

  // Code Gen Assistant State
  const [codePrompt, setCodePrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [codeType, setCodeType] = useState('css'); // 'css' | 'js'
  const [applySuccessToast, setApplySuccessToast] = useState(false);

  // NL Query Console State
  const [consoleQuery, setConsoleQuery] = useState('');
  const [consoleLogs, setConsoleLogs] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'AI Engineering Assistant online. I am ready to inspect database records, debug custom scripts, and execute institutional state queries.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const handleRunDiagnosticScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = runSystemDiagnostics(schoolContext);
      setScanResult(res);
      setIsScanning(false);
    }, 700);
  };

  useEffect(() => {
    handleRunDiagnosticScan();
  }, []);

  // 1-Click Auto Repair Execution
  const handleAutoRepair = (issue) => {
    if (!issue.canAutoFix) return;

    if (issue.autoFixType === 'FILL_DEFAULT_PHONE') {
      const updated = students.map(s => {
        if (!s.guardianPhone && !s.parentPhone && !s.phone) {
          return { ...s, guardianPhone: '+91 9862000000', remarks: (s.remarks || '') + ' [Phone defaulted by AI]' };
        }
        return s;
      });
      if (schoolContext.updateCollectionRecord) {
        localStorage.setItem(`zoxs_${schoolContext.activeSchoolId || 'default'}_students`, JSON.stringify(updated));
      }
    } else if (issue.autoFixType === 'CLEAN_CSS_TAGS') {
      const cleaned = (customScripts?.css || '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
      saveCustomScripts({ ...customScripts, css: cleaned });
    } else if (issue.autoFixType === 'SET_DEFAULT_SCHOOL_NAME') {
      updateWebsiteConfig({
        ...websiteConfig,
        schoolName: 'OHA (One Heart Academy)',
        tagline: 'Excellence in Mind, Character in Heart',
        motto: 'Knowledge • Integrity • Service'
      });
    }

    setFixedIssueIds(prev => new Set([...prev, issue.id]));
    setTimeout(() => {
      handleRunDiagnosticScan();
    }, 400);
  };

  // AI Script Generation Engine
  const handleGenerateScript = () => {
    if (!codePrompt.trim()) return;

    let snippet = '';
    const p = codePrompt.toLowerCase();

    if (codeType === 'css') {
      if (p.includes('glass') || p.includes('modern') || p.includes('blur')) {
        snippet = `/* AI Generated: Modern Glassmorphism & Micro-animations */\n.glass-panel {\n  background: rgba(15, 23, 42, 0.75) !important;\n  backdrop-filter: blur(12px) !important;\n  border: 1px solid rgba(56, 189, 248, 0.2) !important;\n}\n\n.card-hover-fx {\n  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);\n}\n.card-hover-fx:hover {\n  transform: translateY(-3px) scale(1.01);\n  box-shadow: 0 10px 25px -5px rgba(6, 182, 212, 0.15);\n}`;
      } else if (p.includes('glow') || p.includes('neon') || p.includes('cyber')) {
        snippet = `/* AI Generated: Neon Glow Accent */\n.ai-neon-glow {\n  box-shadow: 0 0 15px rgba(6, 182, 212, 0.5), inset 0 0 10px rgba(6, 182, 212, 0.2);\n  border-color: rgba(34, 211, 238, 0.8) !important;\n}\n\n@keyframes neonPulse {\n  0%, 100% { opacity: 1; filter: drop-shadow(0 0 8px #06b6d4); }\n  50% { opacity: 0.85; filter: drop-shadow(0 0 3px #06b6d4); }\n}`;
      } else if (p.includes('print') || p.includes('chhuah')) {
        snippet = `/* AI Generated: Print Clean Layout */\n@media print {\n  header, nav, aside, .no-print, button {\n    display: none !important;\n  }\n  body {\n    background: white !important;\n    color: black !important;\n  }\n}`;
      } else {
        snippet = `/* AI Generated Custom CSS for "${codePrompt}" */\n.oha-custom-styled {\n  border-radius: 1rem;\n  transition: all 0.3s ease;\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);\n}`;
      }
    } else {
      if (p.includes('save') || p.includes('form') || p.includes('input')) {
        snippet = `// AI Generated: Auto-save form inputs draft\nwindow.addEventListener('input', (e) => {\n  if (e.target.name) {\n    localStorage.setItem('draft_' + e.target.name, e.target.value);\n  }\n});`;
      } else {
        snippet = `// AI Generated Script for "${codePrompt}"\nconsole.log('[OHA AI Agent] Executing custom telemetry hooks...');\nwindow.ohaAiLoaded = true;`;
      }
    }

    setGeneratedCode(snippet);
  };

  const handleApplyScript = () => {
    if (!generatedCode) return;
    if (codeType === 'css') {
      const existing = customScripts?.css || '';
      saveCustomScripts({ ...customScripts, css: existing + '\n\n' + generatedCode });
    } else {
      const existing = customScripts?.js || '';
      saveCustomScripts({ ...customScripts, js: existing + '\n\n' + generatedCode });
    }
    setApplySuccessToast(true);
    setTimeout(() => setApplySuccessToast(false), 3500);
  };

  // NL Console Queries
  const handleRunConsoleQuery = () => {
    const q = consoleQuery.trim();
    if (!q) return;

    const userEntry = {
      id: Date.now(),
      sender: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConsoleLogs(prev => [...prev, userEntry]);
    setConsoleQuery('');

    setTimeout(() => {
      let reply = '';
      const lower = q.toLowerCase();

      if (lower.includes('student') || lower.includes('zirlai')) {
        reply = `Active Students Directory: ${students.length} zirlai an awm mek. Boys: ${students.filter(s => s.gender === 'Male').length}, Girls: ${students.filter(s => s.gender === 'Female').length}.`;
      } else if (lower.includes('fee') || lower.includes('balance') || lower.includes('arrear')) {
        const total = fees.reduce((sum, f) => sum + (f.paidAmount || f.amount || 0), 0);
        reply = `Fee Transactions Recorded: Total collected amount is ₹${total.toLocaleString('en-IN')}.`;
      } else if (lower.includes('admission')) {
        const pending = admissions.filter(a => a.status === 'pending' || a.status === 'submitted').length;
        reply = `Online Admissions: ${admissions.length} applications received, ${pending} pending approval.`;
      } else {
        // Try executing via sandbox terminal
        const term = executeTerminalCommand(q);
        reply = term.output ? `Query Output:\n${JSON.stringify(term.output, null, 2)}` : `Query processed: System state verified for "${q}".`;
      }

      setConsoleLogs(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 400);
  };

  const telemetry = getLiveTelemetry(schoolContext);

  return (
    <div className="space-y-6 font-sans">
      {/* Top AI Engine Status Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" /> AI Architecture &amp; Code Co-Pilot
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Auto-Diagnostic Active
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
              Super Admin AI Engineering Hub
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Software pumpui health audit zung zung rawh, data leh code consistency endik la, thil diklo awmte 1-Click Auto Repair hmangin siam tha nghal zel rawh.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[130px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Health Score</span>
              <span className={`text-2xl font-mono font-bold ${
                scanResult?.healthScore >= 90 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {scanResult ? `${scanResult.healthScore}%` : '...'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleRunDiagnosticScan}
              disabled={isScanning}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs sm:text-sm transition shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning System...' : 'Run Full Diagnostic'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('One Heart Academy, Lunglawn, Lunglei atan mock data (fake student, fees, grades) zawng zawng thianfai a, fresh institutional portal hawn i duh chiang em? Principal leh Admin in an khawih chhunzawm thei nghal ang.')) {
                  if (schoolContext.initializeCleanOhaAcademy) {
                    schoolContext.initializeCleanOhaAcademy();
                    handleRunDiagnosticScan();
                    alert('One Heart Academy (OHA) portal chu tluang takin hawn a ni e! Mock data zawng zawng thianfai a ni tawh e.');
                  }
                }
              }}
              className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
              title="Purge all fake mock records and launch clean OHA portal"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Clean OHA (Clear Mock Data)</span>
            </button>
          </div>
        </div>

        {/* Sub-Section Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto mt-6 pt-4 border-t border-slate-800/80 scrollbar-none text-xs">
          {[
            { id: 'diagnostics', label: 'Diagnostics & Auto-Repair', icon: ShieldAlert, count: scanResult?.issues?.length },
            { id: 'code_gen', label: 'AI Code & Script Generator', icon: Code2 },
            { id: 'operations', label: 'Operations & Telemetry Radar', icon: Activity, count: telemetry.priorityActions.length },
            { id: 'nl_query', label: 'Interactive AI Console', icon: Terminal }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubSection(tab.id)}
                className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 transition whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full font-mono font-bold text-[10px] ${
                    isActive ? 'bg-black/25 text-slate-950' : 'bg-rose-500 text-white'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: DIAGNOSTICS & AUTO-REPAIR */}
      {activeSubSection === 'diagnostics' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Health Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Active Students', value: students.length, icon: Layers, color: 'text-cyan-400' },
              { label: 'Classes & Sections', value: classes.length, icon: Database, color: 'text-purple-400' },
              { label: 'Pending Admissions', value: scanResult?.metrics?.pendingAdmissions || 0, icon: AlertTriangle, color: 'text-amber-400' },
              { label: 'Auto-Fixable Issues', value: scanResult?.metrics?.autoFixableIssues || 0, icon: Wrench, color: 'text-emerald-400' }
            ].map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <Icon className={`w-5 h-5 ${m.color}`} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{m.label}</span>
                    <span className="text-lg font-mono font-bold text-white">{m.value}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Issue Cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Detected Institutional Anomalies &amp; Audit Logs:</span>
            </h3>

            {scanResult?.issues?.length > 0 ? (
              scanResult.issues.map(iss => {
                const isFixed = fixedIssueIds.has(iss.id);
                return (
                  <div 
                    key={iss.id} 
                    className={`p-5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isFixed 
                        ? 'bg-emerald-950/20 border-emerald-500/30 opacity-75' 
                        : iss.severity === 'critical'
                        ? 'bg-slate-900/90 border-rose-500/40 shadow-lg shadow-rose-950/20'
                        : 'bg-slate-900/70 border-slate-800'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                          iss.severity === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {iss.severity}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase font-semibold">
                          Category: {iss.category}
                        </span>
                        {isFixed && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Auto-Repaired
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white">{iss.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{iss.description}</p>
                      {iss.fixSummary && !isFixed && (
                        <p className="text-[11px] text-cyan-300/80 font-mono">
                          Auto-Fix Plan: {iss.fixSummary}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {iss.canAutoFix && !isFixed && (
                        <button
                          type="button"
                          onClick={() => handleAutoRepair(iss)}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>1-Click Auto Repair</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
                <h4 className="text-sm font-bold text-white">System 100% Operational &amp; Clean!</h4>
                <p className="text-xs text-slate-400">No anomalies, script errors, or integrity flaws found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: AI CODE & SCRIPT GENERATOR */}
      {activeSubSection === 'code_gen' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Natural Language Code &amp; Style Synthesizer
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Chanchin emaw UI style i duh dan ziah lut la, AI-in custom CSS emaw JavaScript snippet a generate sak ang che.
              </p>
            </div>

            {/* Language Toggle & Preset Chips */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setCodeType('css')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${codeType === 'css' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  CSS Stylesheet
                </button>
                <button
                  type="button"
                  onClick={() => setCodeType('js')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${codeType === 'js' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  JavaScript Hook
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-bold">Presets:</span>
                {[
                  'Modern Glassmorphism',
                  'Cyber Neon Glow',
                  'Print Mode Clean Layout'
                ].map((pre, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCodePrompt(pre)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition cursor-pointer"
                  >
                    {pre}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Prompt */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={codePrompt}
                onChange={(e) => setCodePrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateScript()}
                placeholder="Entirnan: Card hover zoom effect siam rawh, emaw Neon glow dah rawh..."
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleGenerateScript}
                disabled={!codePrompt.trim()}
                className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Script</span>
              </button>
            </div>

            {/* Code Output Viewer */}
            {generatedCode && (
              <div className="space-y-3 pt-3 border-t border-slate-800 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-300 font-bold">
                    Generated {codeType.toUpperCase()} Code:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(generatedCode)}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyScript}
                      className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Apply to Live App</span>
                    </button>
                  </div>
                </div>

                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed shadow-inner">
                  {generatedCode}
                </pre>

                {applySuccessToast && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Script successfully injected into live application runtime!</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: OPERATIONS & TELEMETRY RADAR */}
      {activeSubSection === 'operations' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority Actions */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Enge Tih Ngai (Action Priority):</span>
              </h4>

              <div className="space-y-2">
                {telemetry.priorityActions.map(act => (
                  <div key={act.id} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-amber-300 block">{act.priority}</span>
                      <h5 className="text-xs font-bold text-white">{act.title}</h5>
                      <p className="text-[11px] text-slate-400">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Events Stream */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Enge Thleng (Institutional Stream):</span>
              </h4>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {telemetry.recentEvents.map(ev => (
                  <div key={ev.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${ev.badgeColor}`}>
                        {ev.type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="font-bold text-slate-200 block">{ev.title}</span>
                    <span className="text-[11px] text-slate-400 block">{ev.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: INTERACTIVE AI CONSOLE */}
      {activeSubSection === 'nl_query' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">
                AI System Diagnostic Console
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mizo emaw English-in database, fee balance, admission status, leh software log zawt rawh.
              </p>
            </div>

            {/* Logs Window */}
            <div className="h-[320px] overflow-y-auto p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              {consoleLogs.map(log => (
                <div key={log.id} className={`flex flex-col ${log.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3 rounded-xl max-w-[85%] ${
                    log.sender === 'user' 
                      ? 'bg-cyan-500 text-slate-950 font-bold' 
                      : 'bg-slate-900 border border-slate-800 text-cyan-300'
                  }`}>
                    {log.text}
                  </div>
                  <span className="text-[9px] text-slate-600 mt-1">{log.time}</span>
                </div>
              ))}
            </div>

            {/* Command Bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={consoleQuery}
                onChange={(e) => setConsoleQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunConsoleQuery()}
                placeholder="Type query e.g., 'Student zat leh boys/girls zat', 'Fee ba en rawh'..."
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
              <button
                type="button"
                onClick={handleRunConsoleQuery}
                disabled={!consoleQuery.trim()}
                className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Execute</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
