import React from 'react';
import { X, Users, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

const NetPaymentsGateModal = ({ 
  isOpen, 
  onClose, 
  onStartTrial,
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
          <h2 className="text-xl font-bold text-white mb-1">
            Net Staff Payments 💼
          </h2>
          <p className="text-gray-400 text-xs mb-4">
            Calculate exactly what to pay your employees after all deductions.
          </p>
          
          {/* Benefits */}
          <div className="text-left mb-4">
            <p className="text-gray-400 text-xs mb-2">This feature includes:</p>
            <ul className="space-y-1.5">
              <li className="flex items-center text-xs">
                <CheckCircle className="h-3.5 w-3.5 text-teal-400 mr-2 flex-shrink-0" />
                <span className="text-white">Auto-calculate statutory deductions</span>
              </li>
              <li className="flex items-center text-xs">
                <CheckCircle className="h-3.5 w-3.5 text-teal-400 mr-2 flex-shrink-0" />
                <span className="text-white">Add custom deductions (loans, union dues)</span>
              </li>
              <li className="flex items-center text-xs">
                <CheckCircle className="h-3.5 w-3.5 text-teal-400 mr-2 flex-shrink-0" />
                <span className="text-white">Download professional payment schedules</span>
              </li>
            </ul>
          </div>
          
          {/* Tier Options */}
          <div className="mb-4">
            <p className="text-gray-400 text-xs mb-2">Available in Starter plan and above:</p>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xs text-white">Starter</span>
                <span className="text-xs text-emerald-300">1 employee</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <span className="text-xs text-white">Pro</span>
                <span className="text-xs text-blue-300">25 employees</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="text-xs text-white">Premium+</span>
                <span className="text-xs text-amber-300">Unlimited</span>
              </div>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="space-y-2">
            <Button
              onClick={onStartTrial}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Start 7-Day Free Trial
            </Button>
            
            <Button
              onClick={onViewPlans}
              variant="outline"
              className="w-full py-2.5 border-teal-500 text-teal-400 hover:bg-teal-500/10 rounded-lg text-sm"
            >
              View Plans
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetPaymentsGateModal;
