import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, HelpCircle, Sparkles, Coins, Car, PiggyBank, Calculator } from 'lucide-react';
import { Button } from './ui/button';

const PAYETour = ({ isVisible, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, isCenter: true });

  const tourSteps = [
    {
      id: 'welcome',
      title: 'Welcome to the PAYE Calculator!',
      description: "Let's quickly walk through the key fields. This will take 30 seconds.",
      icon: Sparkles,
      targetSelector: null, // No target - centered modal
      position: 'center',
      buttonText: 'Start Tour',
      skipText: "Skip - I've done this before"
    },
    {
      id: 'income',
      title: 'Monthly Gross Income',
      description: "This is the starting point for everything. Enter your total monthly pay (basic + allowances + bonuses).",
      icon: Coins,
      targetSelector: '[data-tour="income-section"]',
      position: 'right',
      buttonText: 'Next'
    },
    {
      id: 'bik',
      title: 'Benefits in Kind (BIK)',
      description: "Enter the value of any housing or motor vehicle provided exclusively for your use by your employer (if applicable).",
      icon: Car,
      targetSelector: '[data-tour="bik-section"]',
      position: 'right',
      buttonText: 'Next'
    },
    {
      id: 'pension',
      title: 'Pension & Reliefs',
      description: "Pension & NHF are auto-calculated for you at 8% & 2.5% respectively. You can also manually enter them. Enter any other contribution deducted from your pay!",
      icon: PiggyBank,
      targetSelector: '[data-tour="pension-section"]',
      position: 'right',
      buttonText: 'Next'
    },
    {
      id: 'calculate',
      title: 'Ready to Calculate',
      description: "Hit this button and we'll show you the PAYE tax breakdown instantly.",
      icon: Calculator,
      targetSelector: '[data-tour="calculate-button"]',
      position: 'top',
      buttonText: 'Got it!'
    }
  ];

  const updatePosition = useCallback(() => {
    const step = tourSteps[currentStep];
    
    if (step.position === 'center' || !step.targetSelector) {
      setPosition({ isCenter: true });
      return;
    }

    const target = document.querySelector(step.targetSelector);
    if (!target) {
      setPosition({ isCenter: true });
      return;
    }

    // Scroll target into view first
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      const rect = target.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Calculate position - place tooltip to the right with 20px gap
      const tooltipLeft = rect.right + 20;
      const tooltipTop = rect.top + scrollTop;
      
      console.log('Tour position calc:', { 
        rectRight: rect.right, 
        tooltipLeft, 
        tooltipTop,
        viewportWidth: window.innerWidth 
      });
      
      setPosition({
        top: tooltipTop,
        left: tooltipLeft,
        isCenter: false
      });
    }, 500);
  }, [currentStep, tourSteps]);

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      return () => window.removeEventListener('resize', updatePosition);
    }
  }, [isVisible, currentStep, updatePosition]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    if (dontShowAgain) {
      localStorage.setItem('paye_tour_completed', 'true');
    }
    onComplete();
  };

  const handleSkip = () => {
    if (dontShowAgain) {
      localStorage.setItem('paye_tour_completed', 'true');
    }
    onSkip();
  };

  // Highlight the target element
  useEffect(() => {
    if (!isVisible) return;
    
    const step = tourSteps[currentStep];
    if (step?.targetSelector) {
      const target = document.querySelector(step.targetSelector);
      if (target) {
        target.classList.add('tour-highlight');
        return () => target.classList.remove('tour-highlight');
      }
    }
  }, [isVisible, currentStep, tourSteps]);

  if (!isVisible) return null;

  const step = tourSteps[currentStep];
  const IconComponent = step.icon;
  const isWelcome = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-300"
        onClick={handleSkip}
      />
      
      {/* Beacon/Tooltip */}
      <div
        className="fixed z-[9999] w-[320px] animate-in fade-in slide-in-from-bottom-2 duration-300"
        style={
          position.isCenter
            ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
            : { top: `${position.top}px`, left: `${position.left}px` }
        }
      >
        <div className="bg-[#1a1a2e] rounded-2xl shadow-2xl border border-[#D4AF37]/30 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1a1a2e] to-[#2d2d44] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
                <IconComponent className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">{step.title}</h3>
                <p className="text-gray-400 text-xs">Step {currentStep + 1} of {tourSteps.length}</p>
              </div>
            </div>
            <button 
              onClick={handleSkip}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Content */}
          <div className="px-5 py-4">
            <p className="text-gray-300 text-sm leading-relaxed">
              {step.description}
            </p>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 pb-3">
            {tourSteps.map((_, index) => (
              <div 
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'w-6 bg-[#D4AF37]' 
                    : index < currentStep 
                      ? 'w-1.5 bg-[#D4AF37]/50' 
                      : 'w-1.5 bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          {/* Footer */}
          <div className="px-5 py-4 bg-[#0f0f1a] border-t border-gray-800">
            {isWelcome ? (
              <div className="space-y-3">
                <Button 
                  onClick={handleNext}
                  className="w-full bg-[#D4AF37] hover:bg-[#c9a432] text-black font-medium"
                >
                  {step.buttonText}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <button 
                  onClick={handleSkip}
                  className="w-full text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {step.skipText}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-0"
                  />
                  <span className="text-gray-400 text-xs">Don't show again</span>
                </label>
                <Button 
                  onClick={handleNext}
                  className="bg-[#D4AF37] hover:bg-[#c9a432] text-black font-medium px-6"
                >
                  {step.buttonText}
                  {!isLastStep && <ChevronRight className="ml-1 h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Pointer arrow for non-centered tooltips */}
        {!position.isCenter && step.position !== 'center' && (
          <div 
            className="absolute w-3 h-3 bg-[#1a1a2e] border-[#D4AF37]/30 transform rotate-45 -left-1.5 top-20 border-l border-b"
          />
        )}
      </div>
    </>
  );
};

// Tour Trigger Button Component
export const PAYETourButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="p-2 rounded-full bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] transition-all duration-200 hover:scale-105"
    title="Start guided tour"
  >
    <HelpCircle className="h-5 w-5" />
  </button>
);

export default PAYETour;
