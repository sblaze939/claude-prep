import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, ExamAttempt, Bookmark, SpacedRepCard, StudyPlan, CertId } from '../types';
import { certifications } from '../data/certifications';

const today = () => new Date().toISOString().split('T')[0];

// EMA-based confidence: alpha=0.45 gives strong recency weighting
function recalcConfidence(
  existing: number,
  score: number,
  passingScore: number,
): number {
  const alpha = 0.45;
  // Map score to 0-100 with bonus for clearing the pass bar
  const pct = (score / 1000) * 100;
  const bonus = score >= passingScore ? 8 : 0;
  const newVal = Math.min(100, pct + bonus);
  if (existing === 0) return Math.round(newVal);
  return Math.round(alpha * newVal + (1 - alpha) * existing);
}

const defaultConfidence = (): Record<CertId, number> => ({
  ccdvf: 0,
  ccarf: 0,
  ccarp: 0,
  ccaa: 0,
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      attempts: [],
      bookmarks: [],
      srCards: [],
      studyPlan: null,
      streak: 0,
      lastStudyDate: null,
      confidence: defaultConfidence(),

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        set({ theme: next });
      },

      addAttempt: (attempt: ExamAttempt) => {
        const cert = certifications.find(c => c.id === attempt.certId);
        const passingScore = cert?.passingScore ?? 720;
        const prev = get().confidence[attempt.certId] ?? 0;
        const newConf = recalcConfidence(prev, attempt.score, passingScore);
        set(s => ({
          attempts: [attempt, ...s.attempts],
          confidence: { ...s.confidence, [attempt.certId]: newConf },
        }));
      },

      addBookmark: (b: Bookmark) =>
        set(s => ({ bookmarks: [...s.bookmarks.filter(x => x.questionId !== b.questionId), b] })),

      removeBookmark: (questionId: string) =>
        set(s => ({ bookmarks: s.bookmarks.filter(b => b.questionId !== questionId) })),

      updateBookmarkNote: (questionId: string, note: string) =>
        set(s => ({
          bookmarks: s.bookmarks.map(b =>
            b.questionId === questionId ? { ...b, note } : b,
          ),
        })),

      updateSRCard: (card: SpacedRepCard) =>
        set(s => ({
          srCards: [...s.srCards.filter(c => c.questionId !== card.questionId), card],
        })),

      setStudyPlan: (plan: StudyPlan | null) => set({ studyPlan: plan }),

      markDayComplete: (date: string) =>
        set(s => {
          if (!s.studyPlan) return s;
          return {
            studyPlan: {
              ...s.studyPlan,
              days: s.studyPlan.days.map(d =>
                d.date === date ? { ...d, completed: true } : d,
              ),
            },
          };
        }),

      // Clear all history + reset all confidence
      clearHistory: () =>
        set({
          attempts: [],
          confidence: defaultConfidence(),
          srCards: [],
          streak: 0,
          lastStudyDate: null,
          studyPlan: null,
        }),

      // Clear only one cert's attempts + reset its confidence
      clearCertHistory: (certId: CertId) =>
        set(s => {
          const remaining = s.attempts.filter(a => a.certId !== certId);
          const remainingSR = s.srCards.filter(c => c.certId !== certId);
          return {
            attempts: remaining,
            srCards: remainingSR,
            confidence: { ...s.confidence, [certId]: 0 },
          };
        }),

      updateStreak: () => {
        const { lastStudyDate, streak } = get();
        const t = today();
        if (lastStudyDate === t) return;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const newStreak = lastStudyDate === yesterday ? streak + 1 : 1;
        set({ streak: newStreak, lastStudyDate: t });
      },
    }),
    {
      name: 'claude-cert-hub',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute('data-theme', state.theme);
          // Backfill confidence key if missing (old persisted state)
          if (!state.confidence) {
            state.confidence = defaultConfidence();
          }
        }
      },
    },
  ),
);
