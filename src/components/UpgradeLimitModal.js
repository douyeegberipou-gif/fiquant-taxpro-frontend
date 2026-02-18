import React from 'react';
import { X, Zap, Crown, Clock } from 'lucide-react';
import { Button } from './ui/button';

/**
 * UpgradeLimitModal - Shows when logged-in Free users reach their daily calculation limit
 * This replaces video ads for logged-in users - shows a soft upgrade prompt instead
 */
const UpgradeLimitModal = ({ 
  isOpen, 
  onClose, 
  onStartTrial, 
  onViewPlans,
  calculatorType = 'calculation',
  dailyLimit = 15
}) => {
  if (!isOpen) return null;

  // Get midnight reset time
  const getMidnightReset = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    const hoursUntil = Math.ceil((midnight - now) / (1000 * 60 * 60));
    return hoursUntil;
  };

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
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)'
            }}
          />
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Daily Limit Reached
            </h2>
            <p className="text-gray-300 text-sm">
              You've used your {dailyLimit} free calculations today
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-gray-600 text-center mb-6">
            Upgrade for unlimited {calculatorType} calculations and access to premium features like PDF export and calculation history.
          </p>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                onClose();
                onStartTrial && onStartTrial();
              }}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 text-base font-semibold"
              data-testid="limit-modal-trial-btn"
            >
              <Crown className="w-5 h-5 mr-2" />
              Start 7-Day Free Trial
            </Button>
            
            <Button
              onClick={() => {
                onClose();
                onViewPlans && onViewPlans();
              }}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 text-base"
              data-testid="limit-modal-plans-btn"
            >
              View Plans
            </Button>
          </div>

          {/* Reset info */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-gray-400 text-xs flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Resets at midnight (~{getMidnightReset()} hours)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeLimitModal;
