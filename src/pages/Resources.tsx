import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ExternalLink, Filter, ArrowLeft, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { resourceSections } from '../data/resources';
import { certifications } from '../data/certifications';
import { useAppStore } from '../store/useAppStore';

const typeLabel: Record<string, string> = {
  official: 'Official',
  docs: 'Docs',
  course: 'Course',
  'third-party': 'Third-party',
  blog: 'Blog',
};

const typeBadge: Record<string, string> = {
  official: 'badge-warn',
  docs: 'badge-accent',
  course: 'badge-success',
  'third-party': 'badge-muted',
  blog: 'badge-muted',
};

interface QuizQ {
  q: string;
  options: string[];
  correct: number;
}

const resourceQuizzes: Record<string, QuizQ[]> = {
  'https://docs.anthropic.com/en/api/messages': [
    { q: 'Which parameter limits the number of output tokens in a Messages API response?', options: ['max_tokens', 'response_limit', 'output_length', 'token_cap'], correct: 0 },
    { q: 'What HTTP method does the Messages API endpoint use?', options: ['POST', 'GET', 'PUT', 'PATCH'], correct: 0 },
    { q: 'Which role must the first message in a messages array use?', options: ['user', 'assistant', 'system', 'model'], correct: 0 },
  ],
  'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering': [
    { q: 'What structuring syntax does Anthropic recommend for organizing complex prompt sections?', options: ['XML tags', 'JSON blocks', 'Markdown headers', 'YAML sections'], correct: 0 },
    { q: 'Which prompting technique provides Claude with examples of desired input–output pairs?', options: ['Few-shot prompting', 'Chain-of-thought', 'Role prompting', 'Zero-shot prompting'], correct: 0 },
    { q: 'Where should the primary task or question ideally appear in a prompt?', options: ['At or near the end', 'At the very beginning', 'In the middle', 'In the system prompt only'], correct: 0 },
  ],
  'https://www.anthropic.com/research/building-effective-agents': [
    { q: 'What is the key difference between a "workflow" and an "agent" according to Anthropic?', options: ['Workflows follow predefined code paths; agents decide dynamically', 'Agents are faster than workflows', 'Workflows use more tools', 'Agents are cheaper to run'], correct: 0 },
    { q: 'Which agentic pattern executes independent subtasks simultaneously and aggregates results?', options: ['Parallelization / fan-out', 'Sequential chaining', 'ReAct loop', 'Router pattern'], correct: 0 },
    { q: 'What does Anthropic recommend for high-stakes, irreversible actions in agentic systems?', options: ['Human-in-the-loop confirmation checkpoints', 'Automatic retry logic', 'Selecting a faster model', 'Using streaming output'], correct: 0 },
  ],
  'https://docs.anthropic.com/en/docs/build-with-claude/tool-use': [
    { q: 'How does Claude signal that it wants to invoke a tool?', options: ['A structured tool_use content block in the response', 'A JSON string inside the message text', 'A special system prompt tag', 'A separate HTTP POST request'], correct: 0 },
    { q: 'What must the client send back after Claude invokes a tool?', options: ['A tool_result message with the outcome', 'A new system prompt', 'An HTTP 200 acknowledgement only', 'A follow-up user message'], correct: 0 },
    { q: 'Which tool_choice value forces Claude to use one specific named tool?', options: ['{"type":"tool","name":"<name>"}', '"required"', '"auto"', '"any"'], correct: 0 },
  ],
  'https://docs.anthropic.com/en/docs/claude-code/mcp': [
    { q: 'What are the three primary primitives exposed by an MCP server?', options: ['Tools, Resources, and Prompts', 'Tools, Models, and APIs', 'Servers, Clients, and Transports', 'Inputs, Outputs, and Schemas'], correct: 0 },
    { q: 'Which MCP transport is used for local same-machine communication?', options: ['stdio', 'HTTP/SSE', 'WebSocket', 'gRPC'], correct: 0 },
    { q: 'What does an MCP "Resource" represent?', options: ['Static or dynamic data the server exposes for reading', 'A callable function that modifies state', 'A model selection configuration', 'A streaming endpoint'], correct: 0 },
  ],
  'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching': [
    { q: 'What is the minimum number of tokens required to cache a prompt on standard Claude 3.x models?', options: ['1,024 tokens', '512 tokens', '2,048 tokens', '256 tokens'], correct: 0 },
    { q: 'Which cache_control value enables prompt caching in the API?', options: ['{"type":"ephemeral"}', '{"type":"cached"}', '{"type":"persist"}', '{"type":"store"}'], correct: 0 },
    { q: 'Approximately how long does a cached prompt remain in the cache?', options: ['5 minutes', '1 hour', '24 hours', 'Until the session ends'], correct: 0 },
  ],
  'https://www.anthropic.com/engineering/effective-context-engineering': [
    { q: 'What technique does Anthropic recommend to prevent context windows from overflowing in long-running agents?', options: ['Context compaction / summarization', 'Increasing max_tokens', 'Switching to a smaller model', 'Batching all requests'], correct: 0 },
    { q: 'Where should important instructions be placed to avoid the "lost-in-the-middle" effect?', options: ['At the start or end of the context, not buried in the middle', 'Always in the system prompt', 'Repeated every 1,000 tokens', 'Inside tool descriptions'], correct: 0 },
    { q: 'What is a recommended practice for maintaining agent reliability over long task chains?', options: ['Storing intermediate results externally and retrieving them as needed', 'Keeping everything in one giant context window', 'Restarting the agent from scratch on each step', 'Using streaming output only'], correct: 0 },
  ],
  'https://docs.anthropic.com/en/docs/claude-code': [
    { q: 'What file provides project-level instructions that Claude Code reads automatically?', options: ['CLAUDE.md', '.claude/config.json', 'settings.local.json', 'claude.config.ts'], correct: 0 },
    { q: 'What Claude Code mechanism runs shell commands automatically in response to lifecycle events?', options: ['Hooks', 'Plugins', 'Scripts', 'Triggers'], correct: 0 },
    { q: 'Which setting controls which shell commands Claude Code can run without prompting the user?', options: ['allowedTools', 'permissions', 'trustedCommands', 'autoApprove'], correct: 0 },
  ],
  'https://www.anthropic.com/engineering/claude-code-best-practices': [
    { q: 'How does Anthropic recommend running Claude Code in CI/CD pipelines?', options: ['Headless / non-interactive mode', 'Manual approval for every command', 'Disabling all tool use', 'Read-only tools only'], correct: 0 },
    { q: 'How should CLAUDE.md be structured in a monorepo?', options: ['Root CLAUDE.md with package-level overrides', 'A single flat file for everything', 'Per-engineer CLAUDE.md files', 'One file per CI stage'], correct: 0 },
    { q: 'What property should hooks in Claude Code have?', options: ['Fast and idempotent', 'Always async', 'Disabled in production', 'Applied to every file operation'], correct: 0 },
  ],
  'https://docs.anthropic.com/en/docs/build-with-claude/structured-outputs': [
    { q: 'Which technique is most reliable for getting Claude to return structured JSON?', options: ['tool_use with a JSON schema definition', 'A system prompt instruction alone', 'Setting temperature to 0', 'Using a max_tokens limit'], correct: 0 },
    { q: 'What is a key benefit of using XML tags when extracting structured data from Claude?', options: ['Predictable parsing boundaries', 'Faster inference speed', 'Lower token cost', 'Better multilingual support'], correct: 0 },
    { q: 'When using tool_use purely for structured output, what should tool_choice be set to?', options: ['{"type":"tool","name":"<your tool name>"}', '"auto"', '"required"', '"none"'], correct: 0 },
  ],
  'https://www.anthropic.com/engineering/writing-tools-for-agents': [
    { q: 'What property should well-designed tools have to be safe in agentic contexts?', options: ['Idempotency', 'Maximum throughput', 'Minimal logging', 'Streaming support'], correct: 0 },
    { q: 'How detailed should tool descriptions be?', options: ['Detailed enough for the model to self-serve without developer help', 'As brief as possible', 'Include full implementation source', 'Use code examples only'], correct: 0 },
    { q: 'What does Anthropic recommend to prevent tools from causing irreversible damage?', options: ['Confirmation steps before destructive operations', 'Read-only tools only in production', 'Running every tool in a sandbox', 'Logging every tool call'], correct: 0 },
  ],
  'https://github.com/anthropics/anthropic-cookbook': [
    { q: 'What format does the Anthropic Cookbook primarily use for its examples?', options: ['Jupyter notebooks', 'Python scripts only', 'TypeScript modules', 'REST API collections'], correct: 0 },
    { q: 'Which technique does the Cookbook demonstrate for grounding Claude in factual data?', options: ['RAG (retrieval-augmented generation)', 'Zero-shot prompting only', 'Context minimization', 'Fine-tuning'], correct: 0 },
    { q: 'What is the primary purpose of the Anthropic Cookbook?', options: ['Practical code recipes for common Claude patterns', 'Official API documentation', 'Model training guides', 'Benchmark results'], correct: 0 },
  ],
  'https://docs.anthropic.com/en/docs/about-claude/models/overview': [
    { q: 'Which Claude model tier is optimized for the lowest cost and highest speed?', options: ['Haiku', 'Sonnet', 'Opus', 'Fable'], correct: 0 },
    { q: 'Which Claude model tier is best for the most complex reasoning and nuanced tasks?', options: ['Opus', 'Sonnet', 'Haiku', 'Instant'], correct: 0 },
    { q: 'What does the date suffix in a model ID like claude-sonnet-4-5-20251022 represent?', options: ['A specific dated model snapshot', 'The model version number', 'The release price tier', 'The maximum token limit'], correct: 0 },
  ],
  'https://platform.claude.com/docs/en/agent-sdk/overview': [
    { q: 'What is a key advantage of the Claude Agent SDK over raw Messages API calls?', options: ['Managed tool loop and conversation state', 'Faster raw response times', 'Lower per-token cost', 'Built-in streaming only'], correct: 0 },
    { q: 'What kind of architecture does the Agent SDK primarily support?', options: ['Orchestrator agents that coordinate subagents', 'Single-turn Q&A only', 'Batch processing jobs', 'Image generation pipelines'], correct: 0 },
    { q: 'In the Python SDK, which feature runs a managed agentic tool loop for you?', options: ['client.beta.messages.tool_runner', 'Agent.run()', 'Claude.start()', 'anthropic.Agent()'], correct: 0 },
  ],
  'https://github.com/anthropics/claude-agent-sdk-python': [
    { q: 'What is the primary use case for the Claude Agent SDK Python library?', options: ['Building orchestrator-subagent multi-agent systems', 'Simple single-turn API calls', 'Model fine-tuning', 'Batch embedding generation'], correct: 0 },
    { q: 'What pattern does the Agent SDK facilitate in multi-agent architectures?', options: ['One orchestrator spawning and managing multiple specialized subagents', 'Round-robin load balancing between models', 'Sequential chaining only', 'Parallel model training'], correct: 0 },
    { q: 'Where is the Agent SDK documentation hosted?', options: ['platform.claude.com/docs/en/agent-sdk/overview', 'docs.anthropic.com/agents', 'github.com/anthropics/docs', 'api.claude.ai/sdk'], correct: 0 },
  ],
  'https://anthropic.skilljar.com/claude-with-the-anthropic-api': [
    { q: 'What Python package do you install to use the Anthropic API?', options: ['anthropic', 'openai-compat', 'claude-sdk', 'anthropic-client'], correct: 0 },
    { q: 'Which parameter enables streaming responses in the Anthropic Python SDK?', options: ['stream=True', 'streaming=True', 'response_mode="stream"', 'event_stream=True'], correct: 0 },
    { q: 'What field in a Messages API response tells you why Claude stopped generating?', options: ['stop_reason', 'finish_reason', 'end_cause', 'termination_code'], correct: 0 },
  ],
};

