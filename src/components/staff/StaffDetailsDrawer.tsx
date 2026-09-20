import React, { useState } from 'react';
import { StaffMember, PayrollRecord, StaffLeave } from '../../types';
import {
  X,
  User,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Briefcase,
  FileText,
  Clock,
  Edit2,
  PlusCircle,
  Eye,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { formatINR } from '../../lib/payrollService';

interface StaffDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember | null;
  payrollList: PayrollRecord[];
  leavesList: StaffLeave[];
  onEdit: (staff: StaffMember) => void;
  onViewPayslip: (payroll: PayrollRecord) => void;
  onApplyLeave: (staffId: string) => void;
}

export const StaffDetailsDrawer: React.FC<StaffDetailsDrawerProps> = ({
  isOpen,
  onClose,
  staff,
  payrollList,
  leavesList,
  onEdit,
  onViewPayslip,
  onApplyLeave,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'payroll' | 'leaves'>('info');

  if (!isOpen || !staff) return null;

  const staffPayrolls = payrollList
    .filter((p) => p.staffId === staff.id)
    .sort((a, b) => b.month.localeCompare(a.month));

  const staffLeaves = leavesList
    .filter((l) => l.staffId === staff.id)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  const totalMonthlyGross =
    staff.baseSalary +
    (staff.allowances?.hra || 0) +
    (staff.allowances?.da || 0) +
    (staff.allowances?.medical || 0) +
    (staff.allowances?.special || 0) +
    (staff.allowances?.conveyance || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden my-6 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-600/30">
              {staff.name
                .split(' ')
                .filter((p) => !['Pu', 'Pi', 'Sir', 'Miss', 'Dr.', 'R.'].includes(p))
                .map((n) => n[0])
                .slice(0, 2)
                .join('') || staff.name.slice(0, 2)}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{staff.name}</h2>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    staff.status === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : staff.status === 'On Leave'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {staff.status}
                </span>
              </div>
              <p className="text-sm text-indigo-400 font-medium">{staff.designation}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {staff.employeeId} • Dept: {staff.department} • {staff.employmentType}
              </p>
            </div>
          </div>

          {/* Quick Info Strip */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Base Salary</span>
              <span className="text-slate-200 font-bold">{formatINR(staff.baseSalary)}</span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Gross Allowance</span>
              <span className="text-emerald-400 font-bold">{formatINR(totalMonthlyGross)}</span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Joined On</span>
              <span className="text-slate-300 font-semibold">{staff.joiningDate}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/60 text-xs font-medium">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Profile & Credentials
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'payroll'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Payroll History ({staffPayrolls.length})
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'leaves'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Leave Records ({staffLeaves.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'info' && (
            <div className="space-y-4 text-xs">
              {/* Personal & Contact Grid */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                  Contact & Demographics
                </h3>
                <div className="grid grid-cols-2 gap-y-2">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{staff.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{staff.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{staff.address || 'Aizawl, Mizoram'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                    <span>Qualification: {staff.qualification || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>DOB: {staff.dob || 'N/A'}</span>
                  </div>
                  {staff.assignedClassName && (
                    <div className="col-span-2 bg-indigo-950/30 text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-900/40">
                      Class In-charge: <strong>{staff.assignedClassName}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Bank & Payment Information */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                  Bank Account & Statutory Information
                </h3>
                <div className="grid grid-cols-2 gap-y-2">
                  <div>
                    <span className="text-slate-500 block">Bank & Branch</span>
                    <span className="text-slate-200 font-medium">
                      {staff.bankDetails?.bankName || 'State Bank of India'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Account Number</span>
                    <span className="text-slate-200 font-mono font-medium">
                      {staff.bankDetails?.accountNumber || 'Not provided'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">IFSC Code</span>
                    <span className="text-slate-200 font-mono">
                      {staff.bankDetails?.ifscCode || 'SBIN0001539'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">UPI ID</span>
                    <span className="text-slate-200 font-mono">
                      {staff.bankDetails?.upiId || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">PAN Card</span>
                    <span className="text-slate-200 font-mono">
                      {staff.bankDetails?.panNumber || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">EPF / UAN Ref</span>
                    <span className="text-slate-200 font-mono">{staff.epfNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              {staff.emergencyContact && (
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
                    Emergency Next-of-Kin Contact
                  </h3>
                  <p className="text-slate-300">
                    {staff.emergencyContact.name} ({staff.emergencyContact.relation}) •{' '}
                    <span className="text-slate-200 font-mono">{staff.emergencyContact.phone}</span>
                  </p>
                </div>
              )}

              {/* Notes */}
              {staff.notes && (
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Administrative Notes
                  </h3>
                  <p className="text-slate-300 italic">{staff.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="space-y-3">
              {staffPayrolls.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No payroll records generated yet for {staff.name}.
                </div>
              ) : (
                staffPayrolls.map((pay) => (
                  <div
                    key={pay.id}
                    className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs">
                          Month: {pay.month}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            pay.paymentStatus === 'Paid'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {pay.paymentStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {pay.payslipNumber} • Method: {pay.paymentMethod}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Net Payout</span>
                        <span className="text-sm font-bold text-emerald-400">
                          {formatINR(pay.netSalary)}
                        </span>
                      </div>
                      <button
                        onClick={() => onViewPayslip(pay)}
                        className="px-2.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Payslip
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'leaves' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button
                  onClick={() => onApplyLeave(staff.id)}
                  className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Record Leave
                </button>
              </div>

              {staffLeaves.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No leaves registered for {staff.name}.
                </div>
              ) : (
                staffLeaves.map((lv) => (
                  <div
                    key={lv.id}
                    className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">
                        {lv.leaveType} ({lv.totalDays} {lv.totalDays === 1 ? 'day' : 'days'})
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          lv.status === 'Approved'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : lv.status === 'Pending'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {lv.status}
                      </span>
                    </div>

                    <p className="text-slate-400">
                      Duration: {lv.startDate} to {lv.endDate}
                    </p>
                    <p className="text-slate-300 italic">"{lv.reason}"</p>

                    {lv.remarks && (
                      <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-1.5">
                        Admin Remark: {lv.remarks}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
          <button
            onClick={() => onApplyLeave(staff.id)}
            className="px-3.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            Apply Leave
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(staff)}
              className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
