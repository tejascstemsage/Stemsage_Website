import { apiFetch, normalizeImage } from './apiClient';

/**
 * Fetch all active innovation doors
 * @returns {Promise<Array>} Array of innovation doors
 */
export const getInnovations = async () => {
  const data = await apiFetch('/innovations');
  return (data.data || []).map((i) => ({
    ...i,
    gif: normalizeImage(i.gif),
  }));
};