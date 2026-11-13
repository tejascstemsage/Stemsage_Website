/**
 * Resolve the API base URL from VITE_API_URL.
 * Accepts the value with or without a trailing "/api" and strips trailing
 * slashes, so callers may set it to either "http://localhost:5000" or
 * "http://localhost:5000/api". Defaults to localhost:5000.
 */
export function getApiBase() {
  const raw = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  let base = String(raw).replace(/\/+$/, '');
  if (!/\/api$/i.test(base)) {
    base = `${base}/api`;
  }
  return base;
}