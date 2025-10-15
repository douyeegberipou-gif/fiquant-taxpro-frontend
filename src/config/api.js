// Centralized API configuration
export const getBackendURL = () => {
  // In browser context, try multiple ways to get the environment variable
  let backendURL = process.env.REACT_APP_BACKEND_URL;
  
  // Fallback for development - only use localhost if specifically in development
  if (!backendURL) {
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      backendURL = 'http://localhost:8001';
    }
  }
  
  if (!backendURL && process.env.NODE_ENV === 'production') {
    console.error('REACT_APP_BACKEND_URL environment variable is not set in production!');
    console.error('Please set it to your Supabase backend URL in Vercel environment variables.');
  }
  
  return backendURL;
};

// Use functions to get values at runtime instead of module load time
export const getAPIBaseURL = () => getBackendURL();
export const getAPIURL = () => {
  const baseURL = getAPIBaseURL();
  return baseURL ? `${baseURL}/api` : null;
};

// Legacy exports for compatibility - these will be evaluated at runtime
export const API_BASE_URL = getBackendURL();
export const API_URL = API_BASE_URL ? `${API_BASE_URL}/api` : null;

// Validation helper
export const validateAPIConfig = (componentName = 'Component') => {
  if (!API_BASE_URL) {
    const message = process.env.NODE_ENV === 'production' 
      ? 'Backend URL not configured. Please set REACT_APP_BACKEND_URL environment variable.'
      : 'Backend URL not configured. Check your .env file or start the backend server.';
    
    console.error(`${componentName}: ${message}`);
    return false;
  }
  return true;
};