import { getApiBase } from './apiClient';

const API_URL = getApiBase();

/**
 * Authenticates user via backend Google Auth endpoint.
 * @param {string} credential - Google ID token.
 * @returns {Promise<Object>} Backend response data containing token and user info.
 */
export const googleAuthenticate = async (credential) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential }),
    });

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = data.message;

      if (response.status === 401) {
        errorMessage = 'Google authentication failed. Please try again.';
      } else if (response.status === 409) {
        errorMessage =
          'An account with this email already exists. Please sign in using your existing login method.';
      } else if (response.status === 403) {
        errorMessage = data.message || 'This account is inactive.';
      } else if (response.status === 400) {
        errorMessage = data.message || 'Google credential is required.';
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.status) {
      throw error;
    }
    const networkError = new Error('Unable to connect to the server. Please try again.');
    networkError.status = 0;
    throw networkError;
  }
};
