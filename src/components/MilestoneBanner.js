import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

const MilestoneBanner = ({
  isOpen,
  onClose,
  onCTA,
  icon = '📊',
  message,
  ctaText = 'Learn More',
  ctaUrl = '/pricing',
  variant = 'info' // 'info', 'success', 'upgrade'
}) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    onClose && onClose();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'from-emerald-600 to-teal-600';
      case 'upgrade':
        return 'from-blue-600 to-purple-600';
      case 'info':
      default:
        return 'from-slate-800 to-slate-900';
    }
  };

  return (
    <div 
      className={`relative px-4 py-3 bg-gradient-to-r ${getVariantStyles()} text-white shadow-lg`}
      style={{
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Logo */}
          <img 
            src="/fiquant-logo-bold-diamond.png" 
            alt="Fiquant" 
            className="h-6 w-6 object-contain"
          />
          <span className="text-xl">{icon}</span>
          <p className="text-sm font-medium">{message}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={onCTA}
            className="flex items-center text-sm font-semibold text-teal-300 hover:text-teal-200 transition-colors"
          >
            {ctaText}
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
          
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MilestoneBanner;
