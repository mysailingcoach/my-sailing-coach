import React from 'react';

/**
 * ModernButton – gradient-animated button with multiple variants.
 *
 * Props:
 *   variant: 'primary' | 'ghost' | 'danger'  (default: 'primary')
 *   loading: boolean
 *   disabled: boolean
 *   className: string (extra classes)
 *   All other props forwarded to <button>
 */
export default function ModernButton({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const base = variant === 'ghost'
    ? 'btn-ghost'
    : variant === 'danger'
      ? 'btn-danger'
      : 'btn-gradient';

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${className}`}
      {...props}
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
