import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const TrialContext = createContext();

export const useTrial = () => {
  const context = useContext(TrialContext);
  if (!context) {
    throw new Error('useTrial must be used within a TrialProvider');
  }
  return context;
};

export const TrialProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [trialStatus, setTrialStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  // Fetch trial status when user changes
  useEffect(() => {
    if (isAuthenticated && isAuthenticated()) {
      fetchTrialStatus();
    } else {
      setTrialStatus(null);
    }
  }, [user]);

  // Periodic check for trial expiry (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated || !isAuthenticated()) return;
    
    const interval = setInterval(() => {
      fetchTrialStatus();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user]);

  const fetchTrialStatus = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`${API_URL}/api/trial/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data;
      setTrialStatus(data);

      // Check if trial just expired (show modal once)
      if (data.trial_status === 'expired' && !sessionStorage.getItem('expiredModalShown')) {
        setShowExpiredModal(true);
        sessionStorage.setItem('expiredModalShown', 'true');
      }
    } catch (error) {
      console.error('Error fetching trial status:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const startTrial = async (trialType, tier = null) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Generate device fingerprint
      const deviceFingerprint = generateDeviceFingerprint();

      const requestData = {
        trial_type: trialType,
        device_fingerprint: deviceFingerprint
      };

      if (trialType === 'full_trial' && tier) {
        requestData.trial_tier = tier;
      }

      const response = await axios.post(`${API_URL}/api/trial/start`, requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTrialStatus(response.data);
      return response.data;
    } catch (error) {
      console.error('Error starting trial:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const endTrial = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.post(`${API_URL}/api/trial/end`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchTrialStatus();
    } catch (error) {
      console.error('Error ending trial:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const performDemoCalculation = async (calculationData) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_URL}/api/trial/demo-calculation`, calculationData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data;
    } catch (error) {
      console.error('Error performing demo calculation:', error);
      throw error;
    }
  };

  const checkFeatureAccess = (feature) => {
    if (!trialStatus) return false;

    // If in active trial, use trial features
    if (trialStatus.current_trial && trialStatus.days_remaining > 0) {
      return trialStatus.trial_features?.[feature] || false;
    }

    // Otherwise, use regular subscription features
    // This would integrate with the existing subscription system
    return false;
  };

  const shouldShowTrialOffer = (feature) => {
    if (!trialStatus) return false;
    
    // Show trial offer if:
    // 1. User doesn't have access to the feature
    // 2. Trial is available (demo or full)
    // 3. Not currently in an active trial
    
    const hasAccess = checkFeatureAccess(feature);
    const trialAvailable = trialStatus.trial_available || trialStatus.demo_available;
    const inActiveTrial = trialStatus.current_trial && trialStatus.days_remaining > 0;
    
    return !hasAccess && trialAvailable && !inActiveTrial;
  };

  const generateDeviceFingerprint = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Fingerprint', 2, 2);
      
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvas.toDataURL()
      ].join('|');
      
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36);
    } catch (error) {
      return Math.random().toString(36).substr(2, 9);
    }
  };

  // Paystack payment initialization for trial
  const initializeTrialPayment = async (email, fullName, trialTier = 'pro') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const callbackUrl = `${window.location.origin}/payment/callback`;
      
      const response = await axios.post(`${API_URL}/api/trial/initialize-payment`, {
        email,
        full_name: fullName,
        trial_tier: trialTier,
        callback_url: callbackUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data;
    } catch (error) {
      console.error('Error initializing trial payment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verify Paystack payment after redirect
  const verifyTrialPayment = async (reference) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_URL}/api/trial/verify-payment`, {
        reference
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh trial status after successful verification
      await fetchTrialStatus();
      
      return response.data;
    } catch (error) {
      console.error('Error verifying trial payment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check card verification status
  const checkCardStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/api/trial/card-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data;
    } catch (error) {
      console.error('Error checking card status:', error);
      return { has_verified_card: false };
    }
  };

  // Check if user has access to a specific feature
  const checkFeatureAccessAPI = async (feature) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { has_access: false, reason: 'not_authenticated' };
      
      const response = await axios.get(`${API_URL}/api/trial/check-access?feature=${feature}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return { has_access: false, reason: 'error' };
    }
  };

  // Helper function to get trial time remaining message
  const getTrialTimeMessage = () => {
    if (!trialStatus?.is_trial_active) return null;
    
    const days = trialStatus.days_remaining || 0;
    const hours = trialStatus.hours_remaining || 0;
    
    if (days > 1) {
      return `Trial ends in ${days} days`;
    } else if (days === 1) {
      return `Trial ends in 1 day`;
    } else if (hours > 1) {
      return `Trial ends in ${hours} hours`;
    } else if (hours === 1) {
      return `Trial ends in 1 hour`;
    } else {
      return `Trial ending soon`;
    }
  };

  // Check if user is in active trial
  const isInActiveTrial = () => {
    return trialStatus?.is_trial_active === true && trialStatus?.trial_status === 'active';
  };

  // Check if trial has expired
  const hasTrialExpired = () => {
    return trialStatus?.trial_status === 'expired';
  };

  // Check if trial has been converted to paid
  const hasTrialConverted = () => {
    return trialStatus?.trial_status === 'converted';
  };

  const value = {
    trialStatus,
    loading,
    showTrialModal,
    setShowTrialModal,
    showExpiredModal, 
    setShowExpiredModal,
    showUpgradePrompt,
    setShowUpgradePrompt,
    fetchTrialStatus,
    startTrial,
    endTrial,
    performDemoCalculation,
    checkFeatureAccess,
    shouldShowTrialOffer,
    // Paystack payment functions
    initializeTrialPayment,
    verifyTrialPayment,
    checkCardStatus,
    // New trial management functions
    checkFeatureAccessAPI,
    getTrialTimeMessage,
    isInActiveTrial,
    hasTrialExpired,
    hasTrialConverted
  };

  return (
    <TrialContext.Provider value={value}>
      {children}
    </TrialContext.Provider>
  );
};