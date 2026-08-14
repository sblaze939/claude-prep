import { Link } from 'react-router-dom';
import { FlaskConical, Zap, BookOpen, Library, CalendarDays, LayoutDashboard, ArrowRight, CheckCircle, Stethoscope, BookMarked } from 'lucide-react';
import { certifications } from '../data/certifications';
import { useAppStore } from '../store/useAppStore';

const features = [
  { icon: FlaskConical, title: 'Mock Exams', desc: 'Timed practice with instant per-question feedback and domain score breakdown. Full or condensed mode.', to: '/exams' },
  { icon: Zap, title: 'Exam Simulator', desc: 'Strict mode — answers locked until the end. No feedback mid-exam. Real conditions.', to: '/simulator' },
  { icon: Stethoscope, title: 'Diagnostic Test', desc: 'Short 2-per-domain quiz that pinpoints your weakest area before you study.', to: '/diagnostic' },
  { icon: BookOpen, title: 'Spaced Repetition', desc: 'SM-2 algorithm resurfaces questions you got wrong at optimised intervals.', to: '/practice' },
  { icon: LayoutDashboard, title: 'Progress Dashboard', desc: 'Score trends, domain heatmaps, confidence meters, and streak tracking across all attempts.', to: '/dashboard' },
  { icon: Library, title: 'Resources', desc: 'Official docs, Anthropic Academy courses, Skilljar links, and third-party guides — all curated.', to: '/resources' },
  { icon: BookMarked, title: 'Glossary', desc: '40+ key terms across all certification domains — searchable and categorised.', to: '/glossary' },
  { icon: CalendarDays, title: 'Study Plan', desc: 'Enter your exam date and hours per day — get a personalised day-by-day schedule.', to: '/plan' },
];

const levelColor: Record<string, string> = {
  associate: 'badge-success',
  foundations: 'badge-accent',
  professional: 'badge-warn',
};

const levelLabel: Record<string, string> = {
  associate: 'Associate',
  foundations: 'Foundations',
  professional: 'Professional',
};

export function Home() {
  const { attempts } = useAppStore();
  const totalAttempts = attempts.length;
  const certsCovered = [...new Set(attempts.map(a => a.certId))].length;
  const bestScore = attempts.length ? Math.max(...attempts.map(a => a.score)) : 0;

  return (
    <div className="page">
      {/* Hero */}
      <div style={{ marginBottom: '3.5rem', maxWidth: '680px' }}>
        <div className="badge badge-muted" style={{ marginBottom: '1.25rem' }}>Independent Study Resource</div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 2.75rem)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          color: 'var(--txt)',
          marginBottom: '1rem',
        }}>
          Pass your Claude certification.<br />
          <span style={{ color: 'var(--accent)' }}>All four tracks, one hub.</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
          Mock exams, spaced repetition, an exam simulator, and official study resources — everything you need for CCAO-F, CCDV-F, CCAR-F, and CCAR-P.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/exams" className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.65rem 1.5rem' }}>
            Start a mock exam <ArrowRight size={15} />
          </Link>
          <Link to="/plan" className="btn-ghost" style={{ fontSize: '0.9rem', padding: '0.65rem 1.5rem' }}>
            Build my study plan
          </Link>
        </div>
      </div>

      {/* Stats strip */}
      {totalAttempts > 0 && (
        <div className="card" style={{ display: 'flex', gap: '2.5rem', padding: '1.25rem 1.75rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <Stat label="Attempts" value={totalAttempts} />
          <Stat label="Certs Practised" value={certsCovered} />
          <Stat label="Best Score" value={bestScore} suffix="/1000" />
        </div>
      )}

      {/* Cert cards */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          Certification Tracks
        </h2>
        {/* Row 1: first 3 certs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {certifications.slice(0, 3).map(cert => (
            <CertCard key={cert.id} cert={cert} levelColor={levelColor} levelLabel={levelLabel} />
          ))}
        </div>
        {/* Row 2: 4th cert centred */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 'calc((100% - 2rem) / 3)' }}>
            {certifications[3] && <CertCard cert={certifications[3]} levelColor={levelColor} levelLabel={levelLabel} />}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          What's inside
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {features.map(({ icon: Icon, title, desc, to }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div
                className="card"
                style={{ padding: '1.25rem', height: '100%', cursor: 'pointer', transition: 'border-color 0.15s, transform 0.1s' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '0.5rem',
                  background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '0.85rem',
                }}>
                  <Icon size={18} style={{ color: 'var(--accent)' }} />
                </div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--txt)', marginBottom: '0.4rem' }}>{title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.65 }}>{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About the Author */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          About the Author
        </h2>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>SJ</span>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--txt)' }}>Software Engineer</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--muted)', background: 'var(--surface2)', padding: '0.15rem 0.45rem', borderRadius: '0.25rem' }}>5 years exp.</span>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.83rem', lineHeight: 1.7, marginBottom: '0.85rem' }}>
              Specialising in agentic AI systems, frontend engineering, and professional-grade enterprise solutions. Built this hub while studying for Claude certifications — to fill the gap in quality, free prep resources.
            </p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { label: 'CCAR-F', title: 'Claude Certified Architect — Foundations' },
                { label: 'GCP Professional', title: 'Google Cloud Professional Certified' },
                { label: 'Meta Professional', title: 'Meta Professional Certified' },
              ].map(c => (
                <span
                  key={c.label}
                  title={c.title}
                  style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent-lt)', background: 'color-mix(in srgb, var(--accent) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)', padding: '0.2rem 0.55rem', borderRadius: '0.35rem', cursor: 'default' }}
                >
                  {c.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <p style={{ color: 'var(--muted)', fontSize: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <CheckCircle size={12} />
        Exam facts based on public exam guides (v1.0, July 2026). Always verify the official guide before booking.
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

import type { Certification } from '../types';

function CertCard({ cert, levelColor, levelLabel }: { cert: Certification; levelColor: Record<string, string>; levelLabel: Record<string, string> }) {
  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className={`badge ${levelColor[cert.level] ?? 'badge-muted'}`}>{levelLabel[cert.level] ?? cert.level}</span>
        <span style={{ color: 'var(--muted)', fontSize: '0.82rem', fontWeight: 600 }}>${cert.price}</span>
      </div>
      <div>
        <h3 style={{ fontSize: '0.975rem', fontWeight: 600, color: 'var(--txt)', marginBottom: '0.4rem', lineHeight: 1.35 }}>
          {cert.name}{' '}
          <span style={{ color: 'var(--muted)', fontWeight: 500 }}>({cert.shortName})</span>
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.65 }}>{cert.description}</p>
      </div>
      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
        <span>{cert.questions} questions</span>
        <span>·</span>
        <span>{cert.duration} min</span>
        <span>·</span>
        <span>{cert.passingScore}/1000 to pass</span>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {cert.domains.map(d => (
          <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--muted)' }}>{d.name}</span>
            <span style={{ color: 'var(--accent)', fontWeight: 600, minWidth: '2.5rem', textAlign: 'right' }}>{d.weight}%</span>
          </div>
        ))}
      </div>
      <Link
        to={`/exams?cert=${cert.id}`}
        className="btn-ghost"
        style={{ marginTop: 'auto', width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '0.55rem 1rem' }}
      >
        Practice {cert.shortName}
      </Link>
    </div>
  );
}
