import React from 'react';
import { Calculator, DollarSign, Building2, Receipt, TrendingUp, CreditCard, History, User, Info } from 'lucide-react';

/**
 * Mobile-optimized Home Page
 * Tile-based interface with direct access to all features
 */
export const MobileHome = ({ onNavigate }) => {
  const calculatorTiles = [
    {
      id: 'paye',
      icon: DollarSign,
      title: 'PAYE Calculator',
      description: 'Employee Tax',
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600'
    },
    {
      id: 'cit',
      icon: Building2,
      title: 'CIT Calculator',
      description: 'Company Tax',
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600'
    },
    {
      id: 'vat',
      icon: Receipt,
      title: 'VAT Calculator',
      description: 'Value Added Tax',
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600'
    },
    {
      id: 'cgt',
      icon: TrendingUp,
      title: 'CGT Calculator',
      description: 'Capital Gains',
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-600'
    }
  ];

  const actionTiles = [
    {
      id: 'payments',
      icon: CreditCard,
      title: 'Payments',
      description: 'Upgrade Plan',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'history',
      icon: History,
      title: 'History',
      description: 'View Past Results',
      color: 'from-gray-500 to-gray-600'
    },
    {
      id: 'profile',
      icon: User,
      title: 'Profile',
      description: 'Your Account',
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 'tax-info',
      icon: Info,
      title: 'Tax Info',
      description: 'Help & Guides',
      color: 'from-teal-500 to-teal-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header - Black with Gold Accents */}
      <div className="bg-black px-4 py-6">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="https://customer-assets.emergentagent.com/job_95506f1f-f280-448b-bce0-6221f9e9533d/artifacts/jdh4b8ji_Fiquant%20Logo%20-%20Bold%20Diamond.png"
            alt="Fiquant TaxPro"
            className="h-14 w-14"
          />
          <div className="ml-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Fiquant
            </h1>
            <p className="text-sm text-yellow-400 font-light">TaxPro 2026</p>
          </div>
        </div>
        <p className="text-center text-sm text-gray-300">
          Nigerian Tax Calculators - Fast & Accurate
        </p>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Tax Calculators Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Tax Calculators</h2>
          <div className="grid grid-cols-2 gap-3">
            {calculatorTiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => onNavigate(tile.id)}
                className="bg-white rounded-xl shadow-md p-4 active:scale-95 transition-transform"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tile.color} flex items-center justify-center mb-3 mx-auto`}>
                  <tile.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className={`font-semibold text-sm ${tile.textColor} text-center mb-1`}>
                  {tile.title}
                </h3>
                <p className="text-xs text-gray-500 text-center">
                  {tile.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Section - Compact */}
        <div className="mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Pricing Plans</h2>
          <div className="space-y-3">
            {/* Free Plan */}
            <div className="bg-white rounded-lg p-3 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-800">Free</h3>
                <span className="text-2xl font-bold text-gray-800">₦0</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1 mb-3">
                <li>• 3 calculations per day</li>
                <li>• Basic features</li>
                <li>• With ads</li>
              </ul>
              <button className="w-full py-2 px-4 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                Current Plan
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-lg p-3 border-2 border-blue-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg font-medium">
                Popular
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-blue-600">Pro</h3>
                <span className="text-2xl font-bold text-blue-600">₦5,000</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1 mb-3">
                <li>• Unlimited calculations</li>
                <li>• All features</li>
                <li>• Ad-free experience</li>
                <li>• PDF exports</li>
              </ul>
              <button 
                onClick={() => onNavigate('payments')}
                className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium active:scale-95 transition-transform"
              >
                Upgrade Now
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-lg p-3 border-2 border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-yellow-600">Premium</h3>
                <span className="text-2xl font-bold text-yellow-600">₦15,000</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1 mb-3">
                <li>• Everything in Pro</li>
                <li>• Priority support</li>
                <li>• Bulk calculations</li>
                <li>• API access</li>
              </ul>
              <button 
                onClick={() => onNavigate('payments')}
                className="w-full py-2 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg text-sm font-medium active:scale-95 transition-transform"
              >
                Get Premium
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {actionTiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => onNavigate(tile.id)}
                className="bg-white rounded-xl shadow-md p-4 active:scale-95 transition-transform"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tile.color} flex items-center justify-center mb-3 mx-auto`}>
                  <tile.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm text-gray-800 text-center mb-1">
                  {tile.title}
                </h3>
                <p className="text-xs text-gray-500 text-center">
                  {tile.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
