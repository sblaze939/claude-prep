export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '1.5rem 2rem', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>
            Claude Cert Hub — Independent study resource. Not affiliated with Anthropic.
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>
            Built by a software engineer specialising in agentic AI & frontend · CCAR-F · GCP Professional · Meta Professional
          </p>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.73rem', opacity: 0.7 }}>
          Content based on public exam guides (v1.0, July 2026). Always verify the official guide before booking.
        </p>
        <p style={{ color: 'var(--muted)', fontSize: '0.73rem', opacity: 0.7 }}>
          Inspired by{' '}
          <a href="https://claude-certification-prep.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted)', textDecoration: 'underline' }}>
            Saif Mujawar's original prep site
          </a>{' '}
          — the idea that started it all.
        </p>
      </div>
    </footer>
  );
}
