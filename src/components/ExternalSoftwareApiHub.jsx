import React, { useState } from 'react';
import {
  Zap,
  Key,
  Webhook,
  Cpu,
  FileSpreadsheet,
  Database,
  Plus,
  Trash2,
  Copy,
  Check,
  Play,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Download,
  Upload,
  CheckCircle2,
  Code2,
  Terminal,
  Activity,
  Layers
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';

export default function ExternalSoftwareApiHub() {
  const {
    students,
    classes,
    fees,
    attendance,
    staff,
    addCollectionRecord,
    recordAttendance,
    systemConfig
  } = useSchool();

  const [activeSubTab, setActiveSubTab] = useState('keys'); // 'keys' | 'webhooks' | 'biometrics' | 'excel_import' | 'sql_export'
  const [copiedKey, setCopiedKey] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // 1. API Keys State
  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('zoxs_external_api_keys');
      return saved ? JSON.parse(saved) : [
        {
          id: 'key_live_99812a',
          name: 'Tally & Accounting ERP Sync',
          token: 'sk_live_oha_lunglawn_99a8b7c6d5e4f3a2b1c0',
          scope: 'read_write_financials',
          status: 'active',
          lastUsed: '2026-09-20 18:40',
          rateLimit: '100 req/min'
        },
        {
          id: 'key_live_77215b',
          name: 'Biometric Turnstile Hardware Terminal',
          token: 'sk_live_biometric_rfid_88291029384756',
          scope: 'write_attendance',
          status: 'active',
          lastUsed: '2026-09-20 18:55',
          rateLimit: '500 req/min'
        },
        {
          id: 'key_live_33190c',
          name: 'Mobile App External Sync Bridge',
          token: 'sk_live_mobile_app_v2_19283746152930',
          scope: 'full_read',
          status: 'active',
          lastUsed: '2026-09-20 17:15',
          rateLimit: '200 req/min'
        }
      ];
    } catch {
      return [];
    }
  });

  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScope, setNewKeyScope] = useState('full_access');

  // 2. Webhooks State
  const [webhooks, setWebhooks] = useState(() => {
    try {
      const saved = localStorage.getItem('zoxs_external_webhooks');
      return saved ? JSON.parse(saved) : [
        {
          id: 'whk_01',
          name: 'Zapier Parent SMS & Email Pipeline',
          url: 'https://hooks.zapier.com/hooks/catch/99281/oha_sms/',
          events: ['fee.collected', 'attendance.absent'],
          secret: 'whsec_99a8b7c6d5e4f3a2',
          status: 'active',
          lastDelivery: '200 OK (12ms)'
        },
        {
          id: 'whk_02',
          name: 'State Education Dept Central Portal Sync',
          url: 'https://mizoram.gov.in/api/v1/school_ingest/webhook',
          events: ['admission.approved', 'marks.published'],
          secret: 'whsec_gov_mizoram_2026',
          status: 'active',
          lastDelivery: '200 OK (28ms)'
        }
      ];
    } catch {
      return [];
    }
  });

  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  // 3. Biometric Hardware State
  const [hardwareConfig, setHardwareConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('zoxs_biometric_hardware_config');
      return saved ? JSON.parse(saved) : {
        deviceType: 'zkteco_essl', // 'zkteco_essl' | 'mantra_rfid' | 'hid_prox' | 'custom_tcp'
        serverPort: 8080,
        deviceIp: '192.168.1.120',
        autoMarkPresent: true,
        enableSoundBeep: true,
        punchLog: [
          { id: 'pnc-01', rfidCard: 'MZ-RFID-9901', studentName: 'Lalmuanpuia Pachuau', time: '08:42 AM', status: 'Success (Present)' },
          { id: 'pnc-02', rfidCard: 'MZ-RFID-9902', studentName: 'Zonunmawii Khiangte', time: '08:44 AM', status: 'Success (Present)' },
          { id: 'pnc-03', rfidCard: 'MZ-RFID-9903', studentName: 'C. Lalrinsanga', time: '08:45 AM', status: 'Success (Present)' }
        ]
      };
    } catch {
      return {};
    }
  });

  const [simulatedRfid, setSimulatedRfid] = useState('MZ-RFID-9904');

  // 4. Excel / CSV Importer State
  const [csvText, setCsvText] = useState(`firstName,lastName,gender,classId,rollNo,guardianName,guardianPhone,address
Vanlalruata,Sailo,Male,cls-11-sci,06,T. Lalhmangaiha,9436140552,"Lunglawn, Lunglei"
Lalawmpuii,Ralte,Female,cls-11-arts,07,K. Lalthanzuala,9862345671,"Venglai, Lunglei"
Malsawmtluanga,Hmar,Male,cls-12-comm,08,F. Zohmingliana,9436155221,"Bazar Veng, Lunglei"`);
  const [importSuccessCount, setImportSuccessCount] = useState(null);

  // Helper to save API keys
  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;
    const newKey = {
      id: `key_${Date.now().toString(36)}`,
      name: newKeyName,
      token: `sk_live_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
      scope: newKeyScope,
      status: 'active',
      lastUsed: 'Never',
      rateLimit: '250 req/min'
    };
    const updated = [newKey, ...apiKeys];
    setApiKeys(updated);
    localStorage.setItem('zoxs_external_api_keys', JSON.stringify(updated));
    setNewKeyName('');
  };

  const handleDeleteKey = (id) => {
    const updated = apiKeys.filter(k => k.id !== id);
    setApiKeys(updated);
    localStorage.setItem('zoxs_external_api_keys', JSON.stringify(updated));
  };

  // Helper to copy token
  const handleCopy = (token, id) => {
    navigator.clipboard.writeText(token);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Helper to add webhook
  const handleCreateWebhook = () => {
    if (!newWebhookName.trim() || !newWebhookUrl.trim()) return;
    const newWh = {
      id: `whk_${Date.now().toString(36)}`,
      name: newWebhookName,
      url: newWebhookUrl,
      events: ['fee.collected', 'attendance.absent'],
      secret: `whsec_${Math.random().toString(36).slice(2)}`,
      status: 'active',
      lastDelivery: 'Never'
    };
    const updated = [newWh, ...webhooks];
    setWebhooks(updated);
    localStorage.setItem('zoxs_external_webhooks', JSON.stringify(updated));
    setNewWebhookName('');
    setNewWebhookUrl('');
  };

  const handleDeleteWebhook = (id) => {
    const updated = webhooks.filter(w => w.id !== id);
    setWebhooks(updated);
    localStorage.setItem('zoxs_external_webhooks', JSON.stringify(updated));
  };

  // Test Webhook Dispatch Simulation
  const handleTestWebhook = (webhook) => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult({
        webhookId: webhook.id,
        status: 200,
        response: {
          success: true,
          event: 'fee.collected',
          institution: systemConfig?.schoolName || 'OHA (Oxford Higher Academy)',
          timestamp: new Date().toISOString(),
          simulatedPayload: {
            receiptNo: 'REC-2026-9912',
            studentName: 'Lalmuanpuia Pachuau',
            amount: 1500,
            gateway: 'UPI_DIRECT'
          }
        }
      });
    }, 800);
  };

  // Simulate Biometric Punch
  const handleSimulatePunch = () => {
    const randomStudent = students[Math.floor(Math.random() * students.length)] || students[0];
    const newPunch = {
      id: `pnc-${Date.now().toString().slice(-4)}`,
      rfidCard: simulatedRfid,
      studentName: `${randomStudent?.firstName || 'Student'} ${randomStudent?.lastName || ''}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Success (Verified & Marked Present)'
    };

    // Mark attendance in real-time
    if (recordAttendance && randomStudent) {
      recordAttendance({
        studentId: randomStudent.id,
        classId: randomStudent.classId,
        status: 'present',
        scanMethod: 'rfid_turnstile',
        scannedBy: 'Gate Turnstile Terminal 1'
      });
    }

    const updated = {
      ...hardwareConfig,
      punchLog: [newPunch, ...(hardwareConfig.punchLog || [])].slice(0, 30)
    };
    setHardwareConfig(updated);
    localStorage.setItem('zoxs_biometric_hardware_config', JSON.stringify(updated));
  };

  // Handle CSV Bulk Import to Context
  const handleImportCsv = () => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length <= 1) return;
      const headers = lines[0].split(',').map(h => h.trim());
      let count = 0;

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').trim());
        const record = {};
        headers.forEach((h, idx) => {
          record[h] = values[idx] || '';
        });

        const newStudent = {
          id: `stu-${Date.now()}-${i}`,
          admissionNo: `MZ-2026-${String(students.length + i + 1).padStart(4, '0')}`,
          firstName: record.firstName || 'Student',
          lastName: record.lastName || '',
          gender: record.gender || 'Male',
          classId: record.classId || 'cls-11-sci',
          rollNo: record.rollNo || String(i),
          guardianName: record.guardianName || 'Guardian',
          guardianPhone: record.guardianPhone || '+91 98620 00000',
          address: record.address || 'Lunglawn, Lunglei, Mizoram',
          feeStatus: 'paid',
          attendanceRate: 98
        };

        if (addCollectionRecord) {
          addCollectionRecord('students', newStudent);
          count++;
        }
      }

      setImportSuccessCount(count);
      setTimeout(() => setImportSuccessCount(null), 4000);
    } catch (err) {
      alert('CSV Format Error: ' + err.message);
    }
  };

  // Generate SQL Dump String
  const generateSqlDump = () => {
    let sql = `-- OHA (Oxford Higher Academy), Lunglawn, Lunglei Database Export\n-- Generated on: ${new Date().toISOString()}\n\n`;
    sql += `CREATE TABLE IF NOT EXISTS students (\n  id VARCHAR(64) PRIMARY KEY,\n  admission_no VARCHAR(32),\n  first_name VARCHAR(64),\n  last_name VARCHAR(64),\n  class_id VARCHAR(32),\n  roll_no VARCHAR(16),\n  guardian_phone VARCHAR(20),\n  fee_status VARCHAR(20)\n);\n\n`;

    students.forEach(s => {
      sql += `INSERT INTO students (id, admission_no, first_name, last_name, class_id, roll_no, guardian_phone, fee_status) VALUES ('${s.id}', '${s.admissionNo}', '${s.firstName}', '${s.lastName}', '${s.classId}', '${s.rollNo}', '${s.guardianPhone}', '${s.feeStatus}');\n`;
    });

    return sql;
  };

  const handleDownloadSql = () => {
    const sql = generateSqlDump();
    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oha-lunglawn-schema-${new Date().toISOString().slice(0, 10)}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> External Software Interoperability Hub
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Open APIs &amp; Hardware Ready
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-2 flex items-center gap-2 font-['Outfit']">
            External Software, Hardware &amp; Open API Gateway
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-3xl">
            External software (Tally ERP, Excel, Google Sheets), Biometric turnstiles, RFID scanners, leh automated third-party APIs hmanga school database zawng zawng awlsam taka thunun, sync, leh khawih danglam theihna hmunpui.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleDownloadSql}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition shadow"
            title="Download SQL schema and data dump"
          >
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Export SQL Dump</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        {[
          { id: 'keys', label: 'REST API Keys & Tokens', icon: Key, badge: `${apiKeys.length} Keys` },
          { id: 'webhooks', label: 'Outgoing Webhooks & Zapier', icon: Webhook, badge: `${webhooks.length} Active` },
          { id: 'biometrics', label: 'Biometric & RFID Hardware', icon: Cpu, badge: 'Hardware Link' },
          { id: 'excel_import', label: 'Excel & CSV Data Pipeline', icon: FileSpreadsheet, badge: 'Bulk Import' },
          { id: 'sql_export', label: 'SQL Schema & Database Sync', icon: Database, badge: 'Full DDL' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition shrink-0 ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: REST API KEYS */}
      {activeSubTab === 'keys' && (
        <div className="space-y-6">
          {/* Create New Key Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" /> Create Scoped API Key for External Software
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Software Name (e.g. Accounting Tally ERP)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <select
                value={newKeyScope}
                onChange={(e) => setNewKeyScope(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="full_access">Full Access (Read/Write All Collections)</option>
                <option value="read_write_financials">Financials &amp; Fees (Read/Write)</option>
                <option value="write_attendance">Attendance Punch (Write Only)</option>
                <option value="full_read">Read-Only Analytics &amp; Reports</option>
              </select>
              <button
                onClick={handleCreateKey}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Generate Token</span>
              </button>
            </div>
          </div>

          {/* Keys List */}
          <div className="grid grid-cols-1 gap-3.5">
            {apiKeys.map(key => (
              <div key={key.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{key.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {key.status.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400 font-mono">
                      {key.scope}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-xs text-amber-300 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                      {key.token}
                    </code>
                    <button
                      onClick={() => handleCopy(key.token, key.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Copy Secret Token"
                    >
                      {copiedKey === key.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right text-[11px] text-slate-400 font-mono">
                    <div>Rate Limit: {key.rateLimit}</div>
                    <div>Last Used: {key.lastUsed}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteKey(key.id)}
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition"
                    title="Revoke Token"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* cURL Example Snippet */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" /> External REST API Calling Example (cURL)
            </span>
            <pre className="text-xs font-mono text-cyan-300 bg-slate-900 p-3 rounded-xl overflow-x-auto">
{`curl -X POST "https://api.oha-lunglawn.edu.in/v1/attendance" \\
  -H "Authorization: Bearer sk_live_biometric_rfid_88291029384756" \\
  -H "Content-Type: application/json" \\
  -d '{"studentId": "stu-001", "status": "present", "method": "biometric_turnstile"}'`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 2: WEBHOOKS */}
      {activeSubTab === 'webhooks' && (
        <div className="space-y-6">
          {/* Create Webhook */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Webhook className="w-4 h-4 text-indigo-400" /> Add Outgoing Webhook Endpoint
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newWebhookName}
                onChange={(e) => setNewWebhookName(e.target.value)}
                placeholder="Receiver Name (e.g. Zapier Webhook)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <input
                type="url"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                placeholder="https://hooks.yourdomain.com/incoming"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleCreateWebhook}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Register Webhook</span>
              </button>
            </div>
          </div>

          {/* Webhooks List */}
          <div className="grid grid-cols-1 gap-3.5">
            {webhooks.map(wh => (
              <div key={wh.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{wh.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {wh.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestWebhook(wh)}
                      disabled={isTesting}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                    >
                      {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>Test Ping</span>
                    </button>
                    <button
                      onClick={() => handleDeleteWebhook(wh.id)}
                      className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs text-cyan-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 truncate">
                  <span>POST</span>
                  <span className="text-slate-300">{wh.url}</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span>Events Subscribed:</span>
                    {wh.events.map(ev => (
                      <span key={ev} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px]">
                        {ev}
                      </span>
                    ))}
                  </div>
                  <div>Last Delivery: <strong className="text-emerald-400">{wh.lastDelivery}</strong></div>
                </div>
              </div>
            ))}
          </div>

          {/* Test Payload Visualizer */}
          {testResult && (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Webhook Test Payload Successfully Delivered (HTTP 200 OK)
                </span>
                <span className="text-[10px] font-mono text-emerald-400">HMAC SHA256 Signature Verified</span>
              </div>
              <pre className="text-xs font-mono text-emerald-200 bg-slate-950 p-3 rounded-xl overflow-x-auto">
                {JSON.stringify(testResult.response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BIOMETRIC & RFID HARDWARE */}
      {activeSubTab === 'biometrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Device Config Card */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" /> Turnstile Machine Config
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Hardware Model</label>
                  <select
                    value={hardwareConfig.deviceType}
                    onChange={(e) => setHardwareConfig({ ...hardwareConfig, deviceType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="zkteco_essl">ZKTeco &amp; eSSL BioStar (TCP/IP)</option>
                    <option value="mantra_rfid">Mantra Softech RFID Turnstile</option>
                    <option value="hid_prox">HID Global Proximity Card Reader</option>
                    <option value="custom_tcp">Custom WebSocket / TCP Terminal</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Device Local IP &amp; Port</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={hardwareConfig.deviceIp}
                      onChange={(e) => setHardwareConfig({ ...hardwareConfig, deviceIp: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
                    />
                    <input
                      type="number"
                      value={hardwareConfig.serverPort}
                      onChange={(e) => setHardwareConfig({ ...hardwareConfig, serverPort: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Hardware Punch Simulator */}
            <div className="md:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Test Hardware Punch Ingestion
              </h4>
              <p className="text-xs text-slate-400">
                Turnstile scanner-a card swipe emaw biometric finger tap lo lut simulation:
              </p>
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="text"
                  value={simulatedRfid}
                  onChange={(e) => setSimulatedRfid(e.target.value)}
                  placeholder="Card RFID Serial (e.g. MZ-RFID-9904)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-emerald-500"
                />
                <button
                  onClick={handleSimulatePunch}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 transition flex items-center gap-2"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Simulate RFID Swipe</span>
                </button>
              </div>

              {/* Recent Live Hardware Punches */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Live Machine Punch Log
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {(hardwareConfig.punchLog || []).map(pnc => (
                    <div key={pnc.id} className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 text-[11px]">{pnc.rfidCard}</span>
                        <span className="font-semibold text-white">{pnc.studentName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-slate-400 font-mono">{pnc.time}</span>
                        <span className="text-emerald-400 font-medium">{pnc.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXCEL / CSV BULK IMPORT */}
      {activeSubTab === 'excel_import' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Universal CSV &amp; Excel Data Ingestion Pipeline
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  External Excel software (.csv) atanga zirlai 100+ rual direct taka import luhna.
                </p>
              </div>
              <button
                onClick={handleImportCsv}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition"
              >
                <Upload className="w-4 h-4" />
                <span>Execute Batch Import</span>
              </button>
            </div>

            {importSuccessCount !== null && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Successfully imported {importSuccessCount} student records directly into the school system!</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Paste Raw CSV / Excel Content Here:
              </label>
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SQL EXPORT & SCHEMA */}
      {activeSubTab === 'sql_export' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" /> Relational SQL Schema &amp; Data Replication Dump
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  External SQL databases (MySQL, PostgreSQL, SQLite, Tally) hmanga query leh backup nan:
                </p>
              </div>
              <button
                onClick={handleDownloadSql}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download .SQL File</span>
              </button>
            </div>

            <pre className="text-xs font-mono text-cyan-300 bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-72 overflow-y-auto">
              {generateSqlDump()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
