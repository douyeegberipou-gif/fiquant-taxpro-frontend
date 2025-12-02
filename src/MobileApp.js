import React, { useState } from 'react';
import { MobileNav } from './components/mobile/MobileNav';
import { MobileBottomNav } from './components/mobile/MobileBottomNav';
import Home from './components/Home';
import { TopBanner } from './components/ads/AdBanner';
import { useAds } from './contexts/AdContext';

/**
 * MOBILE-ONLY APPLICATION
 * Completely separate render tree for mobile devices
 */
export const MobileApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { canShowAds } = useAds();

  return (
    <div className="mobile-app min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Mobile Navigation */}
      <MobileNav 
        activeTab={activeTab}
        onNavigateToTab={setActiveTab}
        onOpenAuth={() => {}}
        onOpenAdmin={() => {}}
      />

      {/* Mobile Ad Banner */}
      {canShowAds() && (
        <div className="px-4 py-2">
          <TopBanner placement="mobile-top" />
        </div>
      )}

      {/* Main Content with mobile padding */}
      <div className="pt-16 pb-20 px-4">
        <Home onNavigateToTab={setActiveTab} onOpenAuth={() => {}} />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        activeTab={activeTab}
        onNavigateToTab={setActiveTab}
      />
    </div>
  );
};
