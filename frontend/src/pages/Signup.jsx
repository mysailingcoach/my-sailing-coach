import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-yellow-500' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-blue-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
}

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const strength = getPasswordStrength(form.password);

  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
      if (serverError) setServerError('');
    };
  }

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!validateEmail(form.email)) newErrors.email = 'Enter a valid email address';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!acceptedTerms) newErrors.terms = 'You must accept the terms & conditions';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');
    try {
      await signup(form.name.trim(), form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.error || 'Signup failed. Please try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start analysing your sailing races for free"
    >
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
          label="Full name"
          type="text"
          value={form.name}
          onChange={handleChange('name')}
          placeholder="Alex Smith"
          autoComplete="name"
          error={errors.name}
          required
        />

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

        <div className="flex flex-col gap-1">
          <AuthInput
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            error={errors.password}
            required
          />
          {/* Password strength indicator */}
          {form.password && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-1 flex-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={[
                      'h-1 flex-1 rounded-full transition-all duration-300',
                      strength.score >= i ? strength.color : 'bg-white/10',
                    ].join(' ')}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400 w-12 text-right">{strength.label}</span>
            </div>
          )}
        </div>

        <AuthInput
          label="Confirm password"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange('confirmPassword')}
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={errors.confirmPassword}
          required
        />

        {/* Terms & conditions */}
        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
              }}
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0 shrink-0"
            />
            <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
              I agree to the{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Terms &amp; Conditions</a>
              {' '}and{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Privacy Policy</a>
            </span>
          </label>
          {errors.terms && <p className="text-xs text-red-400 ml-6">{errors.terms}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
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
              Creating account…
            </span>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
