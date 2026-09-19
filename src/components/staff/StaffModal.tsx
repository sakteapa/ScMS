import React, { useState, useEffect } from 'react';
import { StaffMember, StaffDepartment, StaffEmploymentType, StaffStatus } from '../../types';
import { X, User, DollarSign, Building2, CreditCard, ShieldAlert } from 'lucide-react';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => Promise<void>;
  initialStaff?: StaffMember | null;
}

const DEPARTMENTS: StaffDepartment[] = [
  'Administration',
  'Teaching',
  'Mathematics',
  'Science & Labs',
  'Humanities',
  'Languages',
  'Physical Education',
  'Library',
  'Support Staff',
];

const EMPLOYMENT_TYPES: StaffEmploymentType[] = [
  'Full-time',
  'Contract',
  'Part-time',
  'Guest Lecturer',
];

const STATUS_LIST: StaffStatus[] = ['Active', 'On Leave', 'Resigned', 'Retired'];

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialStaff,
}) => {
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [qualification, setQualification] = useState('');
  const [department, setDepartment] = useState<StaffDepartment>('Teaching');
  const [designation, setDesignation] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [employmentType, setEmploymentType] = useState<StaffEmploymentType>('Full-time');
  const [baseSalary, setBaseSalary] = useState<number>(35000);
  const [hra, setHra] = useState<number>(4500);
  const [da, setDa] = useState<number>(5250);
  const [medical, setMedical] = useState<number>(1500);
  const [special, setSpecial] = useState<number>(1500);
  const [conveyance, setConveyance] = useState<number>(1500);
  const [status, setStatus] = useState<StaffStatus>('Active');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('State Bank of India (Aizawl)');
  const [ifscCode, setIfscCode] = useState('SBIN0001539');
  const [upiId, setUpiId] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [epfNumber, setEpfNumber] = useState('');
  const [assignedClassName, setAssignedClassName] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<'personal' | 'employment' | 'bank' | 'emergency'>('personal');

  useEffect(() => {
    if (initialStaff) {
      setName(initialStaff.name);
      setEmployeeId(initialStaff.employeeId);
      setGender(initialStaff.gender);
      setPhone(initialStaff.phone);
      setEmail(initialStaff.email);
      setAddress(initialStaff.address);
      setDob(initialStaff.dob || '');
      setQualification(initialStaff.qualification);
      setDepartment(initialStaff.department);
      setDesignation(initialStaff.designation);
      setJoiningDate(initialStaff.joiningDate);
      setEmploymentType(initialStaff.employmentType);
      setBaseSalary(initialStaff.baseSalary);
      setHra(initialStaff.allowances?.hra || 0);
      setDa(initialStaff.allowances?.da || 0);
      setMedical(initialStaff.allowances?.medical || 0);
      setSpecial(initialStaff.allowances?.special || 0);
      setConveyance(initialStaff.allowances?.conveyance || 0);
      setStatus(initialStaff.status);
      setAccountName(initialStaff.bankDetails?.accountName || '');
      setAccountNumber(initialStaff.bankDetails?.accountNumber || '');
      setBankName(initialStaff.bankDetails?.bankName || 'State Bank of India (Aizawl)');
      setIfscCode(initialStaff.bankDetails?.ifscCode || 'SBIN0001539');
      setUpiId(initialStaff.bankDetails?.upiId || '');
      setPanNumber(initialStaff.bankDetails?.panNumber || '');
      setEpfNumber(initialStaff.epfNumber || '');
      setAssignedClassName(initialStaff.assignedClassName || '');
      setEmergencyName(initialStaff.emergencyContact?.name || '');
      setEmergencyRelation(initialStaff.emergencyContact?.relation || '');
      setEmergencyPhone(initialStaff.emergencyContact?.phone || '');
      setNotes(initialStaff.notes || '');
    } else {
      // Defaults for a new staff member
      setName('');
      setEmployeeId(`ZOXS-STF-${Math.floor(10 + Math.random() * 90)}`);
      setGender('Male');
      setPhone('+91 ');
      setEmail('');
      setAddress('Aizawl, Mizoram');
      setDob('1990-01-01');
      setQualification('M.A. / M.Sc, B.Ed');
      setDepartment('Teaching');
      setDesignation('TGT Assistant Teacher');
      setJoiningDate(new Date().toISOString().split('T')[0]);
      setEmploymentType('Full-time');
      setBaseSalary(35000);
      setHra(4500);
      setDa(5250);
      setMedical(1500);
      setSpecial(1500);
      setConveyance(1500);
      setStatus('Active');
      setAccountName('');
      setAccountNumber('');
      setBankName('State Bank of India (Aizawl)');
      setIfscCode('SBIN0001539');
      setUpiId('');
      setPanNumber('');
      setEpfNumber('');
      setAssignedClassName('');
      setEmergencyName('');
      setEmergencyRelation('Spouse');
      setEmergencyPhone('+91 ');
      setNotes('');
    }
  }, [initialStaff, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !employeeId.trim()) return;

    setSubmitting(true);
    try {
      await onSave(
        {
          name: name.trim(),
          employeeId: employeeId.trim(),
          gender,
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          dob: dob || undefined,
          qualification: qualification.trim(),
          department,
          designation: designation.trim(),
          joiningDate,
          employmentType,
          baseSalary: Number(baseSalary) || 0,
          allowances: {
            hra: Number(hra) || 0,
            da: Number(da) || 0,
            medical: Number(medical) || 0,
            special: Number(special) || 0,
            conveyance: Number(conveyance) || 0,
          },
          status,
          bankDetails: {
            accountName: accountName.trim() || name.trim(),
            accountNumber: accountNumber.trim(),
            bankName: bankName.trim(),
            ifscCode: ifscCode.trim(),
            upiId: upiId.trim() || undefined,
            panNumber: panNumber.trim() || undefined,
          },
          epfNumber: epfNumber.trim() || undefined,
          assignedClassName: assignedClassName.trim() || undefined,
          emergencyContact: emergencyName
            ? {
                name: emergencyName.trim(),
                relation: emergencyRelation.trim(),
                phone: emergencyPhone.trim(),
              }
            : undefined,
          notes: notes.trim() || undefined,
        },
        initialStaff?.id
      );
      onClose();
    } catch (err) {
      console.error('Failed to save staff record:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const totalMonthlyGross =
    Number(baseSalary || 0) +
    Number(hra || 0) +
    Number(da || 0) +
    Number(medical || 0) +
    Number(special || 0) +
    Number(conveyance || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-y-auto backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden my-8 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {initialStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h2>
              <p className="text-xs text-slate-400">
                Mizoram School System Faculty & Administrative Roster
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

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/60 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveSection('personal')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeSection === 'personal'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Personal Info
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('employment')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeSection === 'employment'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Designation & Salary
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('bank')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeSection === 'bank'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Bank & UPI Payout
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('emergency')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeSection === 'emergency'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Emergency & Notes
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* 1. Personal Information */}
          {activeSection === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sir Lalbiakzuala Ralte"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Employee Code / ID <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. ZOXS-TCH-08"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98621 00000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name.zoxs@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Academic Qualifications
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. M.Sc Physics, B.Ed (MZU)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Residential Address (Mizoram)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Chanmari West, Near Presbyterian Church, Aizawl"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* 2. Employment & Salary Package */}
          {activeSection === 'employment' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as StaffDepartment)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Designation / Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. PGT Senior Mathematics Teacher"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Date of Joining
                  </label>
                  <input
                    type="date"
                    required
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Employment Type
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value as StaffEmploymentType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {EMPLOYMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Current Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StaffStatus)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {STATUS_LIST.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Assigned Class (Class Teacher Role, if applicable)
                </label>
                <input
                  type="text"
                  value={assignedClassName}
                  onChange={(e) => setAssignedClassName(e.target.value)}
                  placeholder="e.g. Class 10 - Section A"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Salary & Allowances Breakdown */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    Monthly Salary & Standard Allowances (INR)
                  </h3>
                  <div className="text-xs text-slate-400">
                    Gross: <span className="text-emerald-400 font-bold">₹{totalMonthlyGross.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Base Salary (Basic) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={baseSalary}
                      onChange={(e) => setBaseSalary(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">HRA (House Rent)</label>
                    <input
                      type="number"
                      min="0"
                      value={hra}
                      onChange={(e) => setHra(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">DA (Dearness)</label>
                    <input
                      type="number"
                      min="0"
                      value={da}
                      onChange={(e) => setDa(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Medical Allowance</label>
                    <input
                      type="number"
                      min="0"
                      value={medical}
                      onChange={(e) => setMedical(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Special / Dept Allowance</label>
                    <input
                      type="number"
                      min="0"
                      value={special}
                      onChange={(e) => setSpecial(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Conveyance Allowance</label>
                    <input
                      type="number"
                      min="0"
                      value={conveyance}
                      onChange={(e) => setConveyance(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Bank & Payout Details */}
          {activeSection === 'bank' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Beneficiary Account Name
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder={name || 'Full name as in Bank Passbook'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 30492819283"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Bank & Branch Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. State Bank of India (Aizawl Branch)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SBIN0001539"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono uppercase focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    UPI ID (VPA for instant payment)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. staffname@oksbi"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">PAN Card Number</label>
                  <input
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. ABCDE1234F"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono uppercase focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    EPF Universal Account / No.
                  </label>
                  <input
                    type="text"
                    value={epfNumber}
                    onChange={(e) => setEpfNumber(e.target.value)}
                    placeholder="e.g. MZ/AIZ/0019283/008"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. Emergency & Notes */}
          {activeSection === 'emergency' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Emergency Next-of-Kin Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="e.g. Pi Zodinpuii"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      placeholder="e.g. Spouse, Brother, Father"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+91 94361 00000"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Administrative Remarks & Role Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add administrative notes, subject specializations, or remarks..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex gap-2">
              {activeSection !== 'personal' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeSection === 'employment') setActiveSection('personal');
                    else if (activeSection === 'bank') setActiveSection('employment');
                    else if (activeSection === 'emergency') setActiveSection('bank');
                  }}
                  className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Previous
                </button>
              )}
              {activeSection !== 'emergency' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeSection === 'personal') setActiveSection('employment');
                    else if (activeSection === 'employment') setActiveSection('bank');
                    else if (activeSection === 'bank') setActiveSection('emergency');
                  }}
                  className="px-3 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 border border-indigo-800/60 rounded-lg hover:bg-indigo-900/50 transition-colors"
                >
                  Next Step
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : initialStaff ? 'Update Staff Member' : 'Register Staff'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
