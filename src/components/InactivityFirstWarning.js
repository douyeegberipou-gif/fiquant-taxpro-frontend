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
      style={{ maxWidth: '380px' }}
    >
      <div 
        className="rounded-xl shadow-2xl overflow-hidden"
        style={{
          backdropFilter: 'blur(16px)',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(217, 119, 6, 0.85) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-white/20">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-white" />
            <span className="font-semibold text-white">Inactivity Warning</span>
          </div>
          <button 
            onClick={dismissFirstWarning}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            aria-label="Dismiss warning"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-4 py-4">
          <p className="text-white text-sm mb-4">
            You'll be logged out in <strong>{remainingMinutes} minute{remainingMinutes !== 1 ? 's' : ''}</strong> due 
            to inactivity for security purposes.
          </p>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={stayLoggedIn}
              className="flex-1 bg-white hover:bg-gray-100 text-amber-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm shadow-md"
              data-testid="stay-logged-in-btn"
            >
              Stay Logged In
            </button>
            <button
              onClick={() => handleLogout(false)}
              className="flex items-center gap-1.5 text-white hover:bg-white/20 font-medium py-2 px-3 rounded-lg transition-colors text-sm"
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
