import React, { useState } from 'react';
import { X } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export const AuthModal = ({ isOpen, onClose }) => {
  const [currentForm, setCurrentForm] = useState('login'); // 'login' or 'register'

  if (!isOpen) return null;

  const switchToRegister = () => setCurrentForm('register');
  const switchToLogin = () => setCurrentForm('login');

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