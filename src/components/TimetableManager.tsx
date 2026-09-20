import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Clock,
  Plus,
  Printer,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  Filter,
  Users,
  Building2,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  Sun,
  Coffee,
  Check,
  RotateCcw,
  Share2,
  FileSpreadsheet,
} from 'lucide-react';
import {
  TimetableRecord,
  TimetableSlot,
  SchoolClass,
  FirestoreStudent,
  DayOfWeek,
} from '../types';
import { addDocument, updateDocument, deleteDocument } from '../lib/firebase';
import { TimetableSlotModal } from './TimetableSlotModal';
import { TimetablePrintModal } from './TimetablePrintModal';
import { INITIAL_TIMETABLES } from '../data/seedData';

interface TimetableManagerProps {
  timetables: TimetableRecord[];
  classes: SchoolClass[];
  students: FirestoreStudent[];
}

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper to determine day of week string from Javascript Date
const getTodayDayOfWeek = (): DayOfWeek => {
  const dayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon, ...
  switch (dayIndex) {
    case 1:
      return 'Monday';
    case 2:
      return 'Tuesday';
    case 3:
      return 'Wednesday';
    case 4:
      return 'Thursday';
    case 5:
      return 'Friday';
    case 6:
      return 'Saturday';
    default:
      return 'Monday'; // Fallback for Sunday
  }
};

