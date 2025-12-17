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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          <div className="text-center mb-6">
            <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Try Fiquant TaxPro</h2>
            <p className="text-gray-600">Experience premium features before you buy</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Demo Mode Option */}
            {trialStatus?.demo_available && (
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="font-semibold text-gray-900">Demo Mode</h3>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Free</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  One-time Pro-level calculation preview (no download)
                </p>
                <Button
                  onClick={() => startTrial('demo')}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  Try Demo
                </Button>
              </div>
            )}

            {/* Full Trial Options */}
            {trialStatus?.trial_available && (
              <>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Or start a 7-day full trial:</p>
                </div>

                {/* Pro Trial */}
                <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTier === 'pro' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                }`} onClick={() => setSelectedTier('pro')}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Pro Trial</h3>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">Best for SMEs</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1 mb-3">
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                      Bulk PAYE (15 staff, unlimited)
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                      All calculators + PDF export
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                      Save history & email notifications
                    </li>
                  </ul>
                </div>

                {/* Premium Trial */}
                <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTier === 'premium' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'
                }`} onClick={() => setSelectedTier('premium')}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Premium Trial</h3>
                    <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Most Popular</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1 mb-3">
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                      Everything in Pro +
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                      Bulk PAYE (50 staff) + Analytics
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                      Compliance assistance + API access
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={() => startTrial('full_trial', selectedTier)}
                  disabled={loading}
                  className={`w-full ${selectedTier === 'premium' 
                    ? 'bg-yellow-600 hover:bg-yellow-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Starting...' : `Start 7-Day ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Trial`}
                </Button>
              </>
            )}

            {/* No trials available */}
            {!trialStatus?.trial_available && !trialStatus?.demo_available && (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Trials Available</h3>
                <p className="text-gray-600 mb-4">You've already used your free trial. Upgrade to continue enjoying premium features.</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
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