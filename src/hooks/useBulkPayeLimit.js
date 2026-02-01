import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureGate } from '../contexts/FeatureGateContext';

const STORAGE_KEY_BULK_COUNT = 'fiquant_bulk_paye_count';
const STORAGE_KEY_BULK_MONTH = 'fiquant_bulk_paye_month';

// Configuration values
const FREE_BULK_MONTHLY_LIMIT = 3;
const FREE_BULK_STAFF_LIMIT = 10;
const PRO_BULK_STAFF_LIMIT = 50;

/**
 * Hook to manage Bulk PAYE monthly limits
 * 
 * Rules:
 * - Free tier: 10 staff max, 3 bulk calculations per month
 * - Pro tier: 50 staff max, unlimited calculations
 * - Premium/Enterprise: Unlimited staff, unlimited calculations
 */
export const useBulkPayeLimit = () => {
  const { user, isAuthenticated } = useAuth();
  const { getUserTier } = useFeatureGate();
  const [bulkCount, setBulkCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const userTier = getUserTier ? getUserTier() : 'free';
  const isLoggedIn = isAuthenticated ? isAuthenticated() : false;
  const isPaidUser = userTier === 'pro' || userTier === 'premium' || userTier === 'enterprise';
  const isPremiumPlus = userTier === 'premium' || userTier === 'enterprise';

  // Get staff limit based on tier
  const getStaffLimit = useCallback(() => {
    if (isPremiumPlus) return Infinity; // Unlimited for Premium+
    if (userTier === 'pro') return PRO_BULK_STAFF_LIMIT;
    return FREE_BULK_STAFF_LIMIT;
  }, [isPremiumPlus, userTier]);

  // Get monthly limit based on tier
  const getMonthlyLimit = useCallback(() => {
    if (isPaidUser) return Infinity; // Unlimited for paid users
    return FREE_BULK_MONTHLY_LIMIT;
  }, [isPaidUser]);

  // Get current month key (YYYY-MM format)
  const getCurrentMonthKey = useCallback(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // Initialize and load bulk count
  useEffect(() => {
    const loadCount = () => {
      const currentMonth = getCurrentMonthKey();
      const storedMonth = localStorage.getItem(STORAGE_KEY_BULK_MONTH);
      
      // Reset count if it's a new month
      if (storedMonth !== currentMonth) {
        localStorage.setItem(STORAGE_KEY_BULK_MONTH, currentMonth);
        localStorage.setItem(STORAGE_KEY_BULK_COUNT, '0');
        setBulkCount(0);
      } else {
        const count = parseInt(localStorage.getItem(STORAGE_KEY_BULK_COUNT) || '0', 10);
        setBulkCount(count);
      }
    };
    
    loadCount();
  }, [getCurrentMonthKey]);

  // Check if monthly limit is reached
  const isMonthlyLimitReached = useCallback(() => {
    if (isPaidUser) return false;
    return bulkCount >= FREE_BULK_MONTHLY_LIMIT;
  }, [isPaidUser, bulkCount]);

  // Check if staff count exceeds limit
  const isStaffLimitExceeded = useCallback((staffCount) => {
    const limit = getStaffLimit();
    return staffCount > limit;
  }, [getStaffLimit]);

  // Get remaining bulk calculations this month
  const getRemainingBulkCalcs = useCallback(() => {
    if (isPaidUser) return Infinity;
    return Math.max(0, FREE_BULK_MONTHLY_LIMIT - bulkCount);
  }, [isPaidUser, bulkCount]);

  // Increment bulk count
  const incrementBulkCount = useCallback(() => {
    const newCount = bulkCount + 1;
    setBulkCount(newCount);
    localStorage.setItem(STORAGE_KEY_BULK_COUNT, newCount.toString());
  }, [bulkCount]);

  // Get next month reset date
  const getNextResetDate = useCallback(() => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }, []);

  // Handle bulk calculation request
  const handleBulkCalculate = useCallback((staffCount, calculateFn, onStaffLimitExceeded, onMonthlyLimitReached) => {
    // Check staff limit first
    if (isStaffLimitExceeded(staffCount)) {
      onStaffLimitExceeded && onStaffLimitExceeded(getStaffLimit());
      return false;
    }

    // Check monthly limit for free users
    if (!isPaidUser && isMonthlyLimitReached()) {
      onMonthlyLimitReached && onMonthlyLimitReached();
      setShowLimitModal(true);
      return false;
    }

    // All checks passed, run calculation
    incrementBulkCount();
    calculateFn();
    return true;
  }, [isPaidUser, isStaffLimitExceeded, isMonthlyLimitReached, getStaffLimit, incrementBulkCount]);

  // Close limit modal
  const closeLimitModal = useCallback(() => {
    setShowLimitModal(false);
  }, []);

  return {
    bulkCount,
    staffLimit: getStaffLimit(),
    monthlyLimit: getMonthlyLimit(),
    remainingBulkCalcs: getRemainingBulkCalcs(),
    isMonthlyLimitReached: isMonthlyLimitReached(),
    isStaffLimitExceeded,
    handleBulkCalculate,
    incrementBulkCount,
    getNextResetDate,
    showLimitModal,
    setShowLimitModal,
    closeLimitModal,
    isPaidUser,
    isPremiumPlus,
    userTier
  };
};

export default useBulkPayeLimit;
