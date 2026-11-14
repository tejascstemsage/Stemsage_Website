import { apiFetch, normalizeImage } from './apiClient';

/**
 * Fetch all active gallery images
 * @returns {Promise<Array>} Array of gallery images
 */
export const getGalleryImages = async () => {
  const data = await apiFetch('/gallery');
  return (data.data || []).map((g) => ({
    ...g,
    image: normalizeImage(g.image),
  }));
};