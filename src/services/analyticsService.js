// Analytics Tracking Service for Fiquant TaxPro
// Tracks page views, tab visits, click events, and ad interactions

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Map internal tab IDs to user-friendly display names
const TAB_DISPLAY_NAMES = {
  'home': 'Home',
  'calculator': 'PAYE Calculator',
  'cit': 'CIT Calculator',
  'vat': 'VAT Calculator',
  'cgt': 'CGT Calculator',
  'payment': 'Payments',
  'brackets': 'Tax Library',  // Internal name is "brackets", displayed as "Tax Library"
  'history': 'History',
  'compliance': 'Compliance',
  'profile': 'Profile',
  'addons': 'Add-ons',
  // Mobile tabs
  'mobile_home': 'Mobile Home',
  'mobile_paye': 'Mobile PAYE',
  'mobile_cit': 'Mobile CIT',
  'mobile_vat': 'Mobile VAT',
  'mobile_cgt': 'Mobile CGT'
};

// Get friendly name for analytics display
const getFriendlyTabName = (tabName) => {
  return TAB_DISPLAY_NAMES[tabName] || tabName;
};

// Generate or retrieve session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('fiquant_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('fiquant_session_id', sessionId);
  }
  return sessionId;
};

// Detect device type
const getDeviceType = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    if (/ipad|tablet/i.test(userAgent)) {
      return 'tablet';
    }
    return 'mobile';
  }
  return 'desktop';
};

// Get auth token if available
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Track page view / tab change
export const trackPageView = async (tabName, pagePath = null) => {
  try {
    const sessionId = getSessionId();
    const deviceType = getDeviceType();
    const token = getAuthToken();
    const friendlyName = getFriendlyTabName(tabName);
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/api/analytics/track/pageview`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        session_id: sessionId,
        page_path: pagePath || `/${tabName}`,
        tab_name: friendlyName,  // Use friendly name for display
        referrer: document.referrer || null,
        device_type: deviceType
      })
    });
    
    if (!response.ok) {
      console.warn('Failed to track page view:', await response.text());
    }
  } catch (error) {
    // Fail silently - analytics shouldn't break the app
    console.warn('Analytics tracking error:', error.message);
  }
};

// Track click event
export const trackClick = async (elementId, elementType, moduleName, action, metadata = {}) => {
  try {
    const sessionId = getSessionId();
    const token = getAuthToken();
    const friendlyName = getFriendlyTabName(moduleName);
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/api/analytics/track/click`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        session_id: sessionId,
        element_id: elementId,
        element_type: elementType,
        module_name: friendlyName,  // Use friendly name for display
        action: action,
        metadata: metadata
      })
    });
    
    if (!response.ok) {
      console.warn('Failed to track click:', await response.text());
    }
  } catch (error) {
    console.warn('Click tracking error:', error.message);
  }
};

// Wrapper for tracking button clicks
export const trackButtonClick = (buttonId, moduleName, action, metadata = {}) => {
  trackClick(buttonId, 'button', moduleName, action, metadata);
};

// Wrapper for tracking link clicks
export const trackLinkClick = (linkId, moduleName, destination, metadata = {}) => {
  trackClick(linkId, 'link', moduleName, 'navigate', { destination, ...metadata });
};

// Wrapper for tracking card clicks
export const trackCardClick = (cardId, moduleName, action, metadata = {}) => {
  trackClick(cardId, 'card', moduleName, action, metadata);
};

// Wrapper for tracking tab changes
export const trackTabChange = (tabName) => {
  trackPageView(tabName);
  trackClick(`tab-${tabName}`, 'tab', tabName, 'tab_switch');
};

// Wrapper for tracking calculator usage
export const trackCalculatorUse = (calculatorType, metadata = {}) => {
  trackClick(`calc-${calculatorType}`, 'calculator', calculatorType, 'calculate', metadata);
};

// Wrapper for tracking feature interactions
export const trackFeatureInteraction = (featureName, action, metadata = {}) => {
  trackClick(`feature-${featureName}`, 'feature', featureName, action, metadata);
};

// ============================
// AD TRACKING
// ============================

// Track ad impression (when ad is displayed)
export const trackAdImpression = async (adType, adPlacement, adUnitId = null) => {
  try {
    const sessionId = getSessionId();
    const token = getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/api/analytics/track/click`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        session_id: sessionId,
        element_id: adUnitId || `ad-${adType}-${adPlacement}`,
        element_type: 'ad',
        module_name: 'Advertisements',
        action: 'ad_impression',
        metadata: {
          ad_type: adType,  // banner, interstitial, rewarded, native
          ad_placement: adPlacement,  // top_banner, bottom_banner, post_calculation, etc.
          ad_unit_id: adUnitId
        }
      })
    });
    
    if (!response.ok) {
      console.warn('Failed to track ad impression:', await response.text());
    }
  } catch (error) {
    console.warn('Ad impression tracking error:', error.message);
  }
};

// Track ad click (when user clicks on ad)
export const trackAdClick = async (adType, adPlacement, adUnitId = null, destination = null) => {
  try {
    const sessionId = getSessionId();
    const token = getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/api/analytics/track/click`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        session_id: sessionId,
        element_id: adUnitId || `ad-${adType}-${adPlacement}`,
        element_type: 'ad',
        module_name: 'Ad Clicks',
        action: 'ad_click',
        metadata: {
          ad_type: adType,  // banner, interstitial, rewarded, native
          ad_placement: adPlacement,
          ad_unit_id: adUnitId,
          destination: destination
        }
      })
    });
    
    if (!response.ok) {
      console.warn('Failed to track ad click:', await response.text());
    }
  } catch (error) {
    console.warn('Ad click tracking error:', error.message);
  }
};

// Track rewarded ad completion
export const trackRewardedAdComplete = async (adPlacement, rewardType) => {
  try {
    const sessionId = getSessionId();
    const token = getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/api/analytics/track/click`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        session_id: sessionId,
        element_id: `rewarded-ad-${adPlacement}`,
        element_type: 'ad',
        module_name: 'Rewarded Ads',
        action: 'ad_reward_complete',
        metadata: {
          ad_type: 'rewarded',
          ad_placement: adPlacement,
          reward_type: rewardType  // bulk_run, cit_calc, etc.
        }
      })
    });
    
    if (!response.ok) {
      console.warn('Failed to track rewarded ad:', await response.text());
    }
  } catch (error) {
    console.warn('Rewarded ad tracking error:', error.message);
  }
};

// Track ad close/dismiss
export const trackAdDismiss = async (adType, adPlacement) => {
  try {
    const sessionId = getSessionId();
    const token = getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/api/analytics/track/click`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        session_id: sessionId,
        element_id: `ad-dismiss-${adType}-${adPlacement}`,
        element_type: 'ad',
        module_name: 'Ad Dismissals',
        action: 'ad_dismiss',
        metadata: {
          ad_type: adType,
          ad_placement: adPlacement
        }
      })
    });
    
    if (!response.ok) {
      console.warn('Failed to track ad dismiss:', await response.text());
    }
  } catch (error) {
    console.warn('Ad dismiss tracking error:', error.message);
  }
};

export default {
  trackPageView,
  trackClick,
  trackButtonClick,
  trackLinkClick,
  trackCardClick,
  trackTabChange,
  trackCalculatorUse,
  trackFeatureInteraction,
  // Ad tracking
  trackAdImpression,
  trackAdClick,
  trackRewardedAdComplete,
  trackAdDismiss,
  // Utilities
  getSessionId,
  getDeviceType,
  getFriendlyTabName
};
