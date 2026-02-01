import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const NativeAd = ({ className = '' }) => {
  const [shouldShow, setShouldShow] = useState(false);
  
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    checkAdStatus();
  }, []);

  const checkAdStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/api/ads/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.ads_enabled) {
        setShouldShow(true);
        recordImpression();
      }
    } catch (error) {
      console.error('Error checking ad status:', error);
    }
  };

  const recordImpression = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(`${API_URL}/api/ads/impression?ad_type=native&ad_placement=info_page_native`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error recording ad impression:', error);
    }
  };

  const handleAdClick = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(`${API_URL}/api/ads/impression?ad_type=native&ad_placement=info_page_native&clicked=true`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error recording ad click:', error);
    }
  };

  if (!shouldShow) return null;

  return (
    <div className={`my-6 ${className}`}>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <div className="flex items-start">
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Sponsored Content</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600" onClick={handleAdClick}>
              Streamline Your Tax Processes with Professional Software
            </h3>
            <p className="text-gray-700 text-sm mb-3">
              Discover how modern tax management solutions can save time and ensure compliance with Nigerian tax regulations.
            </p>
            <button 
              onClick={handleAdClick}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Learn More →
            </button>
          </div>
          <div className="ml-4">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};