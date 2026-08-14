import { Link } from 'react-router-dom';
import { FlaskConical, Zap, BookOpen, Library, CalendarDays, LayoutDashboard, ArrowRight, CheckCircle } from 'lucide-react';
import { certifications } from '../data/certifications';
import { useAppStore } from '../store/useAppStore';

const features = [
  { icon: FlaskConical, title: 'Mock Exams', desc: 'Timed practice with instant feedback and domain-by-domain scoring. Covers all three tracks.', to: '/exams' },
  { icon: Zap, title: 'Exam Simulator', desc: 'Strict mode — answers locked until end, no mid-exam feedback. Mirrors real exam conditions.', to: '/simulator' },
  { icon: BookOpen, title: 'Spaced Repetition', desc: 'Review questions you got wrong at scientifically optimised intervals to lock in retention.', to: '/practice' },
  { icon: LayoutDashboard, title: 'Progress Dashboard', desc: 'Score trends, domain heatmaps, and streak tracking across all your attempts.', to: '/dashboard' },
  { icon: Library, title: 'Resources', desc: 'Official docs, Anthropic Academy courses, and third-party guides — curated and linked.', to: '/resources' },
  { icon: CalendarDays, title: 'Study Plan', desc: 'Enter your exam date and hours per day — get a personalised day-by-day prep plan.', to: '/plan' },
];

const levelColor: Record<string, string> = {
  foundations: 'badge-accent',
  professional: 'badge-warn',
};

export function Home() {
  const { attempts } = useAppStore();

  const totalAttempts = attempts.length;
  const certsCovered = [...new Set(attempts.map(a => a.certId))].length;
  const bestScore = attempts.length ? Math.max(...attempts.map(a => a.score)) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div style={{ marginBottom: '3rem', maxWidth: '640px' }}>
        <div className="badge badge-muted" style={{ marginBottom: '1rem' }}>Independent Study Resource</div>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15, color: 'var(--txt)', marginBottom: '1rem' }}>
          Pass your Claude certification.<br />
          <span style={{ color: 'var(--accent-lt)' }}>All three tracks, one hub.</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.65, marginBottom: '1.75rem' }}>
          Mock exams, spaced repetition, an exam simulator, and official study resources — everything you need to prepare for CCDV-F, CCAR-F, and CCAR-P.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/exams" className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
            Start a mock exam <ArrowRight size={15} />
          </Link>
          <Link to="/plan" className="btn-ghost" style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
            Build my study plan
          </Link>
        </div>
      </div>

      {/* Stats strip */}
      {totalAttempts > 0 && (
        <div className="card" style={{ display: 'flex', gap: '2rem', padding: '1.25rem 1.75rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <Stat label="Attempts" value={totalAttempts} />
          <Stat label="Certs Practised" value={certsCovered} />
          <Stat label="Best Score" value={bestScore} suffix="/1000" />
        </div>
      )}

      {/* Cert cards */}
      <section style={{ marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--txt)', marginBottom: '1.25rem' }}>Certification Tracks</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {certifications.map(cert => (
            <div key={cert.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className={`badge ${levelColor[cert.level]}`}>{cert.shortName}</span>
                <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>${cert.price}</span>
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--txt)', marginBottom: '0.4rem' }}>{cert.name}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '1rem' }}>{cert.description}</p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                <span>{cert.questions} questions</span>
                <span>{cert.duration} min</span>
                <span>{cert.passingScore}/1000 to pass</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {cert.domains.map(d => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.77rem' }}>
                    <span style={{ color: 'var(--muted)' }}>{d.name}</span>
                    <span style={{ color: 'var(--accent-lt)', fontWeight: 600 }}>{d.weight}%</span>
                  </div>
                ))}
              </div>
              <Link to={`/exams?cert=${cert.id}`} className="btn-ghost" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}>
                Practice {cert.shortName}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--txt)', marginBottom: '1.25rem' }}>What's inside</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {features.map(({ icon: Icon, title, desc, to }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '1.25rem', height: '100%', transition: 'border-color 0.15s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ width: 36, height: 36, borderRadius: '0.5rem', background: 'color-mix(in srgb, var(--accent) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <Icon size={18} style={{ color: 'var(--accent-lt)' }} />
                </div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--txt)', marginBottom: '0.4rem' }}>{title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <p style={{ marginTop: '3rem', color: 'var(--muted)', fontSize: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
        <CheckCircle size={12} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
        Exam facts based on public exam guides (v1.0, July 2026). Always verify the official guide before booking — details can change.
      </p>
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--txt)', letterSpacing: '-0.02em' }}>
        {value}{suffix ?? ''}
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{label}</div>
    </div>
  );
}
