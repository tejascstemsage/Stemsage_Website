import { apiFetch, normalizeImage } from './apiClient';

/**
 * Fetch all active news items
 * @param {number} [limit] - Optional limit for number of items
 * @returns {Promise<Array>} Array of news items
 */
export const getNews = async (limit) => {
  const url = limit ? `/news?limit=${limit}` : '/news';
  const data = await apiFetch(url);
  return (data.data || []).map((n) => ({
    ...n,
    image: normalizeImage(n.image),
  }));
};