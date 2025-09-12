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

  const handleResendVerification = async (emailOrPhone) => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="https://customer-assets.emergentagent.com/job_taxpro-ng/artifacts/i2zrdiwl_Fiquant%20Consult%20-%20Transparent%202.png" 
            alt="Fiquant Consult Logo" 
            className="w-16 h-16 object-contain"
          />
        </div>
        <CardTitle className="flex items-center justify-center space-x-2">
          <span>Welcome Back</span>
        </CardTitle>
        <CardDescription>
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
            <Label htmlFor="email_or_phone">Email or Phone Number</Label>
            <div className="relative">
              <Input
                id="email_or_phone"
                type="text"
                placeholder="john@example.com or +234800123456"
                value={formData.email_or_phone}
                onChange={(e) => handleInputChange('email_or_phone', e.target.value)}
                className="pl-10"
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
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="pl-10 pr-10"
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
          
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign Up
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};