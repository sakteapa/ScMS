import React from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  GraduationCap,
} from 'lucide-react';
import { Student, AttendanceStatus } from '../types';

interface StudentTableProps {
  students: Student[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedClass: string;
  onClassChange: (val: string) => void;
  selectedAttendance: string;
  onAttendanceChange: (val: string) => void;
  onToggleAttendance: (id: string, nextStatus: AttendanceStatus) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onAddNew: () => void;
  onResetData: () => void;
  lastUpdatedId?: string;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  searchQuery,
  onSearchChange,
  selectedClass,
  onClassChange,
  selectedAttendance,
  onAttendanceChange,
  onToggleAttendance,
  onEditStudent,
  onDeleteStudent,
  onAddNew,
  onResetData,
  lastUpdatedId,
}) => {
  const classesList = Array.from(new Set(students.map((s) => s.class))).sort();

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toString().includes(searchQuery) ||
      s.guardianPhone.includes(searchQuery);

    const matchesClass = !selectedClass || selectedClass === 'All' || s.class === selectedClass;
    const matchesAttendance =
      !selectedAttendance || selectedAttendance === 'All' || s.attendance === selectedAttendance;

    return matchesSearch && matchesClass && matchesAttendance;
  });

  const getAttendanceBadge = (status: AttendanceStatus, id: string) => {
    if (status === 'Present') {
      return (
        <button
          type="button"
          onClick={() => onToggleAttendance(id, 'Absent')}
          title="Click to toggle to Absent"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Present
        </button>
      );
    }
    if (status === 'Absent') {
      return (
        <button
          type="button"
          onClick={() => onToggleAttendance(id, 'Late')}
          title="Click to toggle to Late"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-all cursor-pointer"
        >
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          Absent
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={() => onToggleAttendance(id, 'Present')}
        title="Click to toggle to Present"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all cursor-pointer"
      >
        <Clock className="w-3.5 h-3.5 text-amber-400" />
        Late
      </button>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-sm">
      {/* Header & Controls */}
      <div className="p-4 border-b border-gray-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-800/80">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">Student Records / Zirlai List</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 font-medium">
            {filtered.length} of {students.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Student
          </button>
          <button
            type="button"
            onClick={onResetData}
            title="Reset default sample student list"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 bg-gray-850 border-b border-gray-700/60 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, roll no, or phone..."
            className="w-full bg-gray-900 border border-gray-700 rounded-md pl-8 pr-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
          <select
            value={selectedClass}
            onChange={(e) => onClassChange(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="All">All Classes (Zawng zawng)</option>
            {classesList.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedAttendance}
            onChange={(e) => onAttendanceChange(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="All">Attendance: All Status</option>
            <option value="Present">Present Only</option>
            <option value="Absent">Absent Only</option>
            <option value="Late">Late Only</option>
          </select>
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-200">
          <thead className="bg-gray-900/60 text-gray-400 uppercase tracking-wider text-[11px] border-b border-gray-700/60">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Roll No</th>
              <th scope="col" className="px-4 py-3 font-semibold">Student Name</th>
              <th scope="col" className="px-4 py-3 font-semibold">Class / Sec</th>
              <th scope="col" className="px-4 py-3 font-semibold">Attendance</th>
              <th scope="col" className="px-4 py-3 font-semibold">Marks</th>
              <th scope="col" className="px-4 py-3 font-semibold">Guardian Phone</th>
              <th scope="col" className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">
                  Zirlai hmuh a ni lo. Search filter thlak rawh emaw AI Quick Command hmangin zirlai dah lut rawh.
                </td>
              </tr>
            ) : (
              filtered.map((student) => {
                const isRecentlyUpdated = student.id === lastUpdatedId;
                return (
                  <tr
                    key={student.id}
                    className={`transition-colors hover:bg-gray-700/30 ${
                      isRecentlyUpdated ? 'bg-indigo-950/40 ring-1 ring-indigo-500/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-indigo-300">
                      #{student.rollNumber}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">
                      <div>{student.name}</div>
                      {student.remarks && (
                        <div className="text-[10px] text-gray-400 font-normal">{student.remarks}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      <span className="px-2 py-0.5 rounded bg-gray-700/60 text-[11px] font-medium">
                        {student.class} - {student.section}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getAttendanceBadge(student.attendance, student.id)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{student.marks}%</span>
                        <div className="w-12 h-1.5 rounded-full bg-gray-700 overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${
                              student.marks >= 80
                                ? 'bg-emerald-400'
                                : student.marks >= 60
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                            }`}
                            style={{ width: `${student.marks}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-[11px]">
                      {student.guardianPhone || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEditStudent(student)}
                          title="Edit Student"
                          className="p-1 rounded text-gray-400 hover:text-indigo-300 hover:bg-gray-700/80 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteStudent(student.id)}
                          title="Delete Student"
                          className="p-1 rounded text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
