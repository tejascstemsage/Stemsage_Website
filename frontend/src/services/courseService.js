import { apiFetch } from './apiClient';

/**
 * Fetch all active courses
 * @returns {Promise<Array>} Array of courses
 */
export const getCourses = async () => {
  const data = await apiFetch('/courses');
  return data.data || [];
};

/**
 * Fetch active courses (for checking if any exist)
 * @returns {Promise<Array>} Array of active courses
 */
export const getActiveCourses = async () => {
  const data = await apiFetch('/courses');
  return (data.data || []).filter((c) => c.isActive);
};