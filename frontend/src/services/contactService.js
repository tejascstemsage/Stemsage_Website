import { apiFetch } from './apiClient';

/**
 * Submit a contact form
 * @param {Object} formData - Form data { name, email, phone, subject, message }
 * @returns {Promise<Object>} API response
 */
export const submitContact = async (formData) => {
  return apiFetch('/contact', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
};