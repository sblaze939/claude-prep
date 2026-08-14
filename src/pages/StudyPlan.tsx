import { useState } from 'react';
import { CalendarDays, CheckCircle, Circle, Trash2 } from 'lucide-react';
import { certifications } from '../data/certifications';
import { useAppStore } from '../store/useAppStore';
import { toast } from '../components/ui/Toast';
import type { CertId, StudyDay, StudyPlan as SPlan } from '../types';

function generatePlan(certId: CertId, examDate: string, hoursPerDay: number): SPlan {
  const cert = certifications.find(c => c.id === certId)!;
  const today = new Date();
  const exam = new Date(examDate);
  const daysAvail = Math.max(1, Math.floor((exam.getTime() - today.getTime()) / 86400000));

  // Distribute domains weighted by their exam weight
  const days: StudyDay[] = [];
  const domains = [...cert.domains].sort((a, b) => b.weight - a.weight);
  let domainIdx = 0;

  const taskTemplates: Record<string, string[]> = {
    'app-integration': ['Read the Messages API docs', 'Practice streaming requests', 'Build a basic chatbot loop'],
    'model-selection': ['Compare Haiku vs Sonnet vs Opus costs', 'Test classification with Haiku', 'Review model selection guide'],
    'prompt-context': ['Study XML structuring techniques', 'Practice few-shot examples', 'Review prompt engineering guide'],
    'eval-testing': ['Read the eval best practices doc', 'Build a small regression suite', 'Study LLM-as-judge patterns'],
    'agents-workflows': ['Read Building Effective Agents', 'Implement a prompt chain', 'Practice ReAct loop design'],
    'tools-mcp': ['Read tool use overview', 'Set up a local MCP server', 'Define 3 tools with clear schemas'],
    'security-safety': ['Study prompt injection defences', 'Review data minimisation practices', 'Implement output validation'],
    'claude-code': ['Install Claude Code and explore settings.json', 'Create a CLAUDE.md file', 'Configure a hook'],
    'agentic-arch': ['Read orchestration patterns', 'Design a multi-agent pipeline', 'Implement fan-out parallelism'],
    'claude-code-cfg': ['Study hooks and lifecycle events', 'Configure allowedTools', 'Try headless/CI mode'],
    'prompt-structured': ['Practice structured output with tool-use', 'Study chain-of-thought patterns', 'Try XML output format'],
    'tool-design-mcp': ['Design idempotent tools', 'Study MCP transport types', 'Implement resource vs tool distinction'],
    'context-reliability': ['Study prompt caching setup', 'Implement context compaction', 'Test retry-with-validation'],
    'solution-design': ['Study RAG architecture patterns', 'Design a fallback layer', 'Review latency optimisation'],
    'models-prompting': ['Map Academy courses to blueprint domains', 'Practice model routing logic', 'Test large context patterns'],
    'eval-optimization': ['Build a canary rollout process', 'Create fairness eval cases', 'Study continuous monitoring'],
    'governance-safety': ['Read AI governance frameworks', 'Design an audit log schema', 'Review responsible AI guidelines'],
    'stakeholder-lifecycle': ['Practice explaining probabilistic AI', 'Document a deployment runbook', 'Create a stakeholder FAQ'],
    'dev-productivity': ['Standardise CLAUDE.md across a monorepo', 'Set up CI with Claude Code headless', 'Review developer workflow guide'],
  };

  const defaultTasks = ['Review exam blueprint PDF', 'Take a practice quiz on this domain', 'Make flashcards for key concepts'];

  for (let i = 0; i < daysAvail; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const domain = domains[domainIdx % domains.length];
    const tasks = taskTemplates[domain.id] ?? defaultTasks;

    const dayTasks: string[] = [];
    const slots = Math.max(1, Math.min(3, Math.floor(hoursPerDay)));
    for (let t = 0; t < slots && t < tasks.length; t++) {
      dayTasks.push(tasks[t]);
    }
    if (hoursPerDay >= 2) dayTasks.push('Take a 10-question practice set on this domain');
    if (i === daysAvail - 1) dayTasks.push('Full mock exam — exam simulator mode');

    days.push({ date: dateStr, domain: domain.id, tasks: dayTasks, completed: false });
    domainIdx++;
  }

  return { certId, examDate, hoursPerDay, createdAt: Date.now(), days };
}

