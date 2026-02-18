import React, { useState, useEffect, useCallback } from 'react';
import { X, Play, Clock, Sparkles, Crown, UserPlus, Check } from 'lucide-react';
import { Button } from './ui/button';

/**
 * VideoAdModal - Guest user calculation limit modal
 */
const VideoAdModal = ({ isOpen, onClose, onAdComplete, calculatorType = 'PAYE', onStartTrial, onSubscribe, onCreateAccount }) => {
  const [adStarted, setAdStarted] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [adComplete, setAdComplete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAdStarted(false);
      setCountdown(10);
      setAdComplete(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (adStarted && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (adStarted && countdown === 0 && !adComplete) {
      setAdComplete(true);
      setTimeout(() => {
        onAdComplete();
        onClose();
      }, 500);
    }
    return () => clearInterval(timer);
  }, [adStarted, countdown, adComplete, onAdComplete, onClose]);

  const startAd = useCallback(() => {
    setAdStarted(true);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60"
        style={{ backdropFilter: 'blur(4px)' }}
        onClick={!adStarted ? onClose : undefined}
      />
      
      {/* Modal Content */}
      <div 
        className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden"
        style={{
          backdropFilter: 'blur(16px)',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Close button */}
        {!adStarted && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}

        {/* Content Area */}
        {!adStarted ? (
          <div className="text-center px-5 py-5">
            {/* Fiquant Logo - Compact */}
            <div className="flex flex-col items-center mb-3">
              <img 
                src="/fiquant-logo-bold-diamond.png" 
                alt="Fiquant" 
                className="w-10 h-10 object-contain mb-1"
              />
              <span className="text-white font-semibold text-sm tracking-wide">Fiquant TaxPro</span>
            </div>

            {/* Main Heading */}
            <h3 className="text-lg font-semibold text-white mb-1">
              You're on a Roll! 🚀
            </h3>
            <p className="text-gray-300 text-sm mb-3">
              You've completed 5 calculations today.<br />
              Ready for unlimited access?
            </p>

            {/* Free Account Benefits - Compact */}
            <div className="mb-4">
              <p className="text-gray-400 text-xs mb-2">Free accounts get:</p>
              <ul className="space-y-1 text-left max-w-xs mx-auto">
                <li className="flex items-center text-sm text-gray-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mr-2 flex-shrink-0" />
                  15 calculations daily (ad-free)
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mr-2 flex-shrink-0" />
                  Access to all tax calculators
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mr-2 flex-shrink-0" />
                  Zero commitment, no card needed
                </li>
              </ul>
            </div>

            {/* Primary CTA */}
            <Button
              onClick={() => {
                onClose();
                if (onCreateAccount) onCreateAccount();
              }}
              className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 text-sm mb-3"
              data-testid="create-account-button"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create Free Account
            </Button>
            
            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 text-gray-400" style={{ background: 'rgba(23, 32, 47, 0.98)' }}>Just need one more?</span>
              </div>
            </div>
            
            {/* Secondary CTA */}
            <p className="text-gray-400 text-xs mb-2">
              Watch a 10-second ad to continue
            </p>
            <Button
              onClick={startAd}
              variant="outline"
              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 px-5 py-2 text-sm"
              data-testid="watch-ad-button"
            >
              <Play className="w-3.5 h-3.5 mr-1.5" />
              Watch Ad to Calculate
            </Button>
            
            {/* Premium Options - Compact */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-gray-500 text-xs mb-2">Or skip ads forever with Pro</p>
              <div className="flex gap-2 justify-center">
                {onStartTrial && (
                  <Button
                    onClick={() => {
                      onClose();
                      onStartTrial();
                    }}
                    variant="outline"
                    className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 text-xs px-3 py-1.5"
                    data-testid="ad-modal-trial-btn"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Try Pro Free
                  </Button>
                )}
                {onSubscribe && (
                  <Button
                    onClick={() => {
                      onClose();
                      onSubscribe();
                    }}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs px-3 py-1.5"
                    data-testid="ad-modal-subscribe-btn"
                  >
                    Subscribe →
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Ad playing state
          <div className="w-full aspect-video flex flex-col items-center justify-center p-5">
            <div 
              className="w-full h-full rounded-xl flex flex-col items-center justify-center"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="text-center">
                <div 
                  className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center animate-pulse"
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                  }}
                >
                  <Clock className="w-7 h-7 text-amber-400" />
                </div>
                
                <div className="mb-3">
                  <span className="text-4xl font-bold text-white">{countdown}</span>
                  <p className="text-amber-400 text-sm mt-1">seconds remaining</p>
                </div>
                
                <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden mx-auto">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                  />
                </div>
                
                <p className="text-gray-500 text-xs mt-3">Advertisement</p>
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-2">Please wait for the ad to complete</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoAdModal;
