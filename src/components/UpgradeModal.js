import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { 
  X, CheckCircle, Crown, Zap, Building2, CreditCard, 
  Shield, Lock, Loader2, AlertTriangle, Calendar, ArrowRight 
} from 'lucide-react';

export const UpgradeModal = ({ isOpen, onClose, onUpgradeSuccess, savedCard }) => {
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [step, setStep] = useState('select'); // 'select', 'confirm', 'processing', 'success'
  const [cardInfo, setCardInfo] = useState(null);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
      fetchCardInfo();
      setStep('select');
      setError(null);
    }
  }, [isOpen]);

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
      const response = await axios.post(`${API_URL}/api/subscription/upgrade`, {
        plan_id: selectedPlan,
        billing_cycle: billingCycle,
        use_saved_card: cardInfo?.has_verified_card || false
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'payment_required' && response.data.authorization_url) {
        // Redirect to Paystack for payment
        sessionStorage.setItem('subscription_plan', selectedPlan);
        sessionStorage.setItem('subscription_cycle', billingCycle);
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
      }
    } catch (error) {
      console.error('Error upgrading:', error);
      setError(error.response?.data?.detail || 'Failed to process upgrade. Please try again.');
      setStep('select');
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
      data-testid="upgrade-modal"
    >
      <div 
        className="relative w-full max-w-2xl mx-4 rounded-2xl overflow-hidden bg-gray-900"
        onClick={(e) => e.stopPropagation()}
        style={{
          border: '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
          data-testid="close-upgrade-modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-center space-x-3">
            <Crown className="h-8 w-8" />
            <div>
              <h2 className="text-xl font-bold">Upgrade Your Plan</h2>
              <p className="text-emerald-100 text-sm">Unlock all premium features</p>
            </div>
          </div>
        </div>

        <div className="p-6">
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
                        ? 'bg-emerald-600 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      billingCycle === 'annual' 
                        ? 'bg-emerald-600 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Annual <span className="text-emerald-400 text-xs ml-1">Save 20%</span>
                  </button>
                </div>
              </div>

              {/* Plans */}
              {loadingPlans ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((plan) => {
                    // Define proper features based on plan type to match main pricing section
                    const planFeatures = {
                      pro: [
                        'All calculators, unlimited',
                        'Bulk PAYE (50 staff, unlimited)',
                        'PDF export & reports',
                        '90-day calculation history',
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
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        selectedPlan === plan.id 
                          ? 'ring-2 ring-emerald-400 bg-emerald-500/10' 
                          : 'bg-gray-800 hover:bg-gray-750'
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
                          <p className="text-xs text-emerald-400">
                            Billed {formatPrice(plan.price_annual)}/year
                          </p>
                        )}
                      </div>

                      <ul className="space-y-1 text-sm text-gray-300">
                        {features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle className="h-3 w-3 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
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
                <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 text-blue-400 mr-2" />
                    <span className="text-blue-300 text-sm">
                      Your card ending in <strong>{cardInfo.card_last_four}</strong> will be charged
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={() => setStep('confirm')}
                disabled={loading || !selectedPlan}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold h-12"
                data-testid="continue-to-confirm-btn"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-800">
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
                    <div className="flex justify-between text-emerald-400 text-sm">
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
                        <CreditCard className="h-4 w-4 mr-2" />
                        •••• {cardInfo.card_last_four}
                      </span>
                    ) : (
                      <span className="text-amber-400 text-sm">New card required</span>
                    )}
                  </div>

                  <div className="flex justify-between text-gray-300">
                    <span>Next billing date</span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-start">
                  <Shield className="h-4 w-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-emerald-300">
                    Cancel anytime. Your subscription will remain active until the end of your billing period.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('select')}
                  variant="outline"
                  className="flex-1 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                >
                  Back
                </Button>
                <Button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold"
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
          )}

          {/* Step: Processing */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-emerald-500" />
              <h3 className="text-xl font-semibold text-white mb-2">Processing Payment</h3>
              <p className="text-gray-400">Please wait while we process your payment...</p>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Upgrade Successful!</h3>
              <p className="text-emerald-200">
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
          <div className="px-6 pb-6">
            <p className="text-xs text-gray-500 text-center">
              🔒 Secured by Paystack • PCI DSS Compliant
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpgradeModal;
