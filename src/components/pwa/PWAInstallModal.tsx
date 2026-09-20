import React from 'react';
import { Download, X, Smartphone, Monitor, CheckCircle, Share, PlusSquare, WifiOff, ShieldCheck } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => Promise<boolean>;
  isIOS: boolean;
  isInstalled: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  isIOS,
  isInstalled,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Install Mizoram School App</h3>
              <p className="text-xs text-slate-400">Native Progressive Web App (PWA) with Offline Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-4">
          {/* Features Highlights */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <WifiOff className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Works 100% Offline</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-400 font-medium">
              <Monitor className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Full Desktop & Tablet UI</span>
            </div>
            <div className="flex items-center gap-2 text-amber-400 font-medium">
              <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Home Screen Launch</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Cached IndexedDB Store</span>
            </div>
          </div>

          {isInstalled ? (
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-emerald-200">App Is Already Installed</p>
              <p className="text-xs text-slate-400">
                You are running the official standalone Mizoram School System dashboard.
              </p>
            </div>
          ) : isIOS ? (
            <div className="space-y-3 p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                iOS Safari Installation Steps:
              </p>
              <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                <li>
                  Tap the <strong className="text-indigo-300 inline-flex items-center gap-1"><Share className="w-3.5 h-3.5" /> Share</strong> button in Safari toolbar.
                </li>
                <li>
                  Scroll down the share sheet and tap <strong className="text-indigo-300 inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen</strong>.
                </li>
                <li>
                  Tap <strong className="text-emerald-300">Add</strong> in the top-right corner to place the app on your home screen.
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Installing provides instant desktop dock & mobile home screen launch, faster load times in rural hill districts, and offline attendance logging with background Firestore synchronization.
              </p>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center gap-2 text-slate-200 font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Compatible with Google Chrome, Microsoft Edge, Brave, and Android</span>
                </div>
                <p className="pl-5 text-slate-400">
                  Zero installation size footprint, automatic background version updates, and persistent offline database.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isInstalled ? 'Close' : 'Cancel'}
          </button>
          {!isInstalled && !isIOS && (
            <button
              onClick={async () => {
                const installed = await onInstall();
                if (installed) onClose();
              }}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Install App Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
