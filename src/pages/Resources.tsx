import { useState } from 'react';
import { ExternalLink, Filter } from 'lucide-react';
import { resourceSections } from '../data/resources';
import { certifications } from '../data/certifications';

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

export function Resources() {
  const [certFilter, setCertFilter] = useState<string>('all');

  const filtered = resourceSections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      certFilter === 'all' || !item.certs || item.certs.includes(certFilter),
    ),
  })).filter(s => s.items.length > 0);

  return (
    <div className="page">
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
              {section.items.map(item => (
                <a
                  key={item.url + item.title}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    className="card"
                    style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', transition: 'border-color 0.15s', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
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
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
