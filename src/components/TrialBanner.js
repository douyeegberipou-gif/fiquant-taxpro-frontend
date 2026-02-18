import React from 'react';
import { Clock, AlertTriangle, Crown, Zap, X } from 'lucide-react';
import { useTrial } from '../contexts/TrialContext';
import { Button } from './ui/button';

export const TrialBanner = ({ onUpgrade, onDismiss }) => {
  const { 
    trialStatus, 
    isInActiveTrial, 
    hasTrialExpired, 
    getTrialTimeMessage,
    setShowExpiredModal 
  } = useTrial();

  // Don't show if no trial status or already converted
  if (!trialStatus || trialStatus.trial_status === 'converted' || trialStatus.trial_status === 'inactive') {
    return null;
  }

  // Trial is active
  if (isInActiveTrial()) {
    const days = trialStatus.days_remaining || 0;
    const showWarning = trialStatus.show_expiry_warning || days <= 2;
    const tierName = trialStatus.current_trial?.trial_tier || 'Pro';

    return (
      <div 
        className={`w-full py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2 ${
          showWarning 
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
        }`}
        data-testid="trial-banner"
      >
        {showWarning ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          <Crown className="h-4 w-4" />
        )}
        
        <span>
          {showWarning ? (
            <>⚠️ {getTrialTimeMessage()} - </>
          ) : (
            <>{tierName.charAt(0).toUpperCase() + tierName.slice(1)} Trial Active • {getTrialTimeMessage()} • </>
          )}
          <button 
            onClick={onUpgrade}
            className="underline font-bold hover:no-underline"
          >
            Upgrade Now
          </button>
        </span>

        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="ml-2 opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  // Trial has expired
  if (hasTrialExpired()) {
    return (
      <div 
        className="w-full py-2 px-4 text-center text-sm font-medium bg-gradient-to-r from-red-500 to-rose-500 text-white flex items-center justify-center gap-2"
        data-testid="trial-expired-banner"
      >
        <AlertTriangle className="h-4 w-4" />
        <span>
          Your trial has expired. 
          <button 
            onClick={onUpgrade}
            className="underline font-bold hover:no-underline ml-1"
          >
            Upgrade to continue using premium features
          </button>
        </span>
      </div>
    );
  }

  return null;
};

// Compact version for mobile or smaller spaces
export const TrialBadge = ({ onClick }) => {
  const { trialStatus, isInActiveTrial, hasTrialExpired } = useTrial();

  if (!trialStatus) return null;

  if (isInActiveTrial()) {
    const days = trialStatus.days_remaining || 0;
    const showWarning = days <= 2;

    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
          showWarning 
            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
        }`}
        data-testid="trial-badge"
      >
        <Clock className="h-3 w-3" />
        <span>{days}d left</span>
      </button>
    );
  }

  if (hasTrialExpired()) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
        data-testid="trial-expired-badge"
      >
        <AlertTriangle className="h-3 w-3" />
        <span>Expired</span>
      </button>
    );
  }

  return null;
};

export default TrialBanner;
