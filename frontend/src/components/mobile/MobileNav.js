import React, { useState } from 'react';
import { Menu, X, Home, Calculator, TrendingUp, FileText, Receipt, Wallet, User, Settings, LogOut, Building2, Info, LogIn, ChevronUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const MobileNav = ({ activeTab, onNavigateToTab, onOpenAuth, onOpenAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavigation = (tab) => {
    onNavigateToTab(tab);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <img 
              src="https://customer-assets.emergentagent.com/job_taxpro-ng/artifacts/i2zrdiwl_Fiquant%20Consult%20-%20Transparent%202.png"
              alt="Fiquant"
              className="h-8 w-auto"
            />
            <span className="font-bold text-lg text-gray-800">TaxPro</span>
          </div>

          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 mt-14"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed top-14 left-0 right-0 bottom-0 bg-white z-50 overflow-y-auto">
            <div className="p-4 space-y-2">
              {/* User Info */}
              {isAuthenticated() && user && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{user.full_name || 'User'}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {user.account_tier || 'FREE'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <NavItem icon={Home} label="Home" onClick={() => handleNavigation('home')} active={activeTab === 'home'} />
              
              {/* Calculators Section */}
              <CalculatorSection 
                activeTab={activeTab}
                onNavigate={handleNavigation}
              />
              
              <NavItem icon={Wallet} label="Payments" onClick={() => handleNavigation('payments')} active={activeTab === 'payments'} />
              <NavItem icon={FileText} label="History" onClick={() => handleNavigation('history')} active={activeTab === 'history'} />
              <NavItem icon={Info} label="Tax Info" onClick={() => handleNavigation('tax-info')} active={activeTab === 'tax-info'} />

              {/* Divider */}
              <div className="my-4 border-t border-gray-200"></div>

              {/* User Actions */}
              {isAuthenticated() ? (
                <>
                  <NavItem icon={User} label="Profile" onClick={() => handleNavigation('profile')} active={activeTab === 'profile'} />
                  {user?.admin_enabled && (
                    <NavItem icon={Settings} label="Admin" onClick={onOpenAdmin} />
                  )}
                  <NavItem icon={LogOut} label="Logout" onClick={logout} variant="danger" />
                </>
              ) : (
                <button
                  onClick={() => {
                    onOpenAuth();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors"
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

const CalculatorSection = ({ activeTab, onNavigate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const calculators = [
    { id: 'paye', icon: Calculator, label: 'PAYE Calculator' },
    { id: 'cit', icon: Building2, label: 'CIT Calculator' },
    { id: 'vat', icon: Receipt, label: 'VAT Calculator' },
    { id: 'cgt', icon: TrendingUp, label: 'CGT Calculator' }
  ];

  const isCalculatorActive = calculators.some(calc => calc.id === activeTab);

  return (
    <div className="mb-2">
      {/* Calculator Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors font-medium ${
          isCalculatorActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center space-x-3">
          <Calculator className="h-5 w-5" />
          <span>Tax Calculators</span>
        </div>
        <ChevronUp className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expandable Calculator List */}
      {isExpanded && (
        <div className="ml-8 mt-1 space-y-1">
          {calculators.map((calc) => (
            <button
              key={calc.id}
              onClick={() => onNavigate(calc.id)}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                activeTab === calc.id
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <calc.icon className="h-4 w-4" />
              <span>{calc.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const NavItem = ({ icon: Icon, label, onClick, active, variant = 'default' }) => {
  const baseClasses = "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-medium";
  const variantClasses = {
    default: active 
      ? "bg-blue-50 text-blue-600" 
      : "text-gray-700 hover:bg-gray-50",
    danger: "text-red-600 hover:bg-red-50"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );
};
