import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, danger = false }: Props) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{ maxWidth: 400, width: '100%', padding: '1.75rem', animation: 'fadeUp 0.18s ease' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '0.5rem', flexShrink: 0,
            background: danger ? 'color-mix(in srgb, var(--danger) 15%, transparent)' : 'color-mix(in srgb, var(--warn) 15%, transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={18} style={{ color: danger ? 'var(--danger)' : 'var(--warn)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--txt)', marginBottom: '0.4rem' }}>{title}</h3>
            <p style={{ fontSize: '0.83rem', color: 'var(--muted)', lineHeight: 1.6 }}>{message}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onCancel} style={{ fontSize: '0.85rem' }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: danger ? 'var(--danger)' : 'var(--warn)',
              color: '#fff', border: 'none', padding: '0.5rem 1.25rem',
              borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer',
              fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