export const TimetableManager: React.FC<TimetableManagerProps> = ({
  timetables,
  classes,
  students,
}) => {
  // Active Tab View: 'daily' (Daily Active Routine) or 'weekly' (Admin Weekly Grid)
  const [activeView, setActiveView] = useState<'daily' | 'weekly'>('daily');

  // Selected Class Filter
  const [selectedClassId, setSelectedClassId] = useState<string>(
    classes[0]?.id || 'class_10_a'
  );

  // Selected Day for Daily Active View
  const todayActualDay = useMemo(() => getTodayDayOfWeek(), []);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayActualDay);

  // Audience Mode for Daily View: 'class' (Student/Class) vs 'teacher' (Faculty Schedule)
  const [audienceMode, setAudienceMode] = useState<'class' | 'teacher'>('class');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('Sir Lalbiakzuala Ralte');

  // Simulated Time of Day (or live clock)
  const [useLiveClock, setUseLiveClock] = useState<boolean>(true);
  const [simulatedTime, setSimulatedTime] = useState<string>('10:15'); // 10:15 AM
  const [currentRealTime, setCurrentRealTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  // Modals state
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotToEdit, setSlotToEdit] = useState<TimetableSlot | null>(null);
  const [slotModalDefaultDay, setSlotModalDefaultDay] = useState<DayOfWeek>('Monday');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Keep live clock updated every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentRealTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      );
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const effectiveTime = useLiveClock ? currentRealTime : simulatedTime;

  // Active timetable for selected class
  const activeTimetable = useMemo(() => {
    return timetables.find((t) => t.classId === selectedClassId) || null;
  }, [timetables, selectedClassId]);

  const selectedClassObj = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId);
  }, [classes, selectedClassId]);

  // List of all faculty teachers across classes and timetables
  const allTeachers = useMemo(() => {
    const names = new Set<string>();
    classes.forEach((c) => {
      if (c.teacherName) names.add(c.teacherName);
    });
    timetables.forEach((tt) => {
      tt.slots.forEach((s) => {
        if (s.teacherName && !s.isBreak && s.teacherName !== 'All Faculty' && s.teacherName !== 'Duty Teachers') {
          names.add(s.teacherName);
        }
      });
    });
    return Array.from(names).sort();
  }, [classes, timetables]);

  // Teacher Schedule across ALL classes for the selected day
  const teacherDailySlots = useMemo(() => {
    if (audienceMode !== 'teacher' || !selectedTeacher) return [];

    const matched: (TimetableSlot & { className: string; classId: string })[] = [];
    timetables.forEach((tt) => {
      tt.slots.forEach((s) => {
        if (
          s.dayOfWeek === selectedDay &&
          s.teacherName.toLowerCase().includes(selectedTeacher.toLowerCase())
        ) {
          matched.push({
            ...s,
            className: tt.className,
            classId: tt.classId,
          });
        }
      });
    });

    return matched.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [timetables, selectedDay, selectedTeacher, audienceMode]);

  // Class Daily Slots for selected day
  const classDailySlots = useMemo(() => {
    if (!activeTimetable) return [];
    return activeTimetable.slots
      .filter((s) => s.dayOfWeek === selectedDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [activeTimetable, selectedDay]);

  // Active slots displayed in daily view
  const currentDailySlots = audienceMode === 'class' ? classDailySlots : teacherDailySlots;

  // Determine which period slot is currently active or next
  const { activePeriod, nextPeriod } = useMemo(() => {
    if (currentDailySlots.length === 0) {
      return { activePeriod: null, nextPeriod: null };
    }

    const active = currentDailySlots.find(
      (s) => effectiveTime >= s.startTime && effectiveTime < s.endTime
    );

    const next = currentDailySlots.find((s) => s.startTime > effectiveTime);

    return { activePeriod: active || null, nextPeriod: next || null };
  }, [currentDailySlots, effectiveTime]);

  // Check for teacher collisions across all published timetables
  const teacherConflicts = useMemo(() => {
    const conflicts: {
      day: DayOfWeek;
      time: string;
      teacher: string;
      classes: string[];
    }[] = [];

    DAYS_OF_WEEK.forEach((day) => {
      // Collect all teaching slots for this day across all timetables
      const daySlots: {
        teacher: string;
        startTime: string;
        endTime: string;
        className: string;
      }[] = [];

      timetables.forEach((tt) => {
        tt.slots.forEach((s) => {
          if (
            s.dayOfWeek === day &&
            !s.isBreak &&
            s.teacherName &&
            s.teacherName !== 'All Faculty' &&
            s.teacherName !== 'Duty Teachers'
          ) {
            daySlots.push({
              teacher: s.teacherName.trim(),
              startTime: s.startTime,
              endTime: s.endTime,
              className: tt.className,
            });
          }
        });
      });

      // Find duplicates where same teacher has overlapping times
      for (let i = 0; i < daySlots.length; i++) {
        for (let j = i + 1; j < daySlots.length; j++) {
          const a = daySlots[i];
          const b = daySlots[j];
          if (
            a.teacher.toLowerCase() === b.teacher.toLowerCase() &&
            a.className !== b.className &&
            ((a.startTime <= b.startTime && a.endTime > b.startTime) ||
              (a.startTime < b.endTime && a.endTime >= b.endTime))
          ) {
            conflicts.push({
              day,
              time: `${a.startTime} - ${a.endTime}`,
              teacher: a.teacher,
              classes: [a.className, b.className],
            });
          }
        }
      }
    });

    return conflicts;
  }, [timetables]);

  // Subject statistics for active timetable
  const subjectDistribution = useMemo(() => {
    if (!activeTimetable) return [];
    const counts: Record<string, number> = {};
    activeTimetable.slots.forEach((s) => {
      if (!s.isBreak && s.subject) {
        counts[s.subject] = (counts[s.subject] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count);
  }, [activeTimetable]);

  // Handler: Initialize default timetable if not yet seeded
  const handleInitializeClassTimetable = async () => {
    const defaultTemplate = INITIAL_TIMETABLES.find((t) => t.classId === selectedClassId) || {
      id: `tt-${selectedClassId}-${Date.now()}`,
      classId: selectedClassId,
      className: selectedClassObj?.name || 'Class',
      academicYear: '2026-2027',
      status: 'Published',
      isPublished: true,
      effectiveFrom: '2026-04-01',
      updatedBy: 'Principal (Lalthlamuana Pachuau)',
      updatedAt: new Date().toISOString(),
      slots: INITIAL_TIMETABLES[0].slots.map((s) => ({
        ...s,
        id: `slot-${selectedClassId}-${s.dayOfWeek.slice(0, 3)}-${s.periodNumber}`,
        roomNumber: selectedClassObj?.roomNumber || 'Room 201',
      })),
    };

    await addDocument('timetables', defaultTemplate as any);
    setSaveFeedback('Standard MBSE class routine initialized successfully!');
    setTimeout(() => setSaveFeedback(null), 3500);
  };

  // Handler: Toggle Publish Status
  const handleTogglePublish = async () => {
    if (!activeTimetable) return;
    const newStatus = activeTimetable.isPublished ? 'Draft' : 'Published';
    const isNowPublished = !activeTimetable.isPublished;

    await updateDocument('timetables', activeTimetable.id, {
      status: newStatus,
      isPublished: isNowPublished,
      updatedAt: new Date().toISOString(),
      updatedBy: 'School Administrator',
    });

    setSaveFeedback(
      isNowPublished
        ? 'Timetable published to students and teachers!'
        : 'Timetable reverted to Draft mode.'
    );
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  // Handler: Save Slot (Add or Edit)
  const handleSaveSlot = async (slot: TimetableSlot) => {
    if (!activeTimetable) return;

    let updatedSlots: TimetableSlot[];
    const existingIndex = activeTimetable.slots.findIndex((s) => s.id === slot.id);

    if (existingIndex >= 0) {
      updatedSlots = activeTimetable.slots.map((s) => (s.id === slot.id ? slot : s));
    } else {
      updatedSlots = [...activeTimetable.slots, slot];
    }

    await updateDocument('timetables', activeTimetable.id, {
      slots: updatedSlots,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Class Coordinator',
    });

    setSaveFeedback(`Slot "${slot.subject}" saved successfully!`);
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  // Handler: Delete Slot
  const handleDeleteSlot = async (slotId: string) => {
    if (!activeTimetable) return;
    if (!confirm('Are you sure you want to remove this slot from the routine?')) return;

    const updatedSlots = activeTimetable.slots.filter((s) => s.id !== slotId);
    await updateDocument('timetables', activeTimetable.id, {
      slots: updatedSlots,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Class Coordinator',
    });

    setSaveFeedback('Period slot removed from schedule.');
    setTimeout(() => setSaveFeedback(null), 2500);
  };

  // Open modal to add slot for specific day
  const handleOpenAddSlot = (day: DayOfWeek) => {
    setSlotToEdit(null);
    setSlotModalDefaultDay(day);
    setIsSlotModalOpen(true);
  };

  // Unique time slots across all days for the weekly table header
  const allDistinctPeriodHeaders = useMemo(() => {
    if (!activeTimetable) return [];
    const map = new Map<string, { periodNumber: number; label: string; start: string; end: string; isBreak?: boolean }>();

    activeTimetable.slots.forEach((s) => {
      const key = `${s.periodNumber}-${s.startTime}`;
      if (!map.has(key)) {
        map.set(key, {
          periodNumber: s.periodNumber,
          label: s.periodLabel,
          start: s.startTime,
          end: s.endTime,
          isBreak: s.isBreak,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.start.localeCompare(b.start));
  }, [activeTimetable]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <span>Class Timetable & Daily Routine</span>
                  {activeTimetable?.isPublished ? (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Published Live
                    </span>
                  ) : (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                      Draft Schedule
                    </span>
                  )}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Mizoram School System (zoxs-sms) • MBSE Period Mapping & Active Daily Tracker
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Class Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-gray-950 border border-gray-800 rounded-xl px-3 py-1.5">
              <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-transparent text-xs text-white font-medium focus:outline-hidden cursor-pointer"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id} className="bg-gray-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* View Switcher Tabs (Daily vs Weekly) */}
            <div className="flex items-center bg-gray-950 border border-gray-800 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveView('daily')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeView === 'daily'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Daily Active Routine</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView('weekly')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeView === 'weekly'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Weekly Grid (Admin)</span>
              </button>
            </div>

            {/* Print Routine */}
            {activeTimetable && (
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-cyan-300 border border-cyan-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Print official routine"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print MBSE Routine</span>
              </button>
            )}

            {/* Add Slot */}
            {activeTimetable && (
              <button
                type="button"
                onClick={() => handleOpenAddSlot(selectedDay)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Period</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback alert */}
        {saveFeedback && (
          <div className="mt-4 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveFeedback}</span>
          </div>
        )}
      </div>

      {/* Teacher Collision Warning Banner if any detected */}
      {teacherConflicts.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-rose-300">
              Scheduling Conflict Detected ({teacherConflicts.length} overlaps across classes)
            </h4>
            <div className="mt-1 space-y-1 text-rose-200/90">
              {teacherConflicts.slice(0, 3).map((c, i) => (
                <div key={i}>
                  • <span className="font-semibold">{c.teacher}</span> is scheduled on{' '}
                  <span className="underline">{c.day} ({c.time})</span> simultaneously in{' '}
                  <span className="font-mono">{c.classes.join(' & ')}</span>.
                </div>
              ))}
              {teacherConflicts.length > 3 && (
                <p className="text-[11px] text-rose-400">
                  +{teacherConflicts.length - 3} more overlapping faculty allocations detected.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* If no timetable exists for the selected class, prompt to initialize */}
      {!activeTimetable ? (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Timetable Configured for {selectedClassObj?.name}</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
              Initialize a standard MBSE weekly routine with 7 daily periods, morning assembly, recess, and subject distribution.
            </p>
          </div>
          <button
            type="button"
            onClick={handleInitializeClassTimetable}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/25 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Standard MBSE Class Routine</span>
          </button>
        </div>
      ) : (
        <>
          {/* =========================================================================
              VIEW A: DAILY ACTIVE ROUTINE (REAL-TIME STUDENT & TEACHER TRACKER)
              ========================================================================= */}
          {activeView === 'daily' && (
            <div className="space-y-6">
              {/* Daily Control Bar: Day Pills + Audience Toggle + Real-Time / Simulation */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Days of Week Selector */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {DAYS_OF_WEEK.map((day) => {
                    const isToday = day === todayActualDay;
                    const isSelected = day === selectedDay;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-cyan-600 text-white shadow-sm'
                            : 'bg-gray-950/80 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800/80'
                        }`}
                      >
                        <span>{day.slice(0, 3)}</span>
                        {isToday && (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full uppercase tracking-wider font-bold ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-cyan-500/20 text-cyan-300'
                            }`}
                          >
                            Today
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Audience Filter & Time Simulator Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Student View vs Teacher View */}
                  <div className="flex items-center bg-gray-950 border border-gray-800 rounded-xl p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setAudienceMode('class')}
                      className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        audienceMode === 'class'
                          ? 'bg-gray-800 text-white font-semibold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Class View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudienceMode('teacher')}
                      className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        audienceMode === 'teacher'
                          ? 'bg-gray-800 text-white font-semibold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <UserCheckIcon className="w-3.5 h-3.5" />
                      <span>Teacher Duty View</span>
                    </button>
                  </div>

                  {/* Teacher Dropdown if teacher view active */}
                  {audienceMode === 'teacher' && (
                    <select
                      value={selectedTeacher}
                      onChange={(e) => setSelectedTeacher(e.target.value)}
                      className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-medium focus:outline-hidden cursor-pointer"
                    >
                      {allTeachers.map((t) => (
                        <option key={t} value={t} className="bg-gray-900 text-white">
                          {t}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Simulated Time Tool */}
                  <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-xl px-2.5 py-1 text-xs">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <label className="text-[11px] text-gray-400">Clock:</label>
                    {useLiveClock ? (
                      <span className="font-mono text-cyan-300 font-bold">{currentRealTime}</span>
                    ) : (
                      <input
                        type="time"
                        value={simulatedTime}
                        onChange={(e) => setSimulatedTime(e.target.value)}
                        className="bg-gray-900 border border-gray-700 rounded px-1 text-xs text-white font-mono"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setUseLiveClock(!useLiveClock)}
                      className="text-[10px] underline text-gray-400 hover:text-cyan-300 cursor-pointer ml-1"
                    >
                      {useLiveClock ? 'Simulate Time' : 'Use Live'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Hero Status: Currently Active Period Card */}
              <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 border-2 border-cyan-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                        Active Right Now ({effectiveTime})
                      </span>
                      <span className="text-xs text-gray-400">
                        {selectedDay} • {audienceMode === 'class' ? selectedClassObj?.name : selectedTeacher}
                      </span>
                    </div>

                    {activePeriod ? (
                      <div>
                        <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                          <span>{activePeriod.subject}</span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700 font-mono">
                            {activePeriod.startTime} - {activePeriod.endTime}
                          </span>
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 mt-2">
                          <span className="flex items-center gap-1.5 font-medium">
                            <UserCheckIcon className="w-4 h-4 text-cyan-400" />
                            {activePeriod.teacherName}
                          </span>
                          <span className="flex items-center gap-1.5 font-mono text-gray-400">
                            <Building2 className="w-4 h-4 text-cyan-400" />
                            {activePeriod.roomNumber}
                          </span>
                          {activePeriod.periodLabel && (
                            <span className="px-2 py-0.5 rounded bg-gray-800 text-[11px] font-semibold text-gray-400">
                              {activePeriod.periodLabel}
                            </span>
                          )}
                        </div>
                        {activePeriod.notes && (
                          <p className="text-xs text-cyan-200/80 bg-cyan-950/40 border border-cyan-800/40 rounded-lg px-3 py-1.5 mt-2.5 max-w-2xl">
                            💡 <span className="font-semibold">Teacher Objective:</span> {activePeriod.notes}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xl font-bold text-gray-300">
                          {effectiveTime < '09:00'
                            ? 'Before School Hours (Classes commence at 09:00 AM)'
                            : effectiveTime >= '15:30'
                            ? 'School Dismissed for the Day'
                            : 'No active session scheduled in this specific timeslot'}
                        </h3>
                        {nextPeriod && (
                          <p className="text-xs text-cyan-400 mt-1 flex items-center gap-1.5">
                            <ArrowRight className="w-3.5 h-3.5" />
                            Upcoming next: <strong className="text-white">{nextPeriod.subject}</strong> ({nextPeriod.startTime} - {nextPeriod.endTime}) with {nextPeriod.teacherName}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick stats for selected day */}
                  <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-6">
                    <div className="text-center px-3">
                      <div className="text-2xl font-black text-white font-mono">
                        {currentDailySlots.filter((s) => !s.isBreak).length}
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                        Periods Today
                      </div>
                    </div>
                    <div className="w-px h-8 bg-gray-800"></div>
                    <div className="text-center px-3">
                      <div className="text-2xl font-black text-cyan-400 font-mono">
                        {currentDailySlots.filter((s) => s.isBreak).length}
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                        Breaks
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Day Timeline Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span>
                      {selectedDay} Routine Stream •{' '}
                      {audienceMode === 'class' ? selectedClassObj?.name : `${selectedTeacher}'s Classes`}
                    </span>
                  </h4>
                  <span className="text-xs text-gray-400">
                    {currentDailySlots.length} Scheduled Slots
                  </span>
                </div>

                {currentDailySlots.length === 0 ? (
                  <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 text-center text-xs text-gray-400">
                    No periods scheduled for {selectedDay}. Click "Add Period" to add a new slot.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {currentDailySlots.map((slot) => {
                      const isSlotActive =
                        effectiveTime >= slot.startTime && effectiveTime < slot.endTime;
                      const isSlotCompleted = effectiveTime >= slot.endTime;
                      const isSlotUpcoming = effectiveTime < slot.startTime;

                      return (
                        <div
                          key={slot.id}
                          className={`rounded-xl p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isSlotActive
                              ? 'bg-cyan-950/30 border-cyan-500 shadow-lg shadow-cyan-500/10'
                              : isSlotCompleted
                              ? 'bg-gray-900/40 border-gray-800/60 opacity-80'
                              : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                          } ${slot.isBreak ? 'border-dashed bg-amber-950/10 border-amber-500/30' : ''}`}
                        >
                          <div className="flex items-start sm:items-center gap-3.5">
                            {/* Time Pill */}
                            <div
                              className={`px-3 py-2 rounded-xl text-center font-mono shrink-0 ${
                                isSlotActive
                                  ? 'bg-cyan-500 text-gray-950 font-bold'
                                  : isSlotCompleted
                                  ? 'bg-gray-800/80 text-gray-400'
                                  : 'bg-gray-800 text-gray-200'
                              }`}
                            >
                              <div className="text-xs font-bold leading-tight">{slot.startTime}</div>
                              <div className="text-[10px] opacity-75">{slot.endTime}</div>
                            </div>

                            {/* Details */}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">
                                  {slot.subject}
                                </span>
                                {slot.isBreak && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                                    Recess / Break
                                  </span>
                                )}
                                {isSlotActive && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold animate-pulse">
                                    Active Now
                                  </span>
                                )}
                                {isSlotCompleted && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 flex items-center gap-1">
                                    <Check className="w-3 h-3 text-emerald-400" /> Completed
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
                                <span className="text-gray-300">{slot.teacherName}</span>
                                <span>•</span>
                                <span className="font-mono text-gray-400">{slot.roomNumber}</span>
                                <span>•</span>
                                <span className="text-gray-500">{slot.periodLabel}</span>
                                {(slot as any).className && (
                                  <>
                                    <span>•</span>
                                    <span className="text-cyan-300 font-semibold">
                                      {(slot as any).className}
                                    </span>
                                  </>
                                )}
                              </div>

                              {slot.notes && (
                                <p className="text-[11px] text-gray-400 mt-1 italic">
                                  "{slot.notes}"
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons for Admins & Teachers */}
                          {audienceMode === 'class' && (
                            <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setSlotToEdit(slot);
                                  setSlotModalDefaultDay(slot.dayOfWeek);
                                  setIsSlotModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                                title="Edit Slot"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSlot(slot.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-gray-800 transition-colors cursor-pointer"
                                title="Delete Slot"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW B: ADMINISTRATIVE WEEKLY GRID (MATRIX & CURRICULUM PLANNING)
              ========================================================================= */}
          {activeView === 'weekly' && (
            <div className="space-y-6">
              {/* Admin Actions Bar */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-300">
                    Schedule Status:
                  </span>
                  <button
                    type="button"
                    onClick={handleTogglePublish}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTimetable.isPublished
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    }`}
                  >
                    {activeTimetable.isPublished ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Published to Portal (Click to Unpublish)</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Draft Mode (Click to Publish Live)</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    Last updated: {new Date(activeTimetable.updatedAt).toLocaleDateString()} by {activeTimetable.updatedBy}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenAddSlot('Monday')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Slot</span>
                  </button>
                </div>
              </div>

              {/* Full Weekly Timetable Matrix Grid */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-950/90 border-b border-gray-800 text-gray-400">
                        <th className="p-3 font-semibold text-left uppercase text-[11px] w-28 sticky left-0 bg-gray-950/95 z-10 border-r border-gray-800">
                          Day
                        </th>
                        {allDistinctPeriodHeaders.map((header) => (
                          <th
                            key={`${header.periodNumber}-${header.start}`}
                            className={`p-3 text-center border-r border-gray-800 font-semibold min-w-[130px] ${
                              header.isBreak ? 'bg-gray-950/40 text-amber-300' : ''
                            }`}
                          >
                            <div className="text-xs text-gray-200">{header.label}</div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              {header.start} - {header.end}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {DAYS_OF_WEEK.map((day) => {
                        const daySlots = activeTimetable.slots.filter((s) => s.dayOfWeek === day);

                        return (
                          <tr key={day} className="hover:bg-gray-800/30 transition-colors">
                            <td className="p-3 font-bold text-white bg-gray-950/60 sticky left-0 z-10 border-r border-gray-800">
                              <div className="flex items-center justify-between">
                                <span>{day}</span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenAddSlot(day)}
                                  className="p-1 text-gray-400 hover:text-cyan-400 cursor-pointer"
                                  title={`Add slot to ${day}`}
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </td>

                            {allDistinctPeriodHeaders.map((headerDef) => {
                              const matchedSlot = daySlots.find(
                                (s) =>
                                  s.periodNumber === headerDef.periodNumber ||
                                  (s.startTime === headerDef.start && s.endTime === headerDef.end)
                              );

                              if (headerDef.isBreak) {
                                return (
                                  <td
                                    key={`${day}-${headerDef.periodNumber}`}
                                    className="p-2 text-center bg-gray-950/40 border-r border-gray-800 text-[10px] text-amber-400 font-semibold"
                                  >
                                    {headerDef.label.includes('Lunch') ? 'Lunch' : 'Recess'}
                                  </td>
                                );
                              }

                              if (!matchedSlot) {
                                return (
                                  <td
                                    key={`${day}-${headerDef.periodNumber}`}
                                    onClick={() => handleOpenAddSlot(day)}
                                    className="p-2 text-center border-r border-gray-800 text-gray-600 hover:bg-gray-800/40 cursor-pointer transition-colors"
                                  >
                                    <span className="text-[11px] text-gray-600 hover:text-gray-400">+ Add</span>
                                  </td>
                                );
                              }

                              return (
                                <td
                                  key={`${day}-${headerDef.periodNumber}`}
                                  className="p-2 border-r border-gray-800 align-top group hover:bg-gray-800/50 transition-colors"
                                >
                                  <div className="bg-gray-950/80 border border-gray-800 group-hover:border-cyan-500/50 rounded-xl p-2 transition-all">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-bold text-white text-[11px] leading-tight line-clamp-1">
                                        {matchedSlot.subject}
                                      </span>
                                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSlotToEdit(matchedSlot);
                                            setSlotModalDefaultDay(day);
                                            setIsSlotModalOpen(true);
                                          }}
                                          className="text-gray-400 hover:text-cyan-400 cursor-pointer"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSlot(matchedSlot.id);
                                          }}
                                          className="text-gray-400 hover:text-rose-400 cursor-pointer"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-1 truncate">
                                      {matchedSlot.teacherName}
                                    </div>
                                    <div className="text-[9px] text-cyan-400 font-mono mt-0.5">
                                      {matchedSlot.roomNumber}
                                    </div>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Subject Distribution & Weekly Period Count Statistics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-3 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                    Weekly Subject Load & Allocation (Periods / Week)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {subjectDistribution.map(({ subject, count }) => (
                      <div
                        key={subject}
                        className="bg-gray-950/80 border border-gray-800/80 rounded-xl p-3 flex items-center justify-between"
                      >
                        <div className="truncate pr-2">
                          <div className="text-xs font-bold text-white truncate">{subject}</div>
                          <div className="text-[10px] text-gray-400">MBSE Curricular</div>
                        </div>
                        <span className="text-sm font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Routine Administration
                  </h4>
                  <div className="space-y-2 text-xs text-gray-300">
                    <div className="flex items-center justify-between py-1 border-b border-gray-800">
                      <span className="text-gray-400">Class Section</span>
                      <span className="font-bold text-white">{selectedClassObj?.name}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-gray-800">
                      <span className="text-gray-400">Class Teacher</span>
                      <span className="font-bold text-white">{selectedClassObj?.teacherName}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-gray-800">
                      <span className="text-gray-400">Enrolled Students</span>
                      <span className="font-mono text-cyan-300 font-bold">
                        {students.filter((s) => s.classId === selectedClassId).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-gray-800">
                      <span className="text-gray-400">Total Weekly Periods</span>
                      <span className="font-mono text-cyan-300 font-bold">
                        {activeTimetable.slots.filter((s) => !s.isBreak).length}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="w-full mt-2 py-2.5 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer border border-gray-700"
                  >
                    <Printer className="w-4 h-4 text-cyan-400" />
                    <span>Export Printable Notice PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Slot Add/Edit Modal */}
      <TimetableSlotModal
        isOpen={isSlotModalOpen}
        onClose={() => {
          setIsSlotModalOpen(false);
          setSlotToEdit(null);
        }}
        onSave={handleSaveSlot}
        slotToEdit={slotToEdit}
        defaultDay={slotModalDefaultDay}
        classes={classes}
        allTimetables={timetables}
        currentClassId={selectedClassId}
      />

      {/* Printable Routine Modal */}
      {activeTimetable && (
        <TimetablePrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          timetable={activeTimetable}
          schoolClass={selectedClassObj}
        />
      )}
    </div>
  );
};

// Inline helper for Teacher check icon
function UserCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
}
