import { AICommandResult, Student } from '../types';

/**
 * Intelligent local natural language processor for Mizo & English commands.
 * Used as fallback if GEMINI_API_KEY is not configured or network request fails.
 */
export function parseLocalCommand(prompt: string, currentStudents: Student[]): AICommandResult {
  const cleanPrompt = prompt.trim();
  const lower = cleanPrompt.toLowerCase();

  // 1. ADD STUDENT
  // e.g. "Student thar Zothanpudaia Roll 12 dah lut rawh"
  // e.g. "Add student John Doe Roll 15 Class 10A"
  // e.g. "Zirlai thar Lalrintluanga Roll 9 dah rawh"
  const isAdd =
    lower.includes('student thar') ||
    lower.includes('zirlai thar') ||
    lower.startsWith('add student') ||
    lower.startsWith('new student') ||
    (lower.includes('dah lut') && (lower.includes('student') || lower.includes('zirlai') || lower.includes('roll')));

  if (isAdd) {
    // Extract roll number
    const rollMatch = cleanPrompt.match(/roll\s*(?:no\.?|number|#)?\s*[:=]?\s*(\d+)/i) ||
                      cleanPrompt.match(/\b(\d+)\s*(?:roll|ah)\b/i);
    const rollNumber = rollMatch ? parseInt(rollMatch[1], 10) : (currentStudents.length > 0 ? Math.max(...currentStudents.map(s => s.rollNumber)) + 1 : 1);

    // Extract class/section if mentioned
    let studentClass = 'Class 10';
    let section = 'A';
    const classMatch = cleanPrompt.match(/class\s*(\d+[A-Za-z]?)/i);
    if (classMatch) {
      const clsVal = classMatch[1];
      const secChar = clsVal.slice(-1);
      if (/[A-Za-z]/.test(secChar)) {
        studentClass = `Class ${clsVal.slice(0, -1)}`;
        section = secChar.toUpperCase();
      } else {
        studentClass = `Class ${clsVal}`;
      }
    }

    // Extract name
    // Pattern: remove "Student thar", "Zirlai thar", "Add student", "Roll XX", "dah lut rawh", etc.
    let namePart = cleanPrompt
      .replace(/^(?:please\s+)?(?:add\s+student|new\s+student|student\s+thar|zirlai\s+thar)\s+/i, '')
      .replace(/\s*roll\s*(?:no\.?|number|#)?\s*[:=]?\s*\d+/i, '')
      .replace(/\s*class\s*\d+[A-Za-z]?/i, '')
      .replace(/\s*(?:dah\s+lut\s+rawh|dah\s+lut\s+teh|dah\s+rawh|add\s+it|please|lut)\s*$/i, '')
      .trim();

    // If namePart is empty or just punctuation
    if (!namePart || namePart.length < 2) {
      namePart = `Student #${rollNumber}`;
    }

    return {
      action: 'ADD_STUDENT',
      success: true,
      message: `Zirlai thar "${namePart}" (Roll ${rollNumber}, ${studentClass}-${section}) chu tluang takin dah luh a ni e.`,
      data: {
        student: {
          name: namePart,
          rollNumber,
          class: studentClass,
          section,
          gender: 'Male',
          attendance: 'Present',
          marks: 80,
          guardianPhone: '+91 9862' + Math.floor(100000 + Math.random() * 900000),
          remarks: 'Added via AI Command',
        },
      },
    };
  }

  // 2. ATTENDANCE
  // e.g. "Roll 12 attendance Present dah rawh"
  // e.g. "Roll 3 absent ti rawh"
  // e.g. "Mark roll 5 as present"
  const isAttendance =
    lower.includes('attendance') ||
    lower.includes('present') ||
    lower.includes('absent') ||
    lower.includes('late');

  if (isAttendance && (lower.includes('roll') || /\b\d+\b/.test(lower))) {
    const rollMatch = cleanPrompt.match(/roll\s*(?:no\.?|number|#)?\s*[:=]?\s*(\d+)/i) || cleanPrompt.match(/\b(\d+)\b/);
    if (rollMatch) {
      const rollNumber = parseInt(rollMatch[1], 10);
      let status: 'Present' | 'Absent' | 'Late' = 'Present';
      if (lower.includes('absent') || lower.includes('chawl')) status = 'Absent';
      else if (lower.includes('late') || lower.includes('tlai')) status = 'Late';
      else status = 'Present';

      const existing = currentStudents.find(s => s.rollNumber === rollNumber);
      const studentName = existing ? existing.name : `Roll ${rollNumber}`;

      return {
        action: 'MARK_ATTENDANCE',
        success: true,
        message: `Roll ${rollNumber} (${studentName}) attendance chu "${status}"-ah thlak fel a ni e.`,
        data: {
          rollNumber,
          attendance: status,
        },
      };
    }
  }

  // 3. UPDATE MARKS
  // e.g. "Roll 12 mark 95 ah thlak rawh"
  // e.g. "Update marks of Roll 4 to 88"
  if (lower.includes('mark') || lower.includes('score')) {
    const rollMatch = cleanPrompt.match(/roll\s*(?:no\.?|number|#)?\s*[:=]?\s*(\d+)/i) || cleanPrompt.match(/\b(\d+)\b/);
    const markMatch = cleanPrompt.match(/(?:mark|score|to|ah)\s*[:=]?\s*(\d{1,3})/i) || cleanPrompt.match(/\b(\d{1,3})\s*(?:marks?|ah)\b/i);
    
    if (rollMatch && markMatch) {
      const rollNumber = parseInt(rollMatch[1], 10);
      const marks = Math.min(100, Math.max(0, parseInt(markMatch[1], 10)));
      const existing = currentStudents.find(s => s.rollNumber === rollNumber);
      const studentName = existing ? existing.name : `Roll ${rollNumber}`;

      return {
        action: 'UPDATE_STUDENT',
        success: true,
        message: `Roll ${rollNumber} (${studentName}) marks chu ${marks} ah update a ni e.`,
        data: {
          rollNumber,
          marks,
        },
      };
    }
  }

  // 4. DELETE / REMOVE STUDENT
  // e.g. "Roll 5 paih rawh" / "Delete roll 3"
  if (lower.includes('paih') || lower.includes('delete') || lower.includes('remove') || lower.includes('thaibo')) {
    const rollMatch = cleanPrompt.match(/roll\s*(?:no\.?|number|#)?\s*[:=]?\s*(\d+)/i) || cleanPrompt.match(/\b(\d+)\b/);
    if (rollMatch) {
      const rollNumber = parseInt(rollMatch[1], 10);
      const existing = currentStudents.find(s => s.rollNumber === rollNumber);
      const studentName = existing ? existing.name : `Roll ${rollNumber}`;

      return {
        action: 'DELETE_STUDENT',
        success: true,
        message: `Roll ${rollNumber} (${studentName}) chu zirlai list atangin paih a ni e.`,
        data: {
          rollNumber,
        },
      };
    }
  }

  // 5. FILTER / SEARCH
  // e.g. "Class 10 chauh entir rawh" / "Show absent students"
  if (lower.includes('entir') || lower.includes('show') || lower.includes('filter') || lower.includes('chauh')) {
    let attendanceFilter: 'Present' | 'Absent' | 'Late' | 'All' = 'All';
    if (lower.includes('absent')) attendanceFilter = 'Absent';
    else if (lower.includes('present')) attendanceFilter = 'Present';
    else if (lower.includes('late')) attendanceFilter = 'Late';

    let classFilter = '';
    const classMatch = cleanPrompt.match(/class\s*(\d+)/i);
    if (classMatch) {
      classFilter = `Class ${classMatch[1]}`;
    }

    return {
      action: 'FILTER_STUDENTS',
      success: true,
      message: `Filter hman a ni: ${classFilter || 'Classes zawng'} | ${attendanceFilter !== 'All' ? attendanceFilter : 'Attendance zawng'}`,
      data: {
        filter: {
          class: classFilter,
          attendance: attendanceFilter,
        },
      },
    };
  }

  // 6. QUERY / STATS
  // e.g. "Zirlai engzat nge awm?"
  // e.g. "Tute nge absent?"
  // e.g. "How many students are present?"
  if (lower.includes('engzat') || lower.includes('how many') || lower.includes('tute') || lower.includes('who') || lower.includes('highest') || lower.includes('summary')) {
    const total = currentStudents.length;
    const presentCount = currentStudents.filter(s => s.attendance === 'Present').length;
    const absentStudents = currentStudents.filter(s => s.attendance === 'Absent');
    const lateCount = currentStudents.filter(s => s.attendance === 'Late').length;
    
    if (lower.includes('absent')) {
      const names = absentStudents.map(s => `${s.name} (Roll ${s.rollNumber})`).join(', ');
      return {
        action: 'ANSWER_QUERY',
        success: true,
        message: absentStudents.length > 0 
          ? `Vawiin-ah zirlai ${absentStudents.length} an absent: ${names}.`
          : `Vawiin-ah absent zirlai tumah an awm lo (100% attendance).`,
      };
    }

    if (lower.includes('highest') || lower.includes('sang ber')) {
      const sorted = [...currentStudents].sort((a, b) => b.marks - a.marks);
      const topper = sorted[0];
      return {
        action: 'ANSWER_QUERY',
        success: true,
        message: topper 
          ? `Mark sang ber chu ${topper.name} (Roll ${topper.rollNumber}), Mark: ${topper.marks}% a ni.`
          : 'Zirlai record a la awm lo.',
      };
    }

    return {
      action: 'ANSWER_QUERY',
      success: true,
      message: `Zirlai zawng zawng: ${total} an ni a. Present: ${presentCount}, Absent: ${absentStudents.length}, Tlai (Late): ${lateCount}.`,
    };
  }

  // Default friendly fallback
  return {
    action: 'UNKNOWN',
    success: false,
    message: `Command "${cleanPrompt}" hi hriatthiam a ni chiah lo. Entirnan: "Student thar Zothanpudaia Roll 12 dah lut rawh" emaw "Roll 5 attendance Present dah rawh" tih hmang rawh le.`,
  };
}
