const DEFAULT_API_BASE = '/api';

export function getApiBaseUrl(env = (typeof import.meta !== 'undefined' ? import.meta.env : undefined)) {
  const configured = env?.VITE_API_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  return DEFAULT_API_BASE;
}

export function getApiUrl(path = '', env = (typeof import.meta !== 'undefined' ? import.meta.env : undefined)) {
  const base = getApiBaseUrl(env);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (/^https?:\/\//i.test(base)) {
    return `${base}${normalizedPath}`;
  }

  return `${base}${normalizedPath}`;
}
