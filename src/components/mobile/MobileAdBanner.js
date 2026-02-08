import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { trackAdImpression, trackAdClick } from '../../services/analyticsService';

/**
 * Mobile Ad Banner Component
 * Shows ads for free users and guests only (feature gating)
 */
export const MobileAdBanner = ({ placement = 'top' }) => {
  const [shouldShow, setShouldShow] = useState(false);
  
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    checkAdStatus();
  }, []);

  const checkAdStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // If no token (not logged in), show ads (guest user)
      if (!token) {
        setShouldShow(true);
        trackAdImpression('mobile_banner', `mobile_${placement}_banner`);
        return;
      }

      // If logged in, check their ad status (Pro/Premium users won't see ads)
      const response = await axios.get(`${API_URL}/api/ads/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.ads_enabled) {
        setShouldShow(true);
        trackAdImpression('mobile_banner', `mobile_${placement}_banner`);
        recordImpression();
      }
    } catch (error) {
      console.error('Error checking ad status:', error);
      // On error, show ads (safer for monetization)
      setShouldShow(true);
      trackAdImpression('mobile_banner', `mobile_${placement}_banner`);
    }
  };

  const recordImpression = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(`${API_URL}/api/ads/impression?ad_type=mobile_banner&ad_placement=mobile_${placement}_banner`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error recording ad impression:', error);
    }
  };

  const handleAdClick = async () => {
    trackAdClick('mobile_banner', `mobile_${placement}_banner`, null, 'external_link');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(`${API_URL}/api/ads/impression?ad_type=mobile_banner&ad_placement=mobile_${placement}_banner&clicked=true`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error recording ad click:', error);
    }
  };

  if (!shouldShow) return null;

  const glassStyle = {
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)'
  };

  return (
    <div className="px-4 mb-4">
      <div 
        className="rounded-xl overflow-hidden"
        style={glassStyle}
        onClick={handleAdClick}
        data-testid={`mobile-ad-banner-${placement}`}
      >
        <div className="text-center text-[10px] text-gray-500 py-1 bg-black/20">
          Advertisement
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-3 text-white text-center cursor-pointer active:scale-98 transition-transform">
          <div className="text-sm font-semibold">Professional Tax Services</div>
          <div className="text-xs opacity-90">Expert tax consultation and filing services</div>
          <div className="text-[10px] mt-1 opacity-75">Click to learn more</div>
        </div>
      </div>
    </div>
  );
};

export default MobileAdBanner;
