import React, { useState } from 'react';
import {
  Smartphone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Server,
  Key,
  RefreshCw,
  Sliders,
  Send,
  Info,
} from 'lucide-react';
import { dispatchNotification } from '../../lib/notificationService';
import { resetCollectionData } from '../../lib/firebase';

interface GatewaySettingsViewProps {
  onSettingsUpdated?: () => void;
}

export const GatewaySettingsView: React.FC<GatewaySettingsViewProps> = ({
  onSettingsUpdated,
}) => {
  const [testPhone, setTestPhone] = useState('9862112345');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [pinging, setPinging] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);

  const handleTestPing = async (channel: 'WhatsApp' | 'SMS') => {
    setPinging(true);
    setTestResult(null);
    try {
      const res = await dispatchNotification({
        phone: testPhone,
        channel,
        category: 'School Announcement',
        subject: 'ZOXS System Gateway Health Check',
        message: `ZOXS SMS Health Ping: ${channel} gateway connection is operational. (Time: ${new Date().toLocaleTimeString()})`,
        dispatchedBy: 'Administrative Diagnostics Tool',
        forceFail: simulateFailure,
      });

      if (simulateFailure) {
        setTestResult(`Test dispatch failed as simulated! Error logged to audit trail (Ref: ${res.gatewayRef}).`);
      } else {
        setTestResult(`Success! ${channel} message dispatched with Gateway Reference: ${res.gatewayRef}`);
      }

      if (onSettingsUpdated) onSettingsUpdated();
    } catch (err) {
      console.error(err);
      setTestResult('Ping failed to execute.');
    } finally {
      setPinging(false);
    }
  };

  const handleResetData = () => {
    if (confirm('Reset notification audit records back to demo default seed logs?')) {
      resetCollectionData();
      if (onSettingsUpdated) onSettingsUpdated();
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Carrier Gateways & DLT Regulatory Compliance
            </h3>
            <p className="text-xs text-gray-400">
              Telecom Regulatory Authority of India (TRAI) DLT and Meta WhatsApp Business Cloud API parameters.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WhatsApp Cloud API Configuration */}
        <div className="bg-gray-800/60 border border-gray-700/70 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-700/70">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">WhatsApp Business Cloud API</h4>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected & Active
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-800">
              <span className="text-gray-400">Registered Display Name</span>
              <span className="font-semibold text-white">ZOXS School Aizawl</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-800">
              <span className="text-gray-400">Sender Phone (wa.me)</span>
              <span className="font-mono text-emerald-400 font-bold">+91 98621 00000</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-800">
              <span className="text-gray-400">WhatsApp Business Account ID</span>
              <span className="font-mono text-gray-300">WABA_1092837465019</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-800">
              <span className="text-gray-400">Direct Link URI Scheme</span>
              <span className="font-mono text-cyan-300">https://wa.me/91[PHONE]?text=[MSG]</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">Pre-Approved HSM Templates</span>
              <span className="text-emerald-400 font-bold">6 Active Templates</span>
            </div>
          </div>
        </div>

        {/* SMS DLT Portal Configuration */}
        <div className="bg-gray-800/60 border border-gray-700/70 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-700/70">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">Govt. DLT SMS Gateway (TRAI)</h4>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              <ShieldCheck className="w-3.5 h-3.5" /> DLT Verified
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-800">
              <span className="text-gray-400">Principal Entity (PE) ID</span>
              <span className="font-mono text-white">1101552390000012345 (Govt. Mizoram)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-800">
              <span className="text-gray-400">Approved Sender Header</span>
              <span className="font-mono text-amber-300 font-bold">ZOXSMS (Transactional)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-800">
              <span className="text-gray-400">Telemarketer ID</span>
              <span className="font-mono text-gray-300">1202778899000011</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-800">
              <span className="text-gray-400">DLT Attendance Template ID</span>
              <span className="font-mono text-gray-300">1407161234567890</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">DLT Fee Reminder Template ID</span>
              <span className="font-mono text-gray-300">1407169876543210</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Diagnostics Tool */}
      <div className="bg-gray-800/60 border border-gray-700/70 rounded-2xl p-5 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          Interactive Gateway Diagnostics & Audit Test
        </h4>
        <p className="text-xs text-gray-400">
          Send a diagnostic test ping to verify end-to-end logging in Firestore and test error recovery workflows.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">Test Recipient Phone</label>
            <input
              type="text"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 pb-2">
            <input
              type="checkbox"
              id="sim-fail"
              checked={simulateFailure}
              onChange={(e) => setSimulateFailure(e.target.checked)}
              className="rounded bg-gray-900 border-gray-700 text-rose-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="sim-fail" className="text-xs text-gray-300 cursor-pointer select-none">
              Simulate Carrier Delivery Failure (to test retry)
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pinging}
              onClick={() => handleTestPing('WhatsApp')}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5" />
              WhatsApp Ping
            </button>
            <button
              type="button"
              disabled={pinging}
              onClick={() => handleTestPing('SMS')}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              SMS Ping
            </button>
          </div>
        </div>

        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              simulateFailure
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
            }`}
          >
            {simulateFailure ? <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
            <span>{testResult}</span>
          </div>
        )}

        <div className="pt-3 border-t border-gray-700/60 flex justify-between items-center text-xs">
          <span className="text-gray-400">Audit Trail Demonstration Data:</span>
          <button
            type="button"
            onClick={handleResetData}
            className="text-xs text-gray-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Initial Demo Logs
          </button>
        </div>
      </div>
    </div>
  );
};
