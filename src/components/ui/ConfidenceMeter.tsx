interface Props {
  value: number; // 0-100
  label?: string;
  size?: 'sm' | 'md';
}

function confidenceLabel(v: number): { text: string; color: string } {
  if (v === 0) return { text: 'No data yet', color: 'var(--border)' };
  if (v < 30) return { text: 'Needs work', color: 'var(--danger)' };
  if (v < 50) return { text: 'Getting started', color: 'var(--warn)' };
  if (v < 70) return { text: 'On track', color: '#f59e0b' };
  if (v < 85) return { text: 'Good chance', color: 'var(--success)' };
  return { text: 'Highly likely', color: 'var(--success)' };
}

export function ConfidenceMeter({ value, label, size = 'md' }: Props) {
  const { text, color } = confidenceLabel(value);
  const isSm = size === 'sm';
  const radius = isSm ? 26 : 36;
  const stroke = isSm ? 4 : 5;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - value / 100);
  const svgSize = (radius + stroke + 2) * 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ position: 'relative', width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
          {/* Background ring */}
          <circle
            cx={svgSize / 2} cy={svgSize / 2} r={radius}
            fill="none" stroke="var(--surface2)" strokeWidth={stroke}
          />
          {/* Progress ring */}
          <circle
            cx={svgSize / 2} cy={svgSize / 2} r={radius}
            fill="none" stroke={value === 0 ? 'var(--border)' : color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${svgSize / 2} ${svgSize / 2})`}
            style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
          />
        </svg>
        {/* Centre text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: isSm ? '0.75rem' : '0.95rem', fontWeight: 700, color: value === 0 ? 'var(--muted)' : color, lineHeight: 1 }}>
            {value}%
          </span>
        </div>
      </div>
      {label && <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center', maxWidth: svgSize }}>{label}</span>}
      <span style={{
        fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
        color: value === 0 ? 'var(--muted)' : color,
      }}>
        {text}
      </span>
    </div>
  );
}

export function likelyhoodSummary(score: number, passingScore: number): { label: string; color: string; detail: string } {
  const pct = (score / passingScore) * 100;
  if (pct >= 110) return { label: 'Very likely to pass', color: 'var(--success)', detail: 'You are scoring well above the threshold. Keep it up.' };
  if (pct >= 95) return { label: 'Likely to pass', color: 'var(--success)', detail: 'You are close to or above the passing mark consistently.' };
  if (pct >= 80) return { label: 'On track', color: '#f59e0b', detail: 'Focus on your weakest domains to push past the threshold.' };
  if (pct >= 65) return { label: 'Getting closer', color: 'var(--warn)', detail: 'Targeted practice on low-scoring domains will close the gap.' };
  return { label: 'Needs significant work', color: 'var(--danger)', detail: 'Review domain fundamentals and increase practice frequency.' };
}
