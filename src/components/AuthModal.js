import React, { useState } from 'react';
import { X, CheckCircle, Mail } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { VerificationPage } from './VerificationPage';
import { useAuth } from '../contexts/AuthContext';
import { Alert, AlertDescription } from './ui/alert';

export const AuthModal = ({ isOpen, onClose }) => {
  const [currentForm, setCurrentForm] = useState('login'); // 'login', 'register', or 'post-register'
  const [registeredEmail, setRegisteredEmail] = useState(null);
  const { user } = useAuth();

  if (!isOpen) return null;

  // If user is authenticated but needs verification, show verification page
  if (user && (!user.email_verified || (user.phone && !user.phone_verified))) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="relative bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full z-10"
          >
            <X className="h-4 w-4" />
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full z-10"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="p-4">
          {currentForm === 'login' && (
            <LoginForm
              onSwitchToRegister={switchToRegister}
              onClose={onClose}
            />
          )}
          
          {currentForm === 'register' && (
            <RegisterForm
              onSwitchToLogin={switchToLogin}
              onClose={onClose}
              onRegistrationSuccess={handleRegistrationSuccess}
            />
          )}
          
          {currentForm === 'post-register' && (
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-green-700 mb-2">
                  Registration Successful!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your account has been created successfully.
                </p>
              </div>
              
              <Alert className="border-green-200 bg-green-50 text-left">
                <Mail className="h-4 w-4" />
                <AlertDescription className="text-green-700">
                  <strong>Verification Required:</strong><br />
                  We've sent a verification link to <strong>{registeredEmail}</strong>. 
                  Please check your email and click the verification link to activate your account.
                  <div className="mt-2 text-sm">
                    <p>• Check your spam/junk folder if you don't see the email</p>
                    <p>• The verification link expires in 24 hours</p>
                  </div>
                </AlertDescription>
              </Alert>
              
              <div className="flex space-x-3">
                <button
                  onClick={switchToLogin}
                  className="flex-1 px-4 py-2 text-green-600 border border-green-300 rounded hover:bg-green-50"
                >
                  Back to Login
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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