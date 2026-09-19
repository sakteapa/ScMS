import { GradeStage, StreamClassification, SubjectScore } from '../types';

export interface SubjectConfig {
  name: string;
  code?: string;
  defaultClassTestMax: number;
  defaultExamMax: number;
  isPractical?: boolean;
}

export const STAGES_CONFIG: Record<
  GradeStage,
  {
    title: string;
    description: string;
    grades: string[];
    hasStreams: boolean;
  }
> = {
  'Pre-Primary': {
    title: 'Pre-Primary Wing',
    description: 'Nursery, LKG, and Upper Kindergarten (Foundation Stage)',
    grades: ['Nursery', 'LKG', 'UKG'],
    hasStreams: false,
  },
  Primary: {
    title: 'Primary School',
    description: 'Classes 1 to 4 (Basic Foundation & Language)',
    grades: ['Class 1', 'Class 2', 'Class 3', 'Class 4'],
    hasStreams: false,
  },
  Middle: {
    title: 'Middle School',
    description: 'Classes 5 to 8 (Preparatory & Middle Evaluation)',
    grades: ['Class 5', 'Class 6', 'Class 7', 'Class 8'],
    hasStreams: false,
  },
  'High School': {
    title: 'High School',
    description: 'Classes 9 and 10 (Mizoram Board HSLC Curriculum)',
    grades: ['Class 9', 'Class 10'],
    hasStreams: false,
  },
  'Higher Secondary': {
    title: 'Higher Secondary (HSSLC)',
    description: 'Classes 11 and 12 (Arts, Science, and Commerce Streams)',
    grades: ['Class 11', 'Class 12'],
    hasStreams: true,
  },
};

export const STREAMS_LIST: StreamClassification[] = ['Arts', 'Science', 'Commerce'];

// Stage & Stream Curricula for Mizoram Board of School Education (MBSE)
export const STAGE_CURRICULA: Record<
  GradeStage,
  SubjectConfig[] | Record<StreamClassification, SubjectConfig[]>
> = {
  'Pre-Primary': [
    { name: 'English Rhymes & Phonics', defaultClassTestMax: 20, defaultExamMax: 80 },
    { name: 'Numbers & Counting', defaultClassTestMax: 20, defaultExamMax: 80 },
    { name: 'Drawing & Coloring', defaultClassTestMax: 20, defaultExamMax: 80 },
    { name: 'Environmental Awareness', defaultClassTestMax: 20, defaultExamMax: 80 },
    { name: 'Motor Skills & Storytelling', defaultClassTestMax: 20, defaultExamMax: 80 },
  ],
  Primary: [
    { name: 'English Language', defaultClassTestMax: 20, defaultExamMax: 80 },
    { name: 'Mizo (MIL)', defaultClassTestMax: 20, defaultExamMax: 80 },
    { name: 'Mathematics', defaultClassTestMax: 20, defaultExamMax: 80 },
    { name: 'Environmental Studies (EVS)', defaultClassTestMax: 20, defaultExamMax: 80 },
    { name: 'Art & General Knowledge', defaultClassTestMax: 20, defaultExamMax: 80 },
  ],
  Middle: [
    { name: 'English', defaultClassTestMax: 20, defaultExamMax: 80 },
    { name: 'Mizo (MIL)', defaultClassTestMax: 20, defaultExamMax: 80 },
    { name: 'Mathematics', defaultClassTestMax: 20, defaultExamMax: 80 },
    { name: 'General Science', defaultClassTestMax: 20, defaultExamMax: 80 },
    { name: 'Social Science', defaultClassTestMax: 20, defaultExamMax: 80 },
    { name: 'Hindi Language', defaultClassTestMax: 20, defaultExamMax: 80 },
    { name: 'Computer Studies', defaultClassTestMax: 20, defaultExamMax: 80 },
  ],
  'High School': [
    { name: 'English', defaultClassTestMax: 20, defaultExamMax: 80 },
    { name: 'Mizo (MIL)', defaultClassTestMax: 20, defaultExamMax: 80 },
    { name: 'Mathematics', defaultClassTestMax: 20, defaultExamMax: 80 },
    { name: 'Science', defaultClassTestMax: 20, defaultExamMax: 80 },
    { name: 'Social Science', defaultClassTestMax: 20, defaultExamMax: 80 },
    { name: 'Computer Science', defaultClassTestMax: 20, defaultExamMax: 80 },
  ],
  'Higher Secondary': {
    Science: [
      { name: 'English (Core)', defaultClassTestMax: 20, defaultExamMax: 80 },
      { name: 'Physics', defaultClassTestMax: 30, defaultExamMax: 70, isPractical: true },
      { name: 'Chemistry', defaultClassTestMax: 30, defaultExamMax: 70, isPractical: true },
      { name: 'Mathematics', defaultClassTestMax: 20, defaultExamMax: 80 },
      { name: 'Biology', defaultClassTestMax: 30, defaultExamMax: 70, isPractical: true },
      { name: 'Computer Science', defaultClassTestMax: 30, defaultExamMax: 70, isPractical: true },
    ],
    Arts: [
      { name: 'English (Core)', defaultClassTestMax: 20, defaultExamMax: 80 },
      { name: 'Mizo (MIL)', defaultClassTestMax: 20, defaultExamMax: 80 },
      { name: 'Political Science', defaultClassTestMax: 20, defaultExamMax: 80 },
      { name: 'History', defaultClassTestMax: 20, defaultExamMax: 80 },
      { name: 'Economics', defaultClassTestMax: 20, defaultExamMax: 80 },
      { name: 'Sociology', defaultClassTestMax: 20, defaultExamMax: 80 },
    ],
    Commerce: [
      { name: 'English (Core)', defaultClassTestMax: 20, defaultExamMax: 80 },
      { name: 'Accountancy', defaultClassTestMax: 20, defaultExamMax: 80 },
      { name: 'Business Studies', defaultClassTestMax: 20, defaultExamMax: 80 },
      { name: 'Economics', defaultClassTestMax: 20, defaultExamMax: 80 },
      { name: 'Mathematics', defaultClassTestMax: 20, defaultExamMax: 80 },
      { name: 'Entrepreneurship', defaultClassTestMax: 20, defaultExamMax: 80 },
    ],
    General: [
      { name: 'English (Core)', defaultClassTestMax: 20, defaultExamMax: 80 },
      { name: 'Mizo (MIL)', defaultClassTestMax: 20, defaultExamMax: 80 },
      { name: 'General Studies', defaultClassTestMax: 20, defaultExamMax: 80 },
      { name: 'Environmental Science', defaultClassTestMax: 20, defaultExamMax: 80 },
    ],
  },
};

