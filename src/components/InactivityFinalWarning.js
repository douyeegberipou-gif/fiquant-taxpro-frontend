import React, { useEffect, useState } from 'react';
import { Lock, Clock, LogOut, Save } from 'lucide-react';
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

  // Get remaining seconds for color change
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
        className="fixed inset-0 bg-black/50 z-[9998]"
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
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Lock className="w-6 h-6" />
              <h2 id="final-warning-title" className="text-xl font-bold">
                Auto-Logout Warning
              </h2>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-6 py-6 text-center">
            {hasUnsavedWork && graceGranted && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
                <div className="flex items-center justify-center gap-2 text-amber-700">
                  <Save className="w-5 h-5" />
                  <span className="font-medium">You have unsaved work!</span>
                </div>
                <p className="text-amber-600 text-sm mt-1">
                  Extended by 5 minutes. Please save your work.
                </p>
              </div>
            )}
            
            <p id="final-warning-description" className="text-gray-600 mb-4">
              You will be logged out in:
            </p>
            
            {/* Countdown Timer */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className={`w-8 h-8 ${isUrgent ? 'text-red-500' : 'text-gray-500'}`} />
              <span 
                className={`text-4xl font-bold font-mono ${isUrgent ? 'text-red-500 animate-pulse' : 'text-gray-800'}`}
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
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                    data-testid="save-stay-btn"
                  >
                    <Save className="w-5 h-5" />
                    {isSaving ? 'Saving...' : 'Save & Stay Logged In'}
                  </button>
                  <button
                    onClick={handleDiscardAndLogout}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
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
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                    data-testid="im-still-here-btn"
                  >
                    I'm Still Here - Stay Logged In
                  </button>
                  <button
                    onClick={() => handleLogout(false)}
                    className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors flex items-center justify-center gap-2"
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
