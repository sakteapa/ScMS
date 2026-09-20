import React, { useState, useEffect } from 'react';
import { 
  X, 
  Crown, 
  Star, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  Users, 
  Search, 
  Sparkles, 
  Lock, 
  Bell, 
  Award,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export default function ClassLeaderModal({ isOpen, onClose, targetClass }) {
  const { students, staff, assignClassLeaders } = useSchool();
  const { currentUser, isPrincipal, isVicePrincipal, isSuperAdmin, isTeacher } = useAuth();

  const [leaderId, setLeaderId] = useState('');
  const [asstLeaderId, setAsstLeaderId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifyAppointees, setNotifyAppointees] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);

  // Initialize selected leaders when modal opens or targetClass changes
  useEffect(() => {
    if (targetClass) {
      setLeaderId(targetClass.classLeaderId || '');
      setAsstLeaderId(targetClass.asstClassLeaderId || '');
      setSearchQuery('');
      setSuccessMessage(null);
    }
  }, [targetClass, isOpen]);

  if (!isOpen || !targetClass) return null;

  // Find class master staff record
  const assignedTeacherStaff = staff.find(s => s.classTeacherOf === targetClass.id || s.id === targetClass.classTeacherId);

  // Determine if current logged in user is authorized to appoint for THIS class:
  // 1. Principal, Vice Principal, and Super Admin have executive supervisory authority
  const isExecutive = isPrincipal || isVicePrincipal || isSuperAdmin;
  
  // 2. Class Master authority: Teacher matching this class's Class Master assignment
  let isClassMasterOfThisClass = false;
  if (isTeacher) {
    if (currentUser?.classId === targetClass.id) {
      isClassMasterOfThisClass = true;
    } else if (assignedTeacherStaff) {
      const userPhone = (currentUser?.phone || '').replace(/\s+/g, '');
      const staffPhone = (assignedTeacherStaff.phone || '').replace(/\s+/g, '');
      const userName = (currentUser?.displayName || currentUser?.name || '').toLowerCase();
      const staffName = (assignedTeacherStaff.name || '').toLowerCase();
      if ((userPhone && staffPhone && userPhone === staffPhone) || userName.includes(staffName) || staffName.includes(userName)) {
        isClassMasterOfThisClass = true;
      }
    }
  }

  const canAppoint = isExecutive || isClassMasterOfThisClass;

  // Title of the person appointing
  const assignerTitle = isClassMasterOfThisClass
    ? `${assignedTeacherStaff?.name || currentUser?.displayName || 'Class Master'} (Class Master)`
    : isPrincipal
    ? 'Principal (Dr. Lalthanzuala)'
    : isVicePrincipal
    ? 'Vice Principal (Dr. C. Lalremruata)'
    : 'Executive School Council';

  // Filter students belonging to this class
  const classStudents = students.filter(s => s.classId === targetClass.id);
  const filteredCandidates = classStudents.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = `${s.firstName} ${s.lastName}`.toLowerCase();
    return name.includes(q) || s.admissionNo.toLowerCase().includes(q) || (s.rollNo && s.rollNo.toString().includes(q));
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!canAppoint) return;

    if (leaderId && asstLeaderId && leaderId === asstLeaderId) {
      alert('Zirlai pakhat hi Class Leader leh Assistant Class Leader ah a rualin a ruat theih loh.');
      return;
    }

    const res = assignClassLeaders(targetClass.id, leaderId || null, asstLeaderId || null, assignerTitle);
    if (res.success) {
      setSuccessMessage('Class Leader leh Assistant Class Leader hlawhtling takin ruat an ni ta!');
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 text-white shadow-2xl p-6 font-sans space-y-5 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-cyan-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Class Leader &amp; Assistant Ruatna
                </h3>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                  {targetClass.name}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Class Master kuta mawhphurhna: Class rorelna leh zirlaite kaihhruaitu tur ruatna.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Toast */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Authority & Assigner Banner */}
        <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
          canAppoint 
            ? 'bg-gradient-to-r from-cyan-950/50 to-slate-950 border-cyan-500/40 text-slate-300' 
            : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
        }`}>
          {canAppoint ? (
            <>
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-cyan-300">Ruattu Nihna (Authority):</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-medium">
                    {assignerTitle}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Class Master-in a class zirlaite zing ațangin Class Leader leh Assistant Class Leader a ruat thei e.
                </p>
              </div>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-300">Class Master Thuneihna Bik:</span>
                <p className="text-[11px] text-rose-300/80 mt-0.5">
                  He class ({targetClass.name}) enkawltu Class Master ({targetClass.teacherName || 'Zirtirtu ruat mek'}) emaw Principal/Vice Principal chauhvin Leaders an ruat thei.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Class Overview Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Class Master</span>
              <div className="font-bold text-white truncate">{targetClass.teacherName || 'Not Assigned'}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Room &amp; Section</span>
              <div className="font-bold text-cyan-400">{targetClass.roomNumber || 'R-01'} • Sec {targetClass.section || 'A'}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Students</span>
              <div className="font-bold text-white">{classStudents.length} Zirlai</div>
            </div>
          </div>

          {/* Quick Candidate Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search enrolled students by name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Leader Selection 1: Class Leader (Monitor) */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-['Outfit']">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>1. Class Leader (Class Monitor / CR)</span>
              </label>
              {leaderId && (
                <button
                  type="button"
                  onClick={() => setLeaderId('')}
                  className="text-[10px] text-slate-400 hover:text-rose-400 underline"
                  disabled={!canAppoint}
                >
                  Clear / Paih
                </button>
              )}
            </div>

            <select
              value={leaderId}
              onChange={(e) => {
                const val = e.target.value;
                setLeaderId(val);
                if (val && val === asstLeaderId) setAsstLeaderId('');
              }}
              disabled={!canAppoint}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 disabled:opacity-50"
            >
              <option value="">-- Thlang rawh: Class Leader ruat tur --</option>
              {filteredCandidates.map(stu => (
                <option key={stu.id} value={stu.id}>
                  Roll #{stu.rollNo} • {stu.firstName} {stu.lastName} ({stu.admissionNo})
                </option>
              ))}
            </select>

            {/* Current Selected Leader Preview */}
            {leaderId && (() => {
              const sel = classStudents.find(s => s.id === leaderId);
              if (!sel) return null;
              return (
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs mt-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={sel.photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-amber-400"
                    />
                    <div>
                      <div className="font-bold text-white text-xs">{sel.firstName} {sel.lastName}</div>
                      <div className="text-[10px] text-amber-300">Roll #{sel.rollNo} • {sel.guardianPhone}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                    Leader
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Leader Selection 2: Assistant Class Leader (Vice Monitor) */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 font-['Outfit']">
                <Star className="w-4 h-4 text-cyan-400" />
                <span>2. Assistant Class Leader (Vice Monitor)</span>
              </label>
              {asstLeaderId && (
                <button
                  type="button"
                  onClick={() => setAsstLeaderId('')}
                  className="text-[10px] text-slate-400 hover:text-rose-400 underline"
                  disabled={!canAppoint}
                >
                  Clear / Paih
                </button>
              )}
            </div>

            <select
              value={asstLeaderId}
              onChange={(e) => {
                const val = e.target.value;
                setAsstLeaderId(val);
                if (val && val === leaderId) setLeaderId('');
              }}
              disabled={!canAppoint}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 disabled:opacity-50"
            >
              <option value="">-- Thlang rawh: Assistant Class Leader ruat tur --</option>
              {filteredCandidates.map(stu => (
                <option key={stu.id} value={stu.id} disabled={stu.id === leaderId}>
                  Roll #{stu.rollNo} • {stu.firstName} {stu.lastName} {stu.id === leaderId ? '(Class Leader a ni mek)' : ''}
                </option>
              ))}
            </select>

            {/* Current Selected Asst Leader Preview */}
            {asstLeaderId && (() => {
              const sel = classStudents.find(s => s.id === asstLeaderId);
              if (!sel) return null;
              return (
                <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs mt-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={sel.photoUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-cyan-400"
                    />
                    <div>
                      <div className="font-bold text-white text-xs">{sel.firstName} {sel.lastName}</div>
                      <div className="text-[10px] text-cyan-300">Roll #{sel.rollNo} • {sel.guardianPhone}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">
                    Asst. Leader
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Class Leader Responsibilities Card */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Mawhphurhna &amp; Duties (Class Leader &amp; Assistant):
            </span>
            <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[10px]">
              <li>Zing roll-call leh daily attendance a tul anga Class Master țanpui.</li>
              <li>Zirtirtu inthlak kar leh assembly-ah classroom discipline vawn.</li>
              <li>Class notice leh lehkha pawimawh zirlai dangte hnena hriattir.</li>
              <li>Classroom thianghlimna leh school property (desk, blackboard) venhim.</li>
            </ul>
          </div>

          {/* Notification Checkbox */}
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <input
              type="checkbox"
              checked={notifyAppointees}
              onChange={(e) => setNotifyAppointees(e.target.checked)}
              className="rounded text-cyan-500 focus:ring-cyan-400"
            />
            <Bell className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-[11px]">
              Zirlai ruat tharte leh an nu leh pa te hnenah In-App &amp; WhatsApp announcement thawn nghal rawh.
            </span>
          </label>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>

            {canAppoint ? (
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
              >
                <Check className="w-4 h-4" />
                <span>Ruatna Tifel Rawh</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Class Master thuneihna
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
