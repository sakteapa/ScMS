import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  CreditCard,
  Building2,
  Send,
  Smartphone,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  Users,
  Check,
  Filter,
  Sparkles,
} from 'lucide-react';
import {
  FirestoreStudent,
  SchoolClass,
  FeeRecord,
  AttendanceRecord,
  NotificationChannel,
} from '../../types';
import {
  formatPhoneNumberDisplay,
  generateWhatsAppLink,
  generateSmsLink,
  interpolateTemplate,
  dispatchNotification,
} from '../../lib/notificationService';
import { DEFAULT_NOTIFICATION_TEMPLATES } from '../../data/seedNotifications';

interface QuickBatchAlertsViewProps {
  students: FirestoreStudent[];
  classes: SchoolClass[];
  fees: FeeRecord[];
  attendance: AttendanceRecord[];
  onBatchDispatched?: () => void;
}

export const QuickBatchAlertsView: React.FC<QuickBatchAlertsViewProps> = ({
  students,
  classes,
  fees,
  attendance,
  onBatchDispatched,
}) => {
  const todayIso = new Date().toISOString().split('T')[0];
  const [selectedBatchTab, setSelectedBatchTab] = useState<'attendance' | 'fees' | 'broadcast'>('attendance');
  const [selectedLanguage, setSelectedLanguage] = useState<'Mizo' | 'English' | 'Bilingual'>('Mizo');
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel>('WhatsApp');

  // Attendance Date filter
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('All');

  // Batch execution states
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchResult, setBatchResult] = useState<{
    successCount: number;
    message: string;
  } | null>(null);

  // 1. Identify Absent Students
  const absentRecordsToday = useMemo(() => {
    return attendance
      .filter((a) => a.date === selectedDate && a.status === 'Absent')
      .map((att) => {
        const student = students.find((s) => s.id === att.studentId);
        const schoolClass = classes.find((c) => c.id === att.classId);
        return {
          attendanceRecord: att,
          student,
          schoolClass,
        };
      })
      .filter((item) => {
        if (selectedClassFilter === 'All') return true;
        return item.attendanceRecord.classId === selectedClassFilter;
      });
  }, [attendance, selectedDate, students, classes, selectedClassFilter]);

  // 2. Identify Students with Due Fees
  const dueFeeStudents = useMemo(() => {
    return fees
      .filter((f) => (f.status === 'Pending' || f.status === 'Overdue') && (f.balanceAmount ?? (f.totalAmount - f.paidAmount)) > 0)
      .map((fee) => {
        const student = students.find((s) => s.id === fee.studentId);
        const schoolClass = classes.find((c) => c.id === fee.classId);
        const balance = fee.balanceAmount ?? (fee.totalAmount - fee.paidAmount);
        return {
          feeRecord: fee,
          student,
          schoolClass,
          balance,
        };
      })
      .filter((item) => {
        if (selectedClassFilter === 'All') return true;
        return item.feeRecord.classId === selectedClassFilter;
      });
  }, [fees, students, classes, selectedClassFilter]);

  // Choose Attendance Template
  const activeAttendanceTemplate = useMemo(() => {
    if (selectedLanguage === 'Mizo') return DEFAULT_NOTIFICATION_TEMPLATES.find((t) => t.id === 'tmpl-att-mizo')!;
    if (selectedLanguage === 'English') return DEFAULT_NOTIFICATION_TEMPLATES.find((t) => t.id === 'tmpl-att-eng')!;
    return DEFAULT_NOTIFICATION_TEMPLATES.find((t) => t.id === 'tmpl-att-bilingual')!;
  }, [selectedLanguage]);

  // Choose Fee Template
  const activeFeeTemplate = useMemo(() => {
    if (selectedLanguage === 'Mizo') return DEFAULT_NOTIFICATION_TEMPLATES.find((t) => t.id === 'tmpl-fee-mizo')!;
    if (selectedLanguage === 'English') return DEFAULT_NOTIFICATION_TEMPLATES.find((t) => t.id === 'tmpl-fee-eng')!;
    return DEFAULT_NOTIFICATION_TEMPLATES.find((t) => t.id === 'tmpl-fee-bilingual')!;
  }, [selectedLanguage]);

  // 1-Click Batch Dispatch for All Absent Students
  const handleBatchDispatchAbsentAlerts = async () => {
    if (absentRecordsToday.length === 0) return;
    setIsProcessing(true);
    setBatchResult(null);

    let count = 0;
    try {
      for (const item of absentRecordsToday) {
        if (!item.student) continue;

        const renderedText = interpolateTemplate(activeAttendanceTemplate.content, {
          student: item.student,
          schoolClass: item.schoolClass,
          attendanceRecord: item.attendanceRecord,
          customDate: selectedDate,
          schoolName: 'ZOXS Higher Secondary School, Aizawl',
          teacherName: item.schoolClass?.teacherName || 'Class Teacher',
        });

        await dispatchNotification({
          student: item.student,
          schoolClass: item.schoolClass,
          phone: item.student.parentPhone,
          channel: selectedChannel,
          category: 'Attendance Alert',
          templateId: activeAttendanceTemplate.id,
          subject: activeAttendanceTemplate.subject,
          message: renderedText,
          dispatchedBy: 'Principal Office (Batch Absent Job)',
        });
        count++;
      }

      setBatchResult({
        successCount: count,
        message: `Successfully generated and dispatched absent notifications to ${count} parents via ${selectedChannel}!`,
      });
      if (onBatchDispatched) onBatchDispatched();
    } catch (err) {
      console.error('Error during batch absent dispatch', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 1-Click Batch Dispatch for Fee Reminders
  const handleBatchDispatchFeeReminders = async () => {
    if (dueFeeStudents.length === 0) return;
    setIsProcessing(true);
    setBatchResult(null);

    let count = 0;
    try {
      for (const item of dueFeeStudents) {
        if (!item.student) continue;

        const renderedText = interpolateTemplate(activeFeeTemplate.content, {
          student: item.student,
          schoolClass: item.schoolClass,
          feeRecord: item.feeRecord,
          customAmount: item.balance,
          customDueDate: item.feeRecord.dueDate,
          schoolName: 'ZOXS Higher Secondary School, Aizawl',
        });

        await dispatchNotification({
          student: item.student,
          schoolClass: item.schoolClass,
          phone: item.student.parentPhone,
          channel: selectedChannel,
          category: 'Fee Due Reminder',
          templateId: activeFeeTemplate.id,
          subject: activeFeeTemplate.subject,
          message: renderedText,
          dispatchedBy: 'Accounts Section (Batch Fee Job)',
        });
        count++;
      }

      setBatchResult({
        successCount: count,
        message: `Dispatched fee reminders to ${count} parents via ${selectedChannel}!`,
      });
      if (onBatchDispatched) onBatchDispatched();
    } catch (err) {
      console.error('Error during batch fee dispatch', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Tab Navigation Header */}
      <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Quick Batch Alerts & Automated Jobs</h3>
            <p className="text-xs text-gray-400">
              Bulk parent communication matching live attendance records and fee balances.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-gray-900 p-1 rounded-xl border border-gray-750">
          <button
            type="button"
            onClick={() => {
              setSelectedBatchTab('attendance');
              setBatchResult(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedBatchTab === 'attendance'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            Absent Alerts ({absentRecordsToday.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedBatchTab('fees');
              setBatchResult(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedBatchTab === 'fees'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Fee Reminders ({dueFeeStudents.length})
          </button>
        </div>
      </div>

      {/* Global Filter & Channel Bar */}
      <div className="bg-gray-800/50 border border-gray-700/60 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {selectedBatchTab === 'attendance' && (
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">Attendance Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded px-2.5 py-1 text-gray-200 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">Class:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded px-2.5 py-1 text-gray-200 text-xs focus:outline-none"
            >
              <option value="All">All Classes ({classes.length})</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">Language:</span>
            {(['Mizo', 'English', 'Bilingual'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer ${
                  selectedLanguage === lang
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400">Preferred Channel:</span>
          <button
            type="button"
            onClick={() => setSelectedChannel('WhatsApp')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              selectedChannel === 'WhatsApp'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            <Smartphone className="w-3 h-3" /> WhatsApp
          </button>
          <button
            type="button"
            onClick={() => setSelectedChannel('SMS')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              selectedChannel === 'SMS'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            <MessageSquare className="w-3 h-3" /> SMS Gateway
          </button>
        </div>
      </div>

      {/* Execution Results Banner */}
      {batchResult && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-sm text-white">Batch Dispatch Complete!</span>
              <p className="text-emerald-200/90 mt-0.5">{batchResult.message}</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-950/60 rounded-lg text-emerald-300 font-mono font-bold border border-emerald-500/30">
            {batchResult.successCount} Dispatched
          </span>
        </div>
      )}

      {/* ================= SECTION 1: ATTENDANCE ABSENT ALERTS ================= */}
      {selectedBatchTab === 'attendance' && (
        <div className="bg-gray-800/60 border border-gray-700/70 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-rose-400" />
                Absent Students Detected for {selectedDate} ({absentRecordsToday.length})
              </h4>
              <p className="text-xs text-gray-400">
                Auto-matched with parent phone numbers from Firestore student records.
              </p>
            </div>

            {absentRecordsToday.length > 0 && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleBatchDispatchAbsentAlerts}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isProcessing
                  ? 'Dispatching Batch...'
                  : `1-Click Dispatch All (${absentRecordsToday.length}) Absent Alerts`}
              </button>
            )}
          </div>

          {absentRecordsToday.length === 0 ? (
            <div className="p-8 text-center bg-gray-900/60 rounded-xl border border-gray-750 text-gray-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-semibold text-white text-sm">No absent records on this date!</p>
              <p className="text-xs text-gray-400 mt-1">
                All enrolled students are marked Present or no attendance recorded yet for {selectedDate}.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-700/80 rounded-xl bg-gray-900/80">
              <table className="w-full text-left text-xs text-gray-200">
                <thead className="bg-gray-950/80 text-gray-400 uppercase text-[11px] border-b border-gray-700/70">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Roll #</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Student Name</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Class</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Parent Phone Number</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Class Teacher</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-right">Individual Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {absentRecordsToday.map(({ attendanceRecord, student, schoolClass }) => {
                    const message = interpolateTemplate(activeAttendanceTemplate.content, {
                      student,
                      schoolClass,
                      attendanceRecord,
                      customDate: selectedDate,
                      schoolName: 'ZOXS Higher Secondary School, Aizawl',
                      teacherName: schoolClass?.teacherName || 'Class Teacher',
                    });

                    const waUrl = student ? generateWhatsAppLink(student.parentPhone, message) : '#';
                    const smsUrl = student ? generateSmsLink(student.parentPhone, message) : '#';

                    return (
                      <tr key={attendanceRecord.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-rose-400">
                          #{student?.rollNo ?? attendanceRecord.rollNo}
                        </td>
                        <td className="px-4 py-3 font-semibold text-white">
                          {student?.name ?? attendanceRecord.studentName}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {schoolClass?.name ?? attendanceRecord.className}
                        </td>
                        <td className="px-4 py-3 font-mono text-emerald-400 font-medium">
                          {formatPhoneNumberDisplay(student?.parentPhone || 'N/A')}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {schoolClass?.teacherName || 'Bursar'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {student && (
                              <>
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={() => {
                                    dispatchNotification({
                                      student,
                                      schoolClass,
                                      phone: student.parentPhone,
                                      channel: 'WhatsApp',
                                      category: 'Attendance Alert',
                                      templateId: activeAttendanceTemplate.id,
                                      subject: activeAttendanceTemplate.subject,
                                      message,
                                      dispatchedBy: 'Class Attendance Counter',
                                    });
                                    if (onBatchDispatched) onBatchDispatched();
                                  }}
                                  className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-700/80 hover:bg-emerald-600 text-white transition-colors cursor-pointer inline-flex items-center gap-1"
                                >
                                  <Smartphone className="w-3 h-3" /> WhatsApp
                                </a>
                                <a
                                  href={smsUrl}
                                  onClick={() => {
                                    dispatchNotification({
                                      student,
                                      schoolClass,
                                      phone: student.parentPhone,
                                      channel: 'SMS',
                                      category: 'Attendance Alert',
                                      templateId: activeAttendanceTemplate.id,
                                      subject: activeAttendanceTemplate.subject,
                                      message,
                                      dispatchedBy: 'Class Attendance Counter',
                                    });
                                    if (onBatchDispatched) onBatchDispatched();
                                  }}
                                  className="px-2.5 py-1 rounded text-[11px] font-semibold bg-indigo-700/80 hover:bg-indigo-600 text-white transition-colors cursor-pointer inline-flex items-center gap-1"
                                >
                                  <MessageSquare className="w-3 h-3" /> SMS
                                </a>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= SECTION 2: FEE DUE REMINDERS ================= */}
      {selectedBatchTab === 'fees' && (
        <div className="bg-gray-800/60 border border-gray-700/70 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                Students with Pending & Overdue Fees ({dueFeeStudents.length})
              </h4>
              <p className="text-xs text-gray-400">
                Direct reminders pre-populating balance due and official SBI UPI payment address.
              </p>
            </div>

            {dueFeeStudents.length > 0 && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleBatchDispatchFeeReminders}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isProcessing
                  ? 'Dispatching Reminders...'
                  : `1-Click Dispatch All (${dueFeeStudents.length}) Fee Reminders`}
              </button>
            )}
          </div>

          {dueFeeStudents.length === 0 ? (
            <div className="p-8 text-center bg-gray-900/60 rounded-xl border border-gray-750 text-gray-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-semibold text-white text-sm">All fees cleared!</p>
              <p className="text-xs text-gray-400 mt-1">No pending or overdue balances found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-700/80 rounded-xl bg-gray-900/80">
              <table className="w-full text-left text-xs text-gray-200">
                <thead className="bg-gray-950/80 text-gray-400 uppercase text-[11px] border-b border-gray-700/70">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Student Name</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Class</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Fee Month</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-right">Balance Due</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Due Date</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Parent Contact</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-right">Quick Send</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {dueFeeStudents.map(({ feeRecord, student, schoolClass, balance }) => {
                    const message = interpolateTemplate(activeFeeTemplate.content, {
                      student,
                      schoolClass,
                      feeRecord,
                      customAmount: balance,
                      customDueDate: feeRecord.dueDate,
                      schoolName: 'ZOXS Higher Secondary School, Aizawl',
                    });

                    const waUrl = student ? generateWhatsAppLink(student.parentPhone, message) : '#';
                    const smsUrl = student ? generateSmsLink(student.parentPhone, message) : '#';

                    return (
                      <tr key={feeRecord.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-white">
                          {student?.name ?? feeRecord.studentName}{' '}
                          <span className="text-gray-400 text-[10px] font-mono">
                            #{student?.rollNo ?? feeRecord.rollNo}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {schoolClass?.name ?? feeRecord.className}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {feeRecord.feeMonth}
                        </td>
                        <td className="px-4 py-3 font-mono text-rose-400 font-bold text-right">
                          ₹{balance.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-300">
                          {feeRecord.dueDate}
                        </td>
                        <td className="px-4 py-3 font-mono text-emerald-400">
                          {formatPhoneNumberDisplay(student?.parentPhone || 'N/A')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {student && (
                              <>
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={() => {
                                    dispatchNotification({
                                      student,
                                      schoolClass,
                                      phone: student.parentPhone,
                                      channel: 'WhatsApp',
                                      category: 'Fee Due Reminder',
                                      templateId: activeFeeTemplate.id,
                                      subject: activeFeeTemplate.subject,
                                      message,
                                      dispatchedBy: 'Accounts Fee Reminder Desk',
                                    });
                                    if (onBatchDispatched) onBatchDispatched();
                                  }}
                                  className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-700/80 hover:bg-emerald-600 text-white transition-colors cursor-pointer inline-flex items-center gap-1"
                                >
                                  <Smartphone className="w-3 h-3" /> WhatsApp
                                </a>
                                <a
                                  href={smsUrl}
                                  onClick={() => {
                                    dispatchNotification({
                                      student,
                                      schoolClass,
                                      phone: student.parentPhone,
                                      channel: 'SMS',
                                      category: 'Fee Due Reminder',
                                      templateId: activeFeeTemplate.id,
                                      subject: activeFeeTemplate.subject,
                                      message,
                                      dispatchedBy: 'Accounts Fee Reminder Desk',
                                    });
                                    if (onBatchDispatched) onBatchDispatched();
                                  }}
                                  className="px-2.5 py-1 rounded text-[11px] font-semibold bg-indigo-700/80 hover:bg-indigo-600 text-white transition-colors cursor-pointer inline-flex items-center gap-1"
                                >
                                  <MessageSquare className="w-3 h-3" /> SMS
                                </a>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
