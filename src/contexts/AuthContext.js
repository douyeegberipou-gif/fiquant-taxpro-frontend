import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setAccessToken, clearAccessToken, getAccessToken } from '../config/api';

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
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Handle session expiry event from api interceptor
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      clearAccessToken();
      setSessionExpired(true);
    };

    window.addEventListener('auth:sessionExpired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:sessionExpired', handleSessionExpired);
    };
  }, []);

  // Initialize auth on app start - try to refresh token
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to refresh token using httpOnly cookie
        const response = await api.post('/api/auth/refresh');
        
        if (response.data?.access_token) {
          setAccessToken(response.data.access_token);
          
          // Fetch user profile
          const userResponse = await api.get('/api/auth/me');
          setUser(userResponse.data);
        }
      } catch (error) {
        // No valid refresh token - user needs to login
        console.log('No active session found');
        clearAccessToken();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (emailOrCredentials, passwordParam) => {
    try {
      // Build payload - handle both formats
      let payload;
      if (typeof emailOrCredentials === 'object' && emailOrCredentials !== null) {
        payload = {
          email_or_phone: emailOrCredentials.email_or_phone || emailOrCredentials.email,
          password: emailOrCredentials.password
        };
      } else {
        payload = {
          email_or_phone: emailOrCredentials,
          password: passwordParam
        };
      }

      const response = await api.post('/api/auth/login', payload);

      if (response.data?.access_token) {
        // Store access token in memory (not localStorage)
        setAccessToken(response.data.access_token);
        setSessionExpired(false);

        // Fetch user profile
        await getUserProfile();

        return { success: true };
      }

      return { success: false, error: 'No token received' };

    } catch (error) {
      console.error('Login error:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          'Login failed. Please try again.';
      
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

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return { 
        success: true, 
        message: response.data?.message || 'Password reset instructions sent to your email.'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to send reset email. Please try again.'
      };
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await api.post('/api/auth/resend-verification', { email });
      return { 
        success: true, 
        message: response.data?.message || 'Verification email sent!'
      };
    } catch (error) {
      console.error('Resend verification error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to resend verification email.'
      };
    }
  };

  const refreshUser = useCallback(async () => {
    if (getAccessToken()) {
      try {
        const response = await api.get('/api/auth/me');
        setUser(response.data);
        return { success: true };
      } catch (error) {
        console.error('Failed to refresh user:', error);
        return { success: false };
      }
    }
    return { success: false };
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call backend to revoke refresh token
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call result
      setUser(null);
      clearAccessToken();
    }
  }, []);

  const revokeAllSessions = async () => {
    try {
      const response = await api.post('/api/auth/revoke-all-sessions');
      // After revoking all sessions, log out current session too
      setUser(null);
      clearAccessToken();
      return { 
        success: true, 
        sessionsRevoked: response.data?.sessions_revoked || 0 
      };
    } catch (error) {
      console.error('Revoke all sessions error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to revoke sessions' 
      };
    }
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

  const isAuthenticated = useCallback(() => {
    return !!user;
  }, [user]);

  // Get token for components that need it (legacy support)
  const token = getAccessToken();

  const value = {
    user,
    token,
    loading,
    sessionExpired,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    hasPermission,
    isAuthenticated,
    forgotPassword,
    resendVerification,
    revokeAllSessions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
