import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  Clock, 
  Smartphone, 
  GraduationCap, 
  CreditCard, 
  Sparkles,
  Save,
  ChevronDown
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

const RULE_CATEGORIES = [
  { id: 'all', label: 'All Regulations', icon: ShieldCheck },
  { id: 'campus', label: 'Campus & Timings', icon: Clock },
  { id: 'uniform', label: 'Uniform & Grooming', icon: Sparkles },
  { id: 'attendance', label: '75% Attendance', icon: CheckCircle2 },
  { id: 'behavior', label: 'Decorum & Anti-Ragging', icon: AlertTriangle },
  { id: 'gadgets', label: 'Gadget & Mobile Ban', icon: Smartphone },
  { id: 'exam', label: 'Exam Integrity', icon: GraduationCap },
  { id: 'fees', label: 'Fee Clearance', icon: CreditCard },
];

export default function SchoolRulesModal({ isOpen, onClose, initialCategory = 'all' }) {
  const { 
    schoolRules = [], 
    addSchoolRule, 
    updateSchoolRule, 
    deleteSchoolRule, 
    resetSchoolRules, 
    activeSchoolInfo 
  } = useSchool();
  const { currentUser, isPrincipal } = useAuth();

  const isAuthorizedToEdit = currentUser?.role === 'superadmin' || isPrincipal || currentUser?.role === 'admin';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState('');

  // Form state for new rule
  const [newRule, setNewRule] = useState({
    title: '',
    category: 'campus',
    categoryLabel: 'Campus Discipline & Timings',
    description: '',
    penalty: 'Verbal warning & written counseling notice',
    applicableTo: 'All Students & Day Scholars'
  });

  // Form state for editing rule
  const [editFormData, setEditFormData] = useState({});

  if (!isOpen) return null;

  const triggerToast = (msg) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 3000);
  };

  const filteredRules = schoolRules.filter(rule => {
    const matchesCategory = activeCategory === 'all' || rule.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      rule.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.penalty?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleStartEdit = (rule) => {
    setEditingId(rule.id);
    setEditFormData({ ...rule });
  };

  const handleSaveEdit = (ruleId) => {
    if (!editFormData.title?.trim()) {
      alert('Dan/Rule hming (title) hi a ruak thei lo.');
      return;
    }
    updateSchoolRule(ruleId, editFormData);
    setEditingId(null);
    triggerToast('Dan (Rule) hi hlawhtling takin update a ni!');
  };

  const handleAddNew = (e) => {
    e.preventDefault();
    if (!newRule.title?.trim()) {
      alert('Khawngaihin dan/rule hming ziak rawh le.');
      return;
    }

    const catObj = RULE_CATEGORIES.find(c => c.id === newRule.category);
    addSchoolRule({
      ...newRule,
      categoryLabel: catObj ? catObj.label : 'Campus Discipline'
    });

    setNewRule({
      title: '',
      category: 'campus',
      categoryLabel: 'Campus Discipline & Timings',
      description: '',
      penalty: 'Verbal warning & written counseling notice',
      applicableTo: 'All Students & Day Scholars'
    });
    setIsAdding(false);
    triggerToast('Dan thar (New Rule) hi hlawhtling takin dah luh a ni!');
  };

  const handleDelete = (ruleId, title) => {
    if (window.confirm(`Dan "${title}" hi paih/delete i chiang em?`)) {
      deleteSchoolRule(ruleId);
      triggerToast('Dan hi delete a ni tawh e.');
    }
  };

  const handleReset = () => {
    if (window.confirm('School Dan & Hrai zawng zawng hi standard default settings-ah reset i duh em?')) {
      resetSchoolRules();
      triggerToast('Dan zawng zawng default standard-ah reset vek a ni!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">Institutional Rules &amp; Code of Conduct</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {activeSchoolInfo?.name || 'School Code of Conduct'}
                </span>
                {isAuthorizedToEdit && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                    Admin Editor Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official student handbook, campus discipline, uniform code, and statutory compliance regulations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Print Handbook */}
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition flex items-center gap-1.5"
              title="Print Student Handbook (A4 PDF)"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Print Handbook</span>
            </button>

            {/* Admin Add Rule Button */}
            {isAuthorizedToEdit && !isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-600/20 flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Rule</span>
              </button>
            )}

            {/* Admin Reset to Defaults */}
            {isAuthorizedToEdit && (
              <button
                onClick={handleReset}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition"
                title="Reset Rules to Default Standard"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackToast && (
          <div className="px-6 py-2.5 bg-emerald-950/90 border-b border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Search & Category Filter Toolbar */}
        <div className="p-4 sm:px-6 bg-slate-950/80 border-b border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rules by keyword (e.g., mobile, uniform, exam, ragging, 75%)..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="text-xs text-slate-400 shrink-0 font-medium self-center">
              Total Regulations: <span className="font-bold text-amber-400">{filteredRules.length}</span> of {schoolRules.length}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {RULE_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;
              const count = cat.id === 'all' 
                ? schoolRules.length 
                : schoolRules.filter(r => r.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Add New Rule Drawer / Card */}
          {isAdding && isAuthorizedToEdit && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/40 shadow-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Add New Institutional Regulation</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddNew} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                      Rule Title / Hming <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newRule.title}
                      onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                      placeholder="e.g. Clean Campus & Zero Tobacco Protocol"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                      Category
                    </label>
                    <select
                      value={newRule.category}
                      onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      {RULE_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                      Full Description &amp; Code Directive
                    </label>
                    <textarea
                      rows={3}
                      value={newRule.description}
                      onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                      placeholder="Dan nihna, ti loh tur te, leh zirlaite hriat tur tlangpui fel takin ziah tur..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-xs leading-relaxed focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                      Prescribed Penalty / Hremna &amp; Action
                    </label>
                    <input
                      type="text"
                      value={newRule.penalty}
                      onChange={(e) => setNewRule({ ...newRule, penalty: e.target.value })}
                      placeholder="e.g. Warning slip, detention, parent summons, expulsion"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-amber-300 text-xs focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                      Applicable To
                    </label>
                    <input
                      type="text"
                      value={newRule.applicableTo}
                      onChange={(e) => setNewRule({ ...newRule, applicableTo: e.target.value })}
                      placeholder="e.g. All Students, Hostellers, High School"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-300 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-600/30 flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save &amp; Publish Rule</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of Rules */}
          {filteredRules.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700 mx-auto flex items-center justify-center text-slate-500">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-300">No regulations match your filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Khawngaihin search keyword thlak rawh le emaw "All Regulations" tab thlang rawh le.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRules.map((rule, index) => {
                const isEditing = editingId === rule.id;

                if (isEditing) {
                  return (
                    <div key={rule.id} className="p-4 rounded-2xl bg-slate-950 border border-amber-500/50 shadow-lg space-y-3 md:col-span-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-xs font-bold text-amber-400">Editing Regulation</span>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1 rounded text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Rule Title</label>
                          <input
                            type="text"
                            value={editFormData.title || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Category</label>
                          <select
                            value={editFormData.category || 'campus'}
                            onChange={(e) => {
                              const cObj = RULE_CATEGORIES.find(c => c.id === e.target.value);
                              setEditFormData({ 
                                ...editFormData, 
                                category: e.target.value,
                                categoryLabel: cObj?.label || 'Campus Discipline'
                              });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500"
                          >
                            {RULE_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Description</label>
                          <textarea
                            rows={3}
                            value={editFormData.description || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white text-xs leading-relaxed focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Prescribed Penalty</label>
                          <input
                            type="text"
                            value={editFormData.penalty || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, penalty: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-amber-300 text-xs font-medium focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Applicable Scope</label>
                          <input
                            type="text"
                            value={editFormData.applicableTo || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, applicableTo: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(rule.id)}
                          className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Update Rule</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div 
                    key={rule.id}
                    className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-[11px] font-bold shrink-0">
                            {index + 1}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-800 uppercase tracking-wider">
                            {rule.categoryLabel || rule.category}
                          </span>
                        </div>

                        {/* Admin Action Buttons */}
                        {isAuthorizedToEdit && (
                          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition">
                            <button
                              onClick={() => handleStartEdit(rule)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition"
                              title="Edit Rule"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(rule.id, rule.title)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                              title="Delete Rule"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white group-hover:text-amber-200 transition">
                        {rule.title}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {rule.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 space-y-2">
                      {rule.penalty && (
                        <div className="flex items-start gap-2 p-2 rounded-xl bg-amber-950/30 border border-amber-900/40 text-amber-300/90 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-300 uppercase text-[10px] mr-1">Penalty:</span>
                            <span>{rule.penalty}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Scope: <strong className="text-slate-400 font-medium">{rule.applicableTo || 'All Students'}</strong></span>
                        <span className="font-mono text-[10px]">ID: {rule.id}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-4 sm:px-6 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              All students, guardians, and faculty are bound by the regulations of <strong className="text-white">{activeSchoolInfo?.name || 'the Institution'}</strong>.
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Close Handbook
          </button>
        </div>
      </div>
    </div>
  );
}
