import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Moon, Sun, Menu, X, BookOpen, FlaskConical, LayoutDashboard, Library, CalendarDays, Zap } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const links = [
  { to: '/exams', label: 'Mock Exams', icon: FlaskConical },
  { to: '/simulator', label: 'Simulator', icon: Zap },
  { to: '/practice', label: 'Practice', icon: BookOpen },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/resources', label: 'Resources', icon: Library },
  { to: '/plan', label: 'Study Plan', icon: CalendarDays },
];

export function Navbar() {
  const { theme, toggleTheme, streak } = useAppStore();
  const [open, setOpen] = useState(false);

  return (
    <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 no-underline" onClick={() => setOpen(false)}>
            <div style={{ background: 'var(--accent)', borderRadius: '0.375rem', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.75rem' }}>CC</span>
            </div>
            <span style={{ color: 'var(--txt)', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '-0.01em' }}>
              Claude Cert Hub
            </span>
          </NavLink>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.825rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: isActive ? 'var(--accent-lt)' : 'var(--muted)',
                  background: isActive ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
                  transition: 'all 0.15s',
                })}
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <span style={{ color: 'var(--warn)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                🔥 {streak}
              </span>
            )}
            <button
              onClick={toggleTheme}
              className="btn-ghost"
              style={{ padding: '0.4rem', borderRadius: '0.375rem', width: 34, height: 34, justifyContent: 'center' }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="md:hidden btn-ghost"
              style={{ padding: '0.4rem', borderRadius: '0.375rem', width: 34, height: 34, justifyContent: 'center' }}
              onClick={() => setOpen(o => !o)}
              aria-label="Menu"
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '0.75rem 1rem' }}>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 0.75rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                color: isActive ? 'var(--accent-lt)' : 'var(--txt)',
                background: isActive ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
                marginBottom: '0.25rem',
              })}
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
