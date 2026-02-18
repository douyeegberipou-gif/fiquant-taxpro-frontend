import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card, CardContent } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { TopBanner } from './ads/AdBanner';
import { ContactUsModal } from './ContactUsModal';
import { 
  AlertTriangle, Users, Building2, Calculator, Receipt, TrendingUp, CreditCard, Target, CheckCircle, 
  Shield, Clock, FileCheck, Star, ArrowRight, ChevronDown, ChevronUp, Award, Lock, Phone, Mail,
  Heart, Zap, MousePointer, Download, History, DollarSign, BarChart3, Globe, Play, Eye, Briefcase, X,
  ChevronLeft, ChevronRight, MessageSquare, RefreshCw, Scale
} from 'lucide-react';

const Home = ({ onNavigateToTab, isAuthenticated, setShowTrialModal, setAuthModalOpen, setShowUpgradeModal, user }) => {
  const [activeTab, setActiveTab] = useState('pro');
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  // Contact Us Modal
  const [showContactModal, setShowContactModal] = useState(false);
  
  // API Documentation popup
  const [showApiPopup, setShowApiPopup] = useState(false);
  
  // Privacy Policy modal
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  
  // Terms and Conditions modal
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  // Pricing toggle
  const [isAnnual, setIsAnnual] = useState(false);
  
  // Hero Carousel state
  const [carouselSlides, setCarouselSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  // Handle start trial click
  const handleStartTrialClick = () => {
    // Show trial selection modal directly - login handled in trial flow
    if (setShowTrialModal) {
      setShowTrialModal(true);
    }
  };

  // Handle direct subscription click
  const handleSubscribeClick = () => {
    if (isAuthenticated && isAuthenticated()) {
      // User is logged in, show upgrade modal
      if (setShowUpgradeModal) {
        setShowUpgradeModal(true);
      }
    } else {
      // User not logged in, show auth modal first
      if (setAuthModalOpen) {
        setAuthModalOpen(true);
      }
    }
  };
  const [isLoading, setIsLoading] = useState(true);
  const [carouselSettings, setCarouselSettings] = useState({ transition_delay: 5, auto_rotation: true });
  const [heroTransitionEnabled, setHeroTransitionEnabled] = useState(true);

  // Feature Tiles Carousel state
  const [featureCarouselIndex, setFeatureCarouselIndex] = useState(0);
  const [featureCarouselSettings, setFeatureCarouselSettings] = useState({ transition_delay: 5 });
  const [featureTransitionEnabled, setFeatureTransitionEnabled] = useState(true);
  const featureCarouselRef = useRef(null);

  // Testimonials Carousel state
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [testimonialSettings, setTestimonialSettings] = useState({ transition_delay: 8 });
  const [testimonialTransitionEnabled, setTestimonialTransitionEnabled] = useState(true);

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

  // Fetch feature carousel settings
  const fetchFeatureCarouselSettings = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/carousel/feature-settings`);
      if (response.data && response.data.settings) {
        setFeatureCarouselSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Error fetching feature carousel settings:', error);
      // Use default 5 seconds if API fails
      setFeatureCarouselSettings({ transition_delay: 5 });
    }
  };

  // Fetch testimonials
  const fetchTestimonials = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/testimonials`);
      if (response.data && response.data.testimonials && response.data.testimonials.length > 0) {
        setTestimonials(response.data.testimonials);
      } else {
        // Fallback testimonial
        setTestimonials([{
          id: 'default',
          author_name: 'Ibiaro Goma',
          author_title: 'CEO',
          company: 'Lush Ltd',
          message: 'Fiquant TaxPro has been instrumental in helping our company achieve significant tax savings while ensuring we avoid compliance issues and potential fines. The NTA 2025 compliance gives us complete confidence in every calculation we deliver to clients.',
          star_rating: 5,
          metric_value: '40hrs',
          metric_label: 'saved monthly',
          order_index: 0,
          active: true
        }]);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      // Use fallback testimonial
      setTestimonials([{
        id: 'default',
        author_name: 'Ibiaro Goma',
        author_title: 'CEO',
        company: 'Lush Ltd',
        message: 'Fiquant TaxPro has been instrumental in helping our company achieve significant tax savings while ensuring we avoid compliance issues and potential fines. The NTA 2025 compliance gives us complete confidence in every calculation we deliver to clients.',
        star_rating: 5,
        metric_value: '40hrs',
        metric_label: 'saved monthly',
        order_index: 0,
        active: true
      }]);
    }
  };

  // Fetch testimonial settings
  const fetchTestimonialSettings = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/testimonial/settings`);
      if (response.data && response.data.settings) {
        setTestimonialSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Error fetching testimonial settings:', error);
      setTestimonialSettings({ transition_delay: 8 });
    }
  };

  // Feature tiles data
  const featureTiles = [
    {
      id: 'paye',
      icon: Users,
      title: 'Calculate my PAYE',
      buttonText: 'Calculate PAYE — Free',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
      backgroundImage: 'https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/2s52tc3b_Gemini_Generated_Image_k1jwlnk1jwlnk1jw.png',
      onClick: () => onNavigateToTab('calculator')
    },
    {
      id: 'bulk-paye',
      icon: Calculator,
      title: 'Run bulk PAYE for my team',
      buttonText: 'Bulk PAYE — Free',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      backgroundImage: 'https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/za762luj_Gemini_Generated_Image_ge8ufyge8ufyge8u.png',
      onClick: () => onNavigateToTab('calculator', { mode: 'bulk' })
    },
    {
      id: 'vat',
      icon: Receipt,
      title: 'Compute VAT due on an Invoice',
      buttonText: 'Calculate VAT — Free',
      buttonColor: 'bg-orange-600 hover:bg-orange-700',
      backgroundImage: 'https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/iakm5flx_Gemini_Generated_Image_k1jwlnk1jwlnk1jw%20%283%29.png',
      onClick: () => onNavigateToTab('vat')
    },
    {
      id: 'cgt',
      icon: TrendingUp,
      title: 'Work out CGT due on a sale',
      buttonText: 'Calculate CGT — Free',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      backgroundImage: 'https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/3l8sul24_Gemini_Generated_Image_bhxj3sbhxj3sbhxj.png',
      onClick: () => onNavigateToTab('cgt')
    },
    {
      id: 'payment',
      icon: CreditCard,
      title: 'Calculate net payment to vendor',
      buttonText: 'Calculate Payment — Free',
      buttonColor: 'bg-pink-600 hover:bg-pink-700',
      backgroundImage: 'https://customer-assets.emergentagent.com/job_naija-taxcalc/artifacts/s7a291fy_Gemini_Generated_Image_rgk3prgk3prgk3pr.png',
      onClick: () => onNavigateToTab('payment')
    }
  ];

  // Fetch initial data
  useEffect(() => {
    fetchCarouselSlides();
    fetchCarouselSettings();
    fetchFeatureCarouselSettings();
    fetchTestimonials();
    fetchTestimonialSettings();
  }, []);

  // Auto-rotate hero carousel based on settings
  // Auto-rotate hero carousel with seamless infinite loop
  useEffect(() => {
    if (carouselSlides.length > 1 && carouselSettings.auto_rotation) {
      const interval = setInterval(() => {
        setCurrentSlideIndex((prevIndex) => prevIndex + 1);
      }, carouselSettings.transition_delay * 1000);

      return () => clearInterval(interval);
    }
  }, [carouselSlides.length, carouselSettings.transition_delay, carouselSettings.auto_rotation]);

  // Reset hero carousel to beginning after reaching duplicate (seamless loop)
  useEffect(() => {
    if (carouselSlides.length > 1 && currentSlideIndex === carouselSlides.length) {
      // Wait for transition to complete, then snap back without animation
      const timeout = setTimeout(() => {
        setHeroTransitionEnabled(false);
        setCurrentSlideIndex(0);
        // Re-enable transition after snap
        setTimeout(() => setHeroTransitionEnabled(true), 50);
      }, 700); // Match the transition duration
      return () => clearTimeout(timeout);
    }
  }, [currentSlideIndex, carouselSlides.length]);

  // Auto-rotate feature tiles carousel with seamless infinite loop
  useEffect(() => {
    const interval = setInterval(() => {
      setFeatureCarouselIndex((prevIndex) => prevIndex + 1);
    }, featureCarouselSettings.transition_delay * 1000);

    return () => clearInterval(interval);
  }, [featureCarouselSettings.transition_delay]);

  // Reset feature carousel to beginning after reaching duplicate (seamless loop)
  useEffect(() => {
    if (featureCarouselIndex === featureTiles.length) {
      // Wait for transition to complete, then snap back without animation
      const timeout = setTimeout(() => {
        setFeatureTransitionEnabled(false);
        setFeatureCarouselIndex(0);
        // Re-enable transition after snap
        setTimeout(() => setFeatureTransitionEnabled(true), 50);
      }, 700); // Match the transition duration
      return () => clearTimeout(timeout);
    }
  }, [featureCarouselIndex, featureTiles.length]);

  // Auto-rotate testimonials carousel
  useEffect(() => {
    if (testimonials.length <= 1) return;
    
    const interval = setInterval(() => {
      setTestimonialIndex((prevIndex) => prevIndex + 1);
    }, testimonialSettings.transition_delay * 1000);

    return () => clearInterval(interval);
  }, [testimonials.length, testimonialSettings.transition_delay]);

  // Reset testimonial carousel for seamless loop
  useEffect(() => {
    if (testimonials.length > 0 && testimonialIndex === testimonials.length) {
      const timeout = setTimeout(() => {
        setTestimonialTransitionEnabled(false);
        setTestimonialIndex(0);
        setTimeout(() => setTestimonialTransitionEnabled(true), 50);
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [testimonialIndex, testimonials.length]);

  // Handle manual slide change (for indicator clicks)
  const handleSlideChange = (newIndex) => {
    setCurrentSlideIndex(newIndex);
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
              <span>NTA-Aligned</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span>Trusted by SMEs</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-purple-500" />
              <span>Encrypted & Audit-Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-8 pb-12 md:pt-16 md:pb-24 overflow-hidden"
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
              {/* Brand Logo - Smaller on mobile */}
              <div className="flex items-center mb-6 md:mb-12">
                <img 
                  src="/fiquant-logo-bold-diamond.png" 
                  alt="Fiquant Consult Logo" 
                  className="h-8 w-8 md:h-12 md:w-12 mr-3 md:mr-4"
                />
                <div>
                  <h2 className="text-lg md:text-2xl font-bold text-white mb-1">Fiquant</h2>
                  <p className="text-xs md:text-sm font-semibold text-white">TaxPro<sup className="text-[8px] md:text-[10px]">™</sup> 2026</p>
                </div>
              </div>

              {/* Carousel Content - Smooth Sliding Animation */}
              <div className="carousel-container overflow-hidden">
                <div 
                  className={`flex ${heroTransitionEnabled ? 'transition-transform duration-700 ease-in-out' : ''}`}
                  style={{
                    transform: `translateX(-${currentSlideIndex * (100 / (carouselSlides.length + 1 || 1))}%)`,
                    width: `${(carouselSlides.length + 1 || 1) * 100}%`
                  }}
                >
                  {carouselSlides.length === 0 ? (
                    <div className="flex-shrink-0" style={{ width: '100%' }}>
                      <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 md:mb-8"
                        style={{
                          fontFamily: "'GT America', 'Satoshi', 'Proxima Nova', sans-serif",
                          letterSpacing: '-0.025em',
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                        Did you know calculating & filing the wrong taxes can land you in 
                        <span className="text-red-400"> trouble</span>?
                      </h1>
                      <p className="text-sm sm:text-base md:text-xl text-gray-200 mb-6 md:mb-12 leading-relaxed max-w-2xl">
                        Fiquant TaxPro — NTA 2025-compliant tax calculators and compliance tools. Get instant, accurate PAYE, CIT, VAT, CGT & payment calculations — free. Protect revenue. Avoid fines.
                      </p>
                    </div>
                  ) : (
                    /* Render all slides plus first slide duplicate for seamless loop */
                    [...carouselSlides, carouselSlides[0]].map((slide, index) => (
                      <div 
                        key={`${slide.id || index}-${index}`} 
                        className="flex-shrink-0" 
                        style={{ width: `${100 / (carouselSlides.length + 1)}%` }}
                      >
                        <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 md:mb-8"
                          style={{
                            fontFamily: "'GT America', 'Satoshi', 'Proxima Nova', sans-serif",
                            letterSpacing: '-0.025em',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                          }}>
                          {slide.title.includes('trouble') ? (
                            <>
                              Did you know calculating & filing the wrong taxes can land you in 
                              <span className="text-red-400"> trouble</span>?
                            </>
                          ) : (
                            slide.title
                          )}
                        </h1>
                        <p className="text-sm sm:text-base md:text-xl text-gray-200 mb-6 md:mb-12 leading-relaxed max-w-2xl">
                          {slide.subtitle}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* CTA Row */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8 md:mb-16">
                <Button 
                  onClick={() => onNavigateToTab('calculator')}
                  className="px-6 py-3 md:px-8 md:py-4 text-sm md:text-lg font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto"
                  style={{
                    backgroundColor: '#D4AF37',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  <span className="hidden sm:inline">Calculate My Taxes — Free & NTA-Compliant</span>
                  <span className="sm:hidden">Calculate Taxes - Free</span>
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
                <div 
                  onClick={() => onNavigateToTab('calculator')}
                  className="rounded-2xl p-8 shadow-2xl border border-white/20 transition-all duration-300 hover:shadow-3xl cursor-pointer hover:scale-[1.02]"
                  style={{
                    backdropFilter: 'blur(16px)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  data-testid="paye-calculator-preview"
                >
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
                    <Button className="w-full bg-green-600 text-white rounded-lg py-3 hover:bg-green-700 transition-colors pointer-events-none">
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

      {/* Ad Banner After Hero Section */}
      <div className="bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TopBanner placement="after-hero" />
        </div>
      </div>

      {/* Feature Panels - Carousel showing 3 tiles at a time */}
      <section className="py-8 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-12">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-4">What do you want to do?</h3>
            <p className="text-sm md:text-base text-gray-600">Choose your calculator and get instant, NTA-compliant results</p>
          </div>
          
          {/* Carousel Container */}
          <div className="relative" ref={featureCarouselRef}>
            {/* Navigation Arrows */}
            <button 
              onClick={() => setFeatureCarouselIndex((prev) => (prev - 1 + featureTiles.length) % featureTiles.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors hidden md:flex"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <button 
              onClick={() => setFeatureCarouselIndex((prev) => prev + 1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors hidden md:flex"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>

            {/* Carousel Track - Smooth sliding animation with seamless loop */}
            <div className="overflow-hidden">
              <div 
                className={`flex gap-4 md:gap-8 ${featureTransitionEnabled ? 'transition-transform duration-700 ease-in-out' : ''}`}
                style={{
                  transform: `translateX(calc(-${featureCarouselIndex * (100 / 3)}% - ${featureCarouselIndex * (16 / 3)}px))`,
                }}
              >
                {/* Render all tiles plus first 3 duplicates for seamless looping */}
                {[...featureTiles, ...featureTiles.slice(0, 3)].map((tile, idx) => (
                  <div 
                    key={`${tile.id}-${idx}`}
                    className="flex-shrink-0 w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-16px)]"
                  >
                    <div 
                      className="relative rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-48 md:h-80 cursor-pointer"
                      onClick={tile.onClick}
                      style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.3)), url('${tile.backgroundImage}')`,
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
                          <tile.icon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                          <h3 className="text-base font-bold text-white">
                            {tile.title}
                          </h3>
                        </div>
                        <Button 
                          className={`${tile.buttonColor} text-white text-xs font-bold py-1.5 px-3 rounded-lg`}
                        >
                          {tile.buttonText}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {featureTiles.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setFeatureCarouselIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    (index === featureCarouselIndex) || (featureCarouselIndex === featureTiles.length && index === 0)
                      ? 'bg-yellow-500 w-6' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ad Banner After Features */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TopBanner placement="after-features" />
        </div>
      </div>

      {/* Who Needs Fiquant TaxPro Section */}
      <section className="py-24 relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url('https://customer-assets.emergentagent.com/job_fiquant-tax/artifacts/rhft2x1o_Gemini_Generated_Image_n89i5wn89i5wn89i.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left Column - Who Needs */}
            <div>
              <h3 className="text-3xl font-bold text-white mb-8">Who Needs Fiquant TaxPro?</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  style={{
                    backdropFilter: 'blur(16px)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                  <Users className="h-6 w-6 text-green-400 flex-shrink-0" />
                  <div className="font-medium text-white text-sm">Individual Taxpayers</div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  style={{
                    backdropFilter: 'blur(16px)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                  <Briefcase className="h-6 w-6 text-blue-400 flex-shrink-0" />
                  <div className="font-medium text-white text-sm">Business Owners</div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  style={{
                    backdropFilter: 'blur(16px)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                  <Building2 className="h-6 w-6 text-purple-400 flex-shrink-0" />
                  <div className="font-medium text-white text-sm">SMEs</div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  style={{
                    backdropFilter: 'blur(16px)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                  <Calculator className="h-6 w-6 text-orange-400 flex-shrink-0" />
                  <div className="font-medium text-white text-sm">Accountants</div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  style={{
                    backdropFilter: 'blur(16px)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                  <Scale className="h-6 w-6 text-yellow-400 flex-shrink-0" />
                  <div className="font-medium text-white text-sm">Tax Practitioners</div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  style={{
                    backdropFilter: 'blur(16px)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                  <BarChart3 className="h-6 w-6 text-cyan-400 flex-shrink-0" />
                  <div className="font-medium text-white text-sm">Medium Businesses</div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1 col-span-2"
                  style={{
                    backdropFilter: 'blur(16px)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                  <Globe className="h-6 w-6 text-pink-400 flex-shrink-0" />
                  <div className="font-medium text-white text-sm">Corporations & Large Enterprises</div>
                </div>
              </div>
            </div>

            {/* Right Column - Why You Need */}
            <div>
              <h3 className="text-3xl font-bold text-white mb-8">Why Do You Need Fiquant TaxPro?</h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  style={{
                    backdropFilter: 'blur(16px)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                  <div className="flex items-start space-x-3">
                    <Shield className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Tax Law Clarity & Alignment</div>
                      <div className="text-sm text-gray-200 mt-1">Stay current with Nigeria Tax Act 2025/2026 amendments. Our calculators are built on the latest tax laws, ensuring your calculations are always accurate and up-to-date.</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  style={{
                    backdropFilter: 'blur(16px)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                  <div className="flex items-start space-x-3">
                    <FileCheck className="h-6 w-6 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Compliance Made Simple</div>
                      <div className="text-sm text-gray-200 mt-1">Avoid penalties and fines with NTA-compliant calculations. Generate professional reports that meet regulatory requirements for PAYE, CIT, VAT, and CGT.</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  style={{
                    backdropFilter: 'blur(16px)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                  <div className="flex items-start space-x-3">
                    <Zap className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Efficiency & Time Savings</div>
                      <div className="text-sm text-gray-200 mt-1">Calculate taxes in seconds, not hours. Bulk payroll processing handles hundreds of employees at once. Save templates for recurring calculations.</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  style={{
                    backdropFilter: 'blur(16px)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                  <div className="flex items-start space-x-3">
                    <History className="h-6 w-6 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Audit-Ready Record Keeping</div>
                      <div className="text-sm text-gray-200 mt-1">Maintain complete calculation history with exportable PDF and Excel reports. Be prepared for audits with professional documentation and detailed breakdowns.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Proof */}
      <section className="py-24 relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://customer-assets.emergentagent.com/job_fiquant-tax/artifacts/rhft2x1o_Gemini_Generated_Image_n89i5wn89i5wn89i.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Badges and Credentials */}
            <div>
              <h3 className="text-3xl font-bold text-white mb-8">Trusted by SMEs & Tax Professionals</h3>
              
              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  style={{
                    backdropFilter: 'blur(16px)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                  <Shield className="h-8 w-8 text-green-400" />
                  <div>
                    <div className="font-semibold text-white">NTA-Aligned</div>
                    <div className="text-sm text-gray-200">Fully compliant calculations</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  style={{
                    backdropFilter: 'blur(16px)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                  <Lock className="h-8 w-8 text-blue-400" />
                  <div>
                    <div className="font-semibold text-white">Encrypted</div>
                    <div className="text-sm text-gray-200">Bank-grade security</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  style={{
                    backdropFilter: 'blur(16px)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                  <Award className="h-8 w-8 text-purple-400" />
                  <div>
                    <div className="font-semibold text-white">Audit-Ready</div>
                    <div className="text-sm text-gray-200">Professional reports</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  style={{
                    backdropFilter: 'blur(16px)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                  <Users className="h-8 w-8 text-orange-400" />
                  <div>
                    <div className="font-semibold text-white">Trusted by SMEs</div>
                    <div className="text-sm text-gray-200">Trusted nationwide</div>
                  </div>
                </div>
              </div>

              {/* Founder Credibility */}
              <div className="p-6 rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                style={{
                  backdropFilter: 'blur(16px)',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Expert Team</div>
                    <div className="text-sm text-gray-200">Experienced finance professionals & tax partners</div>
                  </div>
                </div>
                <p className="text-gray-200 text-sm">
                  Built by seasoned finance professionals and certified tax practitioners with 20+ years of combined experience.
                </p>
              </div>
            </div>

            {/* Right Column - Testimonials Carousel */}
            <div className="relative overflow-hidden rounded-2xl"
              style={{
                backdropFilter: 'blur(16px)',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
              <div 
                className="flex"
                style={{
                  transform: `translateX(-${testimonialIndex * 100}%)`,
                  transition: testimonialTransitionEnabled ? 'transform 0.7s ease-in-out' : 'none'
                }}
              >
                {/* Testimonials + duplicate first for seamless loop */}
                {[...testimonials, ...(testimonials.length > 1 ? [testimonials[0]] : [])].map((testimonial, idx) => (
                  <div key={`${testimonial.id}-${idx}`} className="w-full flex-shrink-0 p-8">
                    <div className="flex items-center space-x-2 mb-4">
                      {[...Array(testimonial.star_rating || 5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                      ))}
                      {[...Array(5 - (testimonial.star_rating || 5))].map((_, i) => (
                        <Star key={`empty-${i}`} className="h-5 w-5 text-gray-500" />
                      ))}
                    </div>
                    
                    <blockquote className="text-lg text-gray-100 mb-6 italic min-h-[120px]">
                      "{testimonial.message}"
                    </blockquote>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="font-semibold text-white">{testimonial.author_name}</div>
                        <div className="text-gray-200">{testimonial.author_title}, {testimonial.company}</div>
                      </div>
                      {testimonial.metric_value && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">{testimonial.metric_value}</div>
                          <div className="text-sm text-gray-200">{testimonial.metric_label}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="rounded-lg p-4"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.15)'
                      }}>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xl font-bold text-white">250+</div>
                          <div className="text-xs text-gray-300">Clients served</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-white">₦50M+</div>
                          <div className="text-xs text-gray-300">Taxes calculated</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-white">100%</div>
                          <div className="text-xs text-gray-300">NTA compliant</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Carousel Indicators */}
              {testimonials.length > 1 && (
                <div className="flex justify-center space-x-2 pb-4">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setTestimonialIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        (index === testimonialIndex) || (testimonialIndex === testimonials.length && index === 0)
                          ? 'bg-yellow-500 w-6' 
                          : 'bg-white/40 hover:bg-white/60'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Ad Banner After Trust Section */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TopBanner placement="after-trust" />
        </div>
      </div>

      {/* Pricing Windows */}
      <section id="pricing-section" className="relative py-8 md:py-24"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.pexels.com/photos/6928997/pexels-photo-6928997.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-16">
            <h3 className="text-xl md:text-3xl font-bold text-white mb-2 md:mb-4">Choose Your Plan</h3>
            <p className="text-sm md:text-xl text-gray-200">Start free, upgrade when you need more features</p>
            
            {/* Monthly/Annual Toggle */}
            <div className="flex items-center justify-center mt-8">
              <span className={`text-lg ${!isAnnual ? 'text-white font-semibold' : 'text-gray-300'}`}>Monthly</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="mx-4 relative inline-flex h-6 w-11 items-center rounded-full bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isAnnual ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className={`text-lg ${isAnnual ? 'text-white font-semibold' : 'text-gray-300'}`}>
                Annual
                <span className="ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded-full">Save 17%</span>
              </span>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
            {/* Free Plan */}
            <div className="relative rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{
                backdropFilter: 'blur(16px)',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
              <div className="text-center mb-5">
                <h4 className="text-lg font-bold text-white mb-2">Free</h4>
                <p className="text-2xl font-bold text-white">₦0<span className="text-sm font-normal text-gray-200">/month</span></p>
                <p className="text-gray-200 mt-1 text-xs">Ad-supported</p>
              </div>
              
              <ul className="space-y-2 mb-5 text-xs">
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">15 calcs/day (logged in)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">5 calcs/day (guest)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Bulk PAYE (10 staff, 3x/mo)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">5 saved calculations</span>
                </li>
                <li className="flex items-center">
                  <X className="h-3 w-3 text-red-400 mr-2 flex-shrink-0" />
                  <span className="text-gray-300">No PDF export</span>
                </li>
                <li className="flex items-center">
                  <X className="h-3 w-3 text-red-400 mr-2 flex-shrink-0" />
                  <span className="text-gray-300">No history</span>
                </li>
              </ul>
              
              <Button 
                onClick={() => onNavigateToTab('calculator')}
                variant="outline"
                className="w-full py-2 border-white/30 text-white hover:bg-white/20 text-sm"
              >
                Start Free
              </Button>
            </div>

            {/* Starter Plan - NEW */}
            <div className="relative rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{
                backdropFilter: 'blur(16px)',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '2px solid #10B981'
              }}>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-emerald-500">
                  Best Value
                </div>
              </div>
              
              <div className="text-center mb-5">
                <h4 className="text-lg font-bold text-white mb-2">Starter</h4>
                <p className="text-2xl font-bold text-white">
                  ₦{isAnnual ? '4,166' : '4,999'}
                  <span className="text-sm font-normal text-gray-200">/month</span>
                </p>
                {isAnnual && (
                  <p className="text-green-400 text-xs">₦49,990/year</p>
                )}
                <p className="text-gray-200 mt-1 text-xs">Ad-free basics</p>
              </div>
              
              <ul className="space-y-2 mb-5 text-xs">
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Unlimited calculations</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Bulk PAYE (10 staff, ∞/mo)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Net Payments (1 employee)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">20 saved calculations</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Basic PDF export</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">30-day history</span>
                </li>
              </ul>
              
              <Button 
                onClick={handleSubscribeClick}
                className="w-full py-2 text-white font-semibold rounded-lg hover:scale-105 transition-transform bg-emerald-500 hover:bg-emerald-600 text-sm"
                data-testid="starter-subscribe-btn"
              >
                Subscribe
              </Button>
              <button
                onClick={handleStartTrialClick}
                className="w-full mt-2 text-xs text-gray-300 hover:text-white transition-colors"
                data-testid="starter-start-trial-btn"
              >
                Start 7-Day Free Trial
              </button>
            </div>

            {/* Pro Plan - Best for SMEs */}
            <div className="relative rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
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
              
              <div className="text-center mb-5">
                <h4 className="text-lg font-bold text-white mb-2">Pro</h4>
                <p className="text-gray-400 line-through text-xs">₦9,999/month</p>
                <p className="text-2xl font-bold text-white">
                  ₦{isAnnual ? '6,666' : '7,999'}
                  <span className="text-sm font-normal text-gray-200">/month</span>
                </p>
                {isAnnual && (
                  <p className="text-green-400 text-xs">₦79,990/year</p>
                )}
                <p className="text-gray-200 mt-1 text-xs">For growing teams</p>
              </div>
              
              <ul className="space-y-2 mb-5 text-xs">
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Everything in Starter +</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Bulk PAYE (25 staff)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Net Payments (25 employees)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">100 saved calculations</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">90-day history</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Basic analytics</span>
                </li>
              </ul>
              
              <Button 
                onClick={handleSubscribeClick}
                className="w-full py-2 text-white font-semibold rounded-lg hover:scale-105 transition-transform bg-blue-600 hover:bg-blue-700 text-sm"
                data-testid="pro-subscribe-btn"
              >
                Subscribe
              </Button>
              <button
                onClick={handleStartTrialClick}
                className="w-full mt-2 text-xs text-gray-300 hover:text-white transition-colors"
                data-testid="pro-start-trial-btn"
              >
                Start 7-Day Free Trial
              </button>
            </div>

            {/* Premium Plan - Most Popular */}
            <div className="relative rounded-2xl p-5 transform lg:scale-105 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
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
              
              <div className="text-center mb-5">
                <h4 className="text-lg font-bold text-white mb-2">Premium</h4>
                <p className="text-gray-400 line-through text-xs">₦19,999/month</p>
                <p className="text-2xl font-bold text-white">
                  ₦{isAnnual ? '12,499' : '14,999'}
                  <span className="text-sm font-normal text-gray-200">/month</span>
                </p>
                {isAnnual && (
                  <p className="text-green-400 text-xs">₦149,990/year</p>
                )}
                <p className="text-gray-200 mt-1 text-xs">Full power for teams</p>
              </div>
              
              <ul className="space-y-2 mb-5 text-xs">
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Everything in Pro +</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Unlimited staff & calcs</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Unlimited saved calcs</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Excel import & export</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Branded PDF templates</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Advanced analytics</span>
                </li>
              </ul>
              
              <Button 
                onClick={handleSubscribeClick}
                className="w-full py-2 text-white font-semibold rounded-lg hover:scale-105 transition-transform text-sm"
                style={{ backgroundColor: '#D4AF37' }}
                data-testid="premium-subscribe-btn"
              >
                Subscribe
              </Button>
              <button
                onClick={handleStartTrialClick}
                className="w-full mt-2 text-xs text-gray-300 hover:text-white transition-colors"
                data-testid="premium-start-trial-btn"
              >
                Start 7-Day Free Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="relative rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{
                backdropFilter: 'blur(16px)',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
              <div className="text-center mb-5">
                <h4 className="text-lg font-bold text-white mb-2">Enterprise</h4>
                <p className="text-2xl font-bold text-white">₦40,000+</p>
                <p className="text-gray-200 mt-1 text-xs">Custom pricing</p>
              </div>
              
              <ul className="space-y-2 mb-5 text-xs">
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Everything in Premium</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Custom PDF templates</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">API access</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">White-label option</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Dedicated manager</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                  <span className="text-white">Priority support</span>
                </li>
              </ul>
              
              <Button 
                variant="outline"
                className="w-full py-2 border-white/30 text-white hover:bg-white/20 text-sm"
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

      {/* Ad Banner After Pricing */}
      <div className="bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TopBanner placement="after-pricing" />
        </div>
      </div>

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

      {/* Ad Banner Before Footer */}
      <div className="bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TopBanner placement="before-footer" />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <img 
                  src="/fiquant-logo-bold-diamond.png" 
                  alt="Fiquant Consult Logo" 
                  className="h-8 w-8 mr-3"
                />
                <span className="text-xl font-bold">Fiquant TaxPro<sup className="text-xs">™</sup> 2026</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                NTA 2025-compliant tax calculators and compliance tools for Nigerian businesses and individuals. Built by tax experts, trusted by taxpayers.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Mail className="h-4 w-4" />
                <a href="mailto:info@fiquanttaxpro.com" className="hover:text-white transition-colors">
                  info@fiquanttaxpro.com
                </a>
              </div>
            </div>
            
            {/* Product Links */}
            <div>
              <h5 className="font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <button 
                    onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigateToTab && onNavigateToTab('calculator')}
                    className="hover:text-white transition-colors"
                  >
                    Calculators
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowApiPopup(true)}
                    className="hover:text-white transition-colors"
                  >
                    API Documentation
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowContactModal(true)}
                    className="hover:text-white transition-colors"
                  >
                    Enterprise
                  </button>
                </li>
              </ul>
            </div>
            
            {/* Support Links */}
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <button 
                    onClick={() => onNavigateToTab && onNavigateToTab('brackets')}
                    className="hover:text-white transition-colors"
                  >
                    Tax Library
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowContactModal(true)}
                    className="hover:text-white transition-colors flex items-center"
                    data-testid="footer-contact-btn"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Contact Us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowPrivacyPolicy(true)}
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowTermsModal(true)}
                    className="hover:text-white transition-colors"
                    data-testid="footer-terms-btn"
                  >
                    Terms of Service
                  </button>
                </li>
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

      {/* Contact Us Modal */}
      <ContactUsModal 
        isOpen={showContactModal} 
        onClose={() => setShowContactModal(false)} 
      />

      {/* API Documentation Popup */}
      {showApiPopup && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowApiPopup(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">API Documentation</h3>
            <p className="text-gray-600 mb-6">
              Our API is available for enterprise customers. Please contact our admin team for access and documentation.
            </p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => setShowApiPopup(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowApiPopup(false);
                  setShowContactModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Contact Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal - NDPR Compliant */}
      {showPrivacyPolicy && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowPrivacyPolicy(false)}
          data-testid="privacy-policy-modal"
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="h-8 w-8" />
                  <div>
                    <h2 className="text-xl font-bold">Privacy Policy</h2>
                    <p className="text-emerald-100 text-sm">Fiquant TaxPro - NDPR Compliant</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPrivacyPolicy(false)}
                  className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                  data-testid="close-privacy-policy"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-3 flex items-center space-x-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">Effective Date: January 1, 2026</span>
                <span className="bg-white/20 px-3 py-1 rounded-full">Last Updated: January 2026</span>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[65vh] text-sm text-gray-700 space-y-6">
              {/* Introduction */}
              <section className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h3 className="font-bold text-emerald-800 mb-2 text-base">Introduction</h3>
                <p className="text-emerald-700">
                  Fiquant Consult Limited ("Fiquant TaxPro," "we," "us," or "our") is committed to protecting your privacy 
                  and personal data in accordance with the <strong>Nigeria Data Protection Regulation (NDPR) 2019</strong> and 
                  the <strong>Nigeria Data Protection Act (NDPA) 2023</strong>. This Privacy Policy explains how we collect, 
                  use, store, and protect your personal information when you use our tax calculation platform.
                </p>
              </section>

              {/* Section 1: Data Controller */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
                  Data Controller Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p><strong>Data Controller:</strong> Fiquant Consult Limited</p>
                  <p><strong>Contact Email:</strong> info@fiquanttaxpro.com</p>
                  <p><strong>Data Protection Officer:</strong> privacy@fiquanttaxpro.com</p>
                  <p><strong>Business Address:</strong> Lagos, Nigeria</p>
                </div>
              </section>

              {/* Section 2: Legal Basis for Processing */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                  Legal Basis for Processing (NDPR Article 2.2)
                </h3>
                <p className="mb-3">We process your personal data based on the following lawful grounds:</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Consent:</strong> Where you have given explicit consent for specific processing activities</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Contract Performance:</strong> Processing necessary to provide our tax calculation services</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Legal Obligation:</strong> Processing required to comply with Nigerian tax laws and regulations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Legitimate Interest:</strong> For fraud prevention, security, and service improvement</span>
                  </li>
                </ul>
              </section>

              {/* Section 3: Categories of Personal Data */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span>
                  Categories of Personal Data Collected
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-semibold text-blue-800 mb-2">Account Information</h4>
                    <ul className="text-blue-700 space-y-1 text-xs">
                      <li>• Full name</li>
                      <li>• Email address</li>
                      <li>• Password (encrypted)</li>
                      <li>• Phone number (optional)</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <h4 className="font-semibold text-purple-800 mb-2">Financial Information</h4>
                    <ul className="text-purple-700 space-y-1 text-xs">
                      <li>• Income details (salary, allowances)</li>
                      <li>• Tax Identification Number (TIN)</li>
                      <li>• Deductions and reliefs</li>
                      <li>• Company financial data (for CIT)</li>
                    </ul>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <h4 className="font-semibold text-orange-800 mb-2">Technical Data</h4>
                    <ul className="text-orange-700 space-y-1 text-xs">
                      <li>• IP address</li>
                      <li>• Browser type and version</li>
                      <li>• Device information</li>
                      <li>• Usage patterns and analytics</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="font-semibold text-green-800 mb-2">Communication Data</h4>
                    <ul className="text-green-700 space-y-1 text-xs">
                      <li>• Contact form submissions</li>
                      <li>• Support inquiries</li>
                      <li>• Feedback and reviews</li>
                      <li>• Email correspondence</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 4: Purpose of Processing */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">4</span>
                  Purpose of Processing
                </h3>
                <p className="mb-3">Your personal data is processed for the following specific purposes:</p>
                <div className="space-y-2">
                  <div className="flex items-start p-2 bg-gray-50 rounded">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium mr-3">Primary</span>
                    <span>To provide accurate tax calculations (PAYE, CIT, VAT, CGT) in compliance with Nigerian tax laws</span>
                  </div>
                  <div className="flex items-start p-2 bg-gray-50 rounded">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium mr-3">Service</span>
                    <span>To create and manage your account, save calculation history, and generate PDF reports</span>
                  </div>
                  <div className="flex items-start p-2 bg-gray-50 rounded">
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium mr-3">Security</span>
                    <span>To ensure platform security, prevent fraud, and detect unauthorized access</span>
                  </div>
                  <div className="flex items-start p-2 bg-gray-50 rounded">
                    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-medium mr-3">Support</span>
                    <span>To respond to inquiries, provide customer support, and communicate service updates</span>
                  </div>
                  <div className="flex items-start p-2 bg-gray-50 rounded">
                    <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded text-xs font-medium mr-3">Improve</span>
                    <span>To analyze usage patterns and improve our services and user experience</span>
                  </div>
                </div>
              </section>

              {/* Section 5: Data Sharing */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">5</span>
                  Data Sharing and Third Parties
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                  <p className="text-red-800 font-semibold flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    We do NOT sell, rent, or trade your personal data to third parties for marketing purposes.
                  </p>
                </div>
                <p className="mb-2">We may share your data with:</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 mt-2"></span>
                    <span><strong>Service Providers:</strong> Cloud hosting (with appropriate data processing agreements), payment processors, email service providers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 mt-2"></span>
                    <span><strong>Legal Authorities:</strong> When required by law, court order, or to protect our legal rights</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 mt-2"></span>
                    <span><strong>Tax Authorities:</strong> When you explicitly authorize us to submit returns on your behalf</span>
                  </li>
                </ul>
              </section>

              {/* Section 6: Data Retention */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">6</span>
                  Data Retention Period
                </h3>
                <p className="mb-3">We retain your personal data in accordance with the following schedule:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-3 py-2 text-left">Data Type</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Retention Period</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Basis</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2">Account Information</td>
                        <td className="border border-gray-300 px-3 py-2">Duration of account + 6 years</td>
                        <td className="border border-gray-300 px-3 py-2">Tax record requirements</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2">Tax Calculations</td>
                        <td className="border border-gray-300 px-3 py-2">6 years from calculation date</td>
                        <td className="border border-gray-300 px-3 py-2">Nigerian tax law compliance</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2">Analytics Data</td>
                        <td className="border border-gray-300 px-3 py-2">2 years</td>
                        <td className="border border-gray-300 px-3 py-2">Service improvement</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2">Contact Messages</td>
                        <td className="border border-gray-300 px-3 py-2">3 years</td>
                        <td className="border border-gray-300 px-3 py-2">Support records</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Section 7: Your Rights (NDPR) */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">7</span>
                  Your Rights Under NDPR
                </h3>
                <p className="mb-3">As a data subject, you have the following rights:</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-800 flex items-center mb-1">
                      <Eye className="h-4 w-4 mr-2 text-blue-600" />
                      Right of Access
                    </h4>
                    <p className="text-xs text-gray-600">Request a copy of your personal data held by us</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-800 flex items-center mb-1">
                      <FileCheck className="h-4 w-4 mr-2 text-green-600" />
                      Right to Rectification
                    </h4>
                    <p className="text-xs text-gray-600">Request correction of inaccurate or incomplete data</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-800 flex items-center mb-1">
                      <X className="h-4 w-4 mr-2 text-red-600" />
                      Right to Erasure
                    </h4>
                    <p className="text-xs text-gray-600">Request deletion of your data (subject to legal obligations)</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-800 flex items-center mb-1">
                      <Lock className="h-4 w-4 mr-2 text-purple-600" />
                      Right to Restrict Processing
                    </h4>
                    <p className="text-xs text-gray-600">Request limitation of processing in certain circumstances</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-800 flex items-center mb-1">
                      <Download className="h-4 w-4 mr-2 text-orange-600" />
                      Right to Data Portability
                    </h4>
                    <p className="text-xs text-gray-600">Receive your data in a structured, machine-readable format</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-800 flex items-center mb-1">
                      <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                      Right to Object
                    </h4>
                    <p className="text-xs text-gray-600">Object to processing based on legitimate interests</p>
                  </div>
                </div>
                <p className="mt-3 text-xs bg-blue-50 p-3 rounded">
                  <strong>To exercise your rights:</strong> Email us at <a href="mailto:privacy@fiquanttaxpro.com" className="text-blue-600 underline">privacy@fiquanttaxpro.com</a>. 
                  We will respond within 30 days as required by NDPR.
                </p>
              </section>

              {/* Section 8: Data Security */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">8</span>
                  Data Security Measures
                </h3>
                <p className="mb-3">We implement comprehensive security measures to protect your data:</p>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="bg-emerald-50 p-3 rounded-lg text-center">
                    <Lock className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                    <p className="font-semibold text-emerald-800">Encryption</p>
                    <p className="text-xs text-emerald-700">TLS 1.3 for data in transit, AES-256 for data at rest</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="font-semibold text-blue-800">Access Control</p>
                    <p className="text-xs text-blue-700">Role-based access, multi-factor authentication</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <RefreshCw className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <p className="font-semibold text-purple-800">Regular Audits</p>
                    <p className="text-xs text-purple-700">Security assessments and vulnerability testing</p>
                  </div>
                </div>
              </section>

              {/* Section 9: Cookies */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">9</span>
                  Cookies and Similar Technologies
                </h3>
                <p className="mb-3">We use cookies for:</p>
                <ul className="space-y-1">
                  <li className="flex items-center">
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs mr-2">Essential</span>
                    <span>Authentication and session management</span>
                  </li>
                  <li className="flex items-center">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs mr-2">Analytics</span>
                    <span>Understanding how users interact with our platform</span>
                  </li>
                  <li className="flex items-center">
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs mr-2">Preference</span>
                    <span>Remembering your settings and preferences</span>
                  </li>
                </ul>
                <p className="mt-2 text-xs text-gray-600">You can manage cookies through your browser settings. Note that disabling essential cookies may affect functionality.</p>
              </section>

              {/* Section 10: International Transfers */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">10</span>
                  International Data Transfers
                </h3>
                <p>
                  Your data may be transferred to and processed in countries outside Nigeria where our service providers operate. 
                  In such cases, we ensure adequate protection through:
                </p>
                <ul className="mt-2 space-y-1">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mr-2 mt-0.5" />
                    <span>Standard Contractual Clauses approved by NITDA</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mr-2 mt-0.5" />
                    <span>Data Processing Agreements with all third-party providers</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mr-2 mt-0.5" />
                    <span>Verification that recipients provide adequate data protection</span>
                  </li>
                </ul>
              </section>

              {/* Section 11: Children's Privacy */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">11</span>
                  Children's Privacy
                </h3>
                <p>
                  Fiquant TaxPro is not intended for use by individuals under 18 years of age. We do not knowingly collect 
                  personal data from children. If we become aware that we have collected data from a child without parental 
                  consent, we will take steps to delete that information.
                </p>
              </section>

              {/* Section 12: Changes to Policy */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">12</span>
                  Changes to This Privacy Policy
                </h3>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by:
                </p>
                <ul className="mt-2 space-y-1">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 mt-2"></span>
                    <span>Posting the updated policy on our platform</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 mt-2"></span>
                    <span>Sending an email notification to registered users</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 mt-2"></span>
                    <span>Displaying a prominent notice on the website</span>
                  </li>
                </ul>
              </section>

              {/* Section 13: Complaints */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">13</span>
                  Complaints and Regulatory Authority
                </h3>
                <p className="mb-3">
                  If you are not satisfied with how we handle your data, you have the right to lodge a complaint with:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-800">National Information Technology Development Agency (NITDA)</p>
                  <p className="text-sm text-gray-600">The supervisory authority for data protection in Nigeria</p>
                  <p className="text-sm text-gray-600 mt-1">Website: <a href="https://nitda.gov.ng" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">nitda.gov.ng</a></p>
                </div>
              </section>

              {/* Section 14: Contact Us */}
              <section className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h3 className="font-bold text-emerald-800 mb-3 text-base flex items-center">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">14</span>
                  Contact Us
                </h3>
                <p className="text-emerald-700 mb-3">For any questions, concerns, or to exercise your data protection rights:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-emerald-800">General Inquiries</p>
                    <p className="text-emerald-700 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      info@fiquanttaxpro.com
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-800">Data Protection Officer</p>
                    <p className="text-emerald-700 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      privacy@fiquanttaxpro.com
                    </p>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 pt-4 border-t">
                <p>This Privacy Policy is compliant with the Nigeria Data Protection Regulation (NDPR) 2019</p>
                <p>and the Nigeria Data Protection Act (NDPA) 2023.</p>
                <p className="mt-2">© 2026 Fiquant Consult Limited. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowTermsModal(false)}
          data-testid="terms-modal"
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Scale className="h-8 w-8" />
                  <div>
                    <h2 className="text-xl font-bold">Terms and Conditions</h2>
                    <p className="text-amber-100 text-sm">Fiquant TaxPro - Nigerian Tax Calculator</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowTermsModal(false)}
                  className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                  data-testid="close-terms-modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-3 flex items-center space-x-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">Effective Date: January 1, 2026</span>
                <span className="bg-white/20 px-3 py-1 rounded-full">Last Updated: January 2026</span>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[65vh] text-sm text-gray-700 space-y-6">
              {/* Important Notice */}
              <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-800">Important Notice</h4>
                  <p className="text-amber-700 mt-1">
                    Users are solely responsible for the validity, accuracy and completeness of the financial information they supply.
                  </p>
                </div>
              </div>

              {/* Section 1: General Terms */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
                  General Terms
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  These Terms and Conditions ("Terms") govern your use of the Fiquant TaxPro website and services (collectively, the "Service") operated by Fiquant Consult Limited ("we," "our," or "us"). These Terms apply to all visitors, users, and others who access or use the Service.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
                </p>
              </section>

              {/* Section 2: Service Description */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                  Service Description and Availability
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Fiquant TaxPro provides online tax calculation tools, resources, and related services for Nigerian tax computations. Our Service includes:
                </p>
                <ul className="list-disc list-inside ml-4 text-gray-600 space-y-1 mb-3">
                  <li>Personal Income Tax (PAYE) calculators</li>
                  <li>Corporate Income Tax (CIT) calculators</li>
                  <li>Value Added Tax (VAT) calculators</li>
                  <li>Capital Gains Tax (CGT) calculators</li>
                  <li>Bulk payroll processing</li>
                  <li>Report generation capabilities</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  We strive to maintain continuous service availability; however, we do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time.
                </p>
              </section>

              {/* Section 3: User Accounts */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span>
                  User Accounts and Registration
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  To access certain features, you may be required to create an account. When you create an account, you must provide accurate, complete, and current information. You are responsible for:
                </p>
                <ul className="list-disc list-inside ml-4 text-gray-600 space-y-1">
                  <li>Safeguarding your password and account security</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                </ul>
              </section>

              {/* Section 4: Acceptable Use */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">4</span>
                  Acceptable Use Policy
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  You agree to use our Service only for lawful purposes. Prohibited activities include:
                </p>
                <ul className="list-disc list-inside ml-4 text-gray-600 space-y-1">
                  <li>Using the Service for any illegal or unauthorized purpose</li>
                  <li>Attempting to gain unauthorized access to any part of the Service</li>
                  <li>Uploading viruses, malware, or other malicious code</li>
                  <li>Attempting to reverse engineer or hack the Service</li>
                  <li>Using automated systems or bots to access the Service</li>
                  <li>Interfering with or disrupting the Service</li>
                </ul>
              </section>

              {/* Section 5: Data Protection */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">5</span>
                  Data Protection and Privacy (NDPR Compliance)
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Your Data Rights Under Nigerian Law
                  </h4>
                  <p className="text-green-700">
                    We are committed to protecting your personal data in compliance with the Nigeria Data Protection Regulation (NDPR) 2019 and the Nigeria Data Protection Act (NDPA) 2023. <strong>You retain full ownership of your personal data at all times.</strong>
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  For complete details on how we collect, use, and protect your data, please refer to our Privacy Policy.
                </p>
              </section>

              {/* Section 6: Calculation Disclaimer */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">6</span>
                  Tax Calculation Disclaimer
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
                  <h4 className="font-semibold text-red-800 mb-2">Important Disclaimer</h4>
                  <p className="text-red-700">
                    Fiquant TaxPro is designed to assist with tax computations but <strong>DOES NOT CONSTITUTE PROFESSIONAL TAX ADVICE</strong>. The calculations are based on publicly available tax regulations and are provided for informational purposes only.
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed mb-3">
                  While we strive to maintain accuracy and compliance with current Nigerian tax laws (NTA 2025), we recommend:
                </p>
                <ul className="list-disc list-inside ml-4 text-gray-600 space-y-1">
                  <li>Consulting with a qualified tax professional for complex matters</li>
                  <li>Verifying calculations with official FIRS guidelines</li>
                  <li>Keeping records of all supporting documents</li>
                </ul>
              </section>

              {/* Section 7: Limitation of Liability */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">7</span>
                  Limitation of Liability
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  To the maximum extent permitted by law, Fiquant Consult Limited shall not be liable for:
                </p>
                <ul className="list-disc list-inside ml-4 text-gray-600 space-y-1">
                  <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                  <li>Loss of profits, data, or goodwill</li>
                  <li>Errors or inaccuracies in calculations due to incorrect user input</li>
                  <li>Service interruptions or technical failures</li>
                  <li>Actions of third parties</li>
                </ul>
              </section>

              {/* Section 8: Intellectual Property */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">8</span>
                  Intellectual Property
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  The Service and its original content, features, and functionality are owned by Fiquant Consult Limited and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our express written permission.
                </p>
              </section>

              {/* Section 9: Subscription and Payments */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">9</span>
                  Subscription and Payments
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Some features of our Service require a paid subscription. By subscribing, you agree to:
                </p>
                <ul className="list-disc list-inside ml-4 text-gray-600 space-y-1">
                  <li>Pay all applicable fees at the prices in effect when charges are incurred</li>
                  <li>Provide accurate and complete billing information</li>
                  <li>Automatic renewal unless cancelled before the renewal date</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Refunds are handled on a case-by-case basis at our sole discretion.
                </p>
              </section>

              {/* Section 10: Governing Law */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">10</span>
                  Governing Law and Dispute Resolution
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of Nigeria.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Before initiating any legal proceedings, parties agree to attempt resolution through good-faith negotiation or mediation.
                </p>
              </section>

              {/* Section 11: Changes to Terms */}
              <section>
                <h3 className="font-bold text-gray-900 mb-3 text-base flex items-center">
                  <span className="bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">11</span>
                  Changes to Terms
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of the Service after changes constitutes acceptance of the modified Terms.
                </p>
              </section>

              {/* Section 12: Contact */}
              <section className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-bold text-amber-800 mb-3 text-base flex items-center">
                  <span className="bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">12</span>
                  Contact Information
                </h3>
                <p className="text-amber-700 mb-3">For questions about these Terms, please contact us:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-amber-800">General Inquiries</p>
                    <p className="text-amber-700 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      info@fiquanttaxpro.com
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-800">Legal Department</p>
                    <p className="text-amber-700 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      legal@fiquanttaxpro.com
                    </p>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 pt-4 border-t">
                <p>© 2026 Fiquant Consult Limited. All rights reserved.</p>
                <p className="mt-1">These Terms and Conditions are compliant with Nigerian law.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;