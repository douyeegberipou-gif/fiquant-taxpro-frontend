import React, { useState } from 'react';
import { X, Crown, Sparkles, CreditCard, Mail, Check, ArrowRight, Shield } from 'lucide-react';
import { Button } from './ui/button';

/**
 * TrialSelectionModal - Allows users to choose between No-Card Trial (Pro) and Card-Verified Trial (Premium)
 * 
 * No-Card Trial: 7 days, Pro access, 20 calculation limit, email verification only
 * Card-Verified Trial: 7 days, Premium access, unlimited calculations, card required
 */
const TrialSelectionModal = ({ 
  isOpen, 
  onClose, 
  onSelectNoCardTrial,
  onSelectCardTrial,
  userEmail = ''
}) => {
  const [selectedTrial, setSelectedTrial] = useState(null);

  if (!isOpen) return null;

  const handleSelectTrial = (trialType) => {
    setSelectedTrial(trialType);
  };

  const handleContinue = () => {
    if (selectedTrial === 'no-card') {
      onSelectNoCardTrial && onSelectNoCardTrial();
    } else if (selectedTrial === 'card') {
      onSelectCardTrial && onSelectCardTrial();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Choose Your Free Trial
          </h2>
          <p className="text-emerald-100 text-base">
            Try Fiquant TaxPro free for 7 days. No obligations.
          </p>
        </div>

        {/* Trial Options */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* No-Card Trial (Pro) */}
            <div 
              onClick={() => handleSelectTrial('no-card')}
              className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 ${
                selectedTrial === 'no-card' 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              {selectedTrial === 'no-card' && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">No-Card Trial</h3>
                  <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                    PRO FEATURES
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  7 days free access
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  20 calculations included
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  PDF export & reports
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Bulk PAYE (50 staff)
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Email verification only
                </li>
              </ul>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-xs text-blue-700 flex items-center">
                  <Shield className="w-4 h-4 mr-1.5" />
                  No payment information required
                </p>
              </div>
            </div>

            {/* Card-Verified Trial (Premium) */}
            <div 
              onClick={() => handleSelectTrial('card')}
              className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 ${
                selectedTrial === 'card' 
                  ? 'border-amber-500 bg-amber-50 shadow-lg' 
                  : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
              }`}
            >
              {/* Recommended badge */}
              <div className="absolute -top-3 left-4 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                RECOMMENDED
              </div>
              
              {selectedTrial === 'card' && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className="flex items-center mb-4 mt-2">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                  <Crown className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Full Access Trial</h3>
                  <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded">
                    PREMIUM FEATURES
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  7 days free access
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Sparkles className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                  <span className="font-semibold">Unlimited calculations</span>
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Advanced analytics dashboard
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Unlimited bulk staff & CSV import
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Card verified (₦50 hold, released)
                </li>
              </ul>

              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="text-xs text-amber-700 flex items-center">
                  <CreditCard className="w-4 h-4 mr-1.5" />
                  Auto-converts to Premium if not cancelled
                </p>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="mt-8 text-center">
            <Button
              onClick={handleContinue}
              disabled={!selectedTrial}
              className={`px-8 py-3 text-lg font-semibold transition-all ${
                selectedTrial 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              data-testid="trial-continue-btn"
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </Button>
            
            <p className="mt-4 text-sm text-gray-500">
              {selectedTrial === 'no-card' && "You'll need to verify your email to activate"}
              {selectedTrial === 'card' && "You'll be redirected to secure payment verification"}
              {!selectedTrial && "Select a trial option to continue"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialSelectionModal;
