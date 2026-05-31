import React from 'react';
import { X, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

const MilestoneModal = ({
  isOpen,
  onClose,
  onPrimaryCTA,
  onSecondaryCTA,
  icon = '🎉',
  title,
  message,
  benefits = [],
  primaryCTAText = 'Start Free Trial',
  secondaryCTAText = 'Maybe Later',
  targetTier = 'starter'
}) => {
  if (!isOpen) return null;

  const getTierStyles = (tier) => {
    switch (tier) {
      case 'starter':
        return {
          primary: 'bg-emerald-600 hover:bg-emerald-700',
          secondary: 'border-emerald-500 text-emerald-400 hover:bg-emerald-500/10'
        };
      case 'pro':
        return {
          primary: 'bg-blue-600 hover:bg-blue-700',
          secondary: 'border-blue-500 text-blue-400 hover:bg-blue-500/10'
        };
      case 'premium':
        return {
          primary: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
          secondary: 'border-amber-500 text-amber-400 hover:bg-amber-500/10'
        };
      case 'enterprise':
        return {
          primary: 'bg-purple-600 hover:bg-purple-700',
          secondary: 'border-purple-500 text-purple-400 hover:bg-purple-500/10'
        };
      default:
        return {
          primary: 'bg-blue-600 hover:bg-blue-700',
          secondary: 'border-teal-500 text-teal-400 hover:bg-teal-500/10'
        };
    }
  };

  const styles = getTierStyles(targetTier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md rounded-2xl"
        style={{
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>

        {/* Content */}
        <div className="p-5 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-3">
            <img 
              src="/fiquant-logo-bold-diamond.png" 
              alt="Fiquant" 
              className="h-10 w-10 object-contain"
            />
          </div>
          
          {/* Brand */}
          <p className="text-white font-semibold text-sm mb-3">Fiquant TaxPro</p>

          {/* Milestone Icon */}
          <div className="text-4xl mb-3">
            {icon}
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white mb-2">
            {title}
          </h2>

          {/* Message */}
          <p className="text-gray-400 text-xs mb-4">
            {message}
          </p>

          {/* Benefits List */}
          {benefits.length > 0 && (
            <div className="text-left mb-4">
              <p className="text-gray-400 text-xs mb-2">Upgrade to unlock:</p>
              <ul className="space-y-1.5">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start text-xs">
                    <CheckCircle className="h-3.5 w-3.5 text-teal-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-white">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="space-y-2">
            <Button
              onClick={onPrimaryCTA}
              className={`w-full py-2.5 text-white font-semibold rounded-lg text-sm ${styles.primary}`}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {primaryCTAText}
            </Button>
            
            {secondaryCTAText && (
              <Button
                onClick={onSecondaryCTA || onClose}
                variant="ghost"
                className="w-full py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg text-sm"
              >
                {secondaryCTAText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneModal;
