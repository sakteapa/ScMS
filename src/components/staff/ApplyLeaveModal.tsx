import React, { useState } from 'react';
import { StaffMember, StaffLeave, StaffLeaveType } from '../../types';
import { X, Calendar, AlertCircle } from 'lucide-react';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  onApplyLeave: (leave: Omit<StaffLeave, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  preselectedStaffId?: string;
}

const LEAVE_TYPES: StaffLeaveType[] = [
  'Casual Leave',
  'Medical Leave',
  'Earned Leave',
  'Duty Leave',
  'Maternity Leave',
  'Leave Without Pay',
];

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  isOpen,
  onClose,
  staffList,
  onApplyLeave,
  preselectedStaffId,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    preselectedStaffId || (staffList.length > 0 ? staffList[0].id : '')
  );
  const [leaveType, setLeaveType] = useState<StaffLeaveType>('Casual Leave');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalDays, setTotalDays] = useState<number>(1);
  const [reason, setReason] = useState('');
  const [isLwp, setIsLwp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-recalculate totalDays when dates change
  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (val && endDate) {
      const diff = Math.max(1, Math.round((new Date(endDate).getTime() - new Date(val).getTime()) / (1000 * 60 * 60 * 24)) + 1);
      setTotalDays(diff);
    }
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    if (startDate && val) {
      const diff = Math.max(1, Math.round((new Date(val).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1);
      setTotalDays(diff);
    }
  };

  const handleLeaveTypeChange = (type: StaffLeaveType) => {
    setLeaveType(type);
    if (type === 'Leave Without Pay') {
      setIsLwp(true);
    }
  };

  if (!isOpen) return null;

  const currentStaff = staffList.find((s) => s.id === selectedStaffId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId || !currentStaff || !reason.trim()) return;

    setIsSubmitting(true);
    try {
      await onApplyLeave({
        staffId: currentStaff.id,
        staffName: currentStaff.name,
        employeeId: currentStaff.employeeId,
        designation: currentStaff.designation,
        department: currentStaff.department,
        leaveType,
        startDate,
        endDate,
        totalDays: Number(totalDays) || 1,
        reason: reason.trim(),
        status: 'Pending',
        appliedDate: new Date().toISOString().split('T')[0],
        isLwp: isLwp || leaveType === 'Leave Without Pay',
      });
      onClose();
    } catch (err) {
      console.error('Failed to submit leave:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden text-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Apply Staff Leave</h2>
              <p className="text-xs text-slate-400">
                Staff Absence Application & Approval Workflow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Select Staff Member <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {staffList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.employeeId} - {st.designation})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Leave Category
              </label>
              <select
                value={leaveType}
                onChange={(e) => handleLeaveTypeChange(e.target.value as StaffLeaveType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {LEAVE_TYPES.map((lt) => (
                  <option key={lt} value={lt}>
                    {lt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Total Days Count
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                required
                value={totalDays}
                onChange={(e) => setTotalDays(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Reason for Absence <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Attending family function in Lunglei, medical appointment, official workshop..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* LWP Checkbox */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <input
              type="checkbox"
              id="lwpCheckbox"
              checked={isLwp || leaveType === 'Leave Without Pay'}
              onChange={(e) => setIsLwp(e.target.checked)}
              disabled={leaveType === 'Leave Without Pay'}
              className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
            />
            <label htmlFor="lwpCheckbox" className="text-xs text-slate-300 cursor-pointer">
              Mark as <strong className="text-rose-400">Leave Without Pay (LWP)</strong> — Per-day basic pay will be deducted during monthly payroll calculation.
            </label>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-amber-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Leave Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
