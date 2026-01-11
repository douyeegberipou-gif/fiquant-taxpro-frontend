/**
 * Bulletproof device detection with multiple methods
 */

export const isMobileDevice = () => {
  // Method 1: User Agent check
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isUserAgentMobile = mobileRegex.test(userAgent);

  // Method 2: Screen width check
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const isScreenMobile = screenWidth <= 768;

  // Method 3: Touch capability
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // Return true if ANY method indicates mobile
  return isUserAgentMobile || isScreenMobile || (isTouchDevice && isScreenMobile);
};

export const getDeviceType = () => {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
  
  if (width <= 480) return 'mobile';
  if (width <= 768) return 'tablet';
  return 'desktop';
};
