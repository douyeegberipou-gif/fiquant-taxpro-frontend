import React, { useState, useEffect } from 'react';
import { MobileNav } from './components/mobile/MobileNav';
import { MobileBottomNav } from './components/mobile/MobileBottomNav';
import { Home } from './components/Home';
import { PAYECalculator } from './components/PAYECalculator';
import { CITCalculator } from './components/CITCalculator';
import { VATCalculator } from './components/VATCalculator';
import { CGTCalculator } from './components/CGTCalculator';
import { HistoryPage } from './components/HistoryPage';
import { ProfilePage } from './components/ProfilePage';
import { useAuth } from './contexts/AuthContext';
import { TopBanner } from './components/ads/AdBanner';
import { useAds } from './contexts/AdContext';

/**
 * MOBILE-ONLY APPLICATION
 * Completely separate render tree for mobile devices
 */
export const MobileApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { canShowAds } = useAds();

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onNavigateToTab={setActiveTab} onOpenAuth={() => setAuthModalOpen(true)} />;
      case 'paye':
      case 'calculator':
        return <PAYECalculator />;
      case 'cit':
        return <CITCalculator />;
      case 'vat':
        return <VATCalculator />;
      case 'cgt':
        return <CGTCalculator />;
      case 'history':
        return <HistoryPage />;
      case 'profile':
        return isAuthenticated() ? <ProfilePage /> : <Home onNavigateToTab={setActiveTab} onOpenAuth={() => setAuthModalOpen(true)} />;
      default:
        return <Home onNavigateToTab={setActiveTab} onOpenAuth={() => setAuthModalOpen(true)} />;
    }
  };

  return (
    <div className="mobile-app min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Mobile Navigation */}
      <MobileNav 
        activeTab={activeTab}
        onNavigateToTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenAdmin={() => setShowAdminDashboard(true)}
      />

      {/* Mobile Ad Banner */}
      {canShowAds() && (
        <div className="px-4 py-2">
          <TopBanner placement="mobile-top" />
        </div>
      )}

      {/* Main Content with mobile padding */}
      <div className="pt-16 pb-20 px-4">
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
