import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Edit3, 
  Sparkles, 
  Building2, 
  GraduationCap, 
  Image as ImageIcon, 
  Phone, 
  CheckCircle2, 
  RotateCcw, 
  Eye, 
  Layers,
  Plus,
  Trash2,
  Bell,
  Link as LinkIcon,
  Palette,
  ExternalLink,
  BookOpen,
  School,
  HeartHandshake,
  Globe,
  Copy,
  Check,
  Server,
  Wifi,
  ShieldCheck,
  ArrowRight,
  Code2,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Award,
  Headphones
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { INITIAL_WEBSITE_CONFIG } from '../data/mockData';
import PublicAnnouncementBanner, { PRESET_BANNER_GIFS, BANNER_THEMES } from './PublicAnnouncementBanner';

export default function WebsiteEditorModal({ isOpen, onClose, onViewWebsite }) {
  const { websiteConfig, updateWebsiteConfig, activeSchoolInfo, activeSchoolId, updateSchoolTenantInfo } = useSchool();
  const [formData, setFormData] = useState(() => ({ ...(websiteConfig || INITIAL_WEBSITE_CONFIG) }));
  const [activeTab, setActiveTab] = useState('announcement'); // 'announcement' | 'hero' | 'about' | 'principal' | 'programs' | 'facilities' | 'contact' | 'domain'
  const [saveToast, setSaveToast] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState(() => activeSchoolInfo?.customDomain || '');
  const [subdomainInput, setSubdomainInput] = useState(() => activeSchoolInfo?.subdomain || activeSchoolId || '');
  const [copiedRecord, setCopiedRecord] = useState(null);
  const [dnsCheckStatus, setDnsCheckStatus] = useState('idle'); // 'idle' | 'checking' | 'active'

  useEffect(() => {
    if (websiteConfig) {
      setFormData({ ...websiteConfig });
    }
    if (activeSchoolInfo) {
      setCustomDomainInput(activeSchoolInfo.customDomain || '');
      setSubdomainInput(activeSchoolInfo.subdomain || activeSchoolId || '');
    }
  }, [websiteConfig, activeSchoolInfo, activeSchoolId, isOpen]);

  const banner = formData.announcementBanner || {
    enabled: true,
    badgeText: 'ADMISSION 2026',
    text: '🎉 Online Admissions for Academic Session 2026 - 2027 are officially open! Limited seats available in Science, Arts & Commerce streams. Apply online before June 30.',
    mediaType: 'preset_gif',
    presetGif: 'celebration',
    customMediaUrl: '',
    mediaEmoji: '📢',
    linkType: 'admission_portal',
    linkUrl: '',
    linkText: 'Apply Online',
    theme: 'gradient_fire',
    scrollSpeed: 'normal',
    pauseOnHover: true,
    clickableBanner: false,
    showDismiss: true
  };

  const updateBanner = (updates) => {
    setFormData((prev) => ({
      ...prev,
      announcementBanner: {
        ...(prev.announcementBanner || banner),
        ...updates
      }
    }));
  };

  const updateDevCredits = (updates) => {
    setFormData((prev) => ({
      ...prev,
      developerCredits: {
        ...(prev.developerCredits || {}),
        ...updates
      }
    }));
  };

  if (!isOpen) return null;

  const handleSave = () => {
    updateWebsiteConfig(formData);
    if (updateSchoolTenantInfo && activeSchoolId) {
      updateSchoolTenantInfo(activeSchoolId, {
        customDomain: customDomainInput,
        subdomain: subdomainInput
      });
    }
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleResetToDefault = () => {
    if (window.confirm('School website hi default settings-ah restore i duh em?')) {
      setFormData(INITIAL_WEBSITE_CONFIG);
      updateWebsiteConfig(INITIAL_WEBSITE_CONFIG);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">Public Website CMS & Live Editor</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                  Admin & Super Admin
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {activeSchoolInfo?.name || formData.schoolName}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                School public website thu, thlalak, streams, principal address leh facilities duh dana customize-na.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/25 flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Save Toast Notification */}
        {saveToast && (
          <div className="px-6 py-2.5 bg-emerald-950/90 border-b border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Website content updated and published live successfully!</span>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="px-6 pt-3 flex items-center gap-2 border-b border-slate-800 bg-slate-950/60 overflow-x-auto scrollbar-thin">
          {[
            { id: 'announcement', label: 'Announcement & Scrolling Banner', icon: Bell },
            { id: 'hero', label: 'Hero & Identity', icon: Sparkles },
            { id: 'about', label: 'About School, Vision & Heritage', icon: BookOpen },
            { id: 'principal', label: "Principal's Welcome", icon: Building2 },
            { id: 'programs', label: 'Academic Streams (5)', icon: GraduationCap },
            { id: 'facilities', label: 'Campus Facilities (4)', icon: ImageIcon },
            { id: 'contact', label: 'Contact & Social Links', icon: Phone },
            { id: 'domain', label: 'Domain & Web Address (DNS)', icon: Globe },
            { id: 'developer', label: 'Developer & Tech Support Identity', icon: Code2 },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
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

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 0: ANNOUNCEMENT & SCROLLING BANNER */}
          {activeTab === 'announcement' && (
            <div className="space-y-6">
              {/* Live Preview Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                      Live Banner Preview (Front Page-a a lan dan tur)
                    </h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border font-mono ${
                    banner.enabled !== false
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    {banner.enabled !== false ? '● ACTIVE ON FRONT PAGE' : '○ TURNED OFF / HIDDEN'}
                  </span>
                </div>

                {/* Render the actual banner preview */}
                <div className="rounded-xl overflow-hidden border border-slate-700/50 shadow-inner">
                  <PublicAnnouncementBanner config={banner} isPreview={true} />
                </div>
                <p className="text-[11px] text-slate-400">
                  Mouse i nghah (hover) hian scrolling hi chawplehhilhin a ding (pause) ang a, visitors-ten an click thei ang.
                </p>
              </div>

              {/* Master ON / OFF Toggle */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-purple-400" />
                    <span>Display Announcement Banner on Front Page</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Front page chung berah he scrolling announcement banner hi tarlang em? Duh hunah on/off theih a ni.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={banner.enabled !== false}
                    onChange={(e) => updateBanner({ enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Banner Text & Badge Content */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Announcement Text &amp; Badge</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Badge / Tag Text</label>
                    <input
                      type="text"
                      value={banner.badgeText || ''}
                      onChange={(e) => updateBanner({ badgeText: e.target.value })}
                      placeholder="e.g. ADMISSION 2026, NOTICE, URGENT"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Badge text tawi fel tak</span>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Announcement Message (Thu tarlan tur)</label>
                    <input
                      type="text"
                      value={banner.text || ''}
                      onChange={(e) => updateBanner({ text: e.target.value })}
                      placeholder="e.g. Online Admissions for Academic Session 2026 - 2027 are officially open..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Emoji (📢, 🎉, 🎓, ⚡, 🔔) pawh a hman theih vek</span>
                  </div>
                </div>
              </div>

              {/* Media / Icon / GIF / Image */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Media Icon, Animated GIF, or Image</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Animated GIFs &amp; Images supported</span>
                </div>

                {/* Media Type Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'preset_gif', label: 'Preset Animated GIF', icon: Sparkles },
                    { id: 'custom_url', label: 'Custom Image/GIF URL', icon: ImageIcon },
                    { id: 'emoji', label: 'Emoji Icon', icon: Bell },
                    { id: 'none', label: 'No Media (Text Only)', icon: X },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => updateBanner({ mediaType: type.id })}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                        (banner.mediaType || 'preset_gif') === type.id
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <type.icon className="w-4 h-4" />
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>

                {/* Preset GIF Selection */}
                {(!banner.mediaType || banner.mediaType === 'preset_gif') && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-2">Thlan theih Animated GIF-te:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {Object.values(PRESET_BANNER_GIFS).map((preset) => {
                        const isSelected = (banner.presetGif || 'celebration') === preset.id;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => updateBanner({ presetGif: preset.id })}
                            className={`p-3 rounded-xl border cursor-pointer transition flex flex-col items-center text-center gap-2 ${
                              isSelected
                                ? 'bg-purple-600/25 border-purple-500 shadow-md shadow-purple-600/20 ring-1 ring-purple-500'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-8 h-8 object-contain rounded"
                            />
                            <span className="text-[11px] font-medium text-slate-300 leading-tight">
                              {preset.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Custom Image or GIF URL Input */}
                {banner.mediaType === 'custom_url' && (
                  <div className="pt-2 space-y-2">
                    <label className="block text-xs font-semibold text-slate-400">
                      Custom GIF / Image Web URL (Giphy, Imgur, Tenor, Direct Link):
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="url"
                        value={banner.customMediaUrl || ''}
                        onChange={(e) => updateBanner({ customMediaUrl: e.target.value })}
                        placeholder="https://media.giphy.com/.../giphy.gif or image URL"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                      />
                      {banner.customMediaUrl && (
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 p-1 flex items-center justify-center shrink-0">
                          <img
                            src={banner.customMediaUrl}
                            alt="Custom Preview"
                            className="w-full h-full object-contain rounded"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Internet a GIF emaw image direct link (.gif, .png, .jpg, .webp) i paste thei e.
                    </span>
                  </div>
                )}

                {/* Emoji Input */}
                {banner.mediaType === 'emoji' && (
                  <div className="pt-2 space-y-2">
                    <label className="block text-xs font-semibold text-slate-400">Emoji Icon thlan tur:</label>
                    <div className="flex flex-wrap gap-2 items-center">
                      {['📢', '🎓', '🎉', '⚡', '🔔', '🔥', '🚀', '🌟', '🏆', '🗓️', '📝', '✨'].map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => updateBanner({ mediaEmoji: em })}
                          className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition ${
                            (banner.mediaEmoji || '📢') === em
                              ? 'bg-purple-600/30 border-purple-500 shadow-md ring-1 ring-purple-500'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                      <input
                        type="text"
                        value={banner.mediaEmoji || '📢'}
                        onChange={(e) => updateBanner({ mediaEmoji: e.target.value })}
                        className="w-16 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-center text-sm text-white focus:outline-none focus:border-purple-500"
                        title="Or type custom emoji"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Theme & Styling */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Color Theme &amp; Animation Styles</span>
                </h4>

                {/* Theme Cards */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Color Theme Palette:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Object.values(BANNER_THEMES).map((th) => {
                      const isSelected = (banner.theme || 'gradient_fire') === th.id;
                      return (
                        <div
                          key={th.id}
                          onClick={() => updateBanner({ theme: th.id })}
                          className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                            isSelected
                              ? 'border-purple-500 ring-2 ring-purple-500/50 shadow-lg'
                              : 'border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg shrink-0 border border-white/20 shadow-sm ${th.containerClass}`} />
                          <div className="text-left">
                            <span className="block text-xs font-bold text-white">{th.name}</span>
                            <span className="block text-[10px] text-slate-400">Click to apply theme</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scroll Speed & Animation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Scroll Animation Speed</label>
                    <select
                      value={banner.scrollSpeed || 'normal'}
                      onChange={(e) => updateBanner({ scrollSpeed: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                    >
                      <option value="normal">Normal (Standard Continuous Ticker - 22s)</option>
                      <option value="slow">Slow (Chill &amp; Relaxed - 38s)</option>
                      <option value="fast">Fast (Urgent Breaking Notice - 12s)</option>
                      <option value="static">Static (No Scrolling • Centered Bar)</option>
                    </select>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={banner.pauseOnHover !== false}
                        onChange={(e) => updateBanner({ pauseOnHover: e.target.checked })}
                        className="rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-0"
                      />
                      <span>Pause on Hover (Mouse nghah hian a ding ang)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={banner.showDismiss !== false}
                        onChange={(e) => updateBanner({ showDismiss: e.target.checked })}
                        className="rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-0"
                      />
                      <span>Allow Visitor to Dismiss [X] (Visitors-ten an khar theihna)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Click Action / Link Options */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                  <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Click Action &amp; Link Configuration</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Action on Click</label>
                    <select
                      value={banner.linkType || 'admission_portal'}
                      onChange={(e) => updateBanner({ linkType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                    >
                      <option value="admission_portal">Open Online Student Admission Form</option>
                      <option value="notices">Scroll to Public Notices &amp; Circulars</option>
                      <option value="custom_url">Open Custom URL / External Link</option>
                      <option value="none">No Link (Information Only)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Button / CTA Label</label>
                    <input
                      type="text"
                      value={banner.linkText || ''}
                      onChange={(e) => updateBanner({ linkText: e.target.value })}
                      placeholder="e.g. Apply Online, Read More"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {banner.linkType === 'custom_url' && (
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Custom Target URL</label>
                      <input
                        type="url"
                        value={banner.linkUrl || ''}
                        onChange={(e) => updateBanner({ linkUrl: e.target.value })}
                        placeholder="https://example.com/notification.pdf or website link"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">He URL hi tab tharah automatic-in a inhawng ang.</span>
                    </div>
                  )}

                  <div className="sm:col-span-3 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!banner.clickableBanner}
                        onChange={(e) => updateBanner({ clickableBanner: e.target.checked })}
                        className="rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-0"
                      />
                      <span>Make Entire Banner Clickable (Banner text khawi lai pawh hmeh hian link a hawng nghal ang)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: HERO & IDENTITY */}
          {activeTab === 'hero' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">School Official Name</label>
                  <input
                    type="text"
                    value={formData.schoolName || ''}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">School Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline || ''}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Motto (Thuvawn)</label>
                  <input
                    type="text"
                    value={formData.motto || ''}
                    onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Affiliation Line</label>
                  <input
                    type="text"
                    value={formData.affiliationBadge || ''}
                    onChange={(e) => setFormData({ ...formData, affiliationBadge: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Top Banner Announcement Badge</label>
                  <input
                    type="text"
                    value={formData.hero?.badge || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      hero: { ...formData.hero, badge: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Hero Headline Title</label>
                  <input
                    type="text"
                    value={formData.hero?.headline || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      hero: { ...formData.hero, headline: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Hero Sub-headline Paragraph</label>
                  <textarea
                    rows={3}
                    value={formData.hero?.subheadline || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      hero: { ...formData.hero, subheadline: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Hero Background / Campus Photo URL</label>
                  <input
                    type="text"
                    value={formData.hero?.heroImage || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      hero: { ...formData.hero, heroImage: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* 4 Stats */}
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">4 Front-Page Key Counter Stats</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(formData.hero?.stats || []).map((stat, i) => (
                    <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                      <label className="block text-[10px] text-slate-400 uppercase font-semibold">Stat #{i + 1} Value</label>
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => {
                          const nextStats = [...formData.hero.stats];
                          nextStats[i] = { ...nextStats[i], value: e.target.value };
                          setFormData({ ...formData, hero: { ...formData.hero, stats: nextStats } });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                      />
                      <label className="block text-[10px] text-slate-400 uppercase font-semibold mt-1">Label</label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => {
                          const nextStats = [...formData.hero.stats];
                          nextStats[i] = { ...nextStats[i], label: e.target.value };
                          setFormData({ ...formData, hero: { ...formData.hero, stats: nextStats } });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ABOUT SCHOOL, VISION & HERITAGE */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-800/40 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">School Heritage, Vision & Core Values</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    He section hian school chanchin (History), thlirna (Vision), hmachhawp (Mission), leh Core Values zirlaite leh khawtlang hnenah a tarlang dawn a ni. School tin te hian anmahni duh dan theuhin an her rem thei.
                  </p>
                </div>
              </div>

              {/* History & Background */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5 flex items-center gap-1.5">
                  <span>School Chanchin & History (Background Story)</span>
                  <span className="text-[10px] text-slate-500 font-normal lowercase">(public website #about section-ah a lang ang)</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.about?.history || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    about: {
                      ...(formData.about || {}),
                      history: e.target.value
                    }
                  })}
                  placeholder="Eng kumah nge din anih, a din chhan leh hmasawnna tlangpui ziah lanna..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white text-xs leading-relaxed focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Vision and Mission Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-purple-400 uppercase mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Vision (Thlirna & Tum Ram)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.about?.vision || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      about: {
                        ...(formData.about || {}),
                        vision: e.target.value
                      }
                    })}
                    placeholder="School thlirna sang ber leh nih tum..."
                    className="w-full bg-slate-950 border border-purple-900/40 rounded-xl p-3.5 text-white text-xs leading-relaxed focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-indigo-400 uppercase mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Mission (Hmachhawp & Hnathawh Tur)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.about?.mission || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      about: {
                        ...(formData.about || {}),
                        mission: e.target.value
                      }
                    })}
                    placeholder="Zirlaite hnen a hlawhtlinna thlen tura hmalakna..."
                    className="w-full bg-slate-950 border border-indigo-900/40 rounded-xl p-3.5 text-white text-xs leading-relaxed focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Quick Campus Stats Highlights */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                  Campus Quick Stats Highlights
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="block text-[11px] text-slate-400 font-semibold mb-1">Campus Land Area</span>
                    <input
                      type="text"
                      value={formData.about?.campusArea || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        about: {
                          ...(formData.about || {}),
                          campusArea: e.target.value
                        }
                      })}
                      placeholder="e.g. 5.2 Acres Lush Green"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="block text-[11px] text-slate-400 font-semibold mb-1">Student Strength</span>
                    <input
                      type="text"
                      value={formData.about?.studentStrength || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        about: {
                          ...(formData.about || {}),
                          studentStrength: e.target.value
                        }
                      })}
                      placeholder="e.g. 1,250+ Enrolled Students"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="block text-[11px] text-slate-400 font-semibold mb-1">Faculty & Staff Count</span>
                    <input
                      type="text"
                      value={formData.about?.facultyCount || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        about: {
                          ...(formData.about || {}),
                          facultyCount: e.target.value
                        }
                      })}
                      placeholder="e.g. 48+ Dedicated Educators"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Core Values Repeater */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase">Core Institutional Values</label>
                    <p className="text-[11px] text-slate-500">School thuvawn leh nunpui tlat atana ruahman te</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const currentVals = formData.about?.coreValues || [];
                      const newVal = {
                        id: `cv-${Date.now()}`,
                        title: 'New Value',
                        desc: 'Value description...'
                      };
                      setFormData({
                        ...formData,
                        about: {
                          ...(formData.about || {}),
                          coreValues: [...currentVals, newVal]
                        }
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Value</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(formData.about?.coreValues || []).map((val, idx) => (
                    <div key={val.id || idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                        {idx + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-400 font-semibold mb-1">Value Title</label>
                          <input
                            type="text"
                            value={val.title || ''}
                            onChange={(e) => {
                              const updatedVals = [...(formData.about?.coreValues || [])];
                              updatedVals[idx] = { ...updatedVals[idx], title: e.target.value };
                              setFormData({
                                ...formData,
                                about: { ...(formData.about || {}), coreValues: updatedVals }
                              });
                            }}
                            placeholder="e.g. Integrity & Faith"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs font-semibold focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-slate-400 font-semibold mb-1">Short Description</label>
                          <input
                            type="text"
                            value={val.desc || ''}
                            onChange={(e) => {
                              const updatedVals = [...(formData.about?.coreValues || [])];
                              updatedVals[idx] = { ...updatedVals[idx], desc: e.target.value };
                              setFormData({
                                ...formData,
                                about: { ...(formData.about || {}), coreValues: updatedVals }
                              });
                            }}
                            placeholder="A awmzia tawi fel tak..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedVals = (formData.about?.coreValues || []).filter((_, i) => i !== idx);
                          setFormData({
                            ...formData,
                            about: { ...(formData.about || {}), coreValues: updatedVals }
                          });
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition mt-1"
                        title="Delete value"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRINCIPAL'S WELCOME */}
          {activeTab === 'principal' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Principal Full Name</label>
                  <input
                    type="text"
                    value={formData.principalMessage?.name || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      principalMessage: { ...formData.principalMessage, name: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Principal Designation</label>
                  <input
                    type="text"
                    value={formData.principalMessage?.designation || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      principalMessage: { ...formData.principalMessage, designation: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Principal Official Photo URL</label>
                  <input
                    type="text"
                    value={formData.principalMessage?.photoUrl || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      principalMessage: { ...formData.principalMessage, photoUrl: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Highlight Quote</label>
                  <input
                    type="text"
                    value={formData.principalMessage?.quote || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      principalMessage: { ...formData.principalMessage, quote: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Full Welcome Address</label>
                  <textarea
                    rows={4}
                    value={formData.principalMessage?.fullMessage || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      principalMessage: { ...formData.principalMessage, fullMessage: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-purple-500 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACADEMIC STREAMS */}
          {activeTab === 'programs' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                School-in academic stream leh course a chhawpchhuah hrang hrangte detail heta ṭang hian a thlak danglam theih e:
              </p>

              {(formData.programs || []).map((prog, index) => (
                <div key={prog.id || index} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Stream / Program Title</label>
                      <input
                        type="text"
                        value={prog.title}
                        onChange={(e) => {
                          const nextProgs = [...formData.programs];
                          nextProgs[index] = { ...nextProgs[index], title: e.target.value };
                          setFormData({ ...formData, programs: nextProgs });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Class Duration</label>
                      <input
                        type="text"
                        value={prog.duration}
                        onChange={(e) => {
                          const nextProgs = [...formData.programs];
                          nextProgs[index] = { ...nextProgs[index], duration: e.target.value };
                          setFormData({ ...formData, programs: nextProgs });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Affiliation Badge</label>
                      <input
                        type="text"
                        value={prog.badge}
                        onChange={(e) => {
                          const nextProgs = [...formData.programs];
                          nextProgs[index] = { ...nextProgs[index], badge: e.target.value };
                          setFormData({ ...formData, programs: nextProgs });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Description & Subjects Offered</label>
                    <textarea
                      rows={2}
                      value={prog.description}
                      onChange={(e) => {
                        const nextProgs = [...formData.programs];
                        nextProgs[index] = { ...nextProgs[index], description: e.target.value };
                        setFormData({ ...formData, programs: nextProgs });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-300 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: CAMPUS FACILITIES */}
          {activeTab === 'facilities' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Campus laboratory, library, hostel leh sports facility thlalak leh description-te:
              </p>

              {(formData.facilities || []).map((fac, index) => (
                <div key={index} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Facility Title</label>
                      <input
                        type="text"
                        value={fac.title}
                        onChange={(e) => {
                          const nextFacs = [...formData.facilities];
                          nextFacs[index] = { ...nextFacs[index], title: e.target.value };
                          setFormData({ ...formData, facilities: nextFacs });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Image URL</label>
                      <input
                        type="text"
                        value={fac.image}
                        onChange={(e) => {
                          const nextFacs = [...formData.facilities];
                          nextFacs[index] = { ...nextFacs[index], image: e.target.value };
                          setFormData({ ...formData, facilities: nextFacs });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Facility Description</label>
                    <textarea
                      rows={2}
                      value={fac.description}
                      onChange={(e) => {
                        const nextFacs = [...formData.facilities];
                        nextFacs[index] = { ...nextFacs[index], description: e.target.value };
                        setFormData({ ...formData, facilities: nextFacs });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-300 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: CONTACT & SOCIAL LINKS */}
          {activeTab === 'contact' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Campus Physical Address</label>
                  <input
                    type="text"
                    value={formData.contact?.address || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, address: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Enquiry Phone Numbers</label>
                  <input
                    type="text"
                    value={formData.contact?.phone || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, phone: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Official Admission Email</label>
                  <input
                    type="email"
                    value={formData.contact?.email || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, email: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Office Visiting Hours</label>
                  <input
                    type="text"
                    value={formData.contact?.officeHours || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, officeHours: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Facebook Page URL</label>
                  <input
                    type="text"
                    value={formData.socialLinks?.facebook || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">YouTube Channel URL</label>
                  <input
                    type="text"
                    value={formData.socialLinks?.youtube || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Instagram Profile URL</label>
                  <input
                    type="text"
                    value={formData.socialLinks?.instagram || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">WhatsApp Official Chat Link</label>
                  <input
                    type="text"
                    value={formData.socialLinks?.whatsapp || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, whatsapp: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CUSTOM DOMAIN & DNS SETUP */}
          {activeTab === 'domain' && (
            <div className="space-y-6">
              {/* Domain Header Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 border border-blue-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-500/10">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Custom Domain & Web Address (DNS)</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Multi-Tenant Ready
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      School pual bik domain (e.g. <span className="text-blue-400 font-mono">www.schoolname.edu.in</span>) setup-na. School thlan kual ngai lo vin zirlai leh nu-leh-pa te'n direct-in an lut nghal ang.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setDnsCheckStatus('checking');
                      setTimeout(() => setDnsCheckStatus('active'), 1200);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition"
                  >
                    <Wifi className={`w-3.5 h-3.5 ${dnsCheckStatus === 'checking' ? 'animate-pulse text-amber-400' : 'text-emerald-400'}`} />
                    <span>{dnsCheckStatus === 'checking' ? 'Checking DNS...' : dnsCheckStatus === 'active' ? 'DNS Verified' : 'Test DNS Resolution'}</span>
                  </button>
                </div>
              </div>

              {/* Live Web Address URL Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* 1. System Cloud Path */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">1. Universal Cloud Path</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-xs font-mono text-purple-300 break-all select-all font-semibold">
                      https://sc-ms.vercel.app/{activeSchoolId}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2">Active & Always accessible</span>
                </div>

                {/* 2. Platform Subdomain */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-indigo-900/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">2. Free Subdomain</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Zero Setup</span>
                    </div>
                    <p className="text-xs font-mono text-indigo-300 break-all select-all font-semibold">
                      https://{subdomainInput || activeSchoolId}.scms.in
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2">Instant wildcard routing</span>
                </div>

                {/* 3. Official Custom Domain */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-blue-900/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">3. Custom School Domain</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                        customDomainInput 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {customDomainInput ? 'Configured' : 'Optional'}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-blue-300 break-all select-all font-semibold">
                      {customDomainInput ? `https://${customDomainInput}` : 'www.yourschool.edu.in'}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2">School Official Domain Brand</span>
                </div>
              </div>

              {/* Domain Input Form */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-400" />
                  <span>Domain & Subdomain Settings for {activeSchoolInfo?.name}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Subdomain Handle (Unique Slug)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={subdomainInput}
                        onChange={(e) => setSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="e.g. oha, stpauls, greenwood"
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-indigo-500 pr-24"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 pointer-events-none">
                        .scms.in
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Platform-a i school subdomain bik tur. Special character hman lovin a ziah zawm tur.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Official Custom Domain (.edu.in, .com, .in, .org)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customDomainInput}
                        onChange={(e) => setCustomDomainInput(e.target.value.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, ''))}
                        placeholder="e.g. www.stpaulsaizawl.edu.in"
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      School lamin domain in neihsa (GoDaddy / Namecheap etc. leisa) awmze nei takin dah rawh.
                    </p>
                  </div>
                </div>
              </div>

              {/* DNS Records Setup Guide */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>DNS Configuration Records (Domain Provider-ah dah tur)</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      In domain leina (GoDaddy, Namecheap, BigRock, Cloudflare) DNS Management-ah heng record 2 zinga pakhat hi dah tur a ni:
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Record 1: CNAME */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs flex-1">
                      <div>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase">Record Type</span>
                        <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 inline-block mt-0.5">
                          CNAME
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase">Name / Host</span>
                        <span className="font-mono text-white font-semibold block mt-0.5">www (emaw @)</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="block text-[10px] text-slate-500 font-bold uppercase">Value / Points To</span>
                        <span className="font-mono text-emerald-400 font-semibold block mt-0.5 select-all">
                          cname.vercel-dns.com
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('cname.vercel-dns.com');
                        setCopiedRecord('cname');
                        setTimeout(() => setCopiedRecord(null), 2000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition"
                    >
                      {copiedRecord === 'cname' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Value</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Record 2: A Record (Root Apex) */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs flex-1">
                      <div>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase">Record Type</span>
                        <span className="font-mono font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20 inline-block mt-0.5">
                          A Record
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase">Name / Host</span>
                        <span className="font-mono text-white font-semibold block mt-0.5">@ (Root)</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="block text-[10px] text-slate-500 font-bold uppercase">Value / IP Address</span>
                        <span className="font-mono text-blue-300 font-semibold block mt-0.5 select-all">
                          76.76.21.21
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('76.76.21.21');
                        setCopiedRecord('a');
                        setTimeout(() => setCopiedRecord(null), 2000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition"
                    >
                      {copiedRecord === 'a' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy IP</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Architecture & FAQs in Mizo */}
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Kalphung & Hriattirna Pawimawh (Multi-Tenant Domain Architecture):</span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-400">
                  <li>
                    <strong className="text-slate-200">A buaithlak miah lo:</strong> School tin ten domain hran theuh an neih theih nan server thar buatsaih a ngai lo va, Vercel-ah domain add zeuhin automatic-in a in-link nghal vek.
                  </li>
                  <li>
                    <strong className="text-slate-200">Free SSL (HTTPS / Padlock):</strong> Vercel-in domain tin tan Let's Encrypt SSL certificate a thlawnin a renew reng thin.
                  </li>
                  <li>
                    <strong className="text-slate-200">Automatic Branding & PWA:</strong> School domain atanga an luh chuan browser-in chu school logo, hming, leh theme colors chauh a phawrh a, mobile app-a an install pawhin anmahni school app liau liau angin a in-install ang.
                  </li>
                  <li>
                    <strong className="text-slate-200">DNS Thawh Hun (Propagation):</strong> DNS update hnuah minute 5 atanga darkar reilote chhungin internet khawvel pumah a rawn nung nghal thin.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 8: DEVELOPER & TECH SUPPORT PROFILE */}
          {activeTab === 'developer' && (
            <div className="space-y-6">
              {/* Header explanation & live status card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span>Developer &amp; Technical Support Profile</span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
                        Super Admin Config
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Main website front page leh school portal a developer biakpawhna, WhatsApp direct chat, leh technical support SLA tarlan tur edit-na.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.developerCredits?.enabled !== false}
                      onChange={(e) => updateDevCredits({ enabled: e.target.checked })}
                      className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Developer Support Active</span>
                  </label>
                </div>
              </div>

              {/* Visibility Toggles */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={formData.developerCredits?.showOnFrontPage !== false}
                    onChange={(e) => updateDevCredits({ showOnFrontPage: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-0 cursor-pointer w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-white block">Main Web Front Page-ah Tarlang Rawh</span>
                    <span className="text-[11px] text-slate-400">Website public footer-ah "Software Architect &amp; Support" badge leh modal a lang ang.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={formData.developerCredits?.showInPortalHelp !== false}
                    onChange={(e) => updateDevCredits({ showInPortalHelp: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-0 cursor-pointer w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-white block">Portal &amp; Staff Navigation-ah Tarlang Rawh</span>
                    <span className="text-[11px] text-slate-400">School portal navbar-ah "Developer &amp; Tech Support" link awm se zirtirtu leh admin ten an be thei ang.</span>
                  </div>
                </label>
              </div>

              {/* Developer Identity Details */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Primary Developer &amp; Studio Credentials
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Developer / Architect Name</label>
                    <input
                      type="text"
                      value={formData.developerCredits?.name || ''}
                      onChange={(e) => updateDevCredits({ name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g. Samuel (Lead Architect)"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Professional Title / Designation</label>
                    <input
                      type="text"
                      value={formData.developerCredits?.title || ''}
                      onChange={(e) => updateDevCredits({ title: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g. Lead Software Architect & Systems Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Studio / Agency / Organization</label>
                    <input
                      type="text"
                      value={formData.developerCredits?.company || ''}
                      onChange={(e) => updateDevCredits({ company: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g. Zoxs Technologies Mizoram"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Verification Badge Text</label>
                    <input
                      type="text"
                      value={formData.developerCredits?.badgeText || ''}
                      onChange={(e) => updateDevCredits({ badgeText: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="e.g. Verified Institutional Developer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Location / Operating Base</label>
                    <input
                      type="text"
                      value={formData.developerCredits?.location || ''}
                      onChange={(e) => updateDevCredits({ location: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g. Aizawl & Lunglei, Mizoram"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Portfolio / Studio Website URL</label>
                    <input
                      type="text"
                      value={formData.developerCredits?.website || ''}
                      onChange={(e) => updateDevCredits({ website: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="e.g. https://zoxs.dev"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Tagline / Architectural Bio Statement</label>
                  <textarea
                    rows={2}
                    value={formData.developerCredits?.tagline || ''}
                    onChange={(e) => updateDevCredits({ tagline: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="Brief description of engineering standards, mission or background..."
                  />
                </div>
              </div>

              {/* Direct Communication Channels */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-emerald-400" />
                  Direct Technical Support Channels &amp; Emergency Hotline
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-400 uppercase mb-1 flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp Direct Number (with Country Code)
                    </label>
                    <input
                      type="text"
                      value={formData.developerCredits?.whatsapp || ''}
                      onChange={(e) => updateDevCredits({ whatsapp: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      placeholder="e.g. +91 94361 22000"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">One-click WhatsApp chat link automatically opens with this number.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-indigo-400 uppercase mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      Voice Hotline / Telephone
                    </label>
                    <input
                      type="text"
                      value={formData.developerCredits?.phone || ''}
                      onChange={(e) => updateDevCredits({ phone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      placeholder="e.g. +91 94361 22000"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Direct click-to-call phone number on mobile & desktop.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-purple-400 uppercase mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      Technical Support Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.developerCredits?.email || ''}
                      onChange={(e) => updateDevCredits({ email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="e.g. dev.samuel@mizoramschool.edu"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Direct inquiries & support tickets will be routed here.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Support Availability &amp; Emergency Hours (SLA)
                  </label>
                  <input
                    type="text"
                    value={formData.developerCredits?.supportHours || ''}
                    onChange={(e) => updateDevCredits({ supportHours: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. Mon - Sat: 8:00 AM - 8:00 PM (24/7 Critical System Alerts)"
                  />
                </div>
              </div>

              {/* Supported Services / Architecture Highlights */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Engineering Services &amp; Capabilities List
                  </h4>
                  <span className="text-[10px] text-slate-500">Lines separated (1 per line)</span>
                </div>
                <textarea
                  rows={4}
                  value={Array.isArray(formData.developerCredits?.services) ? formData.developerCredits.services.join('\n') : ''}
                  onChange={(e) => updateDevCredits({ 
                    services: e.target.value.split('\n').filter(s => s.trim().length > 0)
                  })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 leading-relaxed font-mono"
                  placeholder="24/7 Priority Emergency Technical Support & Bug Resolving&#10;Custom Academic Modules, Class Tests & Examination Tools&#10;Cloud Firestore Sync & Daily Automated Database Backups&#10;Campus Hardware, Biometrics & Audio Bell Infrastructure"
                />
              </div>
            </div>
          )}
        </div>


        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefault}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {onViewWebsite && (
              <button
                onClick={() => {
                  onClose();
                  onViewWebsite();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5 text-purple-400" />
                <span>View Public Website</span>
              </button>
            )}

            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/25 flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Live</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
