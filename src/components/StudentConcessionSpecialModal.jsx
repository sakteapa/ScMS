import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Percent, 
  ShieldCheck, 
  Sparkles, 
  Crown, 
  Check, 
  AlertCircle, 
  HeartHandshake, 
  FileText,
  DollarSign
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export default function StudentConcessionSpecialModal({
  isOpen,
  onClose,
  targetStudent,
  initialTab = 'concession' // 'concession' | 'special_category'
}) {
  const { 
    students, 
    updateStudentFeeConcession, 
    toggleSpecialStudentCategory,
    siblingPolicy
  } = useSchool();
  const { isPrincipal, isVicePrincipal, isSuperAdmin, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [concessionType, setConcessionType] = useState('sibling');
  const [discountPercent, setDiscountPercent] = useState(15);
  const [customDiscountAmount, setCustomDiscountAmount] = useState(0);
  const [concessionReason, setConcessionReason] = useState('');
  
  // Special category states
  const [isSpecial, setIsSpecial] = useState(false);
  const [specialNotes, setSpecialNotes] = useState('');
  const [specialWaiverPercent, setSpecialWaiverPercent] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (targetStudent) {
      setActiveTab(initialTab);
      const existingConcession = targetStudent.feeConcession;
      if (existingConcession) {
        setConcessionType(existingConcession.concessionType || 'sibling');
        setDiscountPercent(existingConcession.discountPercent || 15);
        setCustomDiscountAmount(existingConcession.discountAmount || 0);
        setConcessionReason(existingConcession.reason || '');
      } else {
        setConcessionType('sibling');
        setDiscountPercent(15);
        setCustomDiscountAmount(0);
        setConcessionReason('');
      }

      setIsSpecial(!!targetStudent.isSpecialCategory);
      if (targetStudent.specialCategoryData) {
        setSpecialNotes(targetStudent.specialCategoryData.specialCategoryNotes || '');
        setSpecialWaiverPercent(targetStudent.specialCategoryData.discretionaryFeeWaiverPercent || 0);
      } else {
        setSpecialNotes('');
        setSpecialWaiverPercent(0);
      }
      setToastMessage(null);
    }
  }, [targetStudent, isOpen, initialTab]);

  if (!isOpen || !targetStudent) return null;

  // Authorities
  const canManageConcession = isPrincipal || isVicePrincipal || isSuperAdmin;
  const canManageSpecial = isPrincipal || isSuperAdmin; // Principal executive discretion

  const approverDesignation = isPrincipal 
    ? 'Principal (Dr. Lalthanzuala)' 
    : isVicePrincipal 
    ? 'Vice Principal (Dr. C. Lalremruata)' 
    : (currentUser?.displayName || 'Executive Administration');

  // Detect siblings (match by guardian phone or parent name)
  const cleanPhone = (targetStudent.guardianPhone || '').replace(/\s+/g, '');
  const cleanName = (targetStudent.guardianName || '').toLowerCase().trim();
  const enrolledSiblings = students.filter(s => {
    if (s.id === targetStudent.id) return false;
    const sPhone = (s.guardianPhone || '').replace(/\s+/g, '');
    const sName = (s.guardianName || '').toLowerCase().trim();
    return (cleanPhone && sPhone && cleanPhone === sPhone) || (cleanName && sName && cleanName === sName);
  });

  const siblingOrder = enrolledSiblings.length + 1;
  const recommendedSiblingDiscount = siblingOrder === 2 
    ? siblingPolicy.secondChildDiscount 
    : siblingOrder >= 3 
    ? siblingPolicy.thirdChildDiscount 
    : 0;

  const baseFees = targetStudent.baseTotalFees || targetStudent.totalFees || 36000;

  // Save Sibling / Fee Concession
  const handleSaveConcession = (e) => {
    e.preventDefault();
    if (!canManageConcession) return;

    updateStudentFeeConcession(targetStudent.id, {
      concessionType,
      discountPercent: Number(discountPercent),
      customDiscountAmount: Number(customDiscountAmount),
      reason: concessionReason || (concessionType === 'sibling' ? `Sibling concession (${enrolledSiblings.length} sibling(s) enrolled)` : 'Administrative concession'),
      approvedBy: approverDesignation
    });

    setToastMessage('Fee concession successfully saved and applied to fee ledger!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Save Special Category (Principal Discretion)
  const handleSaveSpecial = (e) => {
    e.preventDefault();
    if (!canManageSpecial) return;

    toggleSpecialStudentCategory(targetStudent.id, {
      isSpecial,
      specialCategoryNotes: specialNotes,
      discretionaryFeeWaiverPercent: Number(specialWaiverPercent),
      approvedBy: approverDesignation
    });

    setToastMessage(isSpecial ? 'Student placed under Principal Special Category with executive protection!' : 'Special category designation removed.');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              {activeTab === 'concession' ? <Percent className="w-5 h-5" /> : <Crown className="w-5 h-5 text-amber-400" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                <span>{targetStudent.firstName} {targetStudent.lastName}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300">
                  {targetStudent.admissionNo}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Class: {targetStudent.classId} • Guardian: {targetStudent.guardianName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('concession')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'concession'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Sibling &amp; Fee Concession</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('special_category')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'special_category'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Principal Special Category</span>
          </button>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold text-center flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* TAB 1: SIBLING & FEE CONCESSION */}
        {activeTab === 'concession' && (
          <form onSubmit={handleSaveConcession} className="space-y-4 text-xs">
            {/* Sibling Detection Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Family Enrolment Linkage</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                  {enrolledSiblings.length > 0 ? `${enrolledSiblings.length} Sibling(s) Found` : 'No Siblings Detected'}
                </span>
              </div>

              {enrolledSiblings.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] text-slate-300">
                    Enrolled siblings under guardian <strong className="text-white">{targetStudent.guardianName}</strong>:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {enrolledSiblings.map(sib => (
                      <div key={sib.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-white block">{sib.firstName} {sib.lastName}</span>
                          <span className="text-[10px] text-slate-400">{sib.classId}</span>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-400">{sib.admissionNo}</span>
                      </div>
                    ))}
                  </div>
                  {recommendedSiblingDiscount > 0 && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px]">
                      <span>Policy recommendation (Child #{siblingOrder}):</span>
                      <strong className="font-mono">{recommendedSiblingDiscount}% Waiver</strong>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">
                  No other active students share phone number {targetStudent.guardianPhone}. You may still grant administrative or merit concessions.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Concession Type</label>
                <select
                  value={concessionType}
                  onChange={(e) => setConcessionType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="sibling">Sibling Enrolment Discount</option>
                  <option value="merit">Academic Merit Scholarship</option>
                  <option value="hardship">Financial Hardship Concession</option>
                  <option value="staff_ward">Staff Ward Privilege</option>
                  <option value="special">Special Executive Allowance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Discount Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Official Reason / Sanction Order</label>
              <textarea
                rows={2}
                placeholder="e.g. Sibling concession approved for 2nd ward under Council Policy 2026."
                value={concessionReason}
                onChange={(e) => setConcessionReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
              />
            </div>

            {/* Live Fee Calculation Preview */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-sans">Base Annual Fee</span>
                <span className="text-white">₹{baseFees.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-400 uppercase block font-sans">Discounted Fee</span>
                <span className="text-emerald-400 font-bold">
                  ₹{Math.max(0, baseFees - Math.round((baseFees * discountPercent) / 100)).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canManageConcession}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-sm disabled:opacity-50"
              >
                Save &amp; Sanction Concession
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: PRINCIPAL SPECIAL CATEGORY */}
        {activeTab === 'special_category' && (
          <form onSubmit={handleSaveSpecial} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Crown className="w-4 h-4" />
                <span>Principal Executive Discretionary Power</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Students designated as <strong>Special Category</strong> fall directly under the Principal's personal supervision. 
                Full discretion applies to admission criteria, fee exemptions, examination attendance waivers, and executive protection.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-white text-sm block">Designate as Special Category Student</span>
                  <span className="text-[11px] text-slate-400">Exempt from rigid school restrictions by Principal order</span>
                </div>
                <input
                  type="checkbox"
                  checked={isSpecial}
                  onChange={(e) => setIsSpecial(e.target.checked)}
                  className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-400"
                />
              </label>

              {isSpecial && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Discretionary Fee Waiver (% Scholarship / Exemption)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={specialWaiverPercent}
                        onChange={(e) => setSpecialWaiverPercent(e.target.value)}
                        className="flex-1 accent-amber-500"
                      />
                      <span className="font-mono font-bold text-amber-400 text-sm w-12 text-right">
                        {specialWaiverPercent}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Principal Executive Notes &amp; Special Considerations
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Under special consideration of the Principal. Allowed remote attendance and fee flexibility due to national sports representation / exceptional circumstances."
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canManageSpecial}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Authorize Special Status</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
