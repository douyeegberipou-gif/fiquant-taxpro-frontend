import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export const UserDebugPanel = ({ onClose }) => {
  const { user, token, refreshUser } = useAuth();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>User Status Debug Panel</span>
            <Button onClick={onClose} variant="outline" size="sm">Close</Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Login Status:</h3>
            <p className="text-sm">{user ? '✅ Logged In' : '❌ Not Logged In'}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Token Present:</h3>
            <p className="text-sm">{token ? '✅ Yes' : '❌ No'}</p>
            {token && (
              <p className="text-xs text-gray-500 mt-1 break-all">
                {token.substring(0, 50)}...
              </p>
            )}
          </div>

          {user && (
            <>
              <div>
                <h3 className="font-semibold mb-2">User Data:</h3>
                <div className="bg-gray-100 p-3 rounded text-sm space-y-1">
                  <p><strong>Email:</strong> {user.email || 'N/A'}</p>
                  <p><strong>Full Name:</strong> {user.full_name || 'N/A'}</p>
                  <p><strong>Account Status:</strong> {user.account_status || 'N/A'}</p>
                  <p><strong>Email Verified:</strong> {user.email_verified ? '✅ Yes' : '❌ No'}</p>
                  <p><strong>Phone Verified:</strong> {user.phone_verified ? '✅ Yes' : '❌ No'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Admin Status:</h3>
                <div className="bg-blue-100 p-3 rounded text-sm space-y-1">
                  <p><strong>admin_enabled:</strong> {user.admin_enabled !== undefined ? (user.admin_enabled ? '✅ true' : '❌ false') : '⚠️ MISSING'}</p>
                  <p><strong>admin_role:</strong> {user.admin_role || '⚠️ MISSING'}</p>
                  <p className="mt-2 pt-2 border-t">
                    <strong>Should See Admin Button:</strong> {user.admin_enabled && user.admin_role ? '✅ YES' : '❌ NO'}
                  </p>
                </div>
              </div>

              <div>
                <Button onClick={refreshUser} className="w-full">
                  🔄 Refresh User Data
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Click this to reload your profile from the server
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Full User Object:</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
