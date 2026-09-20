import React, { useState } from 'react';
import { 
  Package, 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Save, 
  Tag, 
  DollarSign, 
  Cpu, 
  FlaskConical, 
  Dumbbell, 
  Armchair,
  Check,
  FileText
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export default function InventoryView() {
  const { 
    inventoryAssets, 
    maintenanceTickets, 
    inventoryConfig, 
    addInventoryAsset, 
    updateInventoryAsset, 
    createMaintenanceTicket, 
    updateMaintenanceTicket, 
    updateInventoryConfig 
  } = useSchool();
  const { currentUser, isPrincipal, isSuperAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('assets'); // 'assets' | 'tickets' | 'config'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [toast, setToast] = useState(null);

  // New Asset Modal
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '',
    category: 'Physics & Biology Lab',
    quantity: 1,
    unit: 'Units',
    condition: 'good',
    location: '',
    costPerUnit: 5000,
    warrantyExpiry: '2027-12-31'
  });

  // New Ticket Modal
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    assetCode: '',
    assetName: '',
    issue: '',
    reportedBy: currentUser?.displayName || 'Faculty Member',
    priority: 'medium',
    estimatedCost: 500
  });

  // Config Draft
  const [configDraft, setConfigDraft] = useState(inventoryConfig || {});

  const filteredAssets = inventoryAssets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddAssetSubmit = (e) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.location) {
      alert('Khawngaihin bungraw hming leh awmna room ziah a ngai.');
      return;
    }

    addInventoryAsset(newAsset);
    setIsAssetModalOpen(false);
    setNewAsset({
      name: '',
      category: 'Physics & Biology Lab',
      quantity: 1,
      unit: 'Units',
      condition: 'good',
      location: '',
      costPerUnit: 5000,
      warrantyExpiry: '2027-12-31'
    });

    setToast('New campus asset added to institutional inventory!');
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddTicketSubmit = (e) => {
    e.preventDefault();
    if (!newTicket.issue || !newTicket.assetName) {
      alert('Khawngaihin chhiat dan leh bungraw hming ziah a ngai.');
      return;
    }

    createMaintenanceTicket(newTicket);
    setIsTicketModalOpen(false);
    setNewTicket({
      assetCode: '',
      assetName: '',
      issue: '',
      reportedBy: currentUser?.displayName || 'Faculty Member',
      priority: 'medium',
      estimatedCost: 500
    });

    setToast('Maintenance & repair ticket registered!');
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    updateInventoryConfig(configDraft);
    setToast('Inventory & Asset settings updated successfully!');
    setTimeout(() => setToast(null), 3000);
  };

  const totalAssetValue = inventoryAssets.reduce((sum, a) => sum + (a.costPerUnit * a.quantity), 0);
  const openTicketsCount = maintenanceTickets.filter(t => t.status !== 'resolved').length;

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
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/40 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-lg">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
                Campus Inventory &amp; Science Lab Assets
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                ESTATE &amp; LABS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Custodian: <strong className="text-white">{inventoryConfig?.custodianName || 'Pu T. Vanlalruata'}</strong> • Preferred Supplier: {inventoryConfig?.preferredSupplier || 'Mizoram Scientific Supplies'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsTicketModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs shadow transition flex items-center gap-1.5"
          >
            <Wrench className="w-4 h-4" />
            <span>Report Repair / Damage</span>
          </button>

          <button
            onClick={() => setIsAssetModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Asset</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Total Asset Items</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              {inventoryAssets.length} SKUs
            </span>
            <Package className="w-4 h-4 text-slate-500" />
          </div>
          <span className="text-[10px] text-slate-500">Across 5 departments</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Total Estimated Valuation</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">
              ₹{(totalAssetValue / 100000).toFixed(2)}L
            </span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] text-slate-500">Campus asset net book value</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Open Maintenance Tickets</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-400 font-mono">
              {openTicketsCount}
            </span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-[10px] text-slate-500">Repairs requiring attention</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Asset Audit Health</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-cyan-400 font-mono">
              96% Good
            </span>
            <CheckCircle2 className="w-4 h-4 text-slate-500" />
          </div>
          <span className="text-[10px] text-slate-500">Operational condition</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'assets' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Asset Inventory Catalogue</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'tickets' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Maintenance &amp; Damage Tickets ({openTicketsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'config' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Inventory Settings</span>
        </button>
      </div>

      {/* TAB 1: ASSETS */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search asset code, name, location..."
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="All">All Categories</option>
                <option value="Physics & Biology Lab">Physics &amp; Biology Lab</option>
                <option value="Chemistry Lab">Chemistry Lab</option>
                <option value="Computer & AI Lab">Computer &amp; AI Lab</option>
                <option value="Sports & Athletics">Sports &amp; Athletics</option>
                <option value="Classroom Furniture">Classroom Furniture</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssets.length === 0 ? (
              <div className="md:col-span-2 p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-3xl">
                No inventory assets found matching your filter criteria.
              </div>
            ) : (
              filteredAssets.map((a) => (
                <div key={a.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm font-['Outfit']">{a.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                          {a.code}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {a.category} • Location: <strong className="text-slate-300">{a.location}</strong>
                      </span>
                    </div>

                    <span className="text-xs px-2.5 py-1 rounded-xl bg-slate-800 font-mono font-bold text-cyan-300">
                      {a.quantity} {a.unit}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-2.5 rounded-xl text-xs font-mono border border-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[10px]">UNIT COST</span>
                      <span className="text-white font-bold">₹{a.costPerUnit.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">TOTAL VALUE</span>
                      <span className="text-emerald-400 font-bold">₹{(a.costPerUnit * a.quantity).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">WARRANTY</span>
                      <span className="text-slate-300 truncate block">{a.warrantyExpiry || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[11px] text-slate-500 font-mono">
                      Last Audit: {a.lastInspected}
                    </span>

                    <button
                      onClick={() => {
                        setNewTicket({
                          assetCode: a.code,
                          assetName: a.name,
                          issue: '',
                          reportedBy: currentUser?.displayName || 'Faculty Member',
                          priority: 'medium',
                          estimatedCost: 500
                        });
                        setIsTicketModalOpen(true);
                      }}
                      className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition flex items-center gap-1"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Report Damage</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MAINTENANCE TICKETS */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {maintenanceTickets.length === 0 ? (
              <div className="md:col-span-2 p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-3xl">
                No active maintenance or damage tickets recorded.
              </div>
            ) : (
              maintenanceTickets.map((t) => (
                <div key={t.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm font-['Outfit']">{t.assetName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono">
                          {t.assetCode}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        Reported by: {t.reportedBy} on {t.createdAt}
                      </span>
                    </div>

                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      t.status === 'open' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                      t.status === 'in_progress' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <p className="text-slate-200"><strong>Issue:</strong> {t.issue}</p>
                    <p className="text-emerald-400 font-mono">
                      Estimated Repair Cost: <strong>₹{t.estimatedCost}</strong>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      t.priority === 'high' ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      Priority: {t.priority}
                    </span>

                    <div className="flex items-center gap-2">
                      {t.status !== 'resolved' && (
                        <button
                          onClick={() => {
                            updateMaintenanceTicket(t.id, 'resolved', 'Repaired and verified operational.');
                            setToast(`Ticket for ${t.assetName} marked resolved.`);
                            setTimeout(() => setToast(null), 2500);
                          }}
                          className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Fixed</span>
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

      {/* TAB 3: CONFIGURATION */}
      {activeTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm font-['Outfit']">Campus Inventory &amp; Asset Configuration</h3>
              <p className="text-xs text-slate-400">Custodian authority, stock alerts, depreciation, and supplier settings.</p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Inventory Settings</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Campus Estate &amp; Lab Custodian</label>
              <input
                type="text"
                value={configDraft.custodianName || ''}
                onChange={(e) => setConfigDraft({ ...configDraft, custodianName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Preferred Equipment Supplier</label>
              <input
                type="text"
                value={configDraft.preferredSupplier || ''}
                onChange={(e) => setConfigDraft({ ...configDraft, preferredSupplier: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Low Stock Alert Threshold (Units)</label>
              <input
                type="number"
                value={configDraft.lowStockThreshold || 3}
                onChange={(e) => setConfigDraft({ ...configDraft, lowStockThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Annual Depreciation Rate (%)</label>
              <input
                type="number"
                value={configDraft.depreciationRatePercent || 10}
                onChange={(e) => setConfigDraft({ ...configDraft, depreciationRatePercent: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Repair Cost Approval Threshold (₹)</label>
              <input
                type="number"
                value={configDraft.approvalThresholdAmount || 5000}
                onChange={(e) => setConfigDraft({ ...configDraft, approvalThresholdAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Physical Stock Audit Cycle (Months)</label>
              <input
                type="number"
                value={configDraft.auditCycleMonths || 6}
                onChange={(e) => setConfigDraft({ ...configDraft, auditCycleMonths: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>
        </form>
      )}

      {/* ADD ASSET MODAL */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleAddAssetSubmit} className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base font-['Outfit']">Add New Institutional Asset</h3>
              <button type="button" onClick={() => setIsAssetModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Asset / Equipment Name</label>
              <input
                type="text"
                value={newAsset.name}
                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                placeholder="e.g. Digital Spectrophotometer, Football Sets"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Category</label>
                <select
                  value={newAsset.category}
                  onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="Physics & Biology Lab">Physics &amp; Biology Lab</option>
                  <option value="Chemistry Lab">Chemistry Lab</option>
                  <option value="Computer & AI Lab">Computer &amp; AI Lab</option>
                  <option value="Sports & Athletics">Sports &amp; Athletics</option>
                  <option value="Classroom Furniture">Classroom Furniture</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Location / Room Number</label>
                <input
                  type="text"
                  value={newAsset.location}
                  onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                  placeholder="e.g. Science Lab 204, IT Lab A"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Quantity</label>
                <input
                  type="number"
                  value={newAsset.quantity}
                  onChange={(e) => setNewAsset({ ...newAsset, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  min="1"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Unit Type</label>
                <input
                  type="text"
                  value={newAsset.unit}
                  onChange={(e) => setNewAsset({ ...newAsset, unit: e.target.value })}
                  placeholder="Units, Sets, Workstations"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Cost per Unit (₹)</label>
                <input
                  type="number"
                  value={newAsset.costPerUnit}
                  onChange={(e) => setNewAsset({ ...newAsset, costPerUnit: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAssetModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
              >
                Add Asset to Catalogue
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REPORT DAMAGE / REPAIR TICKET MODAL */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleAddTicketSubmit} className="w-full max-w-md bg-slate-900 border border-amber-500/50 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base font-['Outfit']">Report Damage &amp; Request Repair</h3>
              <button type="button" onClick={() => setIsTicketModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Select Asset to Repair</label>
              <select
                value={newTicket.assetCode}
                onChange={(e) => {
                  const sel = inventoryAssets.find(a => a.code === e.target.value);
                  setNewTicket({
                    ...newTicket,
                    assetCode: e.target.value,
                    assetName: sel ? sel.name : ''
                  });
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                required
              >
                <option value="">-- Choose Asset --</option>
                {inventoryAssets.map(a => (
                  <option key={a.id} value={a.code}>
                    {a.name} ({a.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Issue Description / Defect</label>
              <textarea
                value={newTicket.issue}
                onChange={(e) => setNewTicket({ ...newTicket, issue: e.target.value })}
                rows={3}
                placeholder="Describe the malfunction, broken part, or maintenance needed..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Priority</label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Urgent)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Est. Repair Cost (₹)</label>
                <input
                  type="number"
                  value={newTicket.estimatedCost}
                  onChange={(e) => setNewTicket({ ...newTicket, estimatedCost: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsTicketModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                Submit Repair Ticket
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
