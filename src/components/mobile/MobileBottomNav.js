import React, { useState } from 'react';
import { Home, Calculator, User, ChevronUp, X, DollarSign, Building2, Receipt, TrendingUp, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Sticky bottom navigation for mobile devices with calculator dropdown
 */
export const MobileBottomNav = ({ activeTab, onNavigateToTab }) => {
  const { isAuthenticated, user } = useAuth();
  const [showCalculatorMenu, setShowCalculatorMenu] = useState(false);

  const calculators = [
    { id: 'paye', icon: DollarSign, label: 'PAYE Calculator', description: 'Employee tax calculation' },
    { id: 'cit', icon: Building2, label: 'CIT Calculator', description: 'Company Income Tax' },
    { id: 'vat', icon: Receipt, label: 'VAT Calculator', description: 'Value Added Tax' },
    { id: 'cgt', icon: TrendingUp, label: 'CGT Calculator', description: 'Capital Gains Tax' }
  ];

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'calculator', icon: Calculator, label: 'Calculate', isDropdown: true },
    { id: 'tax-info', icon: Info, label: 'Tax Library' },
    { id: 'profile', icon: User, label: 'Account' }
  ];

  const handleNavClick = (item) => {
    if (item.isDropdown) {
      setShowCalculatorMenu(!showCalculatorMenu);
    } else {
      onNavigateToTab(item.id);
      setShowCalculatorMenu(false);
    }
  };

  const handleCalculatorSelect = (calculatorId) => {
    onNavigateToTab(calculatorId);
    setShowCalculatorMenu(false);
  };

  return (
    <>
      {/* Calculator Dropdown Menu */}
      {showCalculatorMenu && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowCalculatorMenu(false)}
          />
          
          {/* Menu */}
          <div className="fixed bottom-16 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[70vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Tax Calculators</h3>
              <button
                onClick={() => setShowCalculatorMenu(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Calculator Options */}
            <div className="p-2">
              {calculators.map((calc) => (
                <button
                  key={calc.id}
                  onClick={() => handleCalculatorSelect(calc.id)}
                  className={`w-full flex items-center p-4 rounded-lg mb-2 transition-colors ${
                    activeTab === calc.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className={`p-3 rounded-full ${
                    activeTab === calc.id ? 'bg-blue-100' : 'bg-white'
                  }`}>
                    <calc.icon className={`h-6 w-6 ${
                      activeTab === calc.id ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="ml-4 text-left">
                    <div className={`font-medium ${
                      activeTab === calc.id ? 'text-blue-600' : 'text-gray-800'
                    }`}>
                      {calc.label}
                    </div>
                    <div className="text-sm text-gray-500">{calc.description}</div>
                  </div>
                  {activeTab === calc.id && (
                    <div className="ml-auto">
                      <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Footer tip */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                Select a calculator to begin your tax computation
              </p>
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation Bar - 4 Static Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom shadow-lg">
        <nav className="grid grid-cols-4 gap-0 px-2 py-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 relative ${
                (activeTab === item.id || (item.isDropdown && showCalculatorMenu))
                  ? 'text-blue-600 bg-blue-50 scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              aria-label={item.label}
            >
              {item.isDropdown && showCalculatorMenu ? (
                <ChevronUp className="h-6 w-6 mb-1.5 stroke-2 animate-pulse" />
              ) : (
                <item.icon className={`h-6 w-6 mb-1.5 ${
                  activeTab === item.id ? 'stroke-2' : 'stroke-1.5'
                }`} />
              )}
              <span className={`text-xs font-medium ${
                activeTab === item.id ? 'font-semibold' : 'font-normal'
              }`}>
                {item.label}
              </span>
              
              {/* Active indicator for calculator submenu */}
              {item.isDropdown && ['paye', 'cit', 'vat', 'cgt'].includes(activeTab) && (
                <div className="absolute top-1.5 right-1.5">
                  <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
                </div>
              )}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};
