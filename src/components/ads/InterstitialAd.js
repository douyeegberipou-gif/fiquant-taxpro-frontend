import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { trackAdImpression, trackAdClick, trackAdDismiss } from '../../services/analyticsService';

export const InterstitialAd = ({ isOpen, onClose, onCalculation }) => {
  const [shouldShow, setShouldShow] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (isOpen) {
      checkAndShowAd();
    }
  }, [isOpen]);

  useEffect(() => {
    if (shouldShow && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldShow, countdown]);

  const checkAndShowAd = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onClose();
        return;
      }

      // Record the calculation for ad frequency tracking
      const response = await axios.post(`${API_URL}/api/ads/calculation`, 
        { calculation_type: 'paye' }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.show_interstitial) {
        setShouldShow(true);
        recordImpression();
        // Track interstitial impression via analytics
        trackAdImpression('interstitial', 'post_calculation');
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error checking interstitial ad:', error);
      onClose();
    }
  };

  const recordImpression = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(`${API_URL}/api/ads/impression?ad_type=interstitial&ad_placement=post_calculation`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error recording ad impression:', error);
    }
  };

  const handleAdClick = async () => {
    // Track interstitial ad click via analytics
    trackAdClick('interstitial', 'post_calculation', null, 'professional_features');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(`${API_URL}/api/ads/impression?ad_type=interstitial&ad_placement=post_calculation&clicked=true`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error recording ad click:', error);
    }
  };

  const handleClose = () => {
    // Track ad dismiss via analytics
    trackAdDismiss('interstitial', 'post_calculation');
    
    setShouldShow(false);
    setCountdown(5);
    onClose();
  };

  if (!isOpen || !shouldShow) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={countdown === 0 ? handleClose : undefined}
      data-testid="interstitial-ad-overlay"
    >
      <div 
        className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        data-testid="interstitial-ad-content"
      >
        {/* Close button - only available after countdown */}
        {countdown === 0 && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
            data-testid="interstitial-close-btn"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        )}

        {/* Countdown indicator */}
        {countdown > 0 && (
          <div className="absolute top-4 right-4 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {countdown}s
          </div>
        )}

        {/* Ad Content */}
        <div className="p-6 text-center">
          <div className="mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"></path>
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Professional Tax Management
          </h2>
          
          <p className="text-gray-600 mb-6">
            Streamline your tax processes with advanced features and expert guidance. 
            Perfect for businesses handling complex tax requirements.
          </p>

          <button
            onClick={handleAdClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            data-testid="interstitial-cta-btn"
          >
            Discover Professional Features
          </button>

          <p className="text-xs text-gray-400 mt-4">
            Advertisement • Supporting free access to tax calculators
          </p>
        </div>
      </div>
    </div>
  );
};
