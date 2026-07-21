import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LOGIN_DISABLED } from '../config/featureFlags';

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const navLink = (to, label) => {
    const active = pathname === to;
    return (
      <Link
        to={to}
        className={`
          relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
          ${active
            ? 'text-white bg-white/10'
            : 'text-[#7a8899] hover:text-white hover:bg-white/06'
          }
        `}
      >
        {label}
        {active && (
          <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* ── Navigation ── */}
      <nav
        className="sticky top-0 z-50 glass-strong"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl"></span>
              <span className="text-base font-bold gradient-text">
                MySailingCoach
              </span>
            </Link>

            {/* Nav links */}
            <div className="flex items-center gap-1">
              {navLink('/', 'Upload')}
              {isAuthenticated && navLink('/dashboard', 'Dashboard')}

              {isAuthenticated ? (
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-sm px-2" style={{ color: 'var(--color-text-muted)' }}>
                    {user?.name || user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn-ghost text-xs px-3 py-1.5"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  {/* TODO: Remove LOGIN_DISABLED check to restore the Sign in link (set LOGIN_DISABLED = false in src/config/featureFlags.js). */}
                  {!LOGIN_DISABLED && (
                    <Link
                      to="/login"
                      className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-[#7a8899] hover:text-white hover:bg-white/06"
                    >
                      Sign in
                    </Link>
                  )}
                  <Link
                    to="/signup"
                    className="btn-gradient text-sm px-4 py-2 rounded-lg"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer
        className="mt-20 py-12"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          background: 'var(--color-surface)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl"></span>
                <span className="font-bold gradient-text">MySailingCoach</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Sailing performance analysis powered by your GPS data.
              </p>
            </div>

            <div>
              <h4
                className="text-sm font-semibold mb-4 uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Features
              </h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <li>GPX File Analysis</li>
                <li>Interactive Race Mapping</li>
                <li>Performance Metrics</li>
              </ul>
            </div>

            <div>
              <h4
                className="text-sm font-semibold mb-4 uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Product
              </h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <li>Upload</li>
                <li>Dashboard</li>
                <li>Race Insights</li>
              </ul>
            </div>
          </div>

          <hr className="divider mb-8" />

          <p className="text-center text-xs" style={{ color: 'var(--color-text-faint)' }}>
            © {new Date().getFullYear()} MySailingCoach. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
