import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';

// TODO: Set LOGIN_DISABLED to false to re-enable the login feature.
const LOGIN_DISABLED = true;

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
      if (serverError) setServerError('');
    };
  }

  function validate() {
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email is required';
    else if (!validateEmail(form.email)) newErrors.email = 'Enter a valid email address';
    if (!form.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.error || 'Login failed. Please try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      {/* TODO: Remove this banner once login is re-enabled (set LOGIN_DISABLED = false above). */}
      {LOGIN_DISABLED && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm mb-2">
          <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Login is temporarily unavailable. Please try again later.
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {serverError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {serverError}
          </div>
        )}

        <AuthInput
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange('email')}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
          required
        />

        <AuthInput
          label="Password"
          type="password"
          value={form.password}
          onChange={handleChange('password')}
          placeholder="Your password"
          autoComplete="current-password"
          error={errors.password}
          required
        />

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0"
            />
            <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
          </label>
          <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading || LOGIN_DISABLED}
          className={[
            'w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200',
            'bg-gradient-to-r from-blue-600 to-cyan-500',
            'hover:from-blue-500 hover:to-cyan-400 hover:shadow-lg hover:shadow-blue-500/25',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
            'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none',
            'mt-1',
          ].join(' ')}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in…
            </span>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
