import React, { useState } from 'react';
import {
  Sparkles,
  Loader2,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  Database,
  History,
} from 'lucide-react';
import {
  db,
  collection,
  addDoc,
  updateDocument,
  deleteDocument,
} from '../lib/firebase';
import {
  FirestoreStudent,
  AttendanceRecord,
  FeeRecord,
  SchoolClass,
  GradeRecord,
  TimetableRecord,
  LibraryBook,
  BookIssue,
} from '../types';

interface AiChatBoxProps {
  onPromptProcessed?: () => void;
  existingStudents: FirestoreStudent[];
  existingAttendance?: AttendanceRecord[];
  existingFees?: FeeRecord[];
  existingGrades?: GradeRecord[];
  existingTimetables?: TimetableRecord[];
  existingBooks?: LibraryBook[];
  existingIssues?: BookIssue[];
  classes?: SchoolClass[];
  loadDashboardData?: () => void;
}

const SAMPLE_COMMANDS = [
  'Library lehkhabu en rawh',
  'Class 10 timetable en rawh',
  'Student thar Zothanpudaia Roll 12 dah lut rawh',
  'Roll 3 absent ti rawh',
  'Roll 2 report card en rawh',
  'Roll 5 fee ₹2200 pe fel rawh',
];

export const AiChatBox: React.FC<AiChatBoxProps> = ({
  onPromptProcessed,
  existingStudents,
  existingAttendance = [],
  existingFees = [],
  existingGrades = [],
  existingTimetables = [],
  existingBooks = [],
  existingIssues = [],
  classes = [],
  loadDashboardData,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [responseStatus, setResponseStatus] = useState('Status: Hman a ni e...');
  const [lastActionBadge, setLastActionBadge] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionHistory, setActionHistory] = useState<
    { id: string; time: string; prompt: string; result: string; collection: string }[]
  >([]);

  const handleSendPrompt = async () => {
    const promptInputEl = document.getElementById('aiPromptInput') as HTMLInputElement;
    const promptText = promptInputEl?.value.trim() || inputValue.trim();
    const responseBox = document.getElementById('aiResponse');

    if (!promptText) return;

    setIsLoading(true);
    if (responseBox) {
      responseBox.innerText = 'AI processing... Data siam mek a ni.';
    }
    setResponseStatus('AI processing... Data siam mek a ni.');

    try {
      const lower = promptText.toLowerCase();
      let successMessage = '';
      let targetCollection = '';

      // 1. ADD NEW STUDENT RECORD
      if (
        lower.includes('student thar') ||
        lower.includes('zirlai thar') ||
        lower.includes('add student') ||
        lower.includes('new student') ||
        (lower.includes('dah lut') && !lower.includes('fee'))
      ) {
        targetCollection = 'students';
        const rollMatch =
          promptText.match(/roll\s*(?:no\.?|number|#)?\s*[:=]?\s*(\d+)/i) ||
          promptText.match(/\b(\d+)\s*(?:roll|ah)\b/i);

        const rollNo = rollMatch
          ? parseInt(rollMatch[1], 10)
          : existingStudents.length > 0
          ? Math.max(...existingStudents.map((s) => s.rollNo)) + 1
          : 1;

        let classId = 'class_10_a';
        let className = 'Class 10 - Section A';
        if (lower.includes('class 9') || lower.includes('class ix')) {
          classId = 'class_9_a';
          className = 'Class 9 - Section A';
        } else if (lower.includes('class 8') || lower.includes('class viii')) {
          classId = 'class_8_a';
          className = 'Class 8 - Section A';
        } else if (lower.includes('class 10 b') || lower.includes('section b')) {
          classId = 'class_10_b';
          className = 'Class 10 - Section B';
        }

        let studentName = promptText
          .replace(/^(?:please\s+)?(?:add\s+student|new\s+student|student\s+thar|zirlai\s+thar)\s+/i, '')
          .replace(/\s*roll\s*(?:no\.?|number|#)?\s*[:=]?\s*\d+/i, '')
          .replace(/\s*class\s*\d+[A-Za-z]?/i, '')
          .replace(/\s*(?:dah\s+lut\s+rawh|dah\s+lut\s+teh|dah\s+rawh|add\s+it|please|lut)\s*$/i, '')
          .trim();

        if (!studentName || studentName.length < 2) {
          studentName = `Student Roll ${rollNo}`;
        }

        // Write directly to 'students' collection via Firebase SDK v10.8.0
        const newStudentRef = await addDoc(collection(db, 'students'), {
          name: studentName,
          rollNo: rollNo,
          classId: classId,
          className: className,
          parentPhone: '+91 9862' + Math.floor(100000 + Math.random() * 900000),
          gender: 'Male',
          address: 'Aizawl, Mizoram',
          marks: 85,
          status: 'Active',
          createdAt: new Date().toISOString(),
          remarks: 'Added via AI Command Prompt',
        });

        // Also add corresponding attendance record for today
        await addDoc(collection(db, 'attendance'), {
          date: new Date().toISOString().slice(0, 10),
          studentId: newStudentRef.id,
          studentName: studentName,
          rollNo: rollNo,
          classId: classId,
          className: className,
          status: 'Present',
          markedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          remarks: 'Marked Present upon admission',
        });

        successMessage = `A hlawhtling e! Zirlai "${studentName}" (Roll ${rollNo}) chu 'students' Firestore collection-ah a lut ta.`;
        setLastActionBadge('Firestore write: col: students + attendance');
      }

      // 2. UPDATE ATTENDANCE RECORD (Present, Absent, Late)
      else if (
        lower.includes('absent') ||
        lower.includes('present') ||
        lower.includes('late') ||
        lower.includes('attendance')
      ) {
        targetCollection = 'attendance';
        const rollMatch =
          promptText.match(/roll\s*(?:no\.?|number|#)?\s*[:=]?\s*(\d+)/i) ||
          promptText.match(/\b(\d+)\s*(?:roll|ah)\b/i);

        let targetStatus: 'Present' | 'Absent' | 'Late' = 'Present';
        if (lower.includes('absent') || lower.includes('kal lo')) {
          targetStatus = 'Absent';
        } else if (lower.includes('late') || lower.includes('tlai')) {
          targetStatus = 'Late';
        }

        if (rollMatch) {
          const rollNo = parseInt(rollMatch[1], 10);
          const student = existingStudents.find((s) => s.rollNo === rollNo);
          const studentName = student ? student.name : `Roll ${rollNo}`;
          const existingAtt = existingAttendance.find((a) => a.rollNo === rollNo);

          const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          if (existingAtt) {
            await updateDocument('attendance', existingAtt.id, {
              status: targetStatus,
              markedAt: timeNow,
            });
          } else {
            await addDoc(collection(db, 'attendance'), {
              date: new Date().toISOString().slice(0, 10),
              studentId: student ? student.id : `std-${rollNo}`,
              studentName,
              rollNo,
              classId: student ? student.classId : 'class_10_a',
              className: student ? student.className : 'Class 10 - Section A',
              status: targetStatus,
              markedAt: timeNow,
              remarks: `Updated via AI: ${targetStatus}`,
            });
          }

          successMessage = `Attendance update hlawhtling! Roll #${rollNo} (${studentName}) chu "${targetStatus}" tiin 'attendance' collection-ah dah a ni e.`;
          setLastActionBadge(`Firestore update: col: attendance (${targetStatus})`);
        } else {
          // If asking who is absent
          const absentList = existingAttendance
            .filter((a) => a.status === 'Absent')
            .map((a) => `#${a.rollNo} ${a.studentName}`);

          if (absentList.length > 0) {
            successMessage = `Vawiin-ah zirlai ${absentList.length} an absent: ${absentList.join(', ')}.`;
          } else {
            successMessage = 'Vawiin hian absent an awm lo, zirlai zawng zawng an kal e!';
          }
          setLastActionBadge('Firestore query: col: attendance');
        }
      }

      // 3. RECORD OR UPDATE FEE / CHECK FEES
      else if (lower.includes('fee') || lower.includes('sum') || lower.includes('chawi') || lower.includes('pay')) {
        targetCollection = 'fees';
        const rollMatch =
          promptText.match(/roll\s*(?:no\.?|number|#)?\s*[:=]?\s*(\d+)/i) ||
          promptText.match(/\b(\d+)\s*(?:roll|ah)\b/i);

        // Check if query or payment
        const isPayment =
          lower.includes('pe fel') ||
          lower.includes('paid') ||
          lower.includes('pay') ||
          lower.includes('chawi') ||
          lower.includes('record');

        if (rollMatch) {
          const rollNo = parseInt(rollMatch[1], 10);
          const student = existingStudents.find((s) => s.rollNo === rollNo);
          const studentName = student ? student.name : `Roll ${rollNo}`;
          const existingFee = existingFees.find((f) => f.rollNo === rollNo);

          if (isPayment) {
            // Extract custom amount if given (e.g. ₹2200 or 1000)
            const amtMatch = promptText.match(/(?:₹|rs\.?|inr)?\s*(\d{3,5})/i);
            const amountPaid = amtMatch ? parseInt(amtMatch[1], 10) : 2200;
            const receiptNo = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

            if (existingFee) {
              const newPaid = Math.min(existingFee.totalAmount, (existingFee.paidAmount || 0) + amountPaid);
              const newStatus = newPaid >= existingFee.totalAmount ? 'Paid' : 'Partial';
              await updateDocument('fees', existingFee.id, {
                paidAmount: newPaid,
                status: newStatus,
                paymentMethod: 'UPI (GPay)',
                receiptNo,
                updatedAt: new Date().toISOString(),
              });
            } else {
              await addDoc(collection(db, 'fees'), {
                studentId: student ? student.id : `std-${rollNo}`,
                studentName,
                rollNo,
                classId: student ? student.classId : 'class_10_a',
                className: student ? student.className : 'Class 10 - Section A',
                feeMonth: 'September 2026',
                totalAmount: 2200,
                paidAmount: amountPaid,
                status: amountPaid >= 2200 ? 'Paid' : 'Partial',
                dueDate: '2026-09-25',
                paymentMethod: 'UPI (GPay)',
                receiptNo,
                updatedAt: new Date().toISOString(),
              });
            }

            successMessage = `Fee payment hlawhtling! Roll #${rollNo} (${studentName}) tan ₹${amountPaid.toLocaleString()} 'fees' collection-ah ziak luh a ni e. (Receipt: ${receiptNo})`;
            setLastActionBadge('Firestore write: col: fees');
          } else {
            // Query fee status for this roll number
            if (existingFee) {
              const due = Math.max(0, existingFee.totalAmount - existingFee.paidAmount);
              successMessage = `Roll #${rollNo} (${studentName}) Fee Dinhmun: Status chu "${existingFee.status}", Amount chawi tawh: ₹${existingFee.paidAmount}, Due la awm: ₹${due}. (Receipt: ${existingFee.receiptNo})`;
            } else {
              successMessage = `Roll #${rollNo} (${studentName}) fee record September thla atan hmuh a ni lo. Record thar siam a theih e.`;
            }
            setLastActionBadge('Firestore query: col: fees');
          }
        } else {
          // General fee query
          const unpaid = existingFees.filter((f) => f.status === 'Pending' || f.status === 'Overdue');
          const totalCollected = existingFees.reduce((acc, f) => acc + f.paidAmount, 0);
          successMessage = `Total Fee Collected: ₹${totalCollected.toLocaleString()}. Zirlai ${unpaid.length} ten fee an la pe lo: ${unpaid.map((u) => `#${u.rollNo} ${u.studentName}`).join(', ')}.`;
          setLastActionBadge('Firestore query: col: fees');
        }
      }

      // 4. EXAM GRADES & REPORT CARD COMMANDS / QUERIES
      else if (
        lower.includes('grade') ||
        lower.includes('marks') ||
        lower.includes('report card') ||
        lower.includes('exam') ||
        lower.includes('topper') ||
        lower.includes('percentage')
      ) {
        targetCollection = 'grades';
        const rollMatch = promptText.match(/roll\s*(?:no\.?|number|#)?\s*[:=]?\s*(\d+)/i) || promptText.match(/\b(\d+)\b/);
        const rollNo = rollMatch ? parseInt(rollMatch[1], 10) : null;

        if (rollNo) {
          const studentGrade = existingGrades.find((g) => g.rollNo === rollNo);
          if (studentGrade) {
            successMessage = `Roll #${rollNo} (${studentGrade.studentName}) - ${studentGrade.examTerm}: Total Marks: ${studentGrade.totalMarksObtained}/${studentGrade.totalMaxMarks} (${studentGrade.percentage}%), Grade: ${studentGrade.overallGrade}, Status: ${studentGrade.status}. Remarks: "${studentGrade.teacherRemarks}"`;
            setLastActionBadge('Firestore query: col: grades');
          } else {
            const student = existingStudents.find((s) => s.rollNo === rollNo);
            successMessage = `Roll #${rollNo} (${student ? student.name : 'Student'}) tan exam grade la ziah luh a ni lo. Gradebook tab atangin a ziah luh theih e.`;
            setLastActionBadge('Firestore query: col: grades');
          }
        } else if (lower.includes('topper') || lower.includes('highest')) {
          if (existingGrades.length > 0) {
            const sorted = [...existingGrades].sort((a, b) => b.percentage - a.percentage);
            const top = sorted[0];
            successMessage = `Exam Topper chu Roll #${top.rollNo} (${top.studentName}) a ni e! Score: ${top.percentage}% (Grade ${top.overallGrade}, Marks: ${top.totalMarksObtained}/${top.totalMaxMarks}).`;
          } else {
            successMessage = 'Gradebook-ah exam records a la awm rih lo.';
          }
          setLastActionBadge('Firestore query: col: grades');
        } else {
          // General exam overview
          const totalGrades = existingGrades.length;
          const passed = existingGrades.filter((g) => g.status === 'Passed').length;
          const avg = totalGrades > 0 ? (existingGrades.reduce((a, b) => a + b.percentage, 0) / totalGrades).toFixed(1) : '0';
          successMessage = `Exam Gradebook Summary: Zirlai ${totalGrades} marks ziah luh tawh a ni a, Pass rate chu ${totalGrades > 0 ? Math.round((passed / totalGrades) * 100) : 0}% a ni. Class average: ${avg}%.`;
          setLastActionBadge('Firestore query: col: grades');
        }
      }

      // 5. TIMETABLE & CLASS ROUTINE QUERIES
      else if (
        lower.includes('timetable') ||
        lower.includes('routine') ||
        lower.includes('schedule') ||
        lower.includes('period') ||
        lower.includes('vawiin class')
      ) {
        targetCollection = 'timetables';
        // Check if query specifies a class like Class 10 or Class 9
        const isClass9 = lower.includes('class 9') || lower.includes('class ix');
        const targetClassId = isClass9 ? 'class_9_a' : 'class_10_a';
        const targetTt = existingTimetables.find((t) => t.classId === targetClassId) || existingTimetables[0];

        // Determine target day
        const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const matchedDay = daysList.find((d) => lower.includes(d.toLowerCase())) || 'Monday';

        if (targetTt) {
          const daySlots = targetTt.slots
            .filter((s) => s.dayOfWeek.toLowerCase() === matchedDay.toLowerCase() && !s.isBreak)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          const slotSummary = daySlots
            .slice(0, 4)
            .map((s) => `[${s.periodLabel} (${s.startTime}): ${s.subject} - ${s.teacherName}]`)
            .join(', ');

          successMessage = `${targetTt.className} ${matchedDay} Routine: ${slotSummary}... (Total ${daySlots.length} periods). Status: ${targetTt.status}.`;
          setLastActionBadge('Firestore query: col: timetables');
        } else {
          successMessage = 'Timetable records la awm rih lo. Timetable tab-ah MBSE routine a siam theih e.';
          setLastActionBadge('Firestore query: col: timetables');
        }
      }

      // 6. LIBRARY & BOOK QUERIES
      else if (
        lower.includes('library') ||
        lower.includes('lehkhabu') ||
        lower.includes('book') ||
        lower.includes('loan') ||
        lower.includes('overdue')
      ) {
        targetCollection = 'library_books';
        const totalTitles = existingBooks.length;
        const totalCopies = existingBooks.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
        const availableCopies = existingBooks.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
        const overdueCount = existingIssues.filter((i) => i.status === 'Overdue' || (i.status === 'Issued' && new Date(i.dueDate) < new Date())).length;

        if (lower.includes('overdue') || lower.includes('tlai')) {
          successMessage = `Library Overdue Status: Lehkhabu ${overdueCount} hun tiam aia tlai a awm e. Library tab-ah parent notice thawn theih a ni.`;
        } else {
          successMessage = `Library Inventory: Lehkhabu titles ${totalTitles} (Total copies: ${totalCopies}), Available on shelf: ${availableCopies} copies. Overdue loans: ${overdueCount}.`;
        }
        setLastActionBadge('Firestore query: col: library_books');
      }

      // 7. GENERAL QUERIES & CLASS COUNT
      else if (lower.includes('engzat') || lower.includes('how many') || lower.includes('zirlai')) {
        const total = existingStudents.length;
        const boys = existingStudents.filter((s) => s.gender === 'Male').length;
        const girls = existingStudents.filter((s) => s.gender === 'Female').length;
        successMessage = `Zirlai zawng zawng ${total} an awm e. Mipa: ${boys}, Hmeichhia: ${girls}. Classes: 5 (Class 8, 9, 10).`;
        setLastActionBadge('Firestore query: col: students');
        targetCollection = 'students';
      }

      // FALLBACK
      else {
        successMessage =
          "Prompt hi ka hrethiam chiah lo. Entirnan: 'Student thar Zothanpudaia Roll 12 dah lut rawh', 'Roll 3 absent ti rawh', emaw 'Roll 5 fee ₹2200 pe fel rawh' tiin ziah tum chhin rawh.";
        setLastActionBadge(null);
      }

      // Update response in DOM and state
      if (responseBox) {
        responseBox.innerText = successMessage;
      }
      setResponseStatus(successMessage);

      // Record to history
      setActionHistory((prev) => [
        {
          id: `hist-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          prompt: promptText,
          result: successMessage,
          collection: targetCollection || 'general',
        },
        ...prev.slice(0, 4),
      ]);

      // Call refresh callbacks
      if (loadDashboardData) {
        loadDashboardData();
      }
      if (onPromptProcessed) {
        onPromptProcessed();
      }
      setInputValue('');
    } catch (err: any) {
      const errorMsg = 'Error: ' + (err?.message || 'Database execution error');
      if (responseBox) {
        responseBox.innerText = errorMsg;
      }
      setResponseStatus(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 shadow-lg text-gray-100 relative overflow-hidden">
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              AI Chat Command / Prompt Interface
            </h3>
            <p className="text-[11px] text-gray-400">
              Direct natural language write & query engine for Firestore collections
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastActionBadge && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
              {lastActionBadge}
            </span>
          )}
          <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono flex items-center gap-1">
            <Database className="w-3 h-3" />
            Firestore Linked
          </span>
        </div>
      </div>

      {/* Input Row with exact required HTML IDs */}
      <div className="flex gap-2">
        <input
          type="text"
          id="aiPromptInput"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Entirnan: Student thar Zothanpudaia Roll 12 dah lut rawh..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
        />
        <button
          id="aiSendBtn"
          type="button"
          onClick={handleSendPrompt}
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-500 px-4 sm:px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Chhanchhuak mek...</span>
            </>
          ) : (
            <>
              <span>Run Prompt</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Exact required response element */}
      <div className="mt-2.5 flex items-start gap-2 bg-gray-900/60 rounded-md p-2.5 border border-gray-700/60">
        <div className="mt-0.5 text-indigo-400 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" />
        </div>
        <p id="aiResponse" className="text-xs text-gray-300 leading-relaxed font-sans">
          {responseStatus}
        </p>
      </div>

      {/* Sample clickable suggestion chips */}
      <div className="mt-3 pt-3 border-t border-gray-700/60 flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 mr-1">
          <Lightbulb className="w-3 h-3 text-amber-400" />
          Click to try:
        </span>
        {SAMPLE_COMMANDS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInputValue(sample)}
            className="px-2.5 py-1 rounded bg-gray-700/60 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border border-gray-600/50 text-[11.5px] cursor-pointer"
          >
            {sample}
          </button>
        ))}
      </div>

      {/* Action History Drawer */}
      {actionHistory.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-gray-700/40">
          <div className="text-[11px] font-semibold text-gray-400 flex items-center gap-1.5 mb-1.5">
            <History className="w-3 h-3 text-gray-400" />
            Recent Firestore Actions
          </div>
          <div className="space-y-1">
            {actionHistory.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-[11px] px-2 py-1 rounded bg-gray-900/40 text-gray-400"
              >
                <span className="truncate max-w-xs text-gray-300">"{item.prompt}"</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-indigo-400 text-[10px]">col: {item.collection}</span>
                  <span className="text-gray-400 text-[10px]">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
