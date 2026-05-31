import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { trackAdImpression, trackAdClick } from '../../services/analyticsService';

export const AdBanner = ({ placement = 'top', className = '' }) => {
  const [adConfig, setAdConfig] = useState(null);
  const [shouldShow, setShouldShow] = useState(false);
  
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    checkAdStatus();
  }, []);

  const checkAdStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // If no token (not logged in), show ads by default (free user)
      if (!token) {
        setShouldShow(true);
        // Track impression for non-logged in users too
        trackAdImpression('banner', `${placement}_banner`);
        return;
      }

      // If logged in, check their ad status (premium users won't see ads)
      const response = await axios.get(`${API_URL}/api/ads/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.ads_enabled) {
        setAdConfig(response.data.ad_config);
        setShouldShow(true);
        recordImpression();
        // Track impression via analytics
        trackAdImpression('banner', `${placement}_banner`, adConfig?.top_banner_unit);
      }
    } catch (error) {
      console.error('Error checking ad status:', error);
      // On error, show ads (safer to show than hide)
      setShouldShow(true);
      trackAdImpression('banner', `${placement}_banner`);
    }
  };

  const recordImpression = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(`${API_URL}/api/ads/impression?ad_type=banner&ad_placement=${placement}_banner`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error recording ad impression:', error);
    }
  };

  const handleAdClick = async () => {
    // Track ad click via analytics service
    trackAdClick('banner', `${placement}_banner`, adConfig?.top_banner_unit, 'external_link');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(`${API_URL}/api/ads/impression?ad_type=banner&ad_placement=${placement}_banner&clicked=true`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error recording ad click:', error);
    }
  };

  if (!shouldShow) return null;

  return (
    <div className={`w-full ${className}`}>
      <div 
        className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={handleAdClick}
        data-testid={`ad-banner-${placement}`}
      >
        {/* Mock Ad Content - In production, this would be replaced with real ad network code */}
        <div className="text-gray-600 text-sm mb-2">Advertisement</div>
        <div className="bg-blue-500 text-white p-3 rounded">
          <div className="text-lg font-semibold">Professional Tax Services</div>
          <div className="text-sm">Expert tax consultation and filing services</div>
          <div className="text-xs mt-1 opacity-75">Click to learn more</div>
        </div>
      </div>
    </div>
  );
};

export const TopBanner = ({ className }) => (
  <AdBanner placement="top" className={className} />
);

export const BottomBanner = ({ className }) => (
  <AdBanner placement="bottom" className={className} />
);
