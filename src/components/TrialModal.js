import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { X, Clock, Star, Zap, CheckCircle, AlertTriangle, CreditCard, Shield, Lock, Loader2 } from 'lucide-react';

export const TrialModal = ({ isOpen, onClose, onTrialStarted, userEmail, userName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trialStatus, setTrialStatus] = useState(null);
  const [selectedTier, setSelectedTier] = useState('pro');
  const [step, setStep] = useState('select'); // 'select', 'card', 'processing', 'success'
  const [cardStatus, setCardStatus] = useState(null);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (isOpen) {
      fetchTrialStatus();
      checkCardStatus();
      setStep('select');
      setError(null);
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

  const checkCardStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/trial/card-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCardStatus(response.data);
    } catch (error) {
      console.error('Error checking card status:', error);
    }
  };

  const initializePaystackPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const callbackUrl = `${window.location.origin}/payment/callback`;

      const response = await axios.post(`${API_URL}/api/trial/initialize-payment`, {
        email: userEmail,
        full_name: userName || 'User',
        trial_tier: selectedTier,
        callback_url: callbackUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.authorization_url) {
        // Store reference in sessionStorage for callback verification
        sessionStorage.setItem('paystack_reference', response.data.reference);
        sessionStorage.setItem('trial_tier', selectedTier);
        
        // Redirect to Paystack payment page
        window.location.href = response.data.authorization_url;
      }
    } catch (error) {
      console.error('Error initializing payment:', error);
      setError(error.response?.data?.detail || 'Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = () => {
    // Check if user already has verified card
    if (cardStatus?.has_verified_card) {
      // Can start trial directly (this shouldn't happen normally)
      startTrialWithCard();
    } else {
      // Proceed to card verification
      setStep('card');
    }
  };

  const startTrialWithCard = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const deviceFingerprint = generateDeviceFingerprint();

      const response = await axios.post(`${API_URL}/api/trial/start`, {
        trial_type: 'full_trial',
        trial_tier: selectedTier,
        device_fingerprint: deviceFingerprint
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (onTrialStarted) {
        onTrialStarted(response.data);
      }

      setStep('success');
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error('Error starting trial:', error);
      setError(error.response?.data?.detail || 'Failed to start trial');
    } finally {
      setLoading(false);
    }
  };

  const generateDeviceFingerprint = () => {
    try {
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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
      data-testid="trial-modal"
    >
      <div 
        className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          backdropFilter: 'blur(20px)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 95, 70, 0.25) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors z-10"
          data-testid="close-trial-modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {step === 'select' && 'Start Your 7-Day Free Trial'}
              {step === 'card' && 'Add Payment Method'}
              {step === 'success' && 'Trial Activated!'}
            </h2>
            <p className="text-emerald-200">
              {step === 'select' && 'Full access to all premium features'}
              {step === 'card' && 'Secure card verification via Paystack'}
              {step === 'success' && 'Enjoy your premium features'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Step: Select Tier */}
          {step === 'select' && (
            <div className="space-y-4">
              {/* Trial already used */}
              {!trialStatus?.trial_available && !trialStatus?.demo_available && (
                <div className="text-center py-6">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Trial Already Used</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    You've already used your free trial. Upgrade to continue enjoying premium features.
                  </p>
                  <Button 
                    onClick={onClose}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                  >
                    View Pricing Plans
                  </Button>
                </div>
              )}

              {/* Trial available */}
              {trialStatus?.trial_available && (
                <>
                  {/* Pro Trial */}
                  <div 
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedTier === 'pro' ? 'ring-2 ring-emerald-400' : ''
                    }`} 
                    style={{ 
                      background: selectedTier === 'pro' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                      border: '1px solid ' + (selectedTier === 'pro' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255,255,255,0.1)')
                    }}
                    onClick={() => setSelectedTier('pro')}
                    data-testid="select-pro-tier"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">Pro Plan</h3>
                      <span className="text-xs bg-emerald-500/30 text-emerald-300 px-2 py-1 rounded-full">Best for SMEs</span>
                    </div>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-emerald-400 mr-2 flex-shrink-0" />
                        All calculators, unlimited
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-emerald-400 mr-2 flex-shrink-0" />
                        Bulk PAYE (50 staff, unlimited)
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-emerald-400 mr-2 flex-shrink-0" />
                        PDF export & reports
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-emerald-400 mr-2 flex-shrink-0" />
                        90-day calculation history
                      </li>
                    </ul>
                  </div>

                  {/* Premium Trial */}
                  <div 
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedTier === 'premium' ? 'ring-2 ring-amber-400' : ''
                    }`}
                    style={{ 
                      background: selectedTier === 'premium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.05)',
                      border: '1px solid ' + (selectedTier === 'premium' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255,255,255,0.1)')
                    }}
                    onClick={() => setSelectedTier('premium')}
                    data-testid="select-premium-tier"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">Premium Plan</h3>
                      <span className="text-xs bg-amber-500/30 text-amber-300 px-2 py-1 rounded-full">Most Popular</span>
                    </div>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-amber-400 mr-2 flex-shrink-0" />
                        Everything in Pro +
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-amber-400 mr-2 flex-shrink-0" />
                        Bulk PAYE (unlimited staff)
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-amber-400 mr-2 flex-shrink-0" />
                        CSV import for bulk processing
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-amber-400 mr-2 flex-shrink-0" />
                        Advanced analytics dashboard
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-amber-400 mr-2 flex-shrink-0" />
                        Unlimited calculation history
                      </li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleStartTrial}
                    disabled={loading}
                    className={`w-full font-semibold h-12 ${selectedTier === 'premium' 
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black' 
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
                    }`}
                    data-testid="continue-to-payment-btn"
                  >
                    Continue to Payment
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Step: Card Verification */}
          {step === 'card' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mr-3">
                    <CreditCard className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Card Verification Required</h3>
                    <p className="text-sm text-gray-400">One-time ₦50 verification fee</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start">
                    <Shield className="h-4 w-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Your card will be saved for future billing after trial</span>
                  </div>
                  <div className="flex items-start">
                    <Lock className="h-4 w-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>No charges during your 7-day trial period</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Cancel anytime before trial ends - no charges</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-300 text-center">
                  🔒 Secured by <strong>Paystack</strong> - PCI DSS Compliant
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('select')}
                  variant="outline"
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Back
                </Button>
                <Button
                  onClick={initializePaystackPayment}
                  disabled={loading}
                  className={`flex-1 font-semibold ${selectedTier === 'premium' 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black' 
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
                  }`}
                  data-testid="pay-with-paystack-btn"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    'Pay ₦50 & Start Trial'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">You're All Set!</h3>
              <p className="text-emerald-200 mb-4">
                Your 7-day {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} trial has started.
              </p>
              <p className="text-sm text-gray-400">
                Enjoy full access to all premium features.
              </p>
            </div>
          )}

          {/* Footer */}
          {step !== 'success' && (
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                Trial automatically expires after 7 days • Cancel anytime
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
