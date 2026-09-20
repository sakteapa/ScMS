import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  QrCode, 
  Car, 
  Phone, 
  Sliders, 
  Check, 
  X, 
  Printer, 
  AlertCircle, 
  CheckCircle2, 
  LogOut, 
  Save, 
  Users, 
  Building
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export default function VisitorsView() {
  const { 
    visitors, 
    visitorConfig, 
    issueVisitorPass, 
    checkoutVisitor, 
    updateVisitorConfig,
    staff 
  } = useSchool();
  const { currentUser, isPrincipal, isSuperAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('passes'); // 'passes' | 'config'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toast, setToast] = useState(null);

  // New Pass Modal State
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [newPass, setNewPass] = useState({
    visitorName: '',
    phone: '',
    purpose: '',
    visitingWhom: '',
    visitingDepartment: 'Academic Secondary Faculty',
    studentName: '',
    studentRoll: '',
    vehicleNo: '',
    idProofType: 'Aadhaar Card',
    remarks: ''
  });

  // Selected Pass for Print / Detail Modal
  const [printPassTarget, setPrintPassTarget] = useState(null);

  // Draft Config
  const [configDraft, setConfigDraft] = useState(visitorConfig || {});

  const filteredVisitors = visitors.filter(v => {
    const matchesSearch = v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.passNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.visitingWhom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.vehicleNo && v.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    if (!newPass.visitorName || !newPass.phone || !newPass.visitingWhom) {
      alert('Khawngaihin mikhual hming, phone, leh an hmuh tur ziah luh a ngai.');
      return;
    }

    const created = issueVisitorPass(newPass);
    setIsPassModalOpen(false);
    setPrintPassTarget(created.pass);
    setNewPass({
      visitorName: '',
      phone: '',
      purpose: '',
      visitingWhom: '',
      visitingDepartment: 'Academic Secondary Faculty',
      studentName: '',
      studentRoll: '',
      vehicleNo: '',
      idProofType: 'Aadhaar Card',
      remarks: ''
    });

    setToast('Gate Security Pass issued successfully!');
    setTimeout(() => setToast(null), 3000);
  };

  const handleCheckout = (passId, visitorName) => {
    checkoutVisitor(passId);
    setToast(`Visitor ${visitorName} checked out successfully.`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    updateVisitorConfig(configDraft);
    setToast('Security Gate pass configuration updated!');
    setTimeout(() => setToast(null), 3000);
  };

  const insideCount = visitors.filter(v => v.status === 'inside').length;
  const todayTotalCount = visitors.length;

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
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/40 border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-lg">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
                Main Campus Visitor &amp; Gate Pass Security
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono font-bold">
                GATE CONTROL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Security Chief: <strong className="text-white">{visitorConfig?.gateSecurityChief || 'Havildar Laltlanhlua'}</strong> • Curfew Time: {visitorConfig?.curfewTime || '17:30 PM'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPassModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-blue-500/20 transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Issue New Visitor Pass</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Currently Inside Campus</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-400 font-mono">
              {insideCount} Visitors
            </span>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <span className="text-[10px] text-slate-500">Active visitor security badges</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Total Passes Registered</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-cyan-400 font-mono">
              {todayTotalCount}
            </span>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <span className="text-[10px] text-slate-500">Cumulative gate register</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Security Clearance Status</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              SECURE
            </span>
            <ShieldCheck className="w-4 h-4 text-slate-500" />
          </div>
          <span className="text-[10px] text-slate-500">All visitors verified with ID</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('passes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'passes' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Active &amp; Historical Visitor Passes</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'config' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Gate Security Settings</span>
        </button>
      </div>

      {/* TAB 1: PASSES REGISTER */}
      {activeTab === 'passes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pass #, visitor, staff, vehicle..."
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
                <option value="All">All Passes</option>
                <option value="inside">Currently Inside</option>
                <option value="checked_out">Checked Out</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVisitors.length === 0 ? (
              <div className="md:col-span-2 p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-3xl">
                No visitor passes found matching your filter criteria.
              </div>
            ) : (
              filteredVisitors.map((v) => (
                <div key={v.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm font-['Outfit']">{v.visitorName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold">
                          {v.passNo}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        Phone: {v.phone} • ID: {v.idProofType}
                      </span>
                    </div>

                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      v.status === 'inside'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {v.status === 'inside' ? 'Inside Campus' : 'Checked Out'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <p className="text-slate-200"><strong>Purpose:</strong> {v.purpose}</p>
                    <p className="text-cyan-300"><strong>Visiting:</strong> {v.visitingWhom} ({v.visitingDepartment})</p>
                    {v.vehicleNo && (
                      <p className="text-slate-400 font-mono flex items-center gap-1">
                        <Car className="w-3.5 h-3.5" />
                        <span>Vehicle: {v.vehicleNo}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[11px] text-slate-500 font-mono">
                      Entry: {v.entryTime} {v.exitTime ? `• Exit: ${v.exitTime}` : ''}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPrintPassTarget(v)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Print / View Security Badge"
                      >
                        <Printer className="w-4 h-4 text-cyan-400" />
                      </button>

                      {v.status === 'inside' && (
                        <button
                          onClick={() => handleCheckout(v.id, v.visitorName)}
                          className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center gap-1 transition"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Check Out</span>
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

      {/* TAB 2: CONFIGURATION */}
      {activeTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm font-['Outfit']">Main Gate Security Configuration</h3>
              <p className="text-xs text-slate-400">Security officer in charge, validity timeouts, and verification rules.</p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Security Settings</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Security Desk Officer / Chief In-Charge</label>
              <input
                type="text"
                value={configDraft.gateSecurityChief || ''}
                onChange={(e) => setConfigDraft({ ...configDraft, gateSecurityChief: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Default Pass Validity Limit (Minutes)</label>
              <input
                type="number"
                value={configDraft.defaultPassValidityMinutes || 90}
                onChange={(e) => setConfigDraft({ ...configDraft, defaultPassValidityMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Campus Visitor Curfew / Closing Time</label>
              <input
                type="text"
                value={configDraft.curfewTime || ''}
                onChange={(e) => setConfigDraft({ ...configDraft, curfewTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Visitor Badge Print Format</label>
              <select
                value={configDraft.gateBadgePrintFormat || 'badge_80mm'}
                onChange={(e) => setConfigDraft({ ...configDraft, gateBadgePrintFormat: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              >
                <option value="badge_80mm">Thermal POS Badge (80mm Slip)</option>
                <option value="slip_a6">A6 ID Card Visitor Pass Badge</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition">
              <div>
                <div className="font-bold text-xs text-white">Require Vehicle Registration Number</div>
                <p className="text-[11px] text-slate-400">Enforces two-wheeler and four-wheeler license plate recording for gate entry.</p>
              </div>
              <input
                type="checkbox"
                checked={!!configDraft.requireVehicleNumber}
                onChange={(e) => setConfigDraft({ ...configDraft, requireVehicleNumber: e.target.checked })}
                className="w-5 h-5 rounded text-cyan-500"
              />
            </label>

            <label className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition">
              <div>
                <div className="font-bold text-xs text-white">Require Host Clearance Before Badge Issuance</div>
                <p className="text-[11px] text-slate-400">Security sends an instant verification prompt to teacher or office desk before releasing badge.</p>
              </div>
              <input
                type="checkbox"
                checked={!!configDraft.requireHostApproval}
                onChange={(e) => setConfigDraft({ ...configDraft, requireHostApproval: e.target.checked })}
                className="w-5 h-5 rounded text-cyan-500"
              />
            </label>
          </div>
        </form>
      )}

      {/* ISSUE PASS MODAL */}
      {isPassModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleIssueSubmit} className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base font-['Outfit']">Issue Main Gate Visitor Pass</h3>
              <button type="button" onClick={() => setIsPassModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Visitor Full Name</label>
                <input
                  type="text"
                  value={newPass.visitorName}
                  onChange={(e) => setNewPass({ ...newPass, visitorName: e.target.value })}
                  placeholder="e.g. Pu K. Lalbiaka"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Contact Phone Number</label>
                <input
                  type="text"
                  value={newPass.phone}
                  onChange={(e) => setNewPass({ ...newPass, phone: e.target.value })}
                  placeholder="+91 94361..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Purpose of Visit</label>
              <input
                type="text"
                value={newPass.purpose}
                onChange={(e) => setNewPass({ ...newPass, purpose: e.target.value })}
                placeholder="e.g. Fee clearance inquiry, meeting Class Master"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Meeting Staff Member</label>
                <input
                  type="text"
                  value={newPass.visitingWhom}
                  onChange={(e) => setNewPass({ ...newPass, visitingWhom: e.target.value })}
                  placeholder="e.g. Lalthlamuana Sailo"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Target Department</label>
                <select
                  value={newPass.visitingDepartment}
                  onChange={(e) => setNewPass({ ...newPass, visitingDepartment: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="Academic Secondary Faculty">Secondary Academic Faculty</option>
                  <option value="Principal Executive Office">Principal Executive Office</option>
                  <option value="Accounts & Finance Section">Accounts &amp; Finance Section</option>
                  <option value="Science Laboratories">Science Laboratories</option>
                  <option value="Boarding Hostel Administration">Hostel Administration</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Vehicle Number (Optional)</label>
                <input
                  type="text"
                  value={newPass.vehicleNo}
                  onChange={(e) => setNewPass({ ...newPass, vehicleNo: e.target.value })}
                  placeholder="e.g. MZ-01-N-4902"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">ID Proof Type Verified</label>
                <select
                  value={newPass.idProofType}
                  onChange={(e) => setNewPass({ ...newPass, idProofType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="Govt Service ID">Govt Service ID</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsPassModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
              >
                Generate &amp; Print Pass
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PRINT VISITOR BADGE MODAL */}
      {printPassTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white text-slate-900 rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setPrintPassTarget(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-600 hover:text-slate-950"
            >
              ✕
            </button>

            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">Mizoram High School</span>
              <h3 className="font-extrabold text-base font-['Outfit'] uppercase">Official Visitor Badge</h3>
              <p className="text-[11px] text-slate-500">Security Gate Control Pass</p>
            </div>

            <div className="flex justify-center py-2">
              <div className="p-3 bg-slate-50 border-2 border-slate-800 rounded-2xl shadow-inner">
                <QRCodeSVG
                  value={JSON.stringify({
                    passNo: printPassTarget.passNo,
                    visitor: printPassTarget.visitorName,
                    time: printPassTarget.entryTime,
                    host: printPassTarget.visitingWhom
                  })}
                  size={120}
                  level="H"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-xs border-y border-dashed border-slate-300 py-3 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Pass No:</span>
                <span className="font-bold text-slate-900">{printPassTarget.passNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Visitor:</span>
                <span className="font-bold text-slate-900 truncate max-w-[170px]">{printPassTarget.visitorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Host:</span>
                <span className="font-bold text-slate-900 truncate max-w-[170px]">{printPassTarget.visitingWhom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Entry Time:</span>
                <span className="font-bold text-slate-900">{printPassTarget.entryTime}</span>
              </div>
              {printPassTarget.vehicleNo && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle:</span>
                  <span className="font-bold text-slate-900">{printPassTarget.vehicleNo}</span>
                </div>
              )}
            </div>

            <p className="text-[10px] text-center text-slate-500 italic">
              Please wear this badge at all times. Return to Gate Security upon exiting.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Print Thermal Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
