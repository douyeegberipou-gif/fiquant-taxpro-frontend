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
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
          
          {/* PAYE Banner */}
          <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden mobile-card">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row items-center">
                <div className="w-full lg:w-1/3 h-48 sm:h-56 lg:h-auto mobile-image">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/2s52tc3b_Gemini_Generated_Image_k1jwlnk1jwlnk1jw.png" 
                    alt="Professional team with arms folded"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-4 sm:p-6 lg:p-8 mobile-spacing">
                  <div className="flex items-start mb-4">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 mr-2 sm:mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                        👩🏽‍💼 Stop Overpaying or Underpaying PAYE
                      </h2>
                      <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
                        <strong>Did you know?</strong> Wrong PAYE deductions can block your access to loans, mortgages, and government services. Our tool gives you the exact figure — including pension, NHF, life insurance, and reliefs — so you never lose out.
                      </p>
                      <Button 
                        onClick={() => onNavigateToTab('calculator')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl transition-all duration-200 mobile-button w-full sm:w-auto"
                      >
                        ✨ Calculate Your NTA-Compliant PAYE Free Now!
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk PAYE Banner */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden mobile-card">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row-reverse items-center">
                <div className="w-full lg:w-1/3 h-48 sm:h-56 lg:h-auto mobile-image">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/d1v076l9_Gemini_Generated_Image_k1jwlnk1jwlnk1jw%20%282%29.png" 
                    alt="Colleagues working over laptop"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-4 sm:p-6 lg:p-8 mobile-spacing">
                  <div className="flex items-start mb-4">
                    <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                        🏢 Payroll Mistakes = Heavy Fines
                      </h2>
                      <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
                        <strong>Did you know?</strong> Failure to remit correct PAYE for staff can attract penalties of up to ₦500,000 per month and destroy staff trust. Upload your payroll and let our Bulk PAYE engine compute everything instantly — safe, clean, compliant.
                      </p>
                      <Button 
                        onClick={() => onNavigateToTab('calculator', { mode: 'bulk' })}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl transition-all duration-200 mobile-button w-full sm:w-auto"
                      >
                        💼 Run Bulk PAYE for Your Team — Free & Compliant!
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CIT Banner */}
          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden mobile-card">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row items-center">
                <div className="w-full lg:w-1/3 h-48 sm:h-56 lg:h-auto mobile-image">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/za762luj_Gemini_Generated_Image_ge8ufyge8ufyge8u.png" 
                    alt="Professional business presentation meeting"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-4 sm:p-6 lg:p-8 mobile-spacing">
                  <div className="flex items-start mb-4">
                    <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mr-2 sm:mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                        📑 Don't Let Wrong CIT Shut Down Your Company
                      </h2>
                      <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
                        <strong>Did you know?</strong> Underpaying CIT attracts 25% fines, compounded interest, and even business closure orders. Don't be a victim. Get it right every time with our instant calculator.
                      </p>
                      <Button 
                        onClick={() => onNavigateToTab('cit')}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl transition-all duration-200 mobile-button w-full sm:w-auto"
                      >
                        📊 Calculate Your NTA-Compliant CIT Free Now!
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VAT Banner */}
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden mobile-card">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row-reverse items-center">
                <div className="w-full lg:w-1/3 h-48 sm:h-56 lg:h-auto mobile-image">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/iakm5flx_Gemini_Generated_Image_k1jwlnk1jwlnk1jw%20%283%29.png" 
                    alt="Business handshake"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-4 sm:p-6 lg:p-8 mobile-spacing">
                  <div className="flex items-start mb-4">
                    <Receipt className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mr-2 sm:mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                        💸 VAT Errors Can Cripple Your Cash Flow
                      </h2>
                      <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
                        <strong>Did you know?</strong> Incorrect VAT filing can trigger back-duty audits, double tax payments, and fines of up to ₦50,000 per return. Our VAT tool makes sure your invoices, input, and output VAT are perfect.
                      </p>
                      <Button 
                        onClick={() => onNavigateToTab('vat')}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl transition-all duration-200 mobile-button w-full sm:w-auto"
                      >
                        🧾 Check Your VAT Now — Stay 100% Compliant!
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CGT Banner */}
          <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden mobile-card">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row items-center">
                <div className="w-full lg:w-1/3 h-48 sm:h-56 lg:h-auto mobile-image">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/3l8sul24_Gemini_Generated_Image_bhxj3sbhxj3sbhxj.png" 
                    alt="Property sale consultation"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-4 sm:p-6 lg:p-8 mobile-spacing">
                  <div className="flex items-start mb-4">
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mr-2 sm:mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                        🏠 Selling Assets? Don't Lose Profits to CGT
                      </h2>
                      <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
                        <strong>Did you know?</strong> Not reporting disposals correctly can lead to 10% CGT plus penalties and forfeiture risks. Our CGT calculator shows exactly what you owe so you only pay what's fair — nothing more, nothing less.
                      </p>
                      <Button 
                        onClick={() => onNavigateToTab('cgt')}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl transition-all duration-200 mobile-button w-full sm:w-auto"
                      >
                        💰 Calculate Your NTA-Compliant CGT Free Now!
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Calculator Banner */}
          <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden mobile-card">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row-reverse items-center">
                <div className="w-full lg:w-1/3 h-48 sm:h-56 lg:h-auto mobile-image">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/s7a291fy_Gemini_Generated_Image_rgk3prgk3prgk3pr.png" 
                    alt="Female colleague assisting with computer work"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-4 sm:p-6 lg:p-8 mobile-spacing">
                  <div className="flex items-start mb-4">
                    <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600 mr-2 sm:mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                        🤝 Stop Overpaying Vendors. Stop Losing to Errors.
                      </h2>
                      <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
                        <strong>Did you know?</strong> Forgetting to deduct WHT or VAT before paying vendors can cost you twice — once to FIRS, once to your supplier. Our payment calculator ensures you deduct right and pay net correctly every time.
                      </p>
                      <Button 
                        onClick={() => onNavigateToTab('payment')}
                        className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl transition-all duration-200 mobile-button w-full sm:w-auto"
                      >
                        ✔️ Calculate Correct Net-to-Pay — Free & Instant!
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Closing CTA Section */}
      <section className="relative bg-gradient-to-r from-black via-gray-900 to-black text-white py-12 sm:py-16 md:py-20 px-4 sm:px-6"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url('https://images.unsplash.com/photo-1734184451176-d3ca5bb6b64a')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6">
            <Target className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-500 mb-2 sm:mb-0 sm:mr-4" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center sm:text-left">
              🎯 Don't Wait for FIRS Penalties. Take Control Today.
            </h2>
          </div>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 sm:mb-8 leading-relaxed px-4 sm:px-0">
            Every mistake costs you money. With Fiquant TaxPro 2026, you'll never underpay, overpay, or miss deadlines again. Stay compliant. Protect your business. Keep your peace of mind.
          </p>
          
          <Button 
            onClick={() => onNavigateToTab('calculator')}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 sm:py-6 px-8 sm:px-12 rounded-full text-lg sm:text-xl transform hover:scale-105 transition-all duration-200 shadow-2xl mobile-button mb-8 sm:mb-12"
          >
            🚀 Start Managing Your Taxes Now — 100% Free & NTA-Compliant
          </Button>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mr-2" />
              <span className="text-sm sm:text-lg">100% NTA 2026 Compliant</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mr-2" />
              <span className="text-sm sm:text-lg">Free & Instant Results</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mr-2" />
              <span className="text-sm sm:text-lg">Professional PDF Reports</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-3 sm:mb-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/q9xbgjwy_Fiquant%20Consult%20-%20Transparent%20%28Logo%20Only%29.png" 
              alt="Fiquant Consult Logo" 
              className="h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-0 sm:mr-2"
            />
            <span className="text-base sm:text-lg font-semibold">Fiquant Consult - TaxPro 2026</span>
          </div>
          <p className="text-xs sm:text-sm mb-2">
            Powered by FIRS Guidelines | Nigerian Tax Calculator 2026 Professional Edition
          </p>
          <p className="text-xs mt-2">
            © 2026 Fiquant Consult. All rights reserved. Tax calculations are based on publicly available FIRS guidelines.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;