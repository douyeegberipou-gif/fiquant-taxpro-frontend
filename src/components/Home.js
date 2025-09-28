import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { 
  AlertTriangle, Users, Building2, Calculator, Receipt, TrendingUp, CreditCard, Target, CheckCircle, 
  Shield, Clock, FileCheck, Star, ArrowRight, ChevronDown, ChevronUp, Award, Lock, Phone, Mail,
  Heart, Zap, MousePointer, Download, History, DollarSign, BarChart3, Globe, Play, Eye, Briefcase
} from 'lucide-react';

const Home = ({ onNavigateToTab }) => {
  const [activeTab, setActiveTab] = useState('pro');
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  // Carousel state
  const [carouselSlides, setCarouselSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [carouselSettings, setCarouselSettings] = useState({ transition_delay: 5, auto_rotation: true });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Fetch carousel slides
  const fetchCarouselSlides = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/carousel/slides`);
      if (response.data && response.data.slides) {
        setCarouselSlides(response.data.slides);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching carousel slides:', error);
      // Use fallback content if API fails
      setCarouselSlides([{
        id: 'fallback',
        title: 'Did you know calculating & filing the wrong taxes can land you in trouble?',
        subtitle: 'Fiquant TaxPro — NTA 2025-compliant tax calculators and compliance tools. Get instant, accurate PAYE, CIT, VAT, CGT & payment calculations — free. Protect revenue. Avoid fines.',
        order_index: 0,
        active: true
      }]);
      setIsLoading(false);
    }
  };

  // Fetch carousel settings
  const fetchCarouselSettings = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/carousel/settings`);
      if (response.data && response.data.settings) {
        setCarouselSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Error fetching carousel settings:', error);
      // Use default settings if API fails
      setCarouselSettings({ transition_delay: 5, auto_rotation: true });
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchCarouselSlides();
    fetchCarouselSettings();
  }, []);

  // Auto-rotate carousel based on settings
  useEffect(() => {
    if (carouselSlides.length > 1 && carouselSettings.auto_rotation) {
      const interval = setInterval(() => {
        handleSlideChange((prevIndex) => 
          (prevIndex + 1) % carouselSlides.length
        );
      }, carouselSettings.transition_delay * 1000); // Convert seconds to milliseconds

      return () => clearInterval(interval);
    }
  }, [carouselSlides.length, carouselSettings.transition_delay, carouselSettings.auto_rotation]);

  // Handle slide change with transition
  const handleSlideChange = (newIndexOrFunction) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      if (typeof newIndexOrFunction === 'function') {
        setCurrentSlideIndex(newIndexOrFunction);
      } else {
        setCurrentSlideIndex(newIndexOrFunction);
      }
      setIsTransitioning(false);
    }, 150); // Half of transition duration for smooth effect
  };

  // Get current slide
  const getCurrentSlide = () => {
    if (carouselSlides.length === 0) {
      return {
        title: 'Did you know calculating & filing the wrong taxes can land you in trouble?',
        subtitle: 'Fiquant TaxPro — NTA 2025-compliant tax calculators and compliance tools. Get instant, accurate PAYE, CIT, VAT, CGT & payment calculations — free. Protect revenue. Avoid fines.'
      };
    }
    return carouselSlides[currentSlideIndex] || carouselSlides[0];
  };

  const currentSlide = getCurrentSlide();

  return (
    <div className="min-h-screen bg-white"
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}>
      {/* Trust Strip */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-center space-x-6 text-sm font-medium text-gray-600">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>NRS-aligned</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span>Used by 500+ SMEs</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-purple-500" />
              <span>Encrypted & Audit-Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            {/* Left Column - Content */}
            <div className="lg:col-span-7">
              {/* Brand Logo */}
              <div className="flex items-center mb-12">
                <img 
                  src="https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/q9xbgjwy_Fiquant%20Consult%20-%20Transparent%20%28Logo%20Only%29.png" 
                  alt="Fiquant Consult Logo" 
                  className="h-12 w-12 mr-4"
                />
                <div>
                  <img 
                    src="https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/aa6pe5bc_Fiquant%20Consult%20-%20Transparent%20%28Name%20only%29.png" 
                    alt="Fiquant Consult" 
                    className="h-8 mb-1"
                  />
                  <p className="text-sm font-semibold text-white">TaxPro 2026</p>
                </div>
              </div>

              {/* Carousel Content */}
              <div className="carousel-container">
                <div 
                  className="carousel-slide"
                  key={`slide-${currentSlideIndex}`}
                >
                  <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-8"
                    style={{
                      fontFamily: "'GT America', 'Satoshi', 'Proxima Nova', sans-serif",
                      letterSpacing: '-0.025em',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                    {currentSlide.title.includes('trouble') ? (
                      <>
                        Did you know calculating & filing the wrong taxes can land you in 
                        <span className="text-red-400"> trouble</span>?
                      </>
                    ) : (
                      currentSlide.title
                    )}
                  </h1>
                  
                  <p className="text-xl text-gray-200 mb-12 leading-relaxed max-w-2xl">
                    {currentSlide.subtitle}
                  </p>
                </div>
              </div>
              
              {/* CTA Row */}
              <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <Button 
                  onClick={() => onNavigateToTab('calculator')}
                  className="px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  style={{
                    backgroundColor: '#D4AF37',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  Calculate My Taxes — Free & NTA-Compliant
                </Button>
                <Button 
                  onClick={() => onNavigateToTab('calculator', { mode: 'bulk' })}
                  variant="outline"
                  className="px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 border-2 bg-white/10 backdrop-blur-sm"
                  style={{
                    borderColor: '#D4AF37',
                    color: 'white'
                  }}
                >
                  Bulk PAYE for Teams
                </Button>
              </div>

              {/* Try Demo */}
              <div className="flex items-center space-x-3 text-gray-200 mb-8">
                <Play className="h-5 w-5 text-green-400" />
                <span 
                  onClick={() => onNavigateToTab('calculator')}
                  className="cursor-pointer font-medium hover:text-white transition-colors underline"
                >
                  Try Demo — No account required, see results in 30 seconds
                </span>
              </div>
              
              {/* Carousel Indicators */}
              {carouselSlides.length > 1 && (
                <div className="flex items-center space-x-2 mt-8">
                  {carouselSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleSlideChange(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentSlideIndex 
                          ? 'bg-yellow-400 scale-110' 
                          : 'bg-white/30 hover:bg-white/50'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Visual */}
            <div className="lg:col-span-5 mt-12 lg:mt-0">
              <div className="relative">
                {/* Mockup placeholder - can be replaced with actual calculator preview */}
                <div className="rounded-2xl p-8 shadow-2xl border border-white/20 transition-all duration-300 hover:shadow-3xl"
                  style={{
                    backdropFilter: 'blur(16px)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-200">PAYE Calculator</span>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                        <div className="text-sm text-gray-300 mb-1">Monthly Gross Income</div>
                        <div className="text-2xl font-bold text-white">₦1,500,000</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                        <div className="text-sm text-gray-300 mb-1">Monthly Tax</div>
                        <div className="text-2xl font-bold text-red-300">₦248,325</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                        <div className="text-sm text-gray-300 mb-1">Net Income</div>
                        <div className="text-2xl font-bold text-green-300">₦1,251,675</div>
                      </div>
                    </div>
                    <Button className="w-full bg-green-600 text-white rounded-lg py-3 hover:bg-green-700 transition-colors">
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Report
                    </Button>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-200/20 to-yellow-300/20 rounded-full opacity-60"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-blue-300/20 rounded-full opacity-40"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Panels */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">What do you want to do?</h3>
            <p className="text-gray-600">Choose your calculator and get instant, NTA-compliant results</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* PAYE Panel */}
            <div 
              className="relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-80 cursor-pointer"
              onClick={() => onNavigateToTab('calculator')}
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.3)), url('https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/2s52tc3b_Gemini_Generated_Image_k1jwlnk1jwlnk1jw.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="absolute bottom-0 left-0 right-0 h-1/3 p-4 flex flex-col justify-center items-center text-center"
                style={{
                  backdropFilter: 'blur(16px)',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                <div className="flex items-center mb-2">
                  <Users className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                  <h3 className="text-base font-bold text-white">
                    Calculate my PAYE
                  </h3>
                </div>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg"
                >
                  Calculate PAYE — Free
                </Button>
              </div>
            </div>

            {/* CIT Panel */}
            <div 
              className="relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-80 cursor-pointer"
              onClick={() => onNavigateToTab('calculator', { mode: 'bulk' })}
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.3)), url('https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/za762luj_Gemini_Generated_Image_ge8ufyge8ufyge8u.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="absolute bottom-0 left-0 right-0 h-1/3 p-4 flex flex-col justify-center items-center text-center"
                style={{
                  backdropFilter: 'blur(16px)',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                <div className="flex items-center mb-2">
                  <Calculator className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                  <h3 className="text-base font-bold text-white">
                    Run bulk PAYE for my team
                  </h3>
                </div>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg"
                >
                  Bulk PAYE — Free
                </Button>
              </div>
            </div>

            {/* VAT Panel */}
            <div 
              className="relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-80 cursor-pointer"
              onClick={() => onNavigateToTab('vat')}
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.3)), url('https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/iakm5flx_Gemini_Generated_Image_k1jwlnk1jwlnk1jw%20%283%29.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="absolute bottom-0 left-0 right-0 h-1/3 p-4 flex flex-col justify-center items-center text-center"
                style={{
                  backdropFilter: 'blur(16px)',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                <div className="flex items-center mb-2">
                  <Receipt className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                  <h3 className="text-base font-bold text-white">
                    Compute VAT due on an Invoice
                  </h3>
                </div>
                <Button 
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg"
                >
                  Calculate VAT — Free
                </Button>
              </div>
            </div>

            {/* CGT Panel */}
            <div 
              className="relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-80 cursor-pointer"
              onClick={() => onNavigateToTab('cgt')}
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.3)), url('https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/3l8sul24_Gemini_Generated_Image_bhxj3sbhxj3sbhxj.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="absolute bottom-0 left-0 right-0 h-1/3 p-4 flex flex-col justify-center items-center text-center"
                style={{
                  backdropFilter: 'blur(16px)',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                  <h3 className="text-base font-bold text-white">
                    Work out CGT due on a sale
                  </h3>
                </div>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg"
                >
                  Calculate CGT — Free
                </Button>
              </div>
            </div>

            {/* Payment Panel */}
            <div 
              className="relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-80 cursor-pointer"
              onClick={() => onNavigateToTab('payment')}
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.3)), url('https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/s7a291fy_Gemini_Generated_Image_rgk3prgk3prgk3pr.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="absolute bottom-0 left-0 right-0 h-1/3 p-4 flex flex-col justify-center items-center text-center"
                style={{
                  backdropFilter: 'blur(16px)',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                <div className="flex items-center mb-2">
                  <CreditCard className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                  <h3 className="text-base font-bold text-white">
                    Calculate net payment to vendor
                  </h3>
                </div>
                <Button 
                  className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg"
                >
                  Calculate Payment — Free
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Windows */}
      <section className="relative py-24"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.pexels.com/photos/6928997/pexels-photo-6928997.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-white mb-4">Choose Your Plan</h3>
            <p className="text-xl text-gray-200">Start free, upgrade when you need more features</p>
            
            {/* Monthly/Annual Toggle */}
            <div className="flex items-center justify-center mt-8">
              <span className={`text-lg ${!activeTab === 'annual' ? 'text-white font-semibold' : 'text-gray-300'}`}>Monthly</span>
              <button
                onClick={() => setActiveTab(activeTab === 'annual' ? 'monthly' : 'annual')}
                className="mx-4 relative inline-flex h-6 w-11 items-center rounded-full bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${activeTab === 'annual' ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className={`text-lg ${activeTab === 'annual' ? 'text-white font-semibold' : 'text-gray-300'}`}>
                Annual
                <span className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded-full">2 months free</span>
              </span>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Free Plan */}
            <div className="relative rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{
                backdropFilter: 'blur(16px)',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
              <div className="text-center mb-6">
                <h4 className="text-xl font-bold text-white mb-2">Free</h4>
                <p className="text-3xl font-bold text-white">₦0<span className="text-base font-normal text-gray-200">/month</span></p>
                <p className="text-gray-200 mt-1 text-sm">Ad-supported</p>
              </div>
              
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Single PAYE calculator (unlimited)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Bulk PAYE (5 staff, 1x/month)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Tax guides & info pages</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Rewarded ads (extra calcs)</span>
                </li>
                <li className="flex items-center">
                  <X className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" />
                  <span className="text-gray-300">No PDF export</span>
                </li>
                <li className="flex items-center">
                  <X className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" />
                  <span className="text-gray-300">No calculation history</span>
                </li>
              </ul>
              
              <Button 
                onClick={() => onNavigateToTab('calculator')}
                variant="outline"
                className="w-full py-3 border-white/30 text-white hover:bg-white/20"
              >
                Start Free
              </Button>
            </div>

            {/* Pro Plan - Best for SMEs */}
            <div className="relative rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{
                backdropFilter: 'blur(16px)',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '2px solid #3B82F6'
              }}>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-blue-600">
                  Best for SMEs
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h4 className="text-xl font-bold text-white mb-2">Pro</h4>
                <p className="text-3xl font-bold text-white">
                  ₦{activeTab === 'annual' ? '9,166' : '9,999'}
                  <span className="text-base font-normal text-gray-200">/month</span>
                </p>
                {activeTab === 'annual' && (
                  <p className="text-green-400 text-sm">₦109,990/year (2 months free)</p>
                )}
                <p className="text-gray-200 mt-1 text-sm">Everything in Free, plus:</p>
              </div>
              
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Bulk PAYE (15 staff, unlimited)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">CIT, VAT, CGT calculators</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Save history & PDF reports</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Email notifications</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Ad-free experience</span>
                </li>
              </ul>
              
              <Button 
                className="w-full py-3 text-white font-semibold rounded-lg hover:scale-105 transition-transform bg-blue-600 hover:bg-blue-700"
              >
                Start 7-Day Trial
              </Button>
            </div>

            {/* Premium Plan - Most Popular */}
            <div className="relative rounded-2xl p-6 transform scale-105 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
              style={{
                backdropFilter: 'blur(16px)',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '2px solid #D4AF37'
              }}>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: '#D4AF37' }}>
                  Most Popular
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h4 className="text-xl font-bold text-white mb-2">Premium</h4>
                <p className="text-3xl font-bold text-white">
                  ₦{activeTab === 'annual' ? '18,333' : '19,999'}
                  <span className="text-base font-normal text-gray-200">/month</span>
                </p>
                {activeTab === 'annual' && (
                  <p className="text-green-400 text-sm">₦219,990/year (2 months free)</p>
                )}
                <p className="text-gray-200 mt-1 text-sm">Everything in Pro, plus:</p>
              </div>
              
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Bulk PAYE (50 staff, unlimited)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Advanced analytics dashboard</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Secure file storage</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Compliance assistance</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Priority support & API access</span>
                </li>
              </ul>
              
              <Button 
                className="w-full py-3 text-white font-semibold rounded-lg hover:scale-105 transition-transform"
                style={{ backgroundColor: '#D4AF37' }}
              >
                Start 7-Day Trial
              </Button>
            </div>

            {/* Enterprise Plan */}
            <div className="relative rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{
                backdropFilter: 'blur(16px)',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
              <div className="text-center mb-6">
                <h4 className="text-xl font-bold text-white mb-2">Enterprise</h4>
                <p className="text-2xl font-bold text-white">Custom Pricing</p>
                <p className="text-gray-200 mt-1 text-sm">Everything in Premium, plus:</p>
              </div>
              
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Bulk PAYE (50+ staff)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">White-label option</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Volume discounts</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Dedicated account manager</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Custom SLA & onboarding</span>
                </li>
              </ul>
              
              <Button 
                variant="outline"
                className="w-full py-3 border-white/30 text-white hover:bg-white/20"
              >
                Contact Sales
              </Button>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-200 mb-4">Need custom features or API access?</p>
            <Button variant="link" className="text-white font-semibold underline">
              Contact Sales for Enterprise Solutions
            </Button>
          </div>
        </div>
      </section>

      {/* Trust & Proof */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Badges and Credentials */}
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-8">Trusted by SMEs & Tax Professionals</h3>
              
              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}>
                  <Shield className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="font-semibold text-gray-800">NRS-Aligned</div>
                    <div className="text-sm text-gray-600">Fully compliant calculations</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}>
                  <Lock className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="font-semibold text-gray-800">Encrypted</div>
                    <div className="text-sm text-gray-600">Bank-grade security</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}>
                  <Award className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="font-semibold text-gray-800">Audit-Ready</div>
                    <div className="text-sm text-gray-600">Professional reports</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}>
                  <Users className="h-8 w-8 text-orange-600" />
                  <div>
                    <div className="font-semibold text-gray-800">500+ SMEs</div>
                    <div className="text-sm text-gray-600">Trusted nationwide</div>
                  </div>
                </div>
              </div>

              {/* Founder Credibility */}
              <div className="p-6 rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Expert Team</div>
                    <div className="text-sm text-gray-600">Ex-NRS advisors & tax partners</div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Built by former Nigerian Revenue Service advisors and certified tax practitioners with 20+ years of combined experience.
                </p>
              </div>
            </div>

            {/* Right Column - Case Study */}
            <div className="p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)'
              }}>
              <div className="flex items-center space-x-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-lg text-gray-700 mb-6 italic">
                "Fiquant TaxPro saved our accounting firm over 40 hours monthly on tax calculations. The NTA 2025 compliance gives us complete confidence in every calculation we deliver to clients."
              </blockquote>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="font-semibold text-gray-800">Adebayo Ogundimu</div>
                  <div className="text-gray-600">Senior Partner, Lagos Tax Associates</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">40hrs</div>
                  <div className="text-sm text-gray-600">saved monthly</div>
                </div>
              </div>
              
              <div className="rounded-lg p-4 transition-all duration-200 hover:shadow-md"
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-gray-800">250+</div>
                    <div className="text-xs text-gray-600">Clients served</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-800">₦50M+</div>
                    <div className="text-xs text-gray-600">Taxes calculated</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-800">100%</div>
                    <div className="text-xs text-gray-600">NTA compliant</div>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="link" 
                className="mt-4 text-sm font-semibold p-0 text-blue-600"
              >
                See full case study →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h3>
            <p className="text-xl text-gray-600">Everything you need to know about Fiquant TaxPro</p>
          </div>
          
          <div className="space-y-4">
            {[
              {
                question: "Is this NTA 2025-compliant?",
                answer: "Yes. All core calculations follow the new Nigeria Tax Act 2025 and NRS guidance. Our algorithms are updated regularly to ensure complete compliance."
              },
              {
                question: "What's included in the free plan?",
                answer: "All calculators are free to use (PAYE, CIT, VAT, CGT, Payments). You can perform unlimited calculations. Printing PDFs and saving history require Pro or Premium plans."
              },
              {
                question: "How do I get started?",
                answer: "Simply click any calculator above and start entering your information. No account required for basic calculations. Results appear instantly as you type."
              },
              {
                question: "What about enterprise features?",
                answer: "We offer API access, white-label solutions, and bulk payroll plans for enterprises. Contact our sales team for custom pricing and implementation."
              },
              {
                question: "Is my data secure?",
                answer: "Absolutely. We use bank-grade encryption for all data in transit and at rest. We're SOC 2 compliant and never share your financial information with third parties."
              }
            ].map((faq, index) => (
              <div key={index} className="rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}>
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-800">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <img 
                  src="https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/q9xbgjwy_Fiquant%20Consult%20-%20Transparent%20%28Logo%20Only%29.png" 
                  alt="Fiquant Consult Logo" 
                  className="h-8 w-8 mr-3"
                />
                <span className="text-xl font-bold">Fiquant TaxPro 2026</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                NTA 2025-compliant tax calculators and compliance tools for Nigerian businesses and individuals. Built by tax experts, trusted by professionals.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <Mail className="h-4 w-4" />
                  <span>support@fiquant.ng</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <Phone className="h-4 w-4" />
                  <span>+234 (0) 700 FIQUANT</span>
                </div>
              </div>
            </div>
            
            {/* Product Links */}
            <div>
              <h5 className="font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Calculators</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
              </ul>
            </div>
            
            {/* Support Links */}
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-300 mb-4 md:mb-0">
                © 2026 Fiquant Consult. All rights reserved. Built for Nigerian Tax Compliance.
              </p>
              <p className="text-xs text-gray-400">
                Fiquant TaxPro provides calculation tools and guidance. This is not legal advice. 
                For complex tax matters consult qualified tax counsel.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;