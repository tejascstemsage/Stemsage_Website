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

const API_URL = getApiBase();

/**
 * Shared fetch wrapper with error handling
 * @param {string} endpoint - API endpoint (e.g., '/products')
 * @param {Object} options - fetch options
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Normalize image value from backend (string or { url }) to string
 * @param {string|Object|null|undefined} img - Image from API
 * @returns {string|null} Image URL or null
 */
export function normalizeImage(img) {
  if (!img) return null;
  if (typeof img === 'string') return img;
  if (img && typeof img === 'object' && img.url) return img.url;
  return null;
}

/**
 * Normalize array of images
 * @param {Array} images - Array of image objects/strings
 * @returns {Array<string>} Array of image URLs
 */
export function normalizeImages(images) {
  if (!Array.isArray(images)) return [];
  return images.map(normalizeImage).filter(Boolean);
}