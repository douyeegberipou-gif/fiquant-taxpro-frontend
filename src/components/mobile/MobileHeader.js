import React, { useState } from 'react';
import { Menu, X, Home, Calculator, TrendingUp, FileText, Receipt, Wallet, User, Settings, LogOut, Building2, Info, LogIn, ChevronDown, ArrowLeft, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * MOBILE-ONLY Black & Gold Header Component
 * Used for all non-home pages in the mobile app
 */
export const MobileHeader = ({ title, subtitle, icon: Icon, onBack, activeTab, onNavigateToTab, onOpenAuth }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  const handleNavigation = (tab) => {
    onNavigateToTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Fixed Black & Gold Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Main Header */}
        <div className="bg-black px-3 py-2.5">
          <div className="flex items-center justify-between w-full">
            {/* Left: Back Button + Logo */}
            <div className="flex items-center flex-shrink-0">
              <button
                onClick={onBack}
                className="p-2.5 mr-1 rounded-lg hover:bg-white/10 transition-colors active:scale-95"
                aria-label="Go back"
              >
                <ArrowLeft className="h-7 w-7 text-yellow-400" />
              </button>
              <img 
                src="https://customer-assets.emergentagent.com/job_95506f1f-f280-448b-bce0-6221f9e9533d/artifacts/jdh4b8ji_Fiquant%20Logo%20-%20Bold%20Diamond.png"
                alt="Fiquant"
                className="h-7 w-7"
              />
              <div className="ml-1.5">
                <span className="font-bold text-base bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  Fiquant
                </span>
                <span className="text-yellow-400 text-[10px] ml-0.5">TaxPro</span>
              </div>
            </div>

            {/* Right: Menu Button - pushed to far right */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Page Title Bar */}
        <div 
          className="px-4 py-3 flex items-center space-x-3"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,30,0.95) 100%)',
            borderBottom: '2px solid rgba(234, 179, 8, 0.3)'
          }}
        >
          {Icon && (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
              <Icon className="h-5 w-5 text-black" />
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-white">{title}</h1>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 z-40"
            style={{ top: '120px' }}
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div 
            className="fixed left-0 right-0 z-50 max-h-[60vh] overflow-y-auto"
            style={{ 
              top: '120px',
              background: 'rgba(0,0,0,0.95)',
              backdropFilter: 'blur(16px)',
              borderBottom: '1px solid rgba(234, 179, 8, 0.2)'
            }}
          >
            <div className="p-4 space-y-2">
              {/* User Info */}
              {isAuthenticated() && user && (
                <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold">
                      {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{user.full_name || 'User'}</p>
                      <span className="text-xs text-yellow-400">{user.account_tier || 'FREE'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <MenuNavItem icon={Home} label="Home" onClick={() => handleNavigation('home')} active={activeTab === 'home'} />
              
              {/* Calculator Items */}
              <div className="pt-2 pb-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mb-2">Calculators</p>
              </div>
              <MenuNavItem icon={Users} label="PAYE Calculator" onClick={() => handleNavigation('paye')} active={activeTab === 'paye'} />
              <MenuNavItem icon={Building2} label="CIT Calculator" onClick={() => handleNavigation('cit')} active={activeTab === 'cit'} />
              <MenuNavItem icon={Receipt} label="VAT Calculator" onClick={() => handleNavigation('vat')} active={activeTab === 'vat'} />
              <MenuNavItem icon={TrendingUp} label="CGT Calculator" onClick={() => handleNavigation('cgt')} active={activeTab === 'cgt'} />
              
              <div className="my-3 border-t border-gray-700"></div>
              
              <MenuNavItem icon={Wallet} label="Payments" onClick={() => handleNavigation('payments')} active={activeTab === 'payments'} />
              <MenuNavItem icon={FileText} label="History" onClick={() => handleNavigation('history')} active={activeTab === 'history'} />
              <MenuNavItem icon={Info} label="Tax Info" onClick={() => handleNavigation('tax-info')} active={activeTab === 'tax-info'} />

              <div className="my-3 border-t border-gray-700"></div>

              {/* Auth Actions */}
              {isAuthenticated() ? (
                <>
                  <MenuNavItem icon={User} label="Profile" onClick={() => handleNavigation('profile')} active={activeTab === 'profile'} />
                  <MenuNavItem icon={LogOut} label="Logout" onClick={logout} variant="danger" />
                </>
              ) : (
                <button
                  onClick={() => {
                    onOpenAuth();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Login / Register</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

const MenuNavItem = ({ icon: Icon, label, onClick, active, variant = 'default' }) => {
  const getStyles = () => {
    if (variant === 'danger') {
      return 'text-red-400 hover:bg-red-900/30';
    }
    if (active) {
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    }
    return 'text-gray-300 hover:bg-white/10';
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-medium ${getStyles()}`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );
};

export default MobileHeader;
