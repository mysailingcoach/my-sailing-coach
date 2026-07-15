import React from 'react';
import { Link } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="text-2xl">⛵</div>
                <span className="text-xl font-bold text-blue-600">MySailingCoach</span>
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition">Upload</Link>
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 transition">Dashboard</Link>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition">Help</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8 mt-16">
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
              <p className="text-sm">Have feedback? We'd love to hear from you!</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8">
            <p className="text-sm text-center">© 2024 MySailingCoach. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
