import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Database,
  Filter,
  CreditCard,
  AlertTriangle,
  Clock,
  ShieldCheck,
  QrCode,
  Download,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { FirestoreStudent, SchoolClass } from '../types';
import { deleteDocument, updateDocument } from '../lib/firebase';
import {
  generateStudentQrDataUrl,
  downloadStudentQrPng,
  CURRENT_ACADEMIC_YEAR,
} from '../lib/qrCodeService';
import { exportStudentsData } from '../lib/exportUtils';

interface StudentsTableProps {
  students: FirestoreStudent[];
  classes: SchoolClass[];
  onOpenAddModal: () => void;
  onEditStudent: (student: FirestoreStudent) => void;
  onOpenFeePayment?: (student?: FirestoreStudent) => void;
}

export const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  classes,
  onOpenAddModal,
  onEditStudent,
  onOpenFeePayment,
}) => {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [feeStatusFilter, setFeeStatusFilter] = useState('All');
  const [qrModalStudent, setQrModalStudent] = useState<FirestoreStudent | null>(null);
  const [qrModalUrl, setQrModalUrl] = useState<string>('');

  const handleOpenQrModal = async (student: FirestoreStudent) => {
    setQrModalStudent(student);
    try {
      const url = await generateStudentQrDataUrl(student, { width: 300 });
      setQrModalUrl(url);
    } catch (e) {
      console.error('Failed to generate QR for modal:', e);
    }
  };

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toString().includes(search) ||
      s.parentPhone.includes(search) ||
      (s.address && s.address.toLowerCase().includes(search.toLowerCase()));

    const matchesClass = classFilter === 'All' || s.classId === classFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    const currentFeeStatus = s.feeStatus || 'Cleared';
    const matchesFeeStatus = feeStatusFilter === 'All' || currentFeeStatus === feeStatusFilter;

    return matchesSearch && matchesClass && matchesStatus && matchesFeeStatus;
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Zirlai "${name}" hi Firestore database atangin paih i duh takzet em?`)) {
      await deleteDocument('students', id);
    }
  };

  const handleToggleStatus = async (student: FirestoreStudent) => {
    const nextStatus = student.status === 'Active' ? 'Inactive' : 'Active';
    await updateDocument('students', student.id, { status: nextStatus });
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-md">
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-gray-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-850">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Students Registry
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-mono border border-indigo-500/30">
              col: students
            </span>
            <span className="text-xs text-gray-400">({filtered.length} records)</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time synced Firestore collection for enrolled students in Mizoram
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportStudentsData(filtered, classes, 'excel')}
            title="Download filtered students list as Excel (.xls)"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Student
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 bg-gray-900/60 border-b border-gray-700/60 grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll no, phone, address..."
            className="w-full bg-gray-900 border border-gray-700 rounded-md pl-8 pr-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="All">All Classes (Zawng zawng)</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="All">Enrollment: All</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>

        <div>
          <select
            value={feeStatusFilter}
            onChange={(e) => setFeeStatusFilter(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="All">Fee Clearance: All</option>
            <option value="Cleared">Cleared (No Dues)</option>
            <option value="Pending">Pending Dues</option>
            <option value="Overdue">Overdue Arrears</option>
            <option value="Partial">Partial Paid</option>
          </select>
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
              <th scope="col" className="px-4 py-3 font-semibold">Parent / Contact</th>
              <th scope="col" className="px-4 py-3 font-semibold">Address</th>
              <th scope="col" className="px-4 py-3 font-semibold">Enrollment</th>
              <th scope="col" className="px-4 py-3 font-semibold">Fee Clearance</th>
              <th scope="col" className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50 font-sans">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">
                  Student record hmuh a ni lo. Search filter thlak rawh emaw 'Add New Student' hmet rawh le.
                </td>
              </tr>
            ) : (
              filtered.map((student) => {
                const fStatus = student.feeStatus || 'Cleared';
                const dues = student.totalFeesDue || 0;

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-700/30 transition-colors group"
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-indigo-400">
                      #{student.rollNo}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[13px]">{student.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-700 text-gray-300">
                          {student.gender}
                        </span>
                      </div>
                      {student.remarks && (
                        <div className="text-[11px] text-gray-400 font-normal mt-0.5">
                          {student.remarks}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-gray-300">
                      <span className="px-2 py-0.5 rounded bg-gray-700/70 text-[11px] font-medium border border-gray-600/40">
                        {student.className}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-gray-500" />
                        {student.parentPhone}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-[11px]">
                      <div className="flex items-center gap-1.5 truncate max-w-xs">
                        <MapPin className="w-3 h-3 text-gray-500 shrink-0" />
                        <span>{student.address || 'Aizawl'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(student)}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${
                          student.status === 'Active'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            student.status === 'Active' ? 'bg-emerald-400' : 'bg-gray-400'
                          }`}
                        ></span>
                        {student.status}
                      </button>
                    </td>

                    {/* Fee Clearance Column */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            fStatus === 'Cleared'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : fStatus === 'Overdue'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : fStatus === 'Partial'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30'
                          }`}
                        >
                          {fStatus === 'Cleared' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {fStatus === 'Overdue' && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                          {fStatus === 'Partial' && <Clock className="w-3 h-3 text-amber-400" />}
                          {fStatus} {dues > 0 ? `(₹${dues.toLocaleString()})` : '(₹0)'}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenQrModal(student)}
                          title="View & Download Student QR Badge"
                          className="p-1.5 rounded text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        {onOpenFeePayment && (
                          <button
                            type="button"
                            onClick={() => onOpenFeePayment(student)}
                            title="Record / Manage Fees"
                            className="p-1.5 rounded text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onEditStudent(student)}
                          title="Edit Student"
                          className="p-1.5 rounded text-gray-400 hover:text-indigo-300 hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(student.id, student.name)}
                          title="Delete Student"
                          className="p-1.5 rounded text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
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

      {/* QR Code Inspection Modal */}
      {qrModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-sm w-full p-6 text-gray-100 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{qrModalStudent.name}</h3>
                  <p className="text-[11px] text-gray-400 font-mono">
                    Roll #{qrModalStudent.rollNo} • {qrModalStudent.className}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQrModalStudent(null)}
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 text-center">
              <div className="p-3 bg-white rounded-xl border border-gray-300 inline-block shadow-md">
                {qrModalUrl ? (
                  <img src={qrModalUrl} alt="QR Code" className="w-48 h-48 object-contain" />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 animate-pulse rounded" />
                )}
                <span className="block text-[9px] font-mono text-gray-700 font-bold mt-1 uppercase">
                  Mizoram School System • zoxs-sms
                </span>
              </div>

              <div className="mt-4 p-3 bg-gray-950 rounded-lg border border-gray-800 text-left text-xs font-mono space-y-1 text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-500">Student ID:</span>
                  <span className="font-semibold text-white">STD-{qrModalStudent.rollNo.toString().padStart(3, '0')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Parent Phone:</span>
                  <span>{qrModalStudent.parentPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Academic Year:</span>
                  <span>{CURRENT_ACADEMIC_YEAR}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQrModalStudent(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => downloadStudentQrPng(qrModalStudent)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
