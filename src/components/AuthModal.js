import React, { useState } from 'react';
import { X, CheckCircle, Mail } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { VerificationPage } from './VerificationPage';
import { useAuth } from '../contexts/AuthContext';
import { Alert, AlertDescription } from './ui/alert';

export const AuthModal = ({ isOpen, onClose, setShowTerms }) => {
  const [currentForm, setCurrentForm] = useState('login'); // 'login', 'register', or 'post-register'
  const [registeredEmail, setRegisteredEmail] = useState(null);
  const { user } = useAuth();

  if (!isOpen) return null;

  // If user is authenticated but needs verification, show verification page
  if (user && (!user.email_verified || (user.phone && !user.phone_verified))) {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div 
          className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-lg"
          onClick={(e) => e.stopPropagation()}
          style={{
            backdropFilter: 'blur(16px)',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full z-10 transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
          
          <div className="p-4">
            <VerificationPage />
          </div>
        </div>
      </div>
    );
  }

  const switchToRegister = () => setCurrentForm('register');
  const switchToLogin = () => setCurrentForm('login');
  
  const handleRegistrationSuccess = (email) => {
    setRegisteredEmail(email);
    setCurrentForm('post-register');
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-md w-full max-h-[90vh] overflow-y-auto rounded-lg modal-scroll"
        onClick={(e) => e.stopPropagation()}
        style={{
          backdropFilter: 'blur(16px)',
          background: 'rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full z-10 transition-colors"
      >
        <X className="h-4 w-4 text-white" />
      </button>
        
        <div className="p-4 pb-6">
          {currentForm === 'login' && (
            <LoginForm
              onSwitchToRegister={switchToRegister}
              onClose={onClose}
              setShowTerms={setShowTerms}
            />
          )}
          
          {currentForm === 'register' && (
            <RegisterForm
              onSwitchToLogin={switchToLogin}
              onClose={onClose}
              onRegistrationSuccess={handleRegistrationSuccess}
              setShowTerms={setShowTerms}
            />
          )}
          
          {currentForm === 'post-register' && (
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-16 w-16 text-green-400" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-green-400 mb-2">
                  Registration Successful!
                </h3>
                <p className="text-gray-300 mb-4">
                  Your account has been created successfully.
                </p>
              </div>
              
              <div className="p-4 rounded-lg text-left" style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-green-300 font-medium mb-1">Verification Required</p>
                    <p className="text-gray-300 text-sm">
                      We've sent a verification link to <strong className="text-white">{registeredEmail}</strong>. 
                      Please check your email and click the verification link to activate your account.
                    </p>
                    <div className="mt-2 text-sm text-gray-400">
                      <p>• Check your spam/junk folder if you don't see the email</p>
                      <p>• The verification link expires in 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={switchToLogin}
                  className="flex-1 px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  Back to Login
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-medium hover:from-green-600 hover:to-green-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};