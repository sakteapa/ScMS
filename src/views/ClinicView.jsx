import React, { useState } from 'react';
import { 
  HeartPulse, 
  Activity, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  User, 
  Bed, 
  Pill, 
  Bell, 
  ShieldAlert, 
  Phone, 
  Sliders, 
  Check, 
  X, 
  Thermometer, 
  FileText,
  Save,
  Trash2
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export default function ClinicView() {
  const { 
    clinicRecords, 
    clinicConfig, 
    recordClinicVisit, 
    updateClinicVisit, 
    updateClinicConfig, 
    triggerEmergencySos,
    students,
    classes
  } = useSchool();
  const { currentUser, isPrincipal, isSuperAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('visits'); // 'visits' | 'dispensary' | 'config'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toast, setToast] = useState(null);

  // New Visit Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVisit, setNewVisit] = useState({
    studentId: '',
    complaint: '',
    vitals: { temp: '98.6°F', bp: '115/75', pulse: '76 bpm', spo2: '99%' },
    treatment: '',
    bedAllocated: 'Bed #01',
    status: 'resting',
    parentNotified: true,
    nurseNotes: ''
  });

  // Emergency SOS Modal State
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [sosStudentId, setSosStudentId] = useState('');
  const [sosNote, setSosNote] = useState('');

  // Draft Config State
  const [configDraft, setConfigDraft] = useState(clinicConfig || {});

  const filteredRecords = clinicRecords.filter(r => {
    const matchesSearch = r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.className && r.className.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.complaint && r.complaint.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newVisit.studentId || !newVisit.complaint) {
      alert('Khawngaihin zirlai leh an harsatna ziah luh a ngai.');
      return;
    }

    const stu = students.find(s => s.id === newVisit.studentId);
    const cls = classes.find(c => c.id === stu?.classId);

    recordClinicVisit({
      ...newVisit,
      studentName: stu ? `${stu.firstName} ${stu.lastName}` : 'Student',
      classId: stu?.classId || '',
      className: cls?.name || 'Class 12',
      rollNo: stu?.rollNo || '01'
    });

    setIsAddModalOpen(false);
    setNewVisit({
      studentId: '',
      complaint: '',
      vitals: { temp: '98.6°F', bp: '115/75', pulse: '76 bpm', spo2: '99%' },
      treatment: '',
      bedAllocated: 'Bed #01',
      status: 'resting',
      parentNotified: true,
      nurseNotes: ''
    });

    setToast('Clinic patient record added successfully!');
    setTimeout(() => setToast(null), 3000);
  };

  const handleSosSubmit = (e) => {
    e.preventDefault();
    if (!sosStudentId) return;
    triggerEmergencySos(sosStudentId, sosNote);
    setIsSosModalOpen(false);
    setSosStudentId('');
    setSosNote('');
    setToast('🚨 Emergency Medical SOS broadcast dispatched to Parents and Administration!');
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    updateClinicConfig(configDraft);
    setToast('Clinic & Infirmary settings updated successfully!');
    setTimeout(() => setToast(null), 3000);
  };

  // Quick Stats
  const activeSickBayCount = clinicRecords.filter(r => r.status === 'resting' || r.status === 'recovering').length;
  const todayVisitsCount = clinicRecords.filter(r => r.date === new Date().toISOString().slice(0, 10)).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-slate-900 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-indigo-950/40 border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-lg">
            <HeartPulse className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
                School Health Clinic &amp; Sick Bay
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-bold">
                INFIRMARY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Duty Nurse: <strong className="text-white">{clinicConfig?.nurseInCharge || 'Pi Lalmuanpuii, RN'}</strong> • On-Call Doctor: {clinicConfig?.doctorOnCall || 'Dr. Zothansanga, MD'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsSosModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition flex items-center gap-1.5 animate-pulse"
            title="Broadcast Emergency Medical SOS"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Emergency SOS</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Record Patient Visit</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Sick Bay Occupancy</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-400 font-mono">
              {activeSickBayCount} / {clinicConfig?.sickBayBedCount || 6}
            </span>
            <Bed className="w-4 h-4 text-slate-500" />
          </div>
          <span className="text-[10px] text-slate-500">Active resting patients</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Today's Total Visits</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-cyan-400 font-mono">
              {todayVisitsCount}
            </span>
            <Activity className="w-4 h-4 text-slate-500" />
          </div>
          <span className="text-[10px] text-slate-500">OPD &amp; Sick bay checkups</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Total Clinic Records</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-indigo-400 font-mono">
              {clinicRecords.length}
            </span>
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <span className="text-[10px] text-slate-500">Cumulative patient history</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Parent Sync Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              98.5%
            </span>
            <Bell className="w-4 h-4 text-slate-500" />
          </div>
          <span className="text-[10px] text-slate-500">Instant notification reach</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('visits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'visits' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Patient Visits &amp; Sick Bay Log</span>
        </button>

        <button
          onClick={() => setActiveTab('dispensary')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'dispensary' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>First-Aid &amp; Dispensary Medicine Stock</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'config' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Clinic &amp; Emergency Configuration</span>
        </button>
      </div>

      {/* TAB 1: VISITS LOG */}
      {activeTab === 'visits' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student, class, complaint..."
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="All">All Statuses</option>
                <option value="resting">Resting in Sick Bay</option>
                <option value="recovering">Recovering</option>
                <option value="discharged">Discharged</option>
                <option value="referred">Referred to Hospital</option>
              </select>
            </div>
          </div>

          {/* Records List Table / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecords.length === 0 ? (
              <div className="md:col-span-2 p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-3xl">
                No clinic records found matching your query.
              </div>
            ) : (
              filteredRecords.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm font-['Outfit']">{r.studentName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono">
                          {r.className} • #{r.rollNo}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {r.date} at {r.time} ({r.bedAllocated})
                      </span>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      r.status === 'resting' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      r.status === 'recovering' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                      r.status === 'referred' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {r.status}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <p className="text-slate-200"><strong>Complaint:</strong> {r.complaint}</p>
                    <p className="text-cyan-300"><strong>Treatment:</strong> {r.treatment}</p>
                  </div>

                  {/* Vitals Ribbon */}
                  <div className="grid grid-cols-4 gap-2 text-center bg-slate-950/60 p-2 rounded-xl text-[10px] font-mono border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block">TEMP</span>
                      <span className="text-white font-bold">{r.vitals?.temp || '98.6°F'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">BP</span>
                      <span className="text-white font-bold">{r.vitals?.bp || '120/80'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">PULSE</span>
                      <span className="text-white font-bold">{r.vitals?.pulse || '76 bpm'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">SPO2</span>
                      <span className="text-emerald-400 font-bold">{r.vitals?.spo2 || '99%'}</span>
                    </div>
                  </div>

                  {/* Actions & Status Changer */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[11px] text-slate-400 italic truncate max-w-[220px]">
                      {r.nurseNotes || 'Under monitoring.'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {r.status !== 'discharged' && (
                        <button
                          onClick={() => {
                            updateClinicVisit(r.id, { status: 'discharged' });
                            setToast(`Discharged ${r.studentName} back to classroom.`);
                            setTimeout(() => setToast(null), 2500);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 font-semibold text-[11px] transition"
                        >
                          Discharge
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DISPENSARY STOCK */}
      {activeTab === 'dispensary' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm font-['Outfit']">School Dispensary &amp; First-Aid Stock</h3>
              <p className="text-xs text-slate-400">Essential emergency medical supplies kept on campus.</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 font-mono font-bold">
              Checked Daily
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: 'Paracetamol 500mg Tablets', qty: 120, unit: 'strips', status: 'In Stock' },
              { name: 'ORS Electrolyte Packets', qty: 45, unit: 'sachets', status: 'In Stock' },
              { name: 'Crepe Bandages (10cm)', qty: 18, unit: 'rolls', status: 'In Stock' },
              { name: 'Antiseptic Betadine Solution', qty: 4, unit: 'bottles (500ml)', status: 'In Stock' },
              { name: 'Cetirizine 10mg (Anti-Allergy)', qty: 80, unit: 'tablets', status: 'In Stock' },
              { name: 'Diclofenac Pain Relief Gel', qty: 6, unit: 'tubes', status: 'Low Stock' },
              { name: 'Sterile Gauze Swabs', qty: 200, unit: 'pcs', status: 'In Stock' },
              { name: 'Asthma Salbutamol Inhaler', qty: 3, unit: 'canisters', status: 'Critical Reserve' },
              { name: 'Digital Infrared Thermometer', qty: 4, unit: 'devices', status: 'Operational' }
            ].map((med, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-white text-xs">{med.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    med.status === 'Low Stock' ? 'bg-amber-500/20 text-amber-300' :
                    med.status === 'Critical Reserve' ? 'bg-rose-500/20 text-rose-300' :
                    'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {med.status}
                  </span>
                </div>
                <div className="text-xs font-mono text-cyan-400">
                  Quantity: <strong>{med.qty} {med.unit}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONFIGURATION SETTINGS */}
      {activeTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm font-['Outfit']">School Infirmary &amp; Clinic Configuration</h3>
              <p className="text-xs text-slate-400">Manage personnel, emergency communication, and health sync policies.</p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Clinic Settings</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Nurse In-Charge Name &amp; Credentials</label>
              <input
                type="text"
                value={configDraft.nurseInCharge || ''}
                onChange={(e) => setConfigDraft({ ...configDraft, nurseInCharge: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Doctor On-Call &amp; Hospital Affiliation</label>
              <input
                type="text"
                value={configDraft.doctorOnCall || ''}
                onChange={(e) => setConfigDraft({ ...configDraft, doctorOnCall: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Operating Hours</label>
              <input
                type="text"
                value={configDraft.operatingHours || ''}
                onChange={(e) => setConfigDraft({ ...configDraft, operatingHours: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Available Sick Bay Beds Count</label>
              <input
                type="number"
                value={configDraft.sickBayBedCount || 6}
                onChange={(e) => setConfigDraft({ ...configDraft, sickBayBedCount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition">
              <div>
                <div className="font-bold text-xs text-white">Auto-Notify Parents on Sick Bay Admission</div>
                <p className="text-[11px] text-slate-400">Dispatches real-time WhatsApp &amp; In-App alert to parent when their child rests in clinic.</p>
              </div>
              <input
                type="checkbox"
                checked={!!configDraft.autoParentAlertOnAdmission}
                onChange={(e) => setConfigDraft({ ...configDraft, autoParentAlertOnAdmission: e.target.checked })}
                className="w-5 h-5 rounded text-cyan-500"
              />
            </label>

            <label className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition">
              <div>
                <div className="font-bold text-xs text-white">Classroom Attendance Auto-Sync</div>
                <p className="text-[11px] text-slate-400">Marks student as 'Excused / Infirmary' in daily attendance if resting exceeds 2 periods.</p>
              </div>
              <input
                type="checkbox"
                checked={!!configDraft.syncWithAttendance}
                onChange={(e) => setConfigDraft({ ...configDraft, syncWithAttendance: e.target.checked })}
                className="w-5 h-5 rounded text-cyan-500"
              />
            </label>
          </div>
        </form>
      )}

      {/* RECORD VISIT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleAddSubmit} className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base font-['Outfit']">Record Student Clinic Visit</h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Select Student Patient</label>
              <select
                value={newVisit.studentId}
                onChange={(e) => setNewVisit({ ...newVisit, studentId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                required
              >
                <option value="">-- Choose Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} (Roll #{s.rollNo} • {s.admissionNo})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Chief Complaint / Symptoms</label>
              <input
                type="text"
                value={newVisit.complaint}
                onChange={(e) => setNewVisit({ ...newVisit, complaint: e.target.value })}
                placeholder="e.g. High fever, stomach ache, football knee scratch"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Temperature (°F)</label>
                <input
                  type="text"
                  value={newVisit.vitals.temp}
                  onChange={(e) => setNewVisit({ ...newVisit, vitals: { ...newVisit.vitals, temp: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Blood Pressure</label>
                <input
                  type="text"
                  value={newVisit.vitals.bp}
                  onChange={(e) => setNewVisit({ ...newVisit, vitals: { ...newVisit.vitals, bp: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Treatment &amp; Medication Given</label>
              <input
                type="text"
                value={newVisit.treatment}
                onChange={(e) => setNewVisit({ ...newVisit, treatment: e.target.value })}
                placeholder="e.g. Paracetamol 500mg, antiseptic dressing, ice pack"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Bed / Area Allocation</label>
                <select
                  value={newVisit.bedAllocated}
                  onChange={(e) => setNewVisit({ ...newVisit, bedAllocated: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="Bed #01">Bed #01 (Emergency)</option>
                  <option value="Bed #02">Bed #02 (Resting)</option>
                  <option value="Bed #03">Bed #03 (Observation)</option>
                  <option value="Outpatient">Outpatient (Immediate return)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Patient Status</label>
                <select
                  value={newVisit.status}
                  onChange={(e) => setNewVisit({ ...newVisit, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="resting">Resting in Sick Bay</option>
                  <option value="recovering">Recovering</option>
                  <option value="discharged">Discharged</option>
                  <option value="referred">Referred to Hospital</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="notifyParent"
                checked={newVisit.parentNotified}
                onChange={(e) => setNewVisit({ ...newVisit, parentNotified: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-500"
              />
              <label htmlFor="notifyParent" className="text-xs text-slate-300">
                Dispatch automated health notice to parent via WhatsApp / In-App
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
              >
                Save Patient Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EMERGENCY MEDICAL SOS MODAL */}
      {isSosModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSosSubmit} className="w-full max-w-md bg-slate-900 border border-red-500/50 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-red-500/30 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/40 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm font-['Outfit']">EMERGENCY MEDICAL SOS DISPATCH</h3>
                <p className="text-[11px] text-red-300">Instantly alerts Principal, Vice Principal &amp; Parents.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Target Student in Critical Need</label>
              <select
                value={sosStudentId}
                onChange={(e) => setSosStudentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-red-500/50 text-xs text-white"
                required
              >
                <option value="">-- Choose Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} (Roll #{s.rollNo})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Emergency Details / Incident Location</label>
              <textarea
                value={sosNote}
                onChange={(e) => setSosNote(e.target.value)}
                rows={3}
                placeholder="e.g. Unconscious after fall on football turf, ambulance summoned"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-400"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsSosModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 flex items-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>DISPATCH SOS NOW</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
