import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { X, Clock, Star, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

export const TrialModal = ({ isOpen, onClose, onTrialStarted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trialStatus, setTrialStatus] = useState(null);
  const [selectedTier, setSelectedTier] = useState('pro');

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (isOpen) {
      fetchTrialStatus();
    }
  }, [isOpen]);

  const fetchTrialStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/trial/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrialStatus(response.data);
    } catch (error) {
      console.error('Error fetching trial status:', error);
      setError('Failed to load trial information');
    }
  };

  const startTrial = async (trialType, tier = null) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      
      // Generate simple device fingerprint
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

      // Notify parent component
      if (onTrialStarted) {
        onTrialStarted(response.data);
      }

      onClose();
    } catch (error) {
      console.error('Error starting trial:', error);
      setError(error.response?.data?.detail || 'Failed to start trial');
    } finally {
      setLoading(false);
    }
  };

  const generateDeviceFingerprint = () => {
    // Simple browser fingerprinting
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md mx-4 rounded-lg"
        onClick={(e) => e.stopPropagation()}
        style={{
          backdropFilter: 'blur(16px)',
          background: 'rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-200 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          <div className="text-center mb-6">
            <img 
              src="/fiquant-logo-bold-diamond.png" 
              alt="Fiquant Logo" 
              className="w-16 h-16 object-contain mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-white mb-2">Try Fiquant TaxPro</h2>
            <p className="text-gray-200">Experience premium features before you buy</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Demo Mode Option */}
            {trialStatus?.demo_available && (
              <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-400 mr-2" />
                    <h3 className="font-semibold text-white">Demo Mode</h3>
                  </div>
                  <span className="text-sm text-green-400 font-medium">Free</span>
                </div>
                <p className="text-sm text-gray-200 mb-3">
                  One-time Pro-level calculation preview (no download)
                </p>
                <Button
                  onClick={() => startTrial('demo')}
                  disabled={loading}
                  variant="outline"
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Try Demo
                </Button>
              </div>
            )}

            {/* Full Trial Options */}
            {trialStatus?.trial_available && (
              <>
                <div className="text-center">
                  <p className="text-sm text-gray-200">Or start a 7-day full trial:</p>
                </div>

                {/* Pro Trial */}
                <div 
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedTier === 'pro' ? 'ring-2 ring-blue-500' : ''
                  }`} 
                  style={{ 
                    background: selectedTier === 'pro' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid ' + (selectedTier === 'pro' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255,255,255,0.1)')
                  }}
                  onClick={() => setSelectedTier('pro')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">Pro Trial</h3>
                    <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded">Best for SMEs</span>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1 mb-3">
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-400 mr-2" />
                      Bulk PAYE (15 staff, unlimited)
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-400 mr-2" />
                      All calculators + PDF export
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-400 mr-2" />
                      Save history & email notifications
                    </li>
                  </ul>
                </div>

                {/* Premium Trial */}
                <div 
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedTier === 'premium' ? 'ring-2 ring-yellow-500' : ''
                  }`}
                  style={{ 
                    background: selectedTier === 'premium' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid ' + (selectedTier === 'premium' ? 'rgba(234, 179, 8, 0.5)' : 'rgba(255,255,255,0.1)')
                  }}
                  onClick={() => setSelectedTier('premium')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">Premium Trial</h3>
                    <span className="text-xs bg-yellow-500/30 text-yellow-300 px-2 py-1 rounded">Most Popular</span>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1 mb-3">
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-400 mr-2" />
                      Everything in Pro +
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-400 mr-2" />
                      Bulk PAYE (50 staff) + Analytics
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-400 mr-2" />
                      Compliance assistance + API access
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={() => startTrial('full_trial', selectedTier)}
                  disabled={loading}
                  className={`w-full font-semibold ${selectedTier === 'premium' 
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                  }`}
                >
                  {loading ? 'Starting...' : `Start 7-Day ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Trial`}
                </Button>
              </>
            )}

            {/* No trials available */}
            {!trialStatus?.trial_available && !trialStatus?.demo_available && (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Trials Available</h3>
                <p className="text-gray-400 mb-4">You've already used your free trial. Upgrade to continue enjoying premium features.</p>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                  View Pricing Plans
                </Button>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              No credit card required • Cancel anytime during trial
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};