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
      <div className="bg-amber-50 border border-amber-200 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-amber-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="font-semibold text-amber-800">Inactivity Warning</span>
          </div>
          <button 
            onClick={dismissFirstWarning}
            className="text-amber-600 hover:text-amber-800 transition-colors"
            aria-label="Dismiss warning"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-4 py-4">
          <p className="text-amber-900 text-sm mb-4">
            You'll be logged out in <strong>{remainingMinutes} minute{remainingMinutes !== 1 ? 's' : ''}</strong> due 
            to inactivity for security purposes.
          </p>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={stayLoggedIn}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              data-testid="stay-logged-in-btn"
            >
              Stay Logged In
            </button>
            <button
              onClick={() => handleLogout(false)}
              className="flex items-center gap-1.5 text-amber-700 hover:text-amber-900 font-medium py-2 px-3 rounded-lg hover:bg-amber-100 transition-colors text-sm"
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
