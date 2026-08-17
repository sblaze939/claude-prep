import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { certifications } from '../data/certifications';
import { averageScore, formatDuration } from '../utils/scoring';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { LayoutDashboard, Flame, Trophy, Clock, RotateCcw, Trash2, Target } from 'lucide-react';
import { ConfidenceMeter } from '../components/ui/ConfidenceMeter';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { toast } from '../components/ui/Toast';
import type { CertId, ExamAttempt, StudyPlan } from '../types';

function computeReadiness(
  certId: CertId,
  attempts: ExamAttempt[],
  studyPlan: StudyPlan | null,
  lastStudyDate: string | null,
): number {
  const certAttempts = attempts.filter(a => a.certId === certId);
  const mockScore = certAttempts.length
    ? (certAttempts.reduce((s, a) => s + a.score, 0) / certAttempts.length) / 10
    : 0;
  const planScore =
    studyPlan?.certId === certId && studyPlan.days.length > 0
      ? (studyPlan.days.filter(d => d.completed).length / studyPlan.days.length) * 100
      : 0;
  const daysSince = lastStudyDate
    ? Math.max(0, (Date.now() - new Date(lastStudyDate).getTime()) / 86400000)
    : 14;
  const recency = Math.max(0, 100 - daysSince * 14);
  return Math.round(mockScore * 0.5 + planScore * 0.25 + recency * 0.25);
}

function readinessLabel(score: number): { text: string; color: string } {
  if (score >= 80) return { text: 'Exam ready 🎯', color: 'var(--success)' };
  if (score >= 60) return { text: 'Getting there', color: 'var(--warn)' };
  if (score >= 40) return { text: 'Keep studying', color: 'var(--accent)' };
  return { text: 'More work needed', color: 'var(--danger)' };
}

