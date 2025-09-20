import React, { useState } from 'react';
import { Card, CardContent } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { 
  AlertTriangle, Users, Building2, Calculator, Receipt, TrendingUp, CreditCard, Target, CheckCircle, 
  Shield, Clock, FileCheck, Star, ArrowRight, ChevronDown, ChevronUp, Award, Lock, Phone, Mail,
  Heart, Zap, MousePointer, Download, History, DollarSign, BarChart3, Globe
} from 'lucide-react';

const Home = ({ onNavigateToTab }) => {
  const [activeTab, setActiveTab] = useState('free');
  const [expandedFaq, setExpandedFaq] = useState(null);

  return (
    <div className="min-h-screen bg-black">
      {/* Trust Strip */}
      <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 text-center py-2 px-4">
        <p className="text-yellow-100 text-xs sm:text-sm font-medium">
          NRS-aligned • Used by SMEs & Accountants • Encrypted & Secure
        </p>
      </div>

      {/* Hero Section */}
      <section className="relative bg-black text-white py-16 sm:py-20 md:py-24 px-4 sm:px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-yellow-400/10 to-yellow-500/10 rounded-full blur-3xl transform -translate-x-16 translate-y-16"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          {/* Logo and Brand */}
          <div className="flex flex-col sm:flex-row items-center justify-center mb-8 sm:mb-10">
            <img 
              src="https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/q9xbgjwy_Fiquant%20Consult%20-%20Transparent%20%28Logo%20Only%29.png" 
              alt="Fiquant Consult Logo" 
              className="h-16 w-16 sm:h-20 sm:w-20 mb-4 sm:mb-0 sm:mr-4"
            />
            <div className="text-center sm:text-left">
              <img 
                src="https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/aa6pe5bc_Fiquant%20Consult%20-%20Transparent%20%28Name%20only%29.png" 
                alt="Fiquant Consult" 
                className="h-10 sm:h-14 mb-3 mx-auto sm:mx-0"
              />
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                TaxPro 2026
              </h2>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 sm:mb-8">
            Did you know? Filing the wrong tax under the Nigeria Tax Act 2025 can land you in trouble?
          </h1>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-8 sm:mb-10 max-w-5xl mx-auto leading-relaxed">
            Fiquant TaxPro — NTA 2025-compliant tax calculators and compliance tools.<br/>
            Get instant, accurate PAYE, CIT, VAT, CGT & payment calculations — free. Protect revenue. Avoid fines. Don't rely on luck, be prepared.
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              onClick={() => onNavigateToTab('calculator')}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 px-8 rounded-full text-lg transform hover:scale-105 transition-all duration-200 shadow-2xl w-full sm:w-auto"
            >
              See how much taxes you owe in 60 seconds — Free & NTA-Compliant
            </Button>
            <Button 
              onClick={() => onNavigateToTab('calculator', { mode: 'bulk' })}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black py-4 px-8 rounded-full text-lg font-bold w-full sm:w-auto"
            >
              For Businesses: Run Bulk PAYE
            </Button>
          </div>
        </div>
      </section>

      {/* Microflow Section */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            Get answers in 60 seconds
          </h3>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MousePointer className="h-8 w-8 text-black" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Choose</h4>
              <p className="text-gray-300">PAYE / CIT / VAT / CGT / Payment</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="h-8 w-8 text-black" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Enter</h4>
              <p className="text-gray-300">salary, turnover, invoice or upload payslip</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-black" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Get</h4>
              <p className="text-gray-300">instant NTA-compliant result + downloadable PDF</p>
            </div>
          </div>
          <div className="text-center">
            <Button 
              onClick={() => onNavigateToTab('calculator')}
              variant="link"
              className="text-yellow-400 hover:text-yellow-300 text-lg underline"
            >
              Try Demo Calculation (No signup)
            </Button>
          </div>
        </div>
      </section>

      {/* Floating: "What do you want to do?" */}
      <section className="py-16 px-4 sm:px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">
            What do you want to do?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              onClick={() => onNavigateToTab('calculator')}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-yellow-400 group-hover:text-yellow-300" />
                <span className="text-white font-medium group-hover:text-yellow-100">I want to Calculate my PAYE</span>
              </div>
            </div>
            <div 
              onClick={() => onNavigateToTab('calculator', { mode: 'bulk' })}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center space-x-3">
                <Building2 className="h-6 w-6 text-yellow-400 group-hover:text-yellow-300" />
                <span className="text-white font-medium group-hover:text-yellow-100">I want to Run Bulk PAYE for my team</span>
              </div>
            </div>
            <div 
              onClick={() => onNavigateToTab('cit')}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center space-x-3">
                <Calculator className="h-6 w-6 text-yellow-400 group-hover:text-yellow-300" />
                <span className="text-white font-medium group-hover:text-yellow-100">I want to Estimate my Company Tax (CIT)</span>
              </div>
            </div>
            <div 
              onClick={() => onNavigateToTab('vat')}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center space-x-3">
                <Receipt className="h-6 w-6 text-yellow-400 group-hover:text-yellow-300" />
                <span className="text-white font-medium group-hover:text-yellow-100">I want to Check VAT due on an invoice</span>
              </div>
            </div>
            <div 
              onClick={() => onNavigateToTab('cgt')}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-6 w-6 text-yellow-400 group-hover:text-yellow-300" />
                <span className="text-white font-medium group-hover:text-yellow-100">I want to Work out CGT on a sale</span>
              </div>
            </div>
            <div 
              onClick={() => onNavigateToTab('payment')}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center space-x-3">
                <CreditCard className="h-6 w-6 text-yellow-400 group-hover:text-yellow-300" />
                <span className="text-white font-medium group-hover:text-yellow-100">I want to Calculate Net-to-Pay for a vendor</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            Why Fiquant TaxPro
          </h3>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-black" />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">NTA-accurate</h4>
              <p className="text-gray-300">Calculations follow the Nigeria Tax Act 2025 and NRS guidance.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-10 w-10 text-black" />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Instant & Actionable</h4>
              <p className="text-gray-300">Results you can download and present in PDF.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="h-10 w-10 text-black" />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Trusted & Secure</h4>
              <p className="text-gray-300">Encrypted data storage, audit-ready reports, enterprise plans.</p>
            </div>
          </div>
          <div className="text-center">
            <Button 
              onClick={() => onNavigateToTab('calculator')}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 px-8 rounded-full text-lg"
            >
              See How It Works — 60 second demo
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Panels */}
      {/* Feature Panels */}
      <section className="py-16 px-4 sm:px-6 bg-black">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* PAYE Panel */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="w-full lg:w-1/3 h-48 lg:h-64">
                <img 
                  src="https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/2s52tc3b_Gemini_Generated_Image_k1jwlnk1jwlnk1jw.png" 
                  alt="Professional team"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 p-8">
                <div className="flex items-start mb-4">
                  <Users className="h-8 w-8 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Stop Overpaying or Underpaying PAYE
                    </h3>
                    <ul className="text-gray-300 space-y-2 mb-6">
                      <li>• Exact PAYE with pension, NHF, life insurance & rent relief.</li>
                      <li>• Annualised PAYE with document upload.</li>
                    </ul>
                    <Button 
                      onClick={() => onNavigateToTab('calculator')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg"
                    >
                      Calculate NTA-Compliant PAYE — Free
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CIT Panel */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex flex-col lg:flex-row-reverse items-center">
              <div className="w-full lg:w-1/3 h-48 lg:h-64">
                <img 
                  src="https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/za762luj_Gemini_Generated_Image_ge8ufyge8ufyge8u.png" 
                  alt="Business meeting"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 p-8">
                <div className="flex items-start mb-4">
                  <Calculator className="h-8 w-8 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Accurate CIT with 2025 Rules
                    </h3>
                    <ul className="text-gray-300 space-y-2 mb-6">
                      <li>• Capital allowances, thin cap rules & development levy.</li>
                      <li>• Small company exemptions & multinational compliance.</li>
                    </ul>
                    <Button 
                      onClick={() => onNavigateToTab('cit')}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg"
                    >
                      Calculate NTA-Compliant CIT — Free
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* VAT Panel */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="w-full lg:w-1/3 h-48 lg:h-64">
                <img 
                  src="https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/iakm5flx_Gemini_Generated_Image_k1jwlnk1jwlnk1jw%20%283%29.png" 
                  alt="Business handshake"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 p-8">
                <div className="flex items-start mb-4">
                  <Receipt className="h-8 w-8 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      VAT Made Simple
                    </h3>
                    <ul className="text-gray-300 space-y-2 mb-6">
                      <li>• Automatic transaction classification by NTA rules.</li>
                      <li>• Input/output VAT tracking & compliance.</li>
                    </ul>
                    <Button 
                      onClick={() => onNavigateToTab('vat')}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg"
                    >
                      Calculate VAT — Free & Compliant
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CGT Panel */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex flex-col lg:flex-row-reverse items-center">
              <div className="w-full lg:w-1/3 h-48 lg:h-64">
                <img 
                  src="https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/3l8sul24_Gemini_Generated_Image_bhxj3sbhxj3sbhxj.png" 
                  alt="Property consultation"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 p-8">
                <div className="flex items-start mb-4">
                  <TrendingUp className="h-8 w-8 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Capital Gains Tax Calculator
                    </h3>
                    <ul className="text-gray-300 space-y-2 mb-6">
                      <li>• Asset disposal calculations with 2025 rates.</li>
                      <li>• Exemptions & allowances automatically applied.</li>
                    </ul>
                    <Button 
                      onClick={() => onNavigateToTab('cgt')}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg"
                    >
                      Calculate CGT — Free & Accurate
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Panel */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="w-full lg:w-1/3 h-48 lg:h-64">
                <img 
                  src="https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/s7a291fy_Gemini_Generated_Image_rgk3prgk3prgk3pr.png" 
                  alt="Payment processing"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 p-8">
                <div className="flex items-start mb-4">
                  <CreditCard className="h-8 w-8 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Payment Processing Calculator
                    </h3>
                    <ul className="text-gray-300 space-y-2 mb-6">
                      <li>• Net payment calculations with WHT & VAT deductions.</li>
                      <li>• Vendor payment compliance made easy.</li>
                    </ul>
                    <Button 
                      onClick={() => onNavigateToTab('payment')}
                      className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg"
                    >
                      Calculate Net Payments — Free
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 sm:px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Free to use — pay when you print or store
            </h3>
          </div>
          
          {/* Pricing Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-full p-1 border border-white/20">
              {['free', 'pro', 'premium'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-yellow-500 text-black'
                      : 'text-white hover:text-yellow-300'
                  }`}
                >
                  {tab === 'free' ? 'Free' : tab === 'pro' ? 'Pro — ₦10,000/mo' : 'Premium — ₦14,999/mo'}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Content */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
            {activeTab === 'free' && (
              <div className="text-center">
                <h4 className="text-2xl font-bold text-white mb-6">Free (Default) — Always free to calculate</h4>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-3">
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>All calculators (PAYE, CIT, VAT, CGT, Payments)</span>
                    </div>
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>NTA Tax Info & Guides</span>
                    </div>
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>Ads-supported</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-red-400">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <span>Download PDF disabled</span>
                    </div>
                    <div className="flex items-center text-red-400">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <span>Save History disabled</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => onNavigateToTab('calculator')}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 px-8 rounded-full text-lg"
                >
                  Use Free Calculators
                </Button>
              </div>
            )}

            {activeTab === 'pro' && (
              <div className="text-center">
                <h4 className="text-2xl font-bold text-white mb-6">Pro — ₦10,000 / month</h4>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-3">
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>Everything in Free, plus:</span>
                    </div>
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>Print & export PDFs</span>
                    </div>
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>View & export calculation history</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>One admin seat & bulk PAYE up to 250 employees</span>
                    </div>
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>Priority email support (48hr)</span>
                    </div>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg">
                  Start 7-day Trial
                </Button>
              </div>
            )}

            {activeTab === 'premium' && (
              <div className="text-center">
                <h4 className="text-2xl font-bold text-white mb-6">Premium — ₦14,999 / month</h4>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-3">
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>Everything in Pro, plus:</span>
                    </div>
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>Secure tax-file storage & retrieval</span>
                    </div>
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>Compliance assistance & review (1 review / quarter)</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>Email invoice / filing integration</span>
                    </div>
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>Priority phone & email support (24hr)</span>
                    </div>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg">
                  Start 7-day Trial
                </Button>
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black">
              Custom & API access — contact sales
            </Button>
          </div>
        </div>
      </section>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-10 w-10 text-black" />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Fast</h4>
              <p className="text-gray-300">Start in 60 secs, no bank details.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-black" />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Correct</h4>
              <p className="text-gray-300">NTA 2025 rules baked in; NRS-aligned.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-black" />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">Safe</h4>
              <p className="text-gray-300">Encrypted, enterprise-grade storage (Premium).</p>
            </div>
          </div>
          <div className="text-center">
            <Button 
              onClick={() => onNavigateToTab('calculator')}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 px-8 rounded-full text-lg"
            >
              Try Your First Calculation
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof & Trust */}
      <section className="py-16 px-4 sm:px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Trusted by SMEs & Accountants</h3>
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 italic mb-4">
                  "Fiquant TaxPro saved our accounting firm hours of manual calculations. The NTA 2025 compliance gives us confidence in every calculation."
                </p>
                <p className="text-white font-medium">— Chief Accountant, Lagos SME</p>
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-xl font-bold text-white">Security & Compliance</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-green-400" />
                  <span className="text-gray-300">Data encrypted in transit & rest</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span className="text-gray-300">NRS-aligned calculations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-6 w-6 text-green-400" />
                  <span className="text-gray-300">Enterprise-grade security</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {[
              {
                question: "Is this NTA 2025-compliant?",
                answer: "Yes. All core calculations follow the new Act and NRS guidance."
              },
              {
                question: "What's free?",
                answer: "All calculators are free to use. Printing and history require Pro or Premium."
              },
              {
                question: "How do ads work?",
                answer: "Free users see short, optional rewarded ads to continue using features."
              },
              {
                question: "Enterprise?",
                answer: "API, white-label and bulk payroll plans available — Contact Sales."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full p-6 text-left flex justify-between items-center"
                >
                  <span className="text-white font-medium">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-yellow-400" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-12 px-4 sm:px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <img 
                  src="https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/q9xbgjwy_Fiquant%20Consult%20-%20Transparent%20%28Logo%20Only%29.png" 
                  alt="Fiquant Consult Logo" 
                  className="h-8 w-8 mr-3"
                />
                <span className="text-xl font-bold text-white">Fiquant TaxPro 2026</span>
              </div>
              <p className="text-gray-400 mb-4">
                NTA 2025-compliant tax calculators and compliance tools for Nigerian businesses and individuals.
              </p>
              <p className="text-xs text-gray-500">
                Fiquant TaxPro provides calculation tools and guidance. This is not legal advice. For complex tax matters consult qualified tax counsel.
              </p>
            </div>
            <div>
              <h5 className="text-white font-medium mb-4">Product</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-medium mb-4">Support</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>support@fiquant.ng</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+234 (0) 700 FIQUANT</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2026 Fiquant Consult. All rights reserved. Built for Nigerian Tax Compliance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;