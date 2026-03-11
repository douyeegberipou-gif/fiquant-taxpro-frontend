import React from 'react';
import { X, Calendar, Users, Crown } from 'lucide-react';
import { Button } from './ui/button';

/**
 * BulkLimitModal - Shows when Free users reach their monthly bulk PAYE limit
 */
const BulkLimitModal = ({ 
  isOpen, 
  onClose, 
  onStartTrial, 
  onViewPlans,
  nextResetDate,
  limitType = 'monthly' // 'monthly' or 'staff'
}) => {
  if (!isOpen) return null;

  const isMonthlyLimit = limitType === 'monthly';

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
              {isMonthlyLimit ? (
                <Calendar className="w-8 h-8 text-white" />
              ) : (
                <Users className="w-8 h-8 text-white" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isMonthlyLimit ? 'Monthly Bulk Limit Reached' : 'Staff Limit Exceeded'}
            </h2>
            <p className="text-gray-300 text-sm">
              {isMonthlyLimit 
                ? "You've used your 3 bulk calculations this month"
                : "Your current plan has a staff limit per calculation"
              }
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-gray-600 text-center mb-6">
            {isMonthlyLimit 
              ? "Upgrade to Starter for unlimited bulk payroll processing with up to 10 staff per calculation, or Pro for 25 staff."
              : "Upgrade to Premium for unlimited staff per bulk calculation."
            }
          </p>

          {/* Feature comparison */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 text-sm">Bulk PAYE Limits by Plan:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Free</span>
                <span className="text-gray-800">10 staff, 3x/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pro</span>
                <span className="text-blue-600 font-medium">50 staff, unlimited</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Premium</span>
                <span className="text-amber-600 font-medium">Unlimited staff</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                onClose();
                onStartTrial && onStartTrial();
              }}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 text-base font-semibold"
              data-testid="bulk-limit-trial-btn"
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
              data-testid="bulk-limit-plans-btn"
            >
              View Plans
            </Button>
          </div>

          {/* Reset info */}
          {isMonthlyLimit && nextResetDate && (
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-gray-400 text-xs flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                Resets on {nextResetDate}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkLimitModal;
