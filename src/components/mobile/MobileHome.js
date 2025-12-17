import React from 'react';
import { Calculator, DollarSign, Building2, Receipt, TrendingUp, CreditCard, History, User, Info, Users } from 'lucide-react';

/**
 * Mobile-optimized Home Page
 * Tile-based interface with glassmorphism effects and tax sheet backgrounds
 * MOBILE ONLY - Desktop uses separate App.js rendering
 */
export const MobileHome = ({ onNavigate }) => {
  // Calculator tiles with background images matching desktop tax calculation sheets
  const calculatorTiles = [
    {
      id: 'paye',
      icon: Users,
      title: 'PAYE',
      description: 'Employee Tax',
      backgroundImage: 'https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/2s52tc3b_Gemini_Generated_Image_k1jwlnk1jwlnk1jw.png',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700'
    },
    {
      id: 'cit',
      icon: Building2,
      title: 'CIT',
      description: 'Company Tax',
      backgroundImage: 'https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/za762luj_Gemini_Generated_Image_ge8ufyge8ufyge8u.png',
      buttonColor: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      id: 'vat',
      icon: Receipt,
      title: 'VAT',
      description: 'Value Added Tax',
      backgroundImage: 'https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/iakm5flx_Gemini_Generated_Image_k1jwlnk1jwlnk1jw%20%283%29.png',
      buttonColor: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      id: 'cgt',
      icon: TrendingUp,
      title: 'CGT',
      description: 'Capital Gains',
      backgroundImage: 'https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/3l8sul24_Gemini_Generated_Image_bhxj3sbhxj3sbhxj.png',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
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

  // Glassmorphism style object for reuse
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  return (
    <div className="min-h-screen bg-gray-900">
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

      {/* Main Content with Background */}
      <div 
        className="px-4 py-6 min-h-screen"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Tax Calculators Section - 2x2 Grid with Background Images */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-yellow-400" />
            Tax Calculators
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {calculatorTiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => onNavigate(tile.id)}
                className="relative rounded-xl overflow-hidden h-36 active:scale-95 transition-transform shadow-lg"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url('${tile.backgroundImage}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Glassmorphism overlay at bottom */}
                <div 
                  className="absolute bottom-0 left-0 right-0 p-3 flex flex-col items-center justify-center"
                  style={glassStyle}
                >
                  <div className="flex items-center mb-1">
                    <tile.icon className="h-4 w-4 text-white mr-1.5" />
                    <h3 className="font-bold text-sm text-white">
                      {tile.title}
                    </h3>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full text-white font-medium ${tile.buttonColor}`}>
                    Calculate Free
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Section with Glassmorphism */}
        <div 
          className="mb-8 rounded-2xl p-4 overflow-hidden"
          style={{
            ...glassStyle,
            background: 'rgba(0, 0, 0, 0.4)'
          }}
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-yellow-400" />
            Pricing Plans
          </h2>
          <div className="space-y-3">
            {/* Free Plan */}
            <div 
              className="rounded-xl p-3 border border-white/20"
              style={{
                ...glassStyle,
                background: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white">Free</h3>
                <span className="text-xl font-bold text-white">₦0</span>
              </div>
              <ul className="text-xs text-gray-200 space-y-1 mb-3">
                <li>• 3 calculations per day</li>
                <li>• Basic features</li>
                <li>• With ads</li>
              </ul>
              <button className="w-full py-2 px-4 bg-white/20 text-white rounded-lg text-sm font-medium border border-white/30">
                Current Plan
              </button>
            </div>

            {/* Pro Plan */}
            <div 
              className="rounded-xl p-3 relative overflow-hidden border-2 border-blue-400"
              style={{
                ...glassStyle,
                background: 'rgba(59, 130, 246, 0.2)'
              }}
            >
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg font-medium">
                Popular
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-blue-300">Pro</h3>
                <span className="text-xl font-bold text-blue-300">₦5,000</span>
              </div>
              <ul className="text-xs text-gray-200 space-y-1 mb-3">
                <li>• Unlimited calculations</li>
                <li>• All features</li>
                <li>• Ad-free experience</li>
                <li>• PDF exports</li>
              </ul>
              <button 
                onClick={() => onNavigate('payments')}
                className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium active:scale-95 transition-transform shadow-lg"
              >
                Upgrade Now
              </button>
            </div>

            {/* Premium Plan */}
            <div 
              className="rounded-xl p-3 border-2 border-yellow-400"
              style={{
                ...glassStyle,
                background: 'rgba(234, 179, 8, 0.15)'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-yellow-300">Premium</h3>
                <span className="text-xl font-bold text-yellow-300">₦15,000</span>
              </div>
              <ul className="text-xs text-gray-200 space-y-1 mb-3">
                <li>• Everything in Pro</li>
                <li>• Priority support</li>
                <li>• Bulk calculations</li>
                <li>• API access</li>
              </ul>
              <button 
                onClick={() => onNavigate('payments')}
                className="w-full py-2 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg text-sm font-medium active:scale-95 transition-transform shadow-lg"
              >
                Get Premium
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions with Glassmorphism */}
        <div 
          className="mb-6 rounded-2xl p-4"
          style={{
            ...glassStyle,
            background: 'rgba(0, 0, 0, 0.4)'
          }}
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            <Info className="h-5 w-5 mr-2 text-yellow-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {actionTiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => onNavigate(tile.id)}
                className="rounded-xl p-4 active:scale-95 transition-transform border border-white/20"
                style={{
                  ...glassStyle,
                  background: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tile.color} flex items-center justify-center mb-2 mx-auto shadow-lg`}>
                  <tile.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-sm text-white text-center mb-0.5">
                  {tile.title}
                </h3>
                <p className="text-xs text-gray-300 text-center">
                  {tile.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer spacer for bottom nav */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

