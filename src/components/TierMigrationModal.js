import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { Button } from './ui/button';
import { 
  X, ArrowUp, ArrowDown, Shield, CreditCard, 
  Loader2, AlertTriangle, CheckCircle, Clock, ChevronRight
} from 'lucide-react';

const formatNaira = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const TierMigrationModal = ({ 
  isOpen, 
  onClose, 
  onMigrationSuccess,
  targetPlan = null,
  targetCycle = 'monthly',
  currentTier = 'free',
}) => {
  const [step, setStep] = useState('loading');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && targetPlan) {
      fetchPreview();
    }
  }, [isOpen, targetPlan, targetCycle]);

  const fetchPreview = async () => {
    try {
      setStep('loading');
      setError(null);
      const res = await api.get(`/api/subscription/migration-preview`, {
        params: { target_plan: targetPlan, target_cycle: targetCycle }
      });
      setPreview(res.data);
      setStep('confirm');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load migration details');
      setStep('error');
    }
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      const callbackUrl = `${window.location.origin}/subscription/callback`;
      const res = await api.post('/api/subscription/migrate', {
        target_plan: targetPlan,
        target_cycle: targetCycle,
        callback_url: callbackUrl,
      });

      if (res.data.status === 'payment_required' && res.data.authorization_url) {
        sessionStorage.setItem('subscription_plan', targetPlan);
        sessionStorage.setItem('subscription_cycle', targetCycle);
        window.location.href = res.data.authorization_url;
      } else if (res.data.status === 'success') {
        setPreview(prev => ({ ...prev, result: res.data }));
        setStep('success');
        if (onMigrationSuccess) onMigrationSuccess(res.data);
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 2500);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Migration failed. Please try again.');
      setStep('confirm');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isUpgrade = preview?.is_upgrade;
  const accentColor = isUpgrade ? '#EAB308' : '#60A5FA';
  const accentBg = isUpgrade ? 'rgba(234,179,8,0.12)' : 'rgba(96,165,250,0.12)';

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[9998]" style={{ backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div 
          className="max-w-md w-full rounded-2xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, rgba(30,41,59,0.97) 0%, rgba(15,23,42,0.95) 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10" data-testid="migration-close-btn">
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="px-6 pt-6 pb-4 text-center">
            <div className="flex justify-center mb-3">
              <img src="/fiquant-logo-bold-diamond.png" alt="Fiquant" className="w-12 h-12 object-contain" />
            </div>
            {step === 'loading' && (
              <h2 className="text-xl font-bold text-white">Calculating...</h2>
            )}
            {step === 'confirm' && preview && (
              <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                {isUpgrade ? <ArrowUp className="w-5 h-5" style={{ color: accentColor }} /> : <ArrowDown className="w-5 h-5" style={{ color: accentColor }} />}
                {isUpgrade ? 'Upgrade' : 'Downgrade'} to {preview.target_plan.name}
              </h2>
            )}
            {step === 'success' && (
              <h2 className="text-xl font-bold text-green-400 flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" /> {isUpgrade ? 'Upgrade' : 'Downgrade'} Complete!
              </h2>
            )}
            {step === 'error' && (
              <h2 className="text-xl font-bold text-red-400 flex items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Error
              </h2>
            )}
          </div>

          {/* Body */}
          <div className="px-6 pb-6">
            {step === 'loading' && (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mb-3" />
                <p className="text-gray-400 text-sm">Calculating proration...</p>
              </div>
            )}

            {step === 'error' && (
              <div className="text-center py-6">
                <p className="text-red-400 text-sm mb-4">{error}</p>
                <Button onClick={fetchPreview} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6">
                  Try Again
                </Button>
              </div>
            )}

            {step === 'confirm' && preview && (
              <>
                {/* Current → Target */}
                <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-400 mb-1">Current Plan</p>
                    <p className="text-sm font-bold text-white uppercase">{preview.current_plan.name}</p>
                    <p className="text-xs text-gray-400">{formatNaira(preview.current_plan.price_naira)}/{preview.current_plan.billing_cycle === 'annual' ? 'yr' : 'mo'}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 mx-2 flex-shrink-0" />
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-400 mb-1">New Plan</p>
                    <p className="text-sm font-bold uppercase" style={{ color: accentColor }}>{preview.target_plan.name}</p>
                    <p className="text-xs text-gray-400">{formatNaira(preview.target_plan.price_naira)}/{targetCycle === 'annual' ? 'yr' : 'mo'}</p>
                  </div>
                </div>

                {/* Proration breakdown */}
                <div className="rounded-xl p-4 mb-4" style={{ background: accentBg, border: `1px solid ${accentColor}33` }}>
                  {preview.proration.days_remaining > 0 && (
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300 flex items-center gap-1"><Clock className="w-3 h-3" /> Days remaining</span>
                      <span className="text-white font-medium">{preview.proration.days_remaining} days</span>
                    </div>
                  )}
                  {preview.proration.unused_credit_naira > 0 && (
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Unused credit</span>
                      <span className="text-green-400 font-medium">- {formatNaira(preview.proration.unused_credit_naira)}</span>
                    </div>
                  )}
                  {preview.proration.account_credit_naira > 0 && isUpgrade && (
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Account credit</span>
                      <span className="text-green-400 font-medium">- {formatNaira(preview.proration.credit_applied_naira)}</span>
                    </div>
                  )}
                  {!isUpgrade && preview.proration.downgrade_credit_naira > 0 && (
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Credit to account</span>
                      <span className="text-blue-400 font-medium">+ {formatNaira(preview.proration.downgrade_credit_naira)}</span>
                    </div>
                  )}

                  <div className="border-t border-white/10 mt-2 pt-2">
                    {isUpgrade ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-white font-semibold">Charge today</span>
                        <span className="text-white font-bold text-lg">{formatNaira(preview.proration.charge_today_naira)}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-sm">
                        <span className="text-white font-semibold">No charge today</span>
                        <span className="text-blue-400 font-bold">{formatNaira(0)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>Next renewal</span>
                    <span>{formatNaira(preview.proration.next_renewal_naira)}/{targetCycle === 'annual' ? 'yr' : 'mo'}</span>
                  </div>
                </div>

                {/* Features lost warning (downgrade) */}
                {!isUpgrade && preview.features_lost && preview.features_lost.length > 0 && (
                  <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <p className="text-red-400 text-xs font-medium mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> You will lose access to:
                    </p>
                    <ul className="space-y-1">
                      {preview.features_lost.map((f, i) => (
                        <li key={i} className="text-xs text-red-300/80 flex items-center gap-1">
                          <X className="w-3 h-3 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Features gained (upgrade) */}
                {isUpgrade && preview.target_plan.features && (
                  <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <p className="text-green-400 text-xs font-medium mb-2">You'll get access to:</p>
                    <ul className="space-y-1">
                      {preview.target_plan.features.slice(0, 5).map((f, i) => (
                        <li key={i} className="text-xs text-green-300/80 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {error && (
                  <p className="text-red-400 text-xs text-center mb-3">{error}</p>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="w-full font-semibold py-3 text-sm"
                    style={{ background: `linear-gradient(135deg, ${accentColor}, ${isUpgrade ? '#CA8A04' : '#3B82F6'})` }}
                    data-testid="migration-confirm-btn"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : isUpgrade ? (
                      <CreditCard className="w-4 h-4 mr-2" />
                    ) : (
                      <ArrowDown className="w-4 h-4 mr-2" />
                    )}
                    {loading ? 'Processing...' : isUpgrade ? `Confirm Upgrade` : `Confirm Downgrade`}
                  </Button>
                  <button
                    onClick={onClose}
                    className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
                    data-testid="migration-cancel-btn"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-center text-xs text-gray-500 mt-3 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" /> Secure payment via Paystack
                </p>
              </>
            )}

            {step === 'success' && preview?.result && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,197,94,0.15)' }}>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-white font-medium mb-2">{preview.result.message}</p>
                {preview.result.charged_naira > 0 && (
                  <p className="text-gray-400 text-sm">Charged: {formatNaira(preview.result.charged_naira)}</p>
                )}
                {preview.result.credit_stored_naira > 0 && (
                  <p className="text-blue-400 text-sm">Credit added: {formatNaira(preview.result.credit_stored_naira)}</p>
                )}
                <p className="text-gray-500 text-xs mt-3">Redirecting...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TierMigrationModal;
