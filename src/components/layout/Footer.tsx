export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '1.5rem 1rem', marginTop: 'auto' }}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>
          Claude Cert Hub — Independent study resource. Not affiliated with Anthropic.
        </p>
        <p style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>
          Content based on public exam guides (v1.0, July 2026). Verify official guides before booking.
        </p>
      </div>
    </footer>
  );
}
