import React, { useState, useEffect, useRef } from 'react';
import { Calculator, DollarSign, Building2, Receipt, TrendingUp, CreditCard, History, User, Info, Users, Menu, X, LogIn, LogOut, Home, Wallet, FileText, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

/**
 * Mobile-optimized Home Page
 * Tile-based interface with glassmorphism effects and tax sheet backgrounds
 * MOBILE ONLY - Desktop uses separate App.js rendering
 */
export const MobileHome = ({ onNavigate, onOpenAuth }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  
  // Hero Carousel state
  const [carouselSlides, setCarouselSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);
  
  // Testimonials Carousel state
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [testimonialTransitionEnabled, setTestimonialTransitionEnabled] = useState(true);
  
  // Fetch carousel slides
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/carousel/slides`);
        if (response.data && response.data.slides && response.data.slides.length > 0) {
          setCarouselSlides(response.data.slides);
        } else {
          // Default slides if API returns empty
          setCarouselSlides([
            {
              id: 1,
              title: "Did you know calculating & filing the wrong taxes can land you in trouble?",
              subtitle: "Fiquant TaxPro — NTA 2025-compliant tax calculators. Get instant, accurate calculations — free."
            },
            {
              id: 2,
              title: "Instant PAYE, CIT, VAT & CGT calculations",
              subtitle: "Professional-grade tax tools trusted by SMEs across Nigeria."
            }
          ]);
        }
      } catch (error) {
        // Default slides if API fails
        setCarouselSlides([
          {
            id: 1,
            title: "Did you know calculating & filing the wrong taxes can land you in trouble?",
            subtitle: "Fiquant TaxPro — NTA 2025-compliant tax calculators. Get instant, accurate calculations — free."
          },
          {
            id: 2,
            title: "Instant PAYE, CIT, VAT & CGT calculations",
            subtitle: "Professional-grade tax tools trusted by SMEs across Nigeria."
          }
        ]);
      }
    };
    fetchSlides();
  }, []);
  
  // Fetch testimonials
  useEffect(() => {
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
            message: 'Fiquant TaxPro has been instrumental in helping our company achieve significant tax savings while ensuring compliance.',
            star_rating: 5,
            metric_value: '40hrs',
            metric_label: 'saved monthly'
          }]);
        }
      } catch (error) {
        // Use fallback testimonial
        setTestimonials([{
          id: 'default',
          author_name: 'Ibiaro Goma',
          author_title: 'CEO',
          company: 'Lush Ltd',
          message: 'Fiquant TaxPro has been instrumental in helping our company achieve significant tax savings while ensuring compliance.',
          star_rating: 5,
          metric_value: '40hrs',
          metric_label: 'saved monthly'
        }]);
      }
    };
    fetchTestimonials();
  }, []);
  
  // Auto-rotate testimonials carousel
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setTestimonialIndex((prevIndex) => prevIndex + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

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
  
  // Auto-rotate carousel
  useEffect(() => {
    if (carouselSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselSlides.length]);
  
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
      title: 'Vendor Payments',
      description: 'WHT Processing',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'history',
      icon: History,
      title: 'History',
      description: 'Pro Feature',
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

  const handleNavigation = (tab) => {
    onNavigate(tab);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Premium Header - Black with Gold Accents */}
      <div className="bg-black px-4 py-4">
        {/* Top Row: Menu, Logo, Login/Profile */}
        <div className="flex items-center justify-between mb-3">
          {/* Left: Menu Button - Fixed width for balance */}
          <div className="w-14 flex justify-start">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-7 w-7 text-white" />
              ) : (
                <Menu className="h-7 w-7 text-white" />
              )}
            </button>
          </div>

          {/* Center: Logo */}
          <div className="flex items-center">
            <img 
              src="https://customer-assets.emergentagent.com/job_95506f1f-f280-448b-bce0-6221f9e9533d/artifacts/jdh4b8ji_Fiquant%20Logo%20-%20Bold%20Diamond.png"
              alt="Fiquant TaxPro"
              className="h-10 w-10"
            />
            <div className="ml-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                Fiquant
              </h1>
              <p className="text-xs text-yellow-400 font-light">TaxPro 2026</p>
            </div>
          </div>

          {/* Right: Login/Profile Button - Fixed width for balance */}
          <div className="w-14 flex justify-end">
            {isAuthenticated() ? (
              <button
                onClick={() => onNavigate('profile')}
                className="h-9 w-9 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-sm"
              >
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-2 py-1.5 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold text-xs flex items-center gap-1"
              >
                <LogIn className="h-3 w-3" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Tagline */}
        <p className="text-center text-xs text-gray-400">
          Nigerian Tax Calculators - Fast & Accurate
        </p>
        
        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 mt-2 px-2">
          <div className="flex items-center gap-1 text-gray-400">
            <svg className="h-3 w-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px]">NTA-Aligned</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Users className="h-3 w-3 text-blue-400" />
            <span className="text-[10px]">Trusted by SMEs</span>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 z-40"
            style={{ top: '80px' }}
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div 
            className="fixed left-0 right-0 z-50 max-h-[70vh] overflow-y-auto"
            style={{ 
              top: '80px',
              background: 'rgba(0,0,0,0.95)',
              backdropFilter: 'blur(16px)',
              borderBottom: '1px solid rgba(234, 179, 8, 0.2)'
            }}
          >
            <div className="p-4 space-y-2">
              {/* User Info - if logged in */}
              {isAuthenticated() && user && (
                <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold">
                      {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{user.full_name || 'User'}</p>
                      <span className="text-xs text-yellow-400">{user.account_tier?.toUpperCase() || 'FREE'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <MenuNavItem icon={Home} label="Home" onClick={() => setIsMenuOpen(false)} active />
              
              {/* Calculator Items */}
              <div className="pt-2 pb-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mb-2">Calculators</p>
              </div>
              <MenuNavItem icon={Users} label="PAYE Calculator" onClick={() => handleNavigation('paye')} />
              <MenuNavItem icon={Building2} label="CIT Calculator" onClick={() => handleNavigation('cit')} />
              <MenuNavItem icon={Receipt} label="VAT Calculator" onClick={() => handleNavigation('vat')} />
              <MenuNavItem icon={TrendingUp} label="CGT Calculator" onClick={() => handleNavigation('cgt')} />
              
              <div className="my-3 border-t border-gray-700"></div>
              
              <MenuNavItem icon={Wallet} label="Vendor Payments" onClick={() => handleNavigation('payments')} />
              <MenuNavItem icon={FileText} label="History" onClick={() => handleNavigation('history')} />
              <MenuNavItem icon={Info} label="Tax Library" onClick={() => handleNavigation('tax-info')} />

              <div className="my-3 border-t border-gray-700"></div>

              {/* Auth Actions */}
              {isAuthenticated() ? (
                <>
                  <MenuNavItem icon={User} label="Profile" onClick={() => handleNavigation('profile')} />
                  <MenuNavItem icon={LogOut} label="Logout" onClick={() => { logout(); setIsMenuOpen(false); }} variant="danger" />
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
        {/* Hero Carousel */}
        <div className="mb-6 px-1">
          <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)' }}>
            <div className="p-4">
              {carouselSlides.length > 0 && (
                <div className="min-h-[100px]">
                  <h2 className="text-lg font-bold text-white leading-tight mb-2">
                    {carouselSlides[currentSlide]?.title?.includes('trouble') ? (
                      <>
                        Did you know calculating & filing the wrong taxes can land you in 
                        <span className="text-red-400"> trouble</span>?
                      </>
                    ) : (
                      carouselSlides[currentSlide]?.title
                    )}
                  </h2>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {carouselSlides[currentSlide]?.subtitle}
                  </p>
                </div>
              )}
              
              {/* Carousel Indicators */}
              {carouselSlides.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {carouselSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentSlide ? 'w-6 bg-yellow-400' : 'w-1.5 bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

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

        {/* Trust Section - Carousel matching web version */}
        <div className="mb-8 px-1">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center px-3">
            <Users className="h-5 w-5 mr-2 text-yellow-400" />
            Trusted by Professionals
          </h2>
          
          {/* Trust Badges Grid - 2x2 layout */}
          <div 
            className="mb-4 mx-3"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px'
            }}
          >
            <div 
              className="p-2 rounded-lg flex items-center space-x-2"
              style={{
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="h-3.5 w-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-white truncate">NTA-Aligned</p>
                <p className="text-[9px] text-gray-400 truncate">Compliant</p>
              </div>
            </div>
            
            <div 
              className="p-2 rounded-lg flex items-center space-x-2"
              style={{
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="h-3.5 w-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-white truncate">Encrypted</p>
                <p className="text-[9px] text-gray-400 truncate">Bank-grade</p>
              </div>
            </div>
            
            <div 
              className="p-2 rounded-lg flex items-center space-x-2"
              style={{
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="h-3.5 w-3.5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-white truncate">Audit-Ready</p>
                <p className="text-[9px] text-gray-400 truncate">Pro reports</p>
              </div>
            </div>
            
            <div 
              className="p-2 rounded-lg flex items-center space-x-2"
              style={{
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Users className="h-3.5 w-3.5 text-orange-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-white truncate">Trusted</p>
                <p className="text-[9px] text-gray-400 truncate">By SMEs</p>
              </div>
            </div>
          </div>
          
          {/* Testimonials Carousel */}
          {testimonials.length > 0 && (
            <div 
              className="rounded-xl overflow-hidden mb-3"
              style={glassStyle}
            >
              <div 
                className="flex"
                style={{
                  transform: `translateX(-${testimonialIndex * 100}%)`,
                  transition: testimonialTransitionEnabled ? 'transform 0.7s ease-in-out' : 'none'
                }}
              >
                {/* Testimonials + duplicate first for seamless loop */}
                {[...testimonials, ...(testimonials.length > 1 ? [testimonials[0]] : [])].map((testimonial, idx) => (
                  <div key={`${testimonial.id}-${idx}`} className="w-full flex-shrink-0 p-4">
                    {/* Star Rating */}
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(testimonial.star_rating || 5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                      ))}
                      {[...Array(5 - (testimonial.star_rating || 5))].map((_, i) => (
                        <Star key={`empty-${i}`} className="h-3 w-3 text-gray-500" />
                      ))}
                    </div>
                    
                    {/* Quote */}
                    <blockquote className="text-xs text-gray-200 mb-3 italic leading-relaxed min-h-[48px]">
                      &ldquo;{testimonial.message}&rdquo;
                    </blockquote>
                    
                    {/* Author Info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-white">{testimonial.author_name}</p>
                        <p className="text-[10px] text-gray-400">{testimonial.author_title}, {testimonial.company}</p>
                      </div>
                      {testimonial.metric_value && (
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-400">{testimonial.metric_value}</p>
                          <p className="text-[10px] text-gray-400">{testimonial.metric_label}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Carousel Indicators */}
              {testimonials.length > 1 && (
                <div className="flex justify-center space-x-1.5 pb-3">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setTestimonialIndex(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        (index === testimonialIndex) || (testimonialIndex === testimonials.length && index === 0)
                          ? 'w-4 bg-yellow-400' 
                          : 'w-1.5 bg-white/30'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Stats Row - Compact horizontal layout */}
          <div 
            className="rounded-lg px-3 py-2"
            style={glassStyle}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-bold text-white">250+</span>
                <span className="text-[10px] text-gray-400">Clients</span>
              </div>
              <div className="w-px h-4 bg-white/20"></div>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-bold text-white">₦50M+</span>
                <span className="text-[10px] text-gray-400">Calculated</span>
              </div>
              <div className="w-px h-4 bg-white/20"></div>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-bold text-white">100%</span>
                <span className="text-[10px] text-gray-400">Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Plans - Clean design without double background */}
        <div className="mb-8 px-1">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center px-3">
            <CreditCard className="h-5 w-5 mr-2 text-yellow-400" />
            Pricing Plans
          </h2>
          <div className="space-y-3">
            {/* Free Plan */}
            <div 
              className="rounded-xl p-3 border border-white/20"
              style={{
                ...glassStyle,
                background: 'rgba(255, 255, 255, 0.08)'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white">Free</h3>
                <span className="text-xl font-bold text-white">₦0</span>
              </div>
              <p className="text-xs text-gray-400 mb-2">Ad-supported, 15 calcs/day</p>
              <ul className="text-xs text-gray-200 space-y-1 mb-3">
                <li className="flex items-center">
                  <span className="text-green-400 mr-1">✓</span> All calculators (PAYE, CGT, VAT, CIT)
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-1">✓</span> 15 calculations/day
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-1">✓</span> Bulk PAYE (10 staff, 3x/month)
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-1">✓</span> Tax Library (with ads)
                </li>
                <li className="flex items-center">
                  <span className="text-red-400 mr-1">✗</span> No PDF export
                </li>
                <li className="flex items-center">
                  <span className="text-red-400 mr-1">✗</span> No calculation history
                </li>
              </ul>
              <button className="w-full py-2 px-4 bg-white/20 text-white rounded-lg text-sm font-medium border border-white/30">
                Start Free
              </button>
            </div>

            {/* Pro Plan */}
            <div 
              className="rounded-xl p-3 relative overflow-hidden border-2 border-blue-400"
              style={{
                ...glassStyle,
                background: 'rgba(59, 130, 246, 0.15)'
              }}
            >
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg font-medium">
                Best for SMEs
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-blue-300">Pro</h3>
                <div className="text-right">
                  <span className="text-xs text-gray-500 line-through block">₦14,999</span>
                  <span className="text-xl font-bold text-blue-300">₦9,999</span>
                  <span className="text-xs text-gray-400">/month</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-2">Unlimited, ad-free</p>
              <ul className="text-xs text-gray-200 space-y-1 mb-3">
                <li className="flex items-center">
                  <span className="text-green-400 mr-1">✓</span> All calculators, unlimited
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-1">✓</span> Bulk PAYE (50 staff, unlimited)
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-1">✓</span> PDF export & reports
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-1">✓</span> 90-day calculation history
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-1">✓</span> Ad-free experience
                </li>
              </ul>
              <button 
                onClick={() => onNavigate('payments')}
                className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium active:scale-95 transition-transform shadow-lg"
              >
                Subscribe
              </button>
              <button className="w-full mt-2 text-xs text-gray-400 hover:text-white">
                Start 7-Day Free Trial
              </button>
            </div>

            {/* Premium Plan */}
            <div 
              className="rounded-xl p-3 relative overflow-hidden border-2 border-yellow-400"
              style={{
                ...glassStyle,
                background: 'rgba(234, 179, 8, 0.1)'
              }}
            >
              <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs px-2 py-1 rounded-bl-lg font-medium">
                Most Popular
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-yellow-300">Premium</h3>
                <div className="text-right">
                  <span className="text-xs text-gray-500 line-through block">₦29,999</span>
                  <span className="text-xl font-bold text-yellow-300">₦19,999</span>
                  <span className="text-xs text-gray-400">/month</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-2">Full power for teams</p>
              <ul className="text-xs text-gray-200 space-y-1 mb-3">
                <li className="flex items-center">
                  <span className="text-green-400 mr-1">✓</span> Bulk PAYE (unlimited staff)
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-1">✓</span> CSV import for bulk processing
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-1">✓</span> Bulk Payment Processing
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-1">✓</span> Advanced analytics dashboard
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-1">✓</span> Unlimited calculation history
                </li>
              </ul>
              <button 
                onClick={() => onNavigate('payments')}
                className="w-full py-2 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-lg text-sm font-medium active:scale-95 transition-transform shadow-lg"
              >
                Subscribe
              </button>
              <button className="w-full mt-2 text-xs text-gray-400 hover:text-white">
                Start 7-Day Free Trial
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions - Clean design without double background */}
        <div className="mb-6 px-1">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center px-3">
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
      
      {/* Mobile Footer */}
      <footer className="bg-gray-800 px-4 py-6">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="https://customer-assets.emergentagent.com/job_95506f1f-f280-448b-bce0-6221f9e9533d/artifacts/jdh4b8ji_Fiquant%20Logo%20-%20Bold%20Diamond.png"
            alt="Fiquant TaxPro"
            className="h-8 w-8"
          />
          <span className="ml-2 text-lg font-bold text-white">Fiquant TaxPro<sup className="text-[8px]">™</sup></span>
        </div>
        
        <p className="text-center text-xs text-gray-400 mb-4">
          NTA 2025-compliant tax calculators for Nigerian businesses
        </p>
        
        {/* Footer Links Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-center">
          <div>
            <h5 className="text-xs font-semibold text-white mb-2">Product</h5>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => onNavigate('paye')}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Calculators
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('tax-info')}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Tax Library
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-semibold text-white mb-2">Support</h5>
            <ul className="space-y-1">
              <li>
                <span className="text-xs text-gray-400">info@fiquanttaxpro.com</span>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('profile')}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  My Account
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-700 pt-4">
          <p className="text-center text-[10px] text-gray-500">
            © 2026 Fiquant Consult. All rights reserved.
          </p>
          <p className="text-center text-[10px] text-gray-600 mt-1">
            Not legal advice. Consult qualified tax counsel for complex matters.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Menu Navigation Item Component
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
