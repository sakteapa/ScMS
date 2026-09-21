import React, { useState } from 'react';
import { 
  GraduationCap, 
  Award, 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  CheckCircle2, 
  Send, 
  Sliders, 
  Save, 
  Check, 
  Clock, 
  Truck, 
  Building
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export default function AlumniView() {
  const { 
    alumni, 
    transcriptRequests, 
    alumniConfig, 
    registerAlumni, 
    requestTranscript, 
    updateTranscriptStatus, 
    updateAlumniConfig 
  } = useSchool();
  const { currentUser, isPrincipal, isVicePrincipal, isSuperAdmin, isTeacher, isStudent } = useAuth();
  const canRegisterAlumni = isPrincipal || isVicePrincipal || isSuperAdmin || isTeacher || (!isStudent);

  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'transcripts' | 'config'
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('All');
  const [toast, setToast] = useState(null);

  // Register Modal
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newAlumni, setNewAlumni] = useState({
    name: '',
    graduatingBatch: 2024,
    classCompleted: 'Class 12 - Science',
    currentRole: '',
    organization: '',
    location: '',
    email: '',
    phone: '',
    achievement: '',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  });

  // Transcript Request Modal
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    alumniName: '',
    batch: 2022,
    documentType: 'Official English Migration & Character Transcript',
    purpose: '',
    deliveryAddress: ''
  });

  // Config Draft
  const [configDraft, setConfigDraft] = useState(alumniConfig || {});

  const filteredAlumni = alumni.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.currentRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.achievement && a.achievement.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesBatch = batchFilter === 'All' || String(a.graduatingBatch) === batchFilter;
    return matchesSearch && matchesBatch;
  });

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!newAlumni.name || !newAlumni.currentRole) {
      alert('Khawngaihin hming leh tun dinhmun/hna ziah a ngai.');
      return;
    }

    registerAlumni(newAlumni);
    setIsRegisterModalOpen(false);
    setNewAlumni({
      name: '',
      graduatingBatch: 2024,
      classCompleted: 'Class 12 - Science',
      currentRole: '',
      organization: '',
      location: '',
      email: '',
      phone: '',
      achievement: '',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    });

    setToast('Alumni member successfully registered to school network!');
    setTimeout(() => setToast(null), 3000);
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!newRequest.alumniName || !newRequest.purpose) {
      alert('Khawngaihin hming leh transcript mamawhna chhan ziah a ngai.');
      return;
    }

    requestTranscript(newRequest);
    setIsRequestModalOpen(false);
    setNewRequest({
      alumniName: '',
      batch: 2022,
      documentType: 'Official English Migration & Character Transcript',
      purpose: '',
      deliveryAddress: ''
    });

    setToast('Official transcript application received and queued for dispatch!');
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    updateAlumniConfig(configDraft);
    setToast('Alumni Association settings updated!');
    setTimeout(() => setToast(null), 3000);
  };

  const distinctBatches = Array.from(new Set(alumni.map(a => a.graduatingBatch))).sort((a, b) => b - a);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-slate-900 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/40 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-lg">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
                Alumni &amp; Former Students Association
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono font-bold">
                GRADUATES
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Association President: <strong className="text-white">{alumniConfig?.associationPresident || 'Dr. Zoramthanga Fanai'}</strong> • Online Transcripts &amp; Graduate Network
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 font-bold text-xs shadow transition flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Apply for Transcript</span>
          </button>

          {canRegisterAlumni ? (
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Alumni Member</span>
            </button>
          ) : (
            <div className="px-3.5 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 text-[11px] font-medium flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
              <span>Graduation / Pass-out hnuah chauh register theih a ni</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Total Enrolled Alumni</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-purple-400 font-mono">
              {alumni.length} Graduates
            </span>
            <GraduationCap className="w-4 h-4 text-slate-500" />
          </div>
          <span className="text-[10px] text-slate-500">Batches 2018 - 2025</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Transcript Applications</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-cyan-400 font-mono">
              {transcriptRequests.length} Requests
            </span>
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <span className="text-[10px] text-slate-500">Verified official seals</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Higher Education &amp; Career</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              100% Placement
            </span>
            <Award className="w-4 h-4 text-slate-500" />
          </div>
          <span className="text-[10px] text-slate-500">Top medical, engg &amp; civil services</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'directory' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Alumni Directory &amp; Achievers</span>
        </button>

        <button
          onClick={() => setActiveTab('transcripts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'transcripts' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Official Transcript &amp; Duplicate TC Requests</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'config' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Alumni Settings</span>
        </button>
      </div>

      {/* TAB 1: ALUMNI DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alumni name, role, college..."
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="All">All Passing Batches</option>
                {distinctBatches.map(b => (
                  <option key={b} value={String(b)}>Batch of {b}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAlumni.length === 0 ? (
              <div className="md:col-span-2 p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-3xl">
                No alumni records found matching your filter criteria.
              </div>
            ) : (
              filteredAlumni.map((a) => (
                <div key={a.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg flex gap-4">
                  <img
                    src={a.photoUrl}
                    alt=""
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-500/30 shrink-0"
                  />
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="truncate">
                        <h4 className="font-bold text-white text-sm font-['Outfit'] truncate">{a.name}</h4>
                        <span className="text-xs text-cyan-400 font-mono">
                          Batch of {a.graduatingBatch} ({a.classCompleted})
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold shrink-0">
                        ALUMNI
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 flex items-center gap-1.5 pt-0.5 truncate">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{a.currentRole} at <strong>{a.organization}</strong></span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{a.location}</span>
                    </div>

                    {a.achievement && (
                      <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/30 text-[11px] text-purple-200 mt-2 flex items-start gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{a.achievement}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TRANSCRIPTS */}
      {activeTab === 'transcripts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transcriptRequests.length === 0 ? (
              <div className="md:col-span-2 p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-3xl">
                No transcript requests currently logged.
              </div>
            ) : (
              transcriptRequests.map((tr) => (
                <div key={tr.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-white text-sm font-['Outfit']">{tr.alumniName}</span>
                      <span className="text-xs text-slate-400 block font-mono">
                        Batch: {tr.batch} • Requested: {tr.requestedAt}
                      </span>
                    </div>

                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      tr.status === 'dispatched' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                      tr.status === 'processed' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {tr.status}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <p className="text-slate-200 font-semibold">{tr.documentType}</p>
                    <p className="text-slate-400">Purpose: {tr.purpose}</p>
                    <p className="text-cyan-400 font-mono">Processing Fee: ₹{tr.feePaid} (Paid)</p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    {tr.trackingNo ? (
                      <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Tracking: {tr.trackingNo}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Awaiting Postal Dispatch</span>
                    )}

                    {tr.status !== 'dispatched' && (
                      <button
                        onClick={() => {
                          const code = `EM${Math.floor(100000000 + Math.random() * 900000000)}IN`;
                          updateTranscriptStatus(tr.id, 'dispatched', code);
                          setToast(`Transcript for ${tr.alumniName} dispatched with Speed Post #${code}!`);
                          setTimeout(() => setToast(null), 3500);
                        }}
                        className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Mark Dispatched</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CONFIGURATION */}
      {activeTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm font-['Outfit']">Alumni Association &amp; Records Configuration</h3>
              <p className="text-xs text-slate-400">Alumni governance, transcript fees, and verification rules.</p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Alumni Settings</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Alumni Association President</label>
              <input
                type="text"
                value={configDraft.associationPresident || ''}
                onChange={(e) => setConfigDraft({ ...configDraft, associationPresident: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Official Transcript Processing Fee (₹)</label>
              <input
                type="number"
                value={configDraft.transcriptFeeAmount || 300}
                onChange={(e) => setConfigDraft({ ...configDraft, transcriptFeeAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-300">Authorized Courier &amp; Postal Partners</label>
              <input
                type="text"
                value={configDraft.courierDeliveryPartner || ''}
                onChange={(e) => setConfigDraft({ ...configDraft, courierDeliveryPartner: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition">
              <div>
                <div className="font-bold text-xs text-white">Public Alumni Directory Listing</div>
                <p className="text-[11px] text-slate-400">Allow graduated students to display their achievements in the public institutional network.</p>
              </div>
              <input
                type="checkbox"
                checked={!!configDraft.publicDirectoryEnabled}
                onChange={(e) => setConfigDraft({ ...configDraft, publicDirectoryEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-cyan-500"
              />
            </label>

            <label className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition">
              <div>
                <div className="font-bold text-xs text-white">Enable Online Transcript &amp; Duplicate TC Requests</div>
                <p className="text-[11px] text-slate-400">Permit alumni to submit digital transcript requests via the school portal.</p>
              </div>
              <input
                type="checkbox"
                checked={!!configDraft.allowOnlineTranscriptRequests}
                onChange={(e) => setConfigDraft({ ...configDraft, allowOnlineTranscriptRequests: e.target.checked })}
                className="w-5 h-5 rounded text-cyan-500"
              />
            </label>
          </div>
        </form>
      )}

      {/* REGISTER ALUMNI MODAL */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleRegisterSubmit} className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base font-['Outfit']">Register Former Student / Alumni</h3>
              <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Alumni Full Name</label>
                <input
                  type="text"
                  value={newAlumni.name}
                  onChange={(e) => setNewAlumni({ ...newAlumni, name: e.target.value })}
                  placeholder="e.g. Dr. Vanlalpeka Hnamte"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Passing Batch (Year)</label>
                <input
                  type="number"
                  value={newAlumni.graduatingBatch}
                  onChange={(e) => setNewAlumni({ ...newAlumni, graduatingBatch: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Current Role / Designation</label>
                <input
                  type="text"
                  value={newAlumni.currentRole}
                  onChange={(e) => setNewAlumni({ ...newAlumni, currentRole: e.target.value })}
                  placeholder="e.g. Software Engineer, Medical Doctor"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Organization / University</label>
                <input
                  type="text"
                  value={newAlumni.organization}
                  onChange={(e) => setNewAlumni({ ...newAlumni, organization: e.target.value })}
                  placeholder="e.g. AIIMS Delhi, Google, IIT"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Key Academic or Career Achievement</label>
              <textarea
                value={newAlumni.achievement}
                onChange={(e) => setNewAlumni({ ...newAlumni, achievement: e.target.value })}
                rows={2}
                placeholder="e.g. State ranker, published researcher, sports medal winner..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg"
              >
                Register Alumni
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TRANSCRIPT REQUEST MODAL */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleRequestSubmit} className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base font-['Outfit']">Apply for Official Transcript</h3>
              <button type="button" onClick={() => setIsRequestModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Applicant Full Name</label>
              <input
                type="text"
                value={newRequest.alumniName}
                onChange={(e) => setNewRequest({ ...newRequest, alumniName: e.target.value })}
                placeholder="Full Name as recorded in CBSE certificates"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Document Type</label>
              <select
                value={newRequest.documentType}
                onChange={(e) => setNewRequest({ ...newRequest, documentType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              >
                <option value="Official English Migration & Character Transcript">Official English Migration &amp; Character Transcript</option>
                <option value="Duplicate Consolidated Marksheet (CBSE Verification)">Duplicate Consolidated Marksheet</option>
                <option value="Bonafide Passing Out & Medium of Instruction Certificate">Bonafide Passing Out Certificate</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Purpose / Target Institution</label>
              <input
                type="text"
                value={newRequest.purpose}
                onChange={(e) => setNewRequest({ ...newRequest, purpose: e.target.value })}
                placeholder="e.g. Higher studies fellowship, Visa verification"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Transcript Verification Fee:</span>
                <span className="font-bold text-emerald-400 font-mono">₹{alumniConfig?.transcriptFeeAmount || 300}</span>
              </div>
              <span className="text-[10px] text-slate-500 block">Includes official embossing seal and Speed Post delivery.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
              >
                Submit Transcript Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
