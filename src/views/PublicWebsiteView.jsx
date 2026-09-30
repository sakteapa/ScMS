import React, { useState } from 'react';
import { 
  Building2, 
  GraduationCap, 
  BookOpen, 
  Award, 
  Sparkles, 
  ArrowRight, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ChevronRight, 
  ExternalLink, 
  Smartphone, 
  LogIn, 
  Edit3, 
  CheckCircle2, 
  Atom, 
  TrendingUp, 
  ShieldCheck, 
  Calendar, 
  Bell, 
  Users, 
  Menu, 
  X,
  HeartHandshake,
  School,
  ChevronDown,
  Laptop,
  AlertTriangle,
  Printer
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import PublicAnnouncementBanner from '../components/PublicAnnouncementBanner';
import SchoolRulesModal from '../components/SchoolRulesModal';

export default function PublicWebsiteView({ onEnterPortal, onOpenAdmissions, onOpenEditor, onOpenMobileApp, onOpenRules }) {
  const { 
    websiteConfig, 
    schoolRules = [],
    notices = [], 
    activeSchoolInfo, 
    registeredSchools = [], 
    activeSchoolId, 
    switchSchool 
  } = useSchool();
  const { currentUser, isPrincipal, isSuperAdmin } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSchoolMenuOpen, setIsSchoolMenuOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  const cfg = websiteConfig || {};
  const hero = cfg.hero || {};
  const principal = cfg.principalMessage || {};
  const programs = cfg.programs || [];
  const facilities = cfg.facilities || [];
  const contact = cfg.contact || {};
  const social = cfg.socialLinks || {};

  const schoolDisplayName = cfg.schoolName || activeSchoolInfo?.name || 'Our School';
  const affiliationDisplayName = cfg.affiliationBadge || cfg.tagline || activeSchoolInfo?.affiliationBadge || 'MBSE Affiliated';
  const schoolMotto = cfg.motto || activeSchoolInfo?.motto || 'Excellence in Education';
  const contactAddress = contact.address || activeSchoolInfo?.address || '';
  const contactPhone = contact.phone || activeSchoolInfo?.contactPhone || '';
  const contactEmail = contact.email || activeSchoolInfo?.contactEmail || '';

  const publicNotices = notices.slice(0, 4);

  const getProgramIcon = (iconName) => {
    switch (iconName) {
      case 'Atom': return <Atom className="w-6 h-6 text-cyan-400" />;
      case 'TrendingUp': return <TrendingUp className="w-6 h-6 text-emerald-400" />;
      case 'Award': return <Award className="w-6 h-6 text-amber-400" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-purple-400" />;
      default: return <BookOpen className="w-6 h-6 text-indigo-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
      {/* 1. TOP ANNOUNCEMENT & SCROLLING BANNER */}
      <PublicAnnouncementBanner
        config={cfg.announcementBanner || {
          enabled: true,
          badgeText: 'ADMISSION 2026',
          text: '🎉 Online Admissions for Academic Session 2026 - 2027 are officially open! Limited seats available in Science, Arts & Commerce streams. Apply online before June 30.',
          mediaType: 'preset_gif',
          presetGif: 'celebration',
          linkType: 'admission_portal',
          linkText: 'Apply Online',
          theme: 'gradient_fire',
          scrollSpeed: 'normal',
          pauseOnHover: true,
          clickableBanner: false,
          showDismiss: true
        }}
        onOpenAdmissions={onOpenAdmissions}
      />

      {/* 2. PUBLIC HEADER & NAVBAR */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2.5 sm:gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base lg:text-lg font-extrabold text-white tracking-tight leading-tight truncate">
                {schoolDisplayName}
              </h1>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 font-mono flex items-center gap-1 truncate">
                <span className="truncate">{affiliationDisplayName}</span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#about" className="hover:text-purple-400 transition">About School</a>
            <a href="#academics" className="hover:text-purple-400 transition">Academics &amp; Streams</a>
            <a href="#facilities" className="hover:text-purple-400 transition">Campus Facilities</a>
            <a href="#rules" className="hover:text-purple-400 transition">Rules &amp; Code of Conduct</a>
            <a href="#notices" className="hover:text-purple-400 transition">Public Notices</a>
            <a href="#contact" className="hover:text-purple-400 transition">Contact</a>
          </nav>

          {/* Actions: Mobile App, Portal Login & CMS Button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* CMS Edit Button (Visible only to Logged In Admin / Principal / Super Admin) */}
            {(currentUser?.role === 'superadmin' || currentUser?.role === 'principal' || currentUser?.role === 'admin') && (
              <button
                onClick={onOpenEditor}
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                title="Open Website CMS Live Editor (Admin & Super Admin only)"
              >
                <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">CMS Editor</span>
              </button>
            )}

            {/* PC Software & Mobile App Download Button */}
            <button
              onClick={onOpenMobileApp}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
              title="Download & Install PC Software & Mobile App for this School"
            >
              <Laptop className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden md:inline">PC & Phone App</span>
            </button>

            {/* Academic Center Switcher: SuperAdmin only, else static proud school badge */}
            {isSuperAdmin && registeredSchools.length > 1 ? (
              <div className="relative">
                <button
                  onClick={() => setIsSchoolMenuOpen(!isSchoolMenuOpen)}
                  className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-slate-200 text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition cursor-pointer"
                  title="Select Academic Center / School (Super Admin Only)"
                >
                  <School className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="hidden sm:inline max-w-[130px] truncate">{activeSchoolInfo?.shortName || activeSchoolInfo?.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                {isSchoolMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Super Admin Center Switcher</span>
                      <span className="text-xs text-indigo-300 font-semibold">{activeSchoolInfo?.name}</span>
                    </div>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {registeredSchools.map((sch) => (
                        <button
                          key={sch.id}
                          onClick={() => {
                            setIsSchoolMenuOpen(false);
                            if (switchSchool) switchSchool(sch.id);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                            activeSchoolId === sch.id
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-600/30'
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-semibold truncate">{sch.name}</p>
                            <p className={`text-[10px] truncate ${activeSchoolId === sch.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                              {sch.address || sch.affiliationBadge}
                            </p>
                          </div>
                          {activeSchoolId === sch.id && (
                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold shrink-0">Active</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div 
                className="hidden sm:flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-xs font-semibold"
                title={`${activeSchoolInfo?.name}`}
              >
                <School className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="max-w-[150px] truncate">{activeSchoolInfo?.shortName || activeSchoolInfo?.name}</span>
              </div>
            )}

            {/* Portal / ERP Login Button */}
            <button
              onClick={onEnterPortal}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 sm:gap-2 transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Enter ERP Portal</span>
              <span className="sm:hidden">Portal</span>
            </button>

            {/* Mobile hamburger menu */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileNavOpen && (
          <div className="lg:hidden bg-slate-900/95 border-b border-slate-800 px-4 py-3 space-y-2 backdrop-blur-xl animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-800/80">
              <button
                onClick={() => { setIsMobileNavOpen(false); onEnterPortal(); }}
                className="w-full py-2 px-3 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Portal Login</span>
              </button>
              <button
                onClick={() => { setIsMobileNavOpen(false); onOpenAdmissions(); }}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Admissions</span>
              </button>
            </div>

            {/* Mobile School Switcher: SuperAdmin only */}
            {isSuperAdmin && registeredSchools.length > 1 ? (
              <div className="py-2 border-b border-slate-800/80 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Academic Center (Super Admin):</p>
                <div className="grid grid-cols-1 gap-1">
                  {registeredSchools.map((sch) => (
                    <button
                      key={sch.id}
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        if (switchSchool) switchSchool(sch.id);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                        activeSchoolId === sch.id
                          ? 'bg-purple-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">{sch.shortName || sch.name}</span>
                      {activeSchoolId === sch.id && <span className="text-[10px] font-mono">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-2 px-2 border-b border-slate-800/80 flex items-center gap-2">
                <School className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-300 truncate">{activeSchoolInfo?.name}</span>
              </div>
            )}

            <a href="#about" onClick={() => setIsMobileNavOpen(false)} className="block text-xs font-semibold text-slate-200 py-2 px-2.5 rounded-lg hover:bg-slate-800 transition">About School</a>
            <a href="#academics" onClick={() => setIsMobileNavOpen(false)} className="block text-xs font-semibold text-slate-200 py-2 px-2.5 rounded-lg hover:bg-slate-800 transition">Academics &amp; Streams</a>
            <a href="#facilities" onClick={() => setIsMobileNavOpen(false)} className="block text-xs font-semibold text-slate-200 py-2 px-2.5 rounded-lg hover:bg-slate-800 transition">Campus Facilities</a>
            <a href="#rules" onClick={() => setIsMobileNavOpen(false)} className="block text-xs font-semibold text-slate-200 py-2 px-2.5 rounded-lg hover:bg-slate-800 transition">Rules &amp; Code of Conduct</a>
            <a href="#notices" onClick={() => setIsMobileNavOpen(false)} className="block text-xs font-semibold text-slate-200 py-2 px-2.5 rounded-lg hover:bg-slate-800 transition">Public Notices</a>
            <a href="#contact" onClick={() => setIsMobileNavOpen(false)} className="block text-xs font-semibold text-slate-200 py-2 px-2.5 rounded-lg hover:bg-slate-800 transition">Contact &amp; Location</a>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Headline & Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-[11px] sm:text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>{schoolMotto}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
                {hero.headline || 'Empowering Young Minds in the Hills of Mizoram'}
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {hero.subheadline || 'Providing holistic secondary and higher secondary education with state-of-the-art laboratories, dedicated faculty, and vibrant campus life in Lunglawn, Lunglei, Mizoram.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1 sm:pt-2">
                <button
                  onClick={onOpenAdmissions}
                  className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2.5 transition transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>{hero.ctaPrimaryText || 'Apply for Admission Online'}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <a
                  href="#academics"
                  className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm transition text-center flex items-center justify-center"
                >
                  {hero.ctaSecondaryText || 'Explore Campus & Facilities'}
                </a>
              </div>

              {/* Quick Live Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-6 sm:pt-8 border-t border-slate-800/80">
                {(hero.stats || []).map((stat, i) => (
                  <div key={i} className="text-center lg:text-left p-3 rounded-2xl bg-slate-900/40 border border-slate-800/50 sm:bg-transparent sm:border-0 sm:p-0">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-mono">{stat.value}</p>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative mt-2 lg:mt-0">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-700 shadow-2xl shadow-purple-950/50 group">
                <img
                  src={hero.heroImage || 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=1200&auto=format&fit=crop&q=80'}
                  alt="School Campus"
                  className="w-full h-56 sm:h-80 lg:h-96 object-cover transform group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Mizoram Board of School Education (MBSE)</span>
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 line-clamp-2">
                    Science, Arts, Commerce &amp; High School Streams with modern digital infrastructure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ABOUT SCHOOL, HERITAGE, VISION & PRINCIPAL'S DESK */}
      <section id="about" className="py-12 sm:py-20 border-b border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
          {/* Header Title */}
          <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20">
              <BookOpen className="w-3.5 h-3.5" />
              <span>About {schoolDisplayName}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Heritage, Vision &amp; Core Institutional Values
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              {cfg.motto ? `"${cfg.motto}" — ` : ''}Building character, intellectual curiosity, and grounded leadership in Mizoram.
            </p>
          </div>

          {/* School History / Background Narrative */}
          {cfg.about?.history && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-slate-800/80 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 text-purple-400">
                <School className="w-5 h-5" />
                <h3 className="text-base sm:text-lg font-bold text-white">Our Story &amp; Heritage</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {cfg.about.history}
              </p>
            </div>
          )}

          {/* Vision & Mission Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-950/30 via-slate-900/60 to-slate-950 border border-purple-800/40 shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">Our Vision</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {cfg.about?.vision || 'To emerge as a premier educational institution fostering academic excellence, moral leadership, and community service.'}
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-slate-950 border border-indigo-800/40 shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">Our Mission</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {cfg.about?.mission || 'Providing holistic education combining rigorous academics, modern technology, and values that inspire students to excel.'}
              </p>
            </div>
          </div>

          {/* Institutional Highlights Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">Campus Area</span>
              <p className="text-sm sm:text-base font-extrabold text-white">{cfg.about?.campusArea || 'Spacious Campus'}</p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">Student Body</span>
              <p className="text-sm sm:text-base font-extrabold text-cyan-400">{cfg.about?.studentStrength || '1,000+ Enrolled'}</p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">Faculty &amp; Staff</span>
              <p className="text-sm sm:text-base font-extrabold text-purple-400">{cfg.about?.facultyCount || '45+ Dedicated'}</p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">Affiliation</span>
              <p className="text-sm sm:text-base font-extrabold text-emerald-400">{affiliationDisplayName}</p>
            </div>
          </div>

          {/* Core Values Section */}
          {(cfg.about?.coreValues || []).length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">Core Institutional Values</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {cfg.about.coreValues.map((val, idx) => (
                  <div key={val.id || idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{val.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{val.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Principal's Welcome Address */}
          <div className="p-6 sm:p-10 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
              {/* Principal Photo Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-[280px] sm:max-w-sm rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
                  <img
                    src={principal.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'}
                    alt={principal.name}
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                    <p className="text-sm sm:text-base font-bold text-white">{principal.name}</p>
                    <p className="text-[11px] sm:text-xs text-purple-400 font-medium">{principal.designation}</p>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>Leadership Desk</span>
                </div>

                <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  Principal’s Welcome Message
                </h2>

                <blockquote className="text-sm sm:text-base lg:text-lg italic text-purple-200 border-l-4 border-purple-500 pl-3 sm:pl-4 py-1 text-left">
                  "{principal.quote}"
                </blockquote>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-left">
                  {principal.fullMessage}
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <button
                    onClick={onOpenAdmissions}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 cursor-pointer"
                  >
                    <span>Admission Enquiry &amp; Registration</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setIsRulesModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>View Student Code of Conduct &amp; Rules</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ACADEMIC PROGRAMS & STREAMS */}
      <section id="academics" className="py-12 sm:py-20 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Comprehensive Curriculum</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Academic Streams &amp; Offerings
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              MBSE curriculum integrated with modern labs, computer science, and competitive coaching for Class 9 through Class 12.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {programs.map(prog => (
              <div key={prog.id} className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition duration-300 flex flex-col justify-between space-y-4 sm:space-y-5 group">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-950 border border-slate-800 group-hover:border-purple-500/40 transition">
                      {getProgramIcon(prog.icon)}
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-950 text-purple-300 text-[10px] font-bold border border-slate-800">
                      {prog.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition">
                      {prog.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs font-mono text-slate-400 mt-0.5">{prog.duration}</p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {prog.description}
                  </p>
                </div>

                <div className="pt-3 sm:pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-purple-400">
                  <span>MBSE Syllabus 2026</span>
                  <button onClick={onOpenAdmissions} className="hover:text-white flex items-center gap-1 transition cursor-pointer">
                    Apply <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CAMPUS FACILITIES & PHOTO GALLERY */}
      <section id="facilities" className="py-12 sm:py-20 border-b border-slate-800/80 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <Building2 className="w-3.5 h-3.5" />
              <span>Campus Infrastructure</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              World-Class Learning Facilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Providing holistic physical, technical, and academic infrastructure for student development.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {facilities.map((fac, idx) => (
              <div key={idx} className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800 group shadow-xl">
                <img
                  src={fac.image}
                  alt={fac.title}
                  className="w-full h-48 sm:h-64 md:h-72 object-cover transform group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 space-y-1 sm:space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition">
                    {fac.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {fac.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6B. INSTITUTIONAL RULES & CODE OF CONDUCT */}
      <section id="rules" className="py-12 sm:py-20 border-b border-slate-800/80 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Student Code of Conduct</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mt-1 sm:mt-2">
                Rules &amp; Institutional Regulations
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                Official disciplinary regulations, mandatory attendance standards, and statutory campus conduct for {schoolDisplayName}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(currentUser?.role === 'superadmin' || isPrincipal || currentUser?.role === 'admin') && (
                <button
                  onClick={() => setIsRulesModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="Edit Institutional Rules"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Rules</span>
                </button>
              )}

              <button
                onClick={() => setIsRulesModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-amber-600/20 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Full Handbook &amp; Print (PDF)</span>
              </button>
            </div>
          </div>

          {/* Quick Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schoolRules.slice(0, 6).map((rule, idx) => (
              <div 
                key={rule.id || idx}
                onClick={() => setIsRulesModalOpen(true)}
                className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between space-y-3 cursor-pointer group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-400 border border-amber-500/20 font-semibold text-[10px] uppercase">
                      {rule.categoryLabel || rule.category}
                    </span>
                    <span className="text-slate-500 font-mono text-[10px]">#{idx + 1}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-200 transition">
                    {rule.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {rule.description}
                  </p>
                </div>

                {rule.penalty && (
                  <div className="pt-2 border-t border-slate-900 text-[11px] text-amber-300/90 flex items-center gap-1.5 font-medium">
                    <span className="font-bold uppercase text-[9px] text-amber-400">Penalty:</span>
                    <span className="truncate">{rule.penalty}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/20 via-slate-900/60 to-slate-950 border border-amber-900/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                All students and parents must sign and adhere to the Institutional Code of Conduct upon admission.
              </span>
            </div>
            <button
              onClick={() => setIsRulesModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>Explore all {schoolRules.length} rules</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. LATEST PUBLIC NOTICES */}
      <section id="notices" className="py-12 sm:py-20 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                <Bell className="w-3.5 h-3.5" />
                <span>Notice Board</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mt-1 sm:mt-2">
                Public Circulars &amp; Announcements
              </h2>
            </div>

            <button
              onClick={onEnterPortal}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
            >
              <span>View All Portal Notices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {publicNotices.map(notice => (
              <div key={notice.id} className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20 text-[10px]">
                    {notice.category?.toUpperCase() || 'GENERAL'}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px] sm:text-[11px]">{notice.date}</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white">{notice.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{notice.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. ADMISSION CALL TO ACTION */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Academic Session 2026 - 2027 Admissions Open
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Ready to Shape Your Child’s Future?
          </h2>

          <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto">
            Online admission forms are now actively accepted for Nursery through Class 12 (Science, Arts, Commerce). Limited seats available.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 w-full max-w-md mx-auto sm:max-w-none">
            <button
              onClick={onOpenAdmissions}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-purple-600/40 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Submit Admission Form Online</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>

            <button
              onClick={onOpenMobileApp}
              className="w-full sm:w-auto px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Install Mobile App</span>
            </button>
          </div>
        </div>
      </section>

      {/* 9. CONTACT & FOOTER */}
      <footer id="contact" className="pt-12 sm:pt-16 pb-8 sm:pb-12 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Column 1: School Identity */}
            <div className="space-y-3 sm:space-y-4 sm:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">{cfg.schoolName}</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">{cfg.tagline}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                Registered under the Mizoram Board of School Education (MBSE). Committed to academic excellence, Christian moral integrity, and social responsibility.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {social.facebook && <a href={social.facebook} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition">Facebook</a>}
                {social.youtube && <a href={social.youtube} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition">• YouTube</a>}
                {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition">• Instagram</a>}
                {social.whatsapp && <a href={social.whatsapp} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition">• WhatsApp</a>}
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-2.5 sm:space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs">
                <li><button onClick={onOpenAdmissions} className="hover:text-purple-400 transition cursor-pointer">Online Admission Form</button></li>
                <li><button onClick={onEnterPortal} className="hover:text-purple-400 transition cursor-pointer">Staff &amp; Student Login</button></li>
                <li><button onClick={onOpenMobileApp} className="hover:text-purple-400 transition cursor-pointer">Install Mobile Application</button></li>
                <li><a href="#academics" className="hover:text-purple-400 transition">Courses &amp; Streams</a></li>
                <li><a href="#facilities" className="hover:text-purple-400 transition">Campus Facilities</a></li>
              </ul>
            </div>

            {/* Column 3: Contact Details */}
            <div className="space-y-2.5 sm:space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Contact Us</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{contactAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{contactPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{contactEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{contact.officeHours || 'Mon - Fri: 8:30 AM - 3:30 PM'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 sm:pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] sm:text-[11px] text-slate-500 text-center sm:text-left">
            <p>© 2026 {schoolDisplayName}. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span>Powered by ZOXS School Management Platform</span>
              <span>•</span>
              <button onClick={onEnterPortal} className="text-purple-400 hover:underline cursor-pointer">Portal Access</button>
            </p>
          </div>
        </div>
      </footer>

      {/* School Rules & Regulations Handbook Modal */}
      <SchoolRulesModal 
        isOpen={isRulesModalOpen} 
        onClose={() => setIsRulesModalOpen(false)} 
      />
    </div>
  );
}
