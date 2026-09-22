import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Building2,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Users,
  BookOpen,
  Bus,
  HeartPulse,
  Utensils,
  CreditCard,
  Award,
  Globe,
  LogIn,
  Sliders,
  Zap,
  Check,
  ExternalLink,
  Laptop,
  Smartphone,
  ChevronRight,
  School,
  Database,
  Search,
  ChevronDown
} from 'lucide-react';
import { DEFAULT_REGISTERED_SCHOOLS } from '../services/tenantService';

export default function PlatformLandingView() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    schoolName: '',
    principalName: '',
    phone: '',
    email: '',
    district: 'Aizawl',
    message: ''
  });
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);

  const registeredSchools = DEFAULT_REGISTERED_SCHOOLS;

  const filteredSchools = registeredSchools.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.shortName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const coreModules = [
    {
      icon: Users,
      title: 'Student Information System (SIS)',
      desc: 'Complete student lifecycle from Nursery to Class 12, Aadhaar mapping, parent contacts, and digital dossier.'
    },
    {
      icon: Award,
      title: 'MBSE Continuous Assessment',
      desc: 'Quarterly, half-yearly, and promotion marksheets formatted to official Mizoram Board of School Education criteria.'
    },
    {
      icon: CreditCard,
      title: 'Smart Fee Desk & UPI QR',
      desc: 'Tuition, hostel, and admission billing with instant printable receipts and dynamic UPI QR code payments.'
    },
    {
      icon: Bus,
      title: 'Live GPS Bus Fleet Telemetry',
      desc: 'Real-time vehicle tracking across Aizawl and district roads with speed alerts, route stops, and pickup logs.'
    },
    {
      icon: Building2,
      title: 'Residential Hostel Suite',
      desc: 'Hostel room allocations, roll calls, outing gate passes with parent authorization, and mess meal calendars.'
    },
    {
      icon: Utensils,
      title: 'Smart Canteen & Meal Wallets',
      desc: 'Cashless student cafeteria with prepaid digital wallets, meal item logging, and daily nutritional balance.'
    },
    {
      icon: HeartPulse,
      title: 'Health Clinic & Infirmary',
      desc: 'Student health records, fever and vital tracking, first-aid logs, and instant parent emergency notifications.'
    },
    {
      icon: Globe,
      title: 'School Public Website CMS',
      desc: 'Independent public web presence for every academic center with online admission forms and notice boards.'
    },
    {
      icon: Database,
      title: 'Cloud Sync & Offline Persistence',
      desc: 'Engineered with real-time Firebase cloud synchronization and full offline local database resilience.'
    },
    {
      icon: Smartphone,
      title: 'Cross-Platform Mobile PWA',
      desc: 'Installs directly on Android, iPhone, and Windows desktop with native push notifications and low data mode.'
    },
    {
      icon: Sliders,
      title: 'Super Admin Developer Studio',
      desc: 'Multi-tenant master control hub, collection editors, REPL terminal, custom plugins, and backup exports.'
    },
    {
      icon: Zap,
      title: 'Zoxs Institutional AI Co-Pilot',
      desc: 'AI-assisted syllabus analysis, automated parent circular translation, and voice-assisted administrative query dispatch.'
    }
  ];

  const handleLaunchDemo = (role = null) => {
    if (role) {
      sessionStorage.setItem('zoxs_preferred_demo_role', role);
    }
    navigate('/demo');
  };

  const handlePartnerSubmit = (e) => {
    e.preventDefault();
    setPartnerSubmitted(true);
    setTimeout(() => {
      setPartnerSubmitted(false);
      setPartnerModalOpen(false);
      setPartnerForm({ schoolName: '', principalName: '', phone: '', email: '', district: 'Aizawl', message: '' });
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute top-96 right-1/4 w-[32rem] h-[32rem] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/3 left-10 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-600/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <School className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  ZOXS <span className="text-purple-400">SMS</span>
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold font-mono tracking-wider bg-purple-950/80 text-purple-300 border border-purple-800/60 rounded-full">
                  MIZORAM CLOUD ERP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Enterprise Multi-Tenant School Architecture</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#overview" className="hover:text-purple-400 transition">Overview</a>
            <a href="#demo-spotlight" className="hover:text-purple-400 transition flex items-center gap-1.5 text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Demo</span>
            </a>
            <a href="#schools" className="hover:text-purple-400 transition">School Directory</a>
            <a href="#modules" className="hover:text-purple-400 transition">12 Modules</a>
            <a href="#onboarding" className="hover:text-purple-400 transition">Onboard School</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleLaunchDemo()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center gap-2 transition transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden sm:inline">Launch Live Demo</span>
              <span className="sm:hidden">Demo</span>
            </button>

            <button
              onClick={() => navigate('/stpauls')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Sign in to a registered school portal"
            >
              <LogIn className="w-3.5 h-3.5 text-purple-400" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="overview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16 relative">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/70 border border-purple-800/60 text-purple-300 text-xs font-semibold shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Mizoram State-Ready Cloud ERP • MBSE Curriculum Compliant</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            The Digital Operating System for <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">Mizoram Schools</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Streamline admissions, MBSE report cards, fee desks, live GPS buses, hostel roll calls, and smart canteen wallets across multiple academic centers in a single unified cloud software.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <button
              onClick={() => handleLaunchDemo()}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2.5 transition transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Explore Interactive Live Demo School</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#schools"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition"
            >
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Select Registered School</span>
            </a>
          </div>

          {/* Quick Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Zero installation required</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Bilingual English & Mizo</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Works completely offline & online</span>
          </div>
        </div>

        {/* Hero Interactive Dashboard Mockup Preview */}
        <div className="mt-14 max-w-5xl mx-auto rounded-3xl bg-slate-900/60 border border-slate-800/80 p-3 sm:p-5 backdrop-blur-2xl shadow-2xl relative group">
          <div className="rounded-2xl bg-slate-950 border border-slate-800/70 overflow-hidden p-4 sm:p-6 space-y-5">
            {/* Mock Top bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Mizoram Model Demonstration Academy</h4>
                  <p className="text-[11px] text-slate-400">MBSE Affiliated • Session 2026 - 2027</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE ERP
                </span>
                <button
                  onClick={() => handleLaunchDemo()}
                  className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1 transition"
                >
                  <span>Test Drive</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Mock Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Total Students</p>
                <p className="text-xl sm:text-2xl font-black text-white">1,120</p>
                <p className="text-[10px] text-emerald-400 font-medium">96.3% Active Attendance</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Fee Collection</p>
                <p className="text-xl sm:text-2xl font-black text-white">₹ 48.2 L</p>
                <p className="text-[10px] text-cyan-400 font-medium">UPI & Cash receipts</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">GPS Bus Fleets</p>
                <p className="text-xl sm:text-2xl font-black text-white">6 Active</p>
                <p className="text-[10px] text-emerald-400 font-medium">Live GPS On Route</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Hostel Inmates</p>
                <p className="text-xl sm:text-2xl font-black text-white">180</p>
                <p className="text-[10px] text-purple-400 font-medium">Roll calls completed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship Live Demo Spotlight Section */}
      <section id="demo-spotlight" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900/90 to-indigo-950/60 border border-purple-500/40 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Interactive Demo Lab</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Mizoram Model Demonstration Academy <span className="text-purple-400">(/demo)</span>
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Want to test drive the entire software without setting up anything? Our demonstration academy comes fully pre-seeded with sample classes, teachers, student profiles, MBSE report cards, fee structures, and residential hostel rooms.
              </p>

              {/* Fast switch as specific role */}
              <div className="pt-2">
                <p className="text-xs text-slate-400 font-semibold uppercase mb-2">Test Drive Instantly as:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleLaunchDemo('principal')}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Principal (Full ERP Control)</span>
                  </button>
                  <button
                    onClick={() => handleLaunchDemo('teacher')}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Teacher (Marks & Attendance)</span>
                  </button>
                  <button
                    onClick={() => handleLaunchDemo('student')}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Student / Parent Portal</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="shrink-0 w-full lg:w-auto">
              <button
                onClick={() => handleLaunchDemo()}
                className="w-full lg:w-auto px-8 py-5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-base shadow-2xl shadow-purple-600/40 flex items-center justify-center gap-3 transition transform hover:scale-105"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Enter Demo School Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Registered Academic Centers Directory Section */}
      <section id="schools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" /> Academic Centers Directory
            </div>
            <h2 className="text-3xl font-black text-white">Select Your School / Institution</h2>
            <p className="text-slate-400 text-sm mt-1">Each registered school operates in a dedicated, isolated institutional environment.</p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search school name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>
        </div>

        {/* Schools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map((school) => {
            const isDemo = school.id === 'demo';
            return (
              <div
                key={school.id}
                className={`rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between space-y-5 relative group ${
                  isDemo
                    ? 'bg-gradient-to-br from-purple-950/40 via-slate-900 to-indigo-950/40 border-2 border-purple-500/50 shadow-xl shadow-purple-900/20'
                    : 'bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-lg'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-md"
                      style={{ backgroundColor: school.primaryColor || '#6366f1' }}
                    >
                      {school.shortName ? school.shortName.slice(0, 2).toUpperCase() : 'SC'}
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        {school.code}
                      </span>
                      {isDemo && (
                        <div className="mt-1">
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full">
                            ★ Interactive Demo
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* School Title & Motto */}
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-purple-300 transition">
                      {school.name}
                    </h3>
                    <p className="text-xs text-slate-400 italic mt-0.5">"{school.motto}"</p>
                  </div>

                  {/* Details Badge list */}
                  <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <span className="text-slate-500 font-medium">Location:</span> {school.address}
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <span className="text-slate-500 font-medium">Affiliation:</span> {school.affiliationBadge}
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <span className="text-slate-500 font-medium">Estd:</span> {school.establishedYear || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <button
                    onClick={() => navigate(`/${school.id}`)}
                    className="w-full py-2.5 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 hover:border-purple-500 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Enter Portal</span>
                  </button>

                  <button
                    onClick={() => {
                      sessionStorage.setItem('zoxs_force_tab', 'public_website');
                      navigate(`/${school.id}`);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Public Web</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 12 Core Enterprise Modules Section */}
      <section id="modules" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
            <Sliders className="w-4 h-4" /> Comprehensive Suite
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">12 Enterprise Modules Synchronized</h2>
          <p className="text-slate-400 text-sm">
            Everything your institution needs from gate pass verification to automated MBSE report cards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreModules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/40 hover:bg-slate-900 transition-all duration-300 space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition flex items-center justify-center border border-purple-500/20">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition">{mod.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{mod.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* School Onboarding / Partner with Us Section */}
      <section id="onboarding" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-black text-white">Ready to Modernize Your Institution?</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Join leading Mizoram schools already utilizing Zoxs SMS for unified administration, zero manual paper registers, and direct parent communication.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setPartnerModalOpen(true)}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition"
              >
                Request Institutional Setup & Trial
              </button>
              <button
                onClick={() => handleLaunchDemo()}
                className="px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-sm transition"
              >
                Test Demo School First
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <p className="font-bold text-slate-300 text-sm">ZOXS MIZORAM SCHOOL MANAGEMENT SYSTEM</p>
            <p>© {new Date().getFullYear()} Zoxs SMS Architecture • All Rights Reserved.</p>
            <p className="text-slate-400">Engineered for Mizoram Board of School Education (MBSE) High Schools & Higher Secondaries.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 font-semibold text-slate-400">
            <a href="#overview" className="hover:text-purple-400 transition">Overview</a>
            <a href="#demo-spotlight" className="hover:text-purple-400 transition">Live Demo (/demo)</a>
            <a href="#schools" className="hover:text-purple-400 transition">Schools</a>
            <a href="#modules" className="hover:text-purple-400 transition">Modules</a>
            <button onClick={() => setPartnerModalOpen(true)} className="hover:text-purple-400 transition">Partner With Us</button>
          </div>
        </div>
      </footer>

      {/* Partner with Us / School Registration Modal */}
      {partnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Institutional Onboarding Request</h3>
                <p className="text-xs text-slate-400">Register your school for Zoxs SMS setup & onboarding</p>
              </div>
              <button
                onClick={() => setPartnerModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {partnerSubmitted ? (
              <div className="py-10 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">Request Received!</h4>
                <p className="text-xs text-slate-300">
                  Our Mizoram technical deployment team will contact you shortly to configure your institution.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePartnerSubmit} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">School Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Model Higher Secondary School"
                    value={partnerForm.schoolName}
                    onChange={(e) => setPartnerForm({ ...partnerForm, schoolName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Principal / Contact Person</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pu K. Lalbiakmawia"
                      value={partnerForm.principalName}
                      onChange={(e) => setPartnerForm({ ...partnerForm, principalName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">District</label>
                    <select
                      value={partnerForm.district}
                      onChange={(e) => setPartnerForm({ ...partnerForm, district: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Aizawl">Aizawl</option>
                      <option value="Lunglei">Lunglei</option>
                      <option value="Champhai">Champhai</option>
                      <option value="Kolasib">Kolasib</option>
                      <option value="Serchhip">Serchhip</option>
                      <option value="Lawngtlai">Lawngtlai</option>
                      <option value="Siaha">Siaha</option>
                      <option value="Mamit">Mamit</option>
                      <option value="Hnahthial">Hnahthial</option>
                      <option value="Khawzawl">Khawzawl</option>
                      <option value="Saitual">Saitual</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 94361..."
                      value={partnerForm.phone}
                      onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Official Email</label>
                    <input
                      type="email"
                      required
                      placeholder="office@school.edu.in"
                      value={partnerForm.email}
                      onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Remarks / Requirements</label>
                  <textarea
                    rows={2}
                    placeholder="Approx student count, hostel requirements, or special MBSE streams..."
                    value={partnerForm.message}
                    onChange={(e) => setPartnerForm({ ...partnerForm, message: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition mt-2"
                >
                  Submit Onboarding Application
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
