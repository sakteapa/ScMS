import React, { useState, useEffect } from 'react';
import { X, Clock, User, BookOpen, MapPin, AlertTriangle, Check, Sparkles } from 'lucide-react';
import { DayOfWeek, TimetableSlot, SchoolClass, TimetableRecord } from '../types';

interface TimetableSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slot: TimetableSlot) => void;
  slotToEdit?: TimetableSlot | null;
  defaultDay?: DayOfWeek;
  classes: SchoolClass[];
  allTimetables: TimetableRecord[];
  currentClassId: string;
}

const COMMON_SUBJECTS = [
  'Mathematics',
  'Science (Physics)',
  'Science (Chemistry)',
  'Science (Biology)',
  'Science Lab',
  'English Literature',
  'English Grammar',
  'Mizo (MIL)',
  'Social Science (History)',
  'Social Science (Geography)',
  'Social Science (Civics)',
  'Social Science (Economics)',
  'Computer Science',
  'Computer Lab',
  'Physical Education & Sports',
  'Art & Work Education',
  'Morning Assembly & Devotion',
  'Library & Silent Reading',
  'Remedial Tutoring',
  'Value Education & Ethics',
  'Short Recess (Tiffin Break)',
  'Lunch Break (Chawhma Chawlh)',
];

const PERIOD_PRESETS: { number: number; label: string; start: string; end: string; isBreak?: boolean }[] = [
  { number: 0, label: 'Morning Assembly & Devotion', start: '09:00', end: '09:20' },
  { number: 1, label: 'Period 1', start: '09:20', end: '10:05' },
  { number: 2, label: 'Period 2', start: '10:05', end: '10:50' },
  { number: 3, label: 'Period 3', start: '10:50', end: '11:35' },
  { number: -1, label: 'Tiffin Break (Recess)', start: '11:35', end: '11:50', isBreak: true },
  { number: 4, label: 'Period 4', start: '11:50', end: '12:35' },
  { number: -2, label: 'Lunch Break (Chawlma)', start: '12:35', end: '13:20', isBreak: true },
  { number: 5, label: 'Period 5', start: '13:20', end: '14:05' },
  { number: 6, label: 'Period 6', start: '14:05', end: '14:50' },
  { number: 7, label: 'Period 7', start: '14:50', end: '15:30' },
];

