import { apiFetch, normalizeImage } from './apiClient';

/**
 * Fetch all active products
 * @param {Object} params - Query parameters (category, etc.)
 * @returns {Promise<Array>} Array of products
 */
export const getProducts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const endpoint = `/products${query ? `?${query}` : ''}`;

  const data = await apiFetch(endpoint);
  return (data.data || []).map((p) => ({
    ...p,
    image: normalizeImage(p.images?.[0]),
    images: p.images?.map((img) => normalizeImage(img)).filter(Boolean) || [],
  }));
};

/**
 * Fetch featured products for home page
 * @returns {Promise<Array>} Array of featured products
 */
export const getFeaturedProducts = async () => {
  const data = await apiFetch('/products?isFeatured=true&limit=3');
  return (data.data || []).map((p) => ({
    ...p,
    image: normalizeImage(p.images?.[0]),
    images: p.images?.map((img) => normalizeImage(img)).filter(Boolean) || [],
  }));
};

/**
 * Fetch products marked for home page display
 * @returns {Promise<Array>} Array of products for home
 */
export const getHomeProducts = async () => {
  const data = await apiFetch('/products?showOnHome=true&limit=3');
  return (data.data || []).map((p) => ({
    ...p,
    image: normalizeImage(p.images?.[0]),
    images: p.images?.map((img) => normalizeImage(img)).filter(Boolean) || [],
  }));
};

/**
 * Fetch a single product by slug
 * @param {string} slug - Product slug
 * @returns {Promise<Object|null>} Product or null
 */
export const getProductBySlug = async (slug) => {
  try {
    const data = await apiFetch(`/products/slug/${encodeURIComponent(slug)}`);
    const product = data.data;
    if (!product) return null;
    return {
      ...product,
      image: normalizeImage(product.images?.[0]),
      images: product.images?.map((img) => normalizeImage(img)).filter(Boolean) || [],
    };
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
};