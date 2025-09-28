import React, { createContext, useContext, useState, useEffect } from 'react';
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

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (isAuthenticated()) {
      fetchTrialStatus();
    }
  }, [user]);

  const fetchTrialStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/trial/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTrialStatus(response.data);

      // Check if trial just expired
      if (response.data.current_trial && response.data.days_remaining <= 0) {
        setShowExpiredModal(true);
      }
    } catch (error) {
      console.error('Error fetching trial status:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const value = {
    trialStatus,
    loading,
    showTrialModal,
    setShowTrialModal,
    showExpiredModal, 
    setShowExpiredModal,
    fetchTrialStatus,
    startTrial,
    endTrial,
    performDemoCalculation,
    checkFeatureAccess,
    shouldShowTrialOffer
  };

  return (
    <TrialContext.Provider value={value}>
      {children}
    </TrialContext.Provider>
  );
};