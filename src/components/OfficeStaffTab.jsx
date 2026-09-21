import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Users,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Edit3,
  DollarSign,
  UserPlus,
  FileCheck,
  Package,
  Building2,
  HeartPulse,
  UtensilsCrossed,
  BookOpen,
  Bell,
  Bus,
  Lock,
  Unlock,
  Award,
  Clock,
  Phone,
  Briefcase,
  Check,
  X,
  ChevronRight,
  Info
} from 'lucide-react';

export const AVAILABLE_SYSTEM_MODULES = [
  {
    id: 'financials',
    label: 'Financials & Fees',
    desc: 'Cash/UPI Fee Collection, Receipts, Accounts Ledger, Concessions',
    icon: DollarSign,
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300',
    iconColor: 'text-emerald-400'
  },
  {
    id: 'admissions',
    label: 'Online Admissions',
    desc: 'Student Application Review, Scrutiny, Document Verification',
    icon: UserPlus,
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300',
    iconColor: 'text-amber-400'
  },
  {
    id: 'certificates',
    label: 'Certificates & TC',
    desc: 'MBSE Transfer Certificates (TC), Character & Bonafide Issuance',
    icon: FileCheck,
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300',
    iconColor: 'text-cyan-400'
  },
  {
    id: 'inventory',
    label: 'Campus & Lab Assets',
    desc: 'Science Lab Equipment, Stock Auditing, Maintenance Tickets',
    icon: Package,
    color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-300',
    iconColor: 'text-purple-400'
  },
  {
    id: 'hostel',
    label: 'Residential Hostel Suite',
    desc: 'Hostel Rooms, Gate Passes, Evening Roll Call, Mess Menu',
    icon: Building2,
    color: 'from-pink-500/20 to-rose-500/20 border-pink-500/40 text-pink-300',
    iconColor: 'text-pink-400'
  },
  {
    id: 'clinic',
    label: 'Clinic & Infirmary',
    desc: 'Student Health Log, Vitals, Bed Allocation, Emergency SOS',
    icon: HeartPulse,
    color: 'from-rose-500/20 to-red-500/20 border-rose-500/40 text-rose-300',
    iconColor: 'text-rose-400'
  },
  {
    id: 'visitors',
    label: 'Gate Pass & Visitors',
    desc: 'Campus Visitor Logs, Security Gate Pass, Check-in / Out',
    icon: ShieldCheck,
    color: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/40 text-indigo-300',
    iconColor: 'text-indigo-400'
  },
  {
    id: 'canteen',
    label: 'Canteen & Smart Meal',
    desc: 'Canteen Digital Wallets, Top-ups, Student Smart Meal Swipes',
    icon: UtensilsCrossed,
    color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/40 text-yellow-300',
    iconColor: 'text-yellow-400'
  },
  {
    id: 'library',
    label: 'Library Management',
    desc: 'Book Lending, Catalog, Returns, Overdue Fine Collection',
    icon: BookOpen,
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/40 text-blue-300',
    iconColor: 'text-blue-400'
  },
  {
    id: 'notices',
    label: 'Notice Board Publisher',
    desc: 'School-wide Announcements, Telegram/SMS, Important Circulars',
    icon: Bell,
    color: 'from-yellow-500/20 to-lime-500/20 border-yellow-500/40 text-yellow-300',
    iconColor: 'text-yellow-400'
  },
  {
    id: 'students',
    label: 'Students Directory',
    desc: 'Student Profile Editing, Contact Directory, Academic Standings',
    icon: Users,
    color: 'from-teal-500/20 to-emerald-500/20 border-teal-500/40 text-teal-300',
    iconColor: 'text-teal-400'
  },
  {
    id: 'transport',
    label: 'Transport & Bus Fleet',
    desc: 'Bus Routes, Driver Allocations, Pickup Points & Bus Stops',
    icon: Bus,
    color: 'from-sky-500/20 to-blue-500/20 border-sky-500/40 text-sky-300',
    iconColor: 'text-sky-400'
  }
];

export const STANDARD_OFFICE_DUTIES = [
  'Fee Collection & Cashier Receipts Invoicing',
  'UPI & Cash Ledger Reconciliation',
  'Online Admissions Scrutiny & Document Verification',
  'MBSE Transfer Certificate (TC) & Character Certificate Verification',
  'Campus Inventory & Science Laboratory Stock Auditing',
  'Hostel Roll Call & Student Gate Pass Verification',
  'Campus Visitor Verification & Security Gate Log',
  'Clinic & Infirmary Health Log Maintenance',
  'School Broadcast & SMS Dispatch Assistance',
  'Academic Library Book Circulation & Fine Management',
  'Bus Transport Route Monitoring & Attendance'
];

