import { apiFetch, normalizeImage } from './apiClient';

/**
 * Fetch all active services
 * @returns {Promise<Array>} Array of services
 */
export const getServices = async () => {
  const data = await apiFetch('/services');
  return (data.data || []).map((s) => ({
    ...s,
    image: normalizeImage(s.image),
  }));
};