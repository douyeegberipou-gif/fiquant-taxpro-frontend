import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const FeatureGateContext = createContext();

export const useFeatureGate = () => {
  const context = useContext(FeatureGateContext);
  if (!context) {
    throw new Error('useFeatureGate must be used within a FeatureGateProvider');
  }
  return context;
};

export const FeatureGateProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [featureAccess, setFeatureAccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_BACKEND_URL || 
  (process.env.NODE_ENV === 'development' ? 'http://localhost:8001' : '');

  useEffect(() => {
    if (isAuthenticated()) {
      fetchFeatureAccess();
    } else {
      // Reset for unauthenticated users
      setFeatureAccess(null);
    }
  }, [user]);

  const fetchFeatureAccess = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/auth/feature-access`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFeatureAccess(response.data);
    } catch (error) {
      console.error('Error fetching feature access:', error);
      setFeatureAccess(null);
    } finally {
      setLoading(false);
    }
  };

  // Feature checking functions
  const hasFeature = (feature) => {
    if (!featureAccess) return false;
    
    const featurePaths = {
      'bulk_paye': 'features.bulk_paye.enabled',
      'cit_calc': 'features.calculators.cit',
      'vat_calc': 'features.calculators.vat',
      'cgt_calc': 'features.calculators.cgt',
      'bulk_payment_processing': 'features.calculators.bulk_payment_processing',
      'pdf_export': 'features.exports.pdf_export',
      'calculation_history': 'features.exports.calculation_history',
      'advanced_analytics': 'features.premium_features.advanced_analytics',
      'compliance_assistance': 'features.premium_features.compliance_assistance',
      'api_access': 'features.premium_features.api_access',
      'priority_support': 'features.premium_features.priority_support',
      'ads_enabled': 'features.ads.ads_enabled',
      'tax_library': 'features.premium_features.tax_library'
    };

    const path = featurePaths[feature];
    if (!path) return false;

    return path.split('.').reduce((obj, key) => obj?.[key], featureAccess) || false;
  };

  const getBulkLimits = () => {
    if (!featureAccess?.features?.bulk_paye) {
      return { enabled: false, maxStaff: 0, monthlyLimit: 0 };
    }
    
    return {
      enabled: featureAccess.features.bulk_paye.enabled,
      maxStaff: featureAccess.features.bulk_paye.max_staff,
      monthlyLimit: featureAccess.features.bulk_paye.monthly_limit
    };
  };

  const getUserTier = () => {
    return featureAccess?.user_tier || 'free';
  };

  const requiresUpgrade = (feature) => {
    const tier = getUserTier();
    const hasAccess = hasFeature(feature);
    
    if (hasAccess) return false;

    // Feature-specific upgrade requirements
    // Updated: CGT is now FREE, CIT is PREMIUM only, VAT is PRO, Bulk Payments is PREMIUM, Tax Library is FREE (ad-supported)
    const upgradeRequirements = {
      'bulk_paye': tier === 'free' ? 'pro' : null,
      'cit_calc': ['free', 'pro'].includes(tier) ? 'premium' : null,  // CIT is Premium only
      'vat_calc': tier === 'free' ? 'pro' : null,
      'cgt_calc': null,  // CGT is now FREE for everyone
      'bulk_payment_processing': ['free', 'pro'].includes(tier) ? 'premium' : null,  // Premium only
      'pdf_export': tier === 'free' ? 'pro' : null,
      'calculation_history': tier === 'free' ? 'pro' : null,
      'advanced_analytics': ['free', 'pro'].includes(tier) ? 'premium' : null,
      'compliance_assistance': ['free', 'pro'].includes(tier) ? 'premium' : null,
      'api_access': ['free', 'pro'].includes(tier) ? 'premium' : null,
      'tax_library': null  // Tax Library is FREE for all (ad-supported for free tier)
    };

    return upgradeRequirements[feature];
  };

  const getFeatureMessage = (feature) => {
    const tier = getUserTier();
    const upgradeRequired = requiresUpgrade(feature);

    if (!upgradeRequired) return null;

    const messages = {
      'bulk_paye': `Bulk PAYE calculations require ${upgradeRequired.charAt(0).toUpperCase() + upgradeRequired.slice(1)} tier or higher.`,
      'cit_calc': `CIT calculator requires Premium tier.`,  // Updated message
      'vat_calc': `VAT calculator requires ${upgradeRequired.charAt(0).toUpperCase() + upgradeRequired.slice(1)} tier or higher.`,
      'cgt_calc': `CGT calculator is available for free!`,  // CGT is free now
      'bulk_payment_processing': `Bulk Payments Processing requires Premium tier.`,  // New message
      'pdf_export': `PDF export requires ${upgradeRequired.charAt(0).toUpperCase() + upgradeRequired.slice(1)} tier or higher.`,
      'calculation_history': `Calculation history requires ${upgradeRequired.charAt(0).toUpperCase() + upgradeRequired.slice(1)} tier or higher.`,
      'advanced_analytics': `Advanced analytics requires ${upgradeRequired.charAt(0).toUpperCase() + upgradeRequired.slice(1)} tier or higher.`,
      'compliance_assistance': `Compliance assistance requires ${upgradeRequired.charAt(0).toUpperCase() + upgradeRequired.slice(1)} tier or higher.`,
      'api_access': `API access requires ${upgradeRequired.charAt(0).toUpperCase() + upgradeRequired.slice(1)} tier or higher.`,
      'tax_library': `Tax Library is free for all users!`  // Tax Library is free (ad-supported)
    };

    return messages[feature] || `This feature requires ${upgradeRequired.charAt(0).toUpperCase() + upgradeRequired.slice(1)} tier or higher.`;
  };

  // API call functions with feature gating
  const callWithFeatureGate = async (feature, apiCall) => {
    if (!hasFeature(feature)) {
      const message = getFeatureMessage(feature);
      throw new Error(message);
    }

    return await apiCall();
  };

  const value = {
    featureAccess,
    loading,
    hasFeature,
    getBulkLimits,
    getUserTier,
    requiresUpgrade,
    getFeatureMessage,
    callWithFeatureGate,
    fetchFeatureAccess
  };

  return (
    <FeatureGateContext.Provider value={value}>
      {children}
    </FeatureGateContext.Provider>
  );
};