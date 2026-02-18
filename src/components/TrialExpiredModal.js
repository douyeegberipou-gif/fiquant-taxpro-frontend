import React from 'react';
import { Button } from './ui/button';
import { X, Clock, AlertTriangle, Star } from 'lucide-react';

export const TrialExpiredModal = ({ isOpen, onClose, onUpgrade, trialTier }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md mx-4 rounded-lg"
        onClick={(e) => e.stopPropagation()}
        style={{
          backdropFilter: 'blur(16px)',
          background: 'rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-200 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 text-center">
          <div className="mb-6">
            <img 
              src="/fiquant-logo-bold-diamond.png" 
              alt="Fiquant Logo" 
              className="w-16 h-16 object-contain mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-white mb-2">Trial Expired</h2>
            <p className="text-gray-200">
              Your {trialTier} trial has ended. Continue enjoying premium features by upgrading your account.
            </p>
          </div>

          <div className="rounded-lg p-4 mb-6" style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-medium text-yellow-400 mb-1">Limited Access</h3>
                <p className="text-sm text-gray-200">
                  You now have access to Free tier features only. Upgrade to restore full functionality.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3"
            >
              <Star className="h-4 w-4 mr-2" />
              Upgrade to {trialTier}
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Continue with Free Plan
            </Button>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-300">
              All your data is safely stored and will be available when you upgrade
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};