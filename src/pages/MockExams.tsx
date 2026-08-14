import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, ChevronRight, ChevronLeft, CheckCircle, XCircle, RotateCcw, Bookmark, BookmarkCheck } from 'lucide-react';
import { certifications } from '../data/certifications';
import { getQuestions } from '../data/questions';
import { scoreExam, isPassed } from '../utils/scoring';
import { useTimer } from '../hooks/useTimer';
import { useAppStore } from '../store/useAppStore';
import type { Question, CertId } from '../types';

type Phase = 'select' | 'exam' | 'results';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function MockExams() {
  const [params] = useSearchParams();
  const [phase, setPhase] = useState<Phase>('select');
  const [certId, setCertId] = useState<CertId>((params.get('cert') as CertId) || 'ccdvf');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const { addAttempt, addBookmark, removeBookmark, bookmarks, updateStreak } = useAppStore();

  const cert = certifications.find(c => c.id === certId)!;

  const handleExpire = useCallback(() => setSubmitted(true), []);
  const { seconds, elapsed, start, reset } = useTimer(cert.duration * 60, handleExpire);

  const startExam = () => {
    const qs = shuffle(getQuestions(certId)).slice(0, cert.questions);
    setQuestions(qs);
    setAnswers({});
    setCurrent(0);
    setSubmitted(false);
    setStartTime(Date.now());
    reset();
    start();
    setPhase('exam');
  };

  const finishExam = () => {
    setSubmitted(true);
    const { score, domainScores } = scoreExam(questions, answers);
    const attempt = {
      id: crypto.randomUUID(),
      certId,
      mode: 'practice' as const,
      startedAt: startTime,
      completedAt: Date.now(),
      duration: elapsed,
      answers,
      score,
      domainScores,
      questionIds: questions.map(q => q.id),
      passed: isPassed(certId, score),
    };
    addAttempt(attempt);
    updateStreak();
    setPhase('results');
  };

  const toggleAnswer = (qId: string, optId: string, multi: boolean) => {
    if (submitted) return;
    setAnswers(prev => {
      const cur = prev[qId] ?? [];
      if (multi) {
        const q = questions.find(q => q.id === qId)!;
        const max = q.selectCount ?? 2;
        return cur.includes(optId)
          ? { ...prev, [qId]: cur.filter(x => x !== optId) }
          : cur.length < max
          ? { ...prev, [qId]: [...cur, optId] }
          : prev;
      }
      return { ...prev, [qId]: [optId] };
    });
  };

  const isBookmarked = (qId: string) => bookmarks.some(b => b.questionId === qId);
  const toggleBookmark = (q: Question) => {
    if (isBookmarked(q.id)) removeBookmark(q.id);
    else addBookmark({ questionId: q.id, certId: q.certId, note: '', addedAt: Date.now() });
  };

  if (phase === 'select') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--txt)', marginBottom: '0.5rem' }}>Mock Exams</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Timed practice with instant per-question feedback and domain breakdown.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {certifications.map(c => (
            <button
              key={c.id}
              onClick={() => setCertId(c.id as CertId)}
              style={{
                padding: '1rem 1.25rem',
                borderRadius: '0.75rem',
                border: `2px solid ${certId === c.id ? 'var(--accent)' : 'var(--border)'}`,
                background: certId === c.id ? 'color-mix(in srgb, var(--accent) 8%, var(--surface))' : 'var(--surface)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--txt)', fontSize: '0.9rem' }}>{c.shortName}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{c.questions} questions · {c.duration} min · ${c.price}</div>
            </button>
          ))}
        </div>
        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <Info label="Questions" value={getQuestions(certId).length + ' in bank'} />
            <Info label="Duration" value={cert.duration + ' min'} />
            <Info label="Pass score" value={cert.passingScore + '/1000'} />
          </div>
        </div>
        <button className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.65rem 1.75rem' }} onClick={startExam}>
          Start exam <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  if (phase === 'results') {
    const { score, domainScores } = scoreExam(questions, answers);
    const passed = isPassed(certId, score);
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: passed ? 'var(--success)' : 'var(--danger)', letterSpacing: '-0.03em' }}>{score}</div>
          <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>/ 1000</div>
          <div className={`badge ${passed ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.8rem' }}>
            {passed ? 'PASS' : 'NOT PASSED'} — {cert.passingScore} required
          </div>
        </div>
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--txt)', marginBottom: '1rem' }}>Domain Breakdown</h3>
          {Object.entries(domainScores).map(([domain, { correct, total }]) => {
            const pct = total ? Math.round((correct / total) * 100) : 0;
            const certDomain = cert.domains.find(d => d.id === domain);
            return (
              <div key={domain} style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--txt)' }}>{certDomain?.name ?? domain}</span>
                  <span style={{ color: pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warn)' : 'var(--danger)', fontWeight: 600 }}>{pct}% ({correct}/{total})</span>
                </div>
                <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warn)' : 'var(--danger)', borderRadius: 2, transition: 'width 0.4s' }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--txt)', marginBottom: '1rem' }}>Question Review</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {questions.map((q, i) => {
              const sel = answers[q.id] ?? [];
              const correct = sel.length === q.correctIds.length && sel.every(id => q.correctIds.includes(id));
              return (
                <div key={q.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                    {correct ? <CheckCircle size={15} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} /> : <XCircle size={15} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 2 }} />}
                    <span style={{ fontSize: '0.85rem', color: 'var(--txt)', fontWeight: 500 }}>Q{i + 1}. {q.text}</span>
                  </div>
                  {!correct && (
                    <div style={{ marginLeft: '1.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--success)', marginBottom: '0.2rem' }}>
                        ✓ Correct: {q.correctIds.map(id => q.options.find(o => o.id === id)?.text).join(', ')}
                      </div>
                      {sel.length > 0 && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>
                          ✗ Your answer: {sel.map(id => q.options.find(o => o.id === id)?.text).join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ marginLeft: '1.5rem', padding: '0.6rem 0.75rem', borderRadius: '0.375rem', background: 'var(--surface2)', fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>{q.explanation}</div>
                  <div style={{ marginLeft: '1.5rem', fontSize: '0.75rem', color: 'var(--accent-lt)', fontStyle: 'italic' }}>💡 {q.examHint}</div>
                </div>
              );
            })}
          </div>
        </div>
        <button className="btn-primary" onClick={() => setPhase('select')} style={{ marginRight: '0.75rem' }}>
          <RotateCcw size={14} /> Try again
        </button>
      </div>
    );
  }

  // Exam phase
  const q = questions[current];
  if (!q) return null;
  const sel = answers[q.id] ?? [];
  const isMulti = q.type === 'multi';
  const answeredCount = Object.keys(answers).length;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isLow = seconds < 300;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Q {current + 1} of {questions.length}</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{answeredCount} answered</span>
          <span className={`badge ${q.domain}`} style={{ fontSize: '0.7rem', color: 'var(--muted)', borderColor: 'var(--border)', background: 'var(--surface2)' }}>{cert.domains.find(d => d.id === q.domain)?.name ?? q.domain}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isLow ? 'var(--danger)' : 'var(--txt)', fontWeight: 600, fontSize: '0.9rem' }}>
          <Clock size={14} />
          {mins}:{secs.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--surface2)', borderRadius: 2, marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${((current + 1) / questions.length) * 100}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.2s' }} />
      </div>

      {/* Question */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--txt)', lineHeight: 1.65, fontWeight: 500 }}>
            {isMulti && <span style={{ color: 'var(--accent-lt)', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Select {q.selectCount}</span>}
            {q.text}
          </p>
          <button
            onClick={() => toggleBookmark(q)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: isBookmarked(q.id) ? 'var(--accent-lt)' : 'var(--muted)', flexShrink: 0 }}
            aria-label="Bookmark"
          >
            {isBookmarked(q.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1.25rem' }}>
          {q.options.map(opt => {
            const chosen = sel.includes(opt.id);
            const isCorrect = q.correctIds.includes(opt.id);
            let borderColor = chosen ? 'var(--accent)' : 'var(--border)';
            let bg = chosen ? 'color-mix(in srgb, var(--accent) 8%, var(--surface))' : 'var(--surface)';
            if (submitted) {
              if (isCorrect) { borderColor = 'var(--success)'; bg = 'color-mix(in srgb, var(--success) 8%, var(--surface))'; }
              else if (chosen && !isCorrect) { borderColor = 'var(--danger)'; bg = 'color-mix(in srgb, var(--danger) 8%, var(--surface))'; }
            }
            return (
              <button
                key={opt.id}
                onClick={() => toggleAnswer(q.id, opt.id, isMulti)}
                disabled={submitted}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: `1.5px solid ${borderColor}`,
                  background: bg,
                  cursor: submitted ? 'default' : 'pointer',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  color: 'var(--txt)',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--muted)', marginRight: '0.5rem' }}>{opt.id.toUpperCase()}.</span>
                {opt.text}
              </button>
            );
          })}
        </div>

        {submitted && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--surface2)', borderRadius: '0.5rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>{q.explanation}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--accent-lt)', fontStyle: 'italic' }}>💡 {q.examHint}</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="btn-ghost"
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
        >
          <ChevronLeft size={15} /> Prev
        </button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!submitted && sel.length > 0 && (
            <button className="btn-ghost" onClick={() => setSubmitted(true)} style={{ fontSize: '0.82rem' }}>
              Check answer
            </button>
          )}
          {current < questions.length - 1 ? (
            <button className="btn-primary" onClick={() => { setCurrent(c => c + 1); setSubmitted(false); }}>
              Next <ChevronRight size={15} />
            </button>
          ) : (
            <button className="btn-primary" onClick={finishExam}>
              Finish exam <CheckCircle size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{label}</div>
      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--txt)' }}>{value}</div>
    </div>
  );
}
