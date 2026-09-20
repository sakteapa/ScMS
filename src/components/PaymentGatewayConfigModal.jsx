import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  X,
  Key,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Zap,
  Building2,
  QrCode,
  Smartphone,
  Save,
  PlayCircle,
  AlertTriangle,
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';

export default function PaymentGatewayConfigModal({ isOpen, onClose, onTestCheckout }) {
  const { paymentConfig, updatePaymentConfig, setActivePaymentGateway, updateGatewayDetails } = useSchool();
  const { isPrincipal, isSuperAdmin } = useAuth();

  const [selectedGatewayId, setSelectedGatewayId] = useState(paymentConfig?.activeGateway || 'direct_upi');
  const [showSecrets, setShowSecrets] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local form state mirror for editing
  const [gatewayData, setGatewayData] = useState(paymentConfig?.gateways || {});

  if (!isOpen) return null;

  const activeGateway = paymentConfig?.activeGateway || 'direct_upi';

  const handleToggleSecret = (fieldKey) => {
    setShowSecrets(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  const handleFieldChange = (gwId, field, value) => {
    setGatewayData(prev => ({
      ...prev,
      [gwId]: {
        ...prev[gwId],
        [field]: value
      }
    }));
  };

  const handleSaveAll = (e) => {
    e.preventDefault();
    updatePaymentConfig({
      activeGateway: selectedGatewayId,
      gateways: gatewayData
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSetActive = (gwId) => {
    setSelectedGatewayId(gwId);
    setActivePaymentGateway(gwId);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const currentGw = gatewayData[selectedGatewayId] || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-inner">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Payment Gateway Integration &amp; Merchant Settings
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold uppercase tracking-wider border border-cyan-500/30">
                  Admin &amp; Principal Only
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Configure Razorpay, Cashfree, PhonePe, and Native NPCI UPI for institutional student billing.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body with 2-Column Split */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Gateway Selector Pills */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Supported Gateways
            </span>

            {/* Direct UPI */}
            <div
              onClick={() => setSelectedGatewayId('direct_upi')}
              className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                selectedGatewayId === 'direct_upi'
                  ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Direct UPI &amp; QR</span>
                </div>
                {activeGateway === 'direct_upi' && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                NPCI direct protocol (0% MDR fee). Instant settlement to SBI school account.
              </p>
            </div>

            {/* Razorpay */}
            <div
              onClick={() => setSelectedGatewayId('razorpay')}
              className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                selectedGatewayId === 'razorpay'
                  ? 'bg-indigo-500/10 border-indigo-500/50 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Razorpay Standard</span>
                </div>
                {activeGateway === 'razorpay' && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Cards, Netbanking from 50+ banks, UPI &amp; automated webhook callback.
              </p>
            </div>

            {/* Cashfree */}
            <div
              onClick={() => setSelectedGatewayId('cashfree')}
              className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                selectedGatewayId === 'cashfree'
                  ? 'bg-purple-500/10 border-purple-500/50 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white">Cashfree Payments</span>
                </div>
                {activeGateway === 'cashfree' && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                High-speed Indian payment gateway with low transaction latency.
              </p>
            </div>

            {/* PhonePe */}
            <div
              onClick={() => setSelectedGatewayId('phonepe')}
              className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                selectedGatewayId === 'phonepe'
                  ? 'bg-blue-500/10 border-blue-500/50 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white">PhonePe Gateway</span>
                </div>
                {activeGateway === 'phonepe' && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Deep-link UPI &amp; PhonePe Merchant ecosystem integration.
              </p>
            </div>

            {/* Test Simulation Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onTestCheckout) {
                    onTestCheckout(selectedGatewayId);
                  }
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition border border-cyan-500/20"
              >
                <PlayCircle className="w-4 h-4 text-cyan-400" />
                <span>Simulate Student Checkout</span>
              </button>
            </div>
          </div>

          {/* Right 2 Columns: Selected Gateway Configuration Form */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <span>{currentGw.name || 'Gateway Settings'}</span>
                  {activeGateway === selectedGatewayId ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                      Current Live Gateway
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetActive(selectedGatewayId)}
                      className="text-[10px] px-2.5 py-0.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition shadow-sm"
                    >
                      Make Active Gateway
                    </button>
                  )}
                </h4>
                <p className="text-[11px] text-slate-400">{currentGw.description}</p>
              </div>
            </div>

            <form onSubmit={handleSaveAll} className="space-y-4 text-xs">
              {/* SPECIFIC CONFIG: DIRECT UPI */}
              {selectedGatewayId === 'direct_upi' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      School Virtual Payment Address (UPI ID / VPA) *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={currentGw.upiId || ''}
                        onChange={(e) => handleFieldChange('direct_upi', 'upiId', e.target.value)}
                        placeholder="e.g. mizoramschool@oksbi"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-bold uppercase">
                        VPA
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        Merchant Account Holder Name
                      </label>
                      <input
                        type="text"
                        value={currentGw.merchantName || ''}
                        onChange={(e) => handleFieldChange('direct_upi', 'merchantName', e.target.value)}
                        placeholder="e.g. OHA Lunglawn, Lunglei"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        Linked Bank Account (Settlement)
                      </label>
                      <input
                        type="text"
                        value={currentGw.accountNumber || ''}
                        onChange={(e) => handleFieldChange('direct_upi', 'accountNumber', e.target.value)}
                        placeholder="SBI 30291827461"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Zero Processing Charge (0% Transaction MDR)</span>
                    </span>
                    <p>
                      Payments initiated via direct UPI bypass third-party aggregators, ensuring 100% of the tuition/hostel fee goes directly to the school treasury without deductions.
                    </p>
                  </div>
                </div>
              )}

              {/* SPECIFIC CONFIG: RAZORPAY */}
              {selectedGatewayId === 'razorpay' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Environment</label>
                      <select
                        value={currentGw.environment || 'sandbox'}
                        onChange={(e) => handleFieldChange('razorpay', 'environment', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="sandbox">Sandbox (Test Mode)</option>
                        <option value="live">Live (Production Payments)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Brand Theme Color</label>
                      <input
                        type="color"
                        value={currentGw.themeColor || '#06b6d4'}
                        onChange={(e) => handleFieldChange('razorpay', 'themeColor', e.target.value)}
                        className="w-full h-10 px-2 py-1 rounded-xl bg-slate-950 border border-slate-700 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Razorpay Key ID (Public) *
                    </label>
                    <input
                      type="text"
                      required
                      value={currentGw.keyId || ''}
                      onChange={(e) => handleFieldChange('razorpay', 'keyId', e.target.value)}
                      placeholder="rzp_test_... or rzp_live_..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Razorpay Key Secret (Server) *
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets['rzp_sec'] ? 'text' : 'password'}
                        required
                        value={currentGw.keySecret || ''}
                        onChange={(e) => handleFieldChange('razorpay', 'keySecret', e.target.value)}
                        placeholder="Key secret from Razorpay Dashboard"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleToggleSecret('rzp_sec')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                      >
                        {showSecrets['rzp_sec'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Webhook Secret (Automated Verification)
                    </label>
                    <input
                      type="text"
                      value={currentGw.webhookSecret || ''}
                      onChange={(e) => handleFieldChange('razorpay', 'webhookSecret', e.target.value)}
                      placeholder="e.g. whsec_mizoramschool_..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                      <input
                        type="checkbox"
                        checked={currentGw.enableCards ?? true}
                        onChange={(e) => handleFieldChange('razorpay', 'enableCards', e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-cyan-400"
                      />
                      <span className="text-[11px]">Debit/Credit</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                      <input
                        type="checkbox"
                        checked={currentGw.enableNetbanking ?? true}
                        onChange={(e) => handleFieldChange('razorpay', 'enableNetbanking', e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-cyan-400"
                      />
                      <span className="text-[11px]">Net Banking</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                      <input
                        type="checkbox"
                        checked={currentGw.enableUpi ?? true}
                        onChange={(e) => handleFieldChange('razorpay', 'enableUpi', e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-cyan-400"
                      />
                      <span className="text-[11px]">UPI / QR</span>
                    </label>
                  </div>
                </div>
              )}

              {/* SPECIFIC CONFIG: CASHFREE */}
              {selectedGatewayId === 'cashfree' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Environment</label>
                    <select
                      value={currentGw.environment || 'sandbox'}
                      onChange={(e) => handleFieldChange('cashfree', 'environment', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="sandbox">Sandbox (Test Environment)</option>
                      <option value="production">Production (Live)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Cashfree App ID *</label>
                    <input
                      type="text"
                      required
                      value={currentGw.appId || ''}
                      onChange={(e) => handleFieldChange('cashfree', 'appId', e.target.value)}
                      placeholder="e.g. CF_APP_..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Cashfree Secret Key *</label>
                    <div className="relative">
                      <input
                        type={showSecrets['cf_sec'] ? 'text' : 'password'}
                        required
                        value={currentGw.secretKey || ''}
                        onChange={(e) => handleFieldChange('cashfree', 'secretKey', e.target.value)}
                        placeholder="Cashfree client secret"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleToggleSecret('cf_sec')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                      >
                        {showSecrets['cf_sec'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SPECIFIC CONFIG: PHONEPE */}
              {selectedGatewayId === 'phonepe' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">PhonePe Merchant ID *</label>
                    <input
                      type="text"
                      required
                      value={currentGw.merchantId || ''}
                      onChange={(e) => handleFieldChange('phonepe', 'merchantId', e.target.value)}
                      placeholder="e.g. M228391827361_..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-slate-400 font-semibold mb-1">PhonePe Salt Key *</label>
                      <input
                        type="text"
                        required
                        value={currentGw.saltKey || ''}
                        onChange={(e) => handleFieldChange('phonepe', 'saltKey', e.target.value)}
                        placeholder="UUID Salt Key"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Salt Index</label>
                      <input
                        type="text"
                        value={currentGw.saltIndex || '1'}
                        onChange={(e) => handleFieldChange('phonepe', 'saltIndex', e.target.value)}
                        placeholder="1"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit / Save Bar */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  {saveSuccess && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Payment Gateway settings saved successfully!</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold transition shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Gateway Credentials</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
