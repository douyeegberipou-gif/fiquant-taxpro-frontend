/**
 * Mobile optimization utilities
 */

/**
 * Lazy load images for better mobile performance
 */
export const lazyLoadImage = (imgElement) => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    imageObserver.observe(imgElement);
  } else {
    // Fallback for browsers without IntersectionObserver
    imgElement.src = imgElement.dataset.src;
  }
};

/**
 * Optimize image URLs for mobile
 * Add width/quality parameters if supported
 */
export const optimizeImageUrl = (url, width = 800) => {
  if (!url) return url;
  
  // For Emergent CDN images, add optimization parameters
  if (url.includes('emergentagent.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width}&q=75`;
  }
  
  return url;
};

/**
 * Debounce function for scroll and resize events
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Check if device has notch (safe area)
 */
export const hasNotch = () => {
  if (typeof window === 'undefined') return false;
  
  const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const ratio = window.devicePixelRatio || 1;
  const screen = {
    width: window.screen.width * ratio,
    height: window.screen.height * ratio
  };

  // iPhone X and newer
  return iOS && (
    (screen.width === 1125 && screen.height === 2436) || // iPhone X, XS
    (screen.width === 828 && screen.height === 1792) ||  // iPhone XR
    (screen.width === 1242 && screen.height === 2688) || // iPhone XS Max
    (screen.width === 1170 && screen.height === 2532) || // iPhone 12/13 Pro
    (screen.width === 1284 && screen.height === 2778)    // iPhone 12/13 Pro Max
  );
};

/**
 * Prevent body scroll (for modals)
 */
export const disableBodyScroll = () => {
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
};

export const enableBodyScroll = () => {
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
};

/**
 * Get optimal keyboard type for input
 */
export const getInputMode = (type) => {
  const inputModes = {
    email: 'email',
    tel: 'tel',
    number: 'numeric',
    decimal: 'decimal',
    url: 'url',
    search: 'search'
  };
  return inputModes[type] || 'text';
};

/**
 * Vibrate device (for haptic feedback)
 */
export const vibrate = (duration = 10) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration);
  }
};

/**
 * Check if user is on slow connection
 */
export const isSlowConnection = () => {
  if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
  }
  return false;
};
