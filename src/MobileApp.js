import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MobileBottomNav } from './components/mobile/MobileBottomNav';
import { MobileHome } from './components/mobile/MobileHome';
import { MobileHeader } from './components/mobile/MobileHeader';
import { MobilePAYECalculator } from './components/mobile/MobilePAYECalculator';
import { MobileCITCalculator } from './components/mobile/MobileCITCalculator';
import { MobileVATCalculator } from './components/mobile/MobileVATCalculator';
import { MobileCGTCalculator } from './components/mobile/MobileCGTCalculator';
import MobileTaxLibrary from './components/mobile/MobileTaxLibrary';
import { MobilePageWrapper } from './components/mobile/MobileCalculatorWrapper';
import { TopBanner } from './components/ads/AdBanner';
import { useAds } from './contexts/AdContext';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Users, Building2, Receipt, TrendingUp, CreditCard, History, User, Info, Wallet, CheckCircle, XCircle, Loader } from 'lucide-react';
import { trackTabChange, trackPageView } from './services/analyticsService';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

/**
 * MOBILE-ONLY APPLICATION
 * Completely separate render tree for mobile devices
 * Features black & gold header, glassmorphism effects, and optimized touch UI
 */
export const MobileApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { canShowAds } = useAds();
  const { isAuthenticated, user } = useAuth();
  
  // Email verification state
  const [verificationStatus, setVerificationStatus] = useState(null); // 'verifying', 'success', 'error'
  const [verificationMessage, setVerificationMessage] = useState('');

  // Track initial page view and tab changes for mobile analytics
  useEffect(() => {
    trackPageView('mobile_home', '/mobile');
  }, []);
  
  useEffect(() => {
    trackTabChange(`mobile_${activeTab}`);
  }, [activeTab]);
  
  // Handle email verification
  const handleEmailVerification = async (token, email) => {
    setVerificationStatus('verifying');
    setVerificationMessage('Verifying your email address...');
    
    try {
      await axios.post(`${API}/auth/verify-email`, null, {
        params: { token, email }
      });
      
      setVerificationStatus('success');
      setVerificationMessage('Email verified successfully! You can now log in to your account.');
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Auto-open login modal after successful verification
      setTimeout(() => {
        setShowAuthModal(true);
      }, 2000);
      
    } catch (error) {
      setVerificationStatus('error');
      setVerificationMessage(error.response?.data?.detail || 'Email verification failed. Please try again or contact support.');
    }
  };
  
  // Check for email verification on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');
    
    if (token && email) {
      // Use a flag to prevent double-calling
      let isMounted = true;
      
      const verifyEmail = async () => {
        if (isMounted) {
          await handleEmailVerification(token, email);
        }
      };
      
      verifyEmail();
      
      return () => {
        isMounted = false;
      };
    }
  }, []);

  // Page configurations for header
  const pageConfigs = {
    paye: { title: 'PAYE Calculator', subtitle: 'Employee Income Tax', icon: Users },
    cit: { title: 'CIT Calculator', subtitle: 'Company Income Tax', icon: Building2 },
    vat: { title: 'VAT Calculator', subtitle: 'Value Added Tax', icon: Receipt },
    cgt: { title: 'CGT Calculator', subtitle: 'Capital Gains Tax', icon: TrendingUp },
    payments: { title: 'Vendor Payments', subtitle: 'WHT Processing', icon: CreditCard },
    history: { title: 'History', subtitle: 'Past Calculations', icon: History },
    profile: { title: 'Profile', subtitle: 'Your Account', icon: User },
    'tax-info': { title: 'Tax Library', subtitle: 'NTA 2025 Guide', icon: Info }
  };

  const goHome = () => setActiveTab('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <MobileHome onNavigate={setActiveTab} onOpenAuth={() => setShowAuthModal(true)} />;
      
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
            {isAuthenticated() && user?.account_tier && ['pro', 'premium', 'enterprise'].includes(user.account_tier.toLowerCase()) ? (
              <div className="text-center py-8">
                <History className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Calculation History</h3>
                <p className="text-gray-400">Your past tax calculations will appear here.</p>
                <p className="text-sm text-gray-500 mt-4">History feature coming to mobile soon!</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <History className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Calculation History</h3>
                <p className="text-gray-400 mb-4">Access your complete calculation history and reprint past reports.</p>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4 mx-4">
                  <p className="text-sm text-blue-300">
                    <strong>Pro Feature:</strong> Upgrade to Pro or higher to unlock calculation history.
                  </p>
                </div>
                {!isAuthenticated() ? (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold"
                  >
                    Login to Continue
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold"
                  >
                    Upgrade to Pro
                  </button>
                )}
              </div>
            )}
          </MobilePageWrapper>
        );
      
      case 'tax-info':
        return (
          <MobilePageWrapper showAd={false}>
            <MobileTaxLibrary />
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

  const currentConfig = pageConfigs[activeTab];

  return (
    <div className="mobile-app min-h-screen bg-gray-900">
      {/* Email Verification Status Banner */}
      {verificationStatus && (
        <div 
          className={`fixed top-0 left-0 right-0 z-[100] p-4 ${
            verificationStatus === 'success' ? 'bg-green-500' : 
            verificationStatus === 'error' ? 'bg-red-500' : 
            'bg-yellow-500'
          }`}
        >
          <div className="flex items-center justify-center space-x-3">
            {verificationStatus === 'verifying' && (
              <Loader className="h-5 w-5 text-white animate-spin" />
            )}
            {verificationStatus === 'success' && (
              <CheckCircle className="h-5 w-5 text-white" />
            )}
            {verificationStatus === 'error' && (
              <XCircle className="h-5 w-5 text-white" />
            )}
            <span className="text-white font-medium text-sm">{verificationMessage}</span>
          </div>
          {verificationStatus !== 'verifying' && (
            <button
              onClick={() => setVerificationStatus(null)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      )}
      
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

      {/* Mobile Ad Banner - Only on home */}
      {canShowAds() && activeTab === 'home' && (
        <div className="px-4 py-2 bg-white">
          <TopBanner placement="mobile-top" />
        </div>
      )}

      {/* Main Content */}
      <div className={activeTab !== 'home' ? 'pb-20' : 'pb-20'}>
        {renderContent()}
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
