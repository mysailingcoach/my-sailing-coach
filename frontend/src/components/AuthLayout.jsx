import React from 'react';
import { Link } from 'react-router-dom';

/**
 * AuthLayout - Centered glassmorphism card layout used by Login and Signup pages.
 */
export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0a0a0a]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>
      {/* Card */}
      <div className="relative z-10 w-full max-w-md glass rounded-2xl p-8 shadow-2xl">
        {title && (
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>

      <p className="mt-6 text-xs text-gray-600 z-10">
        © {new Date().getFullYear()} MySailingCoach. All rights reserved.
      </p>
    </div>
  );
}
