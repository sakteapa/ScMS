import React, { useState } from 'react';
import { 
  CalendarDays, 
  Clock, 
  Printer, 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Users, 
  Building2, 
  Sparkles,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import { STREAM_SUBJECTS } from '../data/mockData';

export default function RoutineView() {
  const { classes, timetables, updateTimeTableSlot, staff, systemConfig } = useSchool();
  const { isPrincipal, isTeacher } = useAuth();

  const [selectedClassId, setSelectedClassId] = useState('cls-12-sci');
  const [activeDay, setActiveDay] = useState('Monday');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null); // { day, periodIndex, slot }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];

  // Default fallback schedule if none exists for a class
  const classTimetable = timetables[selectedClassId] || timetables['cls-12-sci'] || {};

  const handleOpenEdit = (day, periodIndex, slot) => {
    if (!isPrincipal && !isTeacher) return;
    setSelectedSlot({
      day,
      periodIndex,
      subject: slot.subject,
      teacher: slot.teacher,
      room: slot.room,
      time: slot.time
    });
    setIsEditModalOpen(true);
  };

  const handleSaveSlot = (e) => {
    e.preventDefault();
    if (!selectedSlot) return;

    updateTimeTableSlot(selectedClassId, selectedSlot.day, selectedSlot.periodIndex, {
      subject: selectedSlot.subject,
      teacher: selectedSlot.teacher,
      room: selectedSlot.room,
      time: selectedSlot.time
    });

    setIsEditModalOpen(false);
    setSelectedSlot(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header toolbar */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-cyan-400" />
            <span>Class Routine &amp; Academic Time Table</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Monday - Friday
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Institutional daily period schedules, subject faculty assignments, and wall routine printing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Class selector */}
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-semibold focus:border-cyan-400 focus:outline-none"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.stream ? `(${c.stream.toUpperCase()})` : ''} - Room {c.roomNumber}
              </option>
            ))}
          </select>

          {/* Print Wall Routine button */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Wall Routine</span>
          </button>
        </div>
      </div>

      {/* Day Selector Tabs (Hidden in print) */}
      <div className="no-print flex border-b border-slate-800 bg-slate-900/60 px-4 pt-3 gap-2 overflow-x-auto rounded-t-2xl">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 ${
              activeDay === day
                ? 'bg-slate-950 text-cyan-300 border-t-2 border-cyan-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{day}</span>
          </button>
        ))}
      </div>

      {/* Interactive Day Routine Grid (Screen View) */}
      <div className="no-print p-6 rounded-b-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white font-['Outfit']">
              {activeDay} Schedule • {selectedClass.name}
            </span>
            <span className="text-xs text-slate-400">
              (Room: {selectedClass.roomNumber} • Class Teacher: {selectedClass.teacherName})
            </span>
          </div>

          {(isPrincipal || isTeacher) && (
            <span className="text-[11px] text-cyan-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Click any period slot to update subject or teacher</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(classTimetable[activeDay] || []).map((slot, idx) => (
            <div
              key={idx}
              onClick={() => handleOpenEdit(activeDay, idx, slot)}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-3 group ${
                isPrincipal || isTeacher 
                  ? 'bg-slate-950/70 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/40' 
                  : 'bg-slate-950/70 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PERIOD {slot.period}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {slot.time}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition line-clamp-1">
                  {slot.subject}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Faculty: <strong className="text-slate-200">{slot.teacher}</strong>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Room: {slot.room}</span>
                {(isPrincipal || isTeacher) && (
                  <span className="text-cyan-400 group-hover:underline text-[10px] flex items-center gap-1">
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PRINTABLE OFFICIAL WALL ROUTINE SHEET */}
      <div className="printable-area max-w-5xl mx-auto rounded-2xl bg-white text-slate-950 border border-slate-300 shadow-2xl p-8 sm:p-10 font-sans mt-8">
        {/* School Crest & Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
          <h1 className="text-2xl font-black uppercase tracking-tight font-['Outfit']">
            {systemConfig?.schoolName || 'OHA (One Heart Academy)'}
          </h1>
          <p className="text-xs font-semibold text-slate-700 tracking-wider uppercase">
            Mizoram Board of School Education (MBSE) • Academic Session: {systemConfig?.academicSession || '2026-2027'}
          </p>
          <div className="pt-1">
            <span className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-900 text-white">
              CLASS ACADEMIC ROUTINE • {selectedClass.name} {selectedClass.stream ? `(${selectedClass.stream.toUpperCase()} STREAM)` : ''}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-800 pt-1 font-mono">
            Class Room: {selectedClass.roomNumber} • Class In-charge: {selectedClass.teacherName}
          </p>
        </div>

        {/* Timetable Matrix Table */}
        <div className="overflow-x-auto my-6">
          <table className="w-full text-left text-xs border-collapse border border-slate-400">
            <thead className="bg-slate-100 text-slate-950 font-bold border-b-2 border-slate-400">
              <tr>
                <th className="py-3 px-3 border-r border-slate-300 w-24">Day</th>
                <th className="py-3 px-2 border-r border-slate-300 text-center">
                  Period 1<br/>
                  <span className="text-[10px] font-normal text-slate-600">09:00 - 09:45</span>
                </th>
                <th className="py-3 px-2 border-r border-slate-300 text-center">
                  Period 2<br/>
                  <span className="text-[10px] font-normal text-slate-600">09:45 - 10:30</span>
                </th>
                <th className="py-3 px-2 border-r border-slate-300 text-center">
                  Period 3<br/>
                  <span className="text-[10px] font-normal text-slate-600">10:30 - 11:15</span>
                </th>
                <th className="py-3 px-1 border-r border-slate-300 text-center bg-slate-200/80 font-bold text-[10px] uppercase w-12">
                  Break
                </th>
                <th className="py-3 px-2 border-r border-slate-300 text-center">
                  Period 4<br/>
                  <span className="text-[10px] font-normal text-slate-600">11:45 - 12:30</span>
                </th>
                <th className="py-3 px-2 border-r border-slate-300 text-center">
                  Period 5<br/>
                  <span className="text-[10px] font-normal text-slate-600">12:30 - 01:15</span>
                </th>
                <th className="py-3 px-2 border-r border-slate-300 text-center">
                  Period 6<br/>
                  <span className="text-[10px] font-normal text-slate-600">01:15 - 02:00</span>
                </th>
                <th className="py-3 px-2 text-center">
                  Period 7<br/>
                  <span className="text-[10px] font-normal text-slate-600">02:00 - 02:45</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-slate-800">
              {days.map((dayName, idx) => {
                const daySlots = classTimetable[dayName] || [];
                return (
                  <tr key={dayName} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                    <td className="py-3 px-3 font-bold text-slate-900 border-r border-slate-300 bg-slate-100/50 uppercase font-mono">
                      {dayName}
                    </td>
                    <td className="py-2.5 px-2 text-center border-r border-slate-300">
                      <span className="font-bold text-slate-900 block">{daySlots[0]?.subject || '-'}</span>
                      <span className="text-[10px] text-slate-600 italic">{daySlots[0]?.teacher || ''}</span>
                    </td>
                    <td className="py-2.5 px-2 text-center border-r border-slate-300">
                      <span className="font-bold text-slate-900 block">{daySlots[1]?.subject || '-'}</span>
                      <span className="text-[10px] text-slate-600 italic">{daySlots[1]?.teacher || ''}</span>
                    </td>
                    <td className="py-2.5 px-2 text-center border-r border-slate-300">
                      <span className="font-bold text-slate-900 block">{daySlots[2]?.subject || '-'}</span>
                      <span className="text-[10px] text-slate-600 italic">{daySlots[2]?.teacher || ''}</span>
                    </td>
                    <td className="py-2 px-1 text-center border-r border-slate-300 bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                      Tiffin
                    </td>
                    <td className="py-2.5 px-2 text-center border-r border-slate-300">
                      <span className="font-bold text-slate-900 block">{daySlots[3]?.subject || '-'}</span>
                      <span className="text-[10px] text-slate-600 italic">{daySlots[3]?.teacher || ''}</span>
                    </td>
                    <td className="py-2.5 px-2 text-center border-r border-slate-300">
                      <span className="font-bold text-slate-900 block">{daySlots[4]?.subject || '-'}</span>
                      <span className="text-[10px] text-slate-600 italic">{daySlots[4]?.teacher || ''}</span>
                    </td>
                    <td className="py-2.5 px-2 text-center border-r border-slate-300">
                      <span className="font-bold text-slate-900 block">{daySlots[5]?.subject || '-'}</span>
                      <span className="text-[10px] text-slate-600 italic">{daySlots[5]?.teacher || ''}</span>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="font-bold text-slate-900 block">{daySlots[6]?.subject || '-'}</span>
                      <span className="text-[10px] text-slate-600 italic">{daySlots[6]?.teacher || ''}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Signatures */}
        <div className="mt-10 pt-6 border-t-2 border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
          <div className="border-t border-slate-800 pt-2">
            <span className="font-bold text-slate-900 block">{selectedClass.teacherName}</span>
            <span className="text-[10px] text-slate-600">Class Teacher In-charge</span>
          </div>

          <div className="pt-2 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-[9px] font-bold text-slate-400 uppercase">
              School Seal
            </div>
          </div>

          <div className="border-t border-slate-800 pt-2">
            <span className="font-bold text-slate-900 block">Rev. Dr. L. H. Rohmingliana</span>
            <span className="text-[10px] text-slate-600">Principal / Head of Institution</span>
          </div>
        </div>
      </div>

      {/* EDIT PERIOD SLOT MODAL */}
      {isEditModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0e1626] border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Edit Routine Period Slot
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedSlot.day} • Period {selectedSlot.periodIndex + 1}
                </p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={selectedSlot.subject}
                  onChange={(e) => setSelectedSlot({ ...selectedSlot, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Teacher / Faculty Name *</label>
                <input
                  type="text"
                  required
                  value={selectedSlot.teacher}
                  onChange={(e) => setSelectedSlot({ ...selectedSlot, teacher: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Room Number</label>
                  <input
                    type="text"
                    value={selectedSlot.room}
                    onChange={(e) => setSelectedSlot({ ...selectedSlot, room: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Time Range</label>
                  <input
                    type="text"
                    value={selectedSlot.time}
                    onChange={(e) => setSelectedSlot({ ...selectedSlot, time: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
