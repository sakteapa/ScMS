import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Save, Camera,
  ShieldCheck, CheckCircle2, AlertTriangle, KeyRound, LogOut,
  GraduationCap, Award, Building2, UserCheck, HeartHandshake,
  Sparkles, Calendar, Droplets, BookOpen, Briefcase, Clock,
  Upload, RefreshCw, Image as ImageIcon, Video, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfileSettingsModal({ isOpen, onClose }) {
  const { 
    currentUser, 
    updateUserProfile, 
    changePassword, 
    logout,
    getAllUsers,
    updateAnyUserProfile,
    changeAnyUserPassword,
    isPrincipal,
    isSuperAdmin,
    isVicePrincipal
  } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'

  // Retrieve all manageable user profiles
  const allUsers = (getAllUsers ? getAllUsers() : []).length > 0
    ? getAllUsers()
    : [currentUser].filter(Boolean);

  const canSwitchUsers = isPrincipal || isSuperAdmin || isVicePrincipal;

  // Selected user account to edit (defaults to current active session)
  const [selectedUid, setSelectedUid] = useState(currentUser?.uid || 'user-principal-01');

  useEffect(() => {
    if (currentUser?.uid) {
      if (!canSwitchUsers || !selectedUid) {
        setSelectedUid(currentUser.uid);
      }
    }
  }, [currentUser, canSwitchUsers]);

  // Active target user being edited - strictly restricted to currentUser if not admin
  const targetUser = (canSwitchUsers ? allUsers.find(u => u.uid === selectedUid) : null) || currentUser || allUsers[0];

  /* ---------- Profile form state ---------- */
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    phone: '',
    address: '',
    designation: '',
    avatar: '',
    // Role-specific fields
    rollNo: '',
    className: '',
    classId: '',
    dob: '',
    bloodGroup: '',
    parentPhone: '',
    wardName: '',
    relation: 'Father',
    whatsappNumber: '',
    occupation: '',
    subject: '',
    qualification: '',
    hostelBuilding: '',
    officeRoom: '',
    officeHours: '',
  });

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null); // { type: 'success'|'error', text }

  /* ---------- Photo Upload & Camera Selfie state ---------- */
  const [photoMode, setPhotoMode] = useState('upload'); // 'upload' | 'camera' | 'url'
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  // Stop camera stream safely
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  // Clean up camera on unmount or stream change
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Turn on camera and connect video element
  const handleStartCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Video play caught:', e));
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Camera hawn theih a ni lo: ' + (err.message || 'Permission phalsak a ni lo'));
      setIsCameraActive(false);
    }
  };

  // If stream changes, attach to video ref
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(e => console.warn('Video play caught:', e));
    }
  }, [cameraStream, isCameraActive]);

  // Capture frame from video element
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth || 480, video.videoHeight || 480, 400);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Center-crop square snapshot
    const sx = Math.max(0, ((video.videoWidth || size) - size) / 2);
    const sy = Math.max(0, ((video.videoHeight || size) - size) / 2);
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    handleProfileChange('avatar', dataUrl);
    stopCamera();
    setProfileMsg({ type: 'success', text: 'Selfie tharlam lak fel a ni e! "Save Profile" hmetin save rawh le. ✓' });
  };

  // Local image file upload with client-side canvas resize
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setProfileMsg({ type: 'error', text: 'Image file (JPG, PNG, WebP) chauh upload theih a ni.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        handleProfileChange('avatar', dataUrl);
        setProfileMsg({ type: 'success', text: 'Photo upload fel a ni e! "Save Profile" hmetin save rawh le. ✓' });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleModalClose = () => {
    stopCamera();
    onClose();
  };

  // Populate form whenever targetUser changes or modal opens
  useEffect(() => {
    if (targetUser) {
      setForm({
        displayName: targetUser.displayName || '',
        email: targetUser.email || '',
        phone: targetUser.phone || '',
        address: targetUser.address || '',
        designation: targetUser.designation || '',
        avatar: targetUser.avatar || '',
        rollNo: targetUser.rollNo || (targetUser.role === 'student' ? '12' : ''),
        className: targetUser.className || (targetUser.role === 'student' ? 'Class 12 - Science' : ''),
        classId: targetUser.classId || (targetUser.role === 'teacher' ? 'cls-12-sci' : ''),
        dob: targetUser.dob || '2007-04-15',
        bloodGroup: targetUser.bloodGroup || 'O+',
        parentPhone: targetUser.parentPhone || targetUser.phone || '+91 98623 45671',
        wardName: targetUser.wardName || 'Lalrinsanga Sailo (Class 12)',
        relation: targetUser.relation || 'Father',
        whatsappNumber: targetUser.whatsappNumber || targetUser.phone || '',
        occupation: targetUser.occupation || 'Government Service',
        subject: targetUser.subject || (targetUser.role === 'teacher' ? 'Physics & Computer Science' : ''),
        qualification: targetUser.qualification || 'M.Sc., B.Ed.',
        hostelBuilding: targetUser.hostelBuilding || 'Lushai Boys Hostel',
        officeRoom: targetUser.officeRoom || 'Room 102, Administrative Block',
        officeHours: targetUser.officeHours || '9:00 AM - 3:30 PM',
      });
      setProfileMsg(null);
      setPwMsg(null);
    }
  }, [selectedUid, targetUser?.uid, isOpen]);

  /* ---------- Password form state ---------- */
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  if (!isOpen || !targetUser) return null;

  const isEditingSelf = currentUser?.uid === targetUser?.uid;

  const handleProfileChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setProfileMsg(null);
  };

  const handleSaveProfile = async () => {
    if (!form.displayName.trim()) {
      setProfileMsg({ type: 'error', text: 'Hming (Display name) a theihnghilh theih loh.' });
      return;
    }
    setProfileSaving(true);
    try {
      const updates = {
        displayName: form.displayName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        designation: form.designation.trim(),
        avatar: form.avatar.trim(),
        rollNo: form.rollNo?.trim?.(),
        className: form.className?.trim?.(),
        classId: form.classId?.trim?.(),
        dob: form.dob,
        bloodGroup: form.bloodGroup,
        parentPhone: form.parentPhone?.trim?.(),
        wardName: form.wardName?.trim?.(),
        relation: form.relation,
        whatsappNumber: form.whatsappNumber?.trim?.(),
        occupation: form.occupation?.trim?.(),
        subject: form.subject?.trim?.(),
        qualification: form.qualification?.trim?.(),
        hostelBuilding: form.hostelBuilding?.trim?.(),
        officeRoom: form.officeRoom?.trim?.(),
        officeHours: form.officeHours?.trim?.(),
      };

      let result;
      if (updateAnyUserProfile) {
        result = await updateAnyUserProfile(targetUser.uid, updates);
      } else {
        result = await updateUserProfile(updates);
      }

      if (result?.success) {
        setProfileMsg({ 
          type: 'success', 
          text: `${targetUser.displayName} profile update a thlak fel ta e! ✓` 
        });
      } else {
        setProfileMsg({ type: 'error', text: result?.error || 'Profile update a thlak thei lo.' });
      }
    } catch (e) {
      setProfileMsg({ type: 'error', text: e.message });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (isEditingSelf && !pwForm.current) {
      setPwMsg({ type: 'error', text: 'Password hman lai (Current password) ziah ngai.' });
      return;
    }
    if (pwForm.newPw.length < 6) {
      setPwMsg({ type: 'error', text: 'Password thar chu character 6 aia tlem lo a ni tur a ni.' });
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      setPwMsg({ type: 'error', text: 'Password thar confirm-na a inmil lo.' });
      return;
    }
    setPwSaving(true);
    try {
      let result;
      if (changeAnyUserPassword) {
        result = await changeAnyUserPassword(
          targetUser.uid, 
          pwForm.newPw, 
          isEditingSelf ? pwForm.current : null
        );
      } else {
        result = await changePassword(pwForm.current, pwForm.newPw);
      }

      if (result?.success) {
        setPwMsg({ 
          type: 'success', 
          text: `${targetUser.displayName} password thlak fel a ni e! ✓` 
        });
        setPwForm({ current: '', newPw: '', confirm: '' });
      } else {
        setPwMsg({ type: 'error', text: result?.error || 'Password thlak theih a ni lo.' });
      }
    } catch (e) {
      setPwMsg({ type: 'error', text: e.message });
    } finally {
      setPwSaving(false);
    }
  };

  const roleMeta = {
    superadmin: { label: 'Super Admin', color: 'from-violet-600 to-indigo-600', badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30', icon: ShieldCheck },
    principal: { label: 'Principal', color: 'from-amber-500 to-orange-600', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: ShieldCheck },
    vice_principal: { label: 'Vice Principal', color: 'from-blue-500 to-cyan-600', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: Award },
    teacher: { label: 'Class Teacher / Faculty', color: 'from-cyan-500 to-teal-600', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', icon: GraduationCap },
    warden: { label: 'Hostel Warden', color: 'from-purple-500 to-violet-600', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: Building2 },
    student: { label: 'Student', color: 'from-emerald-500 to-green-600', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: UserCheck },
    parent: { label: 'Parent / Guardian', color: 'from-rose-500 to-pink-600', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30', icon: HeartHandshake },
  }[targetUser?.role] || { label: 'Principal', color: 'from-amber-500 to-orange-600', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: ShieldCheck };

  const RoleIcon = roleMeta.icon;

  // Preset avatar samples for fast 1-click update
  const avatarPresets = [
    { label: 'Admin', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    { label: 'Teacher', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    { label: 'Student', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80' },
    { label: 'Parent', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80' },
    { label: 'Vice Principal', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' },
    { label: 'Warden', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80' },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={handleModalClose}>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" />
      <div
        className="relative bg-[#0b111e] border border-slate-800 rounded-3xl shadow-2xl shadow-black/90 w-full max-w-xl max-h-[92vh] overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200 z-10"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="relative shrink-0 bg-gradient-to-br from-slate-900 to-[#0e1726] px-6 pt-5 pb-0 border-b border-slate-800/80">
          {/* Close button */}
          <button
            onClick={handleModalClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* If Admin / Head: Multi-Account Role Selector Bar */}
          {canSwitchUsers && (
            <div className="mb-4">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Select User / Role Profile to Edit:</span>
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                {allUsers.map((u) => {
                  const isSel = u.uid === selectedUid;
                  return (
                    <button
                      key={u.uid}
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setSelectedUid(u.uid);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                        isSel
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                          : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <img 
                        src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName || 'U')}&background=6d28d9&color=fff&size=40`}
                        alt={u.displayName}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span>{u.role === 'principal' ? 'Principal' : u.role === 'vice_principal' ? 'Vice Principal' : u.role === 'teacher' ? 'Teacher' : u.role === 'parent' ? 'Parent' : u.role === 'student' ? 'Student' : u.role === 'warden' ? 'Warden' : 'Super Admin'}</span>
                      {isSel && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Target User Card Banner */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative shrink-0">
              <img
                src={form.avatar || targetUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser?.displayName || 'Principal')}&background=6d28d9&color=fff&size=80`}
                alt={targetUser?.displayName}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-violet-500/40 shadow-lg"
                onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser?.displayName || 'U')}&background=6d28d9&color=fff&size=80`; }}
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0b111e]" title="Active Profile" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white truncate">{targetUser?.displayName || 'Rev. Dr. L. H. Rohmingliana'}</h2>
                {isEditingSelf && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    You
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">{targetUser?.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r ${roleMeta.color} text-white shadow-sm`}>
                  <RoleIcon className="w-2.5 h-2.5" />
                  {roleMeta.label}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {targetUser.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs: My Profile | Security & Password */}
          <div className="flex gap-1 -mb-px">
            {[
              { id: 'profile', label: 'Profile Information', icon: User },
              { id: 'security', label: 'Password & Security', icon: KeyRound },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { 
                  stopCamera();
                  setActiveTab(tab.id); 
                  setProfileMsg(null); 
                  setPwMsg(null); 
                }}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-violet-500 text-violet-300 bg-violet-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body - Scrollable Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* =========================================================================
              TAB 1: PROFILE INFORMATION
              ========================================================================= */}
          {activeTab === 'profile' && (
            <>
              {/* Photo Management Box (Upload, Camera Selfie, URL Presets) */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-violet-400" />
                    <span>Profile Picture Setup</span>
                  </span>

                  {/* Photo Mode Switcher */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => { stopCamera(); setPhotoMode('upload'); }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                        photoMode === 'upload' 
                          ? 'bg-violet-600 text-white shadow-xs' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPhotoMode('camera'); handleStartCamera(); }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                        photoMode === 'camera' 
                          ? 'bg-violet-600 text-white shadow-xs' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Video className="w-3 h-3" />
                      <span>Camera / Selfie</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { stopCamera(); setPhotoMode('url'); }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                        photoMode === 'url' 
                          ? 'bg-violet-600 text-white shadow-xs' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>Web URL</span>
                    </button>
                  </div>
                </div>

                {/* Sub-mode 1: File Upload */}
                {photoMode === 'upload' && (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-700 hover:border-violet-500/70 rounded-xl p-4 text-center cursor-pointer transition bg-slate-950/50 hover:bg-violet-950/10 group"
                    >
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="p-2.5 rounded-full bg-violet-600/20 text-violet-400 group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-xs font-semibold text-white">
                          Click here to upload photo from computer / mobile
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Supports JPG, PNG, WebP (auto-resized & optimized for instant loading)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-mode 2: Live Camera / Selfie Capture */}
                {photoMode === 'camera' && (
                  <div className="space-y-3">
                    {cameraError ? (
                      <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                        <span>{cameraError}</span>
                        <button
                          type="button"
                          onClick={handleStartCamera}
                          className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/40 text-white text-[10px] font-bold"
                        >
                          Retry
                        </button>
                      </div>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden bg-black border border-violet-500/40 shadow-inner flex flex-col items-center">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-48 sm:h-56 object-cover bg-black scale-x-[-1]"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-600/80 text-white text-[10px] font-bold flex items-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                          <span>LIVE CAMERA</span>
                        </div>

                        {/* Capture & Controls Bar */}
                        <div className="p-3 w-full bg-gradient-to-t from-black/90 via-black/70 to-transparent flex items-center justify-center gap-2.5">
                          <button
                            type="button"
                            onClick={handleCapturePhoto}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer transition active:scale-95"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Capture Selfie</span>
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer transition"
                          >
                            Close Camera
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-mode 3: Direct Web URL & Presets */}
                {photoMode === 'url' && (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={form.avatar}
                      onChange={e => handleProfileChange('avatar', e.target.value)}
                      placeholder="https://your-photo-url.jpg"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition font-mono"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Presets:</span>
                      {avatarPresets.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleProfileChange('avatar', p.url)}
                          className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium border border-slate-700 transition cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Name & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <User className="w-3.5 h-3.5 inline mr-1 text-violet-400" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={form.displayName}
                    onChange={e => handleProfileChange('displayName', e.target.value)}
                    placeholder="e.g. Rev. Dr. L. H. Rohmingliana"
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition font-medium"
                  />
                </div>

                {/* Designation / Title */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-violet-400" />
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={form.designation}
                    onChange={e => handleProfileChange('designation', e.target.value)}
                    placeholder={targetUser?.role === 'student' ? 'Student' : targetUser?.role === 'parent' ? 'Parent / Guardian' : 'e.g. Principal & Head of Institute'}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Email Address */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <Mail className="w-3.5 h-3.5 inline mr-1 text-violet-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => handleProfileChange('email', e.target.value)}
                    placeholder="name@mizoramschool.edu"
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition font-mono"
                  />
                </div>

                {/* Phone Number (SMS / WhatsApp) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <Phone className="w-3.5 h-3.5 inline mr-1 text-violet-400" />
                    Phone (WhatsApp / SMS Alert)
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => handleProfileChange('phone', e.target.value)}
                    placeholder="+91 94361 XXXXX"
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition font-mono"
                  />
                </div>
              </div>

              {/* =====================================================================
                  ROLE-SPECIFIC CUSTOM FIELDS
                  ===================================================================== */}
              {targetUser?.role === 'student' && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <UserCheck className="w-4 h-4" />
                    <span>Student Academic & Biodata Info</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Roll Number</label>
                      <input
                        type="text"
                        value={form.rollNo}
                        onChange={e => handleProfileChange('rollNo', e.target.value)}
                        placeholder="e.g. 12"
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Class / Section</label>
                      <input
                        type="text"
                        value={form.className}
                        onChange={e => handleProfileChange('className', e.target.value)}
                        placeholder="e.g. Class 12 - Science"
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Blood Group</label>
                      <select
                        value={form.bloodGroup}
                        onChange={e => handleProfileChange('bloodGroup', e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={form.dob}
                        onChange={e => handleProfileChange('dob', e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Parent / Guardian Contact</label>
                      <input
                        type="tel"
                        value={form.parentPhone}
                        onChange={e => handleProfileChange('parentPhone', e.target.value)}
                        placeholder="+91 98623 XXXXX"
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {targetUser?.role === 'parent' && (
                <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                    <HeartHandshake className="w-4 h-4" />
                    <span>Parent / Guardian Ward & Contact Specifics</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ward / Student Name</label>
                      <input
                        type="text"
                        value={form.wardName}
                        onChange={e => handleProfileChange('wardName', e.target.value)}
                        placeholder="e.g. Lalrinsanga Sailo"
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Relation to Student</label>
                      <select
                        value={form.relation}
                        onChange={e => handleProfileChange('relation', e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                      >
                        <option value="Father">Father (Pa)</option>
                        <option value="Mother">Mother (Nu)</option>
                        <option value="Guardian">Legal Guardian</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Occupation</label>
                      <input
                        type="text"
                        value={form.occupation}
                        onChange={e => handleProfileChange('occupation', e.target.value)}
                        placeholder="e.g. Govt Employee / Business"
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">WhatsApp Notice Number</label>
                      <input
                        type="tel"
                        value={form.whatsappNumber}
                        onChange={e => handleProfileChange('whatsappNumber', e.target.value)}
                        placeholder="+91 98623 XXXXX"
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-rose-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {targetUser?.role === 'teacher' && (
                <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                    <GraduationCap className="w-4 h-4" />
                    <span>Faculty & Teaching Assignment</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Class Teacher Of</label>
                      <input
                        type="text"
                        value={form.className}
                        onChange={e => handleProfileChange('className', e.target.value)}
                        placeholder="e.g. Class 12 - Science"
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Primary Subjects</label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={e => handleProfileChange('subject', e.target.value)}
                        placeholder="e.g. Physics, Chemistry"
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Educational Qualification</label>
                    <input
                      type="text"
                      value={form.qualification}
                      onChange={e => handleProfileChange('qualification', e.target.value)}
                      placeholder="e.g. M.Sc. (Physics), B.Ed."
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {targetUser?.role === 'warden' && (
                <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                    <Building2 className="w-4 h-4" />
                    <span>Hostel Superintendence</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Assigned Hostel Building</label>
                    <input
                      type="text"
                      value={form.hostelBuilding}
                      onChange={e => handleProfileChange('hostelBuilding', e.target.value)}
                      placeholder="e.g. Lushai Boys Hostel"
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {(targetUser?.role === 'principal' || targetUser?.role === 'vice_principal' || targetUser?.role === 'superadmin') && (
                <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Award className="w-4 h-4" />
                    <span>Administrative Office Details</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Office Room / Chamber</label>
                      <input
                        type="text"
                        value={form.officeRoom}
                        onChange={e => handleProfileChange('officeRoom', e.target.value)}
                        placeholder="e.g. Room 101, Main Admin Block"
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Visiting / Calling Hours</label>
                      <input
                        type="text"
                        value={form.officeHours}
                        onChange={e => handleProfileChange('officeHours', e.target.value)}
                        placeholder="e.g. 10:00 AM - 3:00 PM (Weekdays)"
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Residential / Postal Address */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <MapPin className="w-3.5 h-3.5 inline mr-1 text-violet-400" />
                  Address (Veng / Khua / District / PIN)
                </label>
                <textarea
                  value={form.address}
                  onChange={e => handleProfileChange('address', e.target.value)}
                  rows={2}
                  placeholder="e.g. Pangkaiveng, Lunglawn, Lunglei, Mizoram - 796701"
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition resize-none"
                />
              </div>

              {/* Status Message */}
              {profileMsg && (
                <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  profileMsg.type === 'success'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                }`}>
                  {profileMsg.type === 'success'
                    ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                    : <AlertTriangle className="w-4 h-4 shrink-0" />}
                  {profileMsg.text}
                </div>
              )}

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-60 shadow-lg shadow-violet-600/25 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {profileSaving ? 'Saving Profile...' : `Save ${targetUser.displayName || 'Profile'}`}
              </button>
            </>
          )}

          {/* =========================================================================
              TAB 2: PASSWORD & SECURITY
              ========================================================================= */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-violet-950/20 border border-violet-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-violet-500/20 text-violet-300 shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Password Security for {targetUser.displayName}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isEditingSelf 
                      ? 'I account password hi i thlak thei a, a hnuai box-ah hian current password leh password thar ziak rawh.'
                      : `Administrator i nih angin ${targetUser.displayName} password hi i reset/thlak sak thei e.`}
                  </p>
                </div>
              </div>

              {/* Current password (only required if editing self) */}
              {isEditingSelf && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw.current ? 'text' : 'password'}
                      value={pwForm.current}
                      onChange={e => setPwForm(prev => ({ ...prev, current: e.target.value }))}
                      placeholder="Enter current password"
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPw.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  New Password (Min 6 Characters)
                </label>
                <div className="relative">
                  <input
                    type={showPw.newPw ? 'text' : 'password'}
                    value={pwForm.newPw}
                    onChange={e => setPwForm(prev => ({ ...prev, newPw: e.target.value }))}
                    placeholder="Enter new strong password"
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(prev => ({ ...prev, newPw: !prev.newPw }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPw.newPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPw.confirm ? 'text' : 'password'}
                    value={pwForm.confirm}
                    onChange={e => setPwForm(prev => ({ ...prev, confirm: e.target.value }))}
                    placeholder="Re-type new password"
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPw.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Status Message */}
              {pwMsg && (
                <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  pwMsg.type === 'success'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                }`}>
                  {pwMsg.type === 'success'
                    ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                    : <AlertTriangle className="w-4 h-4 shrink-0" />}
                  {pwMsg.text}
                </div>
              )}

              <button
                type="button"
                onClick={handleChangePassword}
                disabled={pwSaving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-60 shadow-lg shadow-violet-600/25 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                {pwSaving ? 'Updating Password...' : `Update Password for ${targetUser.displayName}`}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-3.5 border-t border-slate-800/80 flex items-center justify-between bg-slate-950/60">
          <div className="text-[11px] text-slate-500">
            Target UID: <span className="font-mono text-slate-400">{(targetUser?.uid || '').slice(0, 20)}…</span>
          </div>
          {isEditingSelf ? (
            <button
              onClick={async () => { await logout?.(); handleModalClose(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 hover:text-rose-200 text-xs font-bold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          ) : (
            <div className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Editing {roleMeta.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
