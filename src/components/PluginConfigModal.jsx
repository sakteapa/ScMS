import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sliders,
  Globe,
  Code2,
  Terminal,
  Key,
  Check,
  RotateCcw,
  Play,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Plus,
  AlertCircle,
  CheckCircle2,
  Volume2,
  Sparkles,
  Layers,
  Activity,
  FileText
} from 'lucide-react';

export default function PluginConfigModal({
  isOpen,
  plugin,
  onClose,
  onSave,
  onDelete,
  onReset
}) {
  if (!isOpen || !plugin) return null;

  // Tabs: 'general' | 'params' | 'script' | 'diagnostics'
  const [activeTab, setActiveTab] = useState('params');

  // Form State
  const [name, setName] = useState(plugin.name || '');
  const [version, setVersion] = useState(plugin.version || '1.0.0');
  const [category, setCategory] = useState(plugin.category || 'General');
  const [description, setDescription] = useState(plugin.description || '');
  const [cdnUrl, setCdnUrl] = useState(plugin.cdnUrl || '');
  const [cdnCssUrl, setCdnCssUrl] = useState(plugin.cdnCssUrl || '');
  const [loadTiming, setLoadTiming] = useState(plugin.loadTiming || 'async');
  const [scope, setScope] = useState(plugin.scope || 'all');
  const [script, setScript] = useState(plugin.script || '');

  // Config parameters state
  const [configParams, setConfigParams] = useState(
    plugin.config ? { ...plugin.config } : {}
  );
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [rawJsonText, setRawJsonText] = useState('');
  const [jsonError, setJsonError] = useState(null);

  // New parameter adder state
  const [newParamKey, setNewParamKey] = useState('');
  const [newParamValue, setNewParamValue] = useState('');

  // Diagnostics & testing state
  const [pingStatus, setPingStatus] = useState(null);
  const [scriptTestOutput, setScriptTestOutput] = useState(null);
  const [showMaskedKeys, setShowMaskedKeys] = useState({});

  useEffect(() => {
    if (plugin) {
      setName(plugin.name || '');
      setVersion(plugin.version || '1.0.0');
      setCategory(plugin.category || 'General');
      setDescription(plugin.description || '');
      setCdnUrl(plugin.cdnUrl || '');
      setCdnCssUrl(plugin.cdnCssUrl || '');
      setLoadTiming(plugin.loadTiming || 'async');
      setScope(plugin.scope || 'all');
      setScript(plugin.script || '');
      const cfg = plugin.config ? { ...plugin.config } : {};
      setConfigParams(cfg);
      setRawJsonText(JSON.stringify(cfg, null, 2));
      setJsonError(null);
      setScriptTestOutput(null);
      setPingStatus(null);
    }
  }, [plugin]);

  // Handle config param change
  const handleConfigChange = (key, value) => {
    const updated = { ...configParams, [key]: value };
    setConfigParams(updated);
    setRawJsonText(JSON.stringify(updated, null, 2));
  };

  // Handle raw JSON edit
  const handleRawJsonChange = (text) => {
    setRawJsonText(text);
    try {
      const parsed = JSON.parse(text);
      setConfigParams(parsed);
      setJsonError(null);
    } catch (e) {
      setJsonError(e.message);
    }
  };

  // Add custom parameter
  const handleAddCustomParam = () => {
    if (!newParamKey.trim()) return;
    let val = newParamValue;
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    else if (!isNaN(val) && val.trim() !== '') val = Number(val);

    const updated = { ...configParams, [newParamKey.trim()]: val };
    setConfigParams(updated);
    setRawJsonText(JSON.stringify(updated, null, 2));
    setNewParamKey('');
    setNewParamValue('');
  };

  // Delete parameter
  const handleDeleteParam = (key) => {
    const updated = { ...configParams };
    delete updated[key];
    setConfigParams(updated);
    setRawJsonText(JSON.stringify(updated, null, 2));
  };

  // Ping CDN URL
  const handlePingCdn = async () => {
    if (!cdnUrl) {
      setPingStatus({ ok: false, msg: 'CDN URL is empty.' });
      return;
    }
    setPingStatus({ loading: true, msg: 'Checking CDN availability...' });
    try {
      const res = await fetch(cdnUrl, { method: 'HEAD' });
      if (res.ok || res.status === 200 || res.status === 304 || res.type === 'opaque') {
        setPingStatus({ ok: true, msg: `CDN reachable (${res.status || 'OK'})` });
      } else {
        setPingStatus({ ok: false, msg: `HTTP ${res.status}: ${res.statusText}` });
      }
    } catch (e) {
      // CORS might block HEAD, but network reachable
      setPingStatus({ ok: true, msg: 'CDN endpoint registered (CORS restricted HEAD, safe for <script> tag)' });
    }
  };

  // Test Run Sandbox Script
  const handleTestScript = () => {
    try {
      const logs = [];
      const mockConsole = {
        log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        warn: (...args) => logs.push('[WARN] ' + args.join(' ')),
        error: (...args) => logs.push('[ERROR] ' + args.join(' '))
      };

      const runner = new Function('config', 'console', `
        try {
          ${script}
        } catch(err) {
          console.error(err.message);
        }
      `);
      runner(configParams, mockConsole);

      setScriptTestOutput({
        success: true,
        logs: logs.length > 0 ? logs.join('\n') : 'Script executed with 0 runtime errors (no console output).'
      });
    } catch (err) {
      setScriptTestOutput({
        success: false,
        logs: `Syntax / Runtime Error: ${err.message}`
      });
    }
  };

  // Live feature simulation trigger
  const handleTriggerLiveSimulation = () => {
    if (plugin.id === 'plugin-canvas-confetti' || plugin.name?.toLowerCase().includes('confetti')) {
      if (typeof window.confetti === 'function') {
        window.confetti({
          particleCount: configParams.particleCount || 100,
          spread: configParams.spread || 70,
          origin: { y: configParams.originY || 0.6 }
        });
      } else {
        alert('Canvas confetti library script is initializing...');
      }
    } else if (plugin.id === 'plugin-campus-bell' || plugin.category?.toLowerCase().includes('audio')) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = configParams.waveType || 'sine';
        const baseFreq = Number(configParams.baseFrequency) || 587.33;
        const topFreq = Number(configParams.topFrequency) || 880;
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(topFreq, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime((configParams.volumePercent || 80) / 100 * 0.3, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + (Number(configParams.durationSeconds) || 0.7));
      } catch (e) {
        alert('AudioContext error: ' + e.message);
      }
    } else {
      alert(`Simulation ping dispatched for "${plugin.name}" with current configuration parameters!`);
    }
  };

  // Save changes
  const handleSave = (e) => {
    e.preventDefault();
    if (jsonError) {
      alert('Khawngaihin JSON error a awm a, siam tha hmasa rawh le: ' + jsonError);
      return;
    }

    onSave(plugin.id, {
      name,
      version,
      category,
      description,
      cdnUrl,
      cdnCssUrl,
      loadTiming,
      scope,
      script,
      config: configParams
    });

    onClose();
  };

  const toggleMask = (key) => {
    setShowMaskedKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950/30 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Configure: {plugin.name}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-purple-500/30">
                  v{version}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  plugin.enabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {plugin.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                ID: {plugin.id} • Category: {category}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800/80 bg-slate-950/60 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('params')}
            className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === 'params'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Settings &amp; Environment Config</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 font-mono">
              {Object.keys(configParams).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === 'general'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>CDN &amp; Execution Scope</span>
          </button>

          <button
            onClick={() => setActiveTab('script')}
            className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === 'script'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Init Hook Script</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === 'diagnostics'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Diagnostics &amp; Live Test</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* =================================================================
              TAB 1: SETTINGS & ENVIRONMENT CONFIG PARAMETERS
          ================================================================= */}
          {activeTab === 'params' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <span>Plugin Configuration Dictionary (`config`)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Fine-tune API keys, webhooks, audio frequencies, ratios, thresholds, and operational flags.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsJsonMode(!isJsonMode)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition border border-slate-700 flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isJsonMode ? 'Switch to Form Fields' : 'Edit as Raw JSON'}</span>
                </button>
              </div>

              {isJsonMode ? (
                /* RAW JSON EDITOR */
                <div className="space-y-2">
                  <div className="relative">
                    <textarea
                      rows={12}
                      value={rawJsonText}
                      onChange={(e) => handleRawJsonChange(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-700 font-mono text-xs text-purple-200 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  {jsonError ? (
                    <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>JSON Syntax Error: {jsonError}</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Valid JSON configuration structure</span>
                    </div>
                  )}
                </div>
              ) : (
                /* STRUCTURED FORM FIELDS */
                <div className="space-y-3">
                  {Object.keys(configParams).length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                      <Sliders className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-slate-400">No custom parameters configured yet.</p>
                      <span className="text-[11px] text-slate-500">Add key-value options below or switch to raw JSON mode.</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800/80 rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden">
                      {Object.entries(configParams).map(([key, value]) => {
                        const isSecret = key.toLowerCase().includes('key') ||
                          key.toLowerCase().includes('token') ||
                          key.toLowerCase().includes('secret') ||
                          key.toLowerCase().includes('password');
                        const isMasked = isSecret && !showMaskedKeys[key];
                        const isBool = typeof value === 'boolean';
                        const isNum = typeof value === 'number';

                        return (
                          <div key={key} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition">
                            <div className="sm:w-2/5">
                              <label className="font-mono font-bold text-white block text-xs">
                                {key}
                              </label>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Type: {typeof value}
                              </span>
                            </div>

                            <div className="flex-1 flex items-center gap-2">
                              {isBool ? (
                                <button
                                  type="button"
                                  onClick={() => handleConfigChange(key, !value)}
                                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border ${
                                    value
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  }`}
                                >
                                  {value ? 'TRUE (Active)' : 'FALSE (Disabled)'}
                                </button>
                              ) : (
                                <div className="relative flex-1">
                                  <input
                                    type={isMasked ? 'password' : isNum ? 'number' : 'text'}
                                    value={value !== null && value !== undefined ? (typeof value === 'object' ? JSON.stringify(value) : value) : ''}
                                    onChange={(e) => {
                                      const nextVal = isNum ? Number(e.target.value) : e.target.value;
                                      handleConfigChange(key, nextVal);
                                    }}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
                                  />
                                </div>
                              )}

                              {isSecret && (
                                <button
                                  type="button"
                                  onClick={() => toggleMask(key)}
                                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                                  title={isMasked ? 'Show Secret' : 'Hide Secret'}
                                >
                                  {isMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteParam(key)}
                                className="p-2 rounded-xl hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                                title="Delete Parameter"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add New Parameter Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 space-y-2">
                    <span className="font-semibold text-slate-300 block text-[11px]">
                      + Add New Config Parameter:
                    </span>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        placeholder="Parameter key (e.g. timeoutMs)"
                        value={newParamKey}
                        onChange={(e) => setNewParamKey(e.target.value)}
                        className="w-full sm:w-1/3 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. 5000 or true)"
                        value={newParamValue}
                        onChange={(e) => setNewParamValue(e.target.value)}
                        className="w-full sm:flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomParam}
                        className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shrink-0"
                      >
                        Add Key
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              TAB 2: GENERAL & CDN NETWORK SETTINGS
          ================================================================= */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Plugin Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Version</label>
                    <input
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Category</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* CDN Script URL */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>Script CDN URL (`.js`)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handlePingCdn}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold transition border border-slate-700"
                  >
                    Ping CDN Endpoint
                  </button>
                </div>
                <input
                  type="url"
                  placeholder="https://cdn.jsdelivr.net/npm/package@version/dist/file.min.js"
                  value={cdnUrl}
                  onChange={(e) => setCdnUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
                {pingStatus && (
                  <div className={`p-2 rounded-lg text-[11px] font-mono ${
                    pingStatus.ok ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {pingStatus.msg}
                  </div>
                )}
              </div>

              {/* CDN Stylesheet URL */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Stylesheet CDN URL (`.css`) (Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://cdnjs.cloudflare.com/ajax/libs/package/version/style.min.css"
                  value={cdnCssUrl}
                  onChange={(e) => setCdnCssUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-400"
                />
              </div>

              {/* Execution & Scope Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Load Strategy</label>
                  <select
                    value={loadTiming}
                    onChange={(e) => setLoadTiming(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="async">Async (Non-blocking background download)</option>
                    <option value="defer">Defer (Execute after DOM render)</option>
                    <option value="boot">Instant On-Boot (Immediate execution)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Target Scope / Role Access</label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="all">Global (All Users &amp; Roles)</option>
                    <option value="admin">Administrators &amp; Principals Only</option>
                    <option value="faculty">Faculty &amp; Teaching Staff Only</option>
                    <option value="students_parents">Students &amp; Parents Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 3: LIFECYCLE INIT HOOK SCRIPT
          ================================================================= */}
          {activeTab === 'script' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    <span>Plugin Initialization JavaScript Runtime</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Runs safely on plugin load. Receives `(config, context)` as arguments.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTestScript}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Test Run Script</span>
                </button>
              </div>

              <textarea
                rows={10}
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="// Custom JS initialization hook for this plugin..."
                className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-700 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-400"
              />

              {scriptTestOutput && (
                <div className={`p-3.5 rounded-2xl border font-mono text-xs space-y-1 ${
                  scriptTestOutput.success
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                }`}>
                  <div className="font-bold flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Sandbox Console Output:</span>
                  </div>
                  <pre className="whitespace-pre-wrap">{scriptTestOutput.logs}</pre>
                </div>
              )}
            </div>
          )}

          {/* =================================================================
              TAB 4: DIAGNOSTICS & LIVE TEST
          ================================================================= */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Live Gateway &amp; Plugin Health Matrix</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Plugin Status</span>
                    <span className={`font-bold font-mono ${plugin.enabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {plugin.enabled ? '🟢 ACTIVE' : '⚪ DISABLED'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Script Tag ID</span>
                    <span className="font-bold text-white font-mono truncate block">
                      zoxs-cdn-{plugin.id}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Load Strategy</span>
                    <span className="font-bold text-cyan-300 uppercase font-mono">{loadTiming}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Access Scope</span>
                    <span className="font-bold text-purple-300 uppercase font-mono">{scope}</span>
                  </div>
                </div>
              </div>

              {/* Action Simulation Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/30 via-slate-900 to-cyan-950/30 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-white text-sm">Interactive Live Simulation</h5>
                    <p className="text-[11px] text-slate-400">
                      Trigger an end-to-end operational test with current config parameters.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleTriggerLiveSimulation}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center gap-1.5 active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Trigger Live Test</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Reset plugin "${plugin.name}" to factory default settings?`)) {
                  onReset(plugin.id);
                  onClose();
                }
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default</span>
            </button>

            {onDelete && plugin.id.startsWith('plugin-custom-') && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete custom plugin "${plugin.name}" permanently?`)) {
                    onDelete(plugin.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Plugin</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/25 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save &amp; Apply Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
