import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

const API_URL = process.env.REACT_APP_BACKEND_URL || 
  (process.env.NODE_ENV === 'development' ? 'http://localhost:8001' : '');

export const EmailVerificationHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const email = params.get('email');

      if (!token || !email) {
        setStatus('error');
        setMessage('Invalid verification link. Missing token or email.');
        return;
      }

      try {
        const response = await axios.post(`${API_URL}/api/auth/verify-email`, null, {
          params: { token, email }
        });
        
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/?verified=true');
        }, 3000);
        
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.detail || 'Email verification failed');
      }
    };

    verifyEmail();
  }, [location, navigate]);

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'verifying' && (
            <>
              <Loader className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <CardTitle className="text-blue-700">Verifying Email</CardTitle>
              <CardDescription>
                Please wait while we verify your email address...
              </CardDescription>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-green-700">Email Verified!</CardTitle>
              <CardDescription>
                Your email address has been successfully verified.
              </CardDescription>
            </>
          )}
          
          {status === 'error' && (
            <>
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-700">Verification Failed</CardTitle>
              <CardDescription>
                There was a problem verifying your email address.
              </CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent>
          {message && (
            <Alert className={status === 'success' ? 'border-green-200 bg-green-50 mb-4' : status === 'error' ? 'border-red-200 bg-red-50 mb-4' : 'border-blue-200 bg-blue-50 mb-4'}>
              <AlertDescription className={status === 'success' ? 'text-green-700' : status === 'error' ? 'text-red-700' : 'text-blue-700'}>
                {message}
              </AlertDescription>
            </Alert>
          )}
          
          {status !== 'verifying' && (
            <div className="text-center">
              <Button onClick={handleContinue} className="w-full">
                Continue to Fiquant TaxPro
              </Button>
              
              {status === 'success' && (
                <p className="text-sm text-gray-600 mt-2">
                  Redirecting automatically in a few seconds...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};