function StreakCalendar({ studyHistory }: { studyHistory: string[] }) {
  const historySet = new Set(studyHistory);
  const todayDate = new Date();

  const days: { date: string; studied: boolean; isToday: boolean }[] = [];
  for (let i = 111; i >= 0; i--) {
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({ date: dateStr, studied: historySet.has(dateStr), isToday: i === 0 });
  }

  const firstDayOfWeek = new Date(days[0].date + 'T12:00:00').getDay();
  const padded: (typeof days[0] | null)[] = [...Array(firstDayOfWeek).fill(null), ...days];

  const weeks: (typeof days[0] | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  return (
    <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--txt)', marginBottom: '0.75rem' }}>Study Activity</h3>
      <div style={{ display: 'flex', gap: 3, overflowX: 'auto' }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map((day, di) => (
              <div
                key={di}
                title={day ? `${day.date}${day.studied ? ' — studied' : ''}` : ''}
                style={{
                  width: 12, height: 12, borderRadius: 2,
                  background: !day
                    ? 'transparent'
                    : day.isToday
                    ? 'var(--accent)'
                    : day.studied
                    ? 'color-mix(in srgb, var(--accent) 70%, var(--surface2))'
                    : 'var(--surface2)',
                  border: day?.isToday ? '1px solid var(--accent)' : 'none',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.6rem', fontSize: '0.7rem', color: 'var(--muted)' }}>
        <span>Less</span>
        <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--surface2)' }} />
        <div style={{ width: 10, height: 10, borderRadius: 2, background: 'color-mix(in srgb, var(--accent) 70%, var(--surface2))' }} />
        <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent)' }} />
        <span>More (today)</span>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { attempts, streak, studyHistory, studyPlan, lastStudyDate, clearHistory, clearCertHistory, confidence } = useAppStore();
  const [confirmAll, setConfirmAll] = useState(false);
  const [confirmCert, setConfirmCert] = useState<CertId | null>(null);
  const [radarCert, setRadarCert] = useState<CertId | null>(null);

  const handleClearAll = () => {
    clearHistory();
    setConfirmAll(false);
    toast('All progress reset successfully.', 'success');
  };

  const handleClearCert = (certId: CertId) => {
    const cert = certifications.find(c => c.id === certId);
    clearCertHistory(certId);
    setConfirmCert(null);
    toast(`${cert?.shortName} progress reset.`, 'success');
  };

  const byDate = [...attempts].reverse().map((a, i) => ({
    name: `#${i + 1}`, score: a.score, cert: a.certId.toUpperCase(),
  }));

  const byCert = certifications.map(c => {
    const certAttempts = attempts.filter(a => a.certId === c.id);
    return {
      name: c.shortName, avg: averageScore(certAttempts),
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

  // Readiness: show certs with attempts or matching study plan
  const readinessCerts = certifications.filter(c =>
    attempts.some(a => a.certId === c.id) || studyPlan?.certId === c.id,
  );

  // Radar: certs with attempts
  const radarCerts = certifications.filter(c => attempts.some(a => a.certId === c.id));
  const activeRadarCert = radarCert ?? radarCerts[0]?.id ?? null;

  function buildRadarData(certId: CertId) {
    const cert = certifications.find(c => c.id === certId)!;
    const certAttempts = attempts.filter(a => a.certId === certId);
    const domainMap: Record<string, { correct: number; total: number }> = {};
    for (const a of certAttempts) {
      for (const [d, s] of Object.entries(a.domainScores)) {
        if (!domainMap[d]) domainMap[d] = { correct: 0, total: 0 };
        domainMap[d].correct += s.correct;
        domainMap[d].total += s.total;
      }
    }
    return cert.domains.map(domain => ({
      domain: domain.name.length > 20 ? domain.name.slice(0, 18) + '…' : domain.name,
      score: domainMap[domain.id]?.total
        ? Math.round((domainMap[domain.id].correct / domainMap[domain.id].total) * 100)
        : 0,
      fullMark: 100,
    }));
  }

  const tooltipStyle = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '0.5rem', color: 'var(--txt)', fontSize: '0.78rem',
  };

  const isEmpty = attempts.length === 0 && Object.values(confidence).every(v => v === 0);

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--txt)', marginBottom: '0.25rem' }}>Dashboard</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Progress across all certification tracks.</p>
        </div>
        <button
          onClick={() => setConfirmAll(true)}
          className="btn-ghost"
          style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
        >
          <Trash2 size={13} /> Reset all progress
        </button>
      </div>

      {isEmpty ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <LayoutDashboard size={36} style={{ color: 'var(--border)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No attempts yet. Take a mock exam to start tracking your progress.</p>
        </div>
      ) : (
        <>
          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <KPI icon={<Trophy size={16} />} label="Total Attempts" value={attempts.length} />
            <KPI icon={<Trophy size={16} style={{ color: 'var(--success)' }} />} label="Passed" value={`${passCount}/${attempts.length}`} />
            <KPI icon={<Flame size={16} style={{ color: 'var(--warn)' }} />} label="Study Streak" value={`${streak} day${streak !== 1 ? 's' : ''}`} />
            <KPI icon={<Clock size={16} />} label="Time Studied" value={formatDuration(totalTime)} />
          </div>

          {/* Streak Calendar */}
          <StreakCalendar studyHistory={studyHistory ?? []} />

          {/* Exam Readiness */}
          {readinessCerts.length > 0 && (
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Target size={16} style={{ color: 'var(--accent-lt)' }} />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--txt)' }}>Exam Readiness</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {readinessCerts.map(cert => {
                  const score = computeReadiness(cert.id, attempts, studyPlan, lastStudyDate);
                  const { text, color } = readinessLabel(score);
                  return (
                    <div key={cert.id} style={{ flex: '1 1 160px', background: 'var(--surface2)', borderRadius: '0.5rem', padding: '1rem', minWidth: 140 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.3rem', fontWeight: 500 }}>{cert.shortName}</div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--txt)', lineHeight: 1, marginBottom: '0.25rem' }}>{score}</div>
                      <div style={{ fontSize: '0.72rem', color, fontWeight: 600, marginBottom: '0.6rem' }}>{text}</div>
                      <div style={{ height: 4, background: 'var(--surface)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 2, transition: 'width 0.4s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Domain Radar */}
          {radarCerts.length > 0 && activeRadarCert && (
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target size={16} style={{ color: 'var(--accent-lt)' }} />
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--txt)' }}>Domain Radar</h3>
                </div>
                {radarCerts.length > 1 && (
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {radarCerts.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setRadarCert(c.id)}
                        style={{
                          padding: '0.2rem 0.6rem', borderRadius: '0.35rem', fontSize: '0.75rem', fontWeight: 500,
                          border: `1.5px solid ${activeRadarCert === c.id ? 'var(--accent)' : 'var(--border)'}`,
                          background: activeRadarCert === c.id ? 'color-mix(in srgb, var(--accent) 10%, var(--surface))' : 'transparent',
                          color: activeRadarCert === c.id ? 'var(--accent-lt)' : 'var(--muted)',
                          cursor: 'pointer',
                        }}
                      >
                        {c.shortName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={buildRadarData(activeRadarCert)} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="domain" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fill: 'var(--muted)', fontSize: 10 }} tickCount={5} />
                  <Radar name="Score %" dataKey="score" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.25} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v ?? 0}%`, 'Accuracy']} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Confidence meters */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--txt)', marginBottom: '0.2rem' }}>Confidence Levels</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Updated automatically after each mock exam or simulator attempt.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1.5rem' }}>
              {certifications.map(cert => {
                const val = confidence[cert.id] ?? 0;
                const certAttempts = attempts.filter(a => a.certId === cert.id);
                return (
                  <div key={cert.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <ConfidenceMeter value={val} label={cert.shortName} />
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)', textAlign: 'center' }}>
                      {certAttempts.length} attempt{certAttempts.length !== 1 ? 's' : ''}
                    </div>
                    {certAttempts.length > 0 && (
                      <button
                        onClick={() => setConfirmCert(cert.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.5rem', borderRadius: '0.3rem', transition: 'color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
                        title={`Reset ${cert.shortName} progress`}
                      >
                        <RotateCcw size={10} /> Reset
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
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

          {/* Average by cert */}
          {byCert.length > 0 && (
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--txt)', marginBottom: '1rem' }}>Average Score by Track</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={byCert} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 1000]} tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v ?? 0}/1000`, 'Avg Score']} />
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

          {/* Recent attempts */}
          {attempts.length > 0 && (
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
          )}
        </>
      )}

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={confirmAll}
        title="Reset all progress?"
        message="This will permanently delete all attempt history, confidence levels, spaced repetition data, and your study plan. This cannot be undone."
        confirmLabel="Yes, reset everything"
        danger
        onConfirm={handleClearAll}
        onCancel={() => setConfirmAll(false)}
      />
      <ConfirmDialog
        open={confirmCert !== null}
        title={`Reset ${certifications.find(c => c.id === confirmCert)?.shortName} progress?`}
        message={`This will delete all ${certifications.find(c => c.id === confirmCert)?.shortName} attempts and reset its confidence level to 0. Other certifications are unaffected.`}
        confirmLabel="Reset this cert"
        danger
        onConfirm={() => confirmCert && handleClearCert(confirmCert)}
        onCancel={() => setConfirmCert(null)}
      />
    </div>
  );
}

function KPI({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="card" style={{ padding: '1rem 1.1rem' }}>
      <div style={{ color: 'var(--accent)', marginBottom: '0.4rem' }}>{icon}</div>
      <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--txt)', letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{label}</div>
    </div>
  );
}
