import { getApiBase } from './apiClient';

const API_URL = getApiBase();

/**
 * Fetch all published blogs
 * @returns {Promise<Object>} API response data with array of blogs
 */
export const getBlogs = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${API_URL}/api/blogs${query ? `?${query}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to fetch blogs.');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

/**
 * Fetch a single blog by slug
 * @param {string} slug 
 * @returns {Promise<Object>} API response data with blog object
 */
export const getBlogBySlug = async (slug) => {
  const response = await fetch(`${API_URL}/api/blogs/${encodeURIComponent(slug)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to fetch blog post.');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

/**
 * Create a new blog post (Public / Anyone)
 * @param {string|null} token - Optional STEMSAGE JWT
 * @param {Object} blogData - { title, content, excerpt, category, tags, published }
 * @returns {Promise<Object>} API response data with created blog
 */
export const createBlog = async (token, blogData) => {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/blogs`, {
    method: 'POST',
    headers,
    body: JSON.stringify(blogData)
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to create blog post.');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};
