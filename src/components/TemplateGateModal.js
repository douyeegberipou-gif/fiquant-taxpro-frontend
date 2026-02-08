import React from 'react';
import { X, Repeat, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

const TemplateGateModal = ({ 
  isOpen, 
  onClose, 
  onUpgrade,
  onViewPlans
}) => {
  if (!isOpen) return null;
  
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
          <p className="text-white font-semibold text-sm mb-2">Fiquant TaxPro</p>
          
          {/* Title */}
          <h2 className="text-xl font-bold text-white mb-1 flex items-center justify-center gap-2">
            <Repeat className="h-5 w-5 text-amber-400" />
            Calculation Templates
          </h2>
          <p className="text-gray-400 text-xs mb-4">
            Save time with reusable templates for recurring calculations like monthly payroll.
          </p>
          
          {/* Benefits */}
          <div className="text-left mb-4">
            <p className="text-gray-400 text-xs mb-2">With templates you can:</p>
            <ul className="space-y-1.5">
              <li className="flex items-center text-xs">
                <CheckCircle className="h-3.5 w-3.5 text-amber-400 mr-2 flex-shrink-0" />
                <span className="text-white">Save calculation inputs as reusable templates</span>
              </li>
              <li className="flex items-center text-xs">
                <CheckCircle className="h-3.5 w-3.5 text-amber-400 mr-2 flex-shrink-0" />
                <span className="text-white">Pre-fill fields with one click</span>
              </li>
              <li className="flex items-center text-xs">
                <CheckCircle className="h-3.5 w-3.5 text-amber-400 mr-2 flex-shrink-0" />
                <span className="text-white">Perfect for recurring calculations</span>
              </li>
              <li className="flex items-center text-xs">
                <CheckCircle className="h-3.5 w-3.5 text-amber-400 mr-2 flex-shrink-0" />
                <span className="text-white">Access from any calculator</span>
              </li>
            </ul>
          </div>
          
          {/* Tier Options */}
          <div className="mb-4">
            <p className="text-gray-400 text-xs mb-2">Available in Premium and above:</p>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-amber-400" />
                  <span className="text-xs text-white">Premium</span>
                </div>
                <span className="text-xs text-amber-300">₦14,999/mo <span className="text-gray-400">(20 templates)</span></span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-white">Enterprise</span>
                </div>
                <span className="text-xs text-purple-300">₦40,000+/mo <span className="text-gray-400">(Unlimited)</span></span>
              </div>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="space-y-2">
            <Button
              onClick={onUpgrade}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-sm"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
            
            <Button
              onClick={onViewPlans}
              variant="outline"
              className="w-full py-2.5 border-amber-500 text-amber-400 hover:bg-amber-500/10 rounded-lg text-sm"
            >
              View All Plans
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateGateModal;
