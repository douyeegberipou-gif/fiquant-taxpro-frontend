import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

export const LoginForm = ({ onSwitchToRegister, onClose, setShowTerms }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email_or_phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.email_or_phone || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await login(formData);
    
    if (result.success) {
      onClose(); // Close modal on successful login
    } else {
      // Check if the error is due to unverified account
      if (result.needsVerification) {
        setError(
          <div className="space-y-3">
            <p>{result.error}</p>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleResendVerification(formData.email_or_phone)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
              >
                Resend Verification Email
              </button>
            </div>
          </div>
        );
      } else {
        setError(result.error);
      }
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordMessage('');

    // Basic email validation
    if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
      setForgotPasswordMessage('Please enter a valid email address');
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordEmail
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setForgotPasswordMessage(
          <div className="text-green-700">
            <p>✅ Password reset instructions have been sent to your email.</p>
            <p className="text-sm mt-1">Check your spam folder if you don't see the email.</p>
          </div>
        );
        // Reset form
        setForgotPasswordEmail('');
      } else {
        setForgotPasswordMessage(data.detail || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      setForgotPasswordMessage('Network error. Please check your connection and try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResendVerification = async (emailOrPhone) => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_BACKEND_URL || 
        (process.env.NODE_ENV === 'development' ? 'http://localhost:8001' : '');
      
      // Try to resend verification email
      await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailOrPhone.includes('@') ? emailOrPhone : null
        }),
      });
      
      setError(
        <div className="text-green-700">
          <p>✅ Verification email sent! Please check your email and click the verification link.</p>
          <p className="text-sm mt-1">Check your spam folder if you don't see the email.</p>
        </div>
      );
    } catch (error) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-transparent border-none shadow-none">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="/fiquant-logo-bold-diamond.png" 
            alt="Fiquant Consult Logo" 
            className="w-16 h-16 object-contain"
          />
        </div>
        <CardTitle className="flex items-center justify-center space-x-2 text-white">
          <span>Welcome Back</span>
        </CardTitle>
        <CardDescription className="text-gray-200">
          Sign in to your Fiquant Consult account
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email_or_phone" className="text-white">Email or Phone Number</Label>
            <div className="relative">
              <Input
                id="email_or_phone"
                type="text"
                placeholder="john@example.com or +234800123456"
                value={formData.email_or_phone}
                onChange={(e) => handleInputChange('email_or_phone', e.target.value)}
                className="pl-10 bg-white text-black placeholder:text-gray-400"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {formData.email_or_phone.includes('@') ? (
                  <Mail className="h-4 w-4 text-gray-400" />
                ) : (
                  <Phone className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="pl-10 pr-10 bg-white text-black placeholder:text-gray-400"
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          {/* Terms and Conditions Acceptance */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms-login"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="terms-login" className="text-sm text-white cursor-pointer">
                I accept Fiquant's{' '}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-blue-300 hover:text-blue-100 underline"
                >
                  Terms and Conditions
                </button>
              </Label>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading || !termsAccepted}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-white">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-blue-300 hover:text-blue-100 font-medium"
              >
                Forgot Password?
              </button>
            </p>
            <p className="text-sm text-white">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-blue-300 hover:text-blue-100 font-medium"
              >
                Sign Up
              </button>
            </p>
          </div>
        </form>
      </CardContent>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-auto bg-transparent border-none shadow-none">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Reset Password</CardTitle>
              <CardDescription className="text-gray-200">
                Enter your email address and we'll send you a password reset link
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotPasswordMessage && (
                  <Alert className={forgotPasswordMessage.props?.className?.includes('green') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <AlertDescription>
                      {forgotPasswordMessage}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="forgot-email" className="text-white">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="Enter your email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="pl-10 bg-white text-black placeholder:text-gray-400"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordEmail('');
                      setForgotPasswordMessage('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={forgotPasswordLoading}
                  >
                    {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
};