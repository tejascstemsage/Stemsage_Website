import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('stemsage_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error('Failed to parse stored user profile:', e);
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('stemsage_token') || null;
  });

  // Automatically refresh authoritative user profile from MongoDB via GET /api/auth/me
  useEffect(() => {
    if (!token) return;
    let isMounted = true;
    const fetchMe = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.user && isMounted) {
            setUser(data.data.user);
            localStorage.setItem('stemsage_user', JSON.stringify(data.data.user));
          }
        }
      } catch (err) {
        console.error('Failed to refresh user profile from server:', err);
      }
    };
    fetchMe();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (newToken, newUser) => {
    setToken(newToken);
    localStorage.setItem('stemsage_token', newToken);

    if (newUser) {
      setUser(newUser);
      localStorage.setItem('stemsage_user', JSON.stringify(newUser));
    }

    // Fetch final authoritative user profile from GET /api/auth/me
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          setUser(data.data.user);
          localStorage.setItem('stemsage_user', JSON.stringify(data.data.user));
          return data.data.user;
        }
      }
    } catch (err) {
      console.error('Failed to fetch authoritative user on login:', err);
    }
    return newUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('stemsage_token');
    localStorage.removeItem('stemsage_user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('stemsage_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
