import React from 'react';
import { X, Printer, School, Calendar, User, Clock } from 'lucide-react';
import { TimetableRecord, DayOfWeek, SchoolClass } from '../types';

interface TimetablePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  timetable: TimetableRecord;
  schoolClass?: SchoolClass;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TimetablePrintModal: React.FC<TimetablePrintModalProps> = ({
  isOpen,
  onClose,
  timetable,
  schoolClass,
}) => {
  if (!isOpen) return null;

  // Group unique periods ordered by start time
  const timeSlots = Array.from(
    new Map(
      timetable.slots.map((s) => [
        `${s.periodNumber}-${s.startTime}`,
        {
          periodNumber: s.periodNumber,
          periodLabel: s.periodLabel,
          startTime: s.startTime,
          endTime: s.endTime,
          isBreak: s.isBreak,
        },
      ])
    ).values()
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Distinct subjects and teachers
  const facultyAssignments = Array.from(
    new Map(
      timetable.slots
        .filter((s) => !s.isBreak && s.teacherName && s.subject)
        .map((s) => [s.subject, { subject: s.subject, teacher: s.teacherName, room: s.roomNumber }])
    ).values()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Toolbar (hidden in print) */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/90 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Printable Routine Preview</h3>
              <p className="text-[11px] text-gray-400">
                Official MBSE Class Schedule Format • Ready for Notice Board / Student Handout
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body (styled for high-contrast crisp white paper in print, dark in preview) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white text-gray-900 print:p-0 print:m-0 font-serif">
          {/* Header */}
          <div className="text-center pb-6 border-b-2 border-gray-900">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full border-2 border-gray-900 flex items-center justify-center font-bold text-lg">
                ZS
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-gray-900">
                  GOVERNMENT OF MIZORAM
                </h1>
                <h2 className="text-sm sm:text-base font-bold text-gray-700 tracking-wide uppercase">
                  DIRECTORATE OF SCHOOL EDUCATION • AIZAWL
                </h2>
              </div>
            </div>
            <p className="text-xs font-medium text-gray-600 uppercase tracking-widest mt-1">
              Affiliated to Mizoram Board of School Education (MBSE)
            </p>
            <div className="inline-block mt-3 px-4 py-1 border border-gray-900 font-bold text-xs uppercase tracking-wider bg-gray-100">
              OFFICIAL CLASS ROUTINE & PERIOD SCHEDULE • ACADEMIC SESSION {timetable.academicYear}
            </div>
          </div>

          {/* Meta Info Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-gray-300 text-xs">
            <div>
              <span className="font-bold block text-gray-600 uppercase text-[10px]">Class & Section</span>
              <span className="font-bold text-sm text-gray-900">{timetable.className}</span>
            </div>
            <div>
              <span className="font-bold block text-gray-600 uppercase text-[10px]">Class Teacher</span>
              <span className="font-medium text-gray-900">
                {schoolClass?.teacherName || 'Sir Lalbiakzuala Ralte'}
              </span>
            </div>
            <div>
              <span className="font-bold block text-gray-600 uppercase text-[10px]">Room Allotment</span>
              <span className="font-medium text-gray-900">
                {schoolClass?.roomNumber || 'Room 201'}
              </span>
            </div>
            <div>
              <span className="font-bold block text-gray-600 uppercase text-[10px]">Effective Date</span>
              <span className="font-medium text-gray-900">
                {timetable.effectiveFrom || 'April 2026 - March 2027'}
              </span>
            </div>
          </div>

          {/* Timetable Matrix Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse border-2 border-gray-900 text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-900 p-2 font-bold uppercase text-[11px] w-24">
                    Day / Time
                  </th>
                  {timeSlots.map((slot) => (
                    <th
                      key={`${slot.periodNumber}-${slot.startTime}`}
                      className={`border border-gray-900 p-2 text-center font-bold ${
                        slot.isBreak ? 'bg-gray-200 w-16' : ''
                      }`}
                    >
                      <div className="font-bold uppercase text-[11px]">{slot.periodLabel}</div>
                      <div className="text-[10px] text-gray-600 font-mono font-normal">
                        {slot.startTime} - {slot.endTime}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => {
                  const daySlots = timetable.slots.filter((s) => s.dayOfWeek === day);
                  if (daySlots.length === 0) return null;

                  return (
                    <tr key={day} className="hover:bg-gray-50/80">
                      <td className="border border-gray-900 p-2.5 font-bold uppercase bg-gray-50 text-[11px] whitespace-nowrap">
                        {day}
                      </td>
                      {timeSlots.map((slotDef) => {
                        const matched = daySlots.find(
                          (s) =>
                            s.periodNumber === slotDef.periodNumber ||
                            (s.startTime === slotDef.startTime && s.endTime === slotDef.endTime)
                        );

                        if (slotDef.isBreak) {
                          return (
                            <td
                              key={`${day}-${slotDef.periodNumber}`}
                              className="border border-gray-900 p-1 bg-gray-200 text-center text-[10px] font-semibold text-gray-700 writing-mode-vertical"
                            >
                              <div className="text-[9px] uppercase tracking-wider text-gray-600">
                                {slotDef.periodLabel.includes('Lunch') ? 'LUNCH' : 'RECESS'}
                              </div>
                            </td>
                          );
                        }

                        if (!matched) {
                          return (
                            <td
                              key={`${day}-${slotDef.periodNumber}`}
                              className="border border-gray-900 p-2 text-center text-gray-400"
                            >
                              —
                            </td>
                          );
                        }

                        return (
                          <td
                            key={`${day}-${slotDef.periodNumber}`}
                            className="border border-gray-900 p-2 text-center align-top"
                          >
                            <div className="font-bold text-gray-900 leading-tight">
                              {matched.subject}
                            </div>
                            <div className="text-[10px] text-gray-600 mt-0.5">
                              {matched.teacherName}
                            </div>
                            {matched.roomNumber && (
                              <div className="text-[9px] text-gray-500 font-mono mt-0.5">
                                [{matched.roomNumber}]
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Subject & Teacher Legend */}
          <div className="mt-6 pt-4 border-t border-gray-300">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-2">
              Faculty & Subject Assignment Directory:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              {facultyAssignments.map((f) => (
                <div key={f.subject} className="flex items-center gap-1.5 border-b border-gray-200 py-1">
                  <span className="font-bold text-gray-900">{f.subject}:</span>
                  <span className="text-gray-700">{f.teacher}</span>
                  <span className="text-gray-500 font-mono text-[10px]">({f.room})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions / Notes */}
          <div className="mt-6 p-3 bg-gray-50 border border-gray-300 text-[10px] text-gray-700 space-y-1">
            <p className="font-bold uppercase tracking-wide">Notice & Guidelines for Students & Staff:</p>
            <p>
              1. All students must be present on the school campus by 08:50 AM. Morning Assembly commences punctually at 09:00 AM.
            </p>
            <p>
              2. Laboratory, IT, and Physical Education classes require respective lab coats, manuals, and sportswear.
            </p>
            <p>
              3. Any routine adjustments or teacher substitution will be notified on the digital dashboard.
            </p>
          </div>

          {/* Signatures */}
          <div className="mt-12 pt-6 grid grid-cols-3 text-center text-xs">
            <div>
              <div className="w-32 border-b border-gray-900 mx-auto mb-1"></div>
              <p className="font-bold text-gray-900">Class Teacher</p>
              <p className="text-[10px] text-gray-500">{schoolClass?.teacherName || 'Signature'}</p>
            </div>
            <div>
              <div className="w-32 border-b border-gray-900 mx-auto mb-1"></div>
              <p className="font-bold text-gray-900">Academic Dean</p>
              <p className="text-[10px] text-gray-500">Curriculum Committee</p>
            </div>
            <div>
              <div className="w-32 border-b border-gray-900 mx-auto mb-1"></div>
              <p className="font-bold text-gray-900">Principal / Headmaster</p>
              <p className="text-[10px] text-gray-500">Government of Mizoram</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
