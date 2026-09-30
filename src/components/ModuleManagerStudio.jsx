import React, { useState, useMemo } from 'react';
import {
  Sliders,
  Check,
  X,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Building2,
  Bus,
  UtensilsCrossed,
  Shirt,
  BookOpen,
  HeartPulse,
  ShieldCheck,
  Package,
  GraduationCap,
  FileText,
  FileCheck,
  CalendarDays,
  Calendar,
  QrCode,
  CreditCard,
  Clock,
  DollarSign,
  UserPlus,
  BarChart3,
  Radio,
  Video,
  MessageSquare,
  Bell,
  Award,
  Globe,
  Users,
  Power,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export const MASTER_MODULES_CATALOG = [
  // 1. Core Academics
  {
    id: 'academics',
    name: 'Academics & Exams',
    mizoName: 'Zirlai & Exam Enkawlna',
    category: 'academics',
    categoryName: 'Core Academics',
    icon: GraduationCap,
    desc: 'MBSE term examinations, subject management, grade scales, and teacher marks allocation.',
    roles: ['superadmin', 'principal', 'vice_principal', 'teacher'],
    defaultEnabled: true,
    accent: 'indigo'
  },
  {
    id: 'report_cards',
    name: 'Report Card Generator',
    mizoName: 'Report Card & Marksheet',
    category: 'academics',
    categoryName: 'Core Academics',
    icon: FileText,
    desc: '3-tier MBSE standard report cards, marks sheets, class rank analysis, and PDF export.',
    roles: ['superadmin', 'principal', 'vice_principal', 'teacher'],
    defaultEnabled: true,
    accent: 'indigo'
  },
  {
    id: 'certificates',
    name: 'Certificates & TC',
    mizoName: 'Lehkha Pawimawh & TC',
    category: 'academics',
    categoryName: 'Core Academics',
    icon: FileCheck,
    desc: 'Official MBSE Transfer Certificates, character certificates, bonafide, and provisional diplomas.',
    roles: ['superadmin', 'principal', 'vice_principal'],
    defaultEnabled: true,
    accent: 'indigo'
  },
  {
    id: 'routine',
    name: 'Class Routine & Time Table',
    mizoName: 'Class Hun Bi & Timetable',
    category: 'academics',
    categoryName: 'Core Academics',
    icon: CalendarDays,
    desc: 'Weekly period schedule, teacher substitution finder, and printable wall poster PDF routines.',
    roles: ['superadmin', 'principal', 'vice_principal', 'teacher', 'student', 'parent'],
    defaultEnabled: true,
    accent: 'indigo'
  },
  {
    id: 'calendar',
    name: 'Calendar & Vacations',
    mizoName: 'School Chawlh & Calendar',
    category: 'academics',
    categoryName: 'Core Academics',
    icon: Calendar,
    desc: 'MBSE academic calendar, gazetted holidays, Chapchar Kût, sports week, and institutional vacations.',
    roles: ['superadmin', 'principal', 'vice_principal', 'warden', 'teacher', 'student', 'parent'],
    defaultEnabled: true,
    accent: 'indigo'
  },

  // 2. Daily Operations & Attendance
  {
    id: 'attendance',
    name: 'QR Scanner & Biometric Attendance',
    mizoName: 'Attendance & Biometrics',
    category: 'operations',
    categoryName: 'Daily Operations',
    icon: QrCode,
    desc: 'Realtime camera QR scan, device biometric sync, daily roll calls, and automated absence alerts.',
    roles: ['superadmin', 'principal', 'vice_principal', 'teacher'],
    defaultEnabled: true,
    accent: 'cyan'
  },
  {
    id: 'id_card_studio',
    name: 'Smart ID & RFID Studio',
    mizoName: 'ID Card & RFID Siamma',
    category: 'operations',
    categoryName: 'Daily Operations',
    icon: CreditCard,
    desc: '3D dual-side PVC designer, RFID 13.56MHz chip link, Admit Cards, and multi-student A4 batch printing.',
    roles: ['superadmin', 'principal', 'vice_principal', 'teacher'],
    defaultEnabled: true,
    accent: 'cyan'
  },
  {
    id: 'leave_management',
    name: 'Leave Applications',
    mizoName: 'Chawlh Dilna Enkawlna',
    category: 'operations',
    categoryName: 'Daily Operations',
    icon: Clock,
    desc: 'Staff and student medical/casual leave applications, teacher recommendations, and Principal approval.',
    roles: ['superadmin', 'principal', 'vice_principal', 'warden', 'teacher'],
    defaultEnabled: true,
    accent: 'cyan'
  },

  // 3. School Facilities & Amenities
  {
    id: 'hostel',
    name: 'Hostel & Dormitory Suite',
    mizoName: 'Hostel & Riak Lut Enkawlna',
    category: 'facilities',
    categoryName: 'Facilities & Campus',
    icon: Building2,
    desc: 'Dormitory room layout, bed assignments, warden night roll-call, and hostel mess fee ledger.',
    roles: ['superadmin', 'principal', 'vice_principal', 'warden'],
    defaultEnabled: true,
    accent: 'purple'
  },
  {
    id: 'transport',
    name: 'Transport & Bus Fleet',
    mizoName: 'School Bus & Motor Enkawlna',
    category: 'facilities',
    categoryName: 'Facilities & Campus',
    icon: Bus,
    desc: 'Bus routes, pickup points, driver/conductor directories, student bus passes, and vehicle fuel logs.',
    roles: ['superadmin', 'principal', 'vice_principal', 'teacher'],
    defaultEnabled: true,
    accent: 'purple'
  },
  {
    id: 'canteen',
    name: 'Canteen & Smart Meal POS',
    mizoName: 'School Canteen & Eitur',
    category: 'facilities',
    categoryName: 'Facilities & Campus',
    icon: UtensilsCrossed,
    desc: 'RFID student tap-to-eat POS terminal, cashless prepaid meal wallet, daily food menu, and snacks billing.',
    roles: ['superadmin', 'principal', 'vice_principal', 'warden', 'teacher'],
    defaultEnabled: true,
    accent: 'purple'
  },
  {
    id: 'school_store',
    name: 'School Store & Depot',
    mizoName: 'School Uniform & Lehkhabu',
    category: 'facilities',
    categoryName: 'Facilities & Campus',
    icon: Shirt,
    desc: 'School uniform stock, textbooks, stationery counter, point of sale receipts, and inventory alerts.',
    roles: ['superadmin', 'principal', 'vice_principal', 'teacher'],
    defaultEnabled: true,
    accent: 'purple'
  },
  {
    id: 'library',
    name: 'Library Management',
    mizoName: 'Library & Lehkhabu Khawl',
    category: 'facilities',
    categoryName: 'Facilities & Campus',
    icon: BookOpen,
    desc: 'ISBN cataloging, barcode scanning, book lending register, return due dates, and fine collection.',
    roles: ['superadmin', 'principal', 'vice_principal', 'teacher'],
    defaultEnabled: true,
    accent: 'purple'
  },
  {
    id: 'clinic',
    name: 'Clinic & Sick Bay',
    mizoName: 'School Clinic & Damdawi',
    category: 'facilities',
    categoryName: 'Facilities & Campus',
    icon: HeartPulse,
    desc: 'Student medical checkup logs, resting bed registers, medicine stock, and parent emergency alerts.',
    roles: ['superadmin', 'principal', 'vice_principal', 'warden', 'teacher'],
    defaultEnabled: true,
    accent: 'purple'
  },
  {
    id: 'visitors',
    name: 'Gate Pass & Security Log',
    mizoName: 'Gate Pass & Lengte Chhinchhiahna',
    category: 'facilities',
    categoryName: 'Facilities & Campus',
    icon: ShieldCheck,
    desc: 'Security gate digital visitor pass, vehicle plate registry, purpose of visit, and badge printing.',
    roles: ['superadmin', 'principal', 'vice_principal', 'warden', 'teacher'],
    defaultEnabled: true,
    accent: 'purple'
  },
  {
    id: 'inventory',
    name: 'Inventory & Lab Assets',
    mizoName: 'School Bungrua & Lab Assets',
    category: 'facilities',
    categoryName: 'Facilities & Campus',
    icon: Package,
    desc: 'Science laboratory chemicals, sports equipment, computer lab hardware, and institutional asset ledger.',
    roles: ['superadmin', 'principal', 'vice_principal', 'teacher'],
    defaultEnabled: true,
    accent: 'purple'
  },

  // 4. Financials & Governance
  {
    id: 'financials',
    name: 'Financials & Fees Ledger',
    mizoName: 'School Pawisa & Fee Enkawlna',
    category: 'finance',
    categoryName: 'Financials & HR',
    icon: DollarSign,
    desc: 'Student fee collections, installment receipts, online UPI/bank gateway, expense tracking, and ledgers.',
    roles: ['superadmin', 'principal'],
    defaultEnabled: true,
    accent: 'emerald'
  },
  {
    id: 'students',
    name: 'Students Directory',
    mizoName: 'Zirlai Zawng Zawng List',
    category: 'finance',
    categoryName: 'Financials & HR',
    icon: Users,
    desc: 'Complete student roster, enrollment records, parent contacts, Blood group, and profile management.',
    roles: ['superadmin', 'principal', 'vice_principal', 'warden', 'teacher'],
    defaultEnabled: true,
    accent: 'emerald'
  },
  {
    id: 'staff_payroll',
    name: 'Staff & Governance',
    mizoName: 'Zirtirtu & Hlawh Enkawlna',
    category: 'finance',
    categoryName: 'Financials & HR',
    icon: DollarSign,
    desc: 'Teaching and non-teaching faculty directories, subject assignments, salary slips, and payroll sheets.',
    roles: ['superadmin', 'principal', 'vice_principal'],
    defaultEnabled: true,
    accent: 'emerald'
  },
  {
    id: 'admissions',
    name: 'Online Admissions Desk',
    mizoName: 'Online Admission & Lut Tharte',
    category: 'finance',
    categoryName: 'Financials & HR',
    icon: UserPlus,
    desc: 'Public admission portal, seat quota configuration, online applicant verification, and admission fees.',
    roles: ['superadmin', 'principal', 'vice_principal'],
    defaultEnabled: true,
    accent: 'emerald'
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    mizoName: 'School Report & Analytics',
    category: 'finance',
    categoryName: 'Financials & HR',
    icon: BarChart3,
    desc: 'High-level institutional metrics, class pass percentages, gender ratio, fee recovery trends, and charts.',
    roles: ['superadmin', 'principal', 'vice_principal'],
    defaultEnabled: true,
    accent: 'emerald'
  },

  // 5. Media & Communications
  {
    id: 'class_admin_live',
    name: 'Class Admin & Live Suite',
    mizoName: 'Class Admin & Live Class',
    category: 'media',
    categoryName: 'Media & Streaming',
    icon: Radio,
    desc: 'Class leader nomination, daily period monitoring, live lecture broadcast, and student permissions.',
    roles: ['superadmin', 'principal', 'vice_principal', 'teacher'],
    defaultEnabled: true,
    accent: 'rose'
  },
  {
    id: 'live_broadcast',
    name: 'Live Broadcast Studio',
    mizoName: 'Live Broadcast & Morning Devotion',
    category: 'media',
    categoryName: 'Media & Streaming',
    icon: Radio,
    desc: 'Principal morning assembly video stream, multi-camera audio/video broadcast across classrooms.',
    roles: ['superadmin', 'principal', 'vice_principal', 'teacher'],
    defaultEnabled: true,
    accent: 'rose'
  },
  {
    id: 'group_conference',
    name: 'Group Video Conference',
    mizoName: 'Video Meeting & Conference',
    category: 'media',
    categoryName: 'Media & Streaming',
    icon: Video,
    desc: 'Multi-party staff meetings, PTA video calls, interactive online tutoring, and screen sharing rooms.',
    roles: ['superadmin', 'principal', 'vice_principal', 'teacher'],
    defaultEnabled: true,
    accent: 'rose'
  },
  {
    id: 'staff_chat',
    name: 'Staff Messaging Hub',
    mizoName: 'Staff Room Chat & Inbiakna',
    category: 'media',
    categoryName: 'Media & Streaming',
    icon: MessageSquare,
    desc: 'Encrypted internal staff room discussions, department channels, file sharing, and circular comments.',
    roles: ['superadmin', 'principal', 'vice_principal', 'warden', 'teacher'],
    defaultEnabled: true,
    accent: 'rose'
  },
  {
    id: 'sms_notifications',
    name: 'SMS & WhatsApp Broadcast',
    mizoName: 'SMS & WhatsApp Dispatches',
    category: 'media',
    categoryName: 'Media & Streaming',
    icon: MessageSquare,
    desc: 'Instant absence WhatsApp/SMS dispatches, general circulars to parents, and exam alerts.',
    roles: ['superadmin', 'principal', 'vice_principal', 'teacher'],
    defaultEnabled: true,
    accent: 'rose'
  },

  // 6. Notices & Public Portal
  {
    id: 'notices',
    name: 'Notice Board & Circulars',
    mizoName: 'Notice Board & Hriattirna',
    category: 'portal',
    categoryName: 'Portal & Public',
    icon: Bell,
    desc: 'Official digital pinboard, PDF circular attachments, class-targeted notices, and push notifications.',
    roles: ['superadmin', 'principal', 'vice_principal', 'warden', 'teacher', 'student', 'parent'],
    defaultEnabled: true,
    accent: 'amber'
  },
  {
    id: 'school_rules',
    name: 'Rules & Code of Conduct',
    mizoName: 'School Dan & Hrai Zawm Turte',
    category: 'portal',
    categoryName: 'Portal & Public',
    icon: ShieldCheck,
    desc: 'Student handbook, disciplinary policies, dress codes, library rules, and hostel etiquette guidelines.',
    roles: ['superadmin', 'principal', 'vice_principal', 'warden', 'teacher', 'student', 'parent'],
    defaultEnabled: true,
    accent: 'amber'
  },
  {
    id: 'alumni',
    name: 'Alumni Network',
    mizoName: 'Alumni & Zirlai Hlui Hub',
    category: 'portal',
    categoryName: 'Portal & Public',
    icon: Award,
    desc: 'Former students directory, reunion planning, university admissions tracker, and mentorship network.',
    roles: ['superadmin', 'principal', 'vice_principal', 'teacher', 'student', 'parent'],
    defaultEnabled: true,
    accent: 'amber'
  },
  {
    id: 'public_website',
    name: 'School Public Website',
    mizoName: 'School Public Website Enkawlna',
    category: 'portal',
    categoryName: 'Portal & Public',
    icon: Globe,
    desc: 'School showcase homepage, online fee payment button, prospectus download, and principal desk.',
    roles: ['superadmin', 'principal', 'vice_principal', 'warden', 'teacher', 'student', 'parent'],
    defaultEnabled: true,
    accent: 'amber'
  },
  {
    id: 'portal',
    name: 'Student & Parent Portal',
    mizoName: 'Nu leh Pa / Zirlai Portal',
    category: 'portal',
    categoryName: 'Portal & Public',
    icon: Users,
    desc: 'Individual student portal, homework submission, fee receipts download, and exam progress tracker.',
    roles: ['superadmin', 'principal', 'vice_principal', 'teacher', 'warden', 'student', 'parent'],
    defaultEnabled: true,
    accent: 'amber'
  }
];

export default function ModuleManagerStudio({ onNavigateTab }) {
  const { systemConfig, isModuleEnabled, toggleModule, setModuleBatchStatus } = useSchool();
  const { currentUser, isPrincipal, isVicePrincipal, isSuperAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'enabled', 'disabled'
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isAuthorized = isSuperAdmin || 
    currentUser?.role === 'superadmin' || 
    currentUser?.role === 'principal' || 
    currentUser?.role === 'vice_principal';

  // Calculate totals
  const stats = useMemo(() => {
    let total = MASTER_MODULES_CATALOG.length;
    let enabledCount = 0;
    let disabledCount = 0;

    MASTER_MODULES_CATALOG.forEach(mod => {
      const active = isModuleEnabled ? isModuleEnabled(mod.id) : true;
      if (active) enabledCount++;
      else disabledCount++;
    });

    return { total, enabledCount, disabledCount };
  }, [systemConfig, isModuleEnabled]);

  // Filter modules
  const filteredModules = useMemo(() => {
    return MASTER_MODULES_CATALOG.filter(mod => {
      const active = isModuleEnabled ? isModuleEnabled(mod.id) : true;

      // Status filter
      if (statusFilter === 'enabled' && !active) return false;
      if (statusFilter === 'disabled' && active) return false;

      // Category filter
      if (selectedCategory !== 'all' && mod.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = mod.name.toLowerCase().includes(q);
        const matchesMizo = mod.mizoName.toLowerCase().includes(q);
        const matchesDesc = mod.desc.toLowerCase().includes(q);
        const matchesCat = mod.categoryName.toLowerCase().includes(q);
        if (!matchesName && !matchesMizo && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, statusFilter, isModuleEnabled]);

  // Presets
  const applyPreset = (presetType) => {
    if (!isAuthorized) return;

    if (presetType === 'enable_all') {
      const updates = {};
      MASTER_MODULES_CATALOG.forEach(m => { updates[m.id] = true; });
      if (setModuleBatchStatus) setModuleBatchStatus(updates);
      showToast('Module 29 zawng zawng te chu active vek tura set a ni ta!');
    } else if (presetType === 'day_scholar') {
      const updates = { hostel: false };
      if (setModuleBatchStatus) setModuleBatchStatus(updates);
      showToast('Day-Scholar School Mode: Hostel module chu disable a ni a, a dang a nung e.');
    } else if (presetType === 'minimal_academic') {
      const updates = {
        hostel: false,
        transport: false,
        canteen: false,
        school_store: false,
        clinic: false,
        live_broadcast: false,
        group_conference: false,
        visitors: false
      };
      if (setModuleBatchStatus) setModuleBatchStatus(updates);
      showToast('Essential Academics Only: Campus amenities hman rih loh te chu disable a ni e.');
    } else if (presetType === 'residential') {
      const updates = {
        hostel: true,
        clinic: true,
        canteen: true,
        transport: true
      };
      if (setModuleBatchStatus) setModuleBatchStatus(updates);
      showToast('Boarding & Residential Mode: Hostel, Clinic, Canteen, leh Transport enable a ni e.');
    }
  };

  const categories = [
    { id: 'all', label: 'All Modules', count: stats.total },
    { id: 'academics', label: 'Core Academics', count: 5 },
    { id: 'operations', label: 'Daily Operations', count: 3 },
    { id: 'facilities', label: 'Facilities & Campus', count: 8 },
    { id: 'finance', label: 'Financials & HR', count: 5 },
    { id: 'media', label: 'Media & Streaming', count: 5 },
    { id: 'portal', label: 'Portal & Public', count: 5 }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-medium shadow-2xl shadow-emerald-600/40 border border-emerald-400/30 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner with Stats & Presets */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Principal &amp; Vice Principal Control
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Institutional Feature Switches
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3 font-['Outfit']">
              <Sliders className="w-7 h-7 text-indigo-400" />
              School Module &amp; Feature Manager
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              In school mamawh dan azirin module tinte hi i duh chen chen i on (enable) in i off (disable) thei e. 
              Module i disable khan zirtirtu, zirlai, leh nu leh pa te sidebar-ah a lang lovang a, school system a faiin a felfai phah vek ang.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md shrink-0">
            <div className="text-center px-3">
              <p className="text-xs text-slate-400 font-medium">Total Modules</p>
              <p className="text-2xl font-black text-white font-mono mt-0.5">{stats.total}</p>
            </div>
            <div className="text-center px-3 border-x border-slate-800">
              <p className="text-xs text-emerald-400 font-medium">Active (On)</p>
              <p className="text-2xl font-black text-emerald-400 font-mono mt-0.5">{stats.enabledCount}</p>
            </div>
            <div className="text-center px-3">
              <p className="text-xs text-rose-400 font-medium">Disabled (Off)</p>
              <p className="text-2xl font-black text-rose-400 font-mono mt-0.5">{stats.disabledCount}</p>
            </div>
          </div>
        </div>

        {/* Quick Presets for Principal */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>School Setup Presets:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => applyPreset('enable_all')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Enable All (Full Suite)</span>
            </button>

            <button
              onClick={() => applyPreset('day_scholar')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Day-Scholar Only (Disable Hostel)</span>
            </button>

            <button
              onClick={() => applyPreset('minimal_academic')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>Essential Academics Only</span>
            </button>

            <button
              onClick={() => applyPreset('residential')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-cyan-400" />
              <span>Residential Suite (Hostel + Mess + Clinic)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search module hming emaw function zawnna (e.g. hostel, canteen, exam)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Status ({stats.total})
          </button>
          <button
            onClick={() => setStatusFilter('enabled')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              statusFilter === 'enabled'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Active ({stats.enabledCount})
          </button>
          <button
            onClick={() => setStatusFilter('disabled')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              statusFilter === 'disabled'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Disabled ({stats.disabledCount})
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0 flex items-center gap-2 ${
              selectedCategory === cat.id
                ? 'bg-slate-100 text-slate-900 font-bold shadow-lg shadow-white/10'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span>{cat.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              selectedCategory === cat.id ? 'bg-slate-300 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredModules.map((mod) => {
          const IconComponent = mod.icon;
          const isEnabled = isModuleEnabled ? isModuleEnabled(mod.id) : true;

          return (
            <div
              key={mod.id}
              className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                isEnabled
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-lg'
                  : 'bg-slate-950/60 border-rose-950/40 opacity-75 hover:opacity-100'
              }`}
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                      isEnabled
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                        {mod.name}
                      </h3>
                      <p className="text-xs text-indigo-300/80 font-medium">
                        {mod.mizoName}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => {
                        if (!isAuthorized) return;
                        if (toggleModule) {
                          toggleModule(mod.id, !isEnabled);
                          showToast(`${mod.name} hi ${!isEnabled ? 'ENABLE' : 'DISABLE'} a ni ta.`);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
                  </label>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                  {mod.desc}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] flex items-center gap-1 ${
                    isEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {isEnabled ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Active
                      </>
                    ) : (
                      <>
                        <Power className="w-3 h-3 text-rose-400" />
                        Disabled
                      </>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    #{mod.id}
                  </span>
                </div>

                {/* Open View Link */}
                {isEnabled && onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab(mod.id)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition"
                  >
                    <span>Open Module</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
          <Info className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-slate-300 font-medium">I zawnna mil module hmuh a ni lo.</p>
          <p className="text-xs text-slate-500">Search text emaw filters thlak chhin rawh le.</p>
        </div>
      )}
    </div>
  );
}
