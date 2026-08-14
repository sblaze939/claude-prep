import type { Question, ExamAttempt, CertId } from '../types';
import { certifications } from '../data/certifications';

export function scoreExam(
  questions: Question[],
  answers: Record<string, string[]>,
): { score: number; domainScores: Record<string, { correct: number; total: number }> } {
  const domainScores: Record<string, { correct: number; total: number }> = {};

  let totalCorrect = 0;

  for (const q of questions) {
    if (!domainScores[q.domain]) domainScores[q.domain] = { correct: 0, total: 0 };
    domainScores[q.domain].total++;

    const selected = answers[q.id] ?? [];
    const isCorrect =
      selected.length === q.correctIds.length &&
      selected.every(id => q.correctIds.includes(id));

    if (isCorrect) {
      totalCorrect++;
      domainScores[q.domain].correct++;
    }
  }

  const rawScore = questions.length > 0 ? totalCorrect / questions.length : 0;
  const score = Math.round(rawScore * 1000);
  return { score, domainScores };
}

export function isPassed(certId: CertId, score: number): boolean {
  const cert = certifications.find(c => c.id === certId);
  return cert ? score >= cert.passingScore : false;
}

export function domainPercent(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export function averageScore(attempts: ExamAttempt[]): number {
  if (attempts.length === 0) return 0;
  return Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length);
}
