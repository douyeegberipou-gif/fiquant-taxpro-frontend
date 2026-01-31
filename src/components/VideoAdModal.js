import React, { useState, useEffect, useCallback } from 'react';
import { X, Play, Clock, Sparkles, Crown } from 'lucide-react';
import { Button } from './ui/button';

/**
 * VideoAdModal - Shows a 10-second video ad before allowing calculation
 * User must click "Watch Ad to Calculate" to start the ad
 * After 10 seconds, calculation runs automatically
 */
const VideoAdModal = ({ isOpen, onClose, onAdComplete, calculatorType = 'PAYE', onStartTrial, onSubscribe }) => {
  const [adStarted, setAdStarted] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [adComplete, setAdComplete] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAdStarted(false);
      setCountdown(10);
      setAdComplete(false);
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (adStarted && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (adStarted && countdown === 0 && !adComplete) {
      setAdComplete(true);
      // Auto-trigger calculation after ad completes
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!adStarted ? onClose : undefined}
      />
      
      {/* Modal Content */}
      <div className="relative bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header - Only show close button before ad starts */}
        {!adStarted && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Ad Content Area */}
        <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          {!adStarted ? (
            // Pre-ad state - Show play button and subscription CTA
            <div className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-600/20 flex items-center justify-center">
                <Play className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Ad-Supported Calculation
              </h3>
              <p className="text-gray-400 text-sm mb-5">
                Watch a short 10-second ad to proceed with your {calculatorType} calculation
              </p>
              <Button
                onClick={startAd}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg"
                data-testid="watch-ad-button"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Ad to Calculate
              </Button>
              
              {/* Subscription CTA */}
              <div className="mt-6 pt-5 border-t border-gray-700">
                <p className="text-gray-400 text-xs mb-3">Or skip ads forever</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  {onStartTrial && (
                    <Button
                      onClick={() => {
                        onClose();
                        onStartTrial();
                      }}
                      variant="outline"
                      className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 text-sm px-4 py-2"
                      data-testid="ad-modal-trial-btn"
                    >
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      Start 7-Day Free Trial
                    </Button>
                  )}
                  {onSubscribe && (
                    <Button
                      onClick={() => {
                        onClose();
                        onSubscribe();
                      }}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm px-4 py-2"
                      data-testid="ad-modal-subscribe-btn"
                    >
                      <Crown className="w-4 h-4 mr-1.5" />
                      Subscribe Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Ad playing state
            <div className="w-full h-full flex flex-col items-center justify-center p-6">
              {/* Simulated Ad Content */}
              <div className="w-full h-full bg-gradient-to-br from-emerald-900/50 to-teal-900/50 rounded-lg flex flex-col items-center justify-center border border-emerald-500/30">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse">
                    <Clock className="w-8 h-8 text-emerald-400" />
                  </div>
                  
                  {/* Countdown Display */}
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-white">{countdown}</span>
                    <p className="text-emerald-400 text-sm mt-1">seconds remaining</p>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
                      style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                    />
                  </div>
                  
                  {/* Ad Placeholder Text */}
                  <p className="text-gray-400 text-xs mt-4">
                    Advertisement
                  </p>
                </div>
              </div>
              
              {/* Cannot skip message */}
              <p className="text-gray-500 text-xs mt-3">
                Please wait for the ad to complete
              </p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="bg-gray-800/50 px-4 py-3 border-t border-gray-700">
          <p className="text-gray-400 text-xs text-center">
            {adStarted 
              ? 'Your calculation will start automatically after the ad' 
              : 'Upgrade to Pro or Premium for ad-free calculations'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoAdModal;
