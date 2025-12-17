import React, { useState } from 'react';
import { MobileNav } from './components/mobile/MobileNav';
import { MobileBottomNav } from './components/mobile/MobileBottomNav';
import { MobileHome } from './components/mobile/MobileHome';
import { TopBanner } from './components/ads/AdBanner';
import { useAds } from './contexts/AdContext';
import { useAuth } from './contexts/AuthContext';

// Import calculator components
import CITCalculator from './components/CITCalculator';
import VATCalculator from './components/VATCalculator';
import CGTCalculator from './components/CGTCalculator';

/**
 * MOBILE-ONLY APPLICATION
 * Completely separate render tree for mobile devices
 * Tile-based interface with direct access to features
 */
export const MobileApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { canShowAds } = useAds();
  const { isAuthenticated } = useAuth();

  const renderContent = () => {
    // Show loading fallback for lazy-loaded components
    const LoadingFallback = () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );

    switch (activeTab) {
      case 'home':
        return <MobileHome onNavigate={setActiveTab} />;
      
      case 'paye':
        return (
          <div className="p-4 bg-white min-h-screen">
            <h2 className="text-xl font-bold mb-4">PAYE Calculator</h2>
            <p className="text-gray-600 mb-4">Calculate employee income tax</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">PAYE calculator will be integrated here. For now, please use the desktop version.</p>
            </div>
          </div>
        );
      
      case 'cit':
        return <CITCalculator />;
      
      case 'vat':
        return <VATCalculator />;
      
      case 'cgt':
        return <CGTCalculator />;
      
      case 'profile':
        return isAuthenticated() ? (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Profile</h2>
            <p>Profile page coming soon...</p>
          </div>
        ) : (
          <MobileHome onNavigate={setActiveTab} />
        );
      
      case 'history':
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">History</h2>
            <p>History page coming soon...</p>
          </div>
        );
      
      case 'tax-info':
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Tax Information</h2>
            <p>Tax info page coming soon...</p>
          </div>
        );
      
      case 'payments':
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Payments</h2>
            <p>Payment page coming soon...</p>
          </div>
        );
      
      default:
        return <MobileHome onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="mobile-app min-h-screen bg-gray-50">
      {/* Mobile Navigation (Hamburger) - Only show on non-home pages */}
      {activeTab !== 'home' && (
        <MobileNav 
          activeTab={activeTab}
          onNavigateToTab={setActiveTab}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenAdmin={() => {}}
        />
      )}

      {/* Mobile Ad Banner - Only on home */}
      {canShowAds() && activeTab === 'home' && (
        <div className="px-4 py-2 bg-white">
          <TopBanner placement="mobile-top" />
        </div>
      )}

      {/* Main Content */}
      <div className={activeTab !== 'home' ? 'pt-16 pb-20' : 'pb-20'}>
        {renderContent()}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        activeTab={activeTab}
        onNavigateToTab={setActiveTab}
      />
    </div>
  );
};
