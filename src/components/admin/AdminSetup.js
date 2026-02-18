import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield, User, Mail } from 'lucide-react';

export const AdminSetup = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const handleInitializeAdmin = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter an email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/admin/initialize-super-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setMessage(`✅ ${data.message}`);
      } else {
        setSuccess(false);
        setMessage(`❌ ${data.detail || 'Failed to initialize super admin'}`);
      }
    } catch (error) {
      setSuccess(false);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
            <img 
              src="/fiquant-logo-bold-diamond.png" 
              alt="Fiquant Consult Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Admin Setup
          </CardTitle>
          <CardDescription>
            Initialize your first super admin account for Fiquant Consult
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <Alert className={success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription className={success ? 'text-green-700' : 'text-red-700'}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          {!success && (
            <form onSubmit={handleInitializeAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@yourcompany.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Enter the email address of the user account you want to promote to super admin.
                  This user must already be registered in the system.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {loading ? 'Initializing...' : 'Initialize Super Admin'}
              </Button>
            </form>
          )}

          {success && (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <User className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-800 mb-2">Setup Complete!</h3>
                <p className="text-green-700 text-sm">
                  Your super admin account is now ready. You can access the admin dashboard after logging in.
                </p>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Next Steps:</strong></p>
                <ol className="list-decimal list-inside space-y-1 text-left">
                  <li>Complete email/phone verification if required</li>
                  <li>Log in to your account</li>
                  <li>Click the "Admin" button in the header</li>
                  <li>Access the full admin dashboard</li>
                </ol>
              </div>

              <Button
                onClick={() => {
                  window.location.href = '/';
                }}
                variant="outline"
                className="w-full"
              >
                Go to Main App
              </Button>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Important Notes:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Only use this setup page once to create your first super admin</li>
              <li>• The email must belong to an existing registered user</li>
              <li>• Super admin has full access to all admin features</li>
              <li>• You can assign other admin roles later through the dashboard</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};