const genericQuiz: QuizQ[] = [
  { q: 'What is the recommended approach when using Claude for high-stakes decisions?', options: ['Include a human-in-the-loop review step', 'Fully automate and trust the output', 'Lower the temperature to 0', 'Increase max_tokens significantly'], correct: 0 },
  { q: 'Which Claude capability is most useful for complex multi-step reasoning tasks?', options: ['Extended thinking / chain-of-thought', 'One-shot prompting only', 'Streaming output', 'Batch API'], correct: 0 },
  { q: 'What should you always include in a production Claude integration?', options: ['Input validation and output review', 'Maximum token limits only', 'A fixed system prompt that never changes', 'The lowest-cost model always'], correct: 0 },
];

interface PlanState {
  fromPlan: boolean;
  date: string;
  taskIdx: number;
  resourceUrl?: string;
  resourceTitle?: string;
  readingFocus?: string;
}

export function Resources() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleTask } = useAppStore();

  const planState = (location.state as PlanState | null);
  const fromPlan = planState?.fromPlan === true;

  const [quizActive, setQuizActive] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [certFilter, setCertFilter] = useState<string>('all');

  const highlightedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (fromPlan && matchingUrl) {
      setTimeout(() => {
        highlightedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = resourceSections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      certFilter === 'all' || !item.certs || item.certs.includes(certFilter),
    ),
  })).filter(s => s.items.length > 0);

  const matchingUrl = planState?.resourceUrl;
  let foundMatch = false;
  if (matchingUrl) {
    for (const section of resourceSections) {
      if (section.items.some(item => item.url === matchingUrl)) { foundMatch = true; break; }
    }
  }

  const quizQuestions = matchingUrl ? (resourceQuizzes[matchingUrl] ?? genericQuiz) : genericQuiz;
  const allAnswered = quizQuestions.every((_, i) => selectedAnswers[i] !== undefined);
  const score = submitted ? quizQuestions.filter((q, i) => selectedAnswers[i] === q.correct).length : 0;

  const handleMarkComplete = () => {
    if (planState && planState.date !== undefined && planState.taskIdx !== undefined) {
      toggleTask(planState.date, planState.taskIdx);
    }
    navigate('/plan');
  };

  return (
    <div className="page">
      {/* Study plan mode banner */}
      {fromPlan && (
        <div className="card" style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          borderColor: 'var(--accent)',
          background: 'var(--surface)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          position: 'sticky',
          top: 56,
          zIndex: 20,
          boxShadow: '0 4px 16px color-mix(in srgb, var(--accent) 12%, transparent)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/plan')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', padding: 0 }}
            >
              <ArrowLeft size={13} /> Back to Study Plan
            </button>
            <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>·</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BookOpen size={13} style={{ color: 'var(--accent-lt)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--txt)', fontWeight: 600 }}>
                Studying: {planState?.resourceTitle ?? 'Resource'}
              </span>
            </div>
          </div>

          {/* Reading focus hint */}
          {planState?.readingFocus && (
            <div style={{
              fontSize: '0.78rem',
              color: 'var(--txt)',
              background: 'color-mix(in srgb, var(--accent) 8%, var(--surface2))',
              borderLeft: '3px solid var(--accent)',
              borderRadius: '0 0.375rem 0.375rem 0',
              padding: '0.5rem 0.75rem',
              lineHeight: 1.5,
            }}>
              <span style={{ fontWeight: 700, color: 'var(--accent-lt)' }}>📍 What to focus on: </span>
              {planState.readingFocus}
            </div>
          )}

          {/* No-match fallback: standalone open link + Done Reading */}
          {!quizActive && !foundMatch && matchingUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <a href={matchingUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '0.82rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ExternalLink size={12} /> Open resource in new tab
              </a>
              <button
                onClick={() => setQuizActive(true)}
                className="btn-primary"
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.9rem' }}
              >
                Done Reading?
              </button>
            </div>
          )}

          {/* Quiz questions */}
          {quizActive && !submitted && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: 0 }}>Answer these 3 quick questions to reinforce what you read:</p>
              {quizQuestions.map((q, qi) => (
                <div key={qi} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--txt)', margin: 0 }}>{qi + 1}. {q.q}</p>
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => setSelectedAnswers(prev => ({ ...prev, [qi]: oi }))}
                      style={{
                        textAlign: 'left', padding: '0.4rem 0.75rem', borderRadius: '0.375rem',
                        border: `1.5px solid ${selectedAnswers[qi] === oi ? 'var(--accent)' : 'var(--border)'}`,
                        background: selectedAnswers[qi] === oi ? 'color-mix(in srgb, var(--accent) 10%, var(--surface))' : 'transparent',
                        cursor: 'pointer', fontSize: '0.8rem', color: 'var(--txt)', transition: 'all 0.12s',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ))}
              <button
                className="btn-primary"
                disabled={!allAnswered}
                onClick={() => setSubmitted(true)}
                style={{ alignSelf: 'flex-start', fontSize: '0.82rem', padding: '0.4rem 1.1rem', opacity: allAnswered ? 1 : 0.5 }}
              >
                Submit answers
              </button>
            </div>
          )}

          {/* Results */}
          {submitted && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {score === quizQuestions.length
                  ? <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                  : <XCircle size={16} style={{ color: 'var(--warn)' }} />}
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--txt)' }}>
                  {score}/{quizQuestions.length} correct
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                  {score === quizQuestions.length ? '— Perfect! Great recall.' : score >= 2 ? '— Good. Review the missed ones.' : '— Worth re-reading the resource.'}
                </span>
              </div>
              {quizQuestions.map((q, qi) => {
                const correct = selectedAnswers[qi] === q.correct;
                return (
                  <div key={qi} style={{ fontSize: '0.78rem', display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                    {correct
                      ? <CheckCircle size={13} style={{ color: 'var(--success)', marginTop: 1, flexShrink: 0 }} />
                      : <XCircle size={13} style={{ color: 'var(--danger)', marginTop: 1, flexShrink: 0 }} />}
                    <span style={{ color: correct ? 'var(--muted)' : 'var(--txt)' }}>
                      {correct
                        ? q.q
                        : <><strong>Q{qi + 1}:</strong> {q.q} — Correct: <strong>{q.options[q.correct]}</strong></>}
                    </span>
                  </div>
                );
              })}
              <button
                className="btn-primary"
                onClick={handleMarkComplete}
                style={{ alignSelf: 'flex-start', fontSize: '0.82rem', padding: '0.4rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <CheckCircle size={13} /> Mark task complete &amp; go back
              </button>
            </div>
          )}
        </div>
      )}

      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--txt)', marginBottom: '0.5rem' }}>Resources</h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Official docs, Anthropic Academy courses, and third-party guides — curated for exam relevance.
      </p>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Filter size={14} style={{ color: 'var(--muted)' }} />
        {[{ id: 'all', shortName: 'All tracks' }, ...certifications].map(c => (
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
            {'shortName' in c ? c.shortName : 'All tracks'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {filtered.map(section => (
          <div key={section.heading}>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
              {section.heading}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {section.items.map(item => {
                const isHighlighted = fromPlan && item.url === matchingUrl;
                return (
                  <div key={item.url + item.title} ref={isHighlighted ? highlightedRef : undefined} style={{ position: 'relative' }}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      <div
                        className="card"
                        style={{
                          padding: '1rem 1.25rem',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem',
                          transition: 'border-color 0.15s', cursor: 'pointer',
                          borderColor: isHighlighted ? 'var(--accent)' : 'var(--border)',
                          boxShadow: isHighlighted ? '0 0 0 1px var(--accent)' : undefined,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = isHighlighted ? 'var(--accent)' : 'var(--border)')}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--txt)' }}>{item.title}</span>
                            <span className={`badge ${typeBadge[item.type]}`} style={{ fontSize: '0.65rem' }}>{typeLabel[item.type]}</span>
                            {item.free && <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Free</span>}
                            {item.certs && item.certs.map(c => (
                              <span key={c} className="badge badge-muted" style={{ fontSize: '0.62rem' }}>{c.toUpperCase()}</span>
                            ))}
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.55 }}>{item.description}</p>
                        </div>
                        <ExternalLink size={14} style={{ color: 'var(--muted)', flexShrink: 0, marginTop: 2 }} />
                      </div>
                    </a>
                    {/* Done Reading button on the highlighted card */}
                    {isHighlighted && !quizActive && !submitted && (
                      <button
                        onClick={e => { e.stopPropagation(); setQuizActive(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        style={{
                          position: 'absolute', top: '0.6rem', right: '2.5rem',
                          fontSize: '0.72rem', padding: '0.2rem 0.65rem',
                          background: 'var(--accent)', color: '#fff', border: 'none',
                          borderRadius: 4, cursor: 'pointer', fontWeight: 600,
                        }}
                      >
                        Done Reading?
                      </button>
                    )}
                    {isHighlighted && quizActive && !submitted && (
                      <div style={{
                        position: 'absolute', top: '0.6rem', right: '2.5rem',
                        fontSize: '0.72rem', padding: '0.2rem 0.65rem',
                        background: 'var(--success)', color: '#fff', borderRadius: 4, fontWeight: 600,
                      }}>
                        Quiz in progress ↑
                      </div>
                    )}
                    {isHighlighted && submitted && (
                      <div style={{
                        position: 'absolute', top: '0.6rem', right: '2.5rem',
                        fontSize: '0.72rem', padding: '0.2rem 0.65rem',
                        background: score === quizQuestions.length ? 'var(--success)' : 'var(--warn)',
                        color: '#fff', borderRadius: 4, fontWeight: 600,
                      }}>
                        {score}/{quizQuestions.length} ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
