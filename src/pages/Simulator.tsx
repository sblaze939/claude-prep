import { useState, useCallback, useEffect, useRef } from 'react';
import { Zap, Clock, ChevronRight, ChevronLeft, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { certifications } from '../data/certifications';
import { getQuestions } from '../data/questions';
import { scoreExam, isPassed } from '../utils/scoring';
import { useTimer } from '../hooks/useTimer';
import { useAppStore } from '../store/useAppStore';
import type { Question, CertId } from '../types';

type Phase = 'briefing' | 'exam' | 'results';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function shuffleOptions(q: Question): Question {
  return { ...q, options: [...q.options].sort(() => Math.random() - 0.5) };
}

function useConfetti(trigger: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d')!;

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98FB98', '#FFB347'];
    const particles = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 5,
      vy: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
      gravity: 0.08,
    }));

    let raf: number;
    let active = true;

    const animate = () => {
      if (!active) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let anyVisible = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotSpeed;
        if (p.y < canvas.height + 20) {
          anyVisible = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height);
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      }
      if (anyVisible) raf = requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    raf = requestAnimationFrame(animate);
    const timeout = setTimeout(() => {
      active = false;
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 5000);

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [trigger]);

  return canvasRef;
}

export function Simulator() {
  const [phase, setPhase] = useState<Phase>('briefing');
  const [certId, setCertId] = useState<CertId>('ccdvf');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [startTime, setStartTime] = useState(0);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [passed, setPassed] = useState(false);
  const { addAttempt, updateStreak } = useAppStore();

  const cert = certifications.find(c => c.id === certId)!;
  const confettiRef = useConfetti(phase === 'results' && passed);

  const handleExpire = useCallback(() => {
    submitExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, questions, certId, startTime]);

  const { seconds, elapsed, start, reset } = useTimer(cert.duration * 60, handleExpire);

  const startExam = () => {
    const qs = shuffle(getQuestions(certId)).slice(0, cert.questions).map(shuffleOptions);
    setQuestions(qs);
    setAnswers({});
    setCurrent(0);
    setFlagged(new Set());
    setStartTime(Date.now());
    setPassed(false);
    reset();
    start();
    setPhase('exam');
  };

  const submitExam = useCallback(() => {
    const { score, domainScores } = scoreExam(questions, answers);
    const didPass = isPassed(certId, score);
    setPassed(didPass);
    addAttempt({
      id: crypto.randomUUID(),
      certId,
      mode: 'simulator',
      startedAt: startTime,
      completedAt: Date.now(),
      duration: elapsed,
      answers,
      score,
      domainScores,
      questionIds: questions.map(q => q.id),
      passed: didPass,
    });
    updateStreak();
    setPhase('results');
  }, [questions, answers, certId, startTime, elapsed, addAttempt, updateStreak]);

  const toggleAnswer = (qId: string, optId: string, isMulti: boolean) => {
    setAnswers(prev => {
      const cur = prev[qId] ?? [];
      if (isMulti) {
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

  const toggleFlag = (qId: string) => {
    setFlagged(prev => {
      const n = new Set(prev);
      n.has(qId) ? n.delete(qId) : n.add(qId);
      return n;
    });
  };

  if (phase === 'briefing') {
    return (
      <div className="page">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <Zap size={20} style={{ color: 'var(--warn)' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--txt)' }}>Exam Simulator</h1>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Strict mode — no per-question feedback until the exam ends. Mirrors the real exam experience.</p>

        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', borderColor: 'var(--warn)', background: 'color-mix(in srgb, var(--warn) 5%, var(--surface))' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <AlertTriangle size={15} style={{ color: 'var(--warn)', marginTop: 2, flexShrink: 0 }} />
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
              Answers are locked after submission. No hints, no explanations mid-exam. The timer counts down and auto-submits when it expires.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {certifications.map(c => (
            <button
              key={c.id}
              onClick={() => setCertId(c.id as CertId)}
              style={{
                padding: '1rem 1.25rem', borderRadius: '0.75rem',
                border: `2px solid ${certId === c.id ? 'var(--warn)' : 'var(--border)'}`,
                background: certId === c.id ? 'color-mix(in srgb, var(--warn) 6%, var(--surface))' : 'var(--surface)',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--txt)', fontSize: '0.9rem' }}>{c.shortName}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{c.questions} questions · {c.duration} min</div>
            </button>
          ))}
        </div>

        <button className="btn-primary" style={{ background: 'var(--warn)', fontSize: '0.9rem', padding: '0.65rem 1.75rem' }} onClick={startExam}>
          <Zap size={15} /> Begin exam
        </button>
      </div>
    );
  }

  if (phase === 'results') {
    const { score, domainScores } = scoreExam(questions, answers);
    return (
      <>
        <canvas
          ref={confettiRef}
          style={{
            position: 'fixed', top: 0, left: 0,
            width: '100%', height: '100%',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        />
        <div className="page">
          {/* Pass banner */}
          {passed && (
            <div style={{
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--success) 15%, var(--surface)), color-mix(in srgb, var(--accent) 10%, var(--surface)))',
              border: '1.5px solid var(--success)',
              borderRadius: '0.75rem',
              padding: '1.25rem 1.5rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🎯</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--txt)', marginBottom: '0.25rem' }}>
                Passing territory — well done!
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                You scored {score}/1000 (passing: {cert.passingScore}/1000). Consider booking the real exam.
              </div>
              <a
                href="https://www.pearsonvue.com/us/en/anthropic.html"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block', marginTop: '0.75rem',
                  padding: '0.4rem 1.1rem', borderRadius: '0.375rem',
                  background: 'var(--success)', color: '#fff',
                  fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none',
                }}
              >
                Book the exam →
              </a>
            </div>
          )}

          <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: passed ? 'var(--success)' : 'var(--danger)', letterSpacing: '-0.03em' }}>{score}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>/ 1000</div>
            <span className={`badge ${passed ? 'badge-success' : 'badge-danger'}`}>{passed ? 'PASS' : 'NOT PASSED'} — {cert.passingScore} required</span>
          </div>

          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--txt)', marginBottom: '1rem' }}>Domain Results</h3>
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
                    <div style={{ height: '100%', width: `${pct}%`, background: pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warn)' : 'var(--danger)', borderRadius: 2 }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--txt)', marginBottom: '1rem' }}>Full Review</h3>
            {questions.map((q, i) => {
              const sel = answers[q.id] ?? [];
              const correct = sel.length === q.correctIds.length && sel.every(id => q.correctIds.includes(id));
              return (
                <div key={q.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    {correct ? <CheckCircle size={14} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} /> : <XCircle size={14} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 2 }} />}
                    <span style={{ fontSize: '0.83rem', color: 'var(--txt)', fontWeight: 500 }}>Q{i + 1}. {q.text}</span>
                  </div>
                  {!correct && (
                    <div style={{ marginLeft: '1.4rem', fontSize: '0.77rem', color: 'var(--success)' }}>
                      ✓ {q.correctIds.map(id => q.options.find(o => o.id === id)?.text).join(', ')}
                    </div>
                  )}
                  <div style={{ marginLeft: '1.4rem', marginTop: '0.4rem', fontSize: '0.77rem', color: 'var(--muted)', background: 'var(--surface2)', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>{q.explanation}</div>
                  <div style={{ marginLeft: '1.4rem', marginTop: '0.3rem', fontSize: '0.74rem', color: 'var(--accent-lt)', fontStyle: 'italic' }}>💡 {q.examHint}</div>
                </div>
              );
            })}
          </div>

          <button className="btn-primary" onClick={() => setPhase('briefing')}>Try again</button>
        </div>
      </>
    );
  }

  const q = questions[current];
  if (!q) return null;
  const sel = answers[q.id] ?? [];
  const isMulti = q.type === 'multi';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isLow = seconds < 300;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="page" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
          <span>Q {current + 1}/{questions.length}</span>
          <span>{answeredCount} answered</span>
          {flagged.size > 0 && <span style={{ color: 'var(--warn)' }}>{flagged.size} flagged</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isLow ? 'var(--danger)' : 'var(--warn)', fontWeight: 700, fontSize: '0.95rem' }}>
          <Clock size={14} />
          {mins}:{secs.toString().padStart(2, '0')}
        </div>
      </div>

      <div style={{ height: 3, background: 'var(--surface2)', borderRadius: 2, marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${((current + 1) / questions.length) * 100}%`, background: 'var(--warn)', borderRadius: 2, transition: 'width 0.2s' }} />
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--txt)', lineHeight: 1.65, fontWeight: 500 }}>
            {isMulti && <span style={{ color: 'var(--accent-lt)', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Select {q.selectCount}</span>}
            {q.text}
          </p>
          <button
            onClick={() => toggleFlag(q.id)}
            title={flagged.has(q.id) ? 'Unflag' : 'Flag for review'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: flagged.has(q.id) ? 'var(--warn)' : 'var(--muted)', fontSize: '0.8rem', flexShrink: 0 }}
          >
            {flagged.has(q.id) ? '⚑' : '⚐'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {q.options.map((opt, oi) => {
            const chosen = sel.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => toggleAnswer(q.id, opt.id, isMulti)}
                style={{
                  padding: '0.75rem 1rem', borderRadius: '0.5rem',
                  border: `1.5px solid ${chosen ? 'var(--warn)' : 'var(--border)'}`,
                  background: chosen ? 'color-mix(in srgb, var(--warn) 8%, var(--surface))' : 'var(--surface)',
                  cursor: 'pointer', textAlign: 'left', fontSize: '0.875rem', color: 'var(--txt)', transition: 'all 0.15s',
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--muted)', marginRight: '0.5rem' }}>{String.fromCharCode(65 + oi)}.</span>
                {opt.text}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ position: 'sticky', bottom: 0, background: 'var(--bg)', borderTop: '1px solid var(--border)', padding: '0.85rem 0', display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn-ghost" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>
          <ChevronLeft size={15} /> Prev
        </button>
        {current < questions.length - 1 ? (
          <button className="btn-primary" style={{ background: 'var(--warn)' }} onClick={() => setCurrent(c => c + 1)}>
            Next <ChevronRight size={15} />
          </button>
        ) : (
          <button className="btn-primary" style={{ background: 'var(--warn)' }} onClick={submitExam}>
            Submit exam
          </button>
        )}
      </div>
    </div>
  );
}
