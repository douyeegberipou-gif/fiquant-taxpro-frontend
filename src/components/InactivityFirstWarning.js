import React from 'react';
import { X, Clock, LogOut } from 'lucide-react';
import { useInactivity } from '../contexts/InactivityContext';

const InactivityFirstWarning = () => {
  const { 
    showFirstWarning, 
    stayLoggedIn, 
    dismissFirstWarning, 
    handleLogout,
    getRemainingMinutes 
  } = useInactivity();

  if (!showFirstWarning) return null;

  const remainingMinutes = getRemainingMinutes();

  return (
    <div 
      className="fixed top-4 right-4 z-50 animate-slide-in-right"
      style={{ maxWidth: '400px' }}
    >
      <div 
        className="rounded-2xl shadow-2xl overflow-hidden"
        style={{
          backdropFilter: 'blur(16px)',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.92) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header with Fiquant Logo */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <img 
              src="/fiquant-logo-bold-diamond.png" 
              alt="Fiquant" 
              className="w-8 h-8 object-contain"
            />
            <div>
              <span className="font-semibold text-white block text-sm">Inactivity Warning</span>
              <span className="text-gray-400 text-xs">Session timeout approaching</span>
            </div>
          </div>
          <button 
            onClick={dismissFirstWarning}
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-colors"
            aria-label="Dismiss warning"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-2.5 rounded-xl"
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}
            >
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-gray-300 text-sm">
              You'll be logged out in <strong className="text-white">{remainingMinutes} minute{remainingMinutes !== 1 ? 's' : ''}</strong> due 
              to inactivity for security purposes.
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={stayLoggedIn}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all text-sm shadow-lg"
              data-testid="stay-logged-in-btn"
            >
              Stay Logged In
            </button>
            <button
              onClick={() => handleLogout(false)}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white hover:bg-white/10 font-medium py-2.5 px-4 rounded-xl transition-colors text-sm"
              data-testid="logout-now-btn"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      </div>
      
      <style jsx="true">{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default InactivityFirstWarning;
