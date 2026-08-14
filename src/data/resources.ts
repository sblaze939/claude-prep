export interface Resource {
  title: string;
  url: string;
  description: string;
  type: 'official' | 'docs' | 'course' | 'third-party' | 'blog';
  certs?: string[];
  free: boolean;
}

export interface ResourceSection {
  heading: string;
  items: Resource[];
}

export const resourceSections: ResourceSection[] = [
  {
    heading: 'Registration & Exam Guides',
    items: [
      {
        title: 'Official Claude Certification Exam Guides',
        url: 'https://www.anthropic.com/certification',
        description: 'Blueprint PDFs for all three exams — treat these as your syllabus.',
        type: 'official',
        free: true,
      },
      {
        title: 'Pearson VUE — Anthropic Scheduling',
        url: 'https://www.pearsonvue.com/us/en/anthropic.html',
        description: 'Book your exam slot. Register through Claude Partner Network first.',
        type: 'official',
        free: false,
      },
      {
        title: 'Anthropic Partner Academy',
        url: 'https://anthropic-partners.skilljar.com/page/partner-certifications',
        description: 'Official registration portal. Requires a company account enrolled in the Partner Network.',
        type: 'official',
        free: false,
      },
      {
        title: 'Anthropic Blog — Four Role-Based Certifications',
        url: 'https://claude.com/blog/four-role-based-claude-certifications',
        description: 'Official announcement explaining the certification tracks and their purpose.',
        type: 'blog',
        free: true,
      },
    ],
  },
  {
    heading: 'Official Anthropic Docs',
    items: [
      {
        title: 'Anthropic Docs — Home',
        url: 'https://docs.anthropic.com/',
        description: 'Main documentation hub. Start here for API reference, guides, and concepts.',
        type: 'docs',
        free: true,
      },
      {
        title: 'Messages API Reference',
        url: 'https://docs.anthropic.com/en/api/messages',
        description: 'Full reference for the core API endpoint — critical for CCDV-F.',
        type: 'docs',
        certs: ['ccdvf'],
        free: true,
      },
      {
        title: 'Prompt Caching',
        url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching',
        description: 'How to use prompt caching to cut cost and latency — appears on all three exams.',
        type: 'docs',
        free: true,
      },
      {
        title: 'Claude Code Docs',
        url: 'https://docs.anthropic.com/en/docs/claude-code',
        description: 'Settings, permissions, MCP, sub-agents, hooks — critical for CCAR-F.',
        type: 'docs',
        certs: ['ccarf', 'ccarp'],
        free: true,
      },
      {
        title: 'Tool Use Overview',
        url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use',
        description: 'How to define and use tools — core to CCDV-F and CCAR-F.',
        type: 'docs',
        certs: ['ccdvf', 'ccarf'],
        free: true,
      },
      {
        title: 'Model Context Protocol (MCP)',
        url: 'https://docs.anthropic.com/en/docs/claude-code/mcp',
        description: 'MCP server setup, transport types, configuration — heavily tested on CCAR-F.',
        type: 'docs',
        certs: ['ccarf', 'ccarp'],
        free: true,
      },
      {
        title: 'Structured Outputs',
        url: 'https://docs.anthropic.com/en/docs/build-with-claude/structured-outputs',
        description: 'JSON mode and constrained generation techniques.',
        type: 'docs',
        free: true,
      },
      {
        title: 'Prompt Engineering Overview',
        url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering',
        description: 'Official prompt engineering guide — chain-of-thought, role prompts, XML structuring.',
        type: 'docs',
        free: true,
      },
    ],
  },
  {
    heading: 'Anthropic Engineering Posts',
    items: [
      {
        title: 'Building Effective Agents',
        url: 'https://www.anthropic.com/research/building-effective-agents',
        description: 'The canonical guide to agentic patterns — workflows vs. agents, orchestration, tool design.',
        type: 'blog',
        certs: ['ccarf', 'ccarp'],
        free: true,
      },
      {
        title: 'Effective Context Engineering for AI Agents',
        url: 'https://www.anthropic.com/engineering/effective-context-engineering',
        description: 'Deep dive on context window management and reliability in production agents.',
        type: 'blog',
        certs: ['ccarf', 'ccarp'],
        free: true,
      },
      {
        title: 'Claude Code Best Practices',
        url: 'https://www.anthropic.com/engineering/claude-code-best-practices',
        description: 'Official best practices for Claude Code in CI/CD, workflows, and developer contexts.',
        type: 'blog',
        certs: ['ccarf'],
        free: true,
      },
      {
        title: 'Writing Tools for Agents',
        url: 'https://www.anthropic.com/engineering/writing-tools-for-agents',
        description: 'How to design tools that agents can actually use reliably.',
        type: 'blog',
        certs: ['ccdvf', 'ccarf'],
        free: true,
      },
    ],
  },
  {
    heading: 'Anthropic Academy (Free Courses)',
    items: [
      {
        title: 'Claude 101',
        url: 'https://anthropic-partners.skilljar.com/',
        description: 'Foundation course — Claude capabilities, safety, and basic usage.',
        type: 'course',
        free: true,
      },
      {
        title: 'Claude with the Anthropic API',
        url: 'https://anthropic-partners.skilljar.com/',
        description: 'Hands-on API course — Messages API, tool use, streaming, error handling.',
        type: 'course',
        certs: ['ccdvf'],
        free: true,
      },
      {
        title: 'Introduction to Model Context Protocol',
        url: 'https://anthropic-partners.skilljar.com/',
        description: 'MCP fundamentals — server setup, resources, prompts, tools.',
        type: 'course',
        certs: ['ccarf'],
        free: true,
      },
      {
        title: 'MCP Advanced Topics',
        url: 'https://anthropic-partners.skilljar.com/',
        description: 'Sampling, roots, transports, and security considerations.',
        type: 'course',
        certs: ['ccarf', 'ccarp'],
        free: true,
      },
      {
        title: 'Claude Code 101',
        url: 'https://anthropic-partners.skilljar.com/',
        description: 'Claude Code setup, core commands, configuration.',
        type: 'course',
        certs: ['ccarf'],
        free: true,
      },
      {
        title: 'Claude Code in Action',
        url: 'https://anthropic-partners.skilljar.com/',
        description: 'Advanced Claude Code — hooks, permissions, CI/CD integration.',
        type: 'course',
        certs: ['ccarf'],
        free: true,
      },
      {
        title: 'Introduction to Subagents',
        url: 'https://anthropic-partners.skilljar.com/',
        description: 'Multi-agent patterns, orchestration, and subagent design.',
        type: 'course',
        certs: ['ccarf', 'ccarp'],
        free: true,
      },
      {
        title: 'AI Fluency Framework Foundations',
        url: 'https://anthropic-partners.skilljar.com/',
        description: 'Governance, responsible AI, and stakeholder communication — key for CCAR-P.',
        type: 'course',
        certs: ['ccarp'],
        free: true,
      },
    ],
  },
  {
    heading: 'Third-Party Study Resources',
    items: [
      {
        title: 'claudecertificationguide.com',
        url: 'https://www.claudecertificationguide.com',
        description: 'Free CCAR-F mock exam and study guide from the community.',
        type: 'third-party',
        certs: ['ccarf'],
        free: true,
      },
      {
        title: 'Tutorials Dojo — CCAR-P Practice Exams',
        url: 'https://tutorialsdojo.com',
        description: 'Practice exams with scenario-based questions for the Professional track.',
        type: 'third-party',
        certs: ['ccarp'],
        free: false,
      },
      {
        title: 'Tutorials Dojo — CCDV-F Practice Exams',
        url: 'https://tutorialsdojo.com',
        description: 'Practice questions covering the Developer Foundations domains.',
        type: 'third-party',
        certs: ['ccdvf'],
        free: false,
      },
      {
        title: 'Preporato — CCAR-P Complete Guide',
        url: 'https://preporato.com',
        description: 'Comprehensive study guide and practice tests for the Professional exam.',
        type: 'third-party',
        certs: ['ccarp'],
        free: false,
      },
    ],
  },
];
