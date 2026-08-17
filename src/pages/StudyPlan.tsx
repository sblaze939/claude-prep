import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, CheckCircle, Circle, Trash2, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { certifications } from '../data/certifications';
import { useAppStore } from '../store/useAppStore';
import { toast } from '../components/ui/Toast';
import type { CertId, StudyPlan as SPlan, StudyTask } from '../types';

const taskTemplates: Record<string, StudyTask[]> = {
  'app-integration': [
    { text: 'Read the Messages API docs', completed: false, resourceUrl: 'https://docs.anthropic.com/en/api/messages', resourceTitle: 'Messages API Reference' },
    { text: 'Practice streaming requests', completed: false, resourceUrl: 'https://docs.anthropic.com/en/api/messages', resourceTitle: 'Messages API Reference' },
    { text: 'Build a basic chatbot loop', completed: false, resourceUrl: 'https://anthropic.skilljar.com/claude-with-the-anthropic-api', resourceTitle: 'Building with Claude API Course' },
  ],
  'model-selection': [
    { text: 'Compare Haiku vs Sonnet vs Opus costs', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/about-claude/models/overview', resourceTitle: 'Claude Models Overview' },
    { text: 'Test classification with Haiku', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/about-claude/models/overview', resourceTitle: 'Claude Models Overview' },
    { text: 'Review model selection guide', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/about-claude/models/overview', resourceTitle: 'Claude Models Overview' },
  ],
  'prompt-context': [
    { text: 'Study XML structuring techniques', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering', resourceTitle: 'Prompt Engineering Guide' },
    { text: 'Practice few-shot examples', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering', resourceTitle: 'Prompt Engineering Guide' },
    { text: 'Review prompt engineering guide', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering', resourceTitle: 'Prompt Engineering Guide' },
  ],
  'eval-testing': [
    { text: 'Read the eval best practices doc', completed: false, resourceUrl: 'https://github.com/anthropics/anthropic-cookbook', resourceTitle: 'Anthropic Cookbook' },
    { text: 'Build a small regression suite', completed: false, resourceUrl: 'https://github.com/anthropics/anthropic-cookbook', resourceTitle: 'Anthropic Cookbook' },
    { text: 'Study LLM-as-judge patterns', completed: false, resourceUrl: 'https://github.com/anthropics/anthropic-cookbook', resourceTitle: 'Anthropic Cookbook' },
  ],
  'agents-workflows': [
    { text: 'Read Building Effective Agents', completed: false, resourceUrl: 'https://www.anthropic.com/research/building-effective-agents', resourceTitle: 'Building Effective Agents' },
    { text: 'Implement a prompt chain', completed: false, resourceUrl: 'https://www.anthropic.com/research/building-effective-agents', resourceTitle: 'Building Effective Agents' },
    { text: 'Practice ReAct loop design', completed: false, resourceUrl: 'https://www.anthropic.com/research/building-effective-agents', resourceTitle: 'Building Effective Agents' },
  ],
  'tools-mcp': [
    { text: 'Read tool use overview', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use', resourceTitle: 'Tool Use Overview' },
    { text: 'Set up a local MCP server', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/claude-code/mcp', resourceTitle: 'MCP Docs' },
    { text: 'Define 3 tools with clear schemas', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use', resourceTitle: 'Tool Use Overview' },
  ],
  'security-safety': [
    { text: 'Study prompt injection defences', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/security', resourceTitle: 'Security Best Practices' },
    { text: 'Review data minimisation practices', completed: false },
    { text: 'Implement output validation', completed: false },
  ],
  'claude-code': [
    { text: 'Install Claude Code and explore settings.json', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/claude-code', resourceTitle: 'Claude Code Docs' },
    { text: 'Create a CLAUDE.md file', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/claude-code', resourceTitle: 'Claude Code Docs' },
    { text: 'Configure a hook', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/claude-code', resourceTitle: 'Claude Code Docs' },
  ],
  'agentic-arch': [
    { text: 'Read orchestration patterns', completed: false, resourceUrl: 'https://www.anthropic.com/research/building-effective-agents', resourceTitle: 'Building Effective Agents' },
    { text: 'Design a multi-agent pipeline', completed: false, resourceUrl: 'https://www.anthropic.com/engineering/effective-context-engineering', resourceTitle: 'Effective Context Engineering' },
    { text: 'Implement fan-out parallelism', completed: false, resourceUrl: 'https://github.com/anthropics/claude-agent-sdk-python', resourceTitle: 'Claude Agent SDK' },
  ],
  'claude-code-cfg': [
    { text: 'Study hooks and lifecycle events', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/claude-code', resourceTitle: 'Claude Code Docs' },
    { text: 'Configure allowedTools', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/claude-code', resourceTitle: 'Claude Code Docs' },
    { text: 'Try headless/CI mode', completed: false, resourceUrl: 'https://www.anthropic.com/engineering/claude-code-best-practices', resourceTitle: 'Claude Code Best Practices' },
  ],
  'prompt-structured': [
    { text: 'Practice structured output with tool-use', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/structured-outputs', resourceTitle: 'Structured Outputs' },
    { text: 'Study chain-of-thought patterns', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering', resourceTitle: 'Prompt Engineering Guide' },
    { text: 'Try XML output format', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering', resourceTitle: 'Prompt Engineering Guide' },
  ],
  'tool-design-mcp': [
    { text: 'Design idempotent tools', completed: false, resourceUrl: 'https://www.anthropic.com/engineering/writing-tools-for-agents', resourceTitle: 'Writing Tools for Agents' },
    { text: 'Study MCP transport types', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/claude-code/mcp', resourceTitle: 'MCP Docs' },
    { text: 'Implement resource vs tool distinction', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/claude-code/mcp', resourceTitle: 'MCP Docs' },
  ],
  'context-reliability': [
    { text: 'Study prompt caching setup', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching', resourceTitle: 'Prompt Caching' },
    { text: 'Implement context compaction', completed: false, resourceUrl: 'https://www.anthropic.com/engineering/effective-context-engineering', resourceTitle: 'Effective Context Engineering' },
    { text: 'Test retry-with-validation', completed: false, resourceUrl: 'https://www.anthropic.com/engineering/effective-context-engineering', resourceTitle: 'Effective Context Engineering' },
  ],
  'solution-design': [
    { text: 'Study RAG architecture patterns', completed: false, resourceUrl: 'https://github.com/anthropics/anthropic-cookbook', resourceTitle: 'Anthropic Cookbook' },
    { text: 'Design a fallback layer', completed: false, resourceUrl: 'https://www.anthropic.com/research/building-effective-agents', resourceTitle: 'Building Effective Agents' },
    { text: 'Review latency optimisation', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching', resourceTitle: 'Prompt Caching' },
  ],
  'models-prompting': [
    { text: 'Map Academy courses to blueprint domains', completed: false, resourceUrl: 'https://anthropic-partners.skilljar.com/page/partner-certifications', resourceTitle: 'Anthropic Partner Academy' },
    { text: 'Practice model routing logic', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/about-claude/models/overview', resourceTitle: 'Models Overview' },
    { text: 'Test large context patterns', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching', resourceTitle: 'Prompt Caching' },
  ],
  'eval-optimization': [
    { text: 'Build a canary rollout process', completed: false, resourceUrl: 'https://github.com/anthropics/anthropic-cookbook', resourceTitle: 'Anthropic Cookbook' },
    { text: 'Create fairness eval cases', completed: false, resourceUrl: 'https://github.com/anthropics/anthropic-cookbook', resourceTitle: 'Anthropic Cookbook' },
    { text: 'Study continuous monitoring', completed: false },
  ],
  'governance-safety': [
    { text: 'Read AI governance frameworks', completed: false, resourceUrl: 'https://www.anthropic.com/certification', resourceTitle: 'Anthropic Certification' },
    { text: 'Design an audit log schema', completed: false },
    { text: 'Review responsible AI guidelines', completed: false, resourceUrl: 'https://www.anthropic.com/certification', resourceTitle: 'Anthropic Certification' },
  ],
  'stakeholder-lifecycle': [
    { text: 'Practice explaining probabilistic AI', completed: false, resourceUrl: 'https://claude.com/blog/four-role-based-claude-certifications', resourceTitle: 'Claude Certifications Blog' },
    { text: 'Document a deployment runbook', completed: false },
    { text: 'Create a stakeholder FAQ', completed: false },
  ],
  'dev-productivity': [
    { text: 'Standardise CLAUDE.md across a monorepo', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/claude-code', resourceTitle: 'Claude Code Docs' },
    { text: 'Set up CI with Claude Code headless', completed: false, resourceUrl: 'https://www.anthropic.com/engineering/claude-code-best-practices', resourceTitle: 'Claude Code Best Practices' },
    { text: 'Review developer workflow guide', completed: false, resourceUrl: 'https://www.anthropic.com/engineering/claude-code-best-practices', resourceTitle: 'Claude Code Best Practices' },
  ],
  'output-eval': [
    { text: 'Review output evaluation frameworks', completed: false, resourceUrl: 'https://www.anthropic.com/certification', resourceTitle: 'Anthropic Certification Guide' },
    { text: 'Practice spotting hallucinations', completed: false },
    { text: 'Study factual grounding techniques', completed: false },
  ],
  'workflow-design': [
    { text: 'Map 3 business workflows to Claude prompts', completed: false },
    { text: 'Design a review-then-approve automation', completed: false },
    { text: 'Study integration patterns for non-coders', completed: false, resourceUrl: 'https://www.anthropic.com/certification', resourceTitle: 'Anthropic Certification Guide' },
  ],
  'governance-risk': [
    { text: 'Read Anthropic responsible use policies', completed: false, resourceUrl: 'https://www.anthropic.com/certification', resourceTitle: 'Anthropic Certification Guide' },
    { text: 'Identify 5 AI risk scenarios', completed: false },
    { text: 'Draft a usage policy template', completed: false },
  ],
  'prompting-tasks': [
    { text: 'Study role-based prompting', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering', resourceTitle: 'Prompt Engineering Guide' },
    { text: 'Practice iterative prompt refinement', completed: false },
    { text: 'Review prompt templating best practices', completed: false },
  ],
  'product-model': [
    { text: 'Compare Claude product tiers', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/about-claude/models/overview', resourceTitle: 'Models Overview' },
    { text: 'Learn when to use Claude.ai vs API', completed: false },
    { text: 'Study model capability differences', completed: false },
  ],
  'config-knowledge': [
    { text: 'Set up a custom Claude project', completed: false },
    { text: 'Configure knowledge base documents', completed: false },
    { text: 'Review memory and context settings', completed: false },
  ],
  'troubleshoot-opt': [
    { text: 'Study common prompt failure patterns', completed: false },
    { text: 'Practice debugging unexpected outputs', completed: false },
    { text: 'Review optimisation techniques', completed: false },
  ],
  'integration': [
    { text: 'Read the Agent SDK overview', completed: false, resourceUrl: 'https://platform.claude.com/docs/en/agent-sdk/overview', resourceTitle: 'Agent SDK Overview' },
    { text: 'Study API integration patterns', completed: false, resourceUrl: 'https://docs.anthropic.com/en/api/messages', resourceTitle: 'Messages API Reference' },
    { text: 'Review MCP integration approaches', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/claude-code/mcp', resourceTitle: 'MCP Docs' },
  ],
};

const defaultTasks: StudyTask[] = [
  { text: 'Review exam blueprint PDF', completed: false, resourceUrl: 'https://www.anthropic.com/certification', resourceTitle: 'Exam Blueprint' },
  { text: 'Take a practice quiz on this domain', completed: false },
  { text: 'Make flashcards for key concepts', completed: false },
];

// Cycle through accent colors for domain badges
const domainColors = ['var(--accent)', 'var(--success)', 'var(--warning)'];
function domainColor(domainId: string): string {
  let hash = 0;
  for (let i = 0; i < domainId.length; i++) hash = (hash * 31 + domainId.charCodeAt(i)) & 0xffff;
  return domainColors[hash % domainColors.length];
}

function generatePlan(certId: CertId, examDate: string, hoursPerDay: number): SPlan {
  const cert = certifications.find(c => c.id === certId)!;
  const today = new Date();
  const exam = new Date(examDate);
  const daysAvail = Math.max(1, Math.floor((exam.getTime() - today.getTime()) / 86400000));

  const days = [];
  const domains = [...cert.domains].sort((a, b) => b.weight - a.weight);
  let domainIdx = 0;

  for (let i = 0; i < daysAvail; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const domain = domains[domainIdx % domains.length];
    const templates = taskTemplates[domain.id] ?? defaultTasks;

    const dayTasks: StudyTask[] = [];
    const slots = Math.max(1, Math.min(3, Math.floor(hoursPerDay)));
    for (let t = 0; t < slots && t < templates.length; t++) {
      dayTasks.push({ ...templates[t] });
    }
    if (hoursPerDay >= 2) dayTasks.push({ text: 'Take a 10-question practice set on this domain', completed: false });
    if (i === daysAvail - 1) dayTasks.push({ text: 'Full mock exam — exam simulator mode', completed: false });

    days.push({ date: dateStr, domain: domain.id, tasks: dayTasks, completed: false });
    domainIdx++;
  }

  return { certId, examDate, hoursPerDay, createdAt: Date.now(), days };
}

export function StudyPlan() {
  const navigate = useNavigate();
  const { studyPlan, setStudyPlan, markDayComplete, toggleTask } = useAppStore();
  const [certId, setCertId] = useState<CertId>('ccdvf');
  const [examDate, setExamDate] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(2);

  const minDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];

  const create = () => {
    if (!examDate) { toast('Please select an exam date first.', 'error'); return; }
    setStudyPlan(generatePlan(certId, examDate, hoursPerDay));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Collapsible: today + past open by default
  const [openDays, setOpenDays] = useState<Set<string>>(() => {
    if (!studyPlan) return new Set();
    return new Set(studyPlan.days.filter(d => d.date <= todayStr).map(d => d.date));
  });

  const toggleOpen = (date: string) => {
    setOpenDays(prev => {
      const next = new Set(prev);
      next.has(date) ? next.delete(date) : next.add(date);
      return next;
    });
  };

  if (studyPlan) {
    const cert = certifications.find(c => c.id === studyPlan.certId)!;
    const completedDays = studyPlan.days.filter(d => d.completed).length;
    const totalDays = studyPlan.days.length;
    const daysLeft = Math.max(0, Math.floor((new Date(studyPlan.examDate).getTime() - Date.now()) / 86400000));
    const totalTasks = studyPlan.days.reduce((acc, d) => acc + d.tasks.length, 0);
    const completedTasks = studyPlan.days.reduce((acc, d) => acc + d.tasks.filter(t => t.completed).length, 0);
    const progressPct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Domain breakdown
    const domainStats: Record<string, { name: string; total: number; done: number }> = {};
    for (const day of studyPlan.days) {
      const certDomain = cert.domains.find(d => d.id === day.domain);
      if (!domainStats[day.domain]) domainStats[day.domain] = { name: certDomain?.name ?? day.domain, total: 0, done: 0 };
      domainStats[day.domain].total++;
      if (day.completed) domainStats[day.domain].done++;
    }

    return (
      <div className="page">
        {/* Header */}
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

        {/* Stats */}
        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Stat label="Days Done" value={`${completedDays}/${totalDays}`} />
          <Stat label="Days Left" value={daysLeft} />
          <Stat label="Tasks Done" value={`${completedTasks}/${totalTasks}`} />
          <Stat label="Progress" value={`${progressPct}%`} accent />
        </div>

        {/* Progress bar */}
        <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 4, marginBottom: '2rem', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--accent)', borderRadius: 4, transition: 'width 0.4s ease' }} />
        </div>

        {/* Day list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2.5rem' }}>
          {studyPlan.days.map(day => {
            const isToday = day.date === todayStr;
            const isPast = day.date < todayStr;
            const isOpen = openDays.has(day.date);
            const certDomain = cert.domains.find(d => d.id === day.domain);
            const color = domainColor(day.domain);
            const tasksDone = day.tasks.filter(t => t.completed).length;

            return (
              <div
                key={day.date}
                className="card"
                style={{
                  padding: 0,
                  borderColor: isToday ? 'var(--accent)' : day.completed ? 'var(--success)' : 'var(--border)',
                  boxShadow: isToday ? '0 0 0 1px var(--accent)' : undefined,
                  opacity: isPast && !day.completed ? 0.65 : 1,
                  overflow: 'hidden',
                }}
              >
                {/* Day header — always visible, click to toggle */}
                <button
                  onClick={() => toggleOpen(day.date)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ color: 'var(--muted)', flexShrink: 0 }}>
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isToday ? 'var(--accent-lt)' : 'var(--txt)', minWidth: 90 }}>
                    {new Date(day.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  {isToday && <span className="badge badge-accent" style={{ fontSize: '0.62rem' }}>Today</span>}
                  {day.completed && <span className="badge badge-success" style={{ fontSize: '0.62rem' }}>Done</span>}
                  <span style={{ fontSize: '0.72rem', color: color, fontWeight: 600, background: `color-mix(in srgb, ${color} 12%, transparent)`, padding: '0.1rem 0.4rem', borderRadius: 3, flexShrink: 0 }}>
                    {certDomain?.name ?? day.domain}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--muted)', flexShrink: 0 }}>
                    {tasksDone}/{day.tasks.length} tasks
                  </span>
                </button>

                {/* Collapsible task body */}
                {isOpen && (
                  <div style={{ padding: '0 1rem 0.85rem 2.2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {day.tasks.map((task, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <button
                          onClick={() => toggleTask(day.date, i)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem 0', flexShrink: 0, color: task.completed ? 'var(--success)' : 'var(--border)', marginTop: 1 }}
                          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {task.completed ? <CheckCircle size={15} /> : <Circle size={15} />}
                        </button>
                        <span style={{
                          fontSize: '0.8rem',
                          color: task.completed ? 'var(--muted)' : 'var(--txt)',
                          textDecoration: task.completed ? 'line-through' : 'none',
                          flex: 1,
                          lineHeight: 1.4,
                        }}>
                          {task.text}
                        </span>
                        {task.resourceUrl && (
                          <button
                            onClick={() => navigate('/resources', {
                              state: {
                                fromPlan: true,
                                date: day.date,
                                taskIdx: i,
                                resourceUrl: task.resourceUrl,
                                resourceTitle: task.resourceTitle,
                              },
                            })}
                            title={task.resourceTitle ?? 'Open in Resources'}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--accent)', flexShrink: 0, display: 'flex', alignItems: 'center', marginTop: 2, opacity: 0.8 }}
                          >
                            <ExternalLink size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    {/* Bulk complete if not done */}
                    {!day.completed && (
                      <button
                        onClick={() => markDayComplete(day.date)}
                        style={{
                          marginTop: '0.4rem', alignSelf: 'flex-start',
                          fontSize: '0.72rem', color: 'var(--accent)', background: 'none',
                          border: '1px solid var(--accent)', borderRadius: 4, padding: '0.2rem 0.6rem',
                          cursor: 'pointer', opacity: 0.8,
                        }}
                      >
                        Mark all complete
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Domain breakdown */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--txt)', marginBottom: '0.9rem' }}>Domain Progress</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {Object.entries(domainStats).map(([id, s]) => {
              const pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
              const color = domainColor(id);
              return (
                <div key={id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--txt)' }}>{s.name}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{s.done}/{s.total} days · {pct}%</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.4s' }} />
                  </div>
                </div>
              );
            })}
          </div>
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
        Enter your exam date and study hours — get a personalised day-by-day schedule with domain tasks and direct resource links.
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

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: accent ? 'var(--accent-lt)' : 'var(--txt)' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{label}</div>
    </div>
  );
}
