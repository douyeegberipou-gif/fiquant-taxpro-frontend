import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const InactivityContext = createContext();

// Timeout durations in milliseconds
const TIMEOUT_DURATIONS = {
  guest_free: 15 * 60 * 1000,      // 15 minutes
  logged_in_free: 30 * 60 * 1000,  // 30 minutes
  free: 30 * 60 * 1000,            // 30 minutes
  pro: 30 * 60 * 1000,             // 30 minutes
  premium: 45 * 60 * 1000,         // 45 minutes
  enterprise: 60 * 60 * 1000,      // 60 minutes
};

const FIRST_WARNING_THRESHOLD = 0.80;  // 80%
const FINAL_WARNING_THRESHOLD = 0.95;  // 95%
const GRACE_PERIOD = 5 * 60 * 1000;    // 5 minutes
const THROTTLE_INTERVAL = 30 * 1000;   // 30 seconds for mouse/scroll

export const InactivityProvider = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  
  const [lastActivity, setLastActivity] = useState(() => Date.now());
  const [showFirstWarning, setShowFirstWarning] = useState(false);
  const [showFinalWarning, setShowFinalWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasUnsavedWork, setHasUnsavedWork] = useState(false);
  const [graceGranted, setGraceGranted] = useState(false);
  const [firstWarningDismissed, setFirstWarningDismissed] = useState(false);
  const [showLoggedOutModal, setShowLoggedOutModal] = useState(false);
  
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const lastThrottledActivity = useRef(0);
  const broadcastChannel = useRef(null);
  const handleLogoutRef = useRef(null);

  // Get timeout duration based on user tier
  const getTimeoutDuration = useCallback(() => {
    if (!isAuthenticated()) {
      return TIMEOUT_DURATIONS.guest_free;
    }
    const tier = user?.account_tier?.toLowerCase() || 'free';
    return TIMEOUT_DURATIONS[tier] || TIMEOUT_DURATIONS.logged_in_free;
  }, [isAuthenticated, user]);

  // Initialize BroadcastChannel for multi-tab sync
  useEffect(() => {
    try {
      broadcastChannel.current = new BroadcastChannel('fiquant_session_channel');
      
      broadcastChannel.current.onmessage = (event) => {
        const { type, timestamp } = event.data;
        
        switch (type) {
          case 'activity':
            // Another tab had activity - reset our timer
            setLastActivity(timestamp || Date.now());
            setShowFirstWarning(false);
            setShowFinalWarning(false);
            setFirstWarningDismissed(false);
            break;
          case 'logout':
            // Another tab logged out - only show modal if this tab is authenticated
            if (handleLogoutRef.current && isAuthenticated && isAuthenticated()) {
              handleLogoutRef.current(event.data.reason === 'inactivity');
            }
            break;
          case 'warning':
            // Sync warning state
            if (event.data.level === 'first' && !firstWarningDismissed) {
              setShowFirstWarning(true);
            } else if (event.data.level === 'final') {
              setShowFinalWarning(true);
            }
            break;
          default:
            break;
        }
      };
    } catch (e) {
      // Fallback to localStorage for browsers without BroadcastChannel
      console.log('BroadcastChannel not supported, using localStorage fallback');
    }
    
    return () => {
      broadcastChannel.current?.close();
    };
  }, [firstWarningDismissed]);

  // Broadcast activity to other tabs
  const broadcastActivity = useCallback(() => {
    try {
      broadcastChannel.current?.postMessage({
        type: 'activity',
        timestamp: Date.now()
      });
      // LocalStorage fallback
      localStorage.setItem('fiquant_session_activity', Date.now().toString());
    } catch (e) {
      // Silent fail
    }
  }, []);

  // Broadcast logout to other tabs
  const broadcastLogout = useCallback((reason) => {
    try {
      broadcastChannel.current?.postMessage({
        type: 'logout',
        reason
      });
      localStorage.setItem('fiquant_session_logout', Date.now().toString());
    } catch (e) {
      // Silent fail
    }
  }, []);

  // Reset inactivity timer
  const resetTimer = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);
    setShowFirstWarning(false);
    setShowFinalWarning(false);
    setFirstWarningDismissed(false);
    setGraceGranted(false);
    broadcastActivity();
  }, [broadcastActivity]);

  // Handle activity events
  const handleActivity = useCallback((throttled = false) => {
    if (isProcessing) return; // Don't reset during active processing
    
    // If a warning is showing, DON'T reset on any activity
    // User must click "Stay Logged In" button to dismiss
    if (showFirstWarning || showFinalWarning) {
      return;
    }
    
    const now = Date.now();
    
    if (throttled) {
      // For mouse/scroll - throttle to once every 30 seconds
      if (now - lastThrottledActivity.current < THROTTLE_INTERVAL) {
        return;
      }
      lastThrottledActivity.current = now;
    }
    
    resetTimer();
  }, [isProcessing, resetTimer, showFirstWarning, showFinalWarning]);

  // Handle logout
  const handleLogout = useCallback(async (isAutoLogout = false) => {
    // Capture auth state before logout clears it
    const wasAuthenticated = isAuthenticated();
    
    // Clear timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    // Broadcast to other tabs
    broadcastLogout(isAutoLogout ? 'inactivity' : 'manual');
    
    // Clear warnings
    setShowFirstWarning(false);
    setShowFinalWarning(false);
    
    // Perform logout
    if (logout) {
      await logout();
    }
    
    // Clear sensitive data
    sessionStorage.clear();
    
    // Show logged-out modal instead of redirecting for auto-logout
    // Only show if user was actually authenticated (prevents ghost modals for guests)
    if (isAutoLogout && wasAuthenticated) {
      setShowLoggedOutModal(true);
    }
  }, [isAuthenticated, logout, broadcastLogout]);

  // Keep ref updated for use in effect
  useEffect(() => {
    handleLogoutRef.current = handleLogout;
  }, [handleLogout]);

  // Stay logged in action
  const stayLoggedIn = useCallback(() => {
    resetTimer();
    setShowFirstWarning(false);
    setShowFinalWarning(false);
  }, [resetTimer]);

  // Dismiss first warning
  const dismissFirstWarning = useCallback(() => {
    setShowFirstWarning(false);
    setFirstWarningDismissed(true);
  }, []);

  // Dismiss logged-out modal
  const dismissLoggedOutModal = useCallback(() => {
    setShowLoggedOutModal(false);
  }, []);

  // Main inactivity check timer
  useEffect(() => {
    if (!isAuthenticated()) {
      // Still track for guests but with shorter timeout
    }
    
    timerRef.current = setInterval(() => {
      if (isProcessing) return; // Skip check during processing
      
      const now = Date.now();
      const elapsed = now - lastActivity;
      const timeout = getTimeoutDuration();
      const effectiveTimeout = (hasUnsavedWork && !graceGranted && showFinalWarning) 
        ? timeout + GRACE_PERIOD 
        : timeout;
      
      const percentElapsed = elapsed / effectiveTimeout;
      const remaining = effectiveTimeout - elapsed;
      
      setRemainingTime(Math.max(0, remaining));
      
      // Check thresholds
      if (percentElapsed >= 1) {
        // Time's up - only auto-logout authenticated users
        if (isAuthenticated()) {
          handleLogout(true);
        } else {
          // Guest timeout - just reset the timer silently
          setLastActivity(Date.now());
          setShowFirstWarning(false);
          setShowFinalWarning(false);
        }
      } else if (isAuthenticated() && percentElapsed >= FINAL_WARNING_THRESHOLD && !showFinalWarning) {
        // Show final warning — only for authenticated users
        setShowFinalWarning(true);
        setShowFirstWarning(false);
        
        // Grant grace period if has unsaved work
        if (hasUnsavedWork && !graceGranted) {
          setGraceGranted(true);
        }
        
        broadcastChannel.current?.postMessage({
          type: 'warning',
          level: 'final',
          remaining_seconds: Math.floor(remaining / 1000)
        });
      } else if (isAuthenticated() && percentElapsed >= FIRST_WARNING_THRESHOLD && !showFirstWarning && !firstWarningDismissed && !showFinalWarning) {
        // Show first warning — only for authenticated users
        setShowFirstWarning(true);
        
        broadcastChannel.current?.postMessage({
          type: 'warning',
          level: 'first',
          remaining_seconds: Math.floor(remaining / 1000)
        });
      }
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAuthenticated, lastActivity, isProcessing, hasUnsavedWork, graceGranted, showFinalWarning, showFirstWarning, firstWarningDismissed, getTimeoutDuration, handleLogout]);

  // Set up activity event listeners
  useEffect(() => {
    // Events that reset timer immediately
    const immediateEvents = ['keydown', 'click', 'focus', 'change', 'touchstart'];
    
    // Events that are throttled
    const throttledEvents = ['mousemove', 'scroll', 'resize'];
    
    const handleImmediate = () => handleActivity(false);
    const handleThrottled = () => handleActivity(true);
    
    immediateEvents.forEach(event => {
      document.addEventListener(event, handleImmediate, { passive: true });
    });
    
    throttledEvents.forEach(event => {
      document.addEventListener(event, handleThrottled, { passive: true });
    });
    
    // LocalStorage event for cross-tab sync fallback
    const handleStorageChange = (e) => {
      if (e.key === 'fiquant_session_activity') {
        setLastActivity(parseInt(e.newValue) || Date.now());
        setShowFirstWarning(false);
        setShowFinalWarning(false);
      }
      if (e.key === 'fiquant_session_logout' && isAuthenticated()) {
        handleLogout(true);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      immediateEvents.forEach(event => {
        document.removeEventListener(event, handleImmediate);
      });
      throttledEvents.forEach(event => {
        document.removeEventListener(event, handleThrottled);
      });
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleActivity, handleLogout]);

  const value = {
    // State
    lastActivity,
    remainingTime,
    showFirstWarning,
    showFinalWarning,
    showLoggedOutModal,
    isProcessing,
    hasUnsavedWork,
    graceGranted,
    
    // Actions
    resetTimer,
    stayLoggedIn,
    dismissFirstWarning,
    dismissLoggedOutModal,
    handleLogout,
    setIsProcessing,
    setHasUnsavedWork,
    
    // Utils
    getTimeoutDuration,
    formatRemainingTime: () => {
      if (!remainingTime) return '00:00';
      const minutes = Math.floor(remainingTime / 60000);
      const seconds = Math.floor((remainingTime % 60000) / 1000);
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    },
    getRemainingMinutes: () => {
      if (!remainingTime) return 0;
      return Math.ceil(remainingTime / 60000);
    }
  };

  return (
    <InactivityContext.Provider value={value}>
      {children}
    </InactivityContext.Provider>
  );
};

export const useInactivity = () => {
  const context = useContext(InactivityContext);
  if (!context) {
    throw new Error('useInactivity must be used within an InactivityProvider');
  }
  return context;
};

export default InactivityContext;
