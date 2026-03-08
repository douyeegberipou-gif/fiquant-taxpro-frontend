import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2, AlertTriangle, Crown, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

const SubscriptionCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    console.log('SubscriptionCallback mounted');
    console.log('API_URL:', API_URL);
    console.log('Search params:', Object.fromEntries(searchParams));
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const reference = searchParams.get('reference') || searchParams.get('trxref');
      
      console.log('Verifying payment with reference:', reference);
      setDebugInfo(`Reference: ${reference}`);
      
      if (!reference) {
        setStatus('error');
        setMessage('Payment reference not found. Please try again.');
        return;
      }

      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      if (!token) {
        setStatus('error');
        setMessage('Session expired. Please log in and try again.');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      console.log('Making API call to verify payment...');
      const response = await axios.post(
        `${API_URL}/api/subscription/verify-payment?reference=${reference}`, 
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Verification response:', response.data);

      if (response.data.status === 'success') {
        setStatus('success');
        setMessage(response.data.message || 'Your subscription has been activated!');
        setSubscriptionInfo({
          plan_name: response.data.plan_name,
          tier: response.data.tier,
          next_billing_date: response.data.next_billing_date
        });
        
        // Clear stored data
        sessionStorage.removeItem('subscription_plan');
        sessionStorage.removeItem('subscription_cycle');
        
        // Redirect to home after delay
        setTimeout(() => {
          navigate('/', { state: { subscriptionActivated: true } });
        }, 4000);
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Payment verification failed.');
      }
    } catch (error) {
      console.error('Subscription verification error:', error);
      setStatus('error');
      setMessage(error.response?.data?.detail || 'Failed to verify payment. Please contact support.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div 
        className="max-w-md w-full rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 175, 55, 0.1)'
        }}
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-gray-900 to-black px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <span className="text-white font-semibold">Fiquant TaxPro</span>
          </div>
        </div>

        <div className="p-8">
          {/* Verifying State */}
          {status === 'verifying' && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/30">
                <Loader2 className="h-10 w-10 text-yellow-500 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment</h2>
              <p className="text-gray-400">Please wait while we confirm your subscription...</p>
              <div className="mt-4 flex justify-center gap-1">
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full animate-pulse"></div>
                <div className="absolute inset-1 bg-gray-900 rounded-full flex items-center justify-center">
                  <Crown className="h-10 w-10 text-yellow-500" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-pulse" />
                <Sparkles className="absolute -bottom-1 -left-2 h-5 w-5 text-yellow-400 animate-pulse" style={{ animationDelay: '500ms' }} />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                Congratulations! 🎉
              </h2>
              <p className="text-yellow-400 font-medium mb-6">{message}</p>
              
              {subscriptionInfo && (
                <div className="bg-gray-800/50 rounded-xl p-4 mb-6 text-left border border-gray-700">
                  <h3 className="text-yellow-500 font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Subscription Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Plan:</span>
                      <span className="text-white font-medium">{subscriptionInfo.plan_name}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Tier:</span>
                      <span className="text-yellow-400 capitalize font-medium">{subscriptionInfo.tier}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Next Billing:</span>
                      <span className="text-white">{formatDate(subscriptionInfo.next_billing_date)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-sm text-gray-500 mb-4">Redirecting to dashboard in a moment...</p>
              
              <Button 
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
              >
                Go to Dashboard Now
              </Button>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30">
                <XCircle className="h-10 w-10 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Issue</h2>
              <p className="text-red-400 mb-6">{message}</p>
              
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-200 text-left">
                    If you were charged but see this error, please contact support at <strong>info@fiquanttaxpro.com</strong> with your payment reference.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="flex-1 bg-transparent border-gray-600 text-white hover:bg-gray-800"
                >
                  Go Home
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCallback;
