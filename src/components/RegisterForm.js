import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Mail, Lock, Phone, User, Eye, EyeOff, CheckCircle, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { PhoneInput } from './PhoneInput';

export const RegisterForm = ({ onSwitchToLogin, onClose, onRegistrationSuccess, setShowTerms }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    agree_terms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.full_name) {
      return 'Please fill in all required fields';
    }
    
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    
    if (!formData.agree_terms) {
      return 'Please agree to the terms and conditions';
    }
    
    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    
    // Phone validation (if provided)
    if (formData.phone) {
      const phonePattern = /^\+?[1-9]\d{9,14}$/;
      if (!phonePattern.test(formData.phone.replace(/[\s-]/g, ''))) {
        return 'Please enter a valid phone number with country code';
      }
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    // Prepare registration data
    const registrationData = {
      email: formData.email,
      phone: formData.phone || null,
      password: formData.password,
      full_name: formData.full_name,
      agree_terms: formData.agree_terms
    };

    const result = await register(registrationData);
    
    if (result.success) {
      if (result.requiresVerification) {
        // Call the parent's success handler to show verification message
        if (onRegistrationSuccess) {
          onRegistrationSuccess(formData.email);
        } else {
          setRegistrationComplete(true);
        }
      } else {
        onClose(); // Close modal on successful registration without verification
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  // Show success message after registration
  if (registrationComplete) {
    return (
      <Card className="w-full max-w-md mx-auto bg-transparent border-none shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>Registration Successful!</span>
          </CardTitle>
          <CardDescription>
            Your account has been created successfully.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <Mail className="h-4 w-4" />
            <AlertDescription className="text-green-700">
              <strong>Verification Required:</strong><br />
              We've sent a verification link to <strong>{formData.email}</strong>. 
              Please check your email and click the verification link to activate your account.
            </AlertDescription>
          </Alert>
          
          {formData.phone && (
            <Alert className="border-blue-200 bg-blue-50">
              <Phone className="h-4 w-4" />
              <AlertDescription className="text-blue-700">
                We've also sent a verification code to <strong>{formData.phone}</strong> via SMS.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-3">
            <Button
              onClick={() => {
                onClose();
                // Optionally redirect to verification page
                window.location.href = '/verify';
              }}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Continue to Verification
            </Button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Back to Sign In
              </button>
            </div>
          </div>
          
          <div className="text-xs text-gray-600 space-y-1">
            <p>• Check your spam/junk folder if you don't see the email</p>
            <p>• The verification link expires in 24 hours</p>
            <p>• SMS codes expire in 10 minutes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
          <span>Create Account</span>
        </CardTitle>
        <CardDescription className="text-gray-200">
          Join Fiquant Consult for professional tax calculations
        </CardDescription>
        {/* Scroll indicator hint */}
        <div className="flex items-center justify-center mt-3 text-gray-300 animate-bounce">
          <ChevronDown className="h-5 w-5" />
          <span className="text-xs ml-1">Scroll to continue</span>
        </div>
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
            <Label htmlFor="full_name" className="text-white">Full Name *</Label>
            <div className="relative">
              <Input
                id="full_name"
                type="text"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="pl-10 bg-white text-black placeholder:text-gray-400"
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email Address *</Label>
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
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white">Phone Number (Optional)</Label>
            <PhoneInput
              id="phone"
              value={formData.phone}
              onChange={(value) => handleInputChange('phone', value)}
              placeholder="8012345678"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password *</Label>
            <div className="relative w-full">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
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
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">Confirm Password *</Label>
            <div className="relative w-full">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full pl-10 pr-12 bg-white text-black placeholder:text-gray-400"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-2 pt-2">
            <Checkbox
              id="agree_terms"
              checked={formData.agree_terms}
              onCheckedChange={(checked) => handleInputChange('agree_terms', checked)}
            />
            <label htmlFor="agree_terms" className="text-sm text-gray-600 leading-none cursor-pointer">
              I accept Fiquant's{' '}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Terms and Conditions
              </button>
            </label>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-white">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-300 hover:text-blue-100 font-medium"
              >
                Sign In
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
    </Card>
  );
};