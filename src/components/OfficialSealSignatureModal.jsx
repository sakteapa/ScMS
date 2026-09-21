import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  Award, 
  PenTool, 
  Sliders, 
  Check, 
  X, 
  Trash2, 
  Upload, 
  Sparkles, 
  FileCheck,
  Eye
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';

export default function OfficialSealSignatureModal({ isOpen, onClose }) {
  const { sealConfig, updateSealConfig } = useSchool();
  const [formData, setFormData] = useState({ ...sealConfig });
  const [activeTab, setActiveTab] = useState('seal'); // 'seal' | 'signature' | 'preview'
  const [toast, setToast] = useState(null);

  // Canvas ref for drawing signature
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (sealConfig) {
      setFormData({ ...sealConfig });
    }
  }, [sealConfig, isOpen]);

  // Canvas drawing handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0]?.clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0]?.clientY)) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0]?.clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0]?.clientY)) - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#1e3a8a'; // Dark Executive Navy Blue ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current) {
      setIsDrawing(false);
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setFormData(prev => ({ ...prev, signatureSvgData: dataUrl, signatureMode: 'drawn' }));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFormData(prev => ({ ...prev, signatureSvgData: '' }));
  };

  const handleSave = () => {
    updateSealConfig(formData);
    setToast('Official Seal & Signature settings saved successfully!');
    setTimeout(() => {
      setToast(null);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0b111e] border border-amber-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                <span>Official School Seal &amp; Principal Signature</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Institutional Crest
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Governance credentials stamped on Transfer Certificates, Report Cards &amp; Diplomas.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950">
          <button
            onClick={() => setActiveTab('seal')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'seal'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>School Crest &amp; Seal</span>
          </button>
          <button
            onClick={() => setActiveTab('signature')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'signature'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Principal Signature Pad</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'preview'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Live Document Stamp Preview</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {toast && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{toast}</span>
            </div>
          )}

          {activeTab === 'seal' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  School Crest Circumferential Text *
                </label>
                <input
                  type="text"
                  value={formData.schoolCrestText}
                  onChange={(e) => setFormData({ ...formData, schoolCrestText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    State Board Affiliation Number *
                  </label>
                  <input
                    type="text"
                    value={formData.affiliationNumber}
                    onChange={(e) => setFormData({ ...formData, affiliationNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Motto Banner Text
                  </label>
                  <input
                    type="text"
                    value={formData.mottoText}
                    onChange={(e) => setFormData({ ...formData, mottoText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Seal Color Theme
                  </label>
                  <select
                    value={formData.sealColor}
                    onChange={(e) => setFormData({ ...formData, sealColor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="#d97706">🏆 Imperial Gold (#d97706)</option>
                    <option value="#1e3a8a">🏛️ Royal Navy Blue (#1e3a8a)</option>
                    <option value="#047857">🌿 Emerald Green (#047857)</option>
                    <option value="#be123c">🔴 Burgundy Red (#be123c)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Emboss Style
                  </label>
                  <select
                    value={formData.sealType}
                    onChange={(e) => setFormData({ ...formData, sealType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="circular_crest">Circular Double Ring Crest</option>
                    <option value="golden_emboss">Wax Embossed Stamp</option>
                    <option value="modern_monogram">Modern Institutional Monogram</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Date Stamp Format
                  </label>
                  <input
                    type="text"
                    value={formData.dateStampFormat}
                    onChange={(e) => setFormData({ ...formData, dateStampFormat: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h5 className="font-bold text-slate-200">Official Document Placement Rules</h5>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showSealOnTC}
                      onChange={(e) => setFormData({ ...formData, showSealOnTC: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-800 border-slate-700"
                    />
                    <span className="text-slate-300">Stamp on MBSE TC</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showSealOnReportCard}
                      onChange={(e) => setFormData({ ...formData, showSealOnReportCard: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-800 border-slate-700"
                    />
                    <span className="text-slate-300">Stamp on Report Cards</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showSealOnCertificates}
                      onChange={(e) => setFormData({ ...formData, showSealOnCertificates: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-800 border-slate-700"
                    />
                    <span className="text-slate-300">Stamp on Certificates</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'signature' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Signatory Executive Name *
                  </label>
                  <input
                    type="text"
                    value={formData.principalSignatoryName}
                    onChange={(e) => setFormData({ ...formData, principalSignatoryName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Official Executive Designation *
                  </label>
                  <input
                    type="text"
                    value={formData.principalDesignation}
                    onChange={(e) => setFormData({ ...formData, principalDesignation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Signature Inking Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, signatureMode: 'calligraphic' })}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition ${
                      formData.signatureMode === 'calligraphic'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Formal Calligraphic Font</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, signatureMode: 'drawn' })}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition ${
                      formData.signatureMode === 'drawn'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Draw Signature on Canvas</span>
                  </button>
                </div>
              </div>

              {formData.signatureMode === 'drawn' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-semibold">Sign inside the signature box below (Mouse or Touchpad)</span>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold text-[11px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Signature</span>
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-slate-700 rounded-2xl bg-white p-2 overflow-hidden cursor-crosshair">
                    <canvas
                      ref={canvasRef}
                      width={520}
                      height={140}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-32 block bg-white"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Hand-drawn digital signature will be vectorized and applied directly over the official seal.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-slate-400 block text-[11px]">Cursive Typography Preview:</span>
                  <div className="p-4 rounded-xl bg-white text-blue-900 text-center shadow-inner">
                    <p className="font-serif italic text-2xl font-bold tracking-wider" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                      {formData.principalSignatoryName}
                    </p>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block mt-1">
                      {formData.principalDesignation}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="p-6 rounded-2xl bg-white text-slate-900 space-y-6 shadow-xl border border-slate-300">
              <div className="text-center border-b pb-4">
                <span className="text-[10px] uppercase font-bold text-amber-700 tracking-widest block">
                  GOVERNMENT OF MIZORAM • SCHOOL EDUCATION
                </span>
                <h4 className="text-base font-extrabold tracking-wide uppercase font-serif text-slate-950 mt-1">
                  {formData.schoolCrestText || 'OHA • ONE HEART ACADEMY • LUNGLAWN, LUNGLEI'}
                </h4>
                <p className="text-[11px] text-slate-600 font-mono">
                  {formData.affiliationNumber}
                </p>
              </div>

              {/* Seal & Signature Joint Stamp Showcase */}
              <div className="p-6 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row items-center justify-around gap-6">
                {/* Circular Emblem Stamp */}
                <div 
                  className="w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center p-2 text-center shadow-sm relative shrink-0"
                  style={{ borderColor: formData.sealColor, color: formData.sealColor }}
                >
                  <div className="w-28 h-28 rounded-full border border-dashed flex flex-col items-center justify-center p-1" style={{ borderColor: formData.sealColor }}>
                    <ShieldCheck className="w-6 h-6 mb-0.5" />
                    <span className="text-[7.5px] font-black uppercase tracking-tight leading-tight block">
                      {formData.schoolCrestText.split('•')[0]}
                    </span>
                    <span className="text-[6.5px] font-bold block opacity-80 mt-0.5 font-serif italic">
                      {formData.mottoText}
                    </span>
                    <span className="text-[7px] font-mono mt-0.5 font-bold">ESTD {formData.establishedYear}</span>
                  </div>
                </div>

                {/* Signature Block */}
                <div className="text-center space-y-1">
                  <div className="h-14 flex items-end justify-center">
                    {formData.signatureMode === 'drawn' && formData.signatureSvgData ? (
                      <img src={formData.signatureSvgData} alt="Signature" className="max-h-12 max-w-[180px] object-contain" />
                    ) : (
                      <p className="font-serif italic text-2xl font-bold text-blue-900 tracking-wider" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                        {formData.principalSignatoryName}
                      </p>
                    )}
                  </div>
                  <div className="w-48 border-t border-slate-800 mx-auto"></div>
                  <strong className="text-xs text-slate-950 font-bold block font-serif">
                    ({formData.principalSignatoryName})
                  </strong>
                  <span className="text-[10px] text-slate-600 block">
                    {formData.principalDesignation}
                  </span>
                  <span className="text-[9px] text-amber-700 font-semibold block font-mono">
                    Digitally Sealed • {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Changes will be reflected immediately across TC, Marksheets &amp; Diplomas.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply Official Seal &amp; Signature</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