/**
 * Get subject list for a specific stage and optional stream
 */
export function getSubjectsForStage(
  stage: GradeStage = 'High School',
  stream: StreamClassification = 'General'
): SubjectConfig[] {
  const stageData = STAGE_CURRICULA[stage];
  if (!stageData) {
    return (STAGE_CURRICULA['High School'] as SubjectConfig[]) || [];
  }

  if (stage === 'Higher Secondary') {
    const higherSec = stageData as Record<StreamClassification, SubjectConfig[]>;
    return higherSec[stream] || higherSec.Science || higherSec.Arts || [];
  }

  return stageData as SubjectConfig[];
}

/**
 * Get curriculum for a specific class, inferring stage and stream if not explicitly provided
 */
export function getCurriculumForClass(
  className: string = '',
  stage?: GradeStage,
  stream?: StreamClassification
): SubjectConfig[] {
  const inferred = inferStageFromClass(className);
  const finalStage = stage || inferred.stage;
  const finalStream = stream || inferred.stream;
  return getSubjectsForStage(finalStage, finalStream);
}

/**
 * Infer Stage from Class Name or classGrade
 */
export function inferStageFromClass(classNameOrGrade: string = ''): {
  stage: GradeStage;
  stream: StreamClassification;
} {
  const str = classNameOrGrade.toLowerCase();

  // Streams
  let stream: StreamClassification = 'General';
  if (str.includes('sci')) stream = 'Science';
  else if (str.includes('art')) stream = 'Arts';
  else if (str.includes('comm')) stream = 'Commerce';

  // Stages
  if (str.includes('nursery') || str.includes('lkg') || str.includes('ukg') || str.includes('kg')) {
    return { stage: 'Pre-Primary', stream: 'General' };
  }
  if (
    str.includes('class 1 ') ||
    str.includes('class 1-') ||
    str.includes('class 2') ||
    str.includes('class 3') ||
    str.includes('class 4')
  ) {
    return { stage: 'Primary', stream: 'General' };
  }
  if (
    str.includes('class 5') ||
    str.includes('class 6') ||
    str.includes('class 7') ||
    str.includes('class 8')
  ) {
    return { stage: 'Middle', stream: 'General' };
  }
  if (str.includes('class 11') || str.includes('class 12') || str.includes('hsslc')) {
    return { stage: 'Higher Secondary', stream };
  }

  return { stage: 'High School', stream: 'General' };
}

export const detectStageAndStreamFromClass = inferStageFromClass;

/**
 * MBSE Grading Scale calculation
 */
export function calculateMBSEGrade(percentage: number): string {
  if (percentage >= 91) return 'A1';
  if (percentage >= 81) return 'A2';
  if (percentage >= 71) return 'B1';
  if (percentage >= 61) return 'B2';
  if (percentage >= 51) return 'C1';
  if (percentage >= 41) return 'C2';
  if (percentage >= 33) return 'D';
  return 'E';
}

/**
 * Composite score calculator combining Class Test and Exam marks
 */
export function calculateCompositeSubjectScore(
  classTestObtained: number,
  classTestMax: number,
  examObtained: number,
  examMax: number,
  subjectName: string
): SubjectScore {
  const validTestObtained = Math.max(0, Math.min(classTestMax, classTestObtained));
  const validExamObtained = Math.max(0, Math.min(examMax, examObtained));
  const compositeMarksObtained = validTestObtained + validExamObtained;
  const compositeMaxMarks = classTestMax + examMax;
  const percentage = compositeMaxMarks > 0 ? (compositeMarksObtained / compositeMaxMarks) * 100 : 0;
  const grade = calculateMBSEGrade(percentage);

  return {
    subjectName,
    classTestObtained: validTestObtained,
    classTestMax,
    classTestWeightage: Math.round((classTestMax / compositeMaxMarks) * 100),
    examObtained: validExamObtained,
    examMax,
    examWeightage: Math.round((examMax / compositeMaxMarks) * 100),
    marksObtained: compositeMarksObtained,
    maxMarks: compositeMaxMarks,
    grade,
  };
}
