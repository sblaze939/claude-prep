import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, CheckCircle, Circle, Trash2, ExternalLink, ChevronDown, ChevronRight, FlaskConical } from 'lucide-react';
import { certifications } from '../data/certifications';
import { useAppStore } from '../store/useAppStore';
import { toast } from '../components/ui/Toast';
import type { CertId, StudyPlan as SPlan, StudyTask } from '../types';

const taskTemplates: Record<string, StudyTask[]> = {
  'app-integration': [
    { text: 'Read the Messages API docs', completed: false, resourceUrl: 'https://docs.anthropic.com/en/api/messages', resourceTitle: 'Messages API Reference', readingFocus: 'Focus on: request body params (model, messages, max_tokens), stop_reason values (end_turn/max_tokens/stop_sequence), and the streaming event sequence' },
    { text: 'Practice streaming requests', completed: false, resourceUrl: 'https://docs.anthropic.com/en/api/messages', resourceTitle: 'Messages API Reference', readingFocus: 'Focus on: the stream=True parameter, content_block_delta events, and how to accumulate partial text deltas' },
    { text: 'Build a basic chatbot loop', completed: false, resourceUrl: 'https://anthropic.skilljar.com/claude-with-the-anthropic-api', resourceTitle: 'Building with Claude API Course', readingFocus: 'Focus on: alternating user/assistant turns, appending messages to history, and when to reset context' },
  ],
  'model-selection': [
    { text: 'Compare Haiku vs Sonnet vs Opus costs', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/about-claude/models/overview', resourceTitle: 'Claude Models Overview', readingFocus: 'Focus on: per-token pricing tiers, Haiku for classification, Sonnet for balanced tasks, Opus for complex reasoning — and the speed/cost/intelligence tradeoffs' },
    { text: 'Test classification with Haiku', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/about-claude/models/overview', resourceTitle: 'Claude Models Overview', readingFocus: "Focus on: Haiku's context window, when to use it over Sonnet, and structuring classification prompts for consistent output" },
    { text: 'Review model selection guide', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/about-claude/models/overview', resourceTitle: 'Claude Models Overview', readingFocus: 'Focus on: routing logic between models and the cost guardrail patterns' },
  ],
  'prompt-context': [
    { text: 'Study XML structuring techniques', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering', resourceTitle: 'Prompt Engineering Guide', readingFocus: "Focus on: <document>, <instructions>, <example> tag patterns; placing the task AFTER context; why XML outperforms markdown for Claude's parser" },
    { text: 'Practice few-shot examples', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering', resourceTitle: 'Prompt Engineering Guide', readingFocus: 'Focus on: using 3–5 input/output pairs, placing examples before the live input, and keeping formatting consistent across all examples' },
    { text: 'Review prompt engineering guide', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering', resourceTitle: 'Prompt Engineering Guide', readingFocus: 'Focus on: role-context-task-format structure, system prompt vs human turn separation, and the "be specific" principle' },
  ],
  'eval-testing': [
    { text: 'Read the eval best practices doc', completed: false, resourceUrl: 'https://github.com/anthropics/anthropic-cookbook', resourceTitle: 'Anthropic Cookbook', readingFocus: 'Focus on: the 3 eval types (human/code-based/LLM-as-judge), when to use each, and building a regression suite' },
    { text: 'Build a small regression suite', completed: false, resourceUrl: 'https://github.com/anthropics/anthropic-cookbook', resourceTitle: 'Anthropic Cookbook', readingFocus: 'Focus on: golden-set test cases, automated scoring, and catching regressions after prompt changes' },
    { text: 'Study LLM-as-judge patterns', completed: false, resourceUrl: 'https://github.com/anthropics/anthropic-cookbook', resourceTitle: 'Anthropic Cookbook', readingFocus: 'Focus on: using a separate model to evaluate outputs, avoiding self-evaluation bias, and calibration against human labels' },
  ],
  'agents-workflows': [
    { text: 'Read Building Effective Agents', completed: false, resourceUrl: 'https://www.anthropic.com/research/building-effective-agents', resourceTitle: 'Building Effective Agents', readingFocus: 'Focus on: the 5 agentic patterns (prompt chaining, routing, parallelization, orchestrator-subagents, evaluator-optimizer) and when to use workflows vs fully autonomous agents' },
    { text: 'Implement a prompt chain', completed: false, resourceUrl: 'https://www.anthropic.com/research/building-effective-agents', resourceTitle: 'Building Effective Agents', readingFocus: 'Focus on: how intermediate outputs gate the next step, passing structured results between steps, and where to inject human checkpoints' },
    { text: 'Practice ReAct loop design', completed: false, resourceUrl: 'https://www.anthropic.com/research/building-effective-agents', resourceTitle: 'Building Effective Agents', readingFocus: 'Focus on: the Thought→Action→Observation cycle, using stop_reason tool_use to detect tool calls, and iteration caps to prevent loops' },
  ],
  'tools-mcp': [
    { text: 'Read tool use overview', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use', resourceTitle: 'Tool Use Overview', readingFocus: 'Focus on: tool definition schema (name, description, input_schema), the tool_use → tool_result content block cycle, and parallel tool calls pattern' },
    { text: 'Set up a local MCP server', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/claude-code/mcp', resourceTitle: 'MCP Docs', readingFocus: 'Focus on: stdio transport for local servers, the 3 MCP primitives (tools/resources/prompts), and the .mcp.json project config format' },
    { text: 'Define 3 tools with clear schemas', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use', resourceTitle: 'Tool Use Overview', readingFocus: 'Focus on: writing descriptions detailed enough for the model to self-serve without the developer, marking required vs optional params, and using enum constraints' },
  ],
  'security-safety': [
    { text: 'Study prompt injection defences', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/security', resourceTitle: 'Security Best Practices', readingFocus: 'Focus on: separating user data from instructions with XML tags, validating outputs before acting on them, and never executing tool calls from user-supplied content' },
    { text: 'Review data minimisation practices', completed: false, readingFocus: 'Focus on: collecting only necessary PII, field-level redaction before sending to the API, and vendor data handling policies' },
    { text: 'Implement output validation', completed: false, readingFocus: "Focus on: schema validation before using Claude's output in downstream systems, retry-on-invalid pattern, and safe-string escaping" },
  ],
  'claude-code': [
    { text: 'Install Claude Code and explore settings.json', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/claude-code', resourceTitle: 'Claude Code Docs', readingFocus: 'Focus on: user vs project vs local settings hierarchy, allowedTools glob pattern format, and what each permission level means' },
    { text: 'Create a CLAUDE.md file', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/claude-code', resourceTitle: 'Claude Code Docs', readingFocus: 'Focus on: what belongs in CLAUDE.md (coding standards, commands, conventions), how subagents inherit it, and the @import syntax for splitting large files' },
    { text: 'Configure a hook', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/claude-code', resourceTitle: 'Claude Code Docs', readingFocus: 'Focus on: the 4 hook events (PreToolUse, PostToolUse, Stop, Notification), JSON stdin format hooks receive, and exit code semantics (0=proceed, 2=block with message)' },
  ],
  'agentic-arch': [
    { text: 'Read orchestration patterns', completed: false, resourceUrl: 'https://www.anthropic.com/research/building-effective-agents', resourceTitle: 'Building Effective Agents', readingFocus: 'Focus on: workflows vs agents distinction, when to add autonomy vs keep deterministic control, and the orchestrator-subagent pattern' },
    { text: 'Design a multi-agent pipeline', completed: false, resourceUrl: 'https://www.anthropic.com/engineering/effective-context-engineering', resourceTitle: 'Effective Context Engineering', readingFocus: 'Focus on: orchestrator/subagent role separation, context isolation between subagents, and how the Task tool spawns subagents in Claude Code' },
    { text: 'Implement fan-out parallelism', completed: false, resourceUrl: 'https://github.com/anthropics/claude-agent-sdk-python', resourceTitle: 'Claude Agent SDK', readingFocus: 'Focus on: mapping independent subtasks to parallel agents, aggregating results from multiple subagents, and handling partial failures gracefully' },
  ],
  'claude-code-cfg': [
    { text: 'Study hooks and lifecycle events', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/claude-code', resourceTitle: 'Claude Code Docs', readingFocus: 'Focus on: PreToolUse for blocking dangerous operations, the JSON stdin format (tool_name, tool_input), and exit codes (0=allow, 1=ask, 2=block)' },
    { text: 'Configure allowedTools', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/claude-code', resourceTitle: 'Claude Code Docs', readingFocus: 'Focus on: glob patterns (Bash(git *), Edit(**/*.ts)), deny > allow precedence across settings levels, and using permission_mode: dontAsk for CI' },
    { text: 'Try headless/CI mode', completed: false, resourceUrl: 'https://www.anthropic.com/engineering/claude-code-best-practices', resourceTitle: 'Claude Code Best Practices', readingFocus: 'Focus on: the -p/--print flag for non-interactive use, --output-format stream-json for machine parsing, and setting broad allowedTools in CI settings' },
  ],
  'prompt-structured': [
    { text: 'Practice structured output with tool-use', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/structured-outputs', resourceTitle: 'Structured Outputs', readingFocus: 'Focus on: defining a JSON schema as a tool\'s input_schema, forcing it with tool_choice: {type: "tool", name: "..."}, and extracting from the tool_use content block' },
    { text: 'Study chain-of-thought patterns', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering', resourceTitle: 'Prompt Engineering Guide', readingFocus: 'Focus on: extended thinking config (thinking: {type: "enabled", budget_tokens: N}), when CoT improves accuracy vs adds cost, and the thinking block in responses' },
    { text: 'Try XML output format', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering', resourceTitle: 'Prompt Engineering Guide', readingFocus: 'Focus on: wrapping output in custom XML tags (<result>, <reasoning>), parsing by tag boundary extraction, and why this is more reliable than asking for JSON in plain text' },
  ],
  'tool-design-mcp': [
    { text: 'Design idempotent tools', completed: false, resourceUrl: 'https://www.anthropic.com/engineering/writing-tools-for-agents', resourceTitle: 'Writing Tools for Agents', readingFocus: 'Focus on: idempotency for safe retries, read-before-write patterns, and adding explicit confirmation steps before irreversible/destructive operations' },
    { text: 'Study MCP transport types', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/claude-code/mcp', resourceTitle: 'MCP Docs', readingFocus: 'Focus on: stdio transport (local/same-machine), HTTP+SSE transport (remote/network), when to use each, and security considerations for remote servers' },
    { text: 'Implement resource vs tool distinction', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/claude-code/mcp', resourceTitle: 'MCP Docs', readingFocus: 'Focus on: resources = safe data retrieval (GET-like), tools = actions that can mutate state, and how clients discover/browse resources vs invoke tools' },
  ],
  'context-reliability': [
    { text: 'Study prompt caching setup', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching', resourceTitle: 'Prompt Caching', readingFocus: 'Focus on: placing cache_control: {type: "ephemeral"} on the last static block, the 1,024-token minimum threshold, 5-minute TTL, and reading cache_creation_input_tokens in the response' },
    { text: 'Implement context compaction', completed: false, resourceUrl: 'https://www.anthropic.com/engineering/effective-context-engineering', resourceTitle: 'Effective Context Engineering', readingFocus: 'Focus on: summarizing conversation history when approaching context limits, the PreCompact hook in Claude Code, and preserving critical facts across compaction boundaries' },
    { text: 'Test retry-with-validation', completed: false, resourceUrl: 'https://www.anthropic.com/engineering/effective-context-engineering', resourceTitle: 'Effective Context Engineering', readingFocus: 'Focus on: structured output validation before acting on results, the validate-then-proceed pattern, and exponential backoff for transient API errors' },
  ],
  'solution-design': [
    { text: 'Study RAG architecture patterns', completed: false, resourceUrl: 'https://github.com/anthropics/anthropic-cookbook', resourceTitle: 'Anthropic Cookbook', readingFocus: 'Focus on: embed → search → augment → generate pipeline, chunking strategies (fixed/semantic), and hybrid search (semantic + BM25 keyword)' },
    { text: 'Design a fallback layer', completed: false, resourceUrl: 'https://www.anthropic.com/research/building-effective-agents', resourceTitle: 'Building Effective Agents', readingFocus: 'Focus on: graceful degradation when tools fail, fallback model routing (Opus→Sonnet), and circuit breaker patterns for external dependencies' },
    { text: 'Review latency optimisation', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching', resourceTitle: 'Prompt Caching', readingFocus: 'Focus on: prompt caching to cut repeat-call latency, streaming for perceived responsiveness, and Haiku routing for latency-critical paths' },
  ],
  'models-prompting': [
    { text: 'Map Academy courses to blueprint domains', completed: false, resourceUrl: 'https://anthropic-partners.skilljar.com/page/partner-certifications', resourceTitle: 'Anthropic Partner Academy', readingFocus: 'Focus on: which Academy courses map to which CCAR-P exam domains, and the recommended study sequence' },
    { text: 'Practice model routing logic', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/about-claude/models/overview', resourceTitle: 'Models Overview', readingFocus: 'Focus on: routing by task complexity and cost guardrails, latency vs accuracy tradeoffs, and when to upgrade vs downgrade model tier' },
    { text: 'Test large context patterns', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching', resourceTitle: 'Prompt Caching', readingFocus: 'Focus on: avoiding the lost-in-the-middle effect, placing key instructions at the start and end, and caching large static context blocks' },
  ],
  'eval-optimization': [
    { text: 'Build a canary rollout process', completed: false, resourceUrl: 'https://github.com/anthropics/anthropic-cookbook', resourceTitle: 'Anthropic Cookbook', readingFocus: 'Focus on: A/B routing between prompt versions, parallel metrics collection, and rollout decision thresholds' },
    { text: 'Create fairness eval cases', completed: false, resourceUrl: 'https://github.com/anthropics/anthropic-cookbook', resourceTitle: 'Anthropic Cookbook', readingFocus: 'Focus on: testing outputs across demographic groups, representation in generated content, and documenting known model limitations' },
    { text: 'Study continuous monitoring', completed: false, readingFocus: "Focus on: production eval pipelines, alerting on output distribution shifts, and maintaining a golden eval set that doesn't drift" },
  ],
  'governance-safety': [
    { text: 'Read AI governance frameworks', completed: false, resourceUrl: 'https://www.anthropic.com/certification', resourceTitle: 'Anthropic Certification', readingFocus: "Focus on: Anthropic's responsible scaling policy, Acceptable Use Policy prohibited categories, and enterprise audit log requirements" },
    { text: 'Design an audit log schema', completed: false, readingFocus: 'Focus on: what to log (inputs, outputs, model version, timestamps, user IDs), retention policies, and PII redaction in logs' },
    { text: 'Review responsible AI guidelines', completed: false, resourceUrl: 'https://www.anthropic.com/certification', resourceTitle: 'Anthropic Certification', readingFocus: 'Focus on: Anthropic AUP key restrictions, the human-in-the-loop requirement for high-stakes decisions, and incident response obligations' },
  ],
  'stakeholder-lifecycle': [
    { text: 'Practice explaining probabilistic AI', completed: false, resourceUrl: 'https://claude.com/blog/four-role-based-claude-certifications', resourceTitle: 'Claude Certifications Blog', readingFocus: 'Focus on: communicating uncertainty and hallucination risk to non-technical audiences, setting appropriate expectations, and framing AI as a tool not an oracle' },
    { text: 'Document a deployment runbook', completed: false, readingFocus: 'Focus on: incident response steps, rollback procedures, monitoring metrics (error rate, latency p99, refusal rate), and escalation paths' },
    { text: 'Create a stakeholder FAQ', completed: false, readingFocus: 'Focus on: common non-technical questions (data privacy, accuracy, bias), what Claude cannot do, and cost/usage expectations' },
  ],
  'dev-productivity': [
    { text: 'Standardise CLAUDE.md across a monorepo', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/claude-code', resourceTitle: 'Claude Code Docs', readingFocus: 'Focus on: root CLAUDE.md for cross-cutting standards, package-level overrides with @import, keeping each file concise and actionable' },
    { text: 'Set up CI with Claude Code headless', completed: false, resourceUrl: 'https://www.anthropic.com/engineering/claude-code-best-practices', resourceTitle: 'Claude Code Best Practices', readingFocus: 'Focus on: -p flag for non-interactive mode, --output-format stream-json for CI parsers, setting broad allowedTools, and handling non-zero exit codes' },
    { text: 'Review developer workflow guide', completed: false, resourceUrl: 'https://www.anthropic.com/engineering/claude-code-best-practices', resourceTitle: 'Claude Code Best Practices', readingFocus: 'Focus on: recommended CLAUDE.md structure, hook best practices for team workflows, and pre-commit integration for code quality checks' },
  ],
  'output-eval': [
    { text: 'Review output evaluation frameworks', completed: false, resourceUrl: 'https://www.anthropic.com/certification', resourceTitle: 'Anthropic Certification Guide', readingFocus: 'Focus on: the criteria for judging factual accuracy, completeness, and tone; red-flag patterns that indicate hallucination; and human review workflow design' },
    { text: 'Practice spotting hallucinations', completed: false, readingFocus: 'Focus on: specific/verifiable claims that cannot be confirmed, overly confident language on uncertain facts, and the "cite your source" verification technique' },
    { text: 'Study factual grounding techniques', completed: false, readingFocus: 'Focus on: RAG for factual grounding, asking Claude to express uncertainty, and always validating numeric/date claims' },
  ],
  'workflow-design': [
    { text: 'Map 3 business workflows to Claude prompts', completed: false, readingFocus: 'Focus on: identifying the input/output for each step, where human review is needed, and how to chain prompts for multi-step workflows' },
    { text: 'Design a review-then-approve automation', completed: false, readingFocus: 'Focus on: Claude as a drafter + human as approver, structured output for easy review, and audit trail requirements' },
    { text: 'Study integration patterns for non-coders', completed: false, resourceUrl: 'https://www.anthropic.com/certification', resourceTitle: 'Anthropic Certification Guide', readingFocus: 'Focus on: no-code integration options (Claude.ai projects, Zapier), prompt template design for consistent results, and governance controls for business users' },
  ],
  'governance-risk': [
    { text: 'Read Anthropic responsible use policies', completed: false, resourceUrl: 'https://www.anthropic.com/certification', resourceTitle: 'Anthropic Certification Guide', readingFocus: 'Focus on: AUP prohibited use categories, data privacy requirements, and what constitutes misuse that requires incident reporting' },
    { text: 'Identify 5 AI risk scenarios', completed: false, readingFocus: 'Focus on: hallucination in high-stakes decisions, bias in automated screening, privacy leakage, over-reliance, and scope creep beyond intended use' },
    { text: 'Draft a usage policy template', completed: false, readingFocus: 'Focus on: approved use cases, prohibited uses, human review requirements, data handling rules, and incident reporting process' },
  ],
  'prompting-tasks': [
    { text: 'Study role-based prompting', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering', resourceTitle: 'Prompt Engineering Guide', readingFocus: 'Focus on: assigning Claude a specific expert role in the system prompt, how role affects tone and expertise level, and avoiding overly fictional persona constraints' },
    { text: 'Practice iterative prompt refinement', completed: false, readingFocus: 'Focus on: test-edit-retest loop, changing one variable at a time, and documenting what worked and why for your prompt library' },
    { text: 'Review prompt templating best practices', completed: false, readingFocus: 'Focus on: using {{variables}} for reusable templates, separating static from dynamic content, and version-controlling your prompt templates' },
  ],
  'product-model': [
    { text: 'Compare Claude product tiers', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/about-claude/models/overview', resourceTitle: 'Models Overview', readingFocus: 'Focus on: Claude.ai (consumer), API (developer), and Enterprise tiers — their features, limits, and data handling differences' },
    { text: 'Learn when to use Claude.ai vs API', completed: false, readingFocus: 'Focus on: Claude.ai for individual knowledge work, API for automated/integrated workflows, and Enterprise for org-wide deployment with SSO/audit logs' },
    { text: 'Study model capability differences', completed: false, readingFocus: 'Focus on: context window sizes, vision support, extended thinking availability, and which features are gated by model tier' },
  ],
  'config-knowledge': [
    { text: 'Set up a custom Claude project', completed: false, readingFocus: 'Focus on: project-level system prompt, knowledge documents, and how context persists across conversations in a project' },
    { text: 'Configure knowledge base documents', completed: false, readingFocus: 'Focus on: what file types Claude can read, size limits, and how knowledge documents interact with the conversation system prompt' },
    { text: 'Review memory and context settings', completed: false, readingFocus: 'Focus on: project memory vs conversation memory, how to structure persistent context for reliability, and privacy implications of saved context' },
  ],
  'troubleshoot-opt': [
    { text: 'Study common prompt failure patterns', completed: false, readingFocus: 'Focus on: instruction-following failures (ambiguous task), format failures (wrong structure), and refusals (over-cautious) — and how to fix each' },
    { text: 'Practice debugging unexpected outputs', completed: false, readingFocus: "Focus on: isolating variables (temperature, prompt wording, examples), comparing outputs across model tiers, and using Claude to explain its own reasoning" },
    { text: 'Review optimisation techniques', completed: false, readingFocus: 'Focus on: prompt compression (removing redundant context), caching static prompts, and moving simple tasks to Haiku' },
  ],
  'integration': [
    { text: 'Read the Agent SDK overview', completed: false, resourceUrl: 'https://platform.claude.com/docs/en/agent-sdk/overview', resourceTitle: 'Agent SDK Overview', readingFocus: 'Focus on: the managed tool loop, how the SDK handles tool_use/tool_result cycles, and the orchestrator/subagent architecture patterns' },
    { text: 'Study API integration patterns', completed: false, resourceUrl: 'https://docs.anthropic.com/en/api/messages', resourceTitle: 'Messages API Reference', readingFocus: 'Focus on: rate limit handling, error code taxonomy (529/429/413), retry-with-backoff patterns, and streaming vs batch trade-offs' },
    { text: 'Review MCP integration approaches', completed: false, resourceUrl: 'https://docs.anthropic.com/en/docs/claude-code/mcp', resourceTitle: 'MCP Docs', readingFocus: 'Focus on: connecting existing REST APIs as MCP tools, the env var expansion pattern in .mcp.json, and security boundary between MCP server and client' },
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
    if (hoursPerDay >= 2) dayTasks.push({ text: 'Take a 10-question practice set on this domain', completed: false, practiceConfig: { domain: domain.id, count: 10 } });
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
                        {task.practiceConfig && (
                          <button
                            onClick={() => navigate('/practice', {
                              state: {
                                domainDrill: true,
                                certId: studyPlan.certId,
                                domain: task.practiceConfig!.domain,
                                count: task.practiceConfig!.count,
                              },
                            })}
                            title={`Practice ${task.practiceConfig.count} questions on this domain`}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--warn)', flexShrink: 0, display: 'flex', alignItems: 'center', marginTop: 2, opacity: 0.85 }}
                          >
                            <FlaskConical size={12} />
                          </button>
                        )}
                        {task.resourceUrl && (
                          <button
                            onClick={() => navigate('/resources', {
                              state: {
                                fromPlan: true,
                                date: day.date,
                                taskIdx: i,
                                resourceUrl: task.resourceUrl,
                                resourceTitle: task.resourceTitle,
                                readingFocus: task.readingFocus,
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
