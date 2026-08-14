import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, ExamAttempt, Bookmark, SpacedRepCard, StudyPlan } from '../types';

const today = () => new Date().toISOString().split('T')[0];

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

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        set({ theme: next });
      },

      addAttempt: (attempt: ExamAttempt) =>
        set(s => ({ attempts: [attempt, ...s.attempts] })),

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
          srCards: [
            ...s.srCards.filter(c => c.questionId !== card.questionId),
            card,
          ],
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

      clearHistory: () => set({ attempts: [] }),

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
        }
      },
    },
  ),
);
