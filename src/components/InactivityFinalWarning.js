import React, { useState } from 'react';
import { Clock, LogOut, Save } from 'lucide-react';
import { useInactivity } from '../contexts/InactivityContext';
import { useDrafts } from '../contexts/DraftContext';

const InactivityFinalWarning = () => {
  const { 
    showFinalWarning, 
    stayLoggedIn, 
    handleLogout,
    remainingTime,
    formatRemainingTime,
    hasUnsavedWork,
    graceGranted
  } = useInactivity();
  
  const { saveDrafts } = useDrafts?.() || { saveDrafts: null };
  const [isSaving, setIsSaving] = useState(false);

  const remainingSeconds = remainingTime ? Math.floor(remainingTime / 1000) : 0;
  const isUrgent = remainingSeconds < 30;

  const handleSaveAndStay = async () => {
    if (saveDrafts) {
      setIsSaving(true);
      try {
        await saveDrafts();
      } catch (e) {
        console.error('Failed to save drafts:', e);
      }
      setIsSaving(false);
    }
    stayLoggedIn();
  };

  const handleDiscardAndLogout = () => {
    handleLogout(false);
  };

  if (!showFinalWarning) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-[9998]"
        style={{ backdropFilter: 'blur(4px)' }}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="final-warning-title"
        aria-describedby="final-warning-description"
      >
        <div 
          className="max-w-md w-full rounded-2xl overflow-hidden"
          style={{
            backdropFilter: 'blur(16px)',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.92) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Header with Logo */}
          <div className="px-6 pt-6 pb-4 text-center">
            <div className="flex flex-col items-center mb-4">
              <img 
                src="/fiquant-logo-bold-diamond.png" 
                alt="Fiquant" 
                className="w-16 h-16 object-contain mb-2"
              />
              <span className="text-white font-bold text-lg tracking-wide">Fiquant</span>
              <span className="text-amber-400 text-xs">TaxPro</span>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 id="final-warning-title" className="text-xl font-bold text-white">
                Session Timeout
              </h2>
            </div>
            <p className="text-gray-400 text-sm">
              For your security, your session is about to expire
            </p>
          </div>
          
          {/* Content */}
          <div className="px-6 pb-6 text-center">
            {hasUnsavedWork && graceGranted && (
              <div 
                className="rounded-xl px-4 py-3 mb-4"
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}
              >
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <Save className="w-5 h-5" />
                  <span className="font-medium">You have unsaved work!</span>
                </div>
                <p className="text-amber-300/80 text-sm mt-1">
                  Extended by 5 minutes. Please save your work.
                </p>
              </div>
            )}
            
            <p id="final-warning-description" className="text-gray-400 mb-3">
              You will be logged out in:
            </p>
            
            {/* Countdown Timer */}
            <div 
              className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl mb-4"
              style={{
                background: isUrgent ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${isUrgent ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`
              }}
            >
              <Clock className={`w-8 h-8 ${isUrgent ? 'text-red-400' : 'text-amber-400'}`} />
              <span 
                className={`text-5xl font-bold font-mono ${isUrgent ? 'text-red-400 animate-pulse' : 'text-white'}`}
                data-testid="countdown-timer"
              >
                {formatRemainingTime()}
              </span>
            </div>
            
            <p className="text-gray-500 text-sm mb-6">
              Click below to stay logged in and continue your session.
            </p>
            
            {/* Actions */}
            <div className="space-y-3">
              {hasUnsavedWork ? (
                <>
                  <button
                    onClick={handleSaveAndStay}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-green-400 disabled:to-green-500 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                    data-testid="save-stay-btn"
                  >
                    <Save className="w-5 h-5" />
                    {isSaving ? 'Saving...' : 'Save & Stay Logged In'}
                  </button>
                  <button
                    onClick={handleDiscardAndLogout}
                    className="w-full bg-white/10 hover:bg-white/20 text-gray-300 font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                    data-testid="discard-logout-btn"
                  >
                    <LogOut className="w-5 h-5" />
                    Discard & Log Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={stayLoggedIn}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg"
                    data-testid="im-still-here-btn"
                  >
                    I'm Still Here - Stay Logged In
                  </button>
                  <button
                    onClick={() => handleLogout(false)}
                    className="w-full text-gray-500 hover:text-gray-300 font-medium py-2 transition-colors flex items-center justify-center gap-2"
                    data-testid="final-logout-btn"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out Now
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InactivityFinalWarning;
