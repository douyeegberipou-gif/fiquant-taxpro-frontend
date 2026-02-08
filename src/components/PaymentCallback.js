import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [trialInfo, setTrialInfo] = useState(null);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Get reference from URL or sessionStorage
      const reference = searchParams.get('reference') || sessionStorage.getItem('paystack_reference');
      
      if (!reference) {
        setStatus('error');
        setMessage('Payment reference not found. Please try again.');
        return;
      }

      const token = localStorage.getItem('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Please log in to complete your trial activation.');
        return;
      }

      const response = await axios.post(`${API_URL}/api/trial/verify-payment`, {
        reference
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        setStatus('success');
        setMessage(response.data.message);
        setTrialInfo({
          tier: response.data.tier,
          trial_start_date: response.data.trial_start_date,
          trial_end_date: response.data.trial_end_date
        });
        
        // Clear stored reference
        sessionStorage.removeItem('paystack_reference');
        sessionStorage.removeItem('trial_tier');
        
        // Redirect to dashboard after delay
        setTimeout(() => {
          navigate('/', { state: { trialActivated: true } });
        }, 3000);
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Payment verification failed.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('error');
      setMessage(error.response?.data?.detail || 'Failed to verify payment. Please contact support.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 flex items-center justify-center p-4">
      <div 
        className="max-w-md w-full rounded-2xl overflow-hidden"
        style={{
          backdropFilter: 'blur(20px)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 95, 70, 0.25) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div className="p-8">
          {/* Verifying State */}
          {status === 'verifying' && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment</h2>
              <p className="text-emerald-200">Please wait while we confirm your payment...</p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Trial Activated!</h2>
              <p className="text-emerald-200 mb-6">{message}</p>
              
              {trialInfo && (
                <div className="bg-white/10 rounded-xl p-4 mb-6 text-left">
                  <h3 className="text-white font-semibold mb-3">Trial Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Plan:</span>
                      <span className="text-emerald-400 font-medium capitalize">{trialInfo.tier}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Starts:</span>
                      <span className="text-white">{formatDate(trialInfo.trial_start_date)}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Ends:</span>
                      <span className="text-white">{formatDate(trialInfo.trial_end_date)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-sm text-gray-400 mb-4">Redirecting to dashboard...</p>
              
              <Button 
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
              >
                Go to Dashboard Now
              </Button>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Issue</h2>
              <p className="text-red-300 mb-6">{message}</p>
              
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-200 text-left">
                    If you were charged but see this error, please contact our support team at <strong>info@fiquanttaxpro.com</strong> with your payment reference.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Go Home
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
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

export default PaymentCallback;
