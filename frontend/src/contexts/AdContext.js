import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const AdContext = createContext();

export const useAds = () => {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAds must be used within an AdProvider');
  }
  return context;
};

export const AdProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [adStatus, setAdStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [rewardType, setRewardType] = useState('bulk_run');

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (isAuthenticated()) {
      fetchAdStatus();
    }
  }, [user]);

  const fetchAdStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/ads/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAdStatus(response.data);
    } catch (error) {
      console.error('Error fetching ad status:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordCalculation = async (calculationType = 'paye') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { show_interstitial: false };

      const response = await axios.post(`${API_URL}/api/ads/calculation`, 
        { calculation_type: calculationType }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.show_interstitial) {
        setShowInterstitial(true);
      }

      return response.data;
    } catch (error) {
      console.error('Error recording calculation:', error);
      return { show_interstitial: false };
    }
  };

  const requestRewardedAd = async (type) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_URL}/api/ads/rewarded/request`, 
        { 
          reward_type: type,
          ad_placement: 'rewarded_unlock'
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.ad_available) {
        setRewardType(type);
        setShowRewardedAd(true);
      }

      return response.data;
    } catch (error) {
      console.error('Error requesting rewarded ad:', error);
      throw error;
    }
  };

  const useReward = async (type) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_URL}/api/ads/use-reward`, 
        null,
        { 
          params: { reward_type: type },
          headers: { Authorization: `Bearer ${token}` } 
        }
      );

      // Refresh ad status after using reward
      await fetchAdStatus();

      return response.data;
    } catch (error) {
      console.error('Error using reward:', error);
      throw error;
    }
  };

  const canShowAds = () => {
    // If not authenticated, show ads (free user)
    if (!isAuthenticated()) {
      return true;
    }
    // If authenticated, check their ad status
    return adStatus?.ads_enabled || false;
  };

  const canShowRewardedAds = () => {
    return adStatus?.can_show_rewarded || false;
  };

  const hasExtraRuns = () => {
    return (adStatus?.extra_runs_available || 0) > 0;
  };

  const hasExtraCitCalcs = () => {
    return (adStatus?.extra_cit_available || 0) > 0;
  };

  const getRemainingRewardedAds = () => {
    return adStatus?.rewarded_ads_remaining || 0;
  };

  const getCalculationsUntilInterstitial = () => {
    return adStatus?.calculations_until_interstitial || 0;
  };

  const value = {
    adStatus,
    loading,
    showInterstitial,
    setShowInterstitial,
    showRewardedAd,
    setShowRewardedAd,
    rewardType,
    setRewardType,
    fetchAdStatus,
    recordCalculation,
    requestRewardedAd,
    useReward,
    canShowAds,
    canShowRewardedAds,
    hasExtraRuns,
    hasExtraCitCalcs,
    getRemainingRewardedAds,
    getCalculationsUntilInterstitial
  };

  return (
    <AdContext.Provider value={value}>
      {children}
    </AdContext.Provider>
  );
};