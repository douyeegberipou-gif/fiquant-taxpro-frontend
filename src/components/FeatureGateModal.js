import React from 'react';
import { X, FileText, Clock, BarChart3, Upload, Lock, Crown, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

/**
 * FeatureGateModal - Generic modal for locked features
 * Supports: PDF Export, Calculation History, Analytics, CSV Import
 */

const featureConfigs = {
  pdf_export: {
    icon: FileText,
    title: 'PDF Export is a Pro Feature',
    description: 'Save and share professional PDF reports of your calculations.',
    minimumTier: 'Pro',
    gradient: 'from-blue-600 to-indigo-600',
    benefits: [
      'Download professional tax reports',
      'Share calculations with clients',
      'Audit-ready documentation',
      'Landscape format for Nigerian compliance'
    ]
  },
  calculation_history: {
    icon: Clock,
    title: 'Access Your Calculation History',
    description: 'Pro users get 90-day calculation history. Premium users get unlimited history.',
    minimumTier: 'Pro',
    gradient: 'from-emerald-600 to-teal-600',
    benefits: [
      'View past calculations anytime',
      'Track tax trends over time',
      'Re-download previous reports',
      'Compare calculations side-by-side'
    ]
  },
  analytics: {
    icon: BarChart3,
    title: 'Unlock Tax Analytics',
    description: 'Get insights into your tax calculations, trends, and planning opportunities.',
    minimumTier: 'Premium',
    gradient: 'from-purple-600 to-pink-600',
    benefits: [
      'Visual tax breakdown charts',
      'Monthly/yearly comparisons',
      'Tax optimization insights',
      'Export analytics reports'
    ]
  },
  csv_import: {
    icon: Upload,
    title: 'This is a Premium feature',
    description: "But we've got you covered! Upload employee data via Excel/CSV for faster bulk processing.",
    minimumTier: 'Premium',
    gradient: 'from-amber-500 to-orange-500',
    benefits: [
      'Bulk upload via Excel/CSV file',
      'Download pre-formatted template',
      'Process hundreds of employees instantly',
      'Auto-validation of data'
    ]
  }
};

const FeatureGateModal = ({ 
  isOpen, 
  onClose, 
  feature = 'pdf_export', // 'pdf_export' | 'calculation_history' | 'analytics' | 'csv_import'
  onStartTrial, 
  onViewPlans 
}) => {
  if (!isOpen) return null;

  const config = featureConfigs[feature] || featureConfigs.pdf_export;
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Header with glassmorphism style */}
        <div 
          className="px-6 py-8 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(50, 50, 50, 0.85) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Subtle gradient overlay for depth */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)'
            }}
          />
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {config.title}
            </h2>
            <p className="text-gray-300 text-sm">
              {config.description}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Benefits list */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 text-sm flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-amber-500" />
              What you'll get:
            </h4>
            <ul className="space-y-2">
              {config.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 mr-2 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Minimum tier badge */}
          <div className="bg-gray-50 rounded-lg p-3 mb-6 text-center">
            <p className="text-sm text-gray-600">
              Available in <span className="font-semibold text-gray-800">{config.minimumTier}</span> and above
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                onClose();
                onStartTrial && onStartTrial();
              }}
              className={`w-full bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white py-3 text-base font-semibold`}
              data-testid={`${feature}-gate-trial-btn`}
            >
              <Crown className="w-5 h-5 mr-2" />
              Try {config.minimumTier} Free for 7 Days
            </Button>
            
            <Button
              onClick={() => {
                onClose();
                onViewPlans && onViewPlans();
              }}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 text-base"
              data-testid={`${feature}-gate-plans-btn`}
            >
              View Plans
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureGateModal;
