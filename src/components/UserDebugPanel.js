import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export const UserDebugPanel = ({ onClose }) => {
  const { user, token, refreshUser } = useAuth();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="max-w-2xl w-full max-h-[80vh] overflow-auto rounded-lg"
        onClick={(e) => e.stopPropagation()}
        style={{
          backdropFilter: 'blur(16px)',
          background: 'rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">User Status Debug Panel</h2>
            <Button onClick={onClose} variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">Close</Button>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <h3 className="font-semibold mb-2 text-yellow-400">Login Status:</h3>
              <p className="text-sm text-white">{user ? '✅ Logged In' : '❌ Not Logged In'}</p>
            </div>

            <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <h3 className="font-semibold mb-2 text-yellow-400">Token Present:</h3>
              <p className="text-sm text-white">{token ? '✅ Yes' : '❌ No'}</p>
              {token && (
                <p className="text-xs text-gray-300 mt-1 break-all">
                  {token.substring(0, 50)}...
                </p>
              )}
            </div>

            {user && (
              <>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <h3 className="font-semibold mb-2 text-yellow-400">User Data:</h3>
                  <div className="text-sm space-y-1 text-gray-200">
                    <p><strong className="text-white">Email:</strong> {user.email || 'N/A'}</p>
                    <p><strong className="text-white">Full Name:</strong> {user.full_name || 'N/A'}</p>
                    <p><strong className="text-white">Account Status:</strong> {user.account_status || 'N/A'}</p>
                    <p><strong className="text-white">Email Verified:</strong> {user.email_verified ? '✅ Yes' : '❌ No'}</p>
                    <p><strong className="text-white">Phone Verified:</strong> {user.phone_verified ? '✅ Yes' : '❌ No'}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  <h3 className="font-semibold mb-2 text-blue-400">Admin Status:</h3>
                  <div className="text-sm space-y-1 text-gray-200">
                    <p><strong className="text-white">admin_enabled:</strong> {user.admin_enabled !== undefined ? (user.admin_enabled ? '✅ true' : '❌ false') : '⚠️ MISSING'}</p>
                    <p><strong className="text-white">admin_role:</strong> {user.admin_role || '⚠️ MISSING'}</p>
                    <p className="mt-2 pt-2 border-t border-white/20">
                      <strong className="text-white">Should See Admin Button:</strong> {user.admin_enabled && user.admin_role ? '✅ YES' : '❌ NO'}
                    </p>
                  </div>
                </div>

                <div>
                  <Button onClick={refreshUser} className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold hover:from-yellow-600 hover:to-yellow-700">
                    🔄 Refresh User Data
                  </Button>
                  <p className="text-xs text-gray-300 mt-2 text-center">
                    Click this to reload your profile from the server
                  </p>
                </div>

                <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <h3 className="font-semibold mb-2 text-yellow-400">Full User Object:</h3>
                  <pre className="p-3 rounded text-xs overflow-auto max-h-40 text-gray-300" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
