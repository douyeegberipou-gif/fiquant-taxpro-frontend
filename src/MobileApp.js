import React, { useState } from 'react';
import { MobileBottomNav } from './components/mobile/MobileBottomNav';
<<<<<<< HEAD
import Home from './components/Home';
import { TopBanner } from './components/ads/AdBanner';
import { useAds } from './contexts/AdContext';
=======
import { MobileHome } from './components/mobile/MobileHome';
import { MobileHeader } from './components/mobile/MobileHeader';
import { MobilePAYECalculator } from './components/mobile/MobilePAYECalculator';
import { MobileCITCalculator } from './components/mobile/MobileCITCalculator';
import { MobileVATCalculator } from './components/mobile/MobileVATCalculator';
import { MobileCGTCalculator } from './components/mobile/MobileCGTCalculator';
import { MobilePageWrapper } from './components/mobile/MobileCalculatorWrapper';
import { TopBanner } from './components/ads/AdBanner';
import { useAds } from './contexts/AdContext';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Users, Building2, Receipt, TrendingUp, CreditCard, History, User, Info, Wallet } from 'lucide-react';
>>>>>>> 82d959802b17b75986002cc2d4f52f79dc2d5025

/**
 * MOBILE-ONLY APPLICATION
 * Completely separate render tree for mobile devices
<<<<<<< HEAD
=======
 * Features black & gold header, glassmorphism effects, and optimized touch UI
>>>>>>> 82d959802b17b75986002cc2d4f52f79dc2d5025
 */
export const MobileApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { canShowAds } = useAds();
<<<<<<< HEAD
=======
  const { isAuthenticated, user } = useAuth();

  // Page configurations for header
  const pageConfigs = {
    paye: { title: 'PAYE Calculator', subtitle: 'Employee Income Tax', icon: Users },
    cit: { title: 'CIT Calculator', subtitle: 'Company Income Tax', icon: Building2 },
    vat: { title: 'VAT Calculator', subtitle: 'Value Added Tax', icon: Receipt },
    cgt: { title: 'CGT Calculator', subtitle: 'Capital Gains Tax', icon: TrendingUp },
    payments: { title: 'Payments', subtitle: 'Upgrade Your Plan', icon: CreditCard },
    history: { title: 'History', subtitle: 'Past Calculations', icon: History },
    profile: { title: 'Profile', subtitle: 'Your Account', icon: User },
    'tax-info': { title: 'Tax Information', subtitle: 'Guides & Help', icon: Info }
  };

  const goHome = () => setActiveTab('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <MobileHome onNavigate={setActiveTab} />;
      
      case 'paye':
        return <MobilePAYECalculator />;
      
      case 'cit':
        return <MobileCITCalculator />;
      
      case 'vat':
        return <MobileVATCalculator />;
      
      case 'cgt':
        return <MobileCGTCalculator />;
      
      case 'profile':
        return (
          <MobilePageWrapper>
            {isAuthenticated() ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-2xl">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{user?.full_name || 'User'}</h3>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">
                      {user?.account_tier?.toUpperCase() || 'FREE'}
                    </span>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4 mt-4">
                  <p className="text-sm text-gray-400">Account settings and more features coming soon...</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Not Logged In</h3>
                <p className="text-gray-400 mb-4">Login to view your profile</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold"
                >
                  Login / Register
                </button>
              </div>
            )}
          </MobilePageWrapper>
        );
      
      case 'history':
        return (
          <MobilePageWrapper>
            <div className="text-center py-8">
              <History className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Calculation History</h3>
              <p className="text-gray-400">Your past tax calculations will appear here.</p>
              {!isAuthenticated() && (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="mt-4 px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold"
                >
                  Login to View History
                </button>
              )}
            </div>
          </MobilePageWrapper>
        );
      
      case 'tax-info':
        return (
          <MobilePageWrapper>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">Nigerian Tax Information</h3>
              
              <InfoCard
                title="PAYE (Pay As You Earn)"
                description="Personal income tax deducted from employee salaries based on graduated rates from 7% to 24%."
              />
              <InfoCard
                title="CIT (Company Income Tax)"
                description="Tax on company profits. Small companies (turnover under ₦25M) pay 0%, medium companies pay 20%, large companies pay 30%."
              />
              <InfoCard
                title="VAT (Value Added Tax)"
                description="7.5% tax on goods and services. Some items are exempt or zero-rated."
              />
              <InfoCard
                title="CGT (Capital Gains Tax)"
                description="10% tax on gains from disposal of chargeable assets."
              />
            </div>
          </MobilePageWrapper>
        );
      
      case 'payments':
        return (
          <MobilePageWrapper>
            <div className="text-center py-8">
              <Wallet className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Upgrade Your Plan</h3>
              <p className="text-gray-400 mb-6">Unlock unlimited calculations and premium features</p>
              
              <div className="space-y-3">
                <PlanButton
                  name="Pro"
                  price="₦5,000"
                  features={['Unlimited calculations', 'PDF exports', 'Ad-free']}
                  color="blue"
                />
                <PlanButton
                  name="Premium"
                  price="₦15,000"
                  features={['Everything in Pro', 'Priority support', 'API access']}
                  color="yellow"
                />
              </div>
            </div>
          </MobilePageWrapper>
        );
      
      default:
        return <MobileHome onNavigate={setActiveTab} />;
    }
  };
