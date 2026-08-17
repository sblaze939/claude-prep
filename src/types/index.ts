export type CertId = 'ccdvf' | 'ccarf' | 'ccarp' | 'ccaa';

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
  level: 'associate' | 'foundations' | 'professional';
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
  selectCount?: number;
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
  duration: number;
  answers: Record<string, string[]>;
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
  interval: number;
  easeFactor: number;
  nextReview: number;
  repetitions: number;
  lastResult: 'correct' | 'incorrect' | null;
}

export interface StudyPlan {
  certId: CertId;
  examDate: string;
  hoursPerDay: number;
  createdAt: number;
  days: StudyDay[];
}

export interface StudyTask {
  text: string;
  completed: boolean;
  resourceUrl?: string;
  resourceTitle?: string;
}

export interface StudyDay {
  date: string;
  tasks: StudyTask[];
  domain: string;
  completed: boolean;
}

export interface ConfidenceEntry {
  certId: CertId;
  value: number; // 0-100
  updatedAt: number;
}

export interface AppState {
  theme: 'dark' | 'light';
  attempts: ExamAttempt[];
  bookmarks: Bookmark[];
  srCards: SpacedRepCard[];
  studyPlan: StudyPlan | null;
  streak: number;
  lastStudyDate: string | null;
  studyHistory: string[];
  confidence: Record<CertId, number>; // 0-100 per cert
  toggleTheme: () => void;
  addAttempt: (attempt: ExamAttempt) => void;
  addBookmark: (b: Bookmark) => void;
  removeBookmark: (questionId: string) => void;
  updateBookmarkNote: (questionId: string, note: string) => void;
  updateSRCard: (card: SpacedRepCard) => void;
  setStudyPlan: (plan: StudyPlan | null) => void;
  markDayComplete: (date: string) => void;
  toggleTask: (date: string, taskIndex: number) => void;
  clearHistory: () => void;
  clearCertHistory: (certId: CertId) => void;
  updateStreak: () => void;
}
