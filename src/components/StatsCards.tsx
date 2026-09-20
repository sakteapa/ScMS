import React from 'react';
import { Users, UserCheck, UserX, Award } from 'lucide-react';
import { Student } from '../types';

interface StatsCardsProps {
  students: Student[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ students }) => {
  const total = students.length;
  const present = students.filter((s) => s.attendance === 'Present').length;
  const absent = students.filter((s) => s.attendance === 'Absent').length;
  const late = students.filter((s) => s.attendance === 'Late').length;
  const avgMarks =
    total > 0
      ? Math.round(students.reduce((acc, s) => acc + s.marks, 0) / total)
      : 0;

  const attendanceRate = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-6">
      <div className="bg-gray-800/90 border border-gray-700/80 rounded-lg p-4 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs font-medium text-gray-400">Total Students</p>
          <h4 className="text-2xl font-bold text-white mt-1">{total}</h4>
          <p className="text-[11px] text-gray-400 mt-0.5">Enrolled records</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
          <Users className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-gray-800/90 border border-gray-700/80 rounded-lg p-4 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs font-medium text-emerald-400">Present Today</p>
          <h4 className="text-2xl font-bold text-white mt-1">{present}</h4>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {total > 0 ? `${Math.round((present / total) * 100)}% on time` : '0%'}
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
          <UserCheck className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-gray-800/90 border border-gray-700/80 rounded-lg p-4 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs font-medium text-rose-400">Absent</p>
          <h4 className="text-2xl font-bold text-white mt-1">{absent}</h4>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {late > 0 ? `+${late} marked late` : 'Requires follow-up'}
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
          <UserX className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-gray-800/90 border border-gray-700/80 rounded-lg p-4 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs font-medium text-amber-400">Class Average</p>
          <h4 className="text-2xl font-bold text-white mt-1">{avgMarks}%</h4>
          <p className="text-[11px] text-gray-400 mt-0.5">Attendance: {attendanceRate}%</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
          <Award className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
