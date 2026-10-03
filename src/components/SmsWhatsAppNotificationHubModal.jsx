import React, { useState, useMemo } from 'react';
import {
  X,
  MessageSquare,
  Send,
  Phone,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Users,
  Search,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Clock,
  Filter,
  DollarSign,
  GraduationCap,
  CloudLightning,
  Sparkles,
  RefreshCw,
  Radio,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import { formatPhoneNumberForApi, generateWhatsAppLink, generateSmsLink, calculateSmsSegments } from '../lib/notificationService';

export default function SmsWhatsAppNotificationHubModal({ isOpen, onClose, initialTab = 'attendance' }) {
  const {
    students = [],
    classes = [],
    attendance = [],
    exams = [],
    systemConfig,
    gatewayConfig,
    updateGatewayConfig,
    sendSmsAlert,
    sendWhatsAppAlert
  } = useSchool();

  const { currentUser, isPrincipal, isVicePrincipal, isTeacher, isSuperAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab); // 'attendance' | 'fees' | 'exams' | 'broadcast' | 'gateway'
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [copiedId, setCopiedId] = useState(null);
  const [sendingState, setSendingState] = useState({ active: false, progress: 0, total: 0 });
  const [dispatchFeedback, setDispatchFeedback] = useState(null);

  // Broadcast Form State
  const [broadcastTarget, setBroadcastTarget] = useState('all_parents'); // 'all_parents' | 'class_parents' | 'all_staff'
  const [broadcastTemplate, setBroadcastTemplate] = useState('weather'); // 'weather' | 'holiday' | 'ptm' | 'custom'
  const [customSubject, setCustomSubject] = useState('School Emergency Notice');
  const [customMessage, setCustomMessage] = useState(
    `URGENT SCHOOL ADVISORY / RUANHSUR LEH LEI MIN VANG:\nDue to continuous heavy rainfall and district disaster advisory, school classes for today (${selectedDate}) are suspended for student safety. Fimkhur tura ngen in ni e.\n- Principal, ${systemConfig?.schoolName || 'ZOXS School'}`
  );

  // Gateway form state
  const [gatewayForm, setGatewayForm] = useState({
    smsProvider: gatewayConfig?.smsProvider || 'fast2sms',
    fast2smsApiKey: gatewayConfig?.fast2smsApiKey || '',
    customWebhookUrl: gatewayConfig?.customWebhookUrl || '',
    whatsAppProvider: gatewayConfig?.whatsAppProvider || 'wa_link'
  });

  // 1. ATTENDANCE ABSENTEES COMPUTATION
  const absenteeList = useMemo(() => {
    return attendance
      .filter(rec => rec.date === selectedDate && rec.status === 'absent')
      .map(rec => {
        const student = students.find(s => s.id === rec.studentId);
        const stuClass = classes.find(c => c.id === (student?.classId || rec.classId));
        return {
          recId: rec.id,
          studentId: rec.studentId,
          name: student ? `${student.firstName} ${student.lastName}` : 'Zirlai',
          rollNo: student?.rollNo || 'N/A',
          className: stuClass?.name || 'Class',
          classId: stuClass?.id,
          guardianName: student?.guardianName || student?.fatherName || 'Parent / Guardian',
          guardianPhone: student?.guardianPhone || student?.parentPhone || '+91 98625 00000',
          remarks: rec.remarks || 'Absent recorded'
        };
      })
      .filter(item => selectedClassId === 'all' || item.classId === selectedClassId);
  }, [attendance, students, classes, selectedDate, selectedClassId]);

  // 2. FEE DUE STUDENTS COMPUTATION
  const feeDueList = useMemo(() => {
    return students
      .filter(stu => {
        const matchesClass = selectedClassId === 'all' || stu.classId === selectedClassId;
        const hasDue = (stu.totalFeesDue || 0) > 0 || stu.feeStatus === 'pending' || stu.feeStatus === 'partial';
        return matchesClass && hasDue;
      })
      .map(stu => {
        const stuClass = classes.find(c => c.id === stu.classId);
        const dueAmount = stu.totalFeesDue || 2200;
        return {
          studentId: stu.id,
          name: `${stu.firstName} ${stu.lastName}`,
          rollNo: stu.rollNo,
          className: stuClass?.name || 'Class',
          classId: stuClass?.id,
          guardianName: stu.guardianName || stu.fatherName || 'Parent / Guardian',
          guardianPhone: stu.guardianPhone || stu.parentPhone || '+91 98625 00000',
          dueAmount,
          dueDate: '25th of this month'
        };
      });
  }, [students, classes, selectedClassId]);

  // Template generators
  const getAbsentMessage = (item) => {
    return `Nu leh Pa Chibai,\nVawiin ni ${selectedDate} hian i fa ${item.name} (Roll No: ${item.rollNo}, ${item.className}) chu ${systemConfig?.schoolName || 'ZOXS School'}-ah a rawn kal lo (ABSENT) tih kan inhriattir a che. Chhan hriat lawk loh anih chuan class teacher bia ang che.\n- Principal Office`;
  };

  const getFeeDueMessage = (item) => {
    return `Nu leh Pa zahawm takte,\n${systemConfig?.schoolName || 'ZOXS School'} hriattirna:\n${item.name} (Roll No: ${item.rollNo}, ${item.className}) school fee ba ₹${item.dueAmount.toLocaleString()} hi ni ${item.dueDate} hma a pe fel turin kan ngen a che. School counter-ah emaw UPI: ${systemConfig?.upiId || 'mizo-highschool@sbi'} hmangin i pe thei e.\n- Accounts Desk`;
  };

  const getExamResultMessage = (item) => {
    return `MBSE EXAM RESULT NOTIFICATION:\n${item.name} (Roll #${item.rollNo}, ${item.className}) final exam result chu tihchhuah a ni ta. Khawngaihin school portal (${window.location.origin}) ah login-in Report Card en ang che.\n- Controller of Examinations`;
  };

  // Direct action helpers
  const handleOpenWhatsApp = (phone, text) => {
    const link = generateWhatsAppLink(phone, text);
    window.open(link, '_blank');
  };

  const handleOpenSms = (phone, text) => {
    const link = generateSmsLink(phone, text);
    window.location.href = link;
  };

  const handleCopyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Batch Auto-Dispatch via Gateway API (Fast2SMS / Webhook)
  const handleBatchDispatch = async (list, getMsgFn, typeName) => {
    if (list.length === 0) return;
    if (!window.confirm(`Zirlai nu leh pa ${list.length} te hnenah ${typeName} notification thawn i duh tak tak em?`)) {
      return;
    }

    setSendingState({ active: true, progress: 0, total: list.length });
    let successCount = 0;

    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const msg = getMsgFn(item);
      try {
        await sendSmsAlert(item.guardianPhone, msg, 'sms');
        await sendWhatsAppAlert(item.guardianPhone, msg);
        successCount++;
      } catch (err) {
        console.warn('Dispatch failed for', item.name, err);
      }
      setSendingState({ active: true, progress: i + 1, total: list.length });
    }

    setSendingState({ active: false, progress: 0, total: 0 });
    setDispatchFeedback({
      type: 'success',
      text: `${successCount} out of ${list.length} ${typeName} alerts dispatched successfully!`
    });

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    setTimeout(() => setDispatchFeedback(null), 5000);
  };

  // Broadcast Template Switcher
  const handleTemplateChange = (tmpl) => {
    setBroadcastTemplate(tmpl);
    if (tmpl === 'weather') {
      setCustomSubject('Emergency Weather & Disaster Advisory (Ruahsur Vang)');
      setCustomMessage(`URGENT SCHOOL ADVISORY / RUANHSUR LEH LEI MIN VANG:\nDue to continuous heavy rainfall and district disaster management advisory, school timing for today (${selectedDate}) is suspended for student safety. Zirlai leh nu leh pate fimkhur tura ngen in ni e.\n- Disaster Safety Committee, ${systemConfig?.schoolName || 'ZOXS School'}`);
    } else if (tmpl === 'holiday') {
      setCustomSubject('School Holiday Notice / Chawlh Hriattirna');
      setCustomMessage(`SCHOOL HOLIDAY NOTICE / CHAWLH HRIATTIRNA:\n${systemConfig?.schoolName || 'ZOXS School'} will remain closed on ${selectedDate} on account of official state holiday. Regular classes will resume normally on the next working day.\nZirlai zawng zawngte chawlh hman nuam vek u le!\n- Headmaster / Principal`);
    } else if (tmpl === 'ptm') {
      setCustomSubject('Parents-Teachers Meeting (PTM) Invitation');
      setCustomMessage(`PARENTS-TEACHERS MEETING (PTM) INVITATION:\nDear Parents, you are cordially invited to attend the Academic Review & PTM on upcoming Saturday at 10:30 AM in the School Auditorium.\nZirlai zirla buatsaih dan leh Term exam result sawiho a ni ang a, nu leh pate lo kal ngei tura beisei in ni e.\n- Principal, ${systemConfig?.schoolName || 'ZOXS School'}`);
    }
  };

  const handleSaveGateway = (e) => {
    e.preventDefault();
    updateGatewayConfig(gatewayForm);
    setDispatchFeedback({
      type: 'success',
      text: 'Gateway configurations (Fast2SMS & WhatsApp Webhook) updated successfully!'
    });
    setTimeout(() => setDispatchFeedback(null), 4000);
  };

  const smsSegments = calculateSmsSegments(customMessage);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                  SMS &amp; WhatsApp Notification Hub
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold font-mono">
                  Live Gateway &amp; Direct wa.me
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated parental notification alerts for Attendance Absentees, Fee Dues, and MBSE Exam Results.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 sm:px-5 pt-3 pb-2 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'attendance'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Absentee Alerts ({absenteeList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('fees')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'fees'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Fee Due Reminders ({feeDueList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('broadcast')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'broadcast'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Broadcast Notice</span>
            </button>

            <button
              onClick={() => setActiveTab('gateway')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'gateway'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Gateway Settings &amp; Logs</span>
            </button>
          </div>

          {/* Class Filter Dropdown */}
          {activeTab !== 'gateway' && (
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Feedback Alert */}
        {dispatchFeedback && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{dispatchFeedback.text}</span>
          </div>
        )}

        {/* Sending Progress Indicator */}
        {sendingState.active && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Dispatching notifications ({sendingState.progress}/{sendingState.total})...</span>
            </div>
            <span className="font-mono font-bold">
              {Math.round((sendingState.progress / sendingState.total) * 100)}%
            </span>
          </div>
        )}

        {/* TAB 1: ATTENDANCE ABSENTEES */}
        {activeTab === 'attendance' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Date:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
                <span className="text-xs text-slate-300 font-semibold">
                  {absenteeList.length} Absent Students
                </span>
              </div>

              {absenteeList.length > 0 && (
                <button
                  onClick={() => handleBatchDispatch(absenteeList, getAbsentMessage, 'Absentee Alert')}
                  disabled={sendingState.active}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow shadow-rose-950/40 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send WhatsApp / SMS to All {absenteeList.length} Parents</span>
                </button>
              )}
            </div>

            {/* Absentees List */}
            {absenteeList.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Absentees Recorded for {selectedDate}</h4>
                <p className="text-xs text-slate-400">
                  Zirlai zawng zawng an kal vek emaw, he ni atan hian attendance lak a la ni lo e.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {absenteeList.map((item) => {
                  const msg = getAbsentMessage(item);
                  return (
                    <div
                      key={item.recId || item.studentId}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-xs sm:text-sm">{item.name}</h4>
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold font-mono">
                              ABSENT
                            </span>
                            <span className="text-slate-400 text-xs">{item.className} • Roll #{item.rollNo}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>Guardian: <strong className="text-slate-300">{item.guardianName}</strong></span>
                            <span>•</span>
                            <span className="font-mono text-cyan-400 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-500" />
                              {item.guardianPhone}
                            </span>
                          </div>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyText(item.studentId, msg)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition"
                            title="Copy Mizo Notice Text"
                          >
                            {copiedId === item.studentId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleOpenSms(item.guardianPhone, msg)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition flex items-center gap-1"
                            title="Send via Phone SMS protocol"
                          >
                            <Phone className="w-3.5 h-3.5 text-amber-400" />
                            <span>SMS</span>
                          </button>
                          <button
                            onClick={() => handleOpenWhatsApp(item.guardianPhone, msg)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      </div>

                      {/* Message Preview */}
                      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-line">
                        {msg}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FEE DUE REMINDERS */}
        {activeTab === 'fees' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-xs text-slate-300">
                Found <strong className="text-amber-400 font-bold">{feeDueList.length} students</strong> with pending school fee balances.
              </div>
              {feeDueList.length > 0 && (
                <button
                  onClick={() => handleBatchDispatch(feeDueList, getFeeDueMessage, 'Fee Due Reminder')}
                  disabled={sendingState.active}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Fee Reminders to All {feeDueList.length} Parents</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {feeDueList.map((item) => {
                const msg = getFeeDueMessage(item);
                return (
                  <div
                    key={item.studentId}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-xs sm:text-sm">{item.name}</h4>
                          <span className="text-slate-400 text-xs">{item.className} • Roll #{item.rollNo}</span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
                            Due: ₹{item.dueAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>Parent: <strong className="text-slate-300">{item.guardianName}</strong></span>
                          <span>•</span>
                          <span className="font-mono text-cyan-400">{item.guardianPhone}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyText(item.studentId, msg)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition"
                          title="Copy Message Text"
                        >
                          {copiedId === item.studentId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleOpenSms(item.guardianPhone, msg)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          <span>SMS</span>
                        </button>
                        <button
                          onClick={() => handleOpenWhatsApp(item.guardianPhone, msg)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-line">
                      {msg}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: BROADCAST NOTICE */}
        {activeTab === 'broadcast' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleTemplateChange('weather')}
                className={`p-3 rounded-xl border text-left transition ${
                  broadcastTemplate === 'weather'
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white mb-1">
                  <CloudLightning className="w-4 h-4 text-cyan-400" />
                  <span>Rain &amp; Landslide Alert</span>
                </div>
                <p className="text-[11px] text-slate-400">Ruahsur leh chhiatrup thilah school chawlh hriattirna.</p>
              </button>

              <button
                type="button"
                onClick={() => handleTemplateChange('holiday')}
                className={`p-3 rounded-xl border text-left transition ${
                  broadcastTemplate === 'holiday'
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white mb-1">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>State Holiday Notice</span>
                </div>
                <p className="text-[11px] text-slate-400">Kut, festival, emaw sorkar chawlh hriattirna.</p>
              </button>

              <button
                type="button"
                onClick={() => handleTemplateChange('ptm')}
                className={`p-3 rounded-xl border text-left transition ${
                  broadcastTemplate === 'ptm'
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white mb-1">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>PTM Meeting Invitation</span>
                </div>
                <p className="text-[11px] text-slate-400">Nu leh pa inkhawmpui &amp; result sawiho sawmna.</p>
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Notice Subject / Thupui</label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-400">Message Content (Mizo &amp; English)</label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {smsSegments.charCount} characters • {smsSegments.segments} SMS segment(s)
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono leading-relaxed"
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleCopyText('broadcast', customMessage)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  {copiedId === 'broadcast' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Broadcast Notice</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const samplePhone = students[0]?.guardianPhone || '9862500000';
                      handleOpenWhatsApp(samplePhone, customMessage);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Test Send WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const targets = students.filter(s => selectedClassId === 'all' || s.classId === selectedClassId);
                      handleBatchDispatch(targets, () => customMessage, customSubject);
                    }}
                    disabled={sendingState.active}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow shadow-indigo-950/40 disabled:opacity-50"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Broadcast to All Parents ({students.length})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GATEWAY CONFIG & LIVE AUDIT LOG */}
        {activeTab === 'gateway' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-6 flex-1">
            <form onSubmit={handleSaveGateway} className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider text-cyan-400">
                SMS Provider &amp; API Configuration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">SMS Provider</label>
                  <select
                    value={gatewayForm.smsProvider}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, smsProvider: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="fast2sms">Fast2SMS (India DLT &amp; Quick Route)</option>
                    <option value="custom">Custom Webhook (Zapier / Twilio / MSG91)</option>
                    <option value="demo">Demo / Simulated Offline Mode</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Fast2SMS Authorization API Key</label>
                  <input
                    type="password"
                    placeholder="Enter Fast2SMS API Key..."
                    value={gatewayForm.fast2smsApiKey}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, fast2smsApiKey: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Custom Webhook Dispatch URL</label>
                <input
                  type="url"
                  placeholder="https://your-webhook.com/api/send-sms"
                  value={gatewayForm.customWebhookUrl}
                  onChange={(e) => setGatewayForm({ ...gatewayForm, customWebhookUrl: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Gateway Settings</span>
                </button>
              </div>
            </form>

            {/* Live Message Delivery Log */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider text-slate-300">
                  Recent Dispatched Messages Audit Log ({gatewayConfig?.smsDeliveryLog?.length || 0})
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Last 50 entries</span>
              </div>

              {(!gatewayConfig?.smsDeliveryLog || gatewayConfig.smsDeliveryLog.length === 0) ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500 italic">
                  No SMS / WhatsApp dispatches logged yet in this session.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {gatewayConfig.smsDeliveryLog.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5 max-w-[70%]">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                            log.type === 'whatsapp' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
                          }`}>
                            {log.type}
                          </span>
                          <span className="font-mono text-white text-[11px]">{log.phone}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{log.message}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase font-mono">
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
