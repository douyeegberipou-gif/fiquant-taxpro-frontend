import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Load user data on app start
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/api/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Failed to load user:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post("/api/auth/login", { email, password });

      if (response.data?.access_token) {
        localStorage.setItem("token", response.data.access_token);

        api.defaults.headers.common["Authorization"] =
          `Bearer ${response.data.access_token}`;

        await getUserProfile(); // calls /auth/me correctly

        return { success: true };
      }

      return { success: false, error: 'No token received' };

    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.detail || 'Login failed';
      
      // Check if the error is about account verification
      const needsVerification = error.response?.status === 403 && 
        (errorMessage.includes('not verified') || errorMessage.includes('verification required'));
      
      return { 
        success: false, 
        error: errorMessage,
        needsVerification: needsVerification
      };
    }
  };

  const getUserProfile = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data);
      return true;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      
      // Don't auto-login after registration - user needs to verify first
      return { 
        success: true, 
        user: response.data,
        requiresVerification: true 
      };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  const refreshUser = async () => {
    const currentToken = token || localStorage.getItem('token');
    if (currentToken) {
      try {
        const response = await api.get('/api/auth/me');
        setUser(response.data);
        return { success: true };
      } catch (error) {
        console.error('Failed to refresh user:', error);
        return { success: false };
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    delete api.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/api/profile/update', profileData);
      setUser(response.data);
      return { success: true, user: response.data };
    } catch (error) {
      console.error('Profile update failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Profile update failed' 
      };
    }
  };

  const hasPermission = (permission) => {
    return user && user.permissions && user.permissions.includes(permission);
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    hasPermission,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
