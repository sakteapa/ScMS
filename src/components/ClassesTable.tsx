import React from 'react';
import { Building2, Users, UserCheck, DoorOpen, Sparkles } from 'lucide-react';
import { SchoolClass, FirestoreStudent } from '../types';

interface ClassesTableProps {
  classes: SchoolClass[];
  students: FirestoreStudent[];
}

export const ClassesTable: React.FC<ClassesTableProps> = ({ classes, students }) => {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-md">
      <div className="p-4 sm:p-5 border-b border-gray-700/80 flex items-center justify-between bg-gray-850">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Class Divisions & Sections
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-mono border border-indigo-500/30">
              col: classes
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Active classrooms, assigned Mizo class teachers, and section allocations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-5">
        {classes.map((cls) => {
          const classStudents = students.filter((s) => s.classId === cls.id);
          const enrolledCount = classStudents.length;

          return (
            <div
              key={cls.id}
              className="bg-gray-900/80 rounded-lg border border-gray-700/70 p-4 hover:border-indigo-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wide">
                      {cls.classGrade}
                    </span>
                    <h4 className="text-base font-bold text-white mt-0.5">{cls.name}</h4>
                  </div>
                  <span className="p-2 rounded-md bg-gray-800 text-gray-300">
                    <DoorOpen className="w-4 h-4" />
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Teacher: <strong className="text-white">{cls.teacherName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <span>Room: <strong className="text-gray-200">{cls.roomNumber}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enrolled: <strong className="text-emerald-400">{enrolledCount} students</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
                <span className="font-mono">Section {cls.section}</span>
                <span className="px-2 py-0.5 rounded bg-gray-800 text-indigo-300 font-medium">
                  Firestore ID: {cls.id}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
