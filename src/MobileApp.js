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
import { Users, Building2, Receipt, TrendingUp, CreditCard, History, User, Info, Wallet, CheckCircle, XCircle, Loader, AlertTriangle, Trash2, Crown } from 'lucide-react';
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
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { canShowAds } = useAds();
  const { isAuthenticated, user, logout } = useAuth();
  
  // Email verification state
  const [verificationStatus, setVerificationStatus] = useState(null); // 'verifying', 'success', 'error'
  const [verificationMessage, setVerificationMessage] = useState('');
  
  // PWA Install prompt state
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  
  // Capture the beforeinstallprompt event for PWA installation
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the default browser prompt
      e.preventDefault();
      // Store the event for later use
      setInstallPrompt(e);
      // Show our custom install banner
      setShowInstallBanner(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBanner(false);
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  // Handle install button click
  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show the native install prompt
    installPrompt.prompt();
    
    // Wait for user response
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    
    // Clear the stored prompt
    setInstallPrompt(null);
  };
  
  // Dismiss install banner
  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    // Optionally store in localStorage to not show again for a while
    localStorage.setItem('installBannerDismissed', Date.now().toString());
  };

  // Navigate to tab and scroll to top
  const navigateToTab = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  
  // Handle subscription upgrade - directly initiate payment
  const handleSubscriptionUpgrade = async (planId) => {
    if (!isAuthenticated || !isAuthenticated()) {
      setShowAuthModal(true);
      return;
    }
    
    try {
      // Show loading state
      setSelectedPlan(planId);
      
      const token = localStorage.getItem('token');
      const callbackUrl = `${window.location.origin}/subscription/callback`;
      
      const response = await axios.post(`${API}/subscription/upgrade`, {
        plan_id: planId,
        billing_cycle: 'monthly',
        use_saved_card: false,
        callback_url: callbackUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Handle response based on status
      if (response.data) {
        if (response.data.status === 'success') {
          // Payment was charged directly using saved card
          alert(`${response.data.message || 'Subscription activated successfully!'}`);
          setSelectedPlan(null);
          // Reload to refresh user tier
          window.location.reload();
        } else if (response.data.status === 'payment_required' && response.data.authorization_url) {
          // Redirect to Paystack payment page for new payment
          window.location.href = response.data.authorization_url;
        } else {
          alert('Payment initialization failed. Please try again.');
          setSelectedPlan(null);
        }
      } else {
        alert('Payment initialization failed. Please try again.');
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      // Properly extract error message
      let errorMessage = 'Failed to initialize payment. Please try again.';
      if (error.response && error.response.data) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (typeof error.response.data.message === 'string') {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert(errorMessage);
      setSelectedPlan(null);
    }
  };
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
    payments: { title: 'Subscription Plans', subtitle: 'Upgrade Your Account', icon: Crown },
    history: { title: 'History', subtitle: 'Past Calculations', icon: History },
    profile: { title: 'Profile', subtitle: 'Your Account', icon: User },
    'tax-info': { title: 'Tax Library', subtitle: 'NTA 2025 Guide', icon: Info }
  };

  const goHome = () => navigateToTab('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <MobileHome 
          onNavigate={navigateToTab} 
          onOpenAuth={() => setShowAuthModal(true)} 
          onSubscribe={handleSubscriptionUpgrade} 
          selectedPlan={selectedPlan}
          showInstallBanner={showInstallBanner}
          onInstallClick={handleInstallClick}
          onDismissInstall={dismissInstallBanner}
        />;
      
      case 'paye':
        return <MobilePAYECalculator onShowUpgradeModal={() => navigateToTab('payments')} />;
      
      case 'cit':
        return <MobileCITCalculator onShowUpgradeModal={() => navigateToTab('payments')} />;
      
      case 'vat':
        return <MobileVATCalculator onShowUpgradeModal={() => navigateToTab('payments')} />;
      
      case 'cgt':
        return <MobileCGTCalculator onShowUpgradeModal={() => navigateToTab('payments')} />;
      
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
                
                {/* Account Actions */}
                <div className="border-t border-white/10 pt-4 mt-4 space-y-3">
                  <button
                    onClick={logout}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium flex items-center justify-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
                
                {/* Danger Zone - Delete Account */}
                <div className="border-t border-red-500/30 pt-4 mt-6">
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      <h4 className="font-semibold text-red-400">Danger Zone</h4>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      Permanently delete your account and all data. This cannot be undone.
                    </p>
                    <button
                      onClick={() => {
                        const confirmText = prompt('Type DELETE to confirm account deletion:');
                        if (confirmText === 'DELETE') {
                          const deleteAccount = async () => {
                            try {
                              const token = localStorage.getItem('token');
                              await axios.delete(`${API}/auth/delete-account`, {
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              alert('Account deleted successfully.');
                              logout();
                            } catch (error) {
                              alert(error.response?.data?.detail || 'Failed to delete account.');
                            }
                          };
                          deleteAccount();
                        } else if (confirmText !== null) {
                          alert('Deletion cancelled. You must type DELETE exactly.');
                        }
                      }}
                      className="w-full px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 font-medium flex items-center justify-center gap-2 text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </button>
                  </div>
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
            <div className="text-center py-6">
              <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Upgrade Your Plan</h3>
              <p className="text-gray-400 text-sm mb-4">Unlock unlimited calculations and premium features</p>
              
              <div className="space-y-3">
                <PlanButton
                  name="Starter"
                  price="₦4,999"
                  features={['Unlimited calculations', 'Basic PDF export', 'Bulk PAYE (10 staff)', 'Net Payments (1 emp)', '20 saved calcs']}
                  color="emerald"
                  badge="Best Value"
                  onClick={() => handleSubscriptionUpgrade('starter')}
                  isLoading={selectedPlan === 'starter'}
                />
                <PlanButton
                  name="Pro"
                  price="₦7,999"
                  originalPrice="₦9,999"
                  features={['Everything in Starter +', 'Bulk PAYE (25 staff)', 'Net Payments (25 emp)', '100 saved calcs', '5 templates']}
                  color="blue"
                  badge="Best for SMEs"
                  onClick={() => handleSubscriptionUpgrade('pro')}
                  isLoading={selectedPlan === 'pro'}
                />
                <PlanButton
                  name="Premium"
                  price="₦14,999"
                  originalPrice="₦19,999"
                  features={['Everything in Pro +', 'Unlimited staff', 'Analytics dashboard', 'Priority support', '20 templates']}
                  color="yellow"
                  badge="For Enterprises"
                  onClick={() => handleSubscriptionUpgrade('premium')}
                  isLoading={selectedPlan === 'premium'}
                />
              </div>
              
              <p className="text-gray-500 text-xs mt-4">All plans include 7-day free trial</p>
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
          onNavigateToTab={navigateToTab}
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
        onNavigateToTab={navigateToTab}
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
const PlanButton = ({ name, price, originalPrice, features, color, badge, onClick, isLoading }) => {
  const colors = {
    blue: { gradient: 'from-blue-500 to-blue-600', border: 'rgba(59, 130, 246, 0.3)', text: 'text-blue-400', badge: 'bg-blue-600' },
    yellow: { gradient: 'from-yellow-500 to-yellow-600', border: 'rgba(234, 179, 8, 0.3)', text: 'text-yellow-400', badge: 'bg-yellow-600' },
    emerald: { gradient: 'from-emerald-500 to-emerald-600', border: 'rgba(16, 185, 129, 0.3)', text: 'text-emerald-400', badge: 'bg-emerald-500' }
  };
  
  const c = colors[color] || colors.blue;

  return (
    <div 
      className="p-4 rounded-xl text-left relative"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${c.border}`
      }}
    >
      {badge && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${c.badge}`}>
            {badge}
          </span>
        </div>
      )}
      <div className="flex justify-between items-center mb-2 mt-1">
        <span className={`font-bold text-lg ${c.text}`}>{name}</span>
        <div className="text-right">
          {originalPrice && (
            <span className="text-xs text-gray-500 line-through mr-1">{originalPrice}</span>
          )}
          <span className="text-white font-bold">{price}<span className="text-xs text-gray-400">/mo</span></span>
        </div>
      </div>
      <ul className="text-xs text-gray-400 mb-3 space-y-1">
        {features.map((f, i) => <li key={i}>• {f}</li>)}
      </ul>
      <button 
        onClick={onClick}
        disabled={isLoading}
        className={`w-full py-2 rounded-lg bg-gradient-to-r ${c.gradient} text-white font-medium text-sm flex items-center justify-center gap-2 ${isLoading ? 'opacity-70' : ''}`}
      >
        {isLoading ? (
          <>
            <Loader className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Crown className="h-4 w-4" />
            Choose {name}
          </>
        )}
      </button>
    </div>
  );
};

export default MobileApp;
