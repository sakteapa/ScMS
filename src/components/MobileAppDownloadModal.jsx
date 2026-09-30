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
  Info,
  Laptop,
  Monitor,
  Share2,
  Printer,
  Palette,
  Upload,
  RefreshCw,
  Layers,
  School
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useSchool } from '../context/SchoolContext';
import { updateDynamicPwaBranding } from '../services/tenantService';

export default function MobileAppDownloadModal({ isOpen, onClose, deferredPrompt, onDirectInstall }) {
  const { systemConfig, activeSchoolInfo, activeSchoolId } = useSchool();
  const [activeTab, setActiveTab] = useState('pc'); // 'pc' | 'qr' | 'android' | 'ios' | 'branding' | 'apk'
  const [copied, setCopied] = useState(false);
  const [customLogoUrl, setCustomLogoUrl] = useState(() => {
    try {
      return localStorage.getItem(`zoxs_${activeSchoolId}_custom_logo`) || '';
    } catch {
      return '';
    }
  });
  const [brandSaved, setBrandSaved] = useState(false);

  if (!isOpen) return null;

  const schoolOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://sc-ms.vercel.app';
  const schoolPortalUrl = `${schoolOrigin}/${activeSchoolId || 'oha'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(schoolPortalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleWhatsAppShare = () => {
    const schoolTitle = activeSchoolInfo?.name || 'Mizoram School';
    const msg = `🏫 *${schoolTitle}* Official App & Portal:\n\nParent, Student leh Staff te tan a bika buatsaih a ni a. School dropdown thlan ngai lovin he link aṭang hian direct-in i phone emaw PC-ah app angin install rawh le:\n\n👉 ${schoolPortalUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePrintPoster = () => {
    const schoolTitle = activeSchoolInfo?.name || 'Mizoram School';
    const schoolMotto = activeSchoolInfo?.motto || 'Knowledge is Light';
    const affiliation = activeSchoolInfo?.affiliationBadge || 'MBSE Affiliated';
    const address = activeSchoolInfo?.address || 'Mizoram, India';
    const primaryColor = activeSchoolInfo?.primaryColor || '#4f46e5';

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${schoolTitle} - Official Notice Poster</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body {
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background: #ffffff;
              color: #0f172a;
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
            }
            .poster-card {
              border: 3px solid ${primaryColor};
              border-radius: 24px;
              padding: 36px 30px;
              max-width: 650px;
              width: 100%;
              box-sizing: border-box;
            }
            .badge {
              display: inline-block;
              background: #f1f5f9;
              color: ${primaryColor};
              font-weight: 700;
              font-size: 13px;
              padding: 6px 16px;
              border-radius: 9999px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 12px;
            }
            h1 {
              font-size: 32px;
              font-weight: 900;
              margin: 8px 0;
              color: #0f172a;
              letter-spacing: -0.02em;
            }
            .motto {
              font-size: 16px;
              color: #64748b;
              font-style: italic;
              margin-bottom: 24px;
            }
            .qr-box {
              background: #f8fafc;
              border: 2px dashed #cbd5e1;
              border-radius: 20px;
              padding: 24px;
              display: inline-block;
              margin: 16px 0;
            }
            .instructions {
              margin-top: 20px;
              text-align: left;
              background: #f8fafc;
              border-radius: 16px;
              padding: 16px 20px;
              font-size: 13px;
              line-height: 1.6;
              color: #334155;
            }
            .instructions ol {
              margin: 8px 0 0 16px;
              padding: 0;
            }
            .footer {
              margin-top: 24px;
              font-size: 12px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 12px;
            }
          </style>
        </head>
        <body>
          <div class="poster-card">
            <div class="badge">${affiliation}</div>
            <h1>${schoolTitle}</h1>
            <div class="motto">"${schoolMotto}"</div>
            
            <div style="font-size: 16px; font-weight: bold; color: ${primaryColor}; margin-bottom: 8px;">
              OFFICIAL SCHOOL MOBILE APP &amp; PORTAL
            </div>
            <p style="font-size: 13px; color: #475569; margin: 0 0 16px 0;">
              School thlan kual ngai lo vin, i phone camera-in a hnuaia QR Code hi scan la, App hi install rawh le:
            </p>

            <div class="qr-box">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(schoolPortalUrl)}" width="220" height="220" alt="QR Code" />
            </div>

            <div class="instructions">
              <strong>Phone-a Dah Dan Awlsam (Step 3 chauh):</strong>
              <ol>
                <li>I phone Camera (emaw Google Lens) hmangin he QR Code hi tin rawh.</li>
                <li>Link lo langah khan lut la, Google Chrome / Apple Safari-ah a inhawng ang.</li>
                <li><strong>"Install App"</strong> emaw <strong>"Add to Home Screen"</strong> tih hmet rawh. Minute 1 hnuah ${schoolTitle} App puitling angin i phone-ah a awm nghal ang!</li>
              </ol>
            </div>

            <div class="footer">
              ${address} • Powered by Mizoram School Cloud ERP
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCustomLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) {
        setCustomLogoUrl(base64);
        try {
          localStorage.setItem(`zoxs_${activeSchoolId}_custom_logo`, base64);
          if (activeSchoolInfo) {
            updateDynamicPwaBranding({
              ...activeSchoolInfo,
              logoUrl: base64
            });
          }
          setBrandSaved(true);
          setTimeout(() => setBrandSaved(false), 3000);
        } catch {}
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-cyan-950/30 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/25 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Laptop className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {activeSchoolInfo?.name || 'School'} App &amp; Software Hub
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider shrink-0">
                  Dedicated App
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                School thlan ngai lo vin {activeSchoolInfo?.shortName || 'School'} tan a bika buatsaih Standalone PC Software leh Mobile Application.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Install Banner (if browser supports deferredPrompt) */}
        {deferredPrompt && (
          <div className="px-6 py-3.5 bg-gradient-to-r from-cyan-950/90 via-indigo-950/60 to-slate-900 border-b border-cyan-800/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
              <p className="text-xs font-semibold text-cyan-200">
                Browser-in 1-Click Standalone Installation a support e! He device-ah hian direct-in dah nghal rawh:
              </p>
            </div>
            <button
              onClick={() => {
                if (onDirectInstall) onDirectInstall();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-500/30 flex items-center gap-1.5 shrink-0 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Now</span>
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 pt-3 flex items-center gap-2 border-b border-slate-800/80 bg-slate-950/60 overflow-x-auto scrollbar-thin">
          {[
            { id: 'pc', label: 'Windows PC Software', icon: Laptop },
            { id: 'qr', label: 'Phone QR & WhatsApp', icon: QrCode },
            { id: 'android', label: 'Android Phone', icon: Smartphone },
            { id: 'ios', label: 'iPhone / iPad (Safari)', icon: Apple },
            { id: 'branding', label: 'School Logo & Branding', icon: Palette },
            { id: 'apk', label: 'Native APK (.apk)', icon: PackageCheck },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  isActive 
                    ? 'border-cyan-400 text-cyan-300 font-bold' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: WINDOWS PC STANDALONE SOFTWARE */}
          {activeTab === 'pc' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/30 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[11px] font-semibold border border-cyan-500/20">
                    <Monitor className="w-3 h-3" />
                    <span>PC Desktop Standalone App</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {activeSchoolInfo?.name} PC Software
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                    Windows PC-ah Desktop icon leh Start Menu shortcut nen a in-install dawn a. Browser URL bar awm lovin software puitling angin a inhawng dawn a ni.
                  </p>
                </div>

                {deferredPrompt ? (
                  <button
                    onClick={() => {
                      if (onDirectInstall) onDirectInstall();
                      onClose();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 shrink-0 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install on this PC</span>
                  </button>
                ) : (
                  <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] text-cyan-300 font-semibold shrink-0">
                    Browser Menu &gt; Apps &gt; Install
                  </div>
                )}
              </div>

              {/* PC Standalone Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-400 mb-2">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-white">Remote Auto-Update</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Server aṭanga tih danglam apiangin i PC Software hi a in-update nghal vek ang. Install nawn a ngai lo!
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="p-2 w-fit rounded-lg bg-cyan-500/10 text-cyan-400 mb-2">
                    <Layers className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-white">Dedicated Window</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Browser address bar buaithlak a awm lo. School software puitling angin full screen-ah a inhawng.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="p-2 w-fit rounded-lg bg-purple-500/10 text-purple-400 mb-2">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-white">Direct School Lock</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    A inhawn rualin {activeSchoolInfo?.shortName || 'School'} data chauh a thlang nghal ang, school thlan a ngai lo.
                  </p>
                </div>
              </div>

              {/* Windows Install Guide Steps */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-cyan-400" />
                  <span>Windows 10 / 11 PC-a Install Dan (Microsoft Edge / Google Chrome):</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                    <span className="font-bold text-cyan-400">Step 1:</span>
                    <p className="text-slate-300 font-semibold">Browser-ah he link hi hawng rawh</p>
                    <p className="text-[11px] text-slate-400">Microsoft Edge emaw Google Chrome hmangin he portal link hi hawng rawh.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                    <span className="font-bold text-cyan-400">Step 2:</span>
                    <p className="text-slate-300 font-semibold">Menu aṭangin "Install" hmet rawh</p>
                    <p className="text-[11px] text-slate-400">Browser chunga Menu dot pathum (<strong className="text-white">⋯</strong> or <strong className="text-white">⋮</strong>) kha hmet la, <strong>Apps &gt; "Install this site as an app"</strong> tih thlang rawh.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                    <span className="font-bold text-cyan-400">Step 3:</span>
                    <p className="text-slate-300 font-semibold">Desktop Shortcut a awm ta</p>
                    <p className="text-[11px] text-slate-400">"Install" i hmeh rualin Desktop-ah leh Start Menu-ah {activeSchoolInfo?.name} icon a awm nghal ang!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QR CODE & WHATSAPP BROADCAST */}
          {activeTab === 'qr' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <div className="p-4 bg-white rounded-2xl shadow-xl shrink-0 flex items-center justify-center">
                  <QRCodeSVG 
                    value={schoolPortalUrl} 
                    size={160}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <div className="space-y-3 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-[11px] font-semibold border border-cyan-500/20">
                    <Sparkles className="w-3 h-3" />
                    <span>Dedicated School QR Code</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {activeSchoolInfo?.name} Phone Scan QR
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Android leh iPhone camera-in he QR code hi tin la, link lo langah khan lut rawh. School thlan kual ngai miah lo vin {activeSchoolInfo?.shortName || 'School'} app puitling angin phone-ah a in-install nghal ang.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2 justify-center sm:justify-start">
                    <button
                      onClick={handleWhatsAppShare}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp-ah Thawn Rawh</span>
                    </button>

                    <button
                      onClick={handlePrintPoster}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Printer className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Print Notice Poster (A4)</span>
                    </button>

                    <button
                      onClick={handleCopyLink}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{copied ? 'Link Copied!' : 'Copy Direct Link'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct Portal Link Box */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Dedicated School Link:</p>
                  <p className="text-cyan-300 font-mono text-[11px] truncate">{schoolPortalUrl}</p>
                </div>
                <a
                  href={schoolPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 text-xs font-semibold flex items-center gap-1 shrink-0 transition"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: ANDROID PHONE */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Android Phone-a Install Dan (Google Chrome / Brave / Edge)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Play Store kual buai ngai lovin second 10 chhungin phone home screen-ah a dah theih:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                  <p className="text-xs font-bold text-white">Chrome-ah Hawng Rawh</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    I phone Google Chrome browser-ah he school link hi hawng rawh.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                  <p className="text-xs font-bold text-white">"Install App" Hmet Rawh</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Chrome chunga Menu dot pathum (<strong className="text-white">⋮</strong>) kha hmet la, <strong>"Install app"</strong> / <strong>"Add to Home screen"</strong> tih thlang rawh.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                  <p className="text-xs font-bold text-white">Phone Screen-ah A Awm Tawh</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    "Install" tih i hmeh nawn rualin {activeSchoolInfo?.shortName || 'School'} icon nen app puitling angin phone-ah a inhawng thei tawh ang!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: IPHONE / APPLE SAFARI */}
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

          {/* TAB 5: SCHOOL BRANDING & LOGO */}
          {activeTab === 'branding' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0 mt-0.5">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">School Custom App Icon &amp; Crest Customizer</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeSchoolInfo?.name} tan Custom Logo / Crest upload la, phone leh PC-a app icon lo lang tur hi i duh danin thlak rawh:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <p className="text-xs font-bold text-white">Upload Custom School Logo / App Crest:</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                      {customLogoUrl ? (
                        <img src={customLogoUrl} alt="School Logo" className="w-full h-full object-contain p-1" />
                      ) : (
                        <School className="w-8 h-8 text-slate-500" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow transition inline-flex">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose Image File</span>
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg, image/svg+xml" 
                          onChange={handleCustomLogoUpload}
                          className="hidden" 
                        />
                      </label>
                      <p className="text-[10px] text-slate-400">PNG or JPG (Square format recommended)</p>
                      {brandSaved && (
                        <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>App icon updated &amp; saved!</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <p className="text-xs font-bold text-white">Current School Identity Info:</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">School Name:</span>
                      <span className="font-semibold text-white">{activeSchoolInfo?.name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Short Name:</span>
                      <span className="font-semibold text-white">{activeSchoolInfo?.shortName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Primary Color:</span>
                      <span className="font-semibold text-cyan-400 font-mono">{activeSchoolInfo?.primaryColor || '#6366f1'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Affiliation:</span>
                      <span className="font-semibold text-slate-300">{activeSchoolInfo?.affiliationBadge}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CAPACITOR APK */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0 mt-0.5">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Standalone Android APK (.apk) &amp; Google Play Store Setup</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    He project-ah hian <code className="text-cyan-300 font-mono">capacitor.config.json</code> dah sa vek a ni a. Android Studio hmanga standalone APK generate dan:
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 space-y-2.5 overflow-x-auto">
                <p className="text-slate-500 text-[11px] font-sans font-semibold uppercase">Terminal Commands for Android Studio &amp; APK:</p>
                <div className="text-emerald-400"># 1. Build production web bundle</div>
                <div className="text-slate-200">npm run build</div>

                <div className="text-emerald-400 mt-2"># 2. Sync Android platform project</div>
                <div className="text-slate-200">npx cap sync android</div>

                <div className="text-emerald-400 mt-2"># 3. Open in Android Studio &amp; generate .apk / .aab</div>
                <div className="text-slate-200">npx cap open android</div>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-300 flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>Android Studio-a a inhawn hnuah <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> tih hmetin <code className="text-white font-mono">app-debug.apk</code> a generate nghal ang.</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>Dedicated App Tenant: <code className="text-cyan-300 font-mono font-bold">/{activeSchoolId || 'oha'}</code></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Share Link</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
