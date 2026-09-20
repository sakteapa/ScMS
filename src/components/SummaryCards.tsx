import React from 'react';
import {
  Users,
  CalendarCheck,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  IndianRupee,
} from 'lucide-react';
import { FirestoreStudent, AttendanceRecord, FeeRecord } from '../types';

interface SummaryCardsProps {
  students: FirestoreStudent[];
  attendance: AttendanceRecord[];
  fees: FeeRecord[];
  onNavigateTab: (tab: 'students' | 'attendance' | 'fees') => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  students,
  attendance,
  fees,
  onNavigateTab,
}) => {
  // 1. Total Students Metrics
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'Active').length;
  const maleCount = students.filter((s) => s.gender === 'Male').length;
  const femaleCount = students.filter((s) => s.gender === 'Female').length;

  // 2. Today's Attendance Metrics
  const presentCount = attendance.filter((a) => a.status === 'Present').length;
  const absentCount = attendance.filter((a) => a.status === 'Absent').length;
  const lateCount = attendance.filter((a) => a.status === 'Late').length;
  const totalAttendanceRecorded = attendance.length;
  const attendanceRate =
    totalAttendanceRecorded > 0
      ? Math.round(((presentCount + lateCount * 0.5) / totalAttendanceRecorded) * 100)
      : 0;

  // 3. Fee Status Metrics
  const totalExpectedFees = fees.reduce((acc, f) => acc + f.totalAmount, 0);
  const totalCollectedFees = fees.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalPendingFees = Math.max(0, totalExpectedFees - totalCollectedFees);
  const paidCount = fees.filter((f) => f.status === 'Paid').length;
  const overdueCount = fees.filter((f) => f.status === 'Overdue').length;
  const pendingCount = fees.filter((f) => f.status === 'Pending' || f.status === 'Partial').length;
  const feeCollectionRate =
    totalExpectedFees > 0 ? Math.round((totalCollectedFees / totalExpectedFees) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Total Students Card */}
      <div
        onClick={() => onNavigateTab('students')}
        className="bg-gray-800 rounded-xl border border-gray-700 p-5 shadow-sm hover:border-indigo-500/60 transition-all cursor-pointer group relative overflow-hidden"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Total Students
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-extrabold text-white tracking-tight">
                {totalStudents}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {activeStudents} Active
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-500/15 text-indigo-400 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Sub-breakdown */}
        <div className="mt-4 pt-3 border-t border-gray-700/60 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span>
              Boys: <strong className="text-gray-200">{maleCount}</strong>
            </span>
            <span className="text-gray-600">•</span>
            <span>
              Girls: <strong className="text-gray-200">{femaleCount}</strong>
            </span>
          </div>
          <span className="text-indigo-400 font-medium group-hover:underline">
            View All →
          </span>
        </div>
      </div>

      {/* 2. Today's Attendance Card */}
      <div
        onClick={() => onNavigateTab('attendance')}
        className="bg-gray-800 rounded-xl border border-gray-700 p-5 shadow-sm hover:border-emerald-500/60 transition-all cursor-pointer group relative overflow-hidden"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Today's Attendance
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                {attendanceRate}%
              </h3>
              <span className="text-xs text-gray-400">
                ({presentCount} of {totalAttendanceRecorded} present)
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:scale-105 transition-transform">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700/70 h-2 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${attendanceRate}%` }}
          />
        </div>

        {/* Sub-breakdown */}
        <div className="mt-3 pt-2 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="text-rose-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              {absentCount} Absent
            </span>
            {lateCount > 0 && (
              <span className="text-amber-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                {lateCount} Late
              </span>
            )}
          </div>
          <span className="text-emerald-400 font-medium group-hover:underline">
            Roll Call →
          </span>
        </div>
      </div>

      {/* 3. Fee Status Card */}
      <div
        onClick={() => onNavigateTab('fees')}
        className="bg-gray-800 rounded-xl border border-gray-700 p-5 shadow-sm hover:border-amber-500/60 transition-all cursor-pointer group relative overflow-hidden"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Fee Status (September)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center">
                ₹{totalCollectedFees.toLocaleString()}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {feeCollectionRate}% Collected
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/15 text-amber-400 group-hover:scale-105 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700/70 h-2 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-amber-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${feeCollectionRate}%` }}
          />
        </div>

        {/* Sub-breakdown */}
        <div className="mt-3 pt-2 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-gray-300">
              Pending: <strong className="text-amber-400">₹{totalPendingFees.toLocaleString()}</strong>
            </span>
            {overdueCount > 0 && (
              <span className="text-[11px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-medium">
                {overdueCount} Overdue
              </span>
            )}
          </div>
          <span className="text-amber-400 font-medium group-hover:underline">
            Manage Fees →
          </span>
        </div>
      </div>
    </div>
  );
};
