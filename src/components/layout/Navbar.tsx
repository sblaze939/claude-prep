import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Moon, Sun, Menu, X, FlaskConical, Zap, BookOpen, LayoutDashboard, Library, CalendarDays, Stethoscope, BookMarked } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const links = [
  { to: '/exams', label: 'Mock Exams', icon: FlaskConical },
  { to: '/simulator', label: 'Simulator', icon: Zap },
  { to: '/diagnostic', label: 'Diagnostic', icon: Stethoscope },
  { to: '/practice', label: 'Practice', icon: BookOpen },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/resources', label: 'Resources', icon: Library },
  { to: '/glossary', label: 'Glossary', icon: BookMarked },
  { to: '/plan', label: 'Study Plan', icon: CalendarDays },
];

export function Navbar() {
  const { theme, toggleTheme, streak } = useAppStore();
  const [open, setOpen] = useState(false);

  const activeStyle = { color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 12%, transparent)' };
  const inactiveStyle = { color: 'var(--muted)', background: 'transparent' };

  return (
    <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>

        {/* Logo */}
        <NavLink to="/" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: '0.4rem', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.7rem' }}>CC</span>
          </div>
          <span style={{ color: 'var(--txt)', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '-0.01em' }}>Claude Cert Hub</span>
        </NavLink>

        {/* Desktop nav — visible on wide screens */}
        <div id="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', flex: 1, justifyContent: 'center' }}>
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                padding: '0.35rem 0.65rem',
                borderRadius: '0.375rem',
                fontSize: '0.82rem',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.15s',
                ...(isActive ? activeStyle : inactiveStyle),
              })}
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {streak > 0 && (
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--warn)' }}>🔥 {streak}</span>
          )}
          <button onClick={toggleTheme} aria-label="Toggle theme" style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '0.375rem', width: 34, height: 34, cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          {/* Hamburger — only shows on small screens via CSS */}
          <button onClick={() => setOpen(o => !o)} aria-label="Menu" id="hamburger-btn" style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '0.375rem', width: 34, height: 34, cursor: 'pointer', color: 'var(--muted)', display: 'none', alignItems: 'center', justifyContent: 'center' }}>
            {open ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '0.75rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.55rem 0.75rem', borderRadius: '0.375rem',
                fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none',
                ...(isActive ? activeStyle : { color: 'var(--txt)', background: 'transparent' }),
              })}
            >
              <Icon size={14} /> {label}
            </NavLink>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          #desktop-nav { display: none !important; }
          #hamburger-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          #mobile-banner { display: none !important; }
        }
      `}</style>
      <div id="mobile-banner" style={{ background: 'color-mix(in srgb, var(--accent) 12%, var(--surface))', borderTop: '1px solid var(--border)', padding: '0.45rem 1.25rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)' }}>
        💡 For the best experience, open this on a desktop or laptop.
      </div>
    </nav>
  );
}
