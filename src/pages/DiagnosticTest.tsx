import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, ChevronRight, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { certifications } from '../data/certifications';
import { getQuestions } from '../data/questions';
import type { CertId, Question } from '../types';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function shuffleOptions(q: Question): Question {
  return { ...q, options: [...q.options].sort(() => Math.random() - 0.5) };
}

function buildDiagnosticQuestions(certId: CertId): Question[] {
  const cert = certifications.find(c => c.id === certId)!;
  const all = getQuestions(certId);
  const result: Question[] = [];
  for (const domain of cert.domains) {
    const domainQs = all.filter(q => q.domain === domain.id);
    const picked = shuffle(domainQs).slice(0, 2);
    result.push(...picked);
  }
  return shuffle(result).map(shuffleOptions);
}

type Phase = 'select' | 'quiz' | 'results';

export function DiagnosticTest() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('select');
  const [certId, setCertId] = useState<CertId>('ccdvf');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);

  const cert = certifications.find(c => c.id === certId)!;

  const start = () => {
    const qs = buildDiagnosticQuestions(certId);
    setQuestions(qs);
    setAnswers({});
    setCurrent(0);
    setSubmitted(false);
    setPhase('quiz');
  };

  const toggle = (qId: string, optId: string, multi: boolean) => {
    if (submitted) return;
    setAnswers(prev => {
      const cur = prev[qId] ?? [];
      if (multi) {
        const q = questions.find(q => q.id === qId)!;
        const max = q.selectCount ?? 2;
        return cur.includes(optId)
          ? { ...prev, [qId]: cur.filter(x => x !== optId) }
          : cur.length < max ? { ...prev, [qId]: [...cur, optId] } : prev;
      }
      return { ...prev, [qId]: [optId] };
    });
  };

  if (phase === 'select') {
    return (
      <div className="page">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <Stethoscope size={20} style={{ color: 'var(--accent-lt)' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--txt)' }}>Diagnostic Test</h1>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          A short 10–14 question test (2 per domain) that surfaces your weakest domain so you know exactly where to focus.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
          {certifications.map(c => {
            const available = getQuestions(c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setCertId(c.id as CertId)}
                disabled={available < 5}
                style={{
                  padding: '0.9rem 1.1rem', borderRadius: '0.75rem',
                  border: `2px solid ${certId === c.id ? 'var(--accent)' : 'var(--border)'}`,
                  background: certId === c.id ? 'color-mix(in srgb, var(--accent) 8%, var(--surface))' : 'var(--surface)',
                  cursor: available < 5 ? 'not-allowed' : 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  opacity: available < 5 ? 0.5 : 1,
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--txt)', fontSize: '0.9rem' }}>
                  {c.name} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({c.shortName})</span>
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: '0.15rem' }}>
                  {c.domains.length} domains · {c.domains.length * 2} diagnostic questions
                </div>
              </button>
            );
          })}
        </div>
        <button className="btn-primary" onClick={start} style={{ fontSize: '0.9rem', padding: '0.65rem 1.75rem' }}>
          Start diagnostic <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  if (phase === 'results') {
    const cert = certifications.find(c => c.id === certId)!;
    const domainScores: Record<string, { correct: number; total: number }> = {};
    for (const q of questions) {
      if (!domainScores[q.domain]) domainScores[q.domain] = { correct: 0, total: 0 };
      const sel = answers[q.id] ?? [];
      const isCorrect = sel.length === q.correctIds.length && sel.every(id => q.correctIds.includes(id));
      domainScores[q.domain].total++;
      if (isCorrect) domainScores[q.domain].correct++;
    }

    const sorted = cert.domains
      .filter(d => domainScores[d.id])
      .map(d => ({ ...d, ...domainScores[d.id], pct: Math.round((domainScores[d.id]?.correct ?? 0) / (domainScores[d.id]?.total ?? 1) * 100) }))
      .sort((a, b) => a.pct - b.pct);

    const weakest = sorted[0];
    const totalCorrect = Object.values(domainScores).reduce((s, v) => s + v.correct, 0);
    const totalQs = questions.length;
    const overall = Math.round((totalCorrect / totalQs) * 100);

    return (
      <div className="page">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--txt)', marginBottom: '0.25rem' }}>Diagnostic Results</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{cert.name} ({cert.shortName})</p>

        {/* Overall */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: overall >= 70 ? 'var(--success)' : overall >= 50 ? 'var(--warn)' : 'var(--danger)', letterSpacing: '-0.03em' }}>
            {overall}%
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{totalCorrect}/{totalQs} correct</div>
        </div>

        {/* Domain breakdown */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--txt)', marginBottom: '1rem' }}>Domain Scores</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sorted.map((d, i) => {
              const color = d.pct >= 70 ? 'var(--success)' : d.pct >= 50 ? 'var(--warn)' : 'var(--danger)';
              return (
                <div key={d.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--txt)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {i === 0 && <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--danger)', background: 'color-mix(in srgb, var(--danger) 12%, transparent)', padding: '0.1rem 0.35rem', borderRadius: '0.25rem' }}>WEAKEST</span>}
                      {d.name}
                    </span>
                    <span style={{ color, fontWeight: 700 }}>{d.pct}% ({d.correct}/{d.total})</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${d.pct}%`, background: color, borderRadius: 3, transition: 'width 0.4s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendation */}
        {weakest && (
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderColor: 'var(--accent)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-lt)', marginBottom: '0.5rem' }}>Focus recommendation</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              Your weakest domain is <strong style={{ color: 'var(--txt)' }}>{weakest.name}</strong> ({weakest.pct}%).
              Start your study plan with this domain — it carries <strong style={{ color: 'var(--txt)' }}>{weakest.weight}%</strong> of the exam weight.
            </p>
          </div>
        )}

        {/* Question review */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--txt)', marginBottom: '1rem' }}>Question Review</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {questions.map((q, i) => {
              const sel = answers[q.id] ?? [];
              const correct = sel.length === q.correctIds.length && sel.every(id => q.correctIds.includes(id));
              const certDomain = cert.domains.find(d => d.id === q.domain);
              return (
                <div key={q.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', alignItems: 'flex-start' }}>
                    {correct ? <CheckCircle size={14} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} /> : <XCircle size={14} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 2 }} />}
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>{certDomain?.name ?? q.domain}</div>
                      <span style={{ fontSize: '0.83rem', color: 'var(--txt)', fontWeight: 500 }}>Q{i + 1}. {q.text}</span>
                    </div>
                  </div>
                  {!correct && (
                    <div style={{ marginLeft: '1.4rem', fontSize: '0.78rem', color: 'var(--success)', marginBottom: '0.3rem' }}>
                      ✓ {q.correctIds.map(id => q.options.find(o => o.id === id)?.text).join(', ')}
                    </div>
                  )}
                  <div style={{ marginLeft: '1.4rem', padding: '0.5rem 0.7rem', borderRadius: '0.375rem', background: 'var(--surface2)', fontSize: '0.77rem', color: 'var(--muted)' }}>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('/plan')}>
            Build study plan <ArrowRight size={14} />
          </button>
          <button className="btn-ghost" onClick={() => { setPhase('select'); }}>
            Run again
          </button>
        </div>
      </div>
    );
  }

  // Quiz phase
  const q = questions[current];
  if (!q) return null;
  const sel = answers[q.id] ?? [];
  const isMulti = q.type === 'multi';
  const certDomain = cert.domains.find(d => d.id === q.domain);

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Diagnostic · Q {current + 1} of {questions.length}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', background: 'var(--surface2)', padding: '0.2rem 0.5rem', borderRadius: '0.3rem' }}>
          {certDomain?.name ?? q.domain}
        </span>
      </div>
      <div style={{ height: 3, background: 'var(--surface2)', borderRadius: 2, marginBottom: '1.25rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${((current + 1) / questions.length) * 100}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.2s' }} />
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.95rem', color: 'var(--txt)', lineHeight: 1.65, fontWeight: 500, marginBottom: '1.25rem' }}>
          {isMulti && <span style={{ color: 'var(--accent-lt)', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Select {q.selectCount}</span>}
          {q.text}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {q.options.map((opt, oi) => {
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
                onClick={() => toggle(q.id, opt.id, isMulti)}
                disabled={submitted}
                style={{ padding: '0.7rem 1rem', borderRadius: '0.5rem', border: `1.5px solid ${borderColor}`, background: bg, cursor: submitted ? 'default' : 'pointer', textAlign: 'left', fontSize: '0.875rem', color: 'var(--txt)', transition: 'all 0.15s' }}
              >
                <span style={{ fontWeight: 600, color: 'var(--muted)', marginRight: '0.5rem' }}>{String.fromCharCode(65 + oi)}.</span>
                {opt.text}
              </button>
            );
          })}
        </div>
        {submitted && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--surface2)', borderRadius: '0.5rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{q.explanation}</p>
          </div>
        )}
      </div>

      <div style={{ position: 'sticky', bottom: 0, background: 'var(--bg)', borderTop: '1px solid var(--border)', padding: '0.85rem 0', display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn-ghost" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>
          ← Prev
        </button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!submitted && sel.length > 0 && (
            <button className="btn-ghost" onClick={() => setSubmitted(true)} style={{ fontSize: '0.82rem' }}>Check</button>
          )}
          {current < questions.length - 1 ? (
            <button className="btn-primary" onClick={() => { setCurrent(c => c + 1); setSubmitted(false); }}>
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button className="btn-primary" onClick={() => setPhase('results')}>
              See results <CheckCircle size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
