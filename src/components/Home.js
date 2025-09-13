import React from 'react';
import { Card, CardContent } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { AlertTriangle, Users, Building2, Calculator, Receipt, TrendingUp, CreditCard, Target, CheckCircle } from 'lucide-react';

const Home = ({ onNavigateToTab }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-black via-gray-900 to-black text-white py-20 px-6 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1752074177162-0560205be28a')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          {/* Logo and Brand */}
          <div className="flex items-center justify-center mb-8">
            <img 
              src="https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/q9xbgjwy_Fiquant%20Consult%20-%20Transparent%20%28Logo%20Only%29.png" 
              alt="Fiquant Consult Logo" 
              className="h-16 w-16 mr-4"
            />
            <div className="text-left">
              <img 
                src="https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/aa6pe5bc_Fiquant%20Consult%20-%20Transparent%20%28Name%20only%29.png" 
                alt="Fiquant Consult" 
                className="h-12 mb-2"
              />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                TaxPro 2026
              </h2>
            </div>
          </div>

          <div className="flex items-center justify-center mb-6">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Did you know? Filing the wrong tax under Nigeria's 2026 laws can 
              <span className="text-yellow-400"> shut down your business</span> or land you in penalty debt.
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Don't gamble with compliance. Be 100% sure of what you owe. Our all-in-one app calculates every tax correctly — instantly, free, and NTA-compliant.
          </p>
          
          <Button 
            onClick={() => onNavigateToTab('calculator')}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 px-8 rounded-full text-lg transform hover:scale-105 transition-all duration-200 shadow-2xl"
          >
            🚀 Check Your Taxes Now — Free & Accurate
          </Button>
        </div>
      </section>

      {/* Tax Calculator Banners */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* PAYE Banner */}
          <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row items-center">
                <div className="lg:w-1/3 h-64 lg:h-auto">
                  <img 
                    src="https://images.unsplash.com/photo-1739298061757-7a3339cee982" 
                    alt="Professional team"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-8">
                  <div className="flex items-start mb-4">
                    <Users className="h-8 w-8 text-emerald-600 mr-3 mt-1" />
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        👩🏽‍💼 Stop Overpaying or Underpaying PAYE
                      </h2>
                      <p className="text-lg text-gray-700 leading-relaxed mb-6">
                        <strong>Did you know?</strong> Wrong PAYE deductions can block your access to loans, mortgages, and government services. Our tool gives you the exact figure — including pension, NHF, life insurance, and reliefs — so you never lose out.
                      </p>
                      <Button 
                        onClick={() => onNavigateToTab('calculator')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row-reverse items-center">
                <div className="lg:w-1/3 h-64 lg:h-auto">
                  <img 
                    src="https://images.unsplash.com/photo-1606836591695-4d58a73eba1e" 
                    alt="Business meeting"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-8">
                  <div className="flex items-start mb-4">
                    <Building2 className="h-8 w-8 text-blue-600 mr-3 mt-1" />
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        🏢 Payroll Mistakes = Heavy Fines
                      </h2>
                      <p className="text-lg text-gray-700 leading-relaxed mb-6">
                        <strong>Did you know?</strong> Failure to remit correct PAYE for staff can attract penalties of up to ₦500,000 per month and destroy staff trust. Upload your payroll and let our Bulk PAYE engine compute everything instantly — safe, clean, compliant.
                      </p>
                      <Button 
                        onClick={() => onNavigateToTab('calculator')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row items-center">
                <div className="lg:w-1/3 h-64 lg:h-auto">
                  <img 
                    src="https://images.unsplash.com/photo-1739287088635-444554e7ac0e" 
                    alt="Business professionals"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-8">
                  <div className="flex items-start mb-4">
                    <Calculator className="h-8 w-8 text-purple-600 mr-3 mt-1" />
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        📑 Don't Let Wrong CIT Shut Down Your Company
                      </h2>
                      <p className="text-lg text-gray-700 leading-relaxed mb-6">
                        <strong>Did you know?</strong> Underpaying CIT attracts 25% fines, compounded interest, and even business closure orders. Don't be a victim. Get it right every time with our instant calculator.
                      </p>
                      <Button 
                        onClick={() => onNavigateToTab('cit')}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row-reverse items-center">
                <div className="lg:w-1/3 h-64 lg:h-auto">
                  <img 
                    src="https://images.unsplash.com/photo-1709715357520-5e1047a2b691" 
                    alt="Team collaboration"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-8">
                  <div className="flex items-start mb-4">
                    <Receipt className="h-8 w-8 text-orange-600 mr-3 mt-1" />
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        💸 VAT Errors Can Cripple Your Cash Flow
                      </h2>
                      <p className="text-lg text-gray-700 leading-relaxed mb-6">
                        <strong>Did you know?</strong> Incorrect VAT filing can trigger back-duty audits, double tax payments, and fines of up to ₦50,000 per return. Our VAT tool makes sure your invoices, input, and output VAT are perfect.
                      </p>
                      <Button 
                        onClick={() => onNavigateToTab('vat')}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
          <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row items-center">
                <div className="lg:w-1/3 h-64 lg:h-auto">
                  <img 
                    src="https://images.unsplash.com/photo-1603202662706-62ead3176b8f" 
                    alt="Professional consultation"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-8">
                  <div className="flex items-start mb-4">
                    <TrendingUp className="h-8 w-8 text-green-600 mr-3 mt-1" />
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        🏠 Selling Assets? Don't Lose Profits to CGT
                      </h2>
                      <p className="text-lg text-gray-700 leading-relaxed mb-6">
                        <strong>Did you know?</strong> Not reporting disposals correctly can lead to 10% CGT plus penalties and forfeiture risks. Our CGT calculator shows exactly what you owe so you only pay what's fair — nothing more, nothing less.
                      </p>
                      <Button 
                        onClick={() => onNavigateToTab('cgt')}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
          <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row-reverse items-center">
                <div className="lg:w-1/3 h-64 lg:h-auto">
                  <img 
                    src="https://images.unsplash.com/photo-1616587656977-ac36a5a430bc" 
                    alt="Business meeting"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-8">
                  <div className="flex items-start mb-4">
                    <CreditCard className="h-8 w-8 text-pink-600 mr-3 mt-1" />
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        🤝 Stop Overpaying Vendors. Stop Losing to Errors.
                      </h2>
                      <p className="text-lg text-gray-700 leading-relaxed mb-6">
                        <strong>Did you know?</strong> Forgetting to deduct WHT or VAT before paying vendors can cost you twice — once to FIRS, once to your supplier. Our payment calculator ensures you deduct right and pay net correctly every time.
                      </p>
                      <Button 
                        onClick={() => onNavigateToTab('payment')}
                        className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
      <section className="relative bg-gradient-to-r from-black via-gray-900 to-black text-white py-20 px-6"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url('https://images.unsplash.com/photo-1734184451176-d3ca5bb6b64a')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Target className="h-12 w-12 text-yellow-500 mr-4" />
            <h2 className="text-4xl md:text-5xl font-bold">
              🎯 Don't Wait for FIRS Penalties. Take Control Today.
            </h2>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Every mistake costs you money. With Fiquant TaxPro 2026, you'll never underpay, overpay, or miss deadlines again. Stay compliant. Protect your business. Keep your peace of mind.
          </p>
          
          <Button 
            onClick={() => onNavigateToTab('calculator')}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-6 px-12 rounded-full text-xl transform hover:scale-105 transition-all duration-200 shadow-2xl"
          >
            🚀 Start Managing Your Taxes Now — 100% Free & NTA-Compliant
          </Button>

          {/* Trust Indicators */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-400 mr-2" />
              <span className="text-lg">100% NTA 2026 Compliant</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-400 mr-2" />
              <span className="text-lg">Free & Instant Results</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-400 mr-2" />
              <span className="text-lg">Professional PDF Reports</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/q9xbgjwy_Fiquant%20Consult%20-%20Transparent%20%28Logo%20Only%29.png" 
              alt="Fiquant Consult Logo" 
              className="h-8 w-8 mr-2"
            />
            <span className="text-lg font-semibold">Fiquant Consult - TaxPro 2026</span>
          </div>
          <p className="text-sm">
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