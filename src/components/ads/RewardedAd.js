import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Play, Gift, Clock } from 'lucide-react';
import { trackAdImpression, trackAdClick, trackRewardedAdComplete, trackAdDismiss } from '../../services/analyticsService';

export const RewardedAd = ({ isOpen, onClose, rewardType = 'bulk_run' }) => {
  const [loading, setLoading] = useState(false);
  const [adStatus, setAdStatus] = useState(null);
  const [watchingAd, setWatchingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (isOpen) {
      checkRewardedAdStatus();
      // Track rewarded ad prompt impression
      trackAdImpression('rewarded', 'rewarded_unlock');
    }
  }, [isOpen]);

  const checkRewardedAdStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/ads/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdStatus(response.data);
    } catch (error) {
      console.error('Error checking rewarded ad status:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestRewardedAd = async () => {
    // Track user clicking to start watching ad
    trackAdClick('rewarded', 'rewarded_unlock', null, 'start_watching');
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_URL}/api/ads/rewarded/request`, 
        { 
          reward_type: rewardType,
          ad_placement: 'rewarded_unlock'
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.ad_available) {
        startAdWatch();
      }
    } catch (error) {
      console.error('Error requesting rewarded ad:', error);
      alert(error.response?.data?.detail || 'Unable to load rewarded ad');
    } finally {
      setLoading(false);
    }
  };

  const startAdWatch = () => {
    setWatchingAd(true);
    setAdProgress(0);

    // Simulate 15-second ad watch
    const interval = setInterval(() => {
      setAdProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          completeAd();
          return 100;
        }
        return prev + (100 / 15); // 15 seconds total
      });
    }, 1000);
  };

  const completeAd = async () => {
    // Track rewarded ad completion via analytics
    trackRewardedAdComplete('rewarded_unlock', rewardType);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_URL}/api/ads/rewarded/complete`, 
        {
          user_id: JSON.parse(atob(token.split('.')[1])).user_id, // Extract user ID from JWT
          reward_type: rewardType,
          ad_network: 'mock',
          ad_unit_id: 'ca-app-pub-test/rewarded',
          reward_granted: true
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.reward_granted) {
        alert(`🎉 Reward granted! You now have an extra ${rewardType.replace('_', ' ')} available.`);
        onClose();
      }
    } catch (error) {
      console.error('Error completing rewarded ad:', error);
    }
  };

  const handleClose = () => {
    // Track ad dismiss via analytics
    trackAdDismiss('rewarded', 'rewarded_unlock');
    onClose();
  };

  if (!isOpen) return null;

  const rewardText = rewardType === 'bulk_run' 
    ? 'extra bulk PAYE calculation' 
    : 'extra CIT calculation';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
      data-testid="rewarded-ad-overlay"
    >
      <div 
        className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
        data-testid="rewarded-ad-content"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          data-testid="rewarded-close-btn"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          {!watchingAd ? (
            // Pre-ad screen
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="h-8 w-8 text-yellow-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Unlock Extra Feature</h2>
                <p className="text-gray-600">
                  Watch a short video to unlock one {rewardText}
                </p>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading...</p>
                </div>
              ) : (
                <>
                  {adStatus?.can_show_rewarded ? (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center text-blue-800">
                          <Clock className="h-4 w-4 mr-2" />
                          <span className="text-sm">
                            Rewarded ads remaining this week: {adStatus.rewarded_ads_remaining}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={requestRewardedAd}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center"
                        data-testid="watch-ad-btn"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Watch Ad for Reward
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-2">No rewarded ads available</p>
                      <p className="text-sm text-gray-500">
                        {adStatus?.ads_enabled 
                          ? 'You\'ve reached the weekly limit (2 ads)' 
                          : 'Upgrade to Pro for unlimited access'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            // Ad watching screen
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Play className="h-12 w-12 text-white" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Watching Advertisement
              </h3>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${adProgress}%` }}
                ></div>
              </div>

              <p className="text-sm text-gray-600">
                {Math.ceil(15 - (adProgress / 100 * 15))}s remaining
              </p>

              {adProgress >= 100 && (
                <div className="mt-4 text-green-600 font-medium">
                  ✅ Ad completed! Granting reward...
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Rewarded ads help keep Fiquant TaxPro free for everyone
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
