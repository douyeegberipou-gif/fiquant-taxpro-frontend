import React from 'react';
import { useFeatureGate } from '../contexts/FeatureGateContext';
import { Lock, Crown, Star, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

export const FeatureGate = ({ 
  feature, 
  children, 
  fallback = null, 
  showUpgradePrompt = true,
  onUpgradeClick,
  className = ''
}) => {
  const { hasFeature, requiresUpgrade, getFeatureMessage } = useFeatureGate();

  if (hasFeature(feature)) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const upgradeRequired = requiresUpgrade(feature);
  const message = getFeatureMessage(feature);

  const tierIcons = {
    pro: Crown,
    premium: Star,
    enterprise: Star
  };

  const TierIcon = tierIcons[upgradeRequired] || Lock;
  const tierColors = {
    pro: 'text-blue-600 bg-blue-50 border-blue-200',
    premium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    enterprise: 'text-purple-600 bg-purple-50 border-purple-200'
  };

  const colorClass = tierColors[upgradeRequired] || 'text-gray-600 bg-gray-50 border-gray-200';

  return (
    <div className={`border rounded-lg p-4 ${colorClass} ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <TierIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium mb-1">
            {upgradeRequired ? `${upgradeRequired.charAt(0).toUpperCase() + upgradeRequired.slice(1)} Feature` : 'Premium Feature'}
          </h3>
          <p className="text-sm opacity-75 mb-3">
            {message}
          </p>
          <Button
            size="sm"
            onClick={onUpgradeClick}
            className={`${upgradeRequired === 'premium' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
          >
            Upgrade to {upgradeRequired ? upgradeRequired.charAt(0).toUpperCase() + upgradeRequired.slice(1) : 'Premium'}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const BulkLimitGate = ({ staffCount, children, onUpgradeClick }) => {
  const { getBulkLimits, hasFeature } = useFeatureGate();
  const limits = getBulkLimits();

  if (!limits.enabled) {
    return (
      <FeatureGate 
        feature="bulk_paye" 
        showUpgradePrompt={true}
      />
    );
  }

  if (staffCount > limits.maxStaff) {
    return (
      <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Lock className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-orange-800 mb-1">
              Staff Limit Exceeded
            </h3>
            <p className="text-sm text-orange-700 mb-3">
              You're trying to process {staffCount} staff members, but your plan allows up to {limits.maxStaff} staff per bulk calculation.
            </p>
            <Button
              size="sm"
              onClick={onUpgradeClick}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Upgrade for Higher Limits
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export const FeatureButton = ({ 
  feature, 
  children, 
  onClick, 
  onUpgradeClick,
  className = '',
  ...props 
}) => {
  const { hasFeature } = useFeatureGate();

  const handleClick = () => {
    if (hasFeature(feature)) {
      onClick?.();
    } else {
      onUpgradeClick?.();
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={className}
      {...props}
    >
      {!hasFeature(feature) && <Lock className="h-4 w-4 mr-2" />}
      {children}
    </Button>
  );
};