export const TimetableSlotModal: React.FC<TimetableSlotModalProps> = ({
  isOpen,
  onClose,
  onSave,
  slotToEdit,
  defaultDay = 'Monday',
  classes,
  allTimetables,
  currentClassId,
}) => {
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(defaultDay);
  const [periodNumber, setPeriodNumber] = useState<number>(1);
  const [periodLabel, setPeriodLabel] = useState<string>('Period 1');
  const [startTime, setStartTime] = useState<string>('09:20');
  const [endTime, setEndTime] = useState<string>('10:05');
  const [subject, setSubject] = useState<string>('Mathematics');
  const [teacherName, setTeacherName] = useState<string>('Sir Lalbiakzuala Ralte');
  const [roomNumber, setRoomNumber] = useState<string>('Room 201');
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  // Extract known teachers list from classes
  const teacherList = Array.from(
    new Set([
      'Sir Lalbiakzuala Ralte',
      'Miss Vanlalhruaii Sailo',
      'Sir PC Vanlalruata',
      'Miss Lalduhawmi Chhangte',
      'Sir R. Lalthansanga',
      'Madam Zonunmawii',
      'Coach Lalrinsanga',
      'All Faculty',
      'Chaplain',
      ...classes.map((c) => c.teacherName).filter(Boolean),
    ])
  );

  useEffect(() => {
    if (slotToEdit) {
      setDayOfWeek(slotToEdit.dayOfWeek);
      setPeriodNumber(slotToEdit.periodNumber);
      setPeriodLabel(slotToEdit.periodLabel);
      setStartTime(slotToEdit.startTime);
      setEndTime(slotToEdit.endTime);
      setSubject(slotToEdit.subject);
      setTeacherName(slotToEdit.teacherName);
      setRoomNumber(slotToEdit.roomNumber);
      setIsBreak(Boolean(slotToEdit.isBreak));
      setNotes(slotToEdit.notes || '');
    } else {
      setDayOfWeek(defaultDay);
      setPeriodNumber(1);
      setPeriodLabel('Period 1');
      setStartTime('09:20');
      setEndTime('10:05');
      setSubject('Mathematics');
      setTeacherName(classes[0]?.teacherName || 'Sir Lalbiakzuala Ralte');
      setRoomNumber(classes[0]?.roomNumber || 'Room 201');
      setIsBreak(false);
      setNotes('');
    }
  }, [slotToEdit, defaultDay, isOpen, classes]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PERIOD_PRESETS[0]) => {
    setPeriodNumber(preset.number);
    setPeriodLabel(preset.label);
    setStartTime(preset.start);
    setEndTime(preset.end);
    setIsBreak(Boolean(preset.isBreak));
    if (preset.isBreak) {
      setSubject(preset.label);
      setTeacherName('Duty Teachers');
      setRoomNumber('Courtyard / Dining Hall');
    }
  };

  // Check for teacher collision across other classes in the same time slot and day
  const conflictingAssignment = allTimetables
    .filter((tt) => tt.classId !== currentClassId)
    .flatMap((tt) =>
      tt.slots
        .filter(
          (s) =>
            s.dayOfWeek === dayOfWeek &&
            !s.isBreak &&
            s.teacherName.trim().toLowerCase() === teacherName.trim().toLowerCase() &&
            ((s.startTime <= startTime && s.endTime > startTime) ||
              (s.startTime < endTime && s.endTime >= endTime) ||
              (s.startTime >= startTime && s.endTime <= endTime))
        )
        .map((s) => ({
          className: tt.className,
          subject: s.subject,
          period: s.periodLabel,
          time: `${s.startTime} - ${s.endTime}`,
        }))
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlot: TimetableSlot = {
      id: slotToEdit?.id || `slot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      dayOfWeek,
      periodNumber,
      periodLabel: periodLabel.trim() || `Period ${periodNumber}`,
      startTime,
      endTime,
      subject: subject.trim(),
      teacherName: teacherName.trim(),
      roomNumber: roomNumber.trim(),
      isBreak,
      notes: notes.trim() || undefined,
    };
    onSave(newSlot);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {slotToEdit ? 'Edit Routine Slot' : 'Add New Class Routine Slot'}
              </h3>
              <p className="text-xs text-gray-400">
                Configure day, period timing, subject, and assigned teacher
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Period Presets */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5">
              Quick MBSE Period Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PERIOD_PRESETS.map((preset) => (
                <button
                  key={`${preset.number}-${preset.label}`}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                    periodNumber === preset.number && startTime === preset.start
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-semibold'
                      : 'bg-gray-800/80 text-gray-300 border-gray-700/60 hover:border-gray-600'
                  }`}
                >
                  {preset.label.replace('Period ', 'P')}{' '}
                  <span className="text-[10px] text-gray-400">({preset.start})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Day of Week */}
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Day of Week</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-cyan-500"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Period Label */}
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Period Label</label>
              <input
                type="text"
                value={periodLabel}
                onChange={(e) => setPeriodLabel(e.target.value)}
                placeholder="e.g. Period 1, Assembly, Tiffin"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-cyan-500"
                required
              />
            </div>
          </div>

          {/* Timings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-cyan-500"
                required
              />
            </div>
          </div>

          {/* Is Break Toggle */}
          <div className="flex items-center gap-3 py-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isBreak}
                onChange={(e) => setIsBreak(e.target.checked)}
                className="rounded border-gray-700 bg-gray-950 text-cyan-600 focus:ring-cyan-500/20"
              />
              <span className="text-xs text-gray-300 font-medium">
                This is a Break / Recess / Assembly period
              </span>
            </label>
          </div>

          {/* Subject with Quick Fill */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                Subject
              </label>
              <span className="text-[10px] text-gray-400">Common MBSE subjects below</span>
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics, Science, Mizo (MIL)"
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-cyan-500 mb-2"
              required
            />
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 bg-gray-950/50 rounded-md border border-gray-800/80">
              {COMMON_SUBJECTS.slice(0, 10).map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSubject(sub)}
                  className={`text-[10px] px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    subject === sub
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Teacher and Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                Assigned Teacher
              </label>
              <input
                type="text"
                list="teachers-datalist"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="Teacher name"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-cyan-500"
                required
              />
              <datalist id="teachers-datalist">
                {teacherList.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Room / Facility
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. Room 201, Science Lab"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-cyan-500"
                required
              />
            </div>
          </div>

          {/* Teacher Collision Conflict Warning */}
          {conflictingAssignment.length > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-300">
                <span className="font-semibold">Scheduling Conflict Warning:</span>{' '}
                {teacherName} is already scheduled in {conflictingAssignment[0].className} for{' '}
                {conflictingAssignment[0].subject} ({conflictingAssignment[0].time}) on {dayOfWeek}.
              </div>
            </div>
          )}

          {/* Notes / Syllabus Goal */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">
              Curriculum Notes / Chapter Goals (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bring Practical Records, Chapter 4 Trigonometry problem sets..."
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-gray-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              {slotToEdit ? 'Save Changes' : 'Add Slot to Routine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
