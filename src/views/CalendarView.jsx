import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Tag,
  AlertCircle,
  Sparkles,
  BookOpen,
  Award,
  Users,
  CheckCircle2,
  CalendarDays,
  Flag,
  Sun,
  Palmtree,
  Printer,
  Download,
  FileText,
  Building2,
  Bell,
  Search,
  Share2,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export default function CalendarView() {
  const {
    academicEvents = [],
    addAcademicEvent,
    deleteAcademicEvent,
    vacations = [],
    mizoramGazettedHolidays = [],
    createVacation,
    updateVacation,
    deleteVacation,
    addVacationHomework,
    classes = [],
    systemConfig
  } = useSchool();
  const { isPrincipal, isVicePrincipal, isSuperAdmin, isTeacher } = useAuth();
  const canManageEvents = isPrincipal || isVicePrincipal || isSuperAdmin;

  // View Switcher Tabs: 'calendar' | 'vacations' | 'homework' | 'circular'
  const [activeTab, setActiveTab] = useState('calendar');

  // Active month & year for calendar grid (Default: August 2026 or current year)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // Month index 7 = August 2026
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEventForModal, setSelectedEventForModal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeclareVacationModal, setShowDeclareVacationModal] = useState(false);
  const [showAddHomeworkModal, setShowAddHomeworkModal] = useState(false);
  const [selectedVacationForCircular, setSelectedVacationForCircular] = useState(vacations[0]?.id || 'vac-02');
  const [holidaySearchQuery, setHolidaySearchQuery] = useState('');
  const [holidayCategoryFilter, setHolidayCategoryFilter] = useState('all');
  const [copiedCircular, setCopiedCircular] = useState(false);

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '2026-08-15',
    endDate: '2026-08-15',
    category: 'event', // 'holiday' | 'exam' | 'sports' | 'event'
    badge: 'Institutional Event',
    description: '',
    color: 'cyan'
  });

  // Declare Vacation Form State
  const [newVacation, setNewVacation] = useState({
    title: '',
    titleMizo: '',
    category: 'Institutional Vacation',
    type: 'vacation', // 'vacation' | 'gazetted_holiday' | 'emergency_holiday' | 'term_break'
    startDate: '2026-10-19',
    endDate: '2026-10-25',
    totalDays: 7,
    academicYear: '2026-2027',
    reopenDate: '2026-10-26',
    hostelReportDate: '2026-10-25',
    hostelReportTime: '05:00 PM',
    applicableTo: 'All Classes (Nursery to Class 12)',
    officeStatus: 'skeleton_duty', // 'skeleton_duty' | 'fully_closed' | 'open_administrative'
    officialCircularNo: `MS/ADM/VAC/2026/${Math.floor(Math.random() * 90 + 10)}`,
    approvedBy: 'Rev. Dr. L. H. Rohmingliana (Principal)',
    description: '',
    broadcastNotice: true
  });

  // New Homework Packet Form State
  const [newHomework, setNewHomework] = useState({
    vacationId: vacations[0]?.id || '',
    classId: 'cls-12-sci',
    subject: '',
    title: '',
    dueDate: '2026-10-28',
    downloadUrl: '#'
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIndex - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIndex + 1, 1));
  };

  const handleJumpToToday = () => {
    setCurrentDate(new Date(2026, 7, 1)); // Default academic demo anchor August 2026
  };

  // Days in month calculation
  const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonthIndex, 0).getDate();

  // Filter events by category
  const filteredEvents = academicEvents.filter(evt => {
    if (selectedCategory === 'all') return true;
    return evt.category === selectedCategory;
  });

  // Events occurring in current visible month
  const currentMonthPrefix = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;
  const eventsInCurrentMonth = filteredEvents.filter(evt => {
    return evt.date?.startsWith(currentMonthPrefix) || evt.endDate?.startsWith(currentMonthPrefix);
  });

  // Helper to get events on a specific date string (YYYY-MM-DD)
  const getEventsForDay = (dayNumber) => {
    const dayStr = `${currentMonthPrefix}-${String(dayNumber).padStart(2, '0')}`;
    return filteredEvents.filter(evt => {
      if (evt.date === dayStr) return true;
      if (evt.endDate && evt.date <= dayStr && evt.endDate >= dayStr) return true;
      return false;
    });
  };

  // Calculate Upcoming Vacation for Hero Banner
  const nextUpcomingVacation = useMemo(() => {
    const sorted = [...vacations].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    // Find next after reference anchor or today (2026-09-20)
    const refDate = '2026-09-20';
    return sorted.find(v => v.startDate >= refDate) || sorted[0];
  }, [vacations]);

  // Total Vacation Days Calculation
  const totalVacationDays = useMemo(() => {
    return vacations.reduce((sum, v) => sum + (parseInt(v.totalDays) || 0), 0);
  }, [vacations]);

  // Filtered Gazetted Holidays
  const filteredGazettedHolidays = useMemo(() => {
    return mizoramGazettedHolidays.filter(hol => {
      const matchesSearch = hol.title.toLowerCase().includes(holidaySearchQuery.toLowerCase()) ||
        hol.titleMizo?.toLowerCase().includes(holidaySearchQuery.toLowerCase()) ||
        hol.remarks?.toLowerCase().includes(holidaySearchQuery.toLowerCase());
      const matchesCategory = holidayCategoryFilter === 'all' || hol.category.toLowerCase() === holidayCategoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [mizoramGazettedHolidays, holidaySearchQuery, holidayCategoryFilter]);

  // Active Vacation for Circular
  const activeCircularVacation = useMemo(() => {
    return vacations.find(v => v.id === selectedVacationForCircular) || vacations[0] || {};
  }, [vacations, selectedVacationForCircular]);

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;

    let badge = newEvent.badge;
    let color = newEvent.color;
    if (newEvent.category === 'holiday') {
      badge = badge || 'State Gazetted';
      color = 'emerald';
    } else if (newEvent.category === 'exam') {
      badge = badge || 'MBSE Board Assessment';
      color = 'amber';
    } else if (newEvent.category === 'sports') {
      badge = badge || 'Sports & Games';
      color = 'purple';
    } else {
      badge = badge || 'School Milestone';
      color = 'cyan';
    }

    addAcademicEvent({
      ...newEvent,
      badge,
      color
    });

    setShowAddModal(false);
    setNewEvent({
      title: '',
      date: `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-01`,
      endDate: `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-01`,
      category: 'event',
      badge: 'Institutional Event',
      description: '',
      color: 'cyan'
    });
  };

  const handleCreateVacationSubmit = (e) => {
    e.preventDefault();
    if (!newVacation.title || !newVacation.startDate || !newVacation.endDate) return;

    // Calculate total days
    const start = new Date(newVacation.startDate);
    const end = new Date(newVacation.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    createVacation({
      ...newVacation,
      totalDays: diffDays
    });

    setShowDeclareVacationModal(false);
    alert(`Vacation "${newVacation.title}" officially declared and synchronized with Academic Calendar!`);
  };

  const handleAddHomeworkSubmit = (e) => {
    e.preventDefault();
    if (!newHomework.title || !newHomework.subject) return;

    const targetClass = classes.find(c => c.id === newHomework.classId);
    addVacationHomework(newHomework.vacationId || vacations[0]?.id, {
      ...newHomework,
      className: targetClass ? targetClass.name : 'All Classes'
    });

    setShowAddHomeworkModal(false);
    setNewHomework({
      vacationId: vacations[0]?.id || '',
      classId: 'cls-12-sci',
      subject: '',
      title: '',
      dueDate: '2026-10-28',
      downloadUrl: '#'
    });
    alert('Holiday homework packet successfully attached to vacation!');
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm('A calendar event hi i paih (delete) duh tak tak em?')) {
      deleteAcademicEvent(id);
      if (selectedEventForModal?.id === id) {
        setSelectedEventForModal(null);
      }
    }
  };

  const handleDeleteVacationClick = (id, title) => {
    if (window.confirm(`Vacation "${title}" hi paih (delete) i duh tak tak em? Calendar atang pawhin a in-remove nghal ang.`)) {
      deleteVacation(id);
    }
  };

  const handlePrintCircular = () => {
    window.print();
  };

  const handleCopyCircular = () => {
    const text = `
MIZORAM SCHOOL (AFFILIATED TO MBSE & CBSE)
OFFICIAL CIRCULAR: ${activeCircularVacation.title} (${activeCircularVacation.titleMizo || ''})
Circular No: ${activeCircularVacation.officialCircularNo || 'MS/ADM/VAC/2026/04'}
Period: ${activeCircularVacation.startDate} to ${activeCircularVacation.endDate} (${activeCircularVacation.totalDays} Days)
School Reopening Date: ${activeCircularVacation.reopenDate} (Morning Assembly at 08:45 AM)
Boarding Hostel Reporting Date: ${activeCircularVacation.hostelReportDate} before ${activeCircularVacation.hostelReportTime || '04:00 PM'}
Administrative Office Status: ${activeCircularVacation.officeStatus}
Approved By: ${activeCircularVacation.approvedBy || 'Rev. Dr. L. H. Rohmingliana (Principal)'}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopiedCircular(true);
    setTimeout(() => setCopiedCircular(false), 2000);
  };

  // Color mapper helper
  const getColorClasses = (color) => {
    switch (color) {
      case 'emerald':
        return {
          chip: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30',
          badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
          dot: 'bg-emerald-400'
        };
      case 'amber':
        return {
          chip: 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30',
          badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
          dot: 'bg-amber-400'
        };
      case 'purple':
        return {
          chip: 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30',
          badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
          dot: 'bg-purple-400'
        };
      case 'rose':
        return {
          chip: 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30',
          badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
          dot: 'bg-rose-400'
        };
      default:
        return {
          chip: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30',
          badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
          dot: 'bg-cyan-400'
        };
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] flex flex-wrap items-center gap-2">
            <span>Academic Calendar &amp; Vacation Suite</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
              AY 2026-2027
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
              <Sun className="w-3 h-3 text-emerald-400" />
              <span>{vacations.length} Vacations &amp; 18 Gazetted</span>
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Official Mizoram State Gazetted Holidays, Institutional Vacations, Board Examination Milestones &amp; Hostel Reopening Directives.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canManageEvents && (
            <>
              <button
                onClick={() => setShowDeclareVacationModal(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <Sun className="w-4 h-4" />
                <span>Declare Vacation / Holiday</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Academic Event</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Suite Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'calendar'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Monthly Calendar Matrix</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
            {academicEvents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('vacations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'vacations'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sun className="w-4 h-4 text-emerald-400" />
          <span>Vacation &amp; Holidays Hub</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-200 font-mono">
            {totalVacationDays} Days Off
          </span>
        </button>

        <button
          onClick={() => setActiveTab('homework')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'homework'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>Holiday Homework &amp; Projects</span>
        </button>

        <button
          onClick={() => setActiveTab('circular')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'circular'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Printer className="w-4 h-4 text-purple-400" />
          <span>Official Circular &amp; Letterhead</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: MONTHLY CALENDAR MATRIX VIEW
      ========================================================================= */}
      {activeTab === 'calendar' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Filter Pills & Metrics Summary */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === 'all'
                    ? 'bg-slate-100 text-slate-950 shadow'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All Events ({academicEvents.length})
              </button>
              <button
                onClick={() => setSelectedCategory('holiday')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  selectedCategory === 'holiday'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Mizoram Holidays &amp; Vacations ({academicEvents.filter(e => e.category === 'holiday').length})</span>
              </button>
              <button
                onClick={() => setSelectedCategory('exam')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  selectedCategory === 'exam'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>MBSE Exams ({academicEvents.filter(e => e.category === 'exam').length})</span>
              </button>
              <button
                onClick={() => setSelectedCategory('sports')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  selectedCategory === 'sports'
                    ? 'bg-purple-500 text-slate-950 font-bold shadow'
                    : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span>Sports &amp; Games ({academicEvents.filter(e => e.category === 'sports').length})</span>
              </button>
              <button
                onClick={() => setSelectedCategory('event')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  selectedCategory === 'event'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Milestones &amp; Chapel ({academicEvents.filter(e => e.category === 'event').length})</span>
              </button>
            </div>

            {/* Quick Legend Notice */}
            <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Holiday / Vacation
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> Board Exams
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span> Sports Meet
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Milestone
              </span>
            </div>
          </div>

          {/* Main Calendar Suite Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Left 3 Columns: Interactive Monthly Calendar Grid */}
            <div className="xl:col-span-3 space-y-4">
              {/* Month Navigation Header */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white font-['Outfit']">
                    {monthNames[currentMonthIndex]} {currentYear}
                  </h3>
                  <button
                    onClick={handleJumpToToday}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition"
                  >
                    Today
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Next Month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
                {/* Day of week headers */}
                <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/60 text-center py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span className="text-rose-400">Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span className="text-indigo-400">Sat</span>
                </div>

                {/* Day Cells Matrix */}
                <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/60 bg-slate-950/40">
                  {/* Previous month filler cells */}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => {
                    const prevDay = daysInPrevMonth - firstDayOfMonth + i + 1;
                    return (
                      <div
                        key={`prev-${i}`}
                        className="min-h-[110px] p-2 bg-slate-950/30 text-slate-600 text-xs select-none"
                      >
                        <span className="font-mono text-[11px]">{prevDay}</span>
                      </div>
                    );
                  })}

                  {/* Current Month Active Days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayEvents = getEventsForDay(day);
                    const isSunday = (firstDayOfMonth + i) % 7 === 0;
                    const isSaturday = (firstDayOfMonth + i) % 7 === 6;

                    return (
                      <div
                        key={`cur-${day}`}
                        className={`min-h-[110px] p-2 transition-colors flex flex-col justify-between hover:bg-slate-800/30 ${
                          isSunday ? 'bg-rose-950/10' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                              isSunday
                                ? 'text-rose-400'
                                : isSaturday
                                ? 'text-indigo-400'
                                : 'text-slate-300'
                            }`}
                          >
                            {day}
                          </span>
                          {dayEvents.length > 0 && (
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                          )}
                        </div>

                        {/* Event Chips List in Cell */}
                        <div className="space-y-1 overflow-hidden flex-1">
                          {dayEvents.slice(0, 2).map((evt) => {
                            const style = getColorClasses(evt.color);
                            return (
                              <button
                                key={evt.id}
                                onClick={() => setSelectedEventForModal(evt)}
                                className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border block transition ${style.chip}`}
                              >
                                {evt.title}
                              </button>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <button
                              onClick={() => setSelectedEventForModal(dayEvents[0])}
                              className="text-[9px] text-cyan-400 font-bold block hover:underline"
                            >
                              +{dayEvents.length - 2} more events
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Next month filler cells to complete 7-day row */}
                  {Array.from({
                    length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7
                  }).map((_, i) => (
                    <div
                      key={`next-${i}`}
                      className="min-h-[110px] p-2 bg-slate-950/30 text-slate-600 text-xs select-none"
                    >
                      <span className="font-mono text-[11px]">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 1 Column: Agenda & Key Academic Milestones Timeline */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-cyan-400" />
                  <span>Events in {monthNames[currentMonthIndex]}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono">
                    {eventsInCurrentMonth.length}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Key school dates and state holidays scheduled for this month.
                </p>
              </div>

              <div className="space-y-3">
                {eventsInCurrentMonth.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
                    <CalendarIcon className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">He thla ah hian event ruahman a la awm lo.</p>
                    {canManageEvents && (
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="text-xs text-cyan-400 hover:underline font-semibold"
                      >
                        Event thar dah rawh
                      </button>
                    )}
                  </div>
                ) : (
                  eventsInCurrentMonth.map((evt) => {
                    const style = getColorClasses(evt.color);
                    return (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEventForModal(evt)}
                        className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer space-y-2 group shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${style.badge}`}>
                            {evt.badge || evt.category.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {evt.date}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                          {evt.title}
                        </h4>

                        {evt.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {evt.description}
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                          <span>{evt.endDate && evt.endDate !== evt.date ? `Thleng: ${evt.endDate}` : '1 Day Event'}</span>
                          {canManageEvents && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEvent(evt.id);
                              }}
                              className="text-rose-400 hover:text-rose-300 opacity-0 group-hover:opacity-100 transition p-1"
                              title="Delete Event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: VACATIONS & HOLIDAYS HUB
      ========================================================================= */}
      {activeTab === 'vacations' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Hero Banner: Next Upcoming Vacation Countdown */}
          {nextUpcomingVacation && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '10s' }} />
                      <span>Next Institutional Vacation</span>
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Circular No: {nextUpcomingVacation.officialCircularNo || 'MS/ADM/VAC/2026'}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
                    {nextUpcomingVacation.title}
                  </h3>
                  {nextUpcomingVacation.titleMizo && (
                    <p className="text-sm font-semibold text-emerald-400">
                      ({nextUpcomingVacation.titleMizo})
                    </p>
                  )}

                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    {nextUpcomingVacation.description}
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                  <div className="text-center px-3 border-r border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Duration</span>
                    <span className="text-2xl font-extrabold text-emerald-400 font-mono">{nextUpcomingVacation.totalDays}</span>
                    <span className="text-[10px] text-slate-500 block">Days Off</span>
                  </div>

                  <div className="text-center px-3 border-r border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Starts</span>
                    <span className="text-xs font-bold text-white font-mono block mt-1">{nextUpcomingVacation.startDate}</span>
                    <span className="text-[10px] text-slate-500">to {nextUpcomingVacation.endDate}</span>
                  </div>

                  <div className="text-center px-3">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">School Reopens</span>
                    <span className="text-xs font-bold text-cyan-300 font-mono block mt-1">{nextUpcomingVacation.reopenDate}</span>
                    <span className="text-[10px] text-emerald-400/90 font-medium">Assembly 8:45 AM</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4 Summary Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Total Vacation Days</span>
                <Palmtree className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">{totalVacationDays} Days</div>
              <p className="text-[11px] text-slate-500">Across {vacations.length} institutional breaks</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Mizoram State Gazetted</span>
                <Flag className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono">{mizoramGazettedHolidays.length} Days</div>
              <p className="text-[11px] text-slate-500">State festivals, Christian &amp; National</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">MBSE Working Days</span>
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-cyan-400 font-mono">214 Days</div>
              <p className="text-[11px] text-slate-500">Exceeds mandatory 200 MBSE norm</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Boarding Directives</span>
                <Building2 className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-purple-400 font-mono">100% Policy</div>
              <p className="text-[11px] text-slate-500">Hostel return deadline attached</p>
            </div>
          </div>

          {/* Institutional Vacations Grid */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <Sun className="w-4 h-4 text-emerald-400" />
                  <span>Institutional Vacation Schedules (AY 2026-2027)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Comprehensive academic breaks, boarding hostel vacating guidelines, and office duty status.
                </p>
              </div>

              {canManageEvents && (
                <button
                  onClick={() => setShowDeclareVacationModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5 self-start"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Declare New Vacation</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {vacations.map((vac) => (
                <div
                  key={vac.id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition space-y-4 group shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                          {vac.category || 'Vacation'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {vac.academicYear}
                        </span>
                        {vac.status === 'upcoming' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold animate-pulse">
                            Upcoming
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white font-['Outfit']">
                        {vac.title}
                      </h4>
                      {vac.titleMizo && (
                        <p className="text-xs text-emerald-400 font-medium">
                          {vac.titleMizo}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-400 font-mono block">
                        {vac.totalDays} Days
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Circular: {vac.officialCircularNo || 'MS/VAC'}
                      </span>
                    </div>
                  </div>

                  {vac.description && (
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                      {vac.description}
                    </p>
                  )}

                  {/* Reopening & Hostel Return Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3 text-cyan-400" />
                        <span>School Reopens</span>
                      </span>
                      <span className="font-bold text-white block mt-0.5">{vac.reopenDate}</span>
                      <span className="text-[10px] text-slate-500">Regular Classes Resume</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-purple-400" />
                        <span>Boarding Hostel Return</span>
                      </span>
                      <span className="font-bold text-purple-300 block mt-0.5">
                        {vac.hostelReportDate}
                      </span>
                      <span className="text-[10px] text-slate-500">Before {vac.hostelReportTime || '04:00 PM'}</span>
                    </div>
                  </div>

                  {/* Office Status & Duty Staff */}
                  <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-slate-800/80 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Admin Office:</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        vac.officeStatus === 'fully_closed'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : vac.officeStatus === 'open_administrative'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {vac.officeStatus === 'fully_closed' ? 'Fully Closed' : vac.officeStatus === 'open_administrative' ? 'Regular Hours' : 'Skeleton Duty (10am-1pm)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedVacationForCircular(vac.id);
                          setActiveTab('circular');
                        }}
                        className="text-xs text-purple-400 hover:text-purple-300 hover:underline font-semibold flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print Circular</span>
                      </button>

                      {canManageEvents && (
                        <button
                          onClick={() => handleDeleteVacationClick(vac.id, vac.title)}
                          className="text-slate-500 hover:text-rose-400 transition p-1"
                          title="Delete Vacation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mizoram State & Gazetted Holidays 2026 Section */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <Flag className="w-4 h-4 text-amber-400" />
                  <span>Mizoram State Gazetted &amp; Cultural Holidays 2026</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-mono">
                    {filteredGazettedHolidays.length} of {mizoramGazettedHolidays.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Official public holidays notified by the Government of Mizoram for educational institutions.
                </p>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search holiday name..."
                    value={holidaySearchQuery}
                    onChange={(e) => setHolidaySearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 w-44"
                  />
                </div>

                <select
                  value={holidayCategoryFilter}
                  onChange={(e) => setHolidayCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="all">All Categories</option>
                  <option value="Christian">Christian Holidays</option>
                  <option value="Cultural">Cultural / Mizo Festivals</option>
                  <option value="National">National Holidays</option>
                  <option value="State">Mizoram Statehood &amp; Peace</option>
                  <option value="Festival">New Year &amp; Seasonal</option>
                </select>
              </div>
            </div>

            {/* Gazetted Holidays Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Holiday Name (English &amp; Mizo)</th>
                    <th className="p-3">Official Date</th>
                    <th className="p-3">Classification</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Remarks / Significance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredGazettedHolidays.map((hol) => (
                    <tr key={hol.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3">
                        <div className="font-bold text-white">{hol.title}</div>
                        {hol.titleMizo && (
                          <div className="text-[11px] text-amber-400 font-semibold">{hol.titleMizo}</div>
                        )}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-200">
                        {hol.date}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                          {hol.type}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          hol.category === 'Christian'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : hol.category === 'Cultural'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : hol.category === 'National'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {hol.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {hol.remarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: HOLIDAY HOMEWORK & STUDY PACKS
      ========================================================================= */}
      {activeTab === 'homework' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Vacation Homework &amp; Investigatory Projects</span>
              </h3>
              <p className="text-xs text-slate-400">
                Curated study packages, practical record books, and revision materials assigned for school breaks.
              </p>
            </div>

            {canManageEvents && (
              <button
                onClick={() => setShowAddHomeworkModal(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5 self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Assign Holiday Homework</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vacations.flatMap(v => (v.homeworkPackets || []).map(hw => ({ ...hw, vacationTitle: v.title }))).map((packet) => (
              <div
                key={packet.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition space-y-3 shadow-md flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
                      {packet.className}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Due: {packet.dueDate}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white font-['Outfit'] leading-snug">
                    {packet.title}
                  </h4>

                  <p className="text-xs text-amber-400 font-semibold">
                    Subject: {packet.subject}
                  </p>

                  <p className="text-[11px] text-slate-400">
                    Assigned for: <span className="text-slate-300">{packet.vacationTitle}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Download Ready</span>
                  </span>

                  <button
                    onClick={() => alert(`Downloading homework packet: "${packet.title}" for ${packet.className}`)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Download className="w-3 h-3 text-cyan-400" />
                    <span>Download Packet</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: OFFICIAL GAZETTED CIRCULAR & LETTERHEAD (PRINT / PDF)
      ========================================================================= */}
      {activeTab === 'circular' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Controls Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-400 font-semibold">Select Vacation Circular:</label>
              <select
                value={selectedVacationForCircular}
                onChange={(e) => setSelectedVacationForCircular(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {vacations.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.title} ({v.totalDays} Days)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCircular}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
              >
                {copiedCircular ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedCircular ? 'Copied to Clipboard!' : 'Copy Circular Text'}</span>
              </button>

              <button
                onClick={handlePrintCircular}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-purple-500/20 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Circular (PDF)</span>
              </button>
            </div>
          </div>

          {/* Official Letterhead Document Paper */}
          <div className="max-w-3xl mx-auto p-8 sm:p-12 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl text-slate-200 space-y-6 font-serif print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
            {/* School Letterhead Header */}
            <div className="text-center border-b-2 border-slate-700 pb-5 space-y-1">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-md">
                  <Award className="w-7 h-7" />
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white print:text-black">
                {systemConfig?.schoolName || 'OHA (Oxford Higher Academy)'}
              </h1>
              <p className="text-xs font-sans text-slate-400 print:text-slate-600 uppercase tracking-widest">
                Affiliated to {systemConfig?.affiliationNo || 'MBSE'} • Est. {systemConfig?.establishedYear || '1998'} • Lunglei, Mizoram
              </p>
              <p className="text-[11px] font-sans text-slate-500 print:text-slate-600">
                {systemConfig?.address || 'Lunglawn, Lunglei - 796701'} • Phone: {systemConfig?.contactPhone || '+91 372 2322104'} • Email: {systemConfig?.contactEmail || 'oha.lunglawn@gmail.com'}
              </p>
            </div>

            {/* Circular Metadata Header */}
            <div className="flex items-center justify-between text-xs font-sans text-slate-400 print:text-slate-700 border-b border-slate-800 pb-2">
              <div>
                <span className="font-bold text-slate-300 print:text-black">Ref No: </span>
                <span className="font-mono text-cyan-400 print:text-black font-bold">
                  {activeCircularVacation.officialCircularNo || 'MS/ADM/VAC/2026/04'}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-300 print:text-black">Date: </span>
                <span className="font-mono">{new Date().toISOString().split('T')[0]}</span>
              </div>
            </div>

            {/* Subject Banner */}
            <div className="text-center py-2 px-4 rounded-xl bg-slate-900/90 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <h2 className="text-sm font-sans font-bold uppercase tracking-wide text-white print:text-black">
                OFFICIAL NOTIFICATION: {activeCircularVacation.title?.toUpperCase()} ({activeCircularVacation.titleMizo?.toUpperCase() || ''})
              </h2>
            </div>

            {/* Circular Body Content */}
            <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-300 print:text-slate-900 font-sans">
              <p>
                He circular hmang hian {systemConfig?.schoolName || 'OHA (Oxford Higher Academy)'} zirlai, nu leh pa (guardians), zirtirtu leh staff zawng zawngte hriattir in ni a, academic calendar {systemConfig?.academicSession || '2026-2027'} dungzuiin <strong>{activeCircularVacation.title}</strong> chu hetiang hian chawlh a ni ang:
              </p>

              {/* Schedule Table */}
              <div className="p-4 rounded-xl bg-slate-900/60 print:bg-slate-50 border border-slate-800 print:border-slate-300 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 print:text-slate-600 block">Vacation Period:</span>
                    <strong className="text-white print:text-black font-mono">
                      {activeCircularVacation.startDate} to {activeCircularVacation.endDate} ({activeCircularVacation.totalDays} Days)
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 print:text-slate-600 block">School Reopening Date:</span>
                    <strong className="text-emerald-400 print:text-black font-mono">
                      {activeCircularVacation.reopenDate} (Morning Assembly at 08:45 AM)
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 print:border-slate-300">
                  <div>
                    <span className="text-slate-400 print:text-slate-600 block">Target Students:</span>
                    <strong className="text-white print:text-black">{activeCircularVacation.applicableTo || 'All Classes'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 print:text-slate-600 block">Hostel Reporting Deadline:</span>
                    <strong className="text-purple-300 print:text-black font-mono">
                      {activeCircularVacation.hostelReportDate} (Before {activeCircularVacation.hostelReportTime || '04:00 PM'})
                    </strong>
                  </div>
                </div>
              </div>

              {/* Key Directives */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-white print:text-black uppercase tracking-wider">
                  Important Directives for Students &amp; Guardians:
                </h4>
                <ol className="list-decimal pl-5 space-y-1 text-slate-300 print:text-slate-800">
                  <li>
                    <strong>Hostel &amp; Dormitory Discipline:</strong> Boarding hostel zirlaite chu chawlh tan ni tlai dar 5:00 hmain an haw kim tur a ni a, chawlh zawhah school reopening hma ni tlai dar {activeCircularVacation.hostelReportTime || '04:00 PM'} aia tlai lovah formal school uniform ha in an rawn report kim tur a ni.
                  </li>
                  <li>
                    <strong>Holiday Homework &amp; Projects:</strong> Class tinte tan vacation homework leh practical assignments peih fel tura ruahman a ni a, school hawn ni ah class master te hnenah thehluh tur a ni ang.
                  </li>
                  <li>
                    <strong>Administrative Office Hours:</strong> School office chu chawlh chhung hian <span className="underline">{activeCircularVacation.officeStatus === 'fully_closed' ? 'khap tlat (Fully Closed)' : 'skeleton duty (10:00 AM to 1:00 PM)'}</span> a ni ang.
                  </li>
                </ol>
              </div>

              {/* Duty Staff Contacts */}
              {activeCircularVacation.dutyStaff && activeCircularVacation.dutyStaff.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-900/40 print:bg-slate-100 text-xs space-y-1 border border-slate-800 print:border-slate-300">
                  <span className="font-bold text-slate-300 print:text-black block">Emergency Contact &amp; Campus Duty Roster:</span>
                  <div className="flex flex-wrap gap-4 text-slate-400 print:text-slate-700">
                    {activeCircularVacation.dutyStaff.map((staff, idx) => (
                      <span key={idx}>
                        • <strong>{staff.name}</strong> ({staff.role}) - Ph: {staff.contact}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Signature Block */}
            <div className="pt-8 flex items-end justify-between font-sans text-xs">
              <div className="text-center text-slate-500 print:text-slate-600">
                <div className="w-20 h-20 mx-auto rounded-full border-2 border-dashed border-slate-700 print:border-slate-400 flex items-center justify-center text-[10px] uppercase font-bold text-slate-600 print:text-slate-400">
                  Principal's<br />Seal
                </div>
                <span className="block mt-1 font-mono text-[10px]">Official School Crest</span>
              </div>

              <div className="text-right space-y-1">
                <p className="font-serif italic text-cyan-400 print:text-black text-base font-bold">
                  {systemConfig?.principalSignatoryName || 'Dr. F. Lalhmachhuana'}
                </p>
                <p className="font-bold text-white print:text-black">
                  Principal &amp; Secretary
                </p>
                <p className="text-[11px] text-slate-400 print:text-slate-600">
                  {systemConfig?.schoolName || 'OHA (Oxford Higher Academy)'}, {systemConfig?.address?.split(',')[0] || 'Lunglawn'}, Lunglei
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DECLARE VACATION / HOLIDAY
      ========================================================================= */}
      {showDeclareVacationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">Declare Official Vacation / Holiday</h3>
                  <p className="text-xs text-slate-400">Notifies entire school, updates calendar &amp; hostel rules</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeclareVacationModal(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVacationSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Vacation Title (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Winter & Christmas Vacation 2026"
                    value={newVacation.title}
                    onChange={(e) => setNewVacation({ ...newVacation, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Title in Mizo</label>
                  <input
                    type="text"
                    placeholder="e.g. Krismas & Furpui Chawlh"
                    value={newVacation.titleMizo}
                    onChange={(e) => setNewVacation({ ...newVacation, titleMizo: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Vacation Category</label>
                  <select
                    value={newVacation.category}
                    onChange={(e) => setNewVacation({ ...newVacation, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="Summer Break">Summer &amp; Monsoon Break</option>
                    <option value="Autumn Break">Autumn / Mid-Term Break</option>
                    <option value="Winter Vacation">Winter &amp; Christmas Vacation</option>
                    <option value="Preparatory Leave">Board Exam Preparatory Leave</option>
                    <option value="State Gazetted">Mizoram State Gazetted</option>
                    <option value="Emergency Holiday">Emergency / Weather Holiday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Official Circular No.</label>
                  <input
                    type="text"
                    value={newVacation.officialCircularNo}
                    onChange={(e) => setNewVacation({ ...newVacation, officialCircularNo: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newVacation.startDate}
                    onChange={(e) => setNewVacation({ ...newVacation, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={newVacation.endDate}
                    onChange={(e) => setNewVacation({ ...newVacation, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">School Reopening Date *</label>
                  <input
                    type="date"
                    required
                    value={newVacation.reopenDate}
                    onChange={(e) => setNewVacation({ ...newVacation, reopenDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Hostel Reporting Date</label>
                  <input
                    type="date"
                    value={newVacation.hostelReportDate}
                    onChange={(e) => setNewVacation({ ...newVacation, hostelReportDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Office Status</label>
                  <select
                    value={newVacation.officeStatus}
                    onChange={(e) => setNewVacation({ ...newVacation, officeStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="skeleton_duty">Skeleton Duty (10am-1pm)</option>
                    <option value="fully_closed">Fully Closed (Office Locked)</option>
                    <option value="open_administrative">Open Administrative Hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Applicable Classes</label>
                  <input
                    type="text"
                    value={newVacation.applicableTo}
                    onChange={(e) => setNewVacation({ ...newVacation, applicableTo: e.target.value })}
                    placeholder="e.g. All Classes / Class 10 & 12 only"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description / Official Instructions</label>
                <textarea
                  rows={3}
                  value={newVacation.description}
                  onChange={(e) => setNewVacation({ ...newVacation, description: e.target.value })}
                  placeholder="Official instructions for day-scholars, boarders, and homework packets..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Auto-Broadcast Notice</span>
                  <span className="text-[11px] text-slate-400">Post notification to Notice Board &amp; Student/Parent drawer</span>
                </div>
                <input
                  type="checkbox"
                  checked={newVacation.broadcastNotice}
                  onChange={(e) => setNewVacation({ ...newVacation, broadcastNotice: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDeclareVacationModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold transition shadow-lg shadow-emerald-500/20"
                >
                  Declare Vacation &amp; Sync Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD ACADEMIC EVENT
      ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-['Outfit']">Add Academic Event</h3>
                  <p className="text-[11px] text-slate-400">Institutional timeline and calendar record</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Event Title / Holiday Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MBSE Class 12 Chemistry Practical / Remna Ni"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="holiday">Mizoram State / Cultural Holiday</option>
                    <option value="exam">MBSE / Terminal Examination</option>
                    <option value="sports">Sports Week / Athletic Meet</option>
                    <option value="event">Institutional Milestone / Retreat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. State Gazetted / Board Exam"
                    value={newEvent.badge}
                    onChange={(e) => setNewEvent({ ...newEvent, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">End Date (if multi-day)</label>
                  <input
                    type="date"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description / Venue Details</label>
                <textarea
                  rows={3}
                  placeholder="Official instructions, exam guidelines, or holiday notice..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold transition shadow-lg shadow-cyan-500/20"
                >
                  Save Academic Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ASSIGN HOLIDAY HOMEWORK
      ========================================================================= */}
      {showAddHomeworkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-['Outfit']">Assign Holiday Homework</h3>
                  <p className="text-[11px] text-slate-400">Attach study packet to a vacation</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddHomeworkModal(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddHomeworkSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Vacation *</label>
                <select
                  value={newHomework.vacationId}
                  onChange={(e) => setNewHomework({ ...newHomework, vacationId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                >
                  {vacations.map(v => (
                    <option key={v.id} value={v.id}>{v.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Class *</label>
                <select
                  value={newHomework.classId}
                  onChange={(e) => setNewHomework({ ...newHomework, classId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics & Chemistry / Mathematics"
                  value={newHomework.subject}
                  onChange={(e) => setNewHomework({ ...newHomework, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Project / Assignment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Investigatory Science Portfolio & Formula Drill"
                  value={newHomework.title}
                  onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Submission Due Date *</label>
                <input
                  type="date"
                  required
                  value={newHomework.dueDate}
                  onChange={(e) => setNewHomework({ ...newHomework, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddHomeworkModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-lg shadow-amber-500/20"
                >
                  Attach to Vacation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EVENT DETAILS MODAL
      ========================================================================= */}
      {selectedEventForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 text-white">
            <div className="flex items-start justify-between">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${getColorClasses(selectedEventForModal.color).badge}`}>
                {selectedEventForModal.badge || selectedEventForModal.category?.toUpperCase()}
              </span>
              <button
                onClick={() => setSelectedEventForModal(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">
                {selectedEventForModal.title}
              </h3>
              <p className="text-xs text-cyan-400 font-mono mt-1">
                {selectedEventForModal.date} {selectedEventForModal.endDate && selectedEventForModal.endDate !== selectedEventForModal.date ? `to ${selectedEventForModal.endDate}` : ''}
              </p>
            </div>

            {selectedEventForModal.description && (
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                {selectedEventForModal.description}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Academic Category</span>
                <span className="font-bold text-white uppercase">{selectedEventForModal.category}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Target Stream</span>
                <span className="font-bold text-white">All Classes</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {canManageEvents ? (
                <button
                  onClick={() => handleDeleteEvent(selectedEventForModal.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Event</span>
                </button>
              ) : <div></div>}

              <button
                onClick={() => setSelectedEventForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
