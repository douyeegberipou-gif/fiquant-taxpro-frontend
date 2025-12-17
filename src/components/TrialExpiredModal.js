import React from 'react';
import { Button } from './ui/button';
import { X, Clock, AlertTriangle, Star } from 'lucide-react';

export const TrialExpiredModal = ({ isOpen, onClose, onUpgrade, trialTier }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Trial Expired</h2>
            <p className="text-gray-600">
              Your {trialTier} trial has ended. Continue enjoying premium features by upgrading your account.
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-medium text-orange-900 mb-1">Limited Access</h3>
                <p className="text-sm text-orange-800">
                  You now have access to Free tier features only. Upgrade to restore full functionality.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onUpgrade}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
            >
              <Star className="h-4 w-4 mr-2" />
              Upgrade to {trialTier}
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Continue with Free Plan
            </Button>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500">
              All your data is safely stored and will be available when you upgrade
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};