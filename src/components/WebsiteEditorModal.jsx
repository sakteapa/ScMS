import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Edit3, 
  Sparkles, 
  Building2, 
  GraduationCap, 
  Image as ImageIcon, 
  Phone, 
  CheckCircle2, 
  RotateCcw, 
  Eye, 
  Layers,
  Plus,
  Trash2
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { INITIAL_WEBSITE_CONFIG } from '../data/mockData';

export default function WebsiteEditorModal({ isOpen, onClose, onViewWebsite }) {
  const { websiteConfig, updateWebsiteConfig } = useSchool();
  const [formData, setFormData] = useState(() => ({ ...(websiteConfig || INITIAL_WEBSITE_CONFIG) }));
  const [activeTab, setActiveTab] = useState('hero'); // 'hero' | 'principal' | 'programs' | 'facilities' | 'contact'
  const [saveToast, setSaveToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    updateWebsiteConfig(formData);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleResetToDefault = () => {
    if (window.confirm('School website hi default settings-ah restore i duh em?')) {
      setFormData(INITIAL_WEBSITE_CONFIG);
      updateWebsiteConfig(INITIAL_WEBSITE_CONFIG);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">Public Website CMS & Live Editor</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                  Admin & Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                School public website thu, thlalak, streams, principal address leh facilities duh dana customize-na.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/25 flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Save Toast Notification */}
        {saveToast && (
          <div className="px-6 py-2.5 bg-emerald-950/90 border-b border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Website content updated and published live successfully!</span>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="px-6 pt-3 flex items-center gap-2 border-b border-slate-800 bg-slate-950/60 overflow-x-auto scrollbar-thin">
          {[
            { id: 'hero', label: 'Hero & Identity', icon: Sparkles },
            { id: 'principal', label: "Principal's Welcome", icon: Building2 },
            { id: 'programs', label: 'Academic Streams (5)', icon: GraduationCap },
            { id: 'facilities', label: 'Campus Facilities (4)', icon: ImageIcon },
            { id: 'contact', label: 'Contact & Social Links', icon: Phone },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  isActive 
                    ? 'border-purple-500 text-white' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: HERO & IDENTITY */}
          {activeTab === 'hero' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">School Official Name</label>
                  <input
                    type="text"
                    value={formData.schoolName || ''}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">School Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline || ''}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Motto (Thuvawn)</label>
                  <input
                    type="text"
                    value={formData.motto || ''}
                    onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Affiliation Line</label>
                  <input
                    type="text"
                    value={formData.affiliationBadge || ''}
                    onChange={(e) => setFormData({ ...formData, affiliationBadge: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Top Banner Announcement Badge</label>
                  <input
                    type="text"
                    value={formData.hero?.badge || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      hero: { ...formData.hero, badge: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Hero Headline Title</label>
                  <input
                    type="text"
                    value={formData.hero?.headline || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      hero: { ...formData.hero, headline: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Hero Sub-headline Paragraph</label>
                  <textarea
                    rows={3}
                    value={formData.hero?.subheadline || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      hero: { ...formData.hero, subheadline: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Hero Background / Campus Photo URL</label>
                  <input
                    type="text"
                    value={formData.hero?.heroImage || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      hero: { ...formData.hero, heroImage: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* 4 Stats */}
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">4 Front-Page Key Counter Stats</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(formData.hero?.stats || []).map((stat, i) => (
                    <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                      <label className="block text-[10px] text-slate-400 uppercase font-semibold">Stat #{i + 1} Value</label>
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => {
                          const nextStats = [...formData.hero.stats];
                          nextStats[i] = { ...nextStats[i], value: e.target.value };
                          setFormData({ ...formData, hero: { ...formData.hero, stats: nextStats } });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                      />
                      <label className="block text-[10px] text-slate-400 uppercase font-semibold mt-1">Label</label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => {
                          const nextStats = [...formData.hero.stats];
                          nextStats[i] = { ...nextStats[i], label: e.target.value };
                          setFormData({ ...formData, hero: { ...formData.hero, stats: nextStats } });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRINCIPAL'S WELCOME */}
          {activeTab === 'principal' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Principal Full Name</label>
                  <input
                    type="text"
                    value={formData.principalMessage?.name || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      principalMessage: { ...formData.principalMessage, name: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Principal Designation</label>
                  <input
                    type="text"
                    value={formData.principalMessage?.designation || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      principalMessage: { ...formData.principalMessage, designation: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Principal Official Photo URL</label>
                  <input
                    type="text"
                    value={formData.principalMessage?.photoUrl || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      principalMessage: { ...formData.principalMessage, photoUrl: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Highlight Quote</label>
                  <input
                    type="text"
                    value={formData.principalMessage?.quote || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      principalMessage: { ...formData.principalMessage, quote: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Full Welcome Address</label>
                  <textarea
                    rows={4}
                    value={formData.principalMessage?.fullMessage || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      principalMessage: { ...formData.principalMessage, fullMessage: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-purple-500 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACADEMIC STREAMS */}
          {activeTab === 'programs' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                School-in academic stream leh course a chhawpchhuah hrang hrangte detail heta ṭang hian a thlak danglam theih e:
              </p>

              {(formData.programs || []).map((prog, index) => (
                <div key={prog.id || index} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Stream / Program Title</label>
                      <input
                        type="text"
                        value={prog.title}
                        onChange={(e) => {
                          const nextProgs = [...formData.programs];
                          nextProgs[index] = { ...nextProgs[index], title: e.target.value };
                          setFormData({ ...formData, programs: nextProgs });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Class Duration</label>
                      <input
                        type="text"
                        value={prog.duration}
                        onChange={(e) => {
                          const nextProgs = [...formData.programs];
                          nextProgs[index] = { ...nextProgs[index], duration: e.target.value };
                          setFormData({ ...formData, programs: nextProgs });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Affiliation Badge</label>
                      <input
                        type="text"
                        value={prog.badge}
                        onChange={(e) => {
                          const nextProgs = [...formData.programs];
                          nextProgs[index] = { ...nextProgs[index], badge: e.target.value };
                          setFormData({ ...formData, programs: nextProgs });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Description & Subjects Offered</label>
                    <textarea
                      rows={2}
                      value={prog.description}
                      onChange={(e) => {
                        const nextProgs = [...formData.programs];
                        nextProgs[index] = { ...nextProgs[index], description: e.target.value };
                        setFormData({ ...formData, programs: nextProgs });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-300 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: CAMPUS FACILITIES */}
          {activeTab === 'facilities' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Campus laboratory, library, hostel leh sports facility thlalak leh description-te:
              </p>

              {(formData.facilities || []).map((fac, index) => (
                <div key={index} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Facility Title</label>
                      <input
                        type="text"
                        value={fac.title}
                        onChange={(e) => {
                          const nextFacs = [...formData.facilities];
                          nextFacs[index] = { ...nextFacs[index], title: e.target.value };
                          setFormData({ ...formData, facilities: nextFacs });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Image URL</label>
                      <input
                        type="text"
                        value={fac.image}
                        onChange={(e) => {
                          const nextFacs = [...formData.facilities];
                          nextFacs[index] = { ...nextFacs[index], image: e.target.value };
                          setFormData({ ...formData, facilities: nextFacs });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Facility Description</label>
                    <textarea
                      rows={2}
                      value={fac.description}
                      onChange={(e) => {
                        const nextFacs = [...formData.facilities];
                        nextFacs[index] = { ...nextFacs[index], description: e.target.value };
                        setFormData({ ...formData, facilities: nextFacs });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-300 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: CONTACT & SOCIAL LINKS */}
          {activeTab === 'contact' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Campus Physical Address</label>
                  <input
                    type="text"
                    value={formData.contact?.address || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, address: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Enquiry Phone Numbers</label>
                  <input
                    type="text"
                    value={formData.contact?.phone || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, phone: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Official Admission Email</label>
                  <input
                    type="email"
                    value={formData.contact?.email || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, email: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Office Visiting Hours</label>
                  <input
                    type="text"
                    value={formData.contact?.officeHours || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, officeHours: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Facebook Page URL</label>
                  <input
                    type="text"
                    value={formData.socialLinks?.facebook || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">YouTube Channel URL</label>
                  <input
                    type="text"
                    value={formData.socialLinks?.youtube || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Instagram Profile URL</label>
                  <input
                    type="text"
                    value={formData.socialLinks?.instagram || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">WhatsApp Official Chat Link</label>
                  <input
                    type="text"
                    value={formData.socialLinks?.whatsapp || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, whatsapp: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefault}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {onViewWebsite && (
              <button
                onClick={() => {
                  onClose();
                  onViewWebsite();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5 text-purple-400" />
                <span>View Public Website</span>
              </button>
            )}

            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/25 flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Live</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
