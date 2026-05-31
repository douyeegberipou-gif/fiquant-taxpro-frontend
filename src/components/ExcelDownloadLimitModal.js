import React from 'react';
import { FileSpreadsheet, Crown, Zap, CheckCircle, X, ArrowRight, Shield, FileCheck } from 'lucide-react';

/**
 * ExcelDownloadLimitModal - Shown when users hit their monthly detailed Excel download limit
 * Tier limits: Free (1/mo), Starter (5/mo), Pro (15/mo), Premium/Enterprise (unlimited)
 */
const ExcelDownloadLimitModal = ({ 
  isOpen, 
  onClose, 
  currentTier = 'free',
  downloadsUsed = 0,
  downloadsLimit = 1,
  onUpgrade 
}) => {
  if (!isOpen) return null;

  const tierInfo = {
    free: { name: 'Free', limit: 0, color: 'gray' },
    starter: { name: 'Starter', limit: 1, color: 'emerald' },
    pro: { name: 'Pro', limit: 5, color: 'blue' },
    premium: { name: 'Premium', limit: 'Unlimited', color: 'yellow' },
    enterprise: { name: 'Enterprise', limit: 'Unlimited', color: 'purple' }
  };

  const currentTierInfo = tierInfo[currentTier] || tierInfo.free;
  const nextTier = currentTier === 'free' ? 'starter' : currentTier === 'starter' ? 'pro' : 'premium';
  const nextTierInfo = tierInfo[nextTier];

  const upgradeBenefits = [
    { icon: FileSpreadsheet, text: `${nextTierInfo.limit === 'Unlimited' ? 'Unlimited' : nextTierInfo.limit + '/month'} detailed Excel reports` },
    { icon: Shield, text: 'Tax audit-ready documentation' },
    { icon: FileCheck, text: 'Complete computation breakdowns' },
    { icon: CheckCircle, text: 'Legal references included' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors z-10"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>

        {/* Content */}
        <div className="p-6 pt-8">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                <FileSpreadsheet className="h-8 w-8 text-amber-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center border-2 border-gray-900">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white text-center mb-2">
            Monthly Download Limit Reached
          </h2>
          
          {/* Usage indicator */}
          <div className="flex justify-center mb-4">
            <div className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30">
              <p className="text-sm text-red-300">
                <span className="font-semibold">{downloadsUsed}</span> of{' '}
                <span className="font-semibold">{downloadsLimit}</span> downloads used this month
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-center text-sm mb-6">
            You've used all your detailed Excel report downloads for this month. 
            These audit-ready reports are essential for defending your tax computations 
            to the authorities.
          </p>

          {/* Benefits list */}
          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
            <p className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Upgrade to {nextTierInfo.name} for:
            </p>
            <ul className="space-y-2">
              {upgradeBenefits.map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                  <benefit.icon className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>{benefit.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Current plan indicator */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-xs text-gray-500">Current plan:</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-${currentTierInfo.color}-500/20 text-${currentTierInfo.color}-400`}>
              {currentTierInfo.name}
            </span>
            <ArrowRight className="h-3 w-3 text-gray-500" />
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-${nextTierInfo.color}-500/20 text-${nextTierInfo.color}-400`}>
              {nextTierInfo.name}
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={onUpgrade}
              className="w-full py-3 px-4 rounded-xl font-semibold text-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #eab308 50%, #fbbf24 100%)',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
              }}
            >
              <Zap className="h-5 w-5" />
              Upgrade to {nextTierInfo.name}
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Reset info */}
          <p className="text-center text-xs text-gray-500 mt-4">
            Your download limit resets on the 1st of each month
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExcelDownloadLimitModal;
