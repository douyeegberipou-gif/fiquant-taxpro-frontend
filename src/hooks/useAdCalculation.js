import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureGate } from '../contexts/FeatureGateContext';

const STORAGE_KEY_CALC_COUNT = 'fiquant_calc_count';
const STORAGE_KEY_DATE = 'fiquant_calc_date';

// Configuration values
const GUEST_DAILY_LIMIT = 5;
const FREE_LOGGED_IN_DAILY_LIMIT = 15;

/**
 * Hook to manage ad-supported calculations for PAYE, CGT, VAT, CIT
 * 
 * Rules:
 * - Guest (not logged in): 1 free calculation per day, then VIDEO AD required
 * - Free tier (logged in): 15 free calculations per day, then UPGRADE PROMPT (no video ads)
 * - Pro/Premium/Enterprise: Unlimited, no ads or prompts
 */
export const useAdCalculation = (calculatorType = 'paye') => {
  const { user, isAuthenticated } = useAuth();
  const { getUserTier } = useFeatureGate();
  const [showAdModal, setShowAdModal] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [pendingCalculation, setPendingCalculation] = useState(null);
  const [calculationCount, setCalculationCount] = useState(0);

  const userTier = getUserTier ? getUserTier() : 'free';
  const isLoggedIn = isAuthenticated ? isAuthenticated() : false;
  const isPaidUser = userTier === 'pro' || userTier === 'premium' || userTier === 'enterprise';

  // Get daily limit based on user type
  const getDailyLimit = useCallback(() => {
    if (isPaidUser) return Infinity;
    if (!isLoggedIn) return GUEST_DAILY_LIMIT;
    return FREE_LOGGED_IN_DAILY_LIMIT;
  }, [isPaidUser, isLoggedIn]);

  // Get the storage key - use global key for logged-in users (counts across all calculators)
  const getStorageKey = useCallback(() => {
    // For logged-in users, use a global counter across all calculators
    if (isLoggedIn) {
      return `${STORAGE_KEY_CALC_COUNT}_user_global`;
    }
    // For guests, track per calculator type
    return `${STORAGE_KEY_CALC_COUNT}_guest_${calculatorType}`;
  }, [calculatorType, isLoggedIn]);

  const getDateKey = useCallback(() => {
    if (isLoggedIn) {
      return `${STORAGE_KEY_DATE}_user_global`;
    }
    return `${STORAGE_KEY_DATE}_guest_${calculatorType}`;
  }, [calculatorType, isLoggedIn]);

  // Initialize and load calculation count
  useEffect(() => {
    const loadCount = () => {
      const today = new Date().toDateString();
      const storedDate = localStorage.getItem(getDateKey());
      
      // Reset count if it's a new day
      if (storedDate !== today) {
        localStorage.setItem(getDateKey(), today);
        localStorage.setItem(getStorageKey(), '0');
        setCalculationCount(0);
      } else {
        const count = parseInt(localStorage.getItem(getStorageKey()) || '0', 10);
        setCalculationCount(count);
      }
    };
    
    loadCount();
  }, [getStorageKey, getDateKey]);

  // Check if limit is reached
  const isLimitReached = useCallback(() => {
    if (isPaidUser) return false;
    return calculationCount >= getDailyLimit();
  }, [isPaidUser, calculationCount, getDailyLimit]);

  // Determine if video ad is required (only for guests)
  const isVideoAdRequired = useCallback(() => {
    // Paid users never see video ads
    if (isPaidUser) return false;
    // Logged-in free users never see video ads
    if (isLoggedIn) return false;
    // Guest users: video ad after daily limit
    return calculationCount >= GUEST_DAILY_LIMIT;
  }, [isPaidUser, isLoggedIn, calculationCount]);

  // Determine if upgrade prompt should show (only for logged-in free users)
  const isUpgradePromptRequired = useCallback(() => {
    // Paid users never see upgrade prompts
    if (isPaidUser) return false;
    // Guests see video ads, not upgrade prompts
    if (!isLoggedIn) return false;
    // Logged-in free users: upgrade prompt after daily limit
    return calculationCount >= FREE_LOGGED_IN_DAILY_LIMIT;
  }, [isPaidUser, isLoggedIn, calculationCount]);

  // Get remaining free calculations
  const getRemainingFreeCalcs = useCallback(() => {
    if (isPaidUser) return Infinity;
    const limit = getDailyLimit();
    return Math.max(0, limit - calculationCount);
  }, [isPaidUser, calculationCount, getDailyLimit]);

  // Increment calculation count
  const incrementCount = useCallback(() => {
    const newCount = calculationCount + 1;
    setCalculationCount(newCount);
    localStorage.setItem(getStorageKey(), newCount.toString());
  }, [calculationCount, getStorageKey]);

  // Handle calculation request - call this instead of direct calculate
  const handleCalculateWithAd = useCallback((calculateFn) => {
    // Paid users: always calculate directly
    if (isPaidUser) {
      incrementCount();
      calculateFn();
      return;
    }

    // Check if limit reached
    if (!isLimitReached()) {
      // Under limit, run calculation directly
      incrementCount();
      calculateFn();
      return;
    }

    // Limit reached - determine which modal to show
    if (isLoggedIn) {
      // Logged-in free user: show upgrade prompt (NO video ad)
      setPendingCalculation(() => calculateFn);
      setShowUpgradePrompt(true);
    } else {
      // Guest user: show video ad modal
      setPendingCalculation(() => calculateFn);
      setShowAdModal(true);
    }
  }, [isPaidUser, isLimitReached, isLoggedIn, incrementCount]);

  // Called when video ad completes (guests only)
  const onAdComplete = useCallback(() => {
    incrementCount();
    if (pendingCalculation) {
      pendingCalculation();
      setPendingCalculation(null);
    }
    setShowAdModal(false);
  }, [incrementCount, pendingCalculation]);

  // Close video ad modal without completing
  const closeAdModal = useCallback(() => {
    setPendingCalculation(null);
    setShowAdModal(false);
  }, []);

  // Close upgrade prompt modal
  const closeUpgradePrompt = useCallback(() => {
    setPendingCalculation(null);
    setShowUpgradePrompt(false);
  }, []);

  return {
    // Video ad modal (guests only)
    showAdModal,
    setShowAdModal,
    onAdComplete,
    closeAdModal,
    
    // Upgrade prompt modal (logged-in free users only)
    showUpgradePrompt,
    setShowUpgradePrompt,
    closeUpgradePrompt,
    
    // Status flags
    isVideoAdRequired: isVideoAdRequired(),
    isUpgradePromptRequired: isUpgradePromptRequired(),
    isLimitReached: isLimitReached(),
    remainingFreeCalcs: getRemainingFreeCalcs(),
    dailyLimit: getDailyLimit(),
    
    // Main handler
    handleCalculateWithAd,
    
    // User info
    isPaidUser,
    isLoggedIn,
    calculationCount
  };
};

export default useAdCalculation;
