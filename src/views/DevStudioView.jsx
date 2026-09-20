import React, { useState } from 'react';
import { 
  Code2, 
  Terminal, 
  Database, 
  Blocks, 
  Palette, 
  Play, 
  Save, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Sparkles, 
  Sliders, 
  FileCode, 
  ExternalLink,
  ShieldCheck,
  Search,
  Eye,
  Cloud,
  CloudUpload,
  CloudDownload,
  Wifi,
  WifiOff,
  Link2,
  Lock,
  Zap,
  RotateCcw,
  Server,
  Smartphone,
  Send,
  MessageSquare,
  Radio,
  Bell,
  Video,
  Building2,
  Shield,
  HeartPulse,
  Package,
  Calendar,
  GraduationCap,
  Utensils,
  BookOpen,
  CreditCard,
  Check,
  Globe,
  QrCode,
  Phone,
  Mail,
  MapPin,
  Clock,
  Award,
  PenTool,
  FileCheck,
  DollarSign
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import PluginConfigModal from '../components/PluginConfigModal';
import WebsiteEditorModal from '../components/WebsiteEditorModal';
import AcademicCenterSetupWizardModal from '../components/AcademicCenterSetupWizardModal';

export default function DevStudioView() {
  const { user } = useAuth();
  const {
    customScripts,
    saveCustomScripts,
    plugins,
    togglePlugin,
    addPlugin,
    updatePlugin,
    deletePlugin,
    resetPluginConfig,
    systemConfig,
    updateSystemConfig,
    classes,
    students,
    fees,
    grades,
    staff,
    payroll,
    libraryBooks,
    notices,
    timetables,
    updateCollectionRecord,
    addCollectionRecord,
    deleteCollectionRecord,
    exportDatabaseSnapshot,
    restoreDatabaseSnapshot,
    executeTerminalCommand,
    // Firebase Cloud Sync
    isSyncing,
    lastSyncTime,
    isOfflinePersistenceActive,
    firebaseSyncStatus,
    testFirebaseConnection,
    syncToFirestore,
    pullFromFirestore,
    // Gateway
    gatewayConfig,
    updateGatewayConfig,
    sendSmsAlert,
    sendWhatsAppAlert,
    requestPushPermission,
    triggerNativePush,
    // All Institutional Module Configs
    clinicConfig,
    updateClinicConfig,
    visitorConfig,
    updateVisitorConfig,
    inventoryConfig,
    updateInventoryConfig,
    ptmConfig,
    updatePtmConfig,
    alumniConfig,
    updateAlumniConfig,
    canteenConfig,
    updateCanteenConfig,
    studyConfig,
    updateStudyConfig,
    sealConfig,
    updateSealConfig,
    paymentConfig,
    updatePaymentConfig,
    setActivePaymentGateway,
    updateGatewayDetails,
    liveMediaConfig,
    updateLiveMediaConfig,
    siblingPolicy,
    configureSiblingDiscountPolicy,
    websiteConfig,
    updateWebsiteConfig
  } = useSchool();

  const [activeTab, setActiveTab] = useState('code'); // 'code', 'plugins', 'database', 'branding', 'terminal', 'cloud', 'gateways'
  const [configCategory, setConfigCategory] = useState('all');
  const [configSavedToast, setConfigSavedToast] = useState(false);
  const [isDevWebsiteEditorOpen, setIsDevWebsiteEditorOpen] = useState(false);
  const [testSmsPhone, setTestSmsPhone] = useState('9862000000');
  const [testSmsMsg, setTestSmsMsg] = useState('Mizoram School System: System test alert for parents and faculty.');
  const [testSmsLoading, setTestSmsLoading] = useState(false);
  const [testSmsStatus, setTestSmsStatus] = useState(null);

  const handleSendTest = async (type = 'sms') => {
    setTestSmsLoading(true);
    setTestSmsStatus(null);
    try {
      if (type === 'whatsapp') {
        await sendWhatsAppAlert(testSmsPhone, testSmsMsg);
      } else {
        await sendSmsAlert(testSmsPhone, testSmsMsg, 'sms');
      }
      setTestSmsStatus({ success: true, message: `Dispatched ${type.toUpperCase()} to +91 ${testSmsPhone} successfully!` });
    } catch (err) {
      setTestSmsStatus({ success: false, message: 'Failed: ' + err.message });
    } finally {
      setTestSmsLoading(false);
      setTimeout(() => setTestSmsStatus(null), 4000);
    }
  };
  const [selectedScriptType, setSelectedScriptType] = useState('css'); // 'css', 'js', 'head'
  const [cssCode, setCssCode] = useState(customScripts?.css || '');
  const [jsCode, setJsCode] = useState(customScripts?.js || '');
  const [headCode, setHeadCode] = useState(customScripts?.head || '');
  const [saveStatus, setSaveStatus] = useState(null);

  // Plugins state
  const [selectedPluginForConfig, setSelectedPluginForConfig] = useState(null);
  const [isAddPluginModalOpen, setIsAddPluginModalOpen] = useState(false);
  const [newPluginForm, setNewPluginForm] = useState({
    name: '',
    version: '1.0.0',
    cdnUrl: '',
    category: 'UI & Tools',
    description: '',
    script: ''
  });

  // Database Explorer state
  const [selectedCollection, setSelectedCollection] = useState('students');
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [recordJsonDraft, setRecordJsonDraft] = useState('');
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [newRecordJson, setNewRecordJson] = useState('{\n  "name": "Sample Entry"\n}');
  const [dbMessage, setDbMessage] = useState(null);

  // Terminal state
  const [terminalInput, setTerminalInput] = useState('// Access sandboxed db collections\nconsole.log("Total enrolled students:", db.students.length);\nconsole.log("Total classes:", db.classes.length);\n\n// Return a result to display\n({ activeStudents: db.students.filter(s => s.attendanceRate >= 90).length })');
  const [terminalHistory, setTerminalHistory] = useState([]);

  // Cloud Sync — Firebase Credentials (top-level state, NOT inside JSX)
  const [localFirebaseCfg, setLocalFirebaseCfg] = useState(() => {
    try {
      const s = localStorage.getItem('zoxs_custom_firebase_config');
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  });

  const handleSaveFirebaseCfg = () => {
    localStorage.setItem('zoxs_custom_firebase_config', JSON.stringify(localFirebaseCfg));
    setTimeout(() => window.location.reload(), 400);
  };

  // Handle Save Scripts
  const handleSaveScripts = () => {
    const res = saveCustomScripts({
      css: cssCode,
      js: jsCode,
      head: headCode
    });
    setSaveStatus(res.message);
    setTimeout(() => setSaveStatus(null), 4000);
  };

  // Handle Add Custom Plugin
  const handleCreatePlugin = (e) => {
    e.preventDefault();
    if (!newPluginForm.name) return;
    addPlugin(newPluginForm);
    setNewPluginForm({
      name: '',
      version: '1.0.0',
      cdnUrl: '',
      category: 'UI & Tools',
      description: '',
      script: ''
    });
    setIsAddPluginModalOpen(false);
  };

  // Handle Database Collections Map
  const collectionDataMap = {
    students: { data: students, name: 'Students Directory' },
    classes: { data: classes, name: 'Academic Classes' },
    fees: { data: fees, name: 'Fee Ledger & Payments' },
    grades: { data: grades, name: 'Exams & Class Tests' },
    staff: { data: staff, name: 'Faculty & Staff' },
    payroll: { data: payroll, name: 'Payroll Ledger' },
    library_books: { data: libraryBooks, name: 'Library Catalog' },
    notices: { data: notices, name: 'Circulars & Notices' },
    timetables: { data: Object.entries(timetables).map(([cls, sched]) => ({ id: cls, ...sched })), name: 'Class Timetables' }
  };

  const currentCollectionItems = collectionDataMap[selectedCollection]?.data || [];
  const filteredCollectionItems = currentCollectionItems.filter(item => {
    if (!dbSearchQuery.trim()) return true;
    return JSON.stringify(item).toLowerCase().includes(dbSearchQuery.toLowerCase());
  });

  const handleOpenRecordEdit = (record) => {
    setEditingRecord(record);
    setRecordJsonDraft(JSON.stringify(record, null, 2));
  };

  const handleSaveRecordJson = () => {
    try {
      const parsed = JSON.parse(recordJsonDraft);
      const res = updateCollectionRecord(selectedCollection, editingRecord.id, parsed);
      if (res.success) {
        setDbMessage({ type: 'success', text: `Record ${editingRecord.id} successfully updated.` });
        setEditingRecord(null);
      } else {
        setDbMessage({ type: 'error', text: res.error || 'Failed to update record' });
      }
    } catch (e) {
      setDbMessage({ type: 'error', text: `Invalid JSON syntax: ${e.message}` });
    }
    setTimeout(() => setDbMessage(null), 4000);
  };

  const handleAddNewRecord = () => {
    try {
      const parsed = JSON.parse(newRecordJson);
      const res = addCollectionRecord(selectedCollection, parsed);
      if (res.success) {
        setDbMessage({ type: 'success', text: 'New document created successfully!' });
        setIsNewRecordModalOpen(false);
      } else {
        setDbMessage({ type: 'error', text: res.error || 'Failed to create record' });
      }
    } catch (e) {
      setDbMessage({ type: 'error', text: `Invalid JSON: ${e.message}` });
    }
    setTimeout(() => setDbMessage(null), 4000);
  };

  const handleDeleteRecord = (id) => {
    if (window.confirm(`Are you sure you want to delete record ${id}?`)) {
      deleteCollectionRecord(selectedCollection, id);
      setDbMessage({ type: 'success', text: `Record ${id} removed.` });
      setTimeout(() => setDbMessage(null), 3000);
    }
  };

  // Handle Restore JSON File
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        const res = restoreDatabaseSnapshot(json);
        if (res.success) {
          alert('Database snapshot restored successfully! Software updated.');
        } else {
          alert('Restore failed: ' + res.error);
        }
      } catch (err) {
        alert('Invalid JSON backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Run Terminal Sandbox Code
  const handleRunTerminal = () => {
    const outcome = executeTerminalCommand(terminalInput);
    setTerminalHistory(prev => [
      {
        id: Date.now(),
        command: terminalInput,
        timestamp: new Date().toLocaleTimeString(),
        ...outcome
      },
      ...prev
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Super Admin / Software Architect
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                In-App IDE Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Code2 className="w-8 h-8 text-purple-400" />
              Developer & Script Studio
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Khawvela external software (VS Code, Antigravity IDE) ngai tawh lovin browser chhung atangin software pumpui, CSS, JavaScript, plugins, database, leh resources khawih danglam zung zung rawh le.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setActiveTab('wizard')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition transform active:scale-95"
              title="Academic Center Master Setup (Step-by-Step)"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Academic Center Setup Wizard</span>
            </button>
            <button
              onClick={exportDatabaseSnapshot}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 flex items-center gap-2 transition"
              title="Download entire school database as JSON backup"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span>Full Snapshot JSON</span>
            </button>
            <label className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium shadow-lg shadow-purple-600/25 flex items-center gap-2 cursor-pointer transition">
              <Upload className="w-4 h-4" />
              <span>Restore Backup</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto mt-6 pt-4 border-t border-slate-800/80 scrollbar-none">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'wizard' 
                ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-lg shadow-indigo-600/25' 
                : 'text-amber-300 hover:text-white hover:bg-slate-800/50 border border-amber-500/30'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>Academic Center Setup</span>
            <span className="px-1.5 py-0.2 rounded-full text-xs bg-amber-400/20 text-amber-300 font-mono">
              Wizard
            </span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'code' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Code & Scripts Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('plugins')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'plugins' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Blocks className="w-4 h-4" />
            <span>Plugins & CDNs</span>
            <span className="px-1.5 py-0.2 rounded-full text-xs bg-purple-500/30 text-purple-200">
              {plugins?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'database' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database & Collections</span>
          </button>

          <button
            onClick={() => setActiveTab('branding')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'branding' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Master System Config</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'terminal' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>REPL Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'cloud'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Cloud Sync</span>
            {firebaseSyncStatus?.connected && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('gateways')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition shrink-0 ${
              activeTab === 'gateways'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>SMS & WhatsApp Gateway</span>
            {gatewayConfig?.smsProvider && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* TAB: ACADEMIC CENTER STEP-BY-STEP SETUP WIZARD */}
      {activeTab === 'wizard' && (
        <AcademicCenterSetupWizardModal
          inlineMode={true}
          onClose={() => setActiveTab('branding')}
        />
      )}

      {/* TAB: CLOUD SYNC — Superadmin Firebase wiring panel */}
      {activeTab === 'cloud' && (
        <div className="space-y-5">
          {/* Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`rounded-2xl border p-4 flex items-center gap-3 ${
              firebaseSyncStatus.connected
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-slate-900 border-slate-800'
            }`}>
              {firebaseSyncStatus.connected
                ? <Wifi className="w-5 h-5 text-emerald-400" />
                : <WifiOff className="w-5 h-5 text-slate-500" />}
              <div>
                <p className="text-xs font-bold text-white">{firebaseSyncStatus.connected ? 'Connected' : 'Not Connected'}</p>
                <p className="text-[10px] text-slate-400">Firebase Firestore</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex items-center gap-3">
              <CloudUpload className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-xs font-bold text-white">{firebaseSyncStatus.lastPushAt || '—'}</p>
                <p className="text-[10px] text-slate-400">Last Push to Cloud</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex items-center gap-3">
              <CloudDownload className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-xs font-bold text-white">{firebaseSyncStatus.lastPullAt || '—'}</p>
                <p className="text-[10px] text-slate-400">Last Pull from Cloud</p>
              </div>
            </div>
          </div>

          {/* Progress / Error Banner */}
          {firebaseSyncStatus.pushProgress && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-300 text-xs font-mono animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" /> {firebaseSyncStatus.pushProgress}
            </div>
          )}
          {firebaseSyncStatus.lastError && !firebaseSyncStatus.pushProgress && (
            <div className="flex items-start gap-2.5 px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {firebaseSyncStatus.lastError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Action Buttons */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" /> Sync Operations
              </h3>
              <p className="text-xs text-slate-400">
                Data hi kan <span className="text-white font-semibold">localStorage</span> atangin Firebase Firestore cloud-ah push theih, nge cloud atangin pull theih a ni. Collections 18 a sync a tih.
              </p>

              <div className="space-y-3">
                {/* Test Connection */}
                <button
                  onClick={testFirebaseConnection}
                  disabled={isSyncing}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  Test Firebase Connection
                </button>

                {/* Push to Cloud */}
                <button
                  onClick={syncToFirestore}
                  disabled={isSyncing}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-cyan-500/20 hover:opacity-90 transition disabled:opacity-50"
                >
                  {isSyncing
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : <CloudUpload className="w-4 h-4" />}
                  {isSyncing ? 'Syncing...' : 'Push Local → Cloud (Firestore)'}
                </button>

                {/* Pull from Cloud */}
                <button
                  onClick={pullFromFirestore}
                  disabled={isSyncing}
                  className="w-full px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-500/20 transition disabled:opacity-50"
                >
                  {isSyncing
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : <CloudDownload className="w-4 h-4" />}
                  Pull Cloud → Local (Overwrite)
                </button>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
                <div className="flex justify-between"><span>Offline Persistence</span><span className={isOfflinePersistenceActive ? 'text-emerald-400' : 'text-rose-400'}>{isOfflinePersistenceActive ? 'Active (IndexedDB)' : 'Inactive'}</span></div>
                <div className="flex justify-between"><span>Last local sync</span><span className="text-cyan-400 font-mono">{lastSyncTime}</span></div>
                <div className="flex justify-between"><span>Collections mapped</span><span className="text-white">18</span></div>
              </div>
            </div>

            {/* Firebase Config Quick-Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" /> Firebase Credentials
              </h3>
              <p className="text-xs text-slate-400">
                Heta credentials khawih a ni a, localStorage-ah save a tih. <span className="text-amber-300 font-semibold">Save → page reload → connection test</span> tih tur.
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Project ID', key: 'projectId', placeholder: 'my-school-app' },
                  { label: 'API Key', key: 'apiKey', placeholder: 'AIzaSy...' },
                  { label: 'Auth Domain', key: 'authDomain', placeholder: 'my-school-app.firebaseapp.com' },
                  { label: 'Storage Bucket', key: 'storageBucket', placeholder: 'my-school-app.appspot.com' },
                  { label: 'App ID', key: 'appId', placeholder: '1:123:web:abc' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">{f.label}</label>
                    <input
                      value={localFirebaseCfg[f.key] || ''}
                      onChange={e => setLocalFirebaseCfg(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                ))}
                <button
                  onClick={handleSaveFirebaseCfg}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Save className="w-3.5 h-3.5" /> Save Credentials & Reload
                </button>
              </div>
            </div>
          </div>

          {/* Collections Sync Status Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" /> Collections Sync Map (18 collections)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                'students', 'classes', 'fees', 'grades', 'staff', 'payroll',
                'library_books', 'notices', 'admissions', 'transport_routes', 'hostel_rooms',
                'clinic_records', 'visitors', 'inventory_assets', 'alumni',
                'canteen_wallets', 'canteen_transactions', 'leave_applications'
              ].map(col => (
                <div key={col} className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    firebaseSyncStatus.lastPushAt ? 'bg-emerald-400' : 'bg-slate-600'
                  }`} />
                  <span className="text-[10px] text-slate-300 font-mono truncate">{col}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: SMS & WHATSAPP GATEWAYS */}
      {activeTab === 'gateways' && (
        <div className="space-y-6">
          {/* Status Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase">{gatewayConfig?.smsProvider || 'Fast2SMS'}</p>
                <p className="text-[10px] text-slate-400">Active SMS Gateway</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{gatewayConfig?.lastSmsSentAt || 'Ready'}</p>
                <p className="text-[10px] text-slate-400">Last Outbound Alert</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{gatewayConfig?.smsDeliveryLog?.length || 0} Sent</p>
                <p className="text-[10px] text-slate-400">Total SMS Logged</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration Settings */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-rose-400" /> Gateway Provider Configuration
              </h3>
              <p className="text-xs text-slate-400">
                Wire third-party transactional SMS providers to enable real-world alerts for parents and faculty.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">Primary SMS Provider</label>
                  <select 
                    value={gatewayConfig?.smsProvider || 'fast2sms'} 
                    onChange={e => updateGatewayConfig({ smsProvider: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-rose-500"
                  >
                    <option value="fast2sms">Fast2SMS (India Standard - OTP & Quick SMS)</option>
                    <option value="twilio">Twilio Programmable SMS (Global)</option>
                    <option value="gupshup">Gupshup Enterprise Messaging</option>
                    <option value="custom">Custom Webhook Endpoint</option>
                  </select>
                </div>

                {gatewayConfig?.smsProvider === 'fast2sms' && (
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">Fast2SMS Authorization API Key</label>
                    <input 
                      type="password"
                      value={gatewayConfig?.fast2smsApiKey || ''}
                      onChange={e => updateGatewayConfig({ fast2smsApiKey: e.target.value })}
                      placeholder="Paste Fast2SMS authorization key..."
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                )}

                {gatewayConfig?.smsProvider === 'twilio' && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] text-slate-400 font-semibold block mb-1">Account SID</label>
                      <input 
                        value={gatewayConfig?.twilioSid || ''}
                        onChange={e => updateGatewayConfig({ twilioSid: e.target.value })}
                        placeholder="AC..."
                        className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 font-semibold block mb-1">Auth Token</label>
                      <input 
                        type="password"
                        value={gatewayConfig?.twilioAuthToken || ''}
                        onChange={e => updateGatewayConfig({ twilioAuthToken: e.target.value })}
                        placeholder="Auth token..."
                        className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 font-mono"
                      />
                    </div>
                  </div>
                )}

                {gatewayConfig?.smsProvider === 'custom' && (
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">Custom HTTP Webhook URL</label>
                    <input 
                      value={gatewayConfig?.customWebhookUrl || ''}
                      onChange={e => updateGatewayConfig({ customWebhookUrl: e.target.value })}
                      placeholder="https://api.myschool.in/sms-relay"
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 font-mono"
                    />
                  </div>
                )}

                {/* Agora RTC Video Gateway Credentials */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-cyan-400" /> Agora RTC Live Classroom Gateway
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                      {gatewayConfig?.agoraAppId ? 'Configured' : 'Default Sandbox'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Agora console (<span className="text-cyan-400">console.agora.io</span>) atangin App ID dah la, zirtirtu leh zirlai live classroom video gateway ah a thawk nghal ang.
                  </p>

                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">Agora App ID (32 characters)</label>
                    <input 
                      type="text"
                      value={gatewayConfig?.agoraAppId || ''}
                      onChange={e => updateGatewayConfig({ agoraAppId: e.target.value })}
                      placeholder="e.g. 98a76bc43210ef891234567890abcdef"
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">Agora App Certificate (Optional / Secure Token)</label>
                    <input 
                      type="password"
                      value={gatewayConfig?.agoraAppCertificate || ''}
                      onChange={e => updateGatewayConfig({ agoraAppCertificate: e.target.value })}
                      placeholder="App certificate..."
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>

                {/* Automation Toggles */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Automated Event Triggers</span>
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer">
                    <span className="text-xs text-slate-300">Clinic High Fever Warning (&gt;100.4°F)</span>
                    <input 
                      type="checkbox" 
                      checked={Boolean(gatewayConfig?.enableSmsFeverAlert)}
                      onChange={e => updateGatewayConfig({ enableSmsFeverAlert: e.target.checked })}
                      className="rounded accent-rose-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer">
                    <span className="text-xs text-slate-300">Fee Cashier Payment Receipt Confirmation</span>
                    <input 
                      type="checkbox" 
                      checked={Boolean(gatewayConfig?.enableSmsFeeReceipt)}
                      onChange={e => updateGatewayConfig({ enableSmsFeeReceipt: e.target.checked })}
                      className="rounded accent-rose-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer">
                    <span className="text-xs text-slate-300">Clinic Red Emergency SOS Broadcast</span>
                    <input 
                      type="checkbox" 
                      checked={Boolean(gatewayConfig?.enableSmsSosAlert)}
                      onChange={e => updateGatewayConfig({ enableSmsSosAlert: e.target.checked })}
                      className="rounded accent-rose-500"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Live Interactive Sandbox Dispatcher */}
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                  <Send className="w-4 h-4 text-cyan-400" /> Interactive Test Dispatcher Sandbox
                </h3>
                <p className="text-xs text-slate-400">
                  Test live delivery directly to any Indian 10-digit mobile number before activating school-wide.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">Recipient Mobile Number</label>
                    <div className="flex items-center">
                      <span className="px-3 py-2.5 bg-slate-800 border border-r-0 border-slate-700 text-slate-300 text-xs rounded-l-xl font-mono">+91</span>
                      <input 
                        type="text"
                        value={testSmsPhone}
                        onChange={e => setTestSmsPhone(e.target.value)}
                        placeholder="9862000000"
                        className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-r-xl px-3.5 py-2.5 focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">Message Body</label>
                    <textarea 
                      rows={3}
                      value={testSmsMsg}
                      onChange={e => setTestSmsMsg(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {testSmsStatus && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      testSmsStatus.success 
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' 
                        : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                    }`}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{testSmsStatus.message}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => handleSendTest('sms')}
                      disabled={testSmsLoading}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition disabled:opacity-50"
                    >
                      {testSmsLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5" />}
                      <span>Send SMS</span>
                    </button>

                    <button
                      onClick={() => handleSendTest('whatsapp')}
                      disabled={testSmsLoading}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                    >
                      {testSmsLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
                      <span>Send WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery Transmission Log */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> Recent Dispatch Ledger (Last 5)
                </h4>
                {(!gatewayConfig?.smsDeliveryLog || gatewayConfig.smsDeliveryLog.length === 0) ? (
                  <p className="text-xs text-slate-500 italic py-2">No messages dispatched yet. Use the test dispatcher above.</p>
                ) : (
                  <div className="space-y-2">
                    {gatewayConfig.smsDeliveryLog.slice(0, 5).map(log => (
                      <div key={log.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <p className="text-white font-mono text-[11px] font-bold">+91 {log.phone}</p>
                          <p className="text-[10px] text-slate-400 truncate">{log.message}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Delivered</span>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5">{log.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Push Notifications & Real-Time In-App Messaging Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" /> Firebase In-App Messaging & Web Push
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {typeof window !== 'undefined' && 'Notification' in window ? `Permission: ${Notification.permission}` : 'Not Supported'}
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  Real-time Firestore listeners synchronize notices, broadcasts, and staff chat messages across all connected devices and tabs.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={async () => {
                      const granted = await requestPushPermission();
                      alert(granted ? "Browser push notifications enabled!" : "Push permission was not granted.");
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <span>Request Permission</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerNativePush('ZOXS School Notification', 'Real-time in-app message and push verified via Firebase!');
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition"
                  >
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Test Push Notice</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span>Firestore `notices` channel</span>
                    <span className="text-emerald-400">● Live onSnapshot</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Firestore `staff_messages` channel</span>
                    <span className="text-emerald-400">● Live onSnapshot</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: CODE & SCRIPTS STUDIO */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File Selector Sidebar */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 lg:col-span-1 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
              Virtual Script Files
            </h3>
            
            <button
              onClick={() => setSelectedScriptType('css')}
              className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition ${
                selectedScriptType === 'css'
                  ? 'bg-purple-500/20 border border-purple-500/40 text-purple-200 font-medium'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <div>
                  <div className="text-sm font-mono">custom-styles.css</div>
                  <div className="text-xs text-slate-500">Live document styles</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300">CSS</span>
            </button>

            <button
              onClick={() => setSelectedScriptType('js')}
              className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition ${
                selectedScriptType === 'js'
                  ? 'bg-purple-500/20 border border-purple-500/40 text-purple-200 font-medium'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div>
                  <div className="text-sm font-mono">runtime-hooks.js</div>
                  <div className="text-xs text-slate-500">Execution hooks & logic</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">JS</span>
            </button>

            <button
              onClick={() => setSelectedScriptType('head')}
              className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition ${
                selectedScriptType === 'head'
                  ? 'bg-purple-500/20 border border-purple-500/40 text-purple-200 font-medium'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <div>
                  <div className="text-sm font-mono">header-tags.html</div>
                  <div className="text-xs text-slate-500">Meta, Analytics, Fonts</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">HTML</span>
            </button>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-2 mt-4">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Live In-Browser Compiling
              </div>
              <p>
                He code editor-ah hian CSS/JS i ziah rualin <strong>"Save & Apply"</strong> hmet la, software-ah a in-apply nghal zung zung ang.
              </p>
            </div>
          </div>

          {/* Editor Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:col-span-3 flex flex-col h-[650px] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-800 text-purple-300 border border-slate-700">
                  {selectedScriptType === 'css' && 'src/assets/custom-styles.css'}
                  {selectedScriptType === 'js' && 'src/hooks/runtime-hooks.js'}
                  {selectedScriptType === 'head' && 'public/head-tags.html'}
                </span>
                <span className="text-xs text-slate-500">
                  {selectedScriptType === 'css' && `${cssCode.split('\n').length} lines`}
                  {selectedScriptType === 'js' && `${jsCode.split('\n').length} lines`}
                  {selectedScriptType === 'head' && `${headCode.split('\n').length} lines`}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {saveStatus && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1.5 animate-pulse font-medium">
                    <CheckCircle2 className="w-4 h-4" /> {saveStatus}
                  </span>
                )}
                <button
                  onClick={handleSaveScripts}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/25 flex items-center gap-2 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Apply (Live)</span>
                </button>
              </div>
            </div>

            {/* Code Input */}
            <div className="flex-1 relative flex bg-slate-950 rounded-xl overflow-hidden border border-slate-800 font-mono text-xs sm:text-sm">
              <div className="bg-slate-950/80 select-none text-slate-600 px-3 py-4 text-right border-r border-slate-800/80 font-mono text-xs">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="leading-6">{i + 1}</div>
                ))}
              </div>

              {selectedScriptType === 'css' && (
                <textarea
                  value={cssCode}
                  onChange={(e) => setCssCode(e.target.value)}
                  className="flex-1 bg-transparent p-4 text-purple-200 focus:outline-none resize-none leading-6 font-mono selection:bg-purple-900/60"
                  placeholder="/* Enter custom CSS rules here... */"
                  spellCheck={false}
                />
              )}

              {selectedScriptType === 'js' && (
                <textarea
                  value={jsCode}
                  onChange={(e) => setJsCode(e.target.value)}
                  className="flex-1 bg-transparent p-4 text-amber-200 focus:outline-none resize-none leading-6 font-mono selection:bg-amber-900/60"
                  placeholder="// Enter custom JavaScript hooks here..."
                  spellCheck={false}
                />
              )}

              {selectedScriptType === 'head' && (
                <textarea
                  value={headCode}
                  onChange={(e) => setHeadCode(e.target.value)}
                  className="flex-1 bg-transparent p-4 text-emerald-200 focus:outline-none resize-none leading-6 font-mono selection:bg-emerald-900/60"
                  placeholder="<!-- Enter custom head tags here... -->"
                  spellCheck={false}
                />
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <div>Syntax: {selectedScriptType.toUpperCase()} | Engine: Browser Native | Auto-Persist: LocalStorage + Firestore</div>
              <div className="text-slate-400">Press <strong>Save & Apply</strong> to update without refresh</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLUGINS & EXTENSIONS */}
      {activeTab === 'plugins' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Blocks className="w-5 h-5 text-purple-400" />
                Plugins & Extension Packages
              </h2>
              <p className="text-slate-400 text-sm">
                Enable, configure, or inject dynamic libraries from CDNs (e.g. Leaflet Maps, MathJax, Chart.js) or custom Mizo school integrations.
              </p>
            </div>
            <button
              onClick={() => setIsAddPluginModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/25 flex items-center gap-2 transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Install New Plugin</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(plugins || []).map((plugin) => (
              <div
                key={plugin.id}
                className={`p-5 rounded-2xl border transition ${
                  plugin.enabled
                    ? 'bg-slate-900/90 border-purple-500/40 shadow-lg shadow-purple-950/20'
                    : 'bg-slate-900/40 border-slate-800 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{plugin.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        v{plugin.version}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-purple-400">{plugin.category}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedPluginForConfig(plugin)}
                      className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                      title="Configure Plugin Parameters, CDNs & Scripts"
                    >
                      <Sliders className="w-3.5 h-3.5 text-purple-400" />
                      <span>Configure</span>
                    </button>

                    {/* Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={plugin.enabled}
                        onChange={() => togglePlugin(plugin.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mb-2.5 leading-relaxed">{plugin.description}</p>

                {/* Scope & Config Metadata Pills */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                    Scope: {plugin.scope || 'all'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                    Timing: {plugin.loadTiming || 'async'}
                  </span>
                  {plugin.config && Object.keys(plugin.config).length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/70 text-purple-300 border border-purple-800/60 font-mono flex items-center gap-1">
                      <Sliders className="w-2.5 h-2.5" />
                      <span>{Object.keys(plugin.config).length} Config Params</span>
                    </span>
                  )}
                  {plugin.cdnCssUrl && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 font-mono">
                      CSS Link
                    </span>
                  )}
                </div>

                {plugin.cdnUrl && (
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 mb-3 font-mono text-[11px] text-slate-400 truncate flex items-center justify-between">
                    <span className="truncate">{plugin.cdnUrl}</span>
                    <a href={plugin.cdnUrl} target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300 shrink-0 ml-2">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span>Status: {plugin.enabled ? '🟢 Active & Loaded' : '⚪ Disabled'}</span>
                  </div>
                  <span className="font-mono">{plugin.id}</span>
                </div>
              </div>
            ))}
          </div>

          {/* New Plugin Modal */}
          {isAddPluginModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-purple-400" />
                    Add Custom Plugin / CDN Library
                  </h3>
                  <button
                    onClick={() => setIsAddPluginModalOpen(false)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreatePlugin} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Plugin Name</label>
                    <input
                      type="text"
                      required
                      value={newPluginForm.name}
                      onChange={(e) => setNewPluginForm({ ...newPluginForm, name: e.target.value })}
                      placeholder="e.g. Leaflet Map Engine"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Version</label>
                      <input
                        type="text"
                        value={newPluginForm.version}
                        onChange={(e) => setNewPluginForm({ ...newPluginForm, version: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                      <input
                        type="text"
                        value={newPluginForm.category}
                        onChange={(e) => setNewPluginForm({ ...newPluginForm, category: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">CDN Script URL (Optional)</label>
                    <input
                      type="url"
                      value={newPluginForm.cdnUrl}
                      onChange={(e) => setNewPluginForm({ ...newPluginForm, cdnUrl: e.target.value })}
                      placeholder="https://cdn.jsdelivr.net/npm/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-purple-500 focus:outline-none font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={newPluginForm.description}
                      onChange={(e) => setNewPluginForm({ ...newPluginForm, description: e.target.value })}
                      placeholder="Brief description of what this plugin does..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Initialization Script (JS)</label>
                    <textarea
                      rows={3}
                      value={newPluginForm.script}
                      onChange={(e) => setNewPluginForm({ ...newPluginForm, script: e.target.value })}
                      placeholder="console.log('Plugin initialized');"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-amber-200 focus:border-purple-500 focus:outline-none font-mono text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddPluginModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/25"
                    >
                      Register Plugin
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DATABASE & COLLECTIONS EXPLORER */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-400" />
                Live Firestore & IndexedDB Explorer
              </h2>
              <p className="text-slate-400 text-sm">
                Firebase Console hawng kher lovin collection zawng zawng record te heta tang hian direct-in khawih a, edit a, add theih a ni.
              </p>
            </div>

            <button
              onClick={() => setIsNewRecordModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/25 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Insert New Document</span>
            </button>
          </div>

          {dbMessage && (
            <div className={`p-4 rounded-xl text-sm flex items-center gap-2 border ${
              dbMessage.type === 'success' 
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                : 'bg-red-950/40 border-red-500/30 text-red-300'
            }`}>
              {dbMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{dbMessage.text}</span>
            </div>
          )}

          {/* Collection Pills & Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {Object.keys(collectionDataMap).map((collKey) => (
                <button
                  key={collKey}
                  onClick={() => setSelectedCollection(collKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedCollection === collKey
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  {collKey} ({collectionDataMap[collKey]?.data?.length || 0})
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search collection records..."
                value={dbSearchQuery}
                onChange={(e) => setDbSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Collection Records Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Document Preview</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredCollectionItems.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-500">
                        No documents found matching query in "{selectedCollection}".
                      </td>
                    </tr>
                  ) : (
                    filteredCollectionItems.map((item) => (
                      <tr key={item.id || Math.random()} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 text-purple-300 font-semibold align-top whitespace-nowrap">
                          {item.id}
                        </td>
                        <td className="p-3.5 text-slate-300 align-top max-w-xl truncate">
                          <span className="text-slate-400">
                            {JSON.stringify(item).slice(0, 160)}...
                          </span>
                        </td>
                        <td className="p-3.5 text-right align-top whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2 font-sans">
                            <button
                              onClick={() => handleOpenRecordEdit(item)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3 text-purple-400" />
                              <span>Edit JSON</span>
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(item.id)}
                              className="p-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Record Modal */}
          {editingRecord && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-purple-400" />
                    Edit Document: <span className="font-mono text-purple-300">{editingRecord.id}</span>
                  </h3>
                  <button onClick={() => setEditingRecord(null)} className="text-slate-400 hover:text-slate-200">
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">JSON Payload</label>
                  <textarea
                    rows={12}
                    value={recordJsonDraft}
                    onChange={(e) => setRecordJsonDraft(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-purple-200 font-mono text-xs leading-5 focus:outline-none focus:border-purple-500"
                    spellCheck={false}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setEditingRecord(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveRecordJson}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/25"
                  >
                    Update Document
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add New Record Modal */}
          {isNewRecordModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-purple-400" />
                    Insert Document into <span className="font-mono text-purple-300">{selectedCollection}</span>
                  </h3>
                  <button onClick={() => setIsNewRecordModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Raw JSON Document</label>
                  <textarea
                    rows={10}
                    value={newRecordJson}
                    onChange={(e) => setNewRecordJson(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-emerald-200 font-mono text-xs leading-5 focus:outline-none focus:border-purple-500"
                    spellCheck={false}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsNewRecordModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNewRecord}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/25"
                  >
                    Insert Record
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MASTER SYSTEM CONFIGURATION HUB */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          {/* Hub Header & Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" /> Super Admin Central Control
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 12 Modules Synchronized
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-2 flex items-center gap-2">
                Master Institutional Configuration Hub
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Software pumpui setting, legal details, clinic, security, finance, meal card, alumni leh module tin policy kimchang taka control-na hmunpui.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveTab('wizard')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
                title="Launch Step-by-Step Institutional Setup Wizard"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Guided Setup Wizard</span>
              </button>
              <button
                onClick={() => {
                  setConfigSavedToast(true);
                  setTimeout(() => setConfigSavedToast(false), 3500);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 flex items-center gap-2 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save All Configurations</span>
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {configSavedToast && (
            <div className="bg-emerald-950/80 border border-emerald-700/60 rounded-xl p-4 text-emerald-300 flex items-center gap-3 shadow-2xl animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Configuration Persisted Successfully!</p>
                <p className="text-xs text-emerald-400/80">All 12 institutional modules and policy thresholds have been saved to local storage & cloud state.</p>
              </div>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {[
              { id: 'all', label: 'All Modules (13)', icon: Sliders },
              { id: 'identity', label: 'Identity & Legal', icon: Building2 },
              { id: 'features', label: 'Feature Toggles', icon: Blocks },
              { id: 'clinic', label: 'Clinic & Sick Bay', icon: HeartPulse },
              { id: 'security', label: 'Security & Gates', icon: Shield },
              { id: 'inventory', label: 'Inventory & Lab', icon: Package },
              { id: 'canteen', label: 'Canteen & POS', icon: Utensils },
              { id: 'alumni', label: 'Alumni Network', icon: GraduationCap },
              { id: 'ptm', label: 'PTM Consultations', icon: Calendar },
              { id: 'finance', label: 'Finance & Concessions', icon: CreditCard },
              { id: 'seal', label: 'Seals & Stamps', icon: Award },
              { id: 'lms', label: 'Academic LMS Vault', icon: BookOpen },
              { id: 'media', label: 'Live Video Gateway', icon: Video },
              { id: 'website', label: 'Public Website CMS', icon: Globe },
            ].map(cat => {
              const Icon = cat.icon;
              const isActive = configCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setConfigCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-6">
            {/* SECTION 1: IDENTITY & LEGAL */}
            {(configCategory === 'all' || configCategory === 'identity') && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">1. Institutional Identity & Official Legal Setup</h3>
                      <p className="text-xs text-slate-400">School hming, affiliation, registration number leh official contacts.</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-purple-400 bg-purple-950/40 px-2.5 py-1 rounded-md border border-purple-800/40">systemConfig</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">School Official Registered Name</label>
                    <input
                      type="text"
                      value={systemConfig?.schoolName || ''}
                      onChange={(e) => updateSystemConfig({ schoolName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                      placeholder="e.g. OHA (Oxford Higher Academy)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Established Year</label>
                    <input
                      type="text"
                      value={systemConfig?.establishedYear || '1984'}
                      onChange={(e) => updateSystemConfig({ establishedYear: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                      placeholder="e.g. 1984"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">School Motto (Thuvawn)</label>
                    <input
                      type="text"
                      value={systemConfig?.motto || ''}
                      onChange={(e) => updateSystemConfig({ motto: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                      placeholder="e.g. Virtute et Labore"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">MBSE / Affiliation No.</label>
                    <input
                      type="text"
                      value={systemConfig?.affiliationNo || ''}
                      onChange={(e) => updateSystemConfig({ affiliationNo: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                      placeholder="MBSE-HSS-8492-MZ"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Full Campus Address</label>
                    <input
                      type="text"
                      value={systemConfig?.address || ''}
                      onChange={(e) => updateSystemConfig({ address: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                      placeholder="Lunglawn, Lunglei, Mizoram - 796701"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Official Contact Phone</label>
                    <input
                      type="text"
                      value={systemConfig?.contactPhone || ''}
                      onChange={(e) => updateSystemConfig({ contactPhone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                      placeholder="+91 372 2322104"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Official Contact Email</label>
                    <input
                      type="email"
                      value={systemConfig?.contactEmail || ''}
                      onChange={(e) => updateSystemConfig({ contactEmail: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                      placeholder="contact@mizoramschool.edu"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Academic Session</label>
                    <input
                      type="text"
                      value={systemConfig?.academicSession || '2026 - 2027'}
                      onChange={(e) => updateSystemConfig({ academicSession: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                      placeholder="2026 - 2027"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Primary Accent Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={systemConfig?.primaryColor || '#6366f1'}
                        onChange={(e) => updateSystemConfig({ primaryColor: e.target.value })}
                        className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-slate-700"
                      />
                      <input
                        type="text"
                        value={systemConfig?.primaryColor || '#6366f1'}
                        onChange={(e) => updateSystemConfig({ primaryColor: e.target.value })}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Currency Code</label>
                    <input
                      type="text"
                      value={systemConfig?.currency || 'INR'}
                      onChange={(e) => updateSystemConfig({ currency: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Currency Symbol</label>
                    <input
                      type="text"
                      value={systemConfig?.currencySymbol || '₹'}
                      onChange={(e) => updateSystemConfig({ currencySymbol: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: MASTER FEATURE TOGGLES */}
            {(configCategory === 'all' || configCategory === 'features') && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Blocks className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">2. Master Modular Feature Toggles</h3>
                      <p className="text-xs text-slate-400">Software pum pui huap zo a modular subsystem khar leh hawnna.</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-blue-400 bg-blue-950/40 px-2.5 py-1 rounded-md border border-blue-800/40">systemConfig</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: 'enableOnlineAdmissions', label: 'Online Admissions Portal', desc: 'Allow public prospective students to submit applications online' },
                    { key: 'enableUpiPayments', label: 'UPI & Digital Fee Gateways', desc: 'Activate instant QR codes and online payment settlement' },
                    { key: 'enableSmsNotifications', label: 'Automated SMS & WhatsApp Alerts', desc: 'Trigger auto-notifications on absence, fever, and fee receipts' },
                    { key: 'enableHostelModule', label: 'Residential Hostel Suite', desc: 'Enable rooms, mess menu, roll calls, and hostel outpasses' },
                    { key: 'enableTransportModule', label: 'Campus Bus & Transport Fleet', desc: 'Enable routes, driver assignments, and vehicle tracking' },
                  ].map(toggle => (
                    <label key={toggle.key} className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex items-start justify-between gap-3 cursor-pointer">
                      <div>
                        <span className="text-sm font-semibold text-white block">{toggle.label}</span>
                        <span className="text-xs text-slate-400 block mt-1">{toggle.desc}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(systemConfig?.[toggle.key])}
                        onChange={(e) => updateSystemConfig({ [toggle.key]: e.target.checked })}
                        className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-0 cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: HEALTH CLINIC & SICK BAY */}
            {(configCategory === 'all' || configCategory === 'clinic') && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">3. Health Clinic & Sick Bay Policy</h3>
                      <p className="text-xs text-slate-400">School infirmary nurse, bed capacity, emergency alerts leh dispensary rules.</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded-md border border-rose-800/40">clinicConfig</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Nurse In-Charge</label>
                    <input
                      type="text"
                      value={clinicConfig?.nurseInCharge || ''}
                      onChange={(e) => updateClinicConfig({ nurseInCharge: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Doctor On-Call / Affiliated Hospital</label>
                    <input
                      type="text"
                      value={clinicConfig?.doctorOnCall || ''}
                      onChange={(e) => updateClinicConfig({ doctorOnCall: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Operating Hours</label>
                    <input
                      type="text"
                      value={clinicConfig?.operatingHours || ''}
                      onChange={(e) => updateClinicConfig({ operatingHours: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Sick Bay Bed Count</label>
                    <input
                      type="number"
                      value={clinicConfig?.sickBayBedCount || 6}
                      onChange={(e) => updateClinicConfig({ sickBayBedCount: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Dispensary Low Stock Alert Threshold</label>
                    <input
                      type="number"
                      value={clinicConfig?.dispensaryLowStockThreshold || 10}
                      onChange={(e) => updateClinicConfig({ dispensaryLowStockThreshold: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div className="flex flex-col justify-end space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(clinicConfig?.autoParentAlertOnAdmission)}
                        onChange={(e) => updateClinicConfig({ autoParentAlertOnAdmission: e.target.checked })}
                        className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-medium">Auto-notify parent upon sick bay admission</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(clinicConfig?.syncWithAttendance)}
                        onChange={(e) => updateClinicConfig({ syncWithAttendance: e.target.checked })}
                        className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-medium">Sync sick bay check-in with attendance records</span>
                    </label>
                  </div>
                </div>

                {/* Emergency Channels */}
                <div className="pt-3 border-t border-slate-800">
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Emergency SOS Channels</p>
                  <div className="flex items-center gap-6">
                    {['sms', 'whatsapp', 'push'].map(channel => (
                      <label key={channel} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(clinicConfig?.emergencyAlertChannels?.[channel])}
                          onChange={(e) => updateClinicConfig({
                            emergencyAlertChannels: {
                              ...clinicConfig?.emergencyAlertChannels,
                              [channel]: e.target.checked
                            }
                          })}
                          className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs uppercase font-mono text-slate-300">{channel}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: CAMPUS SECURITY & VISITORS */}
            {(configCategory === 'all' || configCategory === 'security') && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">4. Main Campus Security & Gate Pass Controls</h3>
                      <p className="text-xs text-slate-400">Gate security officer, visitor pass validity, curfew policy leh badge printing.</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-800/40">visitorConfig</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Gate Security Chief</label>
                    <input
                      type="text"
                      value={visitorConfig?.gateSecurityChief || ''}
                      onChange={(e) => updateVisitorConfig({ gateSecurityChief: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Default Pass Validity (Minutes)</label>
                    <input
                      type="number"
                      value={visitorConfig?.defaultPassValidityMinutes || 90}
                      onChange={(e) => updateVisitorConfig({ defaultPassValidityMinutes: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Campus Curfew Time</label>
                    <input
                      type="text"
                      value={visitorConfig?.curfewTime || '17:30 (5:30 PM)'}
                      onChange={(e) => updateVisitorConfig({ curfewTime: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Gate Badge Print Format</label>
                    <select
                      value={visitorConfig?.gateBadgePrintFormat || 'badge_80mm'}
                      onChange={(e) => updateVisitorConfig({ gateBadgePrintFormat: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    >
                      <option value="badge_80mm">80mm Thermal Receipt Badge</option>
                      <option value="slip_a6">A6 Paper Entry Slip</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 flex flex-wrap gap-4 items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(visitorConfig?.requireVehicleNumber)}
                        onChange={(e) => updateVisitorConfig({ requireVehicleNumber: e.target.checked })}
                        className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-medium">Require vehicle registration number</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(visitorConfig?.requireHostApproval)}
                        onChange={(e) => updateVisitorConfig({ requireHostApproval: e.target.checked })}
                        className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-medium">Require host faculty approval</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(visitorConfig?.autoCheckoutAtCurfew)}
                        onChange={(e) => updateVisitorConfig({ autoCheckoutAtCurfew: e.target.checked })}
                        className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-medium">Auto-checkout visitors at curfew</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: INVENTORY & LAB ASSETS */}
            {(configCategory === 'all' || configCategory === 'inventory') && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">5. Science Labs & Campus Asset Inventory Controls</h3>
                      <p className="text-xs text-slate-400">Asset custodian, depreciation rate, purchase approval threshold leh audit cycle.</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-teal-400 bg-teal-950/40 px-2.5 py-1 rounded-md border border-teal-800/40">inventoryConfig</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Campus Asset Custodian</label>
                    <input
                      type="text"
                      value={inventoryConfig?.custodianName || ''}
                      onChange={(e) => updateInventoryConfig({ custodianName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Low Stock Warning Threshold (Units)</label>
                    <input
                      type="number"
                      value={inventoryConfig?.lowStockThreshold || 3}
                      onChange={(e) => updateInventoryConfig({ lowStockThreshold: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Annual Depreciation Rate (%)</label>
                    <input
                      type="number"
                      value={inventoryConfig?.depreciationRatePercent || 10}
                      onChange={(e) => updateInventoryConfig({ depreciationRatePercent: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">PO Approval Threshold Amount (₹)</label>
                    <input
                      type="number"
                      value={inventoryConfig?.approvalThresholdAmount || 5000}
                      onChange={(e) => updateInventoryConfig({ approvalThresholdAmount: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Preferred Scientific & Lab Supplier</label>
                    <input
                      type="text"
                      value={inventoryConfig?.preferredSupplier || ''}
                      onChange={(e) => updateInventoryConfig({ preferredSupplier: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Internal Audit Cycle (Months)</label>
                    <input
                      type="number"
                      value={inventoryConfig?.auditCycleMonths || 6}
                      onChange={(e) => updateInventoryConfig({ auditCycleMonths: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 6: CANTEEN & SMART LUNCH CARD */}
            {(configCategory === 'all' || configCategory === 'canteen') && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">6. Canteen & Smart Cashless Meal Card Policy</h3>
                      <p className="text-xs text-slate-400">Daily spending ceiling, cutoff timing, wallet thresholds leh cashless policies.</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-orange-400 bg-orange-950/40 px-2.5 py-1 rounded-md border border-orange-800/40">canteenConfig</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Canteen Manager / In-Charge</label>
                    <input
                      type="text"
                      value={canteenConfig?.canteenManager || ''}
                      onChange={(e) => updateCanteenConfig({ canteenManager: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Daily Student Spending Limit (₹)</label>
                    <input
                      type="number"
                      value={canteenConfig?.dailySpendingLimit || 150}
                      onChange={(e) => updateCanteenConfig({ dailySpendingLimit: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Low Wallet Balance Alert (₹)</label>
                    <input
                      type="number"
                      value={canteenConfig?.lowBalanceThreshold || 50}
                      onChange={(e) => updateCanteenConfig({ lowBalanceThreshold: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Daily Order Cutoff Time</label>
                    <input
                      type="text"
                      value={canteenConfig?.orderCutoffTime || '10:30 AM'}
                      onChange={(e) => updateCanteenConfig({ orderCutoffTime: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Operating Hours</label>
                    <input
                      type="text"
                      value={canteenConfig?.operationalTiming || '09:00 AM - 03:30 PM'}
                      onChange={(e) => updateCanteenConfig({ operationalTiming: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Applied Tax / GST Rate (%)</label>
                    <input
                      type="number"
                      value={canteenConfig?.taxGstPercent || 0}
                      onChange={(e) => updateCanteenConfig({ taxGstPercent: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div className="md:col-span-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(canteenConfig?.cashlessSmartCardOnly)}
                        onChange={(e) => updateCanteenConfig({ cashlessSmartCardOnly: e.target.checked })}
                        className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-medium">Strict Cashless Mode Only (Transactions exclusively processed via Student Smart Meal Card)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 7: ALUMNI NETWORK & TRANSCRIPTS */}
            {(configCategory === 'all' || configCategory === 'alumni') && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">7. Alumni Network & Official Transcript Desk</h3>
                      <p className="text-xs text-slate-400">Former students association, transcript processing fees leh delivery partners.</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-indigo-400 bg-indigo-950/40 px-2.5 py-1 rounded-md border border-indigo-800/40">alumniConfig</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Alumni Association President</label>
                    <input
                      type="text"
                      value={alumniConfig?.associationPresident || ''}
                      onChange={(e) => updateAlumniConfig({ associationPresident: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Official Transcript Fee (₹)</label>
                    <input
                      type="number"
                      value={alumniConfig?.transcriptFeeAmount || 300}
                      onChange={(e) => updateAlumniConfig({ transcriptFeeAmount: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Courier & Postal Partner</label>
                    <input
                      type="text"
                      value={alumniConfig?.courierDeliveryPartner || ''}
                      onChange={(e) => updateAlumniConfig({ courierDeliveryPartner: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  <div className="md:col-span-3 flex flex-wrap gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(alumniConfig?.publicDirectoryEnabled)}
                        onChange={(e) => updateAlumniConfig({ publicDirectoryEnabled: e.target.checked })}
                        className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-medium">Public searchable alumni directory</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(alumniConfig?.allowOnlineTranscriptRequests)}
                        onChange={(e) => updateAlumniConfig({ allowOnlineTranscriptRequests: e.target.checked })}
                        className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-medium">Allow online migration & transcript document requests</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 8: PTM CONSULTATIONS */}
            {(configCategory === 'all' || configCategory === 'ptm') && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">8. Parent-Teacher Meeting (PTM) Scheduler Policy</h3>
                      <p className="text-xs text-slate-400">Consultation slot duration, buffer times, booking limits leh video consultation rules.</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-md border border-cyan-800/40">ptmConfig</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Slot Duration (Minutes)</label>
                    <input
                      type="number"
                      value={ptmConfig?.defaultSlotDurationMinutes || 15}
                      onChange={(e) => updatePtmConfig({ defaultSlotDurationMinutes: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Buffer Between Slots (Minutes)</label>
                    <input
                      type="number"
                      value={ptmConfig?.bufferBetweenSlotsMinutes || 5}
                      onChange={(e) => updatePtmConfig({ bufferBetweenSlotsMinutes: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Max Consultations Per Parent</label>
                    <input
                      type="number"
                      value={ptmConfig?.maxBookingsPerParent || 3}
                      onChange={(e) => updatePtmConfig({ maxBookingsPerParent: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Auto-Reminder Prior (Hours)</label>
                    <input
                      type="number"
                      value={ptmConfig?.autoReminderHoursPrior || 24}
                      onChange={(e) => updatePtmConfig({ autoReminderHoursPrior: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(ptmConfig?.allowVirtualVideoPtm)}
                        onChange={(e) => updatePtmConfig({ allowVirtualVideoPtm: e.target.checked })}
                        className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-medium">Enable 1-on-1 Virtual Video Consultations via WebRTC Video Gateway</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 9: FINANCE & PAYMENT GATEWAYS */}
            {(configCategory === 'all' || configCategory === 'finance') && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">9. Finance, Payment Gateways & Sibling Discounts</h3>
                      <p className="text-xs text-slate-400">Direct NPCI UPI credentials, merchant accounts, Razorpay keys leh sibling concession policy.</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-800/40">paymentConfig & siblingPolicy</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Active Default Gateway</label>
                    <select
                      value={paymentConfig?.activeGateway || 'direct_upi'}
                      onChange={(e) => setActivePaymentGateway(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-semibold"
                    >
                      <option value="direct_upi">Direct NPCI UPI (Zero Fee SBI)</option>
                      <option value="razorpay">Razorpay Checkout</option>
                      <option value="cashfree">Cashfree Payments</option>
                      <option value="phonepe">PhonePe Gateway</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Direct UPI VPA / ID</label>
                    <input
                      type="text"
                      value={paymentConfig?.gateways?.direct_upi?.upiId || ''}
                      onChange={(e) => updateGatewayDetails('direct_upi', { upiId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">UPI Merchant Official Name</label>
                    <input
                      type="text"
                      value={paymentConfig?.gateways?.direct_upi?.merchantName || ''}
                      onChange={(e) => updateGatewayDetails('direct_upi', { merchantName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">School Bank Account No.</label>
                    <input
                      type="text"
                      value={paymentConfig?.gateways?.direct_upi?.accountNumber || ''}
                      onChange={(e) => updateGatewayDetails('direct_upi', { accountNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Bank IFSC Code</label>
                    <input
                      type="text"
                      value={paymentConfig?.gateways?.direct_upi?.ifscCode || ''}
                      onChange={(e) => updateGatewayDetails('direct_upi', { ifscCode: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Razorpay Key ID</label>
                    <input
                      type="text"
                      value={paymentConfig?.gateways?.razorpay?.keyId || ''}
                      onChange={(e) => updateGatewayDetails('razorpay', { keyId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>
                </div>

                {/* Sibling Concession Policy */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" /> Sibling Fee Concession & Scholarship Discount Policy
                    </h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(siblingPolicy?.autoApply)}
                        onChange={(e) => configureSiblingDiscountPolicy({ autoApply: e.target.checked })}
                        className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-medium">Auto-apply sibling discounts in fee billing</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                      <label className="block text-xs text-slate-400 font-semibold uppercase mb-1">2nd Child Discount (%)</label>
                      <input
                        type="number"
                        value={siblingPolicy?.secondChildDiscount || 15}
                        onChange={(e) => configureSiblingDiscountPolicy({ secondChildDiscount: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                      <label className="block text-xs text-slate-400 font-semibold uppercase mb-1">3rd Child Discount (%)</label>
                      <input
                        type="number"
                        value={siblingPolicy?.thirdChildDiscount || 25}
                        onChange={(e) => configureSiblingDiscountPolicy({ thirdChildDiscount: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                      <label className="block text-xs text-slate-400 font-semibold uppercase mb-1">4th+ Child Discount (%)</label>
                      <input
                        type="number"
                        value={siblingPolicy?.fourthPlusDiscount || 40}
                        onChange={(e) => configureSiblingDiscountPolicy({ fourthPlusDiscount: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 10: OFFICIAL SEALS & SIGNATURES */}
            {(configCategory === 'all' || configCategory === 'seal') && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">10. Official School Seal & Principal Signature Governance</h3>
                      <p className="text-xs text-slate-400">Transfer certificates, marksheets, certificates leh principal signatory styles.</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-800/40">sealConfig</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">School Crest Rim Text</label>
                    <input
                      type="text"
                      value={sealConfig?.schoolCrestText || ''}
                      onChange={(e) => updateSealConfig({ schoolCrestText: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Seal Established Year</label>
                    <input
                      type="text"
                      value={sealConfig?.establishedYear || '1984'}
                      onChange={(e) => updateSealConfig({ establishedYear: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Principal Signatory Full Name</label>
                    <input
                      type="text"
                      value={sealConfig?.principalSignatoryName || ''}
                      onChange={(e) => updateSealConfig({ principalSignatoryName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Principal Official Designation</label>
                    <input
                      type="text"
                      value={sealConfig?.principalDesignation || ''}
                      onChange={(e) => updateSealConfig({ principalDesignation: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Counter Signatory (Vice Principal)</label>
                    <input
                      type="text"
                      value={sealConfig?.counterSignatoryName || ''}
                      onChange={(e) => updateSealConfig({ counterSignatoryName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Signature Rendering Mode</label>
                    <select
                      value={sealConfig?.signatureMode || 'calligraphic'}
                      onChange={(e) => updateSealConfig({ signatureMode: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    >
                      <option value="calligraphic">Calligraphic Formal Script</option>
                      <option value="digital">Scanned Digital Vector</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Calligraphy Script Style</label>
                    <select
                      value={sealConfig?.calligraphyStyle || 'cursive_formal'}
                      onChange={(e) => updateSealConfig({ calligraphyStyle: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    >
                      <option value="cursive_formal">Formal Executive Cursive</option>
                      <option value="traditional">Traditional British Serif Script</option>
                      <option value="modern">Modern Minimalist Executive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Date Stamp Display Format</label>
                    <input
                      type="text"
                      value={sealConfig?.dateStampFormat || 'DD MMMM YYYY'}
                      onChange={(e) => updateSealConfig({ dateStampFormat: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Seal Stamp Ink Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={sealConfig?.sealColor || '#d97706'}
                        onChange={(e) => updateSealConfig({ sealColor: e.target.value })}
                        className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-slate-700"
                      />
                      <input
                        type="text"
                        value={sealConfig?.sealColor || '#d97706'}
                        onChange={(e) => updateSealConfig({ sealColor: e.target.value })}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Seal Stamp Opacity: {sealConfig?.sealOpacity ?? 0.88}</label>
                    <input
                      type="range"
                      min="0.2"
                      max="1.0"
                      step="0.02"
                      value={sealConfig?.sealOpacity ?? 0.88}
                      onChange={(e) => updateSealConfig({ sealOpacity: parseFloat(e.target.value) })}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Seal Document Toggles */}
                <div className="pt-3 border-t border-slate-800">
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Seal Automatic Placement Policy</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { key: 'showSealOnTC', label: 'Transfer Certificates (TC)' },
                      { key: 'showSealOnReportCard', label: 'Term Report Cards' },
                      { key: 'showSealOnCertificates', label: 'Merit & Diplomas' },
                      { key: 'enableDigitalVerificationQr', label: 'Digital QR Verification' },
                    ].map(toggle => (
                      <label key={toggle.key} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer">
                        <span className="text-xs text-slate-300 font-medium">{toggle.label}</span>
                        <input
                          type="checkbox"
                          checked={Boolean(sealConfig?.[toggle.key])}
                          onChange={(e) => updateSealConfig({ [toggle.key]: e.target.checked })}
                          className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 11: ACADEMIC LMS & STUDY MATERIALS */}
            {(configCategory === 'all' || configCategory === 'lms') && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">11. Academic LMS & Study Material Vault</h3>
                      <p className="text-xs text-slate-400">Class notes upload size, storage provider, watermarking leh download policies.</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-violet-400 bg-violet-950/40 px-2.5 py-1 rounded-md border border-violet-800/40">studyConfig</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Storage Cloud Provider</label>
                    <input
                      type="text"
                      value={studyConfig?.storageProvider || 'Cloudflare R2 / AWS S3 Education'}
                      onChange={(e) => updateStudyConfig({ storageProvider: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Max Upload Size (MB)</label>
                    <input
                      type="number"
                      value={Math.round((studyConfig?.maxUploadSizeBytes || 25000000) / 1000000)}
                      onChange={(e) => updateStudyConfig({ maxUploadSizeBytes: (parseInt(e.target.value) || 25) * 1000000 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Watermark Text</label>
                    <input
                      type="text"
                      value={studyConfig?.watermarkText || ''}
                      onChange={(e) => updateStudyConfig({ watermarkText: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  <div className="md:col-span-3 flex flex-wrap gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(studyConfig?.watermarkDownloads)}
                        onChange={(e) => updateStudyConfig({ watermarkDownloads: e.target.checked })}
                        className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-medium">Stamp watermark on PDF document downloads</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(studyConfig?.allowPublicDownload)}
                        onChange={(e) => updateStudyConfig({ allowPublicDownload: e.target.checked })}
                        className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-medium">Allow public student downloads without login</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(studyConfig?.enableRatingsAndComments)}
                        onChange={(e) => updateStudyConfig({ enableRatingsAndComments: e.target.checked })}
                        className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-medium">Enable student ratings & faculty reviews</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(studyConfig?.autoArchivePastYears)}
                        onChange={(e) => updateStudyConfig({ autoArchivePastYears: e.target.checked })}
                        className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-medium">Auto-archive past academic session papers</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 12: LIVE STREAMING & WEBRTC VIDEO */}
            {(configCategory === 'all' || configCategory === 'media') && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">12. Live Streaming, Agora RTC & WebRTC Gateway</h3>
                      <p className="text-xs text-slate-400">Live lecture broadcast, conference layouts, audio filtering leh streaming resolution.</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-red-400 bg-red-950/40 px-2.5 py-1 rounded-md border border-red-800/40">liveMediaConfig</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Active Video Provider Engine</label>
                    <select
                      value={liveMediaConfig?.activeProvider || 'webrtc_mesh'}
                      onChange={(e) => updateLiveMediaConfig({ activeProvider: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-semibold"
                    >
                      <option value="webrtc_mesh">Peer-to-Peer Native WebRTC Mesh</option>
                      <option value="agora">Agora RTC Cloud Gateway</option>
                      <option value="livekit">LiveKit SFU Cluster</option>
                      <option value="jitsi">Jitsi Meet Education Bridge</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Streaming Quality</label>
                    <select
                      value={liveMediaConfig?.streamQuality || '1080p'}
                      onChange={(e) => updateLiveMediaConfig({ streamQuality: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    >
                      <option value="360p">360p (Low Bandwidth Mobile)</option>
                      <option value="720p">720p HD Standard</option>
                      <option value="1080p">1080p Full HD Classroom</option>
                      <option value="4k">4K Ultra HD Broadcast</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Target Bitrate (Kbps)</label>
                    <input
                      type="number"
                      value={liveMediaConfig?.bitrateKbps || 2500}
                      onChange={(e) => updateLiveMediaConfig({ bitrateKbps: parseInt(e.target.value) || 2500 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">RTMP Live Ingest Stream URL</label>
                    <input
                      type="text"
                      value={liveMediaConfig?.broadcast?.rtmpIngestUrl || ''}
                      onChange={(e) => updateLiveMediaConfig({
                        broadcast: { ...liveMediaConfig?.broadcast, rtmpIngestUrl: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Conference Default Layout</label>
                    <select
                      value={liveMediaConfig?.conference?.defaultLayout || 'stage'}
                      onChange={(e) => updateLiveMediaConfig({
                        conference: { ...liveMediaConfig?.conference, defaultLayout: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                    >
                      <option value="stage">Teacher Stage Spotlight</option>
                      <option value="grid">Classroom Grid (3x3)</option>
                      <option value="voice">Audio-Only Voice Mode</option>
                    </select>
                  </div>

                  <div className="md:col-span-3 flex flex-wrap gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(liveMediaConfig?.audio?.noiseSuppression)}
                        onChange={(e) => updateLiveMediaConfig({
                          audio: { ...liveMediaConfig?.audio, noiseSuppression: e.target.checked }
                        })}
                        className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-medium">AI Noise Suppression</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(liveMediaConfig?.audio?.echoCancellation)}
                        onChange={(e) => updateLiveMediaConfig({
                          audio: { ...liveMediaConfig?.audio, echoCancellation: e.target.checked }
                        })}
                        className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-medium">Acoustic Echo Cancellation</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(liveMediaConfig?.conference?.activeSpeakerSpotlight)}
                        onChange={(e) => updateLiveMediaConfig({
                          conference: { ...liveMediaConfig?.conference, activeSpeakerSpotlight: e.target.checked }
                        })}
                        className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-medium">Active Speaker Spotlight</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(liveMediaConfig?.conference?.virtualBackgroundBlur)}
                        onChange={(e) => updateLiveMediaConfig({
                          conference: { ...liveMediaConfig?.conference, virtualBackgroundBlur: e.target.checked }
                        })}
                        className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-medium">Virtual Background Blur</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 13: PUBLIC SCHOOL WEBSITE & CMS LIVE EDITOR */}
            {(configCategory === 'all' || configCategory === 'website') && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">13. Public School Website & Interactive CMS Live Editor</h3>
                      <p className="text-xs text-slate-400">Visitor-facing school website, admissions banner, hero sliders, faculty messages leh streams config.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono text-blue-400 bg-blue-950/40 px-2.5 py-1 rounded-md border border-blue-800/40">websiteConfig</span>
                    <button
                      onClick={() => setIsDevWebsiteEditorOpen(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Open Live CMS Editor Panel</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Hero Headline (Landing Title)</label>
                    <input
                      type="text"
                      value={websiteConfig?.hero?.headline || ''}
                      onChange={(e) => updateWebsiteConfig({
                        hero: { ...websiteConfig?.hero, headline: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                      placeholder="e.g. Empowering Excellence, Shaping Tomorrow's Leaders"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Hero Tagline / Badge</label>
                    <input
                      type="text"
                      value={websiteConfig?.hero?.tagline || ''}
                      onChange={(e) => updateWebsiteConfig({
                        hero: { ...websiteConfig?.hero, tagline: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                      placeholder="e.g. ADMISSIONS OPEN 2026-2027"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Hero Sub-headline (Brief Narrative)</label>
                    <textarea
                      rows={2}
                      value={websiteConfig?.hero?.subheadline || ''}
                      onChange={(e) => updateWebsiteConfig({
                        hero: { ...websiteConfig?.hero, subheadline: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
                      placeholder="e.g. Mizoram Premier Higher Secondary Institution..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Hero Background Image URL</label>
                    <input
                      type="text"
                      value={websiteConfig?.hero?.imageUrl || ''}
                      onChange={(e) => updateWebsiteConfig({
                        hero: { ...websiteConfig?.hero, imageUrl: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Hero Action Button Text</label>
                    <input
                      type="text"
                      value={websiteConfig?.hero?.ctaPrimaryText || 'Apply for Admission'}
                      onChange={(e) => updateWebsiteConfig({
                        hero: { ...websiteConfig?.hero, ctaPrimaryText: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Admission Ticker & Quick Flags */}
                <div className="pt-3 border-t border-slate-800 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Announcement Ticker Text</label>
                      <input
                        type="text"
                        value={websiteConfig?.announcementBanner?.text || ''}
                        onChange={(e) => updateWebsiteConfig({
                          announcementBanner: { ...websiteConfig?.announcementBanner, text: e.target.value }
                        })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Principal Desk Name</label>
                      <input
                        type="text"
                        value={websiteConfig?.principalMessage?.name || ''}
                        onChange={(e) => updateWebsiteConfig({
                          principalMessage: { ...websiteConfig?.principalMessage, name: e.target.value }
                        })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(websiteConfig?.announcementBanner?.enabled)}
                        onChange={(e) => updateWebsiteConfig({
                          announcementBanner: { ...websiteConfig?.announcementBanner, enabled: e.target.checked }
                        })}
                        className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-medium">Show Announcement Bar on Public Website</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(websiteConfig?.stats?.display)}
                        onChange={(e) => updateWebsiteConfig({
                          stats: { ...websiteConfig?.stats, display: e.target.checked }
                        })}
                        className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-medium">Display Metric Counters (Students, Pass Rate, Awards)</span>
                    </label>

                    <button
                      onClick={() => setIsDevWebsiteEditorOpen(true)}
                      className="ml-auto text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold underline underline-offset-4"
                    >
                      <span>Customise streams, photos, contacts & social links &rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: REPL TERMINAL */}
      {activeTab === 'terminal' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-purple-400" />
                In-App Interactive JavaScript REPL Sandbox
              </h2>
              <p className="text-xs text-slate-400">
                Execute live queries against <code className="text-purple-300">db</code> object with real-time logging and execution benchmarking.
              </p>
            </div>
            <button
              onClick={handleRunTerminal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/25 flex items-center gap-2 transition"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Execute (Run)</span>
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <textarea
              rows={6}
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              className="w-full p-4 bg-transparent text-emerald-300 font-mono text-xs focus:outline-none resize-none leading-5"
              placeholder="// Write JavaScript expression here..."
              spellCheck={false}
            />
          </div>

          {/* Execution History */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Console Output & Execution Logs</h3>
            {terminalHistory.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-xs text-slate-500 font-mono">
                No commands executed yet. Click "Execute (Run)" above to inspect sandbox results.
              </div>
            ) : (
              terminalHistory.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-800 pb-1.5">
                    <span>{item.timestamp}</span>
                    <span className="text-purple-400">Time: {item.execTime}</span>
                  </div>

                  {item.logs.length > 0 && (
                    <div className="space-y-1 text-slate-300">
                      {item.logs.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-slate-600">&gt;</span>
                          <span>{log.message}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.result && (
                    <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/30 text-purple-200">
                      <div className="text-[10px] uppercase tracking-wider text-purple-400 mb-1">Return Value:</div>
                      <pre className="whitespace-pre-wrap">{item.result}</pre>
                    </div>
                  )}

                  {item.error && (
                    <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/30 text-red-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{item.error}</span>
                    </div>
                  )}
                </div>
              ))
            )}
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

      {/* Visual CMS Website Live Editor Modal */}
      <WebsiteEditorModal
        isOpen={isDevWebsiteEditorOpen}
        onClose={() => setIsDevWebsiteEditorOpen(false)}
      />
    </div>
  );
}
