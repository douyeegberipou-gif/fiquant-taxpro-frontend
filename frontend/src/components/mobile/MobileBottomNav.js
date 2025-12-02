import React from 'react';
import { Home, Calculator, FileText, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Sticky bottom navigation for mobile devices
 * Alternative to hamburger menu - always visible
 */
export const MobileBottomNav = ({ activeTab, onNavigateToTab }) => {
  const { isAuthenticated } = useAuth();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'paye', icon: Calculator, label: 'Calculate' },
    { id: 'history', icon: FileText, label: 'History' },
    { id: 'profile', icon: User, label: isAuthenticated() ? 'Profile' : 'Login' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
      <nav className="flex justify-around items-center px-2 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigateToTab(item.id)}
            className={`flex flex-col items-center justify-center min-w-0 flex-1 px-2 py-2 rounded-lg transition-colors ${
              activeTab === item.id
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            aria-label={item.label}
          >
            <item.icon className={`h-6 w-6 mb-1 ${
              activeTab === item.id ? 'stroke-2' : 'stroke-1.5'
            }`} />
            <span className="text-xs font-medium truncate w-full text-center">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
