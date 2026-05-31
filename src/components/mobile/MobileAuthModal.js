import React, { useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { LoginForm } from '../LoginForm';
import { RegisterForm } from '../RegisterForm';
import { useDevice } from '../../hooks/useDevice';

/**
 * Full-screen mobile auth modal
 * Uses slide transitions and optimized for touch
 */
export const MobileAuthModal = ({ isOpen, onClose, setShowTerms }) => {
  const [currentForm, setCurrentForm] = useState('login');
  const { isMobileOrLargeMobile } = useDevice();

  if (!isOpen) return null;

  // Use full-screen modal on mobile
  if (isMobileOrLargeMobile) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        {/* Mobile Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10 safe-area-inset-top">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h2 className="font-semibold text-lg">
              {currentForm === 'login' ? 'Login' : 'Create Account'}
            </h2>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6">
          {currentForm === 'login' && (
            <LoginForm
              onSwitchToRegister={() => setCurrentForm('register')}
              onClose={onClose}
              setShowTerms={setShowTerms}
            />
          )}
          
          {currentForm === 'register' && (
            <RegisterForm
              onSwitchToLogin={() => setCurrentForm('login')}
              onClose={onClose}
              setShowTerms={setShowTerms}
            />
          )}
        </div>
      </div>
    );
  }

  // Desktop modal (unchanged)
  return null;
};
