import React, { useState } from 'react';
import {
  CalendarCheck,
  Check,
  X,
  Clock,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Smartphone,
  MessageSquare,
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, SchoolClass, FirestoreStudent } from '../types';
import { updateDocument } from '../lib/firebase';
import { generateWhatsAppLink, dispatchNotification } from '../lib/notificationService';

interface AttendanceTableProps {
  attendance: AttendanceRecord[];
  classes: SchoolClass[];
  students?: FirestoreStudent[];
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  attendance,
  classes,
  students = [],
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-09-18');
  const [selectedClass, setSelectedClass] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = attendance.filter((item) => {
    const matchesDate = !selectedDate || item.date === selectedDate;
    const matchesClass = selectedClass === 'All' || item.classId === selectedClass;
    const matchesSearch =
      item.studentName.toLowerCase().includes(search.toLowerCase()) ||
      item.rollNo.toString().includes(search);
    return matchesDate && matchesClass && matchesSearch;
  });

  const handleUpdateStatus = async (item: AttendanceRecord, newStatus: AttendanceStatus) => {
    await updateDocument('attendance', item.id, {
      status: newStatus,
      markedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleMarkAllPresent = async () => {
    for (const item of filtered) {
      if (item.status !== 'Present') {
        await updateDocument('attendance', item.id, {
          status: 'Present',
          markedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    }
  };

  const presentCount = filtered.filter((i) => i.status === 'Present').length;
  const absentCount = filtered.filter((i) => i.status === 'Absent').length;
  const lateCount = filtered.filter((i) => i.status === 'Late').length;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-md">
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-gray-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-850">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Daily Attendance & Roll Call
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono border border-emerald-500/30">
              col: attendance
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time attendance register synced directly with Cloud Firestore
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark Filtered as Present
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="px-5 py-3 bg-gray-900/80 border-b border-gray-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-gray-400">
            Total Enrolled: <strong className="text-white">{filtered.length}</strong>
          </span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            Present: <strong>{presentCount}</strong>
          </span>
          <span className="text-rose-400 flex items-center gap-1">
            <X className="w-3.5 h-3.5" />
            Absent: <strong>{absentCount}</strong>
          </span>
          <span className="text-amber-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Late: <strong>{lateCount}</strong>
          </span>
        </div>

        <div className="text-[11px] text-gray-400">
          Showing Date: <span className="text-indigo-300 font-mono">{selectedDate}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="p-3.5 bg-gray-900/60 border-b border-gray-700/60 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or roll no..."
            className="w-full bg-gray-900 border border-gray-700 rounded-md pl-8 pr-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Classes (Zawng zawng)</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-200">
          <thead className="bg-gray-900/70 text-gray-400 uppercase tracking-wider text-[11px] border-b border-gray-700/60">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Roll No</th>
              <th scope="col" className="px-4 py-3 font-semibold">Student Name</th>
              <th scope="col" className="px-4 py-3 font-semibold">Class</th>
              <th scope="col" className="px-4 py-3 font-semibold">Marked Time</th>
              <th scope="col" className="px-4 py-3 font-semibold">Current Status</th>
              <th scope="col" className="px-4 py-3 font-semibold text-right">Quick Mark Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Attendance data hmuh a ni lo.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-indigo-400">
                    #{item.rollNo}
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">
                    {item.studentName}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    <span className="px-2 py-0.5 rounded bg-gray-700/70 text-[11px]">
                      {item.className}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-[11px]">
                    {item.markedAt || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.status === 'Present'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : item.status === 'Absent'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(item, 'Present')}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                          item.status === 'Present'
                            ? 'bg-emerald-600 text-white font-semibold'
                            : 'bg-gray-700 hover:bg-emerald-700/60 text-gray-300 hover:text-white'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(item, 'Absent')}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                          item.status === 'Absent'
                            ? 'bg-rose-600 text-white font-semibold'
                            : 'bg-gray-700 hover:bg-rose-700/60 text-gray-300 hover:text-white'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(item, 'Late')}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                          item.status === 'Late'
                            ? 'bg-amber-600 text-white font-semibold'
                            : 'bg-gray-700 hover:bg-amber-700/60 text-gray-300 hover:text-white'
                        }`}
                      >
                        Late
                      </button>

                      {item.status === 'Absent' && (() => {
                        const matchedStudent = students.find((s) => s.id === item.studentId);
                        const phone = matchedStudent?.parentPhone;
                        if (!phone) return null;
                        const msg = `Nu leh pa chibai, vawiin (${item.date}) hian i fa ${item.studentName} (Roll #${item.rollNo}, Class: ${item.className}) chu school a rawn kal lo (Absent) a ni tih kan hriattir a che u. - ZOXS Higher Secondary School, Aizawl`;
                        const waLink = generateWhatsAppLink(phone, msg);

                        return (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => {
                              dispatchNotification({
                                student: matchedStudent,
                                phone,
                                channel: 'WhatsApp',
                                category: 'Attendance Alert',
                                subject: `Absent Notice: ${item.studentName}`,
                                message: msg,
                                dispatchedBy: 'Roll Call Register',
                              });
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-700/80 hover:bg-emerald-600 text-white transition-colors cursor-pointer ml-1"
                            title="Send Absent Alert to Parent via WhatsApp (wa.me)"
                          >
                            <Smartphone className="w-3 h-3" />
                            WA Alert
                          </a>
                        );
                      })()}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
