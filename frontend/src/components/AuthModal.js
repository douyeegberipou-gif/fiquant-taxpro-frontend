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
          {currentForm === 'login' ? (
            <LoginForm
              onSwitchToRegister={switchToRegister}
              onClose={onClose}
            />
          ) : (
            <RegisterForm
              onSwitchToLogin={switchToLogin}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};