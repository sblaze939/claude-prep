import type { SpacedRepCard } from '../types';

// SM-2 algorithm simplified
export function updateCard(card: SpacedRepCard, correct: boolean): SpacedRepCard {
  const quality = correct ? 5 : 1;
  let { easeFactor, interval, repetitions } = card;

  if (correct) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  } else {
    interval = 1;
    repetitions = 0;
  }

  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  const nextReview = Date.now() + interval * 86400000;

  return { ...card, easeFactor, interval, repetitions, nextReview, lastResult: correct ? 'correct' : 'incorrect' };
}

export function isDue(card: SpacedRepCard): boolean {
  return Date.now() >= card.nextReview;
}

export function createCard(questionId: string, certId: string): SpacedRepCard {
  return {
    questionId,
    certId: certId as SpacedRepCard['certId'],
    interval: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
    repetitions: 0,
    lastResult: null,
  };
}
