import { useState } from 'react';
import { BookMarked, Search } from 'lucide-react';

interface Term {
  term: string;
  definition: string;
  certs?: string[];
  category: string;
}

const glossaryTerms: Term[] = [
  // Core Claude concepts
  { term: 'Agentic loop', definition: 'A repeated cycle where Claude receives a result (e.g. a tool output), processes it, and decides on the next action — continuing until a stop condition is met.', certs: ['ccarf', 'ccarp'], category: 'Agentic Architecture' },
  { term: 'Computer use', definition: "Claude's ability to interact with GUIs — clicking, typing, and navigating screens — through screenshot-based perception.", certs: ['ccarf', 'ccarp'], category: 'Agentic Architecture' },
  { term: 'Fan-out parallelism', definition: 'A pattern where an orchestrator dispatches multiple subagent tasks simultaneously, then aggregates their results.', certs: ['ccarf', 'ccarp'], category: 'Agentic Architecture' },
  { term: 'Hardcoded iteration cap', definition: 'An anti-pattern where a fixed loop limit is set without checking the actual stop condition — leads to premature termination or wasted cycles.', certs: ['ccarf'], category: 'Agentic Architecture' },
  { term: 'Orchestrator', definition: 'The top-level Claude instance that directs subagents, routes tasks, and aggregates results in a multi-agent system.', certs: ['ccarf', 'ccarp'], category: 'Agentic Architecture' },
  { term: 'ReAct loop', definition: 'Reason + Act — a prompting pattern where Claude alternates between reasoning steps and tool calls to solve a problem iteratively.', certs: ['ccarf', 'ccarp'], category: 'Agentic Architecture' },
  { term: 'stop_reason field', definition: "The field in Claude's API response that signals why generation stopped: 'end_turn', 'tool_use', 'max_tokens'. Always check this — not the response text — to determine loop completion.", certs: ['ccarf', 'ccarp'], category: 'Agentic Architecture' },
  { term: 'Subagent', definition: 'A Claude instance invoked by an orchestrator to complete a specific subtask. Subagents are scoped to their assigned work and return results to the orchestrator.', certs: ['ccarf', 'ccarp'], category: 'Agentic Architecture' },

  // Prompting
  { term: 'Chain-of-thought (CoT)', definition: "A prompting technique that instructs Claude to reason step-by-step before answering. Improves accuracy on multi-step reasoning tasks. Triggered by phrases like 'Think step by step.'", certs: ['ccdvf', 'ccarf', 'ccarp'], category: 'Prompt Engineering' },
  { term: 'Few-shot prompting', definition: 'Providing 2–5 input/output examples in the prompt to demonstrate the desired format or style. The most effective technique for replicating a specific pattern.', certs: ['ccaa', 'ccdvf', 'ccarf'], category: 'Prompt Engineering' },
  { term: 'Prompt injection', definition: 'An attack where malicious content in the environment (e.g. a webpage, document, or tool output) attempts to override Claude\'s instructions.', certs: ['ccdvf', 'ccarf', 'ccarp'], category: 'Prompt Engineering' },
  { term: 'System prompt', definition: 'Instructions passed by the developer before the conversation begins. Sets Claude\'s role, constraints, and context. Takes precedence over user messages.', certs: ['ccaa', 'ccdvf', 'ccarf', 'ccarp'], category: 'Prompt Engineering' },
  { term: 'XML structuring', definition: 'Using XML tags (e.g. <document>, <instructions>) to clearly delimit sections of a prompt — improves Claude\'s parsing of complex, multi-part inputs.', certs: ['ccdvf', 'ccarf'], category: 'Prompt Engineering' },
  { term: 'Zero-shot prompting', definition: 'Asking Claude to complete a task with no examples — relying purely on instructions. Works well for simple, clearly defined tasks.', certs: ['ccaa', 'ccdvf'], category: 'Prompt Engineering' },

  // API & Dev
  { term: 'Context window', definition: 'The total number of tokens (input + output combined) that Claude can process in a single API call. Larger contexts allow more history but increase latency and cost.', certs: ['ccdvf', 'ccarf', 'ccarp'], category: 'API & Development' },
  { term: 'ETag', definition: 'A cache validator returned by the API — used with prompt caching to verify that a cached prefix is still valid.', certs: ['ccdvf'], category: 'API & Development' },
  { term: 'Max tokens', definition: 'The maximum number of tokens Claude will generate in a response. Setting it too low truncates output; setting it too high wastes budget on padding.', certs: ['ccdvf'], category: 'API & Development' },
  { term: 'Messages API', definition: "Anthropic's core API for conversational interactions. Accepts a list of messages (user/assistant turns) and returns a completion.", certs: ['ccdvf'], category: 'API & Development' },
  { term: 'Prompt caching', definition: 'A feature that caches a fixed prompt prefix across API calls. Reduces cost and latency for repeated context (e.g. large documents, system prompts).', certs: ['ccdvf', 'ccarf', 'ccarp'], category: 'API & Development' },
  { term: 'Streaming', definition: 'Receiving Claude\'s response token-by-token as it is generated, rather than waiting for the full response. Improves perceived latency for long outputs.', certs: ['ccdvf'], category: 'API & Development' },
  { term: 'Temperature', definition: "A parameter (0–1) that controls output randomness. Lower = more deterministic; higher = more creative. Does not control output length or factual accuracy.", certs: ['ccaa', 'ccdvf'], category: 'API & Development' },
  { term: 'Tool use (function calling)', definition: "Claude's ability to invoke developer-defined functions (tools) — e.g. web search, database queries — by outputting a structured tool_use block.", certs: ['ccdvf', 'ccarf', 'ccarp'], category: 'API & Development' },

  // MCP & Tools
  { term: 'MCP (Model Context Protocol)', definition: 'An open protocol for connecting Claude to external tools, data sources, and services via a standardised server interface.', certs: ['ccarf', 'ccarp'], category: 'MCP & Tools' },
  { term: 'MCP resource', definition: 'A read-only data source exposed by an MCP server (e.g. a file, database record) that Claude can retrieve without taking an action.', certs: ['ccarf'], category: 'MCP & Tools' },
  { term: 'MCP server', definition: 'A lightweight process that implements the MCP protocol, exposing tools, resources, and prompts to Claude.', certs: ['ccarf'], category: 'MCP & Tools' },
  { term: 'MCP transport', definition: 'The communication layer between Claude and an MCP server. Options include stdio (local), SSE (remote HTTP), and WebSocket.', certs: ['ccarf'], category: 'MCP & Tools' },
  { term: 'Tool description', definition: 'The natural-language text that tells Claude what a tool does and when to use it. Description quality — not the tool name or schema — is the primary driver of routing accuracy.', certs: ['ccarf'], category: 'MCP & Tools' },
  { term: 'Tool idempotency', definition: 'Designing tools so that calling them multiple times with the same inputs produces the same result — critical for reliability in retry scenarios.', certs: ['ccarf'], category: 'MCP & Tools' },

  // Claude Code
  { term: 'allowedTools', definition: 'A Claude Code setting that whitelists which tools Claude can use in a session — enforces least-privilege access.', certs: ['ccarf'], category: 'Claude Code' },
  { term: 'CLAUDE.md', definition: 'A markdown file placed in a project directory that Claude Code reads automatically at startup. Used to encode project context, conventions, and instructions.', certs: ['ccarf'], category: 'Claude Code' },
  { term: 'Headless / CI mode', definition: 'Running Claude Code non-interactively in a pipeline — no human in the loop. Requires explicit tool permissions to be set in advance.', certs: ['ccarf'], category: 'Claude Code' },
  { term: 'Hook (Claude Code)', definition: 'A shell command that runs in response to a Claude Code lifecycle event (e.g. before a tool call, after a response). Used to enforce policies or automate actions.', certs: ['ccarf'], category: 'Claude Code' },
  { term: 'Settings hierarchy', definition: 'Claude Code settings are applied in order: Enterprise → User → Project. Enterprise settings always win; project settings are applied last.', certs: ['ccarf'], category: 'Claude Code' },

  // Evaluation & Safety
  { term: 'Canary rollout', definition: 'Deploying a new model or prompt change to a small percentage of traffic first, monitoring for regressions before a full rollout.', certs: ['ccarp'], category: 'Evaluation & Safety' },
  { term: 'Constitutional AI', definition: "Anthropic's training approach that uses a set of principles to guide Claude's responses — the basis for Claude's safety and helpfulness properties.", certs: ['ccaa', 'ccarp'], category: 'Evaluation & Safety' },
  { term: 'Hallucination', definition: "Claude generating confident-sounding content that is factually incorrect or fabricated. Not detectable from Claude's own confidence signals — requires external validation.", certs: ['ccaa', 'ccdvf', 'ccarf'], category: 'Evaluation & Safety' },
  { term: 'Human-in-the-loop (HITL)', definition: 'A workflow design where a human reviews or approves Claude\'s output before it is acted upon — essential for high-stakes or irreversible actions.', certs: ['ccaa', 'ccarf', 'ccarp'], category: 'Evaluation & Safety' },
  { term: 'LLM-as-judge', definition: 'Using a language model to evaluate another model\'s outputs — e.g. scoring Claude\'s answers for correctness or relevance. Common in automated eval pipelines.', certs: ['ccdvf', 'ccarp'], category: 'Evaluation & Safety' },
  { term: 'Output validation', definition: "Programmatically checking Claude's output against expected formats, facts, or constraints before acting on it — the first line of defence against hallucinations.", certs: ['ccaa', 'ccdvf', 'ccarf'], category: 'Evaluation & Safety' },
  { term: 'Regression test', definition: 'A test that verifies a known-good behaviour is preserved after a prompt or model change — catches silent regressions in production.', certs: ['ccdvf', 'ccarp'], category: 'Evaluation & Safety' },

  // Governance
  { term: 'Audit log', definition: 'A tamper-evident record of AI interactions — who sent what, when, and what Claude responded. Required for compliance in regulated environments.', certs: ['ccarp'], category: 'Governance & Responsibility' },
  { term: 'Data minimisation', definition: 'The principle of using only the minimum personal data required for a task — reduces privacy risk when passing data to AI systems.', certs: ['ccaa', 'ccarp'], category: 'Governance & Responsibility' },
  { term: 'PII (Personally Identifiable Information)', definition: 'Data that can identify an individual (name, email, ID number, etc.). Always requires explicit data governance review before processing through an AI system.', certs: ['ccaa', 'ccarp'], category: 'Governance & Responsibility' },
  { term: 'Responsible AI disclosure', definition: "The practice of informing users or readers when content was generated or materially assisted by AI — increasingly required by policy and regulation.", certs: ['ccaa', 'ccarp'], category: 'Governance & Responsibility' },
];

