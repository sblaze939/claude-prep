import { useState } from 'react';
import { BookX, ChevronDown, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { certifications } from '../data/certifications';
import { getQuestions } from '../data/questions';
import type { CertId, Question } from '../types';

function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && [...a].sort().join() === [...b].sort().join();
}

interface MissedQuestion {
  question: Question;
  userAnswers: string[];
  certId: CertId;
  attemptDate: number;
}

export function ReviewPage() {
  const { attempts } = useAppStore();
  const [certFilter, setCertFilter] = useState<string>('all');

  if (attempts.length === 0) {
    return (
      <div className="page">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <BookX size={20} style={{ color: 'var(--accent-lt)' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--txt)' }}>Missed Questions</h1>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Questions you got wrong — grouped by domain, deduped to your most recent miss.
        </p>
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <BookX size={36} style={{ color: 'var(--border)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            No attempts yet. Take a mock exam or practice session first — missed questions will appear here.
          </p>
        </div>
      </div>
    );
  }

  // Build missed questions map (newest-first, deduplicated by question ID)
  const allQMap = new Map<string, Question>();
  for (const cert of certifications) {
    for (const q of getQuestions(cert.id)) {
      allQMap.set(q.id, q);
    }
  }

  const seen = new Set<string>();
  const missed: MissedQuestion[] = [];
  for (const attempt of [...attempts].sort((a, b) => b.completedAt - a.completedAt)) {
    for (const qId of attempt.questionIds) {
      if (seen.has(qId)) continue;
      const q = allQMap.get(qId);
      if (!q) continue;
      const userAns = attempt.answers[qId] ?? [];
      if (!arraysEqual(userAns, q.correctIds)) {
        seen.add(qId);
        missed.push({ question: q, userAnswers: userAns, certId: attempt.certId, attemptDate: attempt.completedAt });
      }
    }
  }

  // Certs that have missed questions
  const certsWithMisses = certifications.filter(c => missed.some(m => m.certId === c.id));

  // Apply cert filter
  const filtered = certFilter === 'all' ? missed : missed.filter(m => m.certId === certFilter);

  // Group by domain
  const byDomain: Record<string, MissedQuestion[]> = {};
  for (const m of filtered) {
    const key = m.question.domain;
    if (!byDomain[key]) byDomain[key] = [];
    byDomain[key].push(m);
  }
  const domainKeys = Object.keys(byDomain);

  const [openDomains, setOpenDomains] = useState<Set<string>>(() => new Set(domainKeys));

  const toggleDomain = (d: string) => {
    setOpenDomains(prev => {
      const next = new Set(prev);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
        <BookX size={20} style={{ color: 'var(--accent-lt)' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--txt)' }}>Missed Questions</h1>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Questions you got wrong — grouped by domain, deduped to your most recent miss.
      </p>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--txt)' }}>{filtered.length}</strong> questions to review
        </span>
        <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
          across <strong style={{ color: 'var(--txt)' }}>{domainKeys.length}</strong> domain{domainKeys.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Cert filter pills */}
      {certsWithMisses.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[{ id: 'all', shortName: 'All tracks' }, ...certsWithMisses].map(c => (
            <button
              key={c.id}
              onClick={() => setCertFilter(c.id)}
              style={{
                padding: '0.3rem 0.75rem', borderRadius: '0.375rem',
                border: `1.5px solid ${certFilter === c.id ? 'var(--accent)' : 'var(--border)'}`,
                background: certFilter === c.id ? 'color-mix(in srgb, var(--accent) 10%, var(--surface))' : 'transparent',
                cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500,
                color: certFilter === c.id ? 'var(--accent-lt)' : 'var(--muted)',
                transition: 'all 0.15s',
              }}
            >
              {c.shortName}
            </button>
          ))}
        </div>
      )}

      {/* All correct state */}
      {filtered.length === 0 && attempts.length > 0 && (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <CheckCircle size={32} style={{ color: 'var(--success)', margin: '0 auto 0.75rem' }} />
          <p style={{ color: 'var(--txt)', fontWeight: 600, marginBottom: '0.25rem' }}>No missed questions!</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            You answered everything correctly in your recent attempts.
          </p>
        </div>
      )}

      {/* Domain sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {domainKeys.map(domainId => {
          const items = byDomain[domainId];
          const certDomain = certifications.flatMap(c => c.domains).find(d => d.id === domainId);
          const domainName = certDomain?.name ?? domainId;
          const isOpen = openDomains.has(domainId);

          return (
            <div key={domainId}>
              {/* Domain header */}
              <button
                onClick={() => toggleDomain(domainId)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem 0',
                  textAlign: 'left', marginBottom: '0.5rem',
                }}
              >
                <span style={{ color: 'var(--muted)' }}>
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--txt)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {domainName}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', background: 'var(--surface2)', padding: '0.1rem 0.45rem', borderRadius: 10 }}>
                  {items.length}
                </span>
              </button>

              {/* Question cards */}
              {isOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {items.map(({ question: q, userAnswers }) => (
                    <div key={q.id} className="card" style={{ padding: '1rem 1.25rem' }}>
                      {/* Question text */}
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--txt)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                        {q.text}
                      </p>

                      {/* Options */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.75rem' }}>
                        {q.options.map(opt => {
                          const isCorrect = q.correctIds.includes(opt.id);
                          const wasUserAnswer = userAnswers.includes(opt.id);
                          const bg = isCorrect
                            ? 'color-mix(in srgb, var(--success) 10%, transparent)'
                            : wasUserAnswer
                            ? 'color-mix(in srgb, var(--danger) 10%, transparent)'
                            : 'transparent';
                          const border = isCorrect ? 'var(--success)' : wasUserAnswer ? 'var(--danger)' : 'var(--border)';
                          const color = isCorrect || wasUserAnswer ? 'var(--txt)' : 'var(--muted)';

                          return (
                            <div
                              key={opt.id}
                              style={{
                                display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
                                padding: '0.4rem 0.6rem', borderRadius: '0.375rem',
                                border: `1.5px solid ${border}`, background: bg,
                              }}
                            >
                              <span style={{ flexShrink: 0, marginTop: 1 }}>
                                {isCorrect
                                  ? <CheckCircle size={13} style={{ color: 'var(--success)' }} />
                                  : wasUserAnswer
                                  ? <XCircle size={13} style={{ color: 'var(--danger)' }} />
                                  : <span style={{ width: 13, display: 'inline-block' }} />}
                              </span>
                              <span style={{ fontSize: '0.8rem', color, lineHeight: 1.45, flex: 1 }}>{opt.text}</span>
                              {isCorrect && (
                                <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--success)', fontWeight: 600, flexShrink: 0 }}>
                                  Correct
                                </span>
                              )}
                              {wasUserAnswer && !isCorrect && (
                                <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--danger)', fontWeight: 600, flexShrink: 0 }}>
                                  Your answer
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <div style={{
                        padding: '0.6rem 0.75rem', background: 'var(--surface2)',
                        borderRadius: '0.375rem', borderLeft: '3px solid var(--accent)',
                      }}>
                        <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.55, margin: 0 }}>
                          {q.explanation}
                        </p>
                      </div>

                      {/* Tags */}
                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <span
                          className={`badge ${q.difficulty === 'hard' ? 'badge-danger' : q.difficulty === 'medium' ? 'badge-accent' : 'badge-success'}`}
                          style={{ fontSize: '0.6rem' }}
                        >
                          {q.difficulty}
                        </span>
                        {q.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="badge badge-muted" style={{ fontSize: '0.6rem' }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
