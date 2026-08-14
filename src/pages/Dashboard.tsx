import { useAppStore } from '../store/useAppStore';
import { certifications } from '../data/certifications';
import { averageScore, formatDuration } from '../utils/scoring';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { LayoutDashboard, Flame, Trophy, Clock } from 'lucide-react';

export function Dashboard() {
  const { attempts, streak, clearHistory } = useAppStore();

  if (attempts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--txt)', marginBottom: '0.5rem' }}>Dashboard</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Your progress, score trends, and domain heatmaps appear here after your first attempt.</p>
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <LayoutDashboard size={36} style={{ color: 'var(--border)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No attempts yet. Take a mock exam to start tracking your progress.</p>
        </div>
      </div>
    );
  }

  const byDate = [...attempts]
    .reverse()
    .map((a, i) => ({ name: `#${i + 1}`, score: a.score, cert: a.certId.toUpperCase() }));

  const byCert = certifications.map(c => {
    const certAttempts = attempts.filter(a => a.certId === c.id);
    return {
      name: c.shortName,
      avg: averageScore(certAttempts),
      best: certAttempts.length ? Math.max(...certAttempts.map(a => a.score)) : 0,
      count: certAttempts.length,
    };
  }).filter(r => r.count > 0);

  const totalTime = attempts.reduce((s, a) => s + a.duration, 0);
  const passCount = attempts.filter(a => a.passed).length;

  const domainData: Record<string, { correct: number; total: number }> = {};
  for (const a of attempts) {
    for (const [d, s] of Object.entries(a.domainScores)) {
      if (!domainData[d]) domainData[d] = { correct: 0, total: 0 };
      domainData[d].correct += s.correct;
      domainData[d].total += s.total;
    }
  }

  const domainChart = Object.entries(domainData)
    .map(([d, { correct, total }]) => ({ name: d, pct: total ? Math.round((correct / total) * 100) : 0 }))
    .sort((a, b) => a.pct - b.pct);

  const tooltipStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '0.5rem',
    color: 'var(--txt)',
    fontSize: '0.78rem',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--txt)', marginBottom: '0.25rem' }}>Dashboard</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Your progress across all certification tracks.</p>
        </div>
        <button onClick={clearHistory} className="btn-ghost" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
          Clear history
        </button>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
        <KPI icon={<Trophy size={16} />} label="Total Attempts" value={attempts.length} />
        <KPI icon={<Trophy size={16} style={{ color: 'var(--success)' }} />} label="Passed" value={`${passCount}/${attempts.length}`} />
        <KPI icon={<Flame size={16} style={{ color: 'var(--warn)' }} />} label="Study Streak" value={`${streak} day${streak !== 1 ? 's' : ''}`} />
        <KPI icon={<Clock size={16} />} label="Time Studied" value={formatDuration(totalTime)} />
      </div>

      {/* Score trend */}
      {byDate.length > 1 && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--txt)', marginBottom: '1rem' }}>Score Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={byDate} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 1000]} tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* By cert */}
      {byCert.length > 0 && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--txt)', marginBottom: '1rem' }}>Average Score by Track</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byCert} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 1000]} tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}/1000`, 'Avg Score']} />
              <Bar dataKey="avg" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Domain heatmap */}
      {domainChart.length > 0 && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--txt)', marginBottom: '1rem' }}>Domain Accuracy (all attempts)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {domainChart.map(({ name, pct }) => {
              const certDomain = certifications.flatMap(c => c.domains).find(d => d.id === name);
              const color = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warn)' : 'var(--danger)';
              return (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--muted)' }}>{certDomain?.name ?? name}</span>
                    <span style={{ color, fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.4s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent attempts table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--txt)', marginBottom: '1rem' }}>Recent Attempts</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Track', 'Mode', 'Score', 'Result', 'Date'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attempts.slice(0, 15).map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.5rem 0.75rem', color: 'var(--txt)' }}>{a.certId.toUpperCase()}</td>
                  <td style={{ padding: '0.5rem 0.75rem', color: 'var(--muted)' }}>{a.mode}</td>
                  <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--txt)' }}>{a.score}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>
                    <span className={`badge ${a.passed ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                      {a.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', color: 'var(--muted)' }}>
                    {new Date(a.completedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPI({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="card" style={{ padding: '1rem 1.1rem' }}>
      <div style={{ color: 'var(--accent-lt)', marginBottom: '0.4rem' }}>{icon}</div>
      <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--txt)', letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{label}</div>
    </div>
  );
}