>>>>>>> 82d959802b17b75986002cc2d4f52f79dc2d5025

  const currentConfig = pageConfigs[activeTab];

  return (
<<<<<<< HEAD
    <div className="mobile-app min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Mobile Navigation */}
      <MobileNav 
        activeTab={activeTab}
        onNavigateToTab={setActiveTab}
        onOpenAuth={() => {}}
        onOpenAdmin={() => {}}
      />
=======
    <div className="mobile-app min-h-screen bg-gray-900">
      {/* Black & Gold Header - Only show on non-home pages */}
      {activeTab !== 'home' && currentConfig && (
        <MobileHeader 
          title={currentConfig.title}
          subtitle={currentConfig.subtitle}
          icon={currentConfig.icon}
          onBack={goHome}
          activeTab={activeTab}
          onNavigateToTab={setActiveTab}
          onOpenAuth={() => setShowAuthModal(true)}
        />
      )}
>>>>>>> 82d959802b17b75986002cc2d4f52f79dc2d5025

      {/* Mobile Ad Banner */}
      {canShowAds() && (
        <div className="px-4 py-2">
          <TopBanner placement="mobile-top" />
        </div>
      )}

<<<<<<< HEAD
      {/* Main Content with mobile padding */}
      <div className="pt-16 pb-20 px-4">
        <Home onNavigateToTab={setActiveTab} onOpenAuth={() => {}} />
=======
      {/* Main Content */}
      <div className={activeTab !== 'home' ? 'pb-20' : 'pb-20'}>
        {renderContent()}
>>>>>>> 82d959802b17b75986002cc2d4f52f79dc2d5025
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        activeTab={activeTab}
        onNavigateToTab={setActiveTab}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

// Info Card Component
const InfoCard = ({ title, description }) => (
  <div 
    className="p-4 rounded-lg"
    style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)'
    }}
  >
    <h4 className="font-semibold text-yellow-400 mb-1">{title}</h4>
    <p className="text-sm text-gray-300">{description}</p>
  </div>
);

// Plan Button Component
const PlanButton = ({ name, price, features, color }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    yellow: 'from-yellow-500 to-yellow-600'
  };

  return (
    <div 
      className="p-4 rounded-xl text-left"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${color === 'yellow' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className={`font-bold text-lg ${color === 'yellow' ? 'text-yellow-400' : 'text-blue-400'}`}>{name}</span>
        <span className="text-white font-bold">{price}<span className="text-xs text-gray-400">/mo</span></span>
      </div>
      <ul className="text-xs text-gray-400 mb-3 space-y-1">
        {features.map((f, i) => <li key={i}>• {f}</li>)}
      </ul>
      <button className={`w-full py-2 rounded-lg bg-gradient-to-r ${colors[color]} text-white font-medium text-sm`}>
        Choose {name}
      </button>
    </div>
  );
};

export default MobileApp;
