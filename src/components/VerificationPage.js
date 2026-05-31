import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Mail, Phone, CheckCircle, AlertCircle, Send, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

const API_URL = process.env.REACT_APP_BACKEND_URL || 
  (process.env.NODE_ENV === 'development' ? 'http://localhost:8001' : '');

export const VerificationPage = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [phoneCode, setPhoneCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Check if user needs verification
  if (!user) {
    return (
      <Alert>
        <AlertDescription>Please log in to verify your account.</AlertDescription>
      </Alert>
    );
  }

  const isFullyVerified = user.email_verified && (user.phone_verified || !user.phone);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await axios.post(`${API_URL}/api/auth/resend-verification`, {
        email: user.email
      });
      
      setMessage('Verification email sent! Please check your email.');
      setMessageType('success');
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to send verification email');
      setMessageType('error');
    }
    
    setLoading(false);
  };

  const handleResendSMS = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await axios.post(`${API_URL}/api/auth/resend-sms`, {
        email: user.email
      });
      
      setMessage('SMS verification code sent! Please check your phone.');
      setMessageType('success');
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to send SMS verification code');
      setMessageType('error');
    }
    
    setLoading(false);
  };

  const handleVerifyPhone = async () => {
    if (!phoneCode || phoneCode.length !== 6) {
      setMessage('Please enter a valid 6-digit verification code');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      await axios.post(`${API_URL}/api/auth/verify-phone`, {
        email: user.email,
        verification_code: phoneCode,
        verification_type: 'phone'
      });
      
      setMessage('Phone number verified successfully!');
      setMessageType('success');
      setPhoneCode('');
      
      // Refresh user data after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to verify phone number');
      setMessageType('error');
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
  };

  if (isFullyVerified) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-700">Account Verified!</CardTitle>
            <CardDescription>
              Your account is fully verified and ready to use.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <CardTitle className="text-gray-900">Account Verification Required</CardTitle>
          <CardDescription>
            Please verify your email{user.phone ? ' and phone number' : ''} to access all features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Button onClick={handleLogout} variant="outline" size="sm">
              Switch Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Message Alert */}
      {message && (
        <Alert className={messageType === 'success' ? 'border-green-200 bg-green-50' : messageType === 'error' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}>
          <AlertDescription className={messageType === 'success' ? 'text-green-700' : messageType === 'error' ? 'text-red-700' : 'text-blue-700'}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      {/* Email Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Email Verification</span>
            {user.email_verified ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
          </CardTitle>
          <CardDescription>
            {user.email_verified ? (
              `✅ Your email ${user.email} is verified`
            ) : (
              `Verify your email address: ${user.email}`
            )}
          </CardDescription>
        </CardHeader>
        
        {!user.email_verified && (
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                We've sent a verification link to your email address. Please check your email and click the link to verify your account.
                If you don't see the email, check your spam folder.
              </p>
              
              <Button
                onClick={handleResendEmail}
                disabled={loading || resendCooldown > 0}
                variant="outline"
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {resendCooldown > 0 ? (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Resend in {resendCooldown}s
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Phone Verification (if phone provided) */}
      {user.phone && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Phone Verification</span>
              {user.phone_verified ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
            </CardTitle>
            <CardDescription>
              {user.phone_verified ? (
                `✅ Your phone number ${user.phone} is verified`
              ) : (
                `Verify your phone number: ${user.phone}`
              )}
            </CardDescription>
          </CardHeader>
          
          {!user.phone_verified && (
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  We've sent a 6-digit verification code to your phone number.
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="phone_code">Verification Code</Label>
                  <Input
                    id="phone_code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={phoneCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setPhoneCode(value);
                    }}
                    maxLength={6}
                    className="text-center text-lg tracking-wider"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    onClick={handleVerifyPhone}
                    disabled={loading || phoneCode.length !== 6}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Phone
                  </Button>
                  
                  <Button
                    onClick={handleResendSMS}
                    disabled={loading || resendCooldown > 0}
                    variant="outline"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {resendCooldown > 0 ? (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Resend in {resendCooldown}s
                      </>
                    ) : (
                      'Resend Code'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium text-gray-900 mb-2">What happens after verification?</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Access to all tax calculation features</li>
            <li>• Save and track your calculation history</li>
            <li>• Download PDF reports</li>
            <li>• Manage your tax profiles</li>
            <li>• Receive important tax updates</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};