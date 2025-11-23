export enum JLPTLevel {
  N5 = 'N5',
  N4 = 'N4',
  N3 = 'N3',
  N2 = 'N2',
  N1 = 'N1',
}

export interface DialogueLine {
  speaker: string;
  japanese: string;
  reading: string; // Furigana or Hiragana
  english: string;
  audioUrl?: string; // Generated on client side via API
}

export interface GrammarPoint {
  structure: string;
  explanation: string;
  example: string;
}

export interface QuizQuestion {
  type: 'multiple-choice' | 'scramble' | 'fill-gap';
  question: string;
  options: string[]; // For multiple choice
  correctAnswer: string;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  level: JLPTLevel;
  topic: string;
  dialogue: DialogueLine[];
  grammarPoints: GrammarPoint[];
  quiz: QuizQuestion[];
}

export interface PronunciationFeedback {
  score: number; // 0-100
  pitchAccuracy: number; // 0-100
  transcription: string;
  feedback: string;
  mistakes: {
    part: string;
    issue: string; // e.g., "Pitch too high", "Vowel too short"
    suggestion: string;
  }[];
}

export interface UserProgress {
  completedLessons: string[];
  totalScore: number;
  grammarMastery: { [key in JLPTLevel]: number };
}