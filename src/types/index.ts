export type CertId = 'ccdvf' | 'ccarf' | 'ccarp';

export interface Certification {
  id: CertId;
  name: string;
  shortName: string;
  price: number;
  questions: number;
  duration: number; // minutes
  passingScore: number;
  domains: Domain[];
  description: string;
  audience: string;
  level: 'foundations' | 'professional';
}

export interface Domain {
  id: string;
  name: string;
  weight: number; // percentage
}

export interface Question {
  id: string;
  certId: CertId;
  domain: string;
  text: string;
  type: 'single' | 'multi';
  selectCount?: number; // for multi, how many to select
  options: Option[];
  correctIds: string[];
  explanation: string;
  examHint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface Option {
  id: string;
  text: string;
}

export interface ExamAttempt {
  id: string;
  certId: CertId;
  mode: 'practice' | 'simulator';
  startedAt: number;
  completedAt: number;
  duration: number; // seconds actually spent
  answers: Record<string, string[]>; // questionId -> selected option ids
  score: number; // 0-1000
  domainScores: Record<string, { correct: number; total: number }>;
  questionIds: string[];
  passed: boolean;
}

export interface Bookmark {
  questionId: string;
  certId: CertId;
  note: string;
  addedAt: number;
}

export interface SpacedRepCard {
  questionId: string;
  certId: CertId;
  interval: number; // days
  easeFactor: number;
  nextReview: number; // timestamp
  repetitions: number;
  lastResult: 'correct' | 'incorrect' | null;
}

export interface StudyPlan {
  certId: CertId;
  examDate: string; // ISO date
  hoursPerDay: number;
  createdAt: number;
  days: StudyDay[];
}

export interface StudyDay {
  date: string;
  tasks: string[];
  domain: string;
  completed: boolean;
}

export interface AppState {
  theme: 'dark' | 'light';
  attempts: ExamAttempt[];
  bookmarks: Bookmark[];
  srCards: SpacedRepCard[];
  studyPlan: StudyPlan | null;
  streak: number;
  lastStudyDate: string | null;
  toggleTheme: () => void;
  addAttempt: (attempt: ExamAttempt) => void;
  addBookmark: (b: Bookmark) => void;
  removeBookmark: (questionId: string) => void;
  updateBookmarkNote: (questionId: string, note: string) => void;
  updateSRCard: (card: SpacedRepCard) => void;
  setStudyPlan: (plan: StudyPlan | null) => void;
  markDayComplete: (date: string) => void;
  clearHistory: () => void;
  updateStreak: () => void;
}