const categories = [...new Set(glossaryTerms.map(t => t.category))];

export function Glossary() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = glossaryTerms.filter(t => {
    const matchSearch = !search || t.term.toLowerCase().includes(search.toLowerCase()) || t.definition.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || t.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
        <BookMarked size={20} style={{ color: 'var(--accent-lt)' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--txt)' }}>Glossary</h1>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Key terms across all certification domains — searchable and categorised.
      </p>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Search terms or definitions…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 400, paddingLeft: '2.25rem' }}
        />
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {['all', ...categories].map(c => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            style={{
              padding: '0.25rem 0.7rem', borderRadius: '0.375rem',
              border: `1.5px solid ${activeCategory === c ? 'var(--accent)' : 'var(--border)'}`,
              background: activeCategory === c ? 'color-mix(in srgb, var(--accent) 10%, var(--surface))' : 'transparent',
              cursor: 'pointer', fontSize: '0.73rem', fontWeight: 500,
              color: activeCategory === c ? 'var(--accent-lt)' : 'var(--muted)', transition: 'all 0.15s',
            }}
          >
            {c === 'all' ? 'All' : c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
          No terms match your search.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filtered.map(t => (
            <div key={t.term} className="card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--txt)' }}>{t.term}</span>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--muted)', background: 'var(--surface2)', padding: '0.15rem 0.4rem', borderRadius: '0.25rem' }}>{t.category}</span>
                  {t.certs?.map(c => (
                    <span key={c} style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--accent-lt)', background: 'color-mix(in srgb, var(--accent) 12%, transparent)', padding: '0.15rem 0.4rem', borderRadius: '0.25rem' }}>
                      {c.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
              <p style={{ fontSize: '0.83rem', color: 'var(--muted)', lineHeight: 1.65 }}>{t.definition}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
