import { useState } from 'react';
import { RefreshCw, ChevronRight, ChevronLeft, CheckCircle, XCircle, Bookmark, BookmarkCheck, Brain } from 'lucide-react';
import { certifications } from '../data/certifications';
import { getQuestions, getQuestion } from '../data/questions';
import { useAppStore } from '../store/useAppStore';
import { updateCard, isDue, createCard } from '../utils/spacedRepetition';
import type { CertId, Question } from '../types';

type Mode = 'menu' | 'sr' | 'domain' | 'bookmarks' | 'question';

export function Practice() {
  const [mode, setMode] = useState<Mode>('menu');
  const [certId, setCertId] = useState<CertId>('ccdvf');
  const [domainId, setDomainId] = useState('');
  const [queue, setQueue] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<string[]>([]);
  const [answered, setAnswered] = useState(false);
  const { srCards, updateSRCard, bookmarks, addBookmark, removeBookmark } = useAppStore();

  const cert = certifications.find(c => c.id === certId)!;

  function startSR() {
    const dueCards = srCards.filter(c => c.certId === certId && isDue(c));
    const allQs = getQuestions(certId);
    const dueQs = dueCards.map(c => allQs.find(q => q.id === c.questionId)).filter(Boolean) as Question[];
    const newQs = allQs.filter(q => !srCards.find(c => c.questionId === q.id)).slice(0, Math.max(5, 10 - dueQs.length));
    const combined = [...dueQs, ...newQs];
    if (!combined.length) return;
    setQueue(combined.sort(() => Math.random() - 0.5));
    setIdx(0);

    setSel([]);
    setAnswered(false);
    setMode('sr');
  }

  function startDomain() {
    const qs = getQuestions(certId).filter(q => q.domain === domainId).sort(() => Math.random() - 0.5);
    if (!qs.length) return;
    setQueue(qs);
    setIdx(0);

    setSel([]);
    setAnswered(false);
    setMode('domain');
  }

  function startBookmarks() {
    const certBookmarks = bookmarks.filter(b => b.certId === certId);
    const qs = certBookmarks.map(b => getQuestion(b.questionId)).filter(Boolean) as Question[];
    if (!qs.length) return;
    setQueue(qs);
    setIdx(0);

    setSel([]);
    setAnswered(false);
    setMode('bookmarks');
  }

  function handleAnswer() {
    const q = queue[idx];
    const correct = sel.length === q.correctIds.length && sel.every(id => q.correctIds.includes(id));
    setAnswered(true);

    if (mode === 'sr') {
      const existing = srCards.find(c => c.questionId === q.id) ?? createCard(q.id, q.certId);
      updateSRCard(updateCard(existing, correct));
    }
  }

  function next() {
    if (idx < queue.length - 1) {
      setIdx(i => i + 1);
  
      setSel([]);
      setAnswered(false);
    } else {
      setMode('menu');
    }
  }

  function toggleSel(optId: string) {
    if (answered) return;
    const q = queue[idx];
    const isMulti = q.type === 'multi';
    const max = q.selectCount ?? 2;
    setSel(prev =>
      prev.includes(optId)
        ? prev.filter(x => x !== optId)
        : isMulti && prev.length >= max
        ? prev
        : [...prev, optId],
    );
  }

  const dueCount = srCards.filter(c => c.certId === certId && isDue(c)).length;
  const newCount = getQuestions(certId).filter(q => !srCards.find(c => c.questionId === q.id)).length;

  if (mode === 'menu') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--txt)', marginBottom: '0.5rem' }}>Practice</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Targeted drill modes to reinforce weak areas and locked-in retention.</p>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {certifications.map(c => (
            <button key={c.id} onClick={() => setCertId(c.id as CertId)}
              style={{ padding: '0.4rem 0.85rem', borderRadius: '0.5rem', border: `1.5px solid ${certId === c.id ? 'var(--accent)' : 'var(--border)'}`, background: certId === c.id ? 'color-mix(in srgb, var(--accent) 10%, var(--surface))' : 'var(--surface)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: certId === c.id ? 'var(--accent-lt)' : 'var(--muted)', transition: 'all 0.15s' }}
            >{c.shortName}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {/* Spaced Repetition */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Brain size={15} style={{ color: 'var(--accent-lt)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--txt)' }}>Spaced Repetition</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{dueCount} due · {newCount} new cards</p>
              </div>
              <button className="btn-primary" onClick={startSR} disabled={dueCount + newCount === 0} style={{ fontSize: '0.82rem', padding: '0.4rem 0.9rem' }}>
                Review <ChevronRight size={13} />
              </button>
            </div>
          </div>

          {/* Domain Drill */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <RefreshCw size={15} style={{ color: 'var(--accent-lt)' }} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--txt)' }}>Domain Drill</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {cert.domains.map(d => (
                <button key={d.id} onClick={() => setDomainId(d.id)}
                  style={{ padding: '0.3rem 0.65rem', borderRadius: '0.375rem', border: `1.5px solid ${domainId === d.id ? 'var(--accent)' : 'var(--border)'}`, background: domainId === d.id ? 'color-mix(in srgb, var(--accent) 10%, var(--surface))' : 'transparent', cursor: 'pointer', fontSize: '0.75rem', color: domainId === d.id ? 'var(--accent-lt)' : 'var(--muted)', transition: 'all 0.15s' }}
                >{d.name} <span style={{ opacity: 0.6 }}>{d.weight}%</span></button>
              ))}
            </div>
            <button className="btn-ghost" onClick={startDomain} disabled={!domainId} style={{ fontSize: '0.82rem', padding: '0.4rem 0.9rem' }}>
              Start drill <ChevronRight size={13} />
            </button>
          </div>

          {/* Bookmarks */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Bookmark size={15} style={{ color: 'var(--accent-lt)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--txt)' }}>Bookmarked Questions</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{bookmarks.filter(b => b.certId === certId).length} saved for {certId.toUpperCase()}</p>
              </div>
              <button className="btn-ghost" onClick={startBookmarks} disabled={bookmarks.filter(b => b.certId === certId).length === 0} style={{ fontSize: '0.82rem', padding: '0.4rem 0.9rem' }}>
                Review <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = queue[idx];
  if (!q) return null;
  const isMulti = q.type === 'multi';
  const isBookmarked = bookmarks.some(b => b.questionId === q.id);
  const correct = sel.length === q.correctIds.length && sel.every(id => q.correctIds.includes(id));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.82rem', color: 'var(--muted)' }}>
          <span>Q {idx + 1}/{queue.length}</span>
          <span className="badge badge-muted" style={{ fontSize: '0.7rem' }}>{mode === 'sr' ? 'Spaced Rep' : mode === 'domain' ? 'Domain Drill' : 'Bookmarks'}</span>
          <span className={`badge badge-muted`} style={{ fontSize: '0.7rem' }}>{q.difficulty}</span>
        </div>
        <button onClick={() => setMode('menu')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.8rem' }}>← Back</button>
      </div>

      <div style={{ height: 3, background: 'var(--surface2)', borderRadius: 2, marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${((idx + 1) / queue.length) * 100}%`, background: 'var(--accent)', borderRadius: 2 }} />
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--txt)', lineHeight: 1.65, fontWeight: 500 }}>
            {isMulti && <span style={{ color: 'var(--accent-lt)', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Select {q.selectCount}</span>}
            {q.text}
          </p>
          <button onClick={() => isBookmarked ? removeBookmark(q.id) : addBookmark({ questionId: q.id, certId: q.certId, note: '', addedAt: Date.now() })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: isBookmarked ? 'var(--accent-lt)' : 'var(--muted)', flexShrink: 0 }}
          >
            {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {q.options.map(opt => {
            const chosen = sel.includes(opt.id);
            const isCorrectOpt = q.correctIds.includes(opt.id);
            let border = chosen ? 'var(--accent)' : 'var(--border)';
            let bg = chosen ? 'color-mix(in srgb, var(--accent) 8%, var(--surface))' : 'var(--surface)';
            if (answered) {
              if (isCorrectOpt) { border = 'var(--success)'; bg = 'color-mix(in srgb, var(--success) 8%, var(--surface))'; }
              else if (chosen) { border = 'var(--danger)'; bg = 'color-mix(in srgb, var(--danger) 8%, var(--surface))'; }
            }
            return (
              <button key={opt.id} onClick={() => toggleSel(opt.id)} disabled={answered}
                style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: `1.5px solid ${border}`, background: bg, cursor: answered ? 'default' : 'pointer', textAlign: 'left', fontSize: '0.875rem', color: 'var(--txt)', transition: 'all 0.15s' }}
              >
                <span style={{ fontWeight: 600, color: 'var(--muted)', marginRight: '0.5rem' }}>{opt.id.toUpperCase()}.</span>
                {opt.text}
              </button>
            );
          })}
        </div>

        {answered && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              {correct ? <CheckCircle size={14} style={{ color: 'var(--success)' }} /> : <XCircle size={14} style={{ color: 'var(--danger)' }} />}
              <span style={{ fontSize: '0.83rem', fontWeight: 600, color: correct ? 'var(--success)' : 'var(--danger)' }}>{correct ? 'Correct' : 'Incorrect'}</span>
            </div>
            <div style={{ padding: '0.65rem 0.85rem', background: 'var(--surface2)', borderRadius: '0.375rem', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>{q.explanation}</div>
            <div style={{ fontSize: '0.77rem', color: 'var(--accent-lt)', fontStyle: 'italic' }}>💡 {q.examHint}</div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn-ghost" onClick={() => setMode('menu')} style={{ fontSize: '0.82rem' }}>
          <ChevronLeft size={14} /> Exit
        </button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!answered && sel.length > 0 && (
            <button className="btn-ghost" onClick={handleAnswer} style={{ fontSize: '0.82rem' }}>Check</button>
          )}
          {answered && (
            <button className="btn-primary" onClick={next} style={{ fontSize: '0.82rem' }}>
              {idx < queue.length - 1 ? 'Next' : 'Done'} <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
