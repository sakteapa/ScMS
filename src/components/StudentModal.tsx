import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Student, AttendanceStatus } from '../types';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: Partial<Student>) => void;
  studentToEdit?: Student | null;
  suggestedRollNumber: number;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  studentToEdit,
  suggestedRollNumber,
}) => {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState<number>(suggestedRollNumber);
  const [studentClass, setStudentClass] = useState('Class 10');
  const [section, setSection] = useState('A');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [attendance, setAttendance] = useState<AttendanceStatus>('Present');
  const [marks, setMarks] = useState<number>(85);
  const [guardianPhone, setGuardianPhone] = useState('+91 9862');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name);
      setRollNumber(studentToEdit.rollNumber);
      setStudentClass(studentToEdit.class);
      setSection(studentToEdit.section);
      setGender(studentToEdit.gender);
      setAttendance(studentToEdit.attendance);
      setMarks(studentToEdit.marks);
      setGuardianPhone(studentToEdit.guardianPhone);
      setRemarks(studentToEdit.remarks || '');
    } else {
      setName('');
      setRollNumber(suggestedRollNumber);
      setStudentClass('Class 10');
      setSection('A');
      setGender('Male');
      setAttendance('Present');
      setMarks(80);
      setGuardianPhone('+91 9862' + Math.floor(100000 + Math.random() * 900000));
      setRemarks('');
    }
  }, [studentToEdit, suggestedRollNumber, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      rollNumber: Number(rollNumber),
      class: studentClass,
      section,
      gender,
      attendance,
      marks: Number(marks),
      guardianPhone: guardianPhone.trim(),
      remarks: remarks.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-lg w-full p-6 shadow-2xl text-gray-100 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-white mb-4">
          {studentToEdit ? 'Edit Student Record' : 'Add New Student / Zirlai Thar Dahna'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Zothanpudaia"
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Roll Number *
              </label>
              <input
                type="number"
                required
                min={1}
                value={rollNumber}
                onChange={(e) => setRollNumber(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Class</label>
              <select
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Attendance Today</label>
              <select
                value={attendance}
                onChange={(e) => setAttendance(e.target.value as AttendanceStatus)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Marks (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={marks}
                onChange={(e) => setMarks(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Guardian / Contact Phone
            </label>
            <input
              type="text"
              value={guardianPhone}
              onChange={(e) => setGuardianPhone(e.target.value)}
              placeholder="+91 9862..."
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Remarks / Note</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Regular student, House Captain"
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-xs font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              {studentToEdit ? 'Save Changes' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
