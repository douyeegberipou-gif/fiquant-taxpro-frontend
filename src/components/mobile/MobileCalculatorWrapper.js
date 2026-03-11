import React from 'react';

/**
 * MOBILE-ONLY Calculator Wrapper
 * Wraps existing calculator components with mobile-optimized styling
 * Provides dark background with glassmorphism to match mobile theme
 */
export const MobileCalculatorWrapper = ({ children, backgroundImage }) => {
  const defaultBg = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
  
  return (
    <div 
      className="min-h-screen pb-24"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url('${backgroundImage || defaultBg}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Add padding for the fixed header */}
      <div className="pt-32 px-4">
        {/* Override child component styles for mobile dark theme */}
        <div className="mobile-calculator-content">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Mobile Page Wrapper for non-calculator pages
 * Provides consistent styling for History, Profile, Tax Info, Payments
 */
export const MobilePageWrapper = ({ children, title }) => {
  return (
    <div 
      className="min-h-screen pb-24"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="pt-32 px-4">
        <div 
          className="rounded-xl p-4"
          style={{
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileCalculatorWrapper;
