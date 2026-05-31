import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true, // Required for httpOnly cookies
});

// In-memory token storage (not localStorage for security)
let accessToken = null;
let isRefreshing = false;
let failedQueue = [];

// Process failed requests queue after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Set access token (called from AuthContext)
export const setAccessToken = (token) => {
  accessToken = token;
  // Also store in localStorage for backward compatibility with components
  // that directly use localStorage.getItem('token')
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Get access token (for manual checks)
export const getAccessToken = () => accessToken || localStorage.getItem('token');

// Clear access token (called on logout)
export const clearAccessToken = () => {
  accessToken = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user_id');
};

// Request interceptor - attach access token from memory
api.interceptors.request.use((config) => {
  // Skip auth header for refresh endpoint
  if (config.url?.includes('/auth/refresh')) {
    return config;
  }
  
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor - handle 401 and auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry for login, register, or refresh endpoints
      if (originalRequest.url?.includes('/auth/login') || 
          originalRequest.url?.includes('/auth/register') ||
          originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }
      
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Try to refresh the token
        const response = await api.post('/api/auth/refresh');
        const newToken = response.data.access_token;
        
        accessToken = newToken;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        processQueue(null, newToken);
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Clear token and redirect to login
        accessToken = null;
        
        // Dispatch custom event for AuthContext to handle
        window.dispatchEvent(new CustomEvent('auth:sessionExpired'));
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