export const DESIGNATION_PRESETS = [
  'Chief Accounts & Fee Officer',
  'Admissions & Certification Officer',
  'Examination & TC Controller',
  'Campus Inventory & Store Custodian',
  'Student Welfare & Hostel Coordinator',
  'Reception & Gate Log Officer',
  'Library & Digital Resource Head',
  'General Office & Administrative Executive'
];

export default function OfficeStaffTab({
  staff = [],
  assignOfficeStaffDuties,
  canManage = true,
  assignerDesignation = 'Principal / Vice Principal'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    staffId: '',
    officeDesignation: 'Assistant Administrative Officer',
    officeDuties: [],
    assignedModuleAccess: [],
    officeNotes: ''
  });

  const [customDutyInput, setCustomDutyInput] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Filter Office Staff
  const officeStaffList = useMemo(() => {
    return staff.filter(s => {
      if (!s.isOfficeStaff) return false;
      const q = searchQuery.toLowerCase();
      const matchSearch = 
        s.name?.toLowerCase().includes(q) ||
        s.officeDesignation?.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q) ||
        s.assignedModuleAccess?.some(m => m.toLowerCase().includes(q));

      const matchModule = selectedModuleFilter === 'all' || s.assignedModuleAccess?.includes(selectedModuleFilter);
      return matchSearch && matchModule;
    });
  }, [staff, searchQuery, selectedModuleFilter]);

  // Teachers available to be appointed as Office Staff
  const availableTeachers = useMemo(() => {
    return staff.filter(s => s.status === 'active');
  }, [staff]);

  // Open Modal for New Appointment
  const handleOpenNewModal = () => {
    const defaultTeacher = availableTeachers.find(s => !s.isOfficeStaff) || availableTeachers[0];
    setEditingStaffId(null);
    setFormData({
      staffId: defaultTeacher?.id || '',
      officeDesignation: 'Chief Accounts & Fee Officer',
      officeDuties: ['Fee Collection & Cashier Receipts Invoicing', 'UPI & Cash Ledger Reconciliation'],
      assignedModuleAccess: ['financials', 'admissions'],
      officeNotes: ''
    });
    setIsModalOpen(true);
  };

  // Open Modal for Editing existing
  const handleOpenEditModal = (stf) => {
    setEditingStaffId(stf.id);
    setFormData({
      staffId: stf.id,
      officeDesignation: stf.officeDesignation || 'Designated Office Staff',
      officeDuties: stf.officeDuties || [],
      assignedModuleAccess: stf.assignedModuleAccess || [],
      officeNotes: stf.officeNotes || ''
    });
    setIsModalOpen(true);
  };

  // Toggle Module
  const toggleModule = (moduleId) => {
    setFormData(prev => {
      const current = prev.assignedModuleAccess || [];
      const updated = current.includes(moduleId)
        ? current.filter(m => m !== moduleId)
        : [...current, moduleId];
      return { ...prev, assignedModuleAccess: updated };
    });
  };

  // Toggle Duty
  const toggleDuty = (duty) => {
    setFormData(prev => {
      const current = prev.officeDuties || [];
      const updated = current.includes(duty)
        ? current.filter(d => d !== duty)
        : [...current, duty];
      return { ...prev, officeDuties: updated };
    });
  };

  // Add Custom Duty
  const handleAddCustomDuty = () => {
    if (!customDutyInput.trim()) return;
    if (!formData.officeDuties.includes(customDutyInput.trim())) {
      setFormData(prev => ({
        ...prev,
        officeDuties: [...prev.officeDuties, customDutyInput.trim()]
      }));
    }
    setCustomDutyInput('');
  };

  // Handle Save
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.staffId) {
      showToast('Zirtirtu (Teacher) thlang rawh le', 'error');
      return;
    }
    if (!formData.officeDesignation.trim()) {
      showToast('Office Designation chhu lut rawh le', 'error');
      return;
    }
    if (formData.assignedModuleAccess.length === 0) {
      showToast('Module access theih tur pakhat tal thlan a ngai e', 'error');
      return;
    }

    const res = assignOfficeStaffDuties(
      formData.staffId,
      {
        isOfficeStaff: true,
        officeDesignation: formData.officeDesignation,
        officeDuties: formData.officeDuties,
        assignedModuleAccess: formData.assignedModuleAccess,
        officeNotes: formData.officeNotes
      },
      assignerDesignation
    );

    if (res?.success) {
      setIsModalOpen(false);
      showToast(`${res.staff?.name} chu Office Staff-ah ruat fel a ni a, module permissions pek a ni ta!`, 'success');
    }
  };

  // Relieve teacher from office duties
  const handleRelieveStaff = (stf) => {
    if (!window.confirm(`${stf.name} hi Office Staff aṭanga chawlhtirin academic teacher pangngaiah dah let i duh em? Module permissions a bo nghal ang.`)) {
      return;
    }

    const res = assignOfficeStaffDuties(
      stf.id,
      {
        isOfficeStaff: false,
        officeDesignation: '',
        officeDuties: [],
        assignedModuleAccess: [],
        officeNotes: ''
      },
      assignerDesignation
    );

    if (res?.success) {
      showToast(`${stf.name} chu Office Duty aṭangin chawlhtir a ni ta.`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border ${
          toast.type === 'error'
            ? 'bg-rose-950/90 text-rose-200 border-rose-500/50'
            : toast.type === 'info'
            ? 'bg-cyan-950/90 text-cyan-200 border-cyan-500/50'
            : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner & Stats */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Office Staff &amp; Module Access Governance
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                Principal &amp; Vice Principal Authority
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
              Teacher te Office Staff-a Ruatna &amp; Module Access Control
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Admin (Principal) leh Vice Principal ten zirtirtu (teacher) te aṭangin an duh zat Office Staff atan an ruat theiin, 
              an mawhphurhna (duties) leh an khawih theih tur system module (Fee, Admission, TC, Inventory, etc.) an thlang sak thei a ni.
            </p>
          </div>

          {canManage && (
            <button
              onClick={handleOpenNewModal}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 transition shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Teacher Thlan &amp; Office Staff-a Ruat</span>
            </button>
          )}
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Office Staff Ruat Zat</div>
            <div className="text-2xl font-black text-purple-300 font-['Outfit']">
              {staff.filter(s => s.isOfficeStaff).length}
            </div>
            <div className="text-[10px] text-slate-500">Teachers holding office duties</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">System Modules Available</div>
            <div className="text-2xl font-black text-cyan-300 font-['Outfit']">
              {AVAILABLE_SYSTEM_MODULES.length}
            </div>
            <div className="text-[10px] text-slate-500">Selectable permission modules</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Faculty Members Total</div>
            <div className="text-2xl font-black text-white font-['Outfit']">
              {staff.length}
            </div>
            <div className="text-[10px] text-slate-500">Active school employees</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[11px] text-emerald-400 font-medium">Ruattu Thuneitute</div>
            <div className="text-xs font-bold text-slate-200 mt-1 truncate">
              Principal &amp; Vice Principal
            </div>
            <div className="text-[10px] text-emerald-500/80">Strict Executive Authority</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Hming, office title, emaw module zawnna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Module Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setSelectedModuleFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedModuleFilter === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Modules
          </button>
          {AVAILABLE_SYSTEM_MODULES.slice(0, 6).map(mod => (
            <button
              key={mod.id}
              onClick={() => setSelectedModuleFilter(mod.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                selectedModuleFilter === mod.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <mod.icon className="w-3 h-3" />
              <span>{mod.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Office Staff Cards List */}
      {officeStaffList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-white font-['Outfit']">
            Office Staff ruat an la awm lo / Hmuh a ni lo
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Teacher te aṭangin administrative office duty keng tur an la awm lo emaw i zawnna nen a inmil lo.
          </p>
          {canManage && (
            <button
              onClick={handleOpenNewModal}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 cursor-pointer"
            >
              + Ruatna Thar Siam Rawh
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {officeStaffList.map(stf => {
            return (
              <div
                key={stf.id}
                className="p-6 rounded-3xl bg-slate-900/90 border border-purple-500/30 hover:border-purple-500/60 shadow-xl transition space-y-5 flex flex-col justify-between"
              >
                {/* Profile & Designation Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {stf.photoUrl ? (
                      <img
                        src={stf.photoUrl}
                        alt=""
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500/40 shadow-md"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-300 font-bold text-lg flex items-center justify-center border border-purple-500/30">
                        {stf.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                          {stf.employeeId || 'STAFF'}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{stf.department}</span>
                      </div>
                      <h4 className="text-base font-extrabold text-white font-['Outfit'] mt-0.5">
                        {stf.name}
                      </h4>
                      <p className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 mt-0.5">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{stf.officeDesignation || 'Designated Office Staff'}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Active Duty
                  </span>
                </div>

                {/* Assigned System Modules Strip */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                    <span>Assigned System Modules ({stf.assignedModuleAccess?.length || 0})</span>
                    <span className="text-[10px] text-slate-500">Full Operational Rights</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(stf.assignedModuleAccess || []).map(modId => {
                      const modInfo = AVAILABLE_SYSTEM_MODULES.find(m => m.id === modId);
                      const Icon = modInfo?.icon || ShieldCheck;
                      return (
                        <span
                          key={modId}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-700/60 text-slate-200 flex items-center gap-1.5 shadow-sm"
                        >
                          <Icon className={`w-3.5 h-3.5 ${modInfo?.iconColor || 'text-cyan-400'}`} />
                          <span>{modInfo?.label || modId}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Assigned Duties List */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>Official Responsibilities (Mawhphurhnate):</span>
                  </div>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {(stf.officeDuties || []).map((duty, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>{duty}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Appointed By Stamp */}
                  <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Ruattu: <strong className="text-purple-300">{stf.appointedBy || 'Administration'}</strong></span>
                    <span>{stf.appointedAt || 'Active Session'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {canManage && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleRelieveStaff(stf)}
                      className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center gap-1 transition cursor-pointer"
                      title="Chawlhtir Rawh"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Chawlhtir (Relieve)</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(stf)}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Siamṭha / Thlak (Edit Access)</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: APPOINT OR EDIT OFFICE STAFF & MODULE PERMISSIONS */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#0e1628] border border-purple-500/40 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    {editingStaffId ? 'Office Staff Duties & Access Siamṭhatna' : 'Teacher Thlan & Office Staff-a Ruatna'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Principal &amp; Vice Principal Thuneihna • System Module Permissions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Select Teacher */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  1. Zirtirtu (Teacher) Thlang Rawh *
                </label>
                {editingStaffId ? (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white flex items-center gap-2">
                    <span className="text-indigo-400 font-mono">Selected:</span>
                    <span>{staff.find(s => s.id === editingStaffId)?.name}</span>
                    <span className="text-slate-400 text-[11px] font-normal">({staff.find(s => s.id === editingStaffId)?.department})</span>
                  </div>
                ) : (
                  <select
                    value={formData.staffId}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">-- Zirtirtu Thlang Rawh --</option>
                    {availableTeachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.designation} • {t.department}) {t.isOfficeStaff ? '• [Office Staff a ni mek]' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Office Designation */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  2. Office Designation (Mawhphurhna Hming) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chief Accounts & Fee Officer, Admissions In-Charge..."
                  value={formData.officeDesignation}
                  onChange={(e) => setFormData({ ...formData, officeDesignation: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-purple-500 focus:outline-none"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-semibold mr-1">Presets:</span>
                  {DESIGNATION_PRESETS.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData({ ...formData, officeDesignation: preset })}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-purple-900/40 text-slate-300 hover:text-purple-200 border border-slate-700 cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Module Access Multi-Select Checkboxes */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    3. System Module Access Theih Tur Thlan Sak Rawh *
                  </label>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, assignedModuleAccess: AVAILABLE_SYSTEM_MODULES.map(m => m.id) })}
                      className="text-cyan-400 hover:underline cursor-pointer"
                    >
                      Select All Modules
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, assignedModuleAccess: [] })}
                      className="text-slate-400 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {AVAILABLE_SYSTEM_MODULES.map(mod => {
                    const Icon = mod.icon;
                    const isChecked = formData.assignedModuleAccess.includes(mod.id);
                    return (
                      <button
                        type="button"
                        key={mod.id}
                        onClick={() => toggleModule(mod.id)}
                        className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                          isChecked
                            ? 'bg-gradient-to-r from-purple-950/50 to-indigo-950/50 border-purple-500 ring-1 ring-purple-500/50'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                          isChecked ? 'bg-purple-500 border-purple-400 text-white' : 'border-slate-700 bg-slate-800'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Icon className={`w-3.5 h-3.5 ${mod.iconColor}`} />
                            <span className="truncate">{mod.label}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{mod.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Official Duties Multi-Select */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  4. Mawhphurhna / Official Duties Thlang Rawh
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  {STANDARD_OFFICE_DUTIES.map(duty => {
                    const isChecked = formData.officeDuties.includes(duty);
                    return (
                      <label
                        key={duty}
                        onClick={() => toggleDuty(duty)}
                        className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 cursor-pointer transition ${
                          isChecked
                            ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200 font-semibold'
                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                          isChecked ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-slate-700 bg-slate-800'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-[11px] leading-tight">{duty}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Custom Duty Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Mawhphurhna dang ziah luh belhna (Custom duty)..."
                    value={customDutyInput}
                    onChange={(e) => setCustomDutyInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomDuty}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    + Dah Belh
                  </button>
                </div>
              </div>

              {/* Special Instructions / Notes */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  5. Hriattirna / Instructions (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. He mawhphurhna hi Academic Session 2026 chhung atan a ni a, accounts counter leh admission cell-ah a tul ang angin duty chhunzawm tur a ni."
                  value={formData.officeNotes}
                  onChange={(e) => setFormData({ ...formData, officeNotes: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-purple-500 focus:outline-none"
                ></textarea>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 cursor-pointer"
                >
                  {editingStaffId ? 'Siamṭhatna Vawng Ṭha Rawh' : 'Ruatna Fel Fai Rawh (Appoint Staff)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
