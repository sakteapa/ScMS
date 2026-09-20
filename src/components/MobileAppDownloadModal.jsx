import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  QrCode, 
  Check, 
  Copy, 
  Sparkles, 
  ShieldCheck, 
  WifiOff, 
  Zap, 
  Apple, 
  PackageCheck,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useSchool } from '../context/SchoolContext';

export default function MobileAppDownloadModal({ isOpen, onClose, deferredPrompt, onDirectInstall }) {
  const { systemConfig } = useSchool();
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'android' | 'ios' | 'apk'
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mizoramschool.edu.in';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-purple-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Mobile Application Download Center
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                  PWA Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Play Store kual ngai lovin Android & iPhone-ah App puitling angin dah nghal rawh.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Install Banner (if browser supports deferredPrompt) */}
        {deferredPrompt && (
          <div className="px-6 py-3.5 bg-gradient-to-r from-emerald-950/80 via-teal-950/40 to-slate-900 border-b border-emerald-800/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <p className="text-xs font-semibold text-emerald-300">
                Browser-in 1-Click Installation a support e! Tunah he device-ah hian direct-in install rawh:
              </p>
            </div>
            <button
              onClick={() => {
                if (onDirectInstall) onDirectInstall();
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/25 flex items-center gap-1.5 shrink-0 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App Now</span>
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 pt-4 flex items-center gap-2 border-b border-slate-800/80 bg-slate-950/50 overflow-x-auto scrollbar-thin">
          {[
            { id: 'qr', label: 'Phone Scan (QR Code)', icon: QrCode },
            { id: 'android', label: 'Android (Chrome/Edge)', icon: Smartphone },
            { id: 'ios', label: 'iPhone / iPad (Safari)', icon: Apple },
            { id: 'apk', label: 'Native APK (Capacitor)', icon: PackageCheck },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  isActive 
                    ? 'border-purple-500 text-white' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: QR CODE LIVE SCAN */}
          {activeTab === 'qr' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <div className="p-4 bg-white rounded-2xl shadow-xl shrink-0 flex items-center justify-center">
                  <QRCodeSVG 
                    value={currentUrl} 
                    size={160}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <div className="space-y-3 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[11px] font-semibold border border-purple-500/20">
                    <Sparkles className="w-3 h-3" />
                    <span>Instant Camera Scan</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    I Phone Camera-in he QR Code hi Scan rawh
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Android phone emaw iPhone camera-in he QR Code hi tin la, link lo langah khan lut rawh. Minute 1 chhungin i phone home screen-ah App icon puitling a lo in-install nghal ang.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2 justify-center sm:justify-start">
                    <button
                      onClick={handleCopyLink}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{copied ? 'Link Copied!' : 'Copy Portal Link'}</span>
                    </button>

                    <a
                      href={currentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Link Directly</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* PWA Benefits Pill Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <WifiOff className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Offline Cache</p>
                    <p className="text-[10px] text-slate-400">Network chhiat lai pawhin a inhawng</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Lightweight</p>
                    <p className="text-[10px] text-slate-400">Storage heh lo (2MB hnuai lam)</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Zero Play Store Fee</p>
                    <p className="text-[10px] text-slate-400">Direct instant auto-updates</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID GUIDE */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Android Phone-a Install Dan (Google Chrome / Brave / Edge)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Google Play Store aṭanga zawng kual buai ngai lovin second 10 chhungin phone home screen-ah a dah theih:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                  <p className="text-xs font-bold text-white">Chrome-ah Website Hawng Rawh</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    I phone Google Chrome browser-ah he school link hi hawng rawh.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                  <p className="text-xs font-bold text-white">"Install App" Hmet Rawh</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Navbar-a "Install App" button emaw Chrome chunga Menu dot pathum (<strong className="text-white">⋮</strong>) kha hmet la, <strong>"Install app"</strong> / <strong>"Add to Home screen"</strong> tih thlang rawh.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                  <p className="text-xs font-bold text-white">Phone Home Screen-ah A Awm Tawh</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    "Install" tih i hmeh nawn rualin School icon nen app puitling angin phone-ah a inhawng thei tawh ang!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IPHONE / IOS GUIDE */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
                  <Apple className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">iPhone & iPad-a Install Dan (Apple Safari)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Apple iOS chuan Safari browser aṭangin Home Screen Native App siam a support tlat a ni:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                  <p className="text-xs font-bold text-white">Safari Browser-ah Hawng Rawh</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Apple Safari browser hmangin he school link hi hawng rawh (Chrome ni lovin Safari ngei a ngai).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                  <p className="text-xs font-bold text-white">Share Button (📤) Hmet Rawh</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Safari screen hnuai ber bar-a Share icon (bawm chunga thal awmna) kha hmet la, hnuai lamah scroll thla rawh.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                  <p className="text-xs font-bold text-white">"Add to Home Screen" Thlang Rawh</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    <strong>"Add to Home Screen (➕)"</strong> tih kha hmet la, dinglam chunga <strong>"Add"</strong> hmet leh rawh. iPhone app puitling angin a awm nghal ang!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CAPACITOR APK BUILD */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0 mt-0.5">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Standalone Android APK (.apk) & Google Play Store Setup</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    He project-ah hian <code className="text-purple-300">capacitor.config.json</code> dah sa vek a ni a. Android Studio hmanga standalone APK generate dan:
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 space-y-2.5 overflow-x-auto">
                <p className="text-slate-500 text-[11px] font-sans font-semibold uppercase">Terminal Commands for Android Studio & APK:</p>
                <div className="text-emerald-400"># 1. Install Capacitor CLI & Android runtime</div>
                <div className="text-slate-200">npm install @capacitor/core @capacitor/cli @capacitor/android</div>
                
                <div className="text-emerald-400 mt-2"># 2. Build production web bundle</div>
                <div className="text-slate-200">npm run build</div>

                <div className="text-emerald-400 mt-2"># 3. Add Android platform project</div>
                <div className="text-slate-200">npx cap add android</div>

                <div className="text-emerald-400 mt-2"># 4. Open in Android Studio & generate .apk / .aab</div>
                <div className="text-slate-200">npx cap open android</div>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-300 flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-purple-400" />
                <span>Android Studio-a a inhawn hnuah <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> tih hmetin <code className="text-white font-mono">app-debug.apk</code> a generate nghal ang.</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>App ID: <code className="text-slate-300 font-mono">edu.mizoram.school.sms</code></span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
