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
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        setToken(storedToken);

        try {
          const response = await api.get('/api/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Failed to load user:', error);
          // Clear invalid token
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            setToken(null);
            delete api.defaults.headers.common['Authorization'];
          }
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // Login function - handles both object and separate params
  const login = async (emailOrCredentials, passwordParam) => {
    try {
      // Build payload - handle both formats
      let payload;
      if (typeof emailOrCredentials === 'object' && emailOrCredentials !== null) {
        // Object format: {email_or_phone, password} or {email, password}
        payload = {
          email_or_phone: emailOrCredentials.email_or_phone || emailOrCredentials.email,
          password: emailOrCredentials.password
        };
      } else {
        // Separate params format: login(email, password)
        payload = {
          email_or_phone: emailOrCredentials,
          password: passwordParam
        };
      }

      const response = await api.post('/api/auth/login', payload);

      if (response.data?.access_token) {
        const newToken = response.data.access_token;
        
        localStorage.setItem('token', newToken);
        setToken(newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

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

  // Forgot Password - uses axios instance for consistency
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

  // Resend Verification Email
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
    return { success: false };
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
    isAuthenticated,
    forgotPassword,
    resendVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