export function StudyPlan() {
  const { studyPlan, setStudyPlan, markDayComplete } = useAppStore();
  const [certId, setCertId] = useState<CertId>('ccdvf');
  const [examDate, setExamDate] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(2);

  const minDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];

  const create = () => {
    if (!examDate) {
      toast('Please select an exam date first.', 'error');
      return;
    }
    setStudyPlan(generatePlan(certId, examDate, hoursPerDay));
  };

  const today = new Date().toISOString().split('T')[0];

  if (studyPlan) {
    const completed = studyPlan.days.filter(d => d.completed).length;
    const total = studyPlan.days.length;
    const cert = certifications.find(c => c.id === studyPlan.certId)!;
    const daysLeft = Math.max(0, Math.floor((new Date(studyPlan.examDate).getTime() - Date.now()) / 86400000));

    return (
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--txt)', marginBottom: '0.25rem' }}>Study Plan — {cert.shortName}</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
              Exam: {new Date(studyPlan.examDate).toLocaleDateString()} · {daysLeft} day{daysLeft !== 1 ? 's' : ''} left · {studyPlan.hoursPerDay}h/day
            </p>
          </div>
          <button onClick={() => setStudyPlan(null)} className="btn-ghost" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
            <Trash2 size={13} /> Delete plan
          </button>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <Stat label="Days completed" value={`${completed}/${total}`} />
          <Stat label="Days remaining" value={daysLeft} />
          <Stat label="Progress" value={`${total ? Math.round((completed / total) * 100) : 0}%`} />
        </div>

        <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, marginBottom: '2rem', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${total ? (completed / total) * 100 : 0}%`, background: 'var(--success)', borderRadius: 3, transition: 'width 0.4s' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {studyPlan.days.map(day => {
            const isToday = day.date === today;
            const isPast = day.date < today;
            const certDomain = cert.domains.find(d => d.id === day.domain);
            return (
              <div key={day.date} className="card" style={{
                padding: '1rem 1.25rem',
                borderColor: isToday ? 'var(--accent)' : day.completed ? 'var(--success)' : 'var(--border)',
                opacity: isPast && !day.completed ? 0.6 : 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isToday ? 'var(--accent-lt)' : 'var(--txt)' }}>
                        {new Date(day.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      {isToday && <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>Today</span>}
                      {day.completed && <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Done</span>}
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{certDomain?.name ?? day.domain}</span>
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      {day.tasks.map((task, i) => (
                        <li key={i} style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                          <span style={{ color: day.completed ? 'var(--success)' : 'var(--border)', marginTop: 1, flexShrink: 0 }}>›</span>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => !day.completed && markDayComplete(day.date)}
                    style={{ background: 'none', border: 'none', cursor: day.completed ? 'default' : 'pointer', color: day.completed ? 'var(--success)' : 'var(--border)', flexShrink: 0 }}
                    aria-label={day.completed ? 'Completed' : 'Mark complete'}
                  >
                    {day.completed ? <CheckCircle size={18} /> : <Circle size={18} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
        <CalendarDays size={20} style={{ color: 'var(--accent-lt)' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--txt)' }}>Study Plan Generator</h1>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Enter your exam date and study hours — get a personalised day-by-day schedule with domain tasks.
      </p>

      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.4rem', fontWeight: 500 }}>Certification</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {certifications.map(c => (
              <button
                key={c.id}
                onClick={() => setCertId(c.id as CertId)}
                style={{
                  padding: '0.75rem 1rem', borderRadius: '0.5rem',
                  border: `1.5px solid ${certId === c.id ? 'var(--accent)' : 'var(--border)'}`,
                  background: certId === c.id ? 'color-mix(in srgb, var(--accent) 8%, var(--surface))' : 'transparent',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--txt)' }}>{c.shortName}</span>
                <span style={{ color: 'var(--muted)', fontSize: '0.78rem', marginLeft: '0.5rem' }}>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.4rem', fontWeight: 500 }}>Exam Date</label>
          <input type="date" value={examDate} min={minDate} max={maxDate} onChange={e => setExamDate(e.target.value)} style={{ maxWidth: 220 }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.4rem', fontWeight: 500 }}>
            Study hours per day: <strong style={{ color: 'var(--txt)' }}>{hoursPerDay}h</strong>
          </label>
          <input
            type="range" min={1} max={6} value={hoursPerDay} onChange={e => setHoursPerDay(Number(e.target.value))}
            style={{ width: '100%', maxWidth: 300, accentColor: 'var(--accent)', background: 'none', border: 'none', padding: 0 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--muted)', maxWidth: 300 }}>
            <span>1h</span><span>3h</span><span>6h</span>
          </div>
        </div>

        <button className="btn-primary" onClick={create} style={{ alignSelf: 'flex-start', fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
          Generate plan <CalendarDays size={14} />
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--txt)' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{label}</div>
    </div>
  );
}
