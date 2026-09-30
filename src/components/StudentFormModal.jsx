import React, { useState, useEffect } from 'react';
import {
  User,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  GraduationCap,
  Save,
  Trash2,
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  Bus,
  Building,
  CreditCard,
  HeartHandshake
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import CloudPhotoStorageModal from './CloudPhotoStorageModal';

export default function StudentFormModal({
  isOpen,
  onClose,
  studentToEdit = null, // null = Add mode, object = Edit mode
  onSuccess
}) {
  const {
    classes,
    transportRoutes,
    hostelRooms,
    addStudent,
    updateStudent,
    deleteStudent,
    systemConfig
  } = useSchool();

  const isEditMode = Boolean(studentToEdit);

  // Form State
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'academic' | 'guardian' | 'facilities'
  const [isCloudPhotoOpen, setIsCloudPhotoOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const initialFormData = {
    firstName: '',
    lastName: '',
    gender: 'Male',
    dob: '2010-01-01',
    bloodGroup: 'O+',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    
    // Academic
    classId: classes[0]?.id || '',
    stream: 'none',
    rollNo: '',
    admissionNo: '',
    academicSession: systemConfig?.academicSession || '2026 - 2027',
    admissionDate: new Date().toISOString().split('T')[0],

    // Guardian
    guardianName: '',
    guardianRelation: 'Father',
    guardianPhone: '',
    guardianEmail: '',
    guardianOccupation: '',
    address: 'Aizawl, Mizoram',

    // Facilities & Fees
    transportRouteId: '',
    hostelRoomId: '',
    totalFees: 32000,
    paidFees: 0,
    feeStatus: 'pending'
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        firstName: studentToEdit.firstName || '',
        lastName: studentToEdit.lastName || '',
        gender: studentToEdit.gender || 'Male',
        dob: studentToEdit.dob || '2010-01-01',
        bloodGroup: studentToEdit.bloodGroup || 'O+',
        photoUrl: studentToEdit.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        
        classId: studentToEdit.classId || classes[0]?.id || '',
        stream: studentToEdit.stream || 'none',
        rollNo: studentToEdit.rollNo || '',
        admissionNo: studentToEdit.admissionNo || '',
        academicSession: studentToEdit.academicSession || systemConfig?.academicSession || '2026 - 2027',
        admissionDate: studentToEdit.admissionDate || new Date().toISOString().split('T')[0],

        guardianName: studentToEdit.guardianName || '',
        guardianRelation: studentToEdit.guardianRelation || 'Father',
        guardianPhone: studentToEdit.guardianPhone || '',
        guardianEmail: studentToEdit.guardianEmail || '',
        guardianOccupation: studentToEdit.guardianOccupation || '',
        address: studentToEdit.address || '',

        transportRouteId: studentToEdit.transportRouteId || '',
        hostelRoomId: studentToEdit.hostelRoomId || '',
        totalFees: studentToEdit.totalFees || 32000,
        paidFees: studentToEdit.paidFees || 0,
        feeStatus: studentToEdit.feeStatus || 'pending'
      });
    } else {
      // Pre-generate next admission number
      const nextAdmNo = `MZ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setFormData({
        ...initialFormData,
        admissionNo: nextAdmNo,
        classId: classes[0]?.id || ''
      });
    }
    setActiveTab('student');
    setIsDeleting(false);
  }, [studentToEdit, isOpen, classes]);

  if (!isOpen) return null;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.firstName.trim()) {
      showToast('Khawngaihin student hming (First Name) ziak rawh.');
      setActiveTab('student');
      return;
    }

    if (!formData.classId) {
      showToast('Khawngaihin Class thlang rawh.');
      setActiveTab('academic');
      return;
    }

    if (!formData.guardianName.trim() || !formData.guardianPhone.trim()) {
      showToast('Nu leh Pa (Guardian) hming leh phone number ziah a ngai e.');
      setActiveTab('guardian');
      return;
    }

    const payload = {
      ...formData,
      rollNo: formData.rollNo ? String(formData.rollNo).padStart(2, '0') : '01',
      stream: formData.stream === 'none' ? null : formData.stream,
      transportRouteId: formData.transportRouteId || null,
      hostelRoomId: formData.hostelRoomId || null,
      totalFees: Number(formData.totalFees) || 0,
      paidFees: Number(formData.paidFees) || 0
    };

    if (isEditMode) {
      updateStudent(studentToEdit.id, payload);
      showToast('Student & Guardian record hlawhtling taka update a ni e!');
      if (onSuccess) onSuccess({ ...studentToEdit, ...payload });
      setTimeout(() => onClose(), 800);
    } else {
      const res = addStudent(payload);
      showToast('Student thar hlawhtling taka enroll a ni e!');
      if (onSuccess) onSuccess(res.student);
      setTimeout(() => onClose(), 800);
    }
  };

  const handleDelete = () => {
    if (!studentToEdit) return;
    deleteStudent(studentToEdit.id);
    showToast('Student hi record atanga paih a ni e.');
    if (onSuccess) onSuccess(null);
    setTimeout(() => onClose(), 800);
  };

  const selectedClass = classes.find(c => c.id === formData.classId);
  const isHighSecondary = selectedClass?.name?.includes('11') || selectedClass?.name?.includes('12');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0c1220] border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                {isEditMode ? 'Edit Student & Guardian Details' : 'Enroll New Student (Direct Admission)'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEditMode 
                  ? `Update personal, academic & parent details for ${studentToEdit.firstName} ${studentToEdit.lastName}`
                  : 'Office walk-in registration with class allotment and parent record creation.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 px-4 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: 'student', label: '1. Personal Profile', icon: User },
            { id: 'academic', label: '2. Academic & Class', icon: GraduationCap },
            { id: 'guardian', label: '3. Parent / Guardian', icon: Users },
            { id: 'facilities', label: '4. Transport & Fees', icon: CreditCard }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* TAB 1: PERSONAL PROFILE */}
          {activeTab === 'student' && (
            <div className="space-y-4 text-xs">
              
              {/* Photo & Cloud Upload */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-4">
                <img
                  src={formData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                  alt=""
                  className="w-16 h-20 rounded-xl object-cover ring-2 ring-cyan-500/40 shrink-0 bg-slate-900"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-200">Student Profile Photo</span>
                    <button
                      type="button"
                      onClick={() => setIsCloudPhotoOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Take Photo / Cloud Upload</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    placeholder="https://... or upload to Cloudinary/Firebase"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-[11px] focus:outline-none focus:border-cyan-400"
                  />
                  <p className="text-[10px] text-slate-500">
                    ID Card leh Admit Card ah he thlalak hi automatically a lang ang.
                  </p>
                </div>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">First Name (Zirlai Hming): *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="e.g. Lalmuanpuia"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Last Name / Hnam Hming:</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="e.g. Ralte"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Gender, DOB, Blood Group */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Gender (Mipa / Hmeichhia):</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Male">Male (Mipa)</option>
                    <option value="Female">Female (Hmeichhia)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Date of Birth (Pian Ni):</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Blood Group:</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Residential Address */}
              <div>
                <label className="text-slate-400 block mb-1">Residential Address (Chenna Hmun):</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Khatla South, Aizawl, Mizoram - 796001"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMIC & CLASS */}
          {activeTab === 'academic' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Class Allotment: *</label>
                  <select
                    required
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-semibold"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Higher Secondary Stream */}
                <div>
                  <label className="text-slate-400 block mb-1">Stream (Class 11/12 Tan):</label>
                  <select
                    value={formData.stream}
                    onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="none">General (Nursery - Class 10)</option>
                    <option value="arts">Arts</option>
                    <option value="science">Science</option>
                    <option value="commerce">Commerce</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Roll Number: *</label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    placeholder="e.g. 15"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Admission Number: *</label>
                  <input
                    type="text"
                    required
                    value={formData.admissionNo}
                    onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                    placeholder="e.g. MZ-2026-1045"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Academic Session:</label>
                  <input
                    type="text"
                    value={formData.academicSession}
                    onChange={(e) => setFormData({ ...formData, academicSession: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Admission Date:</label>
                <input
                  type="date"
                  value={formData.admissionDate}
                  onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                  className="w-full sm:w-1/2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          {/* TAB 3: PARENT / GUARDIAN */}
          {activeTab === 'guardian' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start gap-2">
                <HeartHandshake className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>
                  Nu leh Pa / Guardian phone number hi **Parent Portal login ID** leh **SMS / WhatsApp notifications** dawnna tur a ni a, a dik ziah a pawimawh e.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Guardian / Parent Full Name: *</label>
                  <input
                    type="text"
                    required
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    placeholder="e.g. Lalthanzuala Ralte"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Relationship to Student:</label>
                  <select
                    value={formData.guardianRelation}
                    onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Father">Father (Pa)</option>
                    <option value="Mother">Mother (Nu)</option>
                    <option value="Local Guardian">Local Guardian</option>
                    <option value="Uncle/Aunt">Uncle / Aunt</option>
                    <option value="Grandparent">Grandparent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Guardian Phone (SMS / WhatsApp): *</label>
                  <input
                    type="tel"
                    required
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                    placeholder="+91 98623 45678"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Guardian Email Address:</label>
                  <input
                    type="email"
                    value={formData.guardianEmail}
                    onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                    placeholder="parent@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Guardian Occupation (Hna Thawh):</label>
                <input
                  type="text"
                  value={formData.guardianOccupation}
                  onChange={(e) => setFormData({ ...formData, guardianOccupation: e.target.value })}
                  placeholder="e.g. Govt. Teacher / Businessman / Farmer"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          {/* TAB 4: FACILITIES & FEES */}
          {activeTab === 'facilities' && (
            <div className="space-y-4 text-xs">
              
              {/* Transport & Hostel Allocation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                    <Bus className="w-4 h-4" />
                    <span>School Bus / Transport Route</span>
                  </div>
                  <select
                    value={formData.transportRouteId}
                    onChange={(e) => setFormData({ ...formData, transportRouteId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-400 text-xs"
                  >
                    <option value="">No Transport (Self / Day scholar)</option>
                    {transportRoutes.map(tr => (
                      <option key={tr.id} value={tr.id}>
                        {tr.routeName} ({tr.vehicleNumber}) - ₹{tr.monthlyFee}/mo
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-semibold">
                    <Building className="w-4 h-4" />
                    <span>Hostel Room Allotment</span>
                  </div>
                  <select
                    value={formData.hostelRoomId}
                    onChange={(e) => setFormData({ ...formData, hostelRoomId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-400 text-xs"
                  >
                    <option value="">Day Scholar (No Hostel)</option>
                    {hostelRooms.map(hr => (
                      <option key={hr.id} value={hr.id}>
                        {hr.blockName} - Room {hr.roomNumber} ({hr.roomType})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fees Setup */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white block">Fee Structure &amp; Status</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Total Annual Fees (₹):</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.totalFees}
                      onChange={(e) => setFormData({ ...formData, totalFees: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Initial Paid Fees (₹):</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.paidFees}
                      onChange={(e) => setFormData({ ...formData, paidFees: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Fee Status:</label>
                    <select
                      value={formData.feeStatus}
                      onChange={(e) => setFormData({ ...formData, feeStatus: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-semibold"
                    >
                      <option value="cleared">Cleared (Pek kim)</option>
                      <option value="partial">Partial (Pek zat nei)</option>
                      <option value="pending">Pending (La pe lo)</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0 flex-wrap">
            {isEditMode ? (
              <div>
                {!isDeleting ? (
                  <button
                    type="button"
                    onClick={() => setIsDeleting(true)}
                    className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Student</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-rose-300 font-bold">Paih tak tak dawn em?</span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold"
                    >
                      Aw, Paih rawh
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDeleting(false)}
                      className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px]"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ) : <div />}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isEditMode ? 'Save Changes' : 'Enroll Student'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Embedded Cloud Photo Storage Modal for Student */}
        {isCloudPhotoOpen && (
          <CloudPhotoStorageModal
            isOpen={isCloudPhotoOpen}
            onClose={() => setIsCloudPhotoOpen(false)}
            initialTargetType="student"
            initialTargetId={studentToEdit?.id || null}
            onSuccess={(newUrl) => {
              setFormData(prev => ({ ...prev, photoUrl: newUrl }));
              setIsCloudPhotoOpen(false);
            }}
          />
        )}

      </div>
    </div>
  );
}
