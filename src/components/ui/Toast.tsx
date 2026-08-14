import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

// Singleton event bus
const listeners: Set<(t: ToastItem) => void> = new Set();

export function toast(message: string, type: ToastType = 'info') {
  const item: ToastItem = { id: crypto.randomUUID(), type, message };
  listeners.forEach(fn => fn(item));
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={15} />,
  error: <XCircle size={15} />,
  warning: <AlertTriangle size={15} />,
  info: <Info size={15} />,
};

const colors: Record<ToastType, string> = {
  success: 'var(--success)',
  error: 'var(--danger)',
  warning: 'var(--warn)',
  info: 'var(--accent)',
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback((t: ToastItem) => {
    setToasts(prev => [...prev, t]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 3800);
  }, []);

  useEffect(() => {
    listeners.add(add);
    return () => { listeners.delete(add); };
  }, [add]);

  if (!toasts.length) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem',
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
      zIndex: 200, pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          background: 'var(--surface)', border: `1.5px solid ${colors[t.type]}`,
          borderRadius: '0.6rem', padding: '0.65rem 1rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          minWidth: 240, maxWidth: 340,
          pointerEvents: 'auto',
          animation: 'slideIn 0.2s ease',
          color: 'var(--txt)', fontSize: '0.85rem',
        }}>
          <span style={{ color: colors[t.type], flexShrink: 0 }}>{icons[t.type]}</span>
          <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
          <button
            onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', flexShrink: 0, padding: 0, display: 'flex' }}
          >
            <X size={13} />
          </button>
        </div>
      ))}
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
