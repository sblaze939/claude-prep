import { ccdvfQuestions } from './ccdvf';
import { ccarfQuestions } from './ccarf';
import { ccarpQuestions } from './ccarp';
import { ccaafQuestions } from './ccaaf';
import type { CertId, Question } from '../../types';

export const allQuestions: Question[] = [...ccaafQuestions, ...ccdvfQuestions, ...ccarfQuestions, ...ccarpQuestions];

export const getQuestions = (certId: CertId): Question[] =>
  allQuestions.filter(q => q.certId === certId);

export const getQuestion = (id: string): Question | undefined =>
  allQuestions.find(q => q.id === id);

export const getQuestionsByDomain = (certId: CertId, domain: string): Question[] =>
  allQuestions.filter(q => q.certId === certId && q.domain === domain);
