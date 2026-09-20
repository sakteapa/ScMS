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
  HeartHandshake
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export default function PublicWebsiteView({ onEnterPortal, onOpenAdmissions, onOpenEditor, onOpenMobileApp }) {
  const { websiteConfig, notices = [] } = useSchool();
  const { currentUser, isPrincipal } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const cfg = websiteConfig || {};
  const hero = cfg.hero || {};
  const principal = cfg.principalMessage || {};
  const programs = cfg.programs || [];
  const facilities = cfg.facilities || [];
  const contact = cfg.contact || {};
  const social = cfg.socialLinks || {};

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
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-blue-900/90 border-b border-purple-800/40 py-2 px-4 text-center text-xs font-semibold text-purple-200 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>{hero.badge || 'Admissions Open for Academic Session 2026 - 2027'}</span>
        <button 
          onClick={onOpenAdmissions}
          className="underline hover:text-white ml-2 inline-flex items-center gap-1 font-bold"
        >
          Apply Online <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* 2. PUBLIC HEADER & NAVBAR */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-tight">
                {cfg.schoolName || 'OHA (Oxford Higher Academy)'}
              </h1>
              <p className="text-[11px] font-medium text-slate-400 font-mono flex items-center gap-1.5">
                <span>{cfg.affiliationBadge || 'MBSE Affiliated • Lunglawn, Lunglei'}</span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#about" className="hover:text-purple-400 transition">About School</a>
            <a href="#academics" className="hover:text-purple-400 transition">Academics & Streams</a>
            <a href="#facilities" className="hover:text-purple-400 transition">Campus Facilities</a>
            <a href="#notices" className="hover:text-purple-400 transition">Public Notices</a>
            <a href="#contact" className="hover:text-purple-400 transition">Contact</a>
          </nav>

          {/* Actions: Mobile App, Portal Login & CMS Button */}
          <div className="flex items-center gap-2.5">
            {/* CMS Edit Button (If Admin/Principal or accessible) */}
            <button
              onClick={onOpenEditor}
              className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Open Website CMS Live Editor (Admin & Super Admin)"
            >
              <Edit3 className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">CMS Editor</span>
            </button>

            {/* Mobile App Download Button */}
            <button
              onClick={onOpenMobileApp}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
              title="Download Mobile Application"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Mobile App</span>
            </button>

            {/* Portal / ERP Login Button */}
            <button
              onClick={onEnterPortal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Enter ERP Portal</span>
            </button>

            {/* Mobile hamburger menu */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileNavOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-6 py-4 space-y-3 animate-in slide-in-from-top-2">
            <a href="#about" onClick={() => setIsMobileNavOpen(false)} className="block text-sm font-semibold text-slate-200 py-1.5">About School</a>
            <a href="#academics" onClick={() => setIsMobileNavOpen(false)} className="block text-sm font-semibold text-slate-200 py-1.5">Academics & Streams</a>
            <a href="#facilities" onClick={() => setIsMobileNavOpen(false)} className="block text-sm font-semibold text-slate-200 py-1.5">Campus Facilities</a>
            <a href="#notices" onClick={() => setIsMobileNavOpen(false)} className="block text-sm font-semibold text-slate-200 py-1.5">Public Notices</a>
            <a href="#contact" onClick={() => setIsMobileNavOpen(false)} className="block text-sm font-semibold text-slate-200 py-1.5">Contact & Location</a>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline & Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>{cfg.motto || 'Virtute et Labore (Huaisenna leh Thawhrimna)'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
                {hero.headline || 'Empowering Young Minds in the Hills of Mizoram'}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {hero.subheadline || 'Providing holistic secondary and higher secondary education with state-of-the-art laboratories, dedicated faculty, and vibrant campus life in Lunglawn, Lunglei, Mizoram.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={onOpenAdmissions}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 flex items-center gap-2.5 transition transform hover:-translate-y-0.5"
                >
                  <span>{hero.ctaPrimaryText || 'Apply for Admission Online'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#academics"
                  className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition"
                >
                  {hero.ctaSecondaryText || 'Explore Campus & Facilities'}
                </a>
              </div>

              {/* Quick Live Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-800/80">
                {(hero.stats || []).map((stat, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <p className="text-2xl sm:text-3xl font-black text-white font-mono">{stat.value}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-700 shadow-2xl shadow-purple-950/50 group">
                <img
                  src={hero.heroImage || 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=1200&auto=format&fit=crop&q=80'}
                  alt="School Campus"
                  className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Mizoram Board of School Education (MBSE)</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Science, Arts, Commerce & High School Streams with modern digital infrastructure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRINCIPAL'S WELCOME ADDRESS */}
      <section id="about" className="py-20 border-b border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Principal Photo Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative max-w-sm rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
                <img
                  src={principal.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'}
                  alt={principal.name}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                  <p className="text-base font-bold text-white">{principal.name}</p>
                  <p className="text-xs text-purple-400 font-medium">{principal.designation}</p>
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Leadership & Vision</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Principal’s Welcome Message
              </h2>

              <blockquote className="text-base sm:text-lg italic text-purple-200 border-l-4 border-purple-500 pl-4 py-1">
                "{principal.quote}"
              </blockquote>

              <p className="text-sm text-slate-300 leading-relaxed">
                {principal.fullMessage}
              </p>

              <div className="pt-2 flex items-center gap-4">
                <button
                  onClick={onOpenAdmissions}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-purple-600/25"
                >
                  <span>Admission Enquiry & Registration</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ACADEMIC PROGRAMS & STREAMS */}
      <section id="academics" className="py-20 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Comprehensive Curriculum</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Academic Streams & Offerings
            </h2>
            <p className="text-sm text-slate-400">
              MBSE curriculum integrated with modern labs, computer science, and competitive coaching for Class 9 through Class 12.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map(prog => (
              <div key={prog.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition duration-300 flex flex-col justify-between space-y-5 group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 group-hover:border-purple-500/40 transition">
                      {getProgramIcon(prog.icon)}
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-950 text-purple-300 text-[10px] font-bold border border-slate-800">
                      {prog.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition">
                      {prog.title}
                    </h3>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">{prog.duration}</p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {prog.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-purple-400">
                  <span>MBSE Syllabus 2026</span>
                  <button onClick={onOpenAdmissions} className="hover:text-white flex items-center gap-1 transition">
                    Apply <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CAMPUS FACILITIES & PHOTO GALLERY */}
      <section id="facilities" className="py-20 border-b border-slate-800/80 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <Building2 className="w-3.5 h-3.5" />
              <span>Campus Infrastructure</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              World-Class Learning Facilities
            </h2>
            <p className="text-sm text-slate-400">
              Providing holistic physical, technical, and academic infrastructure for student development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {facilities.map((fac, idx) => (
              <div key={idx} className="relative rounded-3xl overflow-hidden border border-slate-800 group shadow-xl">
                <img
                  src={fac.image}
                  alt={fac.title}
                  className="w-full h-64 sm:h-72 object-cover transform group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-6 space-y-1.5">
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
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

      {/* 7. LATEST PUBLIC NOTICES */}
      <section id="notices" className="py-20 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                <Bell className="w-3.5 h-3.5" />
                <span>Notice Board</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
                Public Circulars & Announcements
              </h2>
            </div>

            <button
              onClick={onEnterPortal}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto"
            >
              <span>View All Portal Notices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicNotices.map(notice => (
              <div key={notice.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20 text-[10px]">
                    {notice.category?.toUpperCase() || 'GENERAL'}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">{notice.date}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{notice.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{notice.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. ADMISSION CALL TO ACTION */}
      <section className="py-16 bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" /> Academic Session 2026 - 2027 Admissions Open
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to Shape Your Child’s Future?
          </h2>

          <p className="text-base text-slate-300 max-w-2xl mx-auto">
            Online admission forms are now actively accepted for Nursery through Class 12 (Science, Arts, Commerce). Limited seats available.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onOpenAdmissions}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-2xl shadow-purple-600/40 flex items-center gap-2 transition transform hover:-translate-y-0.5"
            >
              <span>Submit Admission Form Online</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenMobileApp}
              className="px-6 py-4 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 font-semibold text-sm flex items-center gap-2 transition"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Install Mobile App</span>
            </button>
          </div>
        </div>
      </section>

      {/* 9. CONTACT & FOOTER */}
      <footer id="contact" className="pt-16 pb-12 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: School Identity */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{cfg.schoolName}</h3>
                  <p className="text-[11px] text-slate-400">{cfg.tagline}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                Registered under the Mizoram Board of School Education (MBSE). Committed to academic excellence, Christian moral integrity, and social responsibility.
              </p>
              <div className="flex items-center gap-3 pt-2">
                {social.facebook && <a href={social.facebook} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition">Facebook</a>}
                {social.youtube && <a href={social.youtube} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition">• YouTube</a>}
                {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition">• Instagram</a>}
                {social.whatsapp && <a href={social.whatsapp} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition">• WhatsApp</a>}
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2">
                <li><button onClick={onOpenAdmissions} className="hover:text-purple-400 transition">Online Admission Form</button></li>
                <li><button onClick={onEnterPortal} className="hover:text-purple-400 transition">Staff & Student Login</button></li>
                <li><button onClick={onOpenMobileApp} className="hover:text-purple-400 transition">Install Mobile Application</button></li>
                <li><a href="#academics" className="hover:text-purple-400 transition">Courses & Streams</a></li>
                <li><a href="#facilities" className="hover:text-purple-400 transition">Campus Facilities</a></li>
              </ul>
            </div>

            {/* Column 3: Contact Details */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contact Us</h4>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{contact.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{contact.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{contact.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{contact.officeHours}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© 2026 {cfg.schoolName}. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span>Powered by ZOXS School Management Platform</span>
              <span>•</span>
              <button onClick={onEnterPortal} className="text-purple-400 hover:underline">Portal Access</button>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
