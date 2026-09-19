import React, { useState, useMemo } from 'react';
import {
  Send,
  Smartphone,
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Users,
  User,
  Building2,
  Calendar,
  DollarSign,
  Info,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import {
  FirestoreStudent,
  SchoolClass,
  FeeRecord,
  AttendanceRecord,
  NotificationTemplate,
  NotificationChannel,
  NotificationCategory,
} from '../../types';
import { DEFAULT_NOTIFICATION_TEMPLATES } from '../../data/seedNotifications';
import {
  formatPhoneNumberDisplay,
  formatPhoneNumberForApi,
  generateWhatsAppLink,
  generateSmsLink,
  calculateSmsSegments,
  interpolateTemplate,
  dispatchNotification,
} from '../../lib/notificationService';

interface TemplateComposerViewProps {
  students: FirestoreStudent[];
  classes: SchoolClass[];
  fees: FeeRecord[];
  attendance: AttendanceRecord[];
  onNotificationDispatched?: () => void;
  preselectedStudentId?: string;
  preselectedCategory?: NotificationCategory;
}

export const TemplateComposerView: React.FC<TemplateComposerViewProps> = ({
  students,
  classes,
  fees,
  attendance,
  onNotificationDispatched,
  preselectedStudentId,
  preselectedCategory,
}) => {
  // Active Template & Language
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    DEFAULT_NOTIFICATION_TEMPLATES[0].id
  );
  const [languageFilter, setLanguageFilter] = useState<'All' | 'Mizo' | 'English' | 'Bilingual'>('All');
  const [activeCategory, setActiveCategory] = useState<NotificationCategory | 'All'>(
    preselectedCategory || 'All'
  );

  // Target Recipient Mode
  const [recipientMode, setRecipientMode] = useState<'student' | 'class' | 'school'>('student');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    preselectedStudentId || (students[0]?.id ?? '')
  );
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id ?? '');
  const [manualPhone, setManualPhone] = useState<string>('');

  // Editable Message State
  const [subject, setSubject] = useState<string>(DEFAULT_NOTIFICATION_TEMPLATES[0].subject || '');
  const [templateContent, setTemplateContent] = useState<string>(
    DEFAULT_NOTIFICATION_TEMPLATES[0].content
  );
  const [preferredChannel, setPreferredChannel] = useState<NotificationChannel>('WhatsApp');

  // Interactive Custom Parameters
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customAmount, setCustomAmount] = useState<number>(2200);
  const [customDueDate, setCustomDueDate] = useState<string>('2026-09-25');

  // Dispatch Status State
  const [isSending, setIsSending] = useState(false);
  const [sentSuccessMsg, setSentSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Resolve Context Data
  const currentStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) || students[0],
    [students, selectedStudentId]
  );

  const currentClass = useMemo(
    () => classes.find((c) => c.id === (recipientMode === 'class' ? selectedClassId : currentStudent?.classId)) || classes[0],
    [classes, recipientMode, selectedClassId, currentStudent]
  );

  const currentFee = useMemo(
    () => fees.find((f) => f.studentId === currentStudent?.id),
    [fees, currentStudent]
  );

  const currentAttendance = useMemo(
    () => attendance.find((a) => a.studentId === currentStudent?.id),
    [attendance, currentStudent]
  );

  // Set default manual phone when student changes
  React.useEffect(() => {
    if (currentStudent && recipientMode === 'student') {
      setManualPhone(currentStudent.parentPhone);
      if (currentFee?.balanceAmount) {
        setCustomAmount(currentFee.balanceAmount);
      } else if (currentStudent.totalFeesDue) {
        setCustomAmount(currentStudent.totalFeesDue);
      }
    }
  }, [currentStudent, recipientMode, currentFee]);

  // Filter templates list
  const filteredTemplates = useMemo(() => {
    return DEFAULT_NOTIFICATION_TEMPLATES.filter((t) => {
      if (languageFilter !== 'All' && t.language !== languageFilter) return false;
      if (activeCategory !== 'All' && t.category !== activeCategory) return false;
      return true;
    });
  }, [languageFilter, activeCategory]);

  // Load a chosen template
  const handleSelectTemplate = (template: NotificationTemplate) => {
    setSelectedTemplateId(template.id);
    setSubject(template.subject || `${template.category} - ZOXS`);
    setTemplateContent(template.content);
    setPreferredChannel(template.defaultChannel);
    setSentSuccessMsg(null);
  };

  // Interpolate dynamic message for preview and sending
  const renderedMessage = useMemo(() => {
    return interpolateTemplate(templateContent, {
      student: recipientMode === 'student' ? currentStudent : undefined,
      schoolClass: currentClass,
      feeRecord: currentFee,
      attendanceRecord: currentAttendance,
      customDate,
      customAmount,
      customDueDate,
      schoolName: 'ZOXS Higher Secondary School, Aizawl',
      teacherName: currentClass?.teacherName || 'Class Teacher',
    });
  }, [
    templateContent,
    recipientMode,
    currentStudent,
    currentClass,
    currentFee,
    currentAttendance,
    customDate,
    customAmount,
    customDueDate,
  ]);

  // Character & Segment Counter
  const smsSegments = useMemo(() => calculateSmsSegments(renderedMessage), [renderedMessage]);

  // Insert Variable Token into textarea
  const handleInsertToken = (token: string) => {
    setTemplateContent((prev) => `${prev} ${token}`);
  };

  // Target Destination Phone
  const targetPhone = recipientMode === 'student' ? manualPhone || currentStudent?.parentPhone : 'Class Broadcast';

  // Handle WhatsApp API Send
  const handleSendWhatsApp = async () => {
    if (recipientMode === 'student' && !targetPhone) {
      alert('Please provide a valid parent phone number.');
      return;
    }

    setIsSending(true);
    try {
      const waUrl = generateWhatsAppLink(targetPhone, renderedMessage);
      window.open(waUrl, '_blank');

      await dispatchNotification({
        student: recipientMode === 'student' ? currentStudent : undefined,
        schoolClass: recipientMode === 'class' ? currentClass : undefined,
        phone: targetPhone,
        channel: 'WhatsApp',
        category: (DEFAULT_NOTIFICATION_TEMPLATES.find((t) => t.id === selectedTemplateId)?.category || 'Custom'),
        templateId: selectedTemplateId,
        subject,
        message: renderedMessage,
        dispatchedBy: 'School SMS & WhatsApp Desk',
      });

      setSentSuccessMsg(
        `WhatsApp message generated and logged to Firestore for ${recipientMode === 'student' ? currentStudent?.name : currentClass?.name}!`
      );
      if (onNotificationDispatched) onNotificationDispatched();
    } catch (err) {
      console.error('Error dispatching WhatsApp', err);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Native Device SMS
  const handleSendNativeSms = async () => {
    if (recipientMode === 'student' && !targetPhone) {
      alert('Please provide a valid parent phone number.');
      return;
    }

    setIsSending(true);
    try {
      const smsUrl = generateSmsLink(targetPhone, renderedMessage);
      window.location.href = smsUrl;

      await dispatchNotification({
        student: recipientMode === 'student' ? currentStudent : undefined,
        schoolClass: recipientMode === 'class' ? currentClass : undefined,
        phone: targetPhone,
        channel: 'SMS',
        category: (DEFAULT_NOTIFICATION_TEMPLATES.find((t) => t.id === selectedTemplateId)?.category || 'Custom'),
        templateId: selectedTemplateId,
        subject,
        message: renderedMessage,
        dispatchedBy: 'School SMS & WhatsApp Desk',
      });

      setSentSuccessMsg(`Native device SMS dispatched and logged for ${targetPhone}!`);
      if (onNotificationDispatched) onNotificationDispatched();
    } catch (err) {
      console.error('Error dispatching SMS', err);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Gateway Simulated Dispatch
  const handleSendGatewaySms = async () => {
    setIsSending(true);
    try {
      const log = await dispatchNotification({
        student: recipientMode === 'student' ? currentStudent : undefined,
        schoolClass: recipientMode === 'class' ? currentClass : undefined,
        phone: targetPhone,
        channel: preferredChannel,
        category: (DEFAULT_NOTIFICATION_TEMPLATES.find((t) => t.id === selectedTemplateId)?.category || 'Custom'),
        templateId: selectedTemplateId,
        subject,
        message: renderedMessage,
        dispatchedBy: 'School DLT Gateway Server',
      });

      setSentSuccessMsg(
        `Successfully dispatched via official ${preferredChannel} Gateway (Ref: ${log.gatewayRef}) to ${targetPhone}!`
      );
      if (onNotificationDispatched) onNotificationDispatched();
    } catch (err) {
      console.error('Error dispatching gateway', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(renderedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Quick Template Category Filters */}
      <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">
              Automated Message Template Generator
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Generate customized bilingual alerts in Mizo & English for attendance, fees, and school circulars.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'All', label: 'All Templates' },
              { id: 'Attendance Alert', label: 'Absent Alerts' },
              { id: 'Fee Due Reminder', label: 'Fee Reminders' },
              { id: 'School Announcement', label: 'Announcements' },
              { id: 'Exam Notice', label: 'Exam Notices' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-900/60 text-gray-400 hover:text-gray-200 hover:bg-gray-700/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Template Selection & Composer Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Template Preset Selector Carousel */}
          <div className="bg-gray-800/60 border border-gray-700/70 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                1. Select Notification Template ({filteredTemplates.length})
              </span>
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-gray-400 mr-1">Language:</span>
                {(['All', 'Mizo', 'English', 'Bilingual'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguageFilter(lang)}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      languageFilter === lang
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {filteredTemplates.map((tmpl) => {
                const isSelected = tmpl.id === selectedTemplateId;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl)}
                    className={`p-3 rounded-xl text-left transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-white ring-1 ring-emerald-500/30'
                        : 'bg-gray-900/60 border-gray-700/60 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-xs text-white truncate">{tmpl.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                          tmpl.language === 'Mizo'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : tmpl.language === 'Bilingual'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {tmpl.language}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipient Target Settings */}
          <div className="bg-gray-800/60 border border-gray-700/70 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                2. Target Recipient & Phone Number
              </span>
              <div className="flex items-center gap-1 bg-gray-900 p-0.5 rounded-lg border border-gray-700">
                <button
                  type="button"
                  onClick={() => setRecipientMode('student')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    recipientMode === 'student' ? 'bg-emerald-600 text-white font-semibold' : 'text-gray-400'
                  }`}
                >
                  <User className="w-3 h-3" /> Individual Student
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientMode('class')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    recipientMode === 'class' ? 'bg-emerald-600 text-white font-semibold' : 'text-gray-400'
                  }`}
                >
                  <Users className="w-3 h-3" /> Class
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientMode('school')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    recipientMode === 'school' ? 'bg-emerald-600 text-white font-semibold' : 'text-gray-400'
                  }`}
                >
                  <Building2 className="w-3 h-3" /> All School
                </button>
              </div>
            </div>

            {recipientMode === 'student' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">
                    Select Student from Firestore
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-100 focus:border-emerald-500 focus:outline-none"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Roll #{s.rollNo} • {s.className})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">
                    Parent Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="+91 98621 12345"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {recipientMode === 'class' && (
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">
                  Target School Class
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-100 focus:border-emerald-500 focus:outline-none"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.teacherName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {recipientMode === 'school' && (
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>School-Wide Broadcast will target all enrolled parents ({students.length} active students).</span>
              </div>
            )}
          </div>

          {/* Dynamic Template Content Editor */}
          <div className="bg-gray-800/60 border border-gray-700/70 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                3. Customize Content & Dynamic Variables
              </span>
              <span className="text-[11px] text-amber-400">
                Click variable pills below to insert:
              </span>
            </div>

            {/* Variable Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { token: '{{student_name}}', label: 'Student Name' },
                { token: '{{roll_no}}', label: 'Roll No' },
                { token: '{{class_name}}', label: 'Class' },
                { token: '{{amount_due}}', label: 'Due Amount' },
                { token: '{{due_date}}', label: 'Due Date' },
                { token: '{{date}}', label: 'Date' },
                { token: '{{teacher_name}}', label: 'Teacher' },
                { token: '{{school_name}}', label: 'School Name' },
              ].map((v) => (
                <button
                  key={v.token}
                  type="button"
                  onClick={() => handleInsertToken(v.token)}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-gray-900 hover:bg-gray-700 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
                  title={`Insert ${v.token}`}
                >
                  +{v.label}
                </button>
              ))}
            </div>

            {/* Subject Input */}
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">Message Subject / Headline</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Template Body Textarea */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                <span>Message Body (with placeholders)</span>
                <span className="font-mono text-gray-400">
                  {templateContent.length} chars
                </span>
              </div>
              <textarea
                rows={6}
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-xs text-gray-100 font-mono focus:border-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Context Adjustment Inputs */}
            <div className="grid grid-cols-3 gap-2 text-xs pt-1">
              <div>
                <label className="block text-[10px] text-gray-400 mb-0.5">Date Placeholder</label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-[11px] text-gray-200"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-0.5">Fee Amount (₹)</label>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-[11px] text-gray-200"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-0.5">Due Date</label>
                <input
                  type="text"
                  value={customDueDate}
                  onChange={(e) => setCustomDueDate(e.target.value)}
                  placeholder="YYYY-MM-DD"
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-[11px] text-gray-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Rendered Preview & Dispatch Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Live Mobile Message Preview Card */}
          <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-700/80">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Recipient Preview
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 font-mono">
                  {smsSegments.charCount} chars • {smsSegments.segments} {smsSegments.segments === 1 ? 'SMS' : 'Parts'}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer"
                  title="Copy preview text"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Recipient Header Info */}
            <div className="bg-gray-900/90 rounded-xl p-3 border border-gray-750 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-400 block text-[10px]">To Recipient:</span>
                <span className="font-bold text-white text-sm">
                  {recipientMode === 'student' ? currentStudent?.name : currentClass?.name}
                </span>
                <span className="text-gray-400 block text-[11px]">
                  {recipientMode === 'student' ? `${currentStudent?.className} • Roll #${currentStudent?.rollNo}` : 'All Class Parents'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 block text-[10px]">Destination:</span>
                <span className="font-mono text-emerald-400 font-bold text-xs block">
                  {formatPhoneNumberDisplay(targetPhone)}
                </span>
                <span className="text-[10px] text-gray-400">
                  wa.me/91{formatPhoneNumberForApi(targetPhone).slice(-10)}
                </span>
              </div>
            </div>

            {/* Simulated Chat Message Bubble */}
            <div className="bg-emerald-950/30 border border-emerald-600/30 rounded-2xl p-4 text-xs text-gray-100 space-y-2 relative">
              <div className="flex items-center justify-between text-[10px] text-emerald-400 font-semibold border-b border-emerald-500/20 pb-1">
                <span>ZOXS Higher Secondary School</span>
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-gray-100">
                {renderedMessage}
              </div>
              <div className="flex justify-end pt-1">
                <span className="text-[10px] text-emerald-400/80 font-mono flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" /> WhatsApp / SMS Ready
                </span>
              </div>
            </div>

            {/* Success Confirmation Toast */}
            {sentSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Notice Dispatched & Recorded!</span>
                  <p className="text-[11px] text-emerald-200/90 mt-0.5">{sentSuccessMsg}</p>
                </div>
              </div>
            )}

            {/* Dispatch Integration Buttons */}
            <div className="space-y-2.5 pt-2 border-t border-gray-700/80">
              <span className="text-[11px] font-bold text-gray-300 block">
                Direct Integration Dispatch
              </span>

              {/* WhatsApp wa.me API Button */}
              <button
                type="button"
                disabled={isSending}
                onClick={handleSendWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Smartphone className="w-4 h-4" />
                <span>Launch WhatsApp API (wa.me) & Log</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* Native Device SMS link */}
                <button
                  type="button"
                  disabled={isSending}
                  onClick={handleSendNativeSms}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-700 hover:bg-indigo-600 text-white transition-colors cursor-pointer disabled:opacity-50"
                  title="Opens device SMS composer (sms: protocol)"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Native SMS App</span>
                </button>

                {/* Simulated Server Gateway Dispatch */}
                <button
                  type="button"
                  disabled={isSending}
                  onClick={handleSendGatewaySms}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer disabled:opacity-50"
                  title="Direct Gov/DLT SMS Gateway API"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>SMS DLT Gateway</span>
                </button>
              </div>

              <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                All dispatched alerts are automatically committed to the Firestore{' '}
                <span className="text-emerald-400 font-mono">notifications</span> audit collection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
