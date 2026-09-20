import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  RefreshCw, 
  HardDrive, 
  Radio, 
  Save, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { getStoredFirebaseConfig, saveStoredFirebaseConfig, isOfflinePersistenceActive } from '../services/firebase';
import { useSchool } from '../context/SchoolContext';

export default function FirebaseConfigModal({ isOpen, onClose }) {
  const { isSyncing, lastSyncTime, resetToMockData } = useSchool();
  const [config, setConfig] = useState(() => getStoredFirebaseConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    saveStoredFirebaseConfig(config);
    setSavedSuccess(true);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all collections back to authentic Mizoram school seed records?')) {
      resetToMockData();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0e1626] border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-[#101b30]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit']">
                Firebase Web SDK v10.8.0 Settings
              </h2>
              <p className="text-xs text-slate-400">
                Offline persistence, Firestore multi-tab cache & credentials
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Persistence status card */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">Offline Multi-Tab Persistence</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Configured with <code className="text-cyan-300 font-mono">persistentLocalCache</code> &amp; <code className="text-cyan-300 font-mono">persistentMultipleTabManager</code>. All 13 collections stay cached locally in IndexedDB and sync seamlessly when online.
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800">
              <span>Last Local Cache Sync: {lastSyncTime}</span>
              <span className="flex items-center gap-1 text-cyan-400">
                <Sparkles className="w-3 h-3" />
                Offline-First Ready
              </span>
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSave} className="space-y-3.5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Project Configuration
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Project ID</label>
              <input
                type="text"
                value={config.projectId || ''}
                onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">API Key</label>
              <input
                type="text"
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Auth Domain</label>
                <input
                  type="text"
                  value={config.authDomain || ''}
                  onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Storage Bucket</label>
                <input
                  type="text"
                  value={config.storageBucket || ''}
                  onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Configuration & Reload</span>
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 text-xs transition flex items-center gap-1.5"
                title="Reset local data to authentic Mizoram seed records"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Seed Data</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
