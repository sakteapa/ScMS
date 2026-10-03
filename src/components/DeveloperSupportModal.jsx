import React, { useState, useEffect } from 'react';
import { 
  X, 
  Code2, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Clock, 
  Sparkles, 
  ExternalLink, 
  MessageCircle, 
  CheckCircle2, 
  Headphones, 
  Send,
  Building2,
  Copy,
  Check,
  Award,
  Edit3,
  Save,
  Lock,
  Unlock,
  AlertCircle
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export default function DeveloperSupportModal({ isOpen, onClose }) {
  const { websiteConfig, activeSchoolInfo, updateWebsiteConfig } = useSchool();
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'superadmin';

  const [copiedKey, setCopiedKey] = useState(null);
  const [quickMessage, setQuickMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  // Super Admin Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [showPinGate, setShowPinGate] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(null);
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const schoolName = activeSchoolInfo?.name || websiteConfig?.schoolName || 'School Management System';

  const dev = websiteConfig?.developerCredits || {
    enabled: true,
    showOnFrontPage: true,
    showInPortalHelp: true,
    name: 'Samuel (Lead Software Architect)',
    title: 'Lead Software Architect & Full-Stack Systems Engineer',
    company: 'Zoxs Technologies Mizoram',
    phone: '+91 94361 22000',
    whatsapp: '+91 94361 22000',
    email: 'samuel.developer@mizoramschool.edu',
    location: 'Aizawl & Lunglei, Mizoram',
    website: 'https://zoxs.dev',
    tagline: 'Engineering robust, next-gen digital infrastructure & academic management systems for educational institutions across Mizoram.',
    services: [
      '24/7 Priority Emergency Technical Support & Bug Resolving',
      'Custom Academic Modules, Class Tests & Examination Tools',
      'Cloud Firestore Sync & Daily Automated Database Backups',
      'Campus Hardware, Biometrics & Audio Bell Infrastructure'
    ],
    supportHours: 'Mon - Sat: 8:00 AM - 8:00 PM (24/7 Critical System Alerts)',
    badgeText: 'Verified Institutional Developer'
  };

  const [formData, setFormData] = useState({
    name: dev.name || 'Samuel (Lead Software Architect)',
    title: dev.title || 'Lead Software Architect & Full-Stack Systems Engineer',
    company: dev.company || 'Zoxs Technologies Mizoram',
    phone: dev.phone || '+91 94361 22000',
    whatsapp: dev.whatsapp || '+91 94361 22000',
    email: dev.email || 'samuel.developer@mizoramschool.edu',
    location: dev.location || 'Aizawl & Lunglei, Mizoram',
    website: dev.website || 'https://zoxs.dev',
    tagline: dev.tagline || 'Engineering robust, next-gen digital infrastructure & academic management systems for educational institutions across Mizoram.',
    badgeText: dev.badgeText || 'Verified Institutional Developer',
    supportHours: dev.supportHours || 'Mon - Sat: 8:00 AM - 8:00 PM (24/7 Critical System Alerts)',
    showOnFrontPage: dev.showOnFrontPage !== false,
    showInPortalHelp: dev.showInPortalHelp !== false,
    enabled: dev.enabled !== false
  });

  if (!isOpen) return null;

  const rawWhatsapp = (dev.whatsapp || dev.phone || '').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${rawWhatsapp}?text=${encodeURIComponent(`Chibai Developer, ${schoolName} atangin biakpawh ka duh che a, technical support / rawtna ka nei a ni.`)}`;

  const handleCopy = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSendQuickNote = (e) => {
    e.preventDefault();
    if (!quickMessage.trim()) return;
    const mailto = `mailto:${dev.email}?subject=${encodeURIComponent(`Support Request: ${schoolName}`)}&body=${encodeURIComponent(quickMessage)}`;
    window.open(mailto, '_blank');
    setMessageSent(true);
    setQuickMessage('');
    setTimeout(() => setMessageSent(false), 4000);
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pinInput.trim() === '1608') {
      setIsPinUnlocked(true);
      setShowPinGate(false);
      setIsEditing(true);
      setPinError(null);
      setPinInput('');
    } else {
      setPinError('PIN dik lo! Master Developer PIN "1608" chhu lut rawh le.');
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (updateWebsiteConfig) {
      updateWebsiteConfig({
        developerCredits: {
          ...dev,
          ...formData
        }
      });
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Banner */}
        <div className="relative px-6 py-4 sm:py-5 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-purple-600/30 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-lg font-bold text-white font-['Outfit']">
                  Software Developer &amp; Tech Support
                </h3>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Verified Architect
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Official technical architecture, maintenance &amp; custom software partner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => {
                  if (isSuperAdmin || isPinUnlocked) {
                    setIsEditing(true);
                  } else {
                    setShowPinGate(true);
                  }
                }}
                className="px-2.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Edit Developer Details (Super Admin / Master PIN 1608)"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit Details</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>Back to View</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PIN Security Prompt for Editing */}
        {showPinGate && !isEditing && (
          <div className="p-4 bg-purple-950/60 border-b border-purple-500/40 text-xs text-purple-200">
            <form onSubmit={handleVerifyPin} className="max-w-md mx-auto space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <Lock className="w-4 h-4 text-purple-400" />
                <span>Super Admin Developer Authorization</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Developer profile leh biakpawhna edit turin Super Admin / Developer Master PIN (<strong>1608</strong>) chhu lut rawh le:
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter PIN: 1608"
                  maxLength={6}
                  className="w-40 bg-slate-950 border border-purple-500/50 rounded-xl px-3 py-1.5 text-xs text-center font-mono text-white placeholder-slate-500 focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unlock</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPinGate(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              {pinError && (
                <p className="text-[11px] text-rose-400 font-semibold">{pinError}</p>
              )}
            </form>
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-300 scrollbar-thin">
          
          {/* EDIT FORM MODE */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-purple-400" />
                  Edit Developer Information &amp; Contact Details
                </span>
                <span className="text-[10px] text-purple-400 font-mono font-bold bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-800/40">
                  Super Admin Mode
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium">Developer Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium">Designation / Role Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium">Company / Firm Name</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium">Hotline Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium">WhatsApp Direct Chat Number</label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium">Developer Official Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium">Base City / Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium">Portfolio / Website Link</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-medium">Developer Bio / Institutional Tagline</label>
                <textarea
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Visibility Options</span>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showOnFrontPage}
                      onChange={(e) => setFormData({ ...formData, showOnFrontPage: e.target.checked })}
                      className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs text-white">Show on Public Web Front Page</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showInPortalHelp}
                      onChange={(e) => setFormData({ ...formData, showInPortalHelp: e.target.checked })}
                      className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs text-white">Show in ERP Portal Header (Dev Support)</span>
                  </label>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Developer profile updated &amp; saved successfully!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          ) : (
            /* VIEW DOSSIER MODE */
            <>
              {/* Main Developer Profile Card */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-purple-500/20 relative overflow-hidden space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 font-mono">
                      {dev.company || 'Zoxs Technologies'}
                    </span>
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      {dev.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      {dev.title || 'Lead Full-Stack Software Architect'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-semibold flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-purple-400" />
                      {dev.badgeText || 'Institutional Architect'}
                    </span>
                  </div>
                </div>

                {dev.tagline && (
                  <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-purple-500/60 pl-3 py-1">
                    "{dev.tagline}"
                  </p>
                )}

                {/* Location & Support SLA Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Location: <strong className="text-slate-200">{dev.location || 'Mizoram, India'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Support: <strong className="text-slate-200">{dev.supportHours || '24/7 Priority Emergency Alert'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Quick Contact Action Buttons */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                  <Headphones className="w-3.5 h-3.5 text-indigo-400" />
                  Direct Communication Channels (Biakpawhna)
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* WhatsApp Button */}
                  {rawWhatsapp && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 hover:border-emerald-500/60 text-white flex items-center gap-3 transition group shadow-lg shadow-emerald-950/30 cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Direct WhatsApp Chat</div>
                        <div className="text-xs font-bold text-white truncate font-mono">{dev.whatsapp || dev.phone}</div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400/60 group-hover:text-emerald-300" />
                    </a>
                  )}

                  {/* Direct Phone Call Button */}
                  {dev.phone && (
                    <div className="p-3.5 rounded-2xl bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 text-white flex items-center justify-between gap-3 transition group shadow-lg shadow-indigo-950/30">
                      <a 
                        href={`tel:${dev.phone.replace(/[^0-9+]/g, '')}`} 
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">Voice Hotline</div>
                          <div className="text-xs font-bold text-white truncate font-mono">{dev.phone}</div>
                        </div>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy(dev.phone, 'phone')}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                        title="Copy Phone Number"
                      >
                        {copiedKey === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  {/* Email Address Button */}
                  {dev.email && (
                    <div className="p-3.5 rounded-2xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-white flex items-center justify-between gap-3 transition group shadow-lg shadow-purple-950/30">
                      <a 
                        href={`mailto:${dev.email}?subject=${encodeURIComponent(`Inquiry from ${schoolName}`)}`} 
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">Official Email</div>
                          <div className="text-xs font-bold text-white truncate font-mono">{dev.email}</div>
                        </div>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy(dev.email, 'email')}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                        title="Copy Email Address"
                      >
                        {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  {/* Developer Website / Portfolio */}
                  {dev.website && (
                    <a
                      href={dev.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-white flex items-center gap-3 transition group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                        <Globe className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Website / Portfolio</div>
                        <div className="text-xs font-bold text-white truncate font-mono">{dev.website.replace('https://', '')}</div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                    </a>
                  )}
                </div>
              </div>

              {/* Technical Services Offered */}
              {dev.services && dev.services.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Technical Architecture &amp; System Capabilities
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {dev.services.map((srv, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span>{srv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Message Box */}
              <form onSubmit={handleSendQuickNote} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                    <Send className="w-3.5 h-3.5 text-purple-400" />
                    Quick Note / Technical Query to Developer
                  </label>
                  <span className="text-[10px] text-slate-500">Opens Email Composer</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={quickMessage}
                    onChange={(e) => setQuickMessage(e.target.value)}
                    placeholder="Type your message, issue, or feature request..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={!quickMessage.trim()}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Send Note</span>
                  </button>
                </div>
                {messageSent && (
                  <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Message sent to developer's email inbox!
                  </p>
                )}
              </form>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800/80 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Serving: <strong className="text-slate-300">{schoolName}</strong></span>
          </div>
          <div>
            Built with ⚡ by <strong className="text-purple-300">{dev.name}</strong> • ScMS Enterprise Edition
          </div>
        </div>
      </div>
    </div>
  );
}
