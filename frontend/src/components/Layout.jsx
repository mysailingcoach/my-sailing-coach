import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="bg-black/40 backdrop-blur border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="text-2xl">⛵</div>
                <span className="text-xl font-bold gradient-text">MySailingCoach</span>
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-gray-400 hover:text-white transition text-sm">Upload</Link>
              {isAuthenticated && (
                <Link to="/dashboard" className="text-gray-400 hover:text-white transition text-sm">Dashboard</Link>
              )}
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">
                    {user?.name || user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-sm text-gray-400 hover:text-white transition"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/5 text-gray-500 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">About</h3>
              <p className="text-sm">Free sailing performance analysis tool powered by your GPS data.</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Features</h3>
              <ul className="text-sm space-y-2">
                <li>GPX File Analysis</li>
                <li>Race Mapping</li>
                <li>Performance Metrics</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Contact</h3>
              <p className="text-sm">Have feedback? We&apos;d love to hear from you!</p>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8">
            <p className="text-sm text-center">© {new Date().getFullYear()} MySailingCoach. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
