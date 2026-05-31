import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { 
  X, CheckCircle, Crown, Zap, Building2, CreditCard, 
  Shield, Lock, Loader2, AlertTriangle, Calendar, ArrowRight 
} from 'lucide-react';

export const UpgradeModal = ({ isOpen, onClose, onUpgradeSuccess, savedCard, initialPlan = null, initialBillingCycle = 'monthly' }) => {
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(initialPlan || 'pro');
  const [billingCycle, setBillingCycle] = useState(initialBillingCycle);
  // Skip to 'confirm' step if initialPlan is provided (user already chose from pricing)
  const [step, setStep] = useState(initialPlan ? 'confirm' : 'select');
  const [cardInfo, setCardInfo] = useState(null);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
      fetchCardInfo();
      // If initialPlan is provided, skip to confirm step
      setStep(initialPlan ? 'confirm' : 'select');
      setSelectedPlan(initialPlan || 'pro');
      setBillingCycle(initialBillingCycle);
      setError(null);
    }
  }, [isOpen, initialPlan, initialBillingCycle]);

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await axios.get(`${API_URL}/api/subscription/plans`);
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Failed to load subscription plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchCardInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/trial/card-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCardInfo(response.data);
    } catch (error) {
      console.error('Error fetching card info:', error);
    }
  };

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      setError(null);
      setStep('processing');

      const token = localStorage.getItem('token');
      console.log('Upgrading with plan:', selectedPlan, 'cycle:', billingCycle, 'token exists:', !!token);
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      // Build callback URL using current origin
      const callbackUrl = `${window.location.origin}/subscription/callback`;
      
      const response = await axios.post(`${API_URL}/api/subscription/upgrade`, {
        plan_id: selectedPlan,
        billing_cycle: billingCycle,
        use_saved_card: cardInfo?.has_verified_card || false,
        callback_url: callbackUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Upgrade response:', response.data);

      if (response.data.status === 'payment_required' && response.data.authorization_url) {
        // Redirect to Paystack for payment
        sessionStorage.setItem('subscription_plan', selectedPlan);
        sessionStorage.setItem('subscription_cycle', billingCycle);
        console.log('Redirecting to Paystack:', response.data.authorization_url);
        window.location.href = response.data.authorization_url;
      } else if (response.data.status === 'success') {
        setStep('success');
        if (onUpgradeSuccess) {
          onUpgradeSuccess(response.data);
        }
        setTimeout(() => {
          onClose();
          window.location.reload(); // Refresh to update user tier
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Unexpected response from server');
      }
    } catch (error) {
      console.error('Error upgrading:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to process upgrade. Please try again.';
      setError(errorMessage);
      setStep('confirm'); // Stay on confirm step instead of going back to select
    } finally {
      setLoading(false);
    }
  };

  const getSelectedPlanDetails = () => {
    return plans.find(p => p.id === selectedPlan);
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
      data-testid="upgrade-modal"
    >
      <div 
        className="relative w-full max-w-2xl mx-4 my-4 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.98) 0%, rgba(15, 15, 15, 0.99) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(212, 175, 55, 0.1)'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
          data-testid="close-upgrade-modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header - Black/Gold theme */}
        <div className="bg-gradient-to-r from-gray-900 to-black p-6 text-white flex-shrink-0 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
              <Crown className="h-6 w-6 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Upgrade Your Plan</h2>
              <p className="text-gray-400 text-sm">Unlock all premium features</p>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-gray-900/50">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Step: Select Plan */}
          {step === 'select' && (
            <div className="space-y-4">
              {/* Billing Cycle Toggle */}
              <div className="flex justify-center mb-4">
                <div className="inline-flex bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      billingCycle === 'monthly' 
                        ? 'bg-yellow-500 text-black' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      billingCycle === 'annual' 
                        ? 'bg-yellow-500 text-black' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Annual <span className="text-yellow-400 text-xs ml-1">Save 20%</span>
                  </button>
                </div>
              </div>

              {/* Plans */}
              {loadingPlans ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((plan) => {
                    // Define proper features based on plan type to match main pricing section
                    const planFeatures = {
                      pro: [
                        'All calculators, unlimited',
                        'Deferred Tax Calculator (IAS 12)',
                        'Bulk PAYE (50 staff, unlimited)',
                        'PDF export & reports',
                        'Ad-free experience'
                      ],
                      premium: [
                        'Everything in Pro +',
                        'Bulk PAYE (unlimited staff)',
                        'CSV import for bulk processing',
                        'Advanced analytics dashboard',
                        'Unlimited calculation history'
                      ],
                      enterprise: [
                        'Everything in Premium +',
                        'White-label option',
                        'API access',
                        'Dedicated support',
                        'Custom integrations'
                      ]
                    };
                    
                    // Define base prices for discount display
                    const basePrices = {
                      pro: { monthly: 14999, annual: 14999 * 12 * 0.8 },
                      premium: { monthly: 29999, annual: 29999 * 12 * 0.8 },
                      enterprise: { monthly: null, annual: null }
                    };
                    
                    const features = planFeatures[plan.id] || plan.features.slice(0, 5);
                    const basePrice = basePrices[plan.id];
                    const currentPrice = billingCycle === 'annual' ? plan.price_annual / 12 : plan.price_monthly;
                    
                    return (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-xl cursor-pointer transition-all border ${
                        selectedPlan === plan.id 
                          ? 'ring-2 ring-yellow-400 bg-yellow-500/10 border-yellow-500/30' 
                          : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                      data-testid={`plan-${plan.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{plan.display_name}</h3>
                        {plan.id === 'premium' && (
                          <span className="text-xs bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      
                      <div className="mb-3">
                        {/* Struck-out base price for Pro and Premium */}
                        {basePrice?.monthly && (
                          <div className="text-gray-500 line-through text-sm mb-0.5">
                            ₦{basePrice.monthly.toLocaleString()}/month
                          </div>
                        )}
                        <span className="text-2xl font-bold text-white">
                          {formatPrice(currentPrice)}
                        </span>
                        <span className="text-gray-400 text-sm">/month</span>
                        {billingCycle === 'annual' && (
                          <p className="text-xs text-yellow-400">
                            Billed {formatPrice(plan.price_annual)}/year
                          </p>
                        )}
                      </div>

                      <ul className="space-y-1 text-sm text-gray-300">
                        {features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle className="h-3 w-3 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-xs">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )})}
                </div>
              )}

              {/* Saved Card Info */}
              {cardInfo?.has_verified_card && (
                <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 text-yellow-500 mr-2" />
                    <span className="text-yellow-300 text-sm">
                      Your card ending in <strong>{cardInfo.card_last_four}</strong> will be charged
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={() => setStep('confirm')}
                disabled={loading || !selectedPlan}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold h-12"
                data-testid="continue-to-confirm-btn"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            loadingPlans ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
              </div>
            ) : !getSelectedPlanDetails() ? (
              <div className="text-center py-4">
                <p className="text-red-400 mb-4">Plan not found. Please select a plan.</p>
                <Button
                  onClick={() => setStep('select')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Select Plan
                </Button>
              </div>
            ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <h3 className="font-semibold text-white mb-3">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-300">
                    <span>{getSelectedPlanDetails()?.display_name}</span>
                    <span>{billingCycle === 'annual' ? 'Annual' : 'Monthly'}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-300">
                    <span>Amount</span>
                    <span className="font-semibold text-white">
                      {formatPrice(
                        billingCycle === 'annual' 
                          ? getSelectedPlanDetails()?.price_annual 
                          : getSelectedPlanDetails()?.price_monthly
                      )}
                    </span>
                  </div>

                  {billingCycle === 'annual' && (
                    <div className="flex justify-between text-yellow-400 text-sm">
                      <span>You save</span>
                      <span>
                        {formatPrice(
                          (getSelectedPlanDetails()?.price_monthly * 12) - getSelectedPlanDetails()?.price_annual
                        )}
                      </span>
                    </div>
                  )}

                  <hr className="border-gray-700" />

                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Payment Method</span>
                    {cardInfo?.has_verified_card ? (
                      <span className="flex items-center text-white">
                        <CreditCard className="h-4 w-4 mr-2 text-yellow-500" />
                        •••• {cardInfo.card_last_four}
                      </span>
                    ) : (
                      <span className="text-yellow-400 text-sm">New card required</span>
                    )}
                  </div>

                  <div className="flex justify-between text-gray-300">
                    <span>Next billing date</span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-yellow-500" />
                      {new Date(Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start">
                  <Shield className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-200">
                    Cancel anytime. Your subscription will remain active until the end of your billing period.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('select')}
                  variant="outline"
                  className="flex-1 bg-transparent border-gray-600 text-white hover:bg-gray-800"
                >
                  Back
                </Button>
                <Button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
                  data-testid="confirm-upgrade-btn"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </span>
                  ) : cardInfo?.has_verified_card ? (
                    'Confirm & Pay'
                  ) : (
                    'Continue to Payment'
                  )}
                </Button>
              </div>
            </div>
            )
          )}

          {/* Step: Processing */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-yellow-500" />
              <h3 className="text-xl font-semibold text-white mb-2">Processing Payment</h3>
              <p className="text-gray-400">Redirecting to Paystack...</p>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Upgrade Successful!</h3>
              <p className="text-yellow-400">
                Welcome to {getSelectedPlanDetails()?.display_name}!
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Refreshing your account...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'success' && step !== 'processing' && (
          <div className="px-6 pb-6 border-t border-gray-800 pt-4">
            <p className="text-xs text-gray-500 text-center">
              <Lock className="h-3 w-3 inline mr-1" />
              Secured by Paystack • PCI DSS Compliant
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpgradeModal;
