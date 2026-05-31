import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { PhoneInput } from './PhoneInput';

export const LoginForm = ({ onSwitchToRegister, onClose, setShowTerms }) => {
  const { login, forgotPassword, resendVerification } = useAuth();
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Determine the login identifier based on selected method
    const email_or_phone = loginMethod === 'email' ? formData.email : formData.phone;

    if (!email_or_phone || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await login({ email_or_phone, password: formData.password });
    
    if (result.success) {
      onClose();
    } else {
      if (result.needsVerification) {
        setError(
          <div className="space-y-3">
            <p>{result.error}</p>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleResendVerification(email_or_phone)}
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
    setForgotPasswordMessage(null);

    if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
      setForgotPasswordMessage({ type: 'error', text: 'Please enter a valid email address' });
      setForgotPasswordLoading(false);
      return;
    }

    const result = await forgotPassword(forgotPasswordEmail);
    
    if (result.success) {
      setForgotPasswordMessage({ 
        type: 'success', 
        text: 'Password reset instructions have been sent to your email. Check your spam folder if you don\'t see it.'
      });
      setForgotPasswordEmail('');
    } else {
      setForgotPasswordMessage({ type: 'error', text: result.error });
    }
    
    setForgotPasswordLoading(false);
  };

  const handleResendVerification = async (emailOrPhone) => {
    setLoading(true);
    
    const email = emailOrPhone.includes('@') ? emailOrPhone : null;
    if (!email) {
      setError('Please use your email address to resend verification.');
      setLoading(false);
      return;
    }

    const result = await resendVerification(email);
    
    if (result.success) {
      setError(
        <div className="text-green-700">
          <p>✅ Verification email sent! Please check your email and click the verification link.</p>
          <p className="text-sm mt-1">Check your spam folder if you don't see the email.</p>
        </div>
      );
    } else {
      setError(result.error);
    }
    
    setLoading(false);
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
          
          {/* Login Method Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-2">
            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'email' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail className="h-4 w-4 inline mr-1.5" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'phone' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Phone className="h-4 w-4 inline mr-1.5" />
              Phone
            </button>
          </div>
          
          {/* Email Input */}
          {loginMethod === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10 bg-white text-black placeholder:text-gray-400"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          )}
          
          {/* Phone Input with Country Code */}
          {loginMethod === 'phone' && (
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">Phone Number</Label>
              <PhoneInput
                id="phone"
                value={formData.phone}
                onChange={(value) => handleInputChange('phone', value)}
                placeholder="8012345678"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <div className="relative w-full">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-10 pr-12 bg-white text-black placeholder:text-gray-400"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
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
          
          {/* Bottom Error Indicator */}
          {error && (
            <div className="flex items-center justify-center gap-2 pt-2 animate-bounce">
              <span className="text-red-400 text-sm font-medium">Check Error</span>
              <svg 
                className="w-4 h-4 text-red-400 transform rotate-180" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          )}
        </form>
      </CardContent>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowForgotPassword(false);
            setForgotPasswordEmail('');
            setForgotPasswordMessage(null);
          }}
        >
          <div 
            className="w-full max-w-md rounded-lg p-6"
            onClick={(e) => e.stopPropagation()}
            style={{
              backdropFilter: 'blur(16px)',
              background: 'rgba(0, 0, 0, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <h3 className="text-xl font-semibold text-white mb-2 text-center">Reset Password</h3>
            <p className="text-gray-300 text-sm text-center mb-4">
              Enter your email address and we'll send you a password reset link
            </p>
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {forgotPasswordMessage && (
                <Alert className={forgotPasswordMessage.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <AlertDescription className={forgotPasswordMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                    {forgotPasswordMessage.type === 'success' && '✅ '}{forgotPasswordMessage.text}
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
                  className="flex-1 bg-transparent border-white/30 text-white hover:bg-white/10"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail('');
                    setForgotPasswordMessage(null);
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
          </div>
        </div>
      )}
    </Card>
  );